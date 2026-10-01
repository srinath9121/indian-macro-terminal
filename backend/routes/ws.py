"""
ws.py — WebSocket feed endpoint
Broadcasts a full market+signal snapshot to all connected clients every N seconds.
Clients subscribe once; the server pushes updates — no more polling.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..services.aggregator import aggregate_market, aggregate_signals, aggregate_alerts

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Simple broadcast manager — keeps all live WS connections."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"WS client connected  | total={len(self.active)}")

    def disconnect(self, ws: WebSocket):
        self.active = [c for c in self.active if c is not ws]
        logger.info(f"WS client disconnected | total={len(self.active)}")

    async def broadcast(self, payload: dict):
        dead = []
        msg  = json.dumps(payload)
        for ws in self.active:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()

# ── Background broadcast task ──────────────────────────────────────────────────

async def _broadcast_loop(interval_s: int = 5):
    """Runs forever: collects data and pushes to all connected clients."""
    while True:
        try:
            if manager.active:
                market  = aggregate_market()
                signals = aggregate_signals()
                alerts  = aggregate_alerts()
                payload = {
                    "type":      "snapshot",
                    "market":    market,
                    "signals":   signals,
                    "alerts":    alerts,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                await manager.broadcast(payload)
                logger.debug(f"WS broadcast sent to {len(manager.active)} clients")
        except Exception as e:
            logger.error(f"WS broadcast error: {e}")
        await asyncio.sleep(interval_s)


# ── WebSocket endpoint ─────────────────────────────────────────────────────────

@router.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    """
    Connect: ws://host/ws/feed
    Receives JSON snapshots every ~5s.
    Schema: { type, market, signals, alerts, timestamp }
    """
    await manager.connect(websocket)
    try:
        # Send an immediate first snapshot on connect so UI doesn't wait
        market  = aggregate_market()
        signals = aggregate_signals()
        alerts  = aggregate_alerts()
        await websocket.send_text(json.dumps({
            "type":      "snapshot",
            "market":    market,
            "signals":   signals,
            "alerts":    alerts,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }))

        # Keep the connection alive — client messages are ignored (read-only feed)
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS connection error: {e}")
        manager.disconnect(websocket)
