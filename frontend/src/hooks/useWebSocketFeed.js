/**
 * useWebSocketFeed.js
 *
 * Connects to ws://host/ws/feed and writes snapshots directly into
 * useTerminalStore. Falls back transparently if WebSocket is unavailable.
 *
 * Connection lifecycle:
 *   CONNECTING → OPEN → auto-reconnect on close/error (exponential back-off, max 30s)
 *
 * Usage:
 *   Call once at the app root — useWebSocketFeed() inside a component
 *   that mounts early (e.g., Layout). The hook publishes to the global
 *   store; any component reading the store will react automatically.
 */

import { useEffect, useRef, useCallback } from "react";
import { useTerminalStore } from "../store/useTerminalStore";

const WS_URL = (() => {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host  = window.location.host;        // includes port
  return `${proto}//${host}/ws/feed`;
})();

const MIN_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

export function useWebSocketFeed() {
  const wsRef      = useRef(null);
  const retryDelay = useRef(MIN_RECONNECT_MS);
  const retryTimer = useRef(null);
  const mountedRef = useRef(true);

  const applySnapshot = useCallback((data) => {
    if (data.type !== "snapshot") return;

    const { market, signals, alerts } = data;

    useTerminalStore.setState({
      marketData:   market   ?? useTerminalStore.getState().marketData,
      globalSignal: signals
        ? {
            ...signals,
            irs:     market?.irs?.score,
            irsZone: market?.irs?.zone,
            irsMode: market?.irs?.mode,
          }
        : useTerminalStore.getState().globalSignal,
      alertsData:   alerts   ?? useTerminalStore.getState().alertsData,
      isLoading:    false,
      lastUpdated:  data.timestamp ?? new Date().toISOString(),
      wsConnected:  true,
    });

    retryDelay.current = MIN_RECONNECT_MS; // reset back-off on success
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    useTerminalStore.setState({ wsConnected: false });

    let ws;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      console.info("[WS] Connected →", WS_URL);
      useTerminalStore.setState({ wsConnected: true });
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        applySnapshot(data);
      } catch (e) {
        console.warn("[WS] Parse error:", e);
      }
    };

    ws.onerror = () => {
      console.warn("[WS] Connection error");
    };

    ws.onclose = (evt) => {
      console.info(`[WS] Closed (code=${evt.code})`);
      useTerminalStore.setState({ wsConnected: false });
      if (mountedRef.current) scheduleReconnect();
    };
  }, [applySnapshot]);

  const scheduleReconnect = useCallback(() => {
    const delay = retryDelay.current;
    console.info(`[WS] Reconnecting in ${delay}ms…`);
    retryTimer.current = setTimeout(() => {
      retryDelay.current = Math.min(retryDelay.current * 2, MAX_RECONNECT_MS);
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // suppress reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);
}
