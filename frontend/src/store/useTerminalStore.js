/**
 * useTerminalStore.js
 *
 * Global Zustand store for all terminal data.
 *
 * Data delivery strategy:
 *   PRIMARY   — WebSocket feed (/ws/feed) via useWebSocketFeed hook.
 *               Snapshots arrive every ~5s and are written directly into
 *               this store by the hook.
 *   FALLBACK  — startPolling() via HTTP REST. Activates automatically when
 *               wsConnected=false (WS unavailable or still connecting).
 */

import { create } from "zustand";
import { getMarketOverview } from "../services/marketData";
import { getMacroIndicators } from "../services/macroData";
import { getAdaniStocks }     from "../services/adaniData";
import { fetchApi }           from "../services/api";

export const useTerminalStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────────────────────
  marketData:   null,
  macroData:    null,
  adaniStocks:  [],
  globalSignal: null,
  alertsData:   null,

  // ── Meta ──────────────────────────────────────────────────────────────────
  isLoading:   true,
  lastUpdated: null,
  wsConnected: false,   // set true by useWebSocketFeed when socket is OPEN

  // ── HTTP fetch (fallback / initial load) ──────────────────────────────────
  fetchData: async () => {
    if (!get().marketData) set({ isLoading: true });

    const [market, macro, adani, signal, alerts] = await Promise.all([
      getMarketOverview(),
      getMacroIndicators(),
      getAdaniStocks(),
      fetchApi("/signals"),
      fetchApi("/alerts"),
    ]);

    set({
      marketData:   market,
      macroData:    macro,
      adaniStocks:  adani ?? [],
      globalSignal: signal
        ? {
            ...signal,
            irs:     macro?.irs?.score,
            irsZone: macro?.irs?.zone,
            irsMode: macro?.irs?.mode,
          }
        : null,
      alertsData:  alerts,
      isLoading:   false,
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * startPolling — HTTP fallback loop.
   *
   * Skips a fetch cycle if wsConnected=true (WS already delivering data).
   * This means the interval runs, but is a no-op whenever WS is healthy —
   * no double-fetching, no wasted bandwidth.
   */
  startPolling: (intervalMs = 15_000) => {
    get().fetchData();                          // always do the first HTTP load
    const id = setInterval(() => {
      if (!get().wsConnected) get().fetchData(); // only poll when WS is down
    }, intervalMs);
    return id;
  },
}));
