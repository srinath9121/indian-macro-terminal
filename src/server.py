"""
India Macro Terminal — FastAPI Backend (v7.0 - ULTIMATE)
Single-file architecture for 100% deployment reliability.
"""

import json
import os
import sys
import time
import logging
import asyncio
import functools
from datetime import datetime
from pathlib import Path

import yfinance as yf
import pytz
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager

# ─────────────────────────────────────────────────────
# PATH & LOGGING
# ─────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
IST = pytz.timezone('Asia/Kolkata')

# ─────────────────────────────────────────────────────
# CONFIGS
# ─────────────────────────────────────────────────────
COMMODITIES_CONFIG = [
  {"id":"gold",      "ticker":"GC=F",  "name":"GOLD",      "unit":"₹/10g", "formula": lambda usd, fx: (usd/31.1035)*10*fx*1.06*1.03},
  {"id":"silver",    "ticker":"SI=F",  "name":"SILVER",    "unit":"₹/kg",  "formula": lambda usd, fx: (usd/31.1035)*1000*fx*1.06*1.03},
  {"id":"brent",     "ticker":"BZ=F",  "name":"BRENT",     "unit":"₹/barrel","formula": lambda usd, fx: usd*fx},
  {"id":"copper",    "ticker":"HG=F",  "name":"COPPER",    "unit":"₹/kg",   "formula": lambda usd, fx: (usd/0.4536)*fx*1.05*1.18},
]
MARKET_TICKERS = {"NIFTY": "^NSEI", "SENSEX": "^BSESN", "USD/INR": "USDINR=X", "INDIAVIX": "^INDIAVIX"}

# ─────────────────────────────────────────────────────
# STATE
# ─────────────────────────────────────────────────────
GLOBAL_STATE = {
    "market": {},
    "commodities": [],
    "signals": {"status": "Initializing..."},
    "last_sync": None
}
ws_clients = set()

def market_status():
    now = datetime.now(IST)
    if now.weekday() >= 5: return {"status": "WEEKEND", "is_open": False, "color": "grey"}
    m_open = now.replace(hour=9, minute=15, second=0)
    m_close = now.replace(hour=15, minute=30, second=0)
    if m_open <= now <= m_close:
        return {"status": "OPEN", "is_open": True, "color": "green"}
    return {"status": "CLOSED", "is_open": False, "color": "grey"}

# ─────────────────────────────────────────────────────
# SYNC SERVICE (HARDENED)
# ─────────────────────────────────────────────────────
async def unified_sync_service():
    """Background fetcher - runs independently of API requests."""
    await asyncio.sleep(5) # Delay first run to let app boot
    while True:
        try:
            logger.info("Syncing Macro Data...")
            all_syms = list(MARKET_TICKERS.values()) + [c['ticker'] for c in COMMODITIES_CONFIG]
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, lambda: yf.download(all_syms, period="2d", group_by='ticker', progress=False))

            # FX
            fx = 83.5
            if 'USDINR=X' in df.columns.levels[0]:
                val = df['USDINR=X']['Close'].dropna()
                if not val.empty: fx = float(val.iloc[-1])

            # Market
            m_res = {}
            for name, sym in MARKET_TICKERS.items():
                if sym not in df.columns.levels[0]: continue
                close = df[sym]['Close'].dropna()
                if len(close) < 2: continue
                curr, prev = float(close.iloc[-1]), float(close.iloc[-2])
                m_res[name] = {"price": round(curr, 2), "pChange": round(((curr-prev)/prev)*100, 2), "is_up": curr >= prev}

            # Commodities
            c_res = []
            for c in COMMODITIES_CONFIG:
                sym = c['ticker']
                close = df[sym]['Close'].dropna()
                if len(close) < 2: continue
                curr, prev = float(close.iloc[-1]), float(close.iloc[-2])
                inr_curr = round(c['formula'](curr, fx), 2)
                c_res.append({'id': c['id'], 'name': c['name'], 'inr_price': inr_curr, 'pct_change': round(((curr-prev)/prev)*100, 2)})
            
            GLOBAL_STATE["market"] = m_res
            GLOBAL_STATE["commodities"] = c_res
            GLOBAL_STATE["signals"] = {
                "timestamp": datetime.now(IST).isoformat(),
                "MARKET": m_res,
                "status": market_status(),
                "irs": 52.0,
                "SIGNAL": {"direction": "NEUTRAL", "level": "MODERATE"}
            }
            GLOBAL_STATE["last_sync"] = datetime.now(IST).isoformat()

            # Broadcast
            msg = json.dumps({"type": "price_update", "data": GLOBAL_STATE["signals"]})
            for ws in list(ws_clients):
                try: await ws.send_text(msg)
                except: ws_clients.discard(ws)
            
            logger.info("Sync Complete.")
        except Exception as e:
            logger.error(f"Sync failed: {e}")
        
        await asyncio.sleep(600) # 10 mins

# ─────────────────────────────────────────────────────
# APP & ROUTES
# ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(unified_sync_service())
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/market-status")
async def api_status(): return market_status()

@app.get("/api/signals")
async def api_signals(): return GLOBAL_STATE["signals"]

@app.get("/api/commodities")
async def api_commodities(): return {"commodities": GLOBAL_STATE["commodities"]}

# Frontend
DIST_DIR = BASE_DIR / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"): return {"error": "404"}
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    async def root(): return {"status": "API Only", "msg": f"Frontend not found at {DIST_DIR}"}

# WS
@app.websocket("/ws/live")
async def ws_route(websocket: WebSocket):
    await websocket.accept()
    ws_clients.add(websocket)
    if GLOBAL_STATE["last_sync"]:
        await websocket.send_text(json.dumps({"type": "price_update", "data": GLOBAL_STATE["signals"]}))
    try:
        while True: await websocket.receive_text()
    except: ws_clients.discard(websocket)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("src.server:app", host="0.0.0.0", port=port)
