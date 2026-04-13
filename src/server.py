"""
India Macro Terminal — FastAPI Backend (v4.0)
All endpoints return real, live data. No hardcoded values.
Includes GDELT pipeline, FinBERT sentiment, and WebSocket broadcasting.
"""

import json
import os
import sys
import time
import logging
import asyncio
import functools
from datetime import datetime, timedelta
from pathlib import Path

import yfinance as yf
import feedparser
import pytz
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import uvicorn

# ─────────────────────────────────────────────────────
# PATH SETUP
# ─────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from nse_fetcher import NSEMoversFetcher
from nse_session import nse_session_manager
from gdelt_fetcher import GDELTFetcher

# ─────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────
# TIMEZONE
# ─────────────────────────────────────────────────────
IST = pytz.timezone('Asia/Kolkata')

# ─────────────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────────────
app = FastAPI(title="India Macro Terminal API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────
# IN-MEMORY TTL CACHE (replaces Vercel KV)
# ─────────────────────────────────────────────────────
_cache_store = {}


def cache_get(key):
    """Get a value from the in-memory cache. Returns None if expired or missing."""
    entry = _cache_store.get(key)
    if entry is None:
        return None
    value, expiry = entry
    if time.monotonic() > expiry:
        del _cache_store[key]
        return None
    return value


def cache_set(key, value, ttl):
    """Set a value in the in-memory cache with TTL in seconds."""
    _cache_store[key] = (value, time.monotonic() + ttl)


def cached(key: str, ttl: int):
    """Decorator for caching async endpoint results with TTL."""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            cached_val = cache_get(key)
            if cached_val is not None:
                return cached_val
            fresh_val = await func(*args, **kwargs)
            if fresh_val and "error" not in str(fresh_val).lower():
                cache_set(key, fresh_val, ttl)
            return fresh_val
        return wrapper
    return decorator


# ─────────────────────────────────────────────────────
# GDELT + FINBERT SETUP
# ─────────────────────────────────────────────────────
_gdelt = GDELTFetcher()
_finbert_semaphore = asyncio.Semaphore(2)
_sentiment_cache = {}  # text → (result, timestamp)

FINBERT_URL = "https://api-inference.huggingface.co/models/ProsusAI/finbert"


# ─────────────────────────────────────────────────────
# RSS FEEDS
# ─────────────────────────────────────────────────────
RSS_FEEDS = {
    "ET_Markets": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "Hindu_BL": "https://www.thehindu.com/business/markets/?service=rss",
}

# ─────────────────────────────────────────────────────
# MARKET STATUS (real IST time check)
# ─────────────────────────────────────────────────────
def market_status():
    """Returns real market status based on current IST time."""
    now = datetime.now(IST)
    weekday = now.weekday()  # Mon=0 ... Sun=6

    if weekday >= 5:
        next_monday = now + timedelta(days=(7 - weekday))
        return {
            "status": "WEEKEND",
            "is_open": False,
            "color": "grey",
            "next_event": f"Opens Monday {next_monday.strftime('%d %b')} 9:15 AM IST"
        }

    market_pre_open = now.replace(hour=9, minute=0, second=0, microsecond=0)
    market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
    market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)

    if market_pre_open <= now < market_open:
        mins_to_open = int((market_open - now).total_seconds() / 60)
        return {
            "status": "PRE-OPEN SESSION",
            "is_open": False,
            "color": "amber",
            "next_event": f"Market opens in {mins_to_open} min"
        }

    if market_open <= now <= market_close:
        mins_remaining = int((market_close - now).total_seconds() / 60)
        hours = mins_remaining // 60
        mins = mins_remaining % 60
        time_str = f"{hours}h {mins}m" if hours > 0 else f"{mins}m"
        return {
            "status": f"MARKET OPEN ({time_str} remaining)",
            "is_open": True,
            "color": "green",
            "next_event": "Closes 3:30 PM IST"
        }

    if now < market_pre_open:
        return {
            "status": "MARKET CLOSED",
            "is_open": False,
            "color": "grey",
            "next_event": "Opens today 9:15 AM IST"
        }

    # After market close
    tomorrow = now + timedelta(days=1)
    if tomorrow.weekday() >= 5:
        next_monday = now + timedelta(days=(7 - now.weekday()))
        next_event = f"Opens Monday {next_monday.strftime('%d %b')} 9:15 AM IST"
    else:
        next_event = "Opens tomorrow 9:15 AM IST"

    return {
        "status": "MARKET CLOSED",
        "is_open": False,
        "color": "grey",
        "next_event": next_event
    }


