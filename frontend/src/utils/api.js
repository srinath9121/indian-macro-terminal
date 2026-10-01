/**
 * utils/api.js — thin re-export shim.
 *
 * The canonical API utility lives in services/api.js (fetchApi).
 * This file provides the `safeFetch` alias that older components
 * reference, wired to the same underlying implementation.
 *
 * Do NOT add new logic here — add it to services/api.js instead.
 */
export { fetchApi as safeFetch } from "../services/api";

/** Convenience default export for legacy default-import usage */
export { fetchApi as default } from "../services/api";
