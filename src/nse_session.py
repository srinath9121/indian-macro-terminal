import requests
import logging
from datetime import datetime
import pytz

IST = pytz.timezone('Asia/Kolkata')
logger = logging.getLogger(__name__)


class NSESessionManager:
    """Manages a persistent requests.Session pre-warmed with NSE cookies.
    
    NSE requires valid session cookies for their API endpoints.
    This manager handles session creation, cookie warmup, and reset.
    """

    def __init__(self):
        self._session = None
        self._last_refresh = None
        self._headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.nseindia.com/",
            "Connection": "keep-alive",
        }

    def get_session(self):
        """Returns a cached requests.Session pre-warmed with NSE cookies.
        
        On first call: creates session, sets browser-like headers,
        GETs https://www.nseindia.com to acquire session cookies, then caches it.
        If NSE blocks the warmup, logs a warning and returns the session anyway
        (yfinance fallback will handle data fetching).
        """
        if self._session is None:
            self._session = requests.Session()
            self._session.headers.update(self._headers)

            try:
                res = self._session.get("https://www.nseindia.com", timeout=10)
                res.raise_for_status()
                self._last_refresh = datetime.now(IST)
                logger.info(f"NSE session initialized successfully at {self._last_refresh}")
            except Exception as e:
                logger.warning(
                    f"NSE session warmup failed: {e}. "
                    "Session returned without cookies — yfinance fallback will handle data fetching."
                )

        return self._session

    def reset(self):
        """Clears the cached session so the next get_session() call creates a fresh one."""
        if self._session is not None:
            try:
                self._session.close()
            except Exception:
                pass
        self._session = None
        self._last_refresh = None
        logger.info("NSE session reset. Next get_session() will create a fresh session.")


# Module-level singleton
nse_session_manager = NSESessionManager()