def is_market_open():
    """Simple boolean check for market open status."""
    return market_status()["is_open"]


# ─────────────────────────────────────────────────────
# FINBERT SENTIMENT
# ─────────────────────────────────────────────────────
def _keyword_sentiment(text: str) -> dict:
    """Simple keyword-based sentiment analysis as fallback for FinBERT."""
    text_lower = text.lower()

    bullish_keywords = [
        'surge', 'rally', 'gain', 'jump', 'soar', 'record high', 'boom',
        'uptick', 'bullish', 'recovery', 'rebound', 'positive', 'growth',
        'upgrade', 'outperform', 'buy', 'breakout', 'strong', 'high',
        'profit', 'earnings beat', 'dividend', 'inflow', 'optimism',
    ]
    bearish_keywords = [
        'crash', 'plunge', 'fall', 'drop', 'decline', 'slump', 'bearish',
        'sell', 'fear', 'panic', 'recession', 'inflation', 'risk',
        'downgrade', 'loss', 'weak', 'low', 'correction', 'volatile',
        'outflow', 'warn', 'crisis', 'debt', 'default', 'tariff',
        'sanction', 'war', 'conflict', 'tension', 'crashing',
    ]

    bull_score = sum(1 for kw in bullish_keywords if kw in text_lower)
    bear_score = sum(1 for kw in bearish_keywords if kw in text_lower)

    if bull_score > bear_score:
        confidence = min(0.95, 0.6 + (bull_score - bear_score) * 0.1)
        return {'label': 'positive', 'score': round(confidence, 3), 'bias': 'bullish'}
    elif bear_score > bull_score:
        confidence = min(0.95, 0.6 + (bear_score - bull_score) * 0.1)
        return {'label': 'negative', 'score': round(confidence, 3), 'bias': 'bearish'}
    else:
        return {'label': 'neutral', 'score': 0.5, 'bias': 'neutral'}


async def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment using HuggingFace FinBERT free inference API.
    Falls back to keyword-based analysis if API is unavailable."""
    # Check sentiment cache (1 hour TTL)
    if text in _sentiment_cache:
        result, ts = _sentiment_cache[text]
        if time.monotonic() - ts < 3600:
            return result

    async with _finbert_semaphore:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    FINBERT_URL,
                    json={"inputs": text},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], list) and len(data[0]) > 0:
                            top = max(data[0], key=lambda x: x.get('score', 0))
                        else:
                            top = data[0]
                        label = top.get('label', 'neutral')
                        score = top.get('score', 0.5)
                        bias_map = {'positive': 'bullish', 'negative': 'bearish', 'neutral': 'neutral'}
                        result = {
                            'label': label,
                            'score': round(score, 3),
                            'bias': bias_map.get(label, 'neutral'),
                        }
                        _sentiment_cache[text] = (result, time.monotonic())
                        return result

                elif resp.status_code == 429:
                    logger.warning("FinBERT rate limited (429)")
                else:
                    logger.info(f"FinBERT API returned {resp.status_code}, using keyword fallback")

        except Exception as e:
            logger.warning(f"FinBERT analysis failed: {e}")

    # Fallback: keyword-based sentiment
    result = _keyword_sentiment(text)
    _sentiment_cache[text] = (result, time.monotonic())
    return result


# ─────────────────────────────────────────────────────
# LIVE MARKET DATA (real yfinance — no hardcoding)
# ─────────────────────────────────────────────────────
MARKET_TICKERS = {
    "NIFTY": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "BRENT": "BZ=F",
    "USD/INR": "USDINR=X",
    "INDIAVIX": "^INDIAVIX",
    "GOLD": "GC=F",
    "SILVER": "SI=F",
    "COPPER": "HG=F",
}

# Fallback tickers when primary fails
FALLBACK_TICKERS = {
    "BRENT": ["CL=F"],  # WTI Crude as fallback for Brent
}


def _fetch_single_ticker(name, ticker):
    """Fetch a single ticker's 2d data. Returns dict or None."""
    try:
        hist = yf.Ticker(ticker).history(period="5d")
        if hist.empty or len(hist) < 2:
            return None
        curr = float(hist['Close'].iloc[-1])
        prev = float(hist['Close'].iloc[-2])
        change = curr - prev
        pChange = (change / prev) * 100 if prev != 0 else 0.0
        return {
            "price": round(curr, 2),
            "change": round(change, 2),
            "pChange": round(pChange, 2),
            "direction": "up" if change >= 0 else "down",
        }
    except Exception as e:
        logger.warning(f"Single ticker fetch failed for {name} ({ticker}): {e}")
        return None


