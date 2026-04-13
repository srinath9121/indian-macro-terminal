import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for live data fetching with WebSocket fallback to polling.
 * 
 * @param {string} endpoint - REST endpoint to fetch from (e.g. '/api/signals')
 * @param {string} wsKey - Key in WebSocket payload to watch (e.g. 'data')
 * @param {number} interval - Polling interval in ms if WS is down (e.g. 60000)
 * @returns {{ data: any, lastUpdate: Date|null, isLive: boolean }}
 */
export default function useLiveData(endpoint, wsKey = 'data', interval = 60000) {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const reconnectRef = useRef(null);

  // ────── REST FETCH ──────
  const fetchRest = useCallback(async () => {
    try {
      const resp = await fetch(endpoint);
      if (resp.ok) {
        const json = await resp.json();
        setData(json);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.warn(`useLiveData: REST fetch failed for ${endpoint}:`, e);
    }
  }, [endpoint]);

  // ────── WEBSOCKET SUBSCRIPTION ──────
  useEffect(() => {
    // Initial REST fetch
    fetchRest();

    // Try WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLive(true);
        // Stop polling
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'price_update' && msg[wsKey]) {
            setData(msg[wsKey]);
            setLastUpdate(new Date());
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsLive(false);
        // Start polling fallback
        if (!pollRef.current) {
          pollRef.current = setInterval(fetchRest, interval);
        }
        // Reconnect after delay
        reconnectRef.current = setTimeout(connectWs, 5000);
      };

      ws.onerror = () => ws.close();
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [endpoint, wsKey, interval, fetchRest]);

  return { data, lastUpdate, isLive };
}
