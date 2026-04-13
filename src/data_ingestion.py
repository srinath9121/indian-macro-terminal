import requests
import yfinance as yf
import pandas as pd
import numpy as np
import json
import time
import hashlib
from datetime import datetime
from collections import deque
import feedparser
import os

# RSS feeds — FREE, no API key, genuinely live
RSS_FEEDS = {
    "ET_Markets":    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "ET_Economy":    "https://economictimes.indiatimes.com/news/economy/rssfeeds/20309086.cms",
    "PIB_India":     "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    "Hindu_Business":"https://www.thehindu.com/business/markets/?service=rss",
    "Moneycontrol":  "https://www.moneycontrol.com/rss/marketreports.xml",
}

TICKERS = {
    "nifty":     "^NSEI",
    "sensex":    "^BSESN",
    "banknifty": "^NSEBANK",
    "nifty_it":  "^CNXIT",
    "crude_oil": "CL=F",
    "brent_crude": "BZ=F",
    "gold":      "GC=F",
    "usd_inr":   "INR=X",
    "vix":       "^INDIAVIX"
}

class NewsIngestion:
    def __init__(self, data_root="data/raw"):
        self.seen_ids = set()
        self.data_root = data_root
        os.makedirs(data_root, exist_ok=True)

    def fetch_rss(self) -> list:
        articles = []
        for source_name, url in RSS_FEEDS.items():
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:10]:
                    article_id = hashlib.md5(entry.get('title', '').encode()).hexdigest()
                    if article_id in self.seen_ids:
                        continue
                    self.seen_ids.add(article_id)
                    articles.append({
                        "id":        article_id,
                        "title":     entry.get('title', ''),
                        "summary":   entry.get('summary', '')[:300],
                        "source":    source_name,
                        "published": entry.get('published', str(datetime.now())),
                        "link":      entry.get('link', '')
                    })
            except Exception as e:
                print(f"[RSS] {source_name} failed: {e}")
        
        # Save to raw
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(os.path.join(self.data_root, f"news_{timestamp}.json"), "w") as f:
            json.dump(articles, f, indent=2)
            
        return articles

class MarketIngestion:
    def __init__(self, data_root="data/raw"):
        self.data_root = data_root
        os.makedirs(data_root, exist_ok=True)

    def fetch(self) -> dict:
        result = {}
        for name, ticker_sym in TICKERS.items():
            try:
                ticker = yf.Ticker(ticker_sym)
                hist   = ticker.history(period="2d", interval="1d")

                if hist.empty or len(hist) < 2:
                    result[name] = self._fallback(name)
                    continue

                current  = float(hist['Close'].iloc[-1])
                previous = float(hist['Close'].iloc[-2])
                change   = ((current - previous) / previous) * 100

                if name == "brent_crude" and abs(change) > 15.0:
                    import logging
                    logging.warning(f"Extreme Brent Crude volatility detected: {change}% in a single day.")

                if name == "usd_inr":
                    # If USD/INR price goes UP (e.g., 80 -> 82), Rupee is WEAKENING (bad, red)
                    # We invert the sign so that Rupee change is negative when USD strengthens.
                    display_change = -change
                    # "up" direction for UI should mean strengthening (green)
                    # "down" direction for UI should mean weakening (red)
                    display_direction = "up" if display_change > 0 else "down"
                else:
                    display_change = change
                    display_direction = "up" if change > 0 else "down"

                result[name] = {
                    "price":      round(current, 2),
                    "change_pct": round(display_change, 4),
                    "direction":  display_direction,
                    "timestamp":  str(datetime.now())
                }
            except Exception as e:
                print(f"[Market] {name} ({ticker_sym}) failed: {e}")
                result[name] = self._fallback(name)

        # Save to raw
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(os.path.join(self.data_root, f"market_{timestamp}.json"), "w") as f:
            json.dump(result, f, indent=2)
            
        return result

    def _fallback(self, name: str) -> dict:
        return {
            "price":      None,
            "change_pct": 0.0,
            "direction":  "neutral",
            "timestamp":  str(datetime.now()),
            "note":       "data_unavailable"
        }

    def fetch_top_movers(self) -> dict:
        # Predefined subset to avoid NSE scraping block
        movers_tickers = {
            "RELIANCE.NS": "Reliance Ind", "HDFCBANK.NS": "HDFC Bank", "INFY.NS": "Infosys",
            "ASIANPAINT.NS": "Asian Paints", "ONGC.NS": "ONGC", "SUNPHARMA.NS": "Sun Pharma",
            "ULTRACEMCO.NS": "UltraTech Cem", "M&M.NS": "M&M", "INDIGO.BO": "IndiGo",
            "SBIN.NS": "SBI"
        }
        results = []
        for sym, name in movers_tickers.items():
            try:
                hist = yf.Ticker(sym).history(period="2d")
                if not hist.empty and len(hist) >= 2:
                    current = float(hist['Close'].iloc[-1])
                    prev = float(hist['Close'].iloc[-2])
                    change = ((current - prev) / prev) * 100
                    results.append({"name": name, "change": change})
            except:
                continue
        results.sort(key=lambda x: x["change"], reverse=True)
        return {"gainers": results[:2], "losers": results[-2:]}

class MacroIngestion:
    def __init__(self, data_root="data/raw"):
        self.data_root = data_root
        os.makedirs(data_root, exist_ok=True)

    def fetch_currency(self) -> dict:
        try:
            resp = requests.get("https://api.exchangerate-api.com/v4/latest/USD", timeout=8)
            data = resp.json()
            inr  = data["rates"].get("INR", 83.5)
            return {
                "usd_inr": round(inr, 2),
                "source": "exchangerate-api",
                "timestamp": str(datetime.now())
            }
        except Exception as e:
            print(f"[Macro] Currency fetch failed: {e}")
            return {"usd_inr": 83.5, "source": "fallback"}

    def fetch_fii_proxy(self, market_data: dict) -> dict:
        nifty_change = market_data.get("nifty", {}).get("change_pct", 0)
        vix_change   = market_data.get("vix",   {}).get("change_pct", 0)

        if nifty_change < -0.5 and vix_change > 2:
            fii_signal, pressure = "selling", "HIGH"
        elif nifty_change < -0.2:
            fii_signal, pressure = "mild_selling", "MEDIUM"
        elif nifty_change > 0.3:
            fii_signal, pressure = "buying", "LOW"
        else:
            fii_signal, pressure = "neutral", "LOW"

        return {
            "fii_proxy_signal": fii_signal,
            "market_pressure":  pressure,
            "note": "proxy_inferred_from_nifty_vix"
        }

    def fetch_fii_dii(self) -> dict:
        # Returns mocked realistic daily FII/DII net flows (in ₹ Crores)
        return {
            "fii_net":  -12847.0,
            "dii_net":    9240.0,
            "period":    "Mar 2026",
            "timestamp": str(datetime.now())
        }

    def fetch_rbi_tracker(self) -> dict:
        # Static tracking data for RBI policy
        return {
            "repo_rate": 6.25,
            "cpi_latest": 4.8, 
            "cpi_target": 4.0,
            "next_mpc": "Apr 15, 2026"
        }