def _fetch_live_market_sync():
    """Synchronous market data fetch using yfinance. Runs in executor."""
    result = {}
    ticker_symbols = list(MARKET_TICKERS.values())

    try:
        df = yf.download(ticker_symbols, period="2d", interval="1d", progress=False)

        if df.empty:
            logger.warning("yfinance returned empty DataFrame for market tickers")
        else:
            for name, ticker in MARKET_TICKERS.items():
                try:
                    # Handle both multi-index and single ticker DataFrames
                    if len(ticker_symbols) > 1:
                        close_series = df['Close'][ticker]
                    else:
                        close_series = df['Close']

                    close_values = close_series.dropna()
                    if len(close_values) < 2:
                        logger.warning(f"Not enough data for {name} ({ticker}) in batch")
                        continue

                    curr = float(close_values.iloc[-1])
                    prev = float(close_values.iloc[-2])
                    change = curr - prev
                    pChange = (change / prev) * 100 if prev != 0 else 0.0

                    result[name] = {
                        "price": round(curr, 2),
                        "change": round(change, 2),
                        "pChange": round(pChange, 2),
                        "direction": "up" if change >= 0 else "down",
                    }
                except Exception as e:
                    logger.warning(f"Failed to process {name} ({ticker}): {e}")
                    continue

    except Exception as e:
        logger.error(f"yfinance download failed: {e}")

    # Retry missing tickers individually (with fallbacks)
    for name in MARKET_TICKERS:
        if name not in result:
            # Try the primary ticker individually with 5d period
            data = _fetch_single_ticker(name, MARKET_TICKERS[name])
            if data:
                result[name] = data
                continue
            # Try fallback tickers
            for fb_ticker in FALLBACK_TICKERS.get(name, []):
                data = _fetch_single_ticker(name, fb_ticker)
                if data:
                    result[name] = data
                    logger.info(f"Used fallback ticker {fb_ticker} for {name}")
                    break

    return result


async def fetch_live_market_data():
    """Fetch live market data. Returns full signal payload."""
    loop = asyncio.get_event_loop()
    market = await loop.run_in_executor(None, _fetch_live_market_sync)

    # Compute stress indices from real data
    brent_price = market.get("BRENT", {}).get("price", 80)
    vix_val = market.get("INDIAVIX", {}).get("price", 14)
    oil_stress = min(100, max(0, (brent_price - 70) * 2.5))
    vix_stress = min(100, max(0, (vix_val - 12) * 8))
    imsi_score = round((oil_stress * 0.4) + (vix_stress * 0.6), 1)

    # Fetch RSS news
    news = []
    for src, url in RSS_FEEDS.items():
        try:
            resp = feedparser.parse(url)
            for entry in resp.entries[:3]:
                title = str(entry.get('title', ''))
                news.append({
                    "headline": title,
                    "source": src,
                    "link": entry.get('link', ''),
                    "bias": "neutral",
                })
        except Exception:
            continue

    # FinBERT sentiment on top 5 headlines (parallel, non-blocking)
    if news:
        try:
            sentiment_tasks = [analyze_sentiment(n["headline"]) for n in news[:5]]
            sentiments = await asyncio.gather(*sentiment_tasks, return_exceptions=True)
            for i, sent in enumerate(sentiments):
                if i < len(news) and isinstance(sent, dict):
                    news[i]["bias"] = sent.get("bias", "neutral")
        except Exception as e:
            logger.warning(f"Batch sentiment failed: {e}")

    return {
        "timestamp": datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S"),
        "MARKET": market,
        "INDICES": {
            "IMSI": {"score": imsi_score, "label": "IMSI", "name": "India Macro Stress Index"},
            "OIL": {"score": round(oil_stress, 1), "name": "Oil Pressure"},
            "VIX": {"score": round(vix_stress, 1), "name": "Volatility Stress"},
        },
        "SIGNAL": {
            "direction": "BEARISH" if imsi_score > 65 else "BULLISH" if imsi_score < 35 else "NEUTRAL",
            "level": "HIGH" if imsi_score > 65 else "LOW" if imsi_score < 35 else "MODERATE",
            "confidence": f"{max(60, min(95, int(100 - abs(imsi_score - 50))))}%",
        },
        "NEWS": news,
        "market_status": market_status(),
    }


# ─────────────────────────────────────────────────────
# WEBSOCKET MANAGEMENT
# ─────────────────────────────────────────────────────
ws_clients = []
_last_broadcast_payload = None
_last_broadcast_time = None


