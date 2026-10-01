"""
India Macro Terminal — FastAPI Backend v2.1
Port: 8001

REST endpoints:
  GET /api/macro     → macro indicators + IRS
  GET /api/market    → indices + FII/DII
  GET /api/adani     → Adani group stocks
  GET /api/signals   → computed signal state
  GET /api/alerts    → rule-based live alerts
  GET /health        → service health check

WebSocket:
  WS  /ws/feed      → live snapshot stream (push every 5s)
"""

import asyncio
import logging
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import macro, market, adani, signals, alerts
from backend.routes.ws import router as ws_router, _broadcast_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="India Macro Terminal API",
    description="Production-grade backend — REST + WebSocket feed",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── REST routes ────────────────────────────────────────────────────────────────
app.include_router(macro.router,   prefix="/api")
app.include_router(market.router,  prefix="/api")
app.include_router(adani.router,   prefix="/api")
app.include_router(signals.router, prefix="/api")
app.include_router(alerts.router,  prefix="/api")

# ── WebSocket route ────────────────────────────────────────────────────────────
app.include_router(ws_router)


@app.on_event("startup")
async def startup_event():
    """Launch the background broadcast loop when the server starts."""
    asyncio.create_task(_broadcast_loop(interval_s=5))
    logger.info("WebSocket broadcast loop started (interval=5s)")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "india-macro-terminal-api",
        "version": "2.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": [
            "/api/macro", "/api/market", "/api/adani",
            "/api/signals", "/api/alerts", "/ws/feed",
        ],
    }


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)