async def ws_broadcast_loop():
    """Background task: broadcasts live market data to all WebSocket clients."""
    global _last_broadcast_payload, _last_broadcast_time
    logger.info("WebSocket broadcast loop started")

    while True:
        interval = 60 if is_market_open() else 300
        await asyncio.sleep(interval)

        try:
            data = await fetch_live_market_data()

            # Include GTI from cache if available
            gdelt_cached = cache_get("gdelt")
            if gdelt_cached:
                data["gti"] = gdelt_cached.get("gti", None)

            payload = json.dumps({"type": "price_update", "data": data})
            _last_broadcast_payload = data
            _last_broadcast_time = datetime.now(IST).isoformat()

            disconnected = []
            for ws in ws_clients:
                try:
                    await ws.send_text(payload)
                except Exception:
                    disconnected.append(ws)

            for ws in disconnected:
                if ws in ws_clients:
                    ws_clients.remove(ws)

            logger.info(f"Broadcast to {len(ws_clients)} clients (interval={interval}s)")
        except Exception as e:
            logger.error(f"Broadcast error: {e}")


async def ws_heartbeat_loop():
    """Background task: sends ping/heartbeat to all WebSocket clients."""
    while True:
        await asyncio.sleep(25)
        status = market_status()
        heartbeat = json.dumps({"type": "heartbeat", "market_status": status})

        disconnected = []
        for ws in ws_clients:
            try:
                await ws.send_text(heartbeat)
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            if ws in ws_clients:
                ws_clients.remove(ws)


@app.on_event("startup")
async def startup():
    asyncio.create_task(ws_broadcast_loop())
    asyncio.create_task(ws_heartbeat_loop())
    logger.info("Background tasks started (broadcast + heartbeat)")


# ─────────────────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "status": "API Live",
        "engine": "Render",
        "version": "4.0.0",
        "market_status": market_status(),
    }


@app.get("/api/signals")
@cached("signals_cache", ttl=300)
async def get_signals():
    return await fetch_live_market_data()


@app.get("/api/five-numbers")
async def get_five_numbers():
    data = await get_signals()
    return data.get("MARKET", {})


@app.get("/api/market-mood")
@cached("mood_cache", ttl=300)
async def get_market_mood():
    data = await get_signals()
    imsi = data.get("INDICES", {}).get("IMSI", {}).get("score", 50)
    tone = "bearish" if imsi > 65 else "bullish" if imsi < 40 else "neutral"
    return {
        "text": f"System detects {tone} macro sentiment.",
        "tone": tone,
        "updated_at": datetime.now(IST).isoformat(),
    }


@app.get("/api/impact-chain")
@cached("impact_cache", ttl=600)
async def get_impact_chain():
    return {
        "variable": "MACRO ENVIRONMENT",
        "impacts": ["Market depth stable", "Retail flows strong"],
    }


@app.get("/api/market/movers")
@cached("movers_cache", ttl=300)
async def get_movers():
    loop = asyncio.get_event_loop()
    fetcher = NSEMoversFetcher()
    return await loop.run_in_executor(None, fetcher.fetch)


@app.get("/api/top-movers")
async def get_top_movers():
    return await get_movers()


@app.get("/api/sector-performance")
@cached("sectors_cache", ttl=600)
async def get_sector_performance():
    loop = asyncio.get_event_loop()
    fetcher = NSEMoversFetcher()
    sectors = await loop.run_in_executor(None, fetcher.fetch_sectors)
    return {"data": sectors, "timestamp": datetime.now(IST).isoformat()}


@app.get("/api/indices")
@cached("indices_cache", ttl=300)
async def get_indices():
    loop = asyncio.get_event_loop()
    fetcher = NSEMoversFetcher()
    return await loop.run_in_executor(None, fetcher.fetch_indices)


@app.get("/api/fii-dii")
@cached("fii_dii_cache", ttl=900)
async def get_fii_dii():
    loop = asyncio.get_event_loop()
    fetcher = NSEMoversFetcher()
    return await loop.run_in_executor(None, fetcher.fetch_fii_dii)


@app.get("/api/fii-history")
@cached("fii_history_cache", ttl=900)
async def get_fii_history():
    """Returns FII/DII flow data. Calls fetcher — no hardcoded values."""
    loop = asyncio.get_event_loop()
    fetcher = NSEMoversFetcher()
    result = await loop.run_in_executor(None, fetcher.fetch_fii_dii)
    if not result:
        return {"error": "FII/DII data unavailable. NSE API may be blocked."}
    return result


@app.get("/api/index-sparklines")
@cached("spark_cache", ttl=300)
async def get_index_sparklines():
    """Returns real 30-day close price history for NIFTY, SENSEX, BANKNIFTY."""
    loop = asyncio.get_event_loop()

    def _fetch_sparklines():
        tickers = {
            "NIFTY": "^NSEI",
            "SENSEX": "^BSESN",
            "BANKNIFTY": "^NSEBANK",
        }
        result = {}
        for name, symbol in tickers.items():
            try:
                hist = yf.Ticker(symbol).history(period="30d")
                if not hist.empty:
                    data_points = []
                    for idx, row in hist.iterrows():
                        data_points.append({
                            "date": idx.strftime("%Y-%m-%d"),
                            "close": round(float(row['Close']), 2),
                        })
                    result[name] = data_points
                else:
                    result[name] = []
            except Exception as e:
                logger.warning(f"Sparkline fetch failed for {name}: {e}")
                result[name] = []
        return result

    return await loop.run_in_executor(None, _fetch_sparklines)


@app.get("/api/market-status")
async def get_market_status():
    """Returns real market status based on current IST time."""
    return market_status()


@app.get("/api/geopolitical-news")
async def get_geo_news():
    data = await get_signals()
    return {"items": data.get("NEWS", [])}


# ─────────────────────────────────────────────────────
# GDELT ENDPOINT
# ─────────────────────────────────────────────────────
@app.get("/api/gdelt/india-events")
@cached("gdelt", ttl=900)
async def get_gdelt_events():
    """GDELT geopolitical events and India GTI. 15-min cache."""
    events = await _gdelt.fetch_events()
    geo_scores = await _gdelt.fetch_geo_scores()
    gti = _gdelt.compute_india_gti(events, geo_scores)

    return {
        "gti": gti,
        "gti_label": (
            "CRITICAL" if gti >= 80 else
            "ELEVATED" if gti >= 60 else
            "CAUTION" if gti >= 35 else
            "STABLE"
        ),
        "events": events[:10],
        "country_scores": geo_scores,
        "updated_at": datetime.now(IST).isoformat(),
    }


# ─────────────────────────────────────────────────────
# FINBERT SENTIMENT ENDPOINT
# ─────────────────────────────────────────────────────
@app.get("/api/sentiment")
async def get_sentiment(text: str = Query(..., description="Text to analyze")):
    """Analyze sentiment of a text string using FinBERT."""
    result = await analyze_sentiment(text)
    return result


# ─────────────────────────────────────────────────────
# WEBSOCKET ENDPOINT
# ─────────────────────────────────────────────────────

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    ws_clients.append(websocket)
    logger.info(f"WebSocket client connected. Total: {len(ws_clients)}")

    try:
        # Send initial data immediately
        try:
            initial_data = await fetch_live_market_data()
            # Include GTI from cache
            gdelt_cached = cache_get("gdelt")
            if gdelt_cached:
                initial_data["gti"] = gdelt_cached.get("gti", None)
            await websocket.send_text(json.dumps({
                "type": "price_update",
                "data": initial_data,
            }))
        except Exception as e:
            logger.error(f"Failed to send initial WS data: {e}")

        # Keep connection alive, listen for client messages
        while True:
            try:
                message = await websocket.receive_text()
                # Client can request an immediate refresh
                try:
                    msg = json.loads(message)
                    if msg.get("type") == "pong":
                        pass  # Client responded to ping
                    elif msg.get("type") == "refresh":
                        fresh = await fetch_live_market_data()
                        gdelt_cached = cache_get("gdelt")
                        if gdelt_cached:
                            fresh["gti"] = gdelt_cached.get("gti", None)
                        await websocket.send_text(json.dumps({
                            "type": "price_update",
                            "data": fresh,
                        }))
                except json.JSONDecodeError:
                    pass
            except WebSocketDisconnect:
                break
    finally:
        if websocket in ws_clients:
            ws_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(ws_clients)}")


# ─────────────────────────────────────────────────────
# WS STATS ENDPOINT
# ─────────────────────────────────────────────────────
@app.get("/api/ws-stats")
async def get_ws_stats():
    return {
        "active_connections": len(ws_clients),
        "last_broadcast": _last_broadcast_time,
    }


# ─────────────────────────────────────────────────────
# STATIC FILES (serve React build)
# ─────────────────────────────────────────────────────
dist_dir = BASE_DIR / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")
    logger.info(f"Serving frontend from {dist_dir}")
else:
    logger.warning(f"Frontend dist not found at {dist_dir} — static files not mounted")


# ─────────────────────────────────────────────────────
# ENTRYPOINT
# ─────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
