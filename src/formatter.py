class OutputFormatter:
    """
    Formats everything into the final JSON output for the frontend.
    """

    def format(
        self,
        signal:   dict,
        indices:  dict,
        market:   dict,
        features: dict,
        top_news: list,
        top_movers: dict,
        macro_data: dict
    ) -> dict:

        # Format market snapshot (including new indices if fetched)
        market_snapshot = {}
        for name, data in market.items():
            if data.get("price") is not None:
                ch  = data.get("change_pct", 0)
                sym = {"nifty": "NIFTY", "sensex": "SENSEX", "banknifty": "BANKNIFTY", "nifty_it": "NIFTY IT",
                       "crude_oil": "CRUDE", "gold": "GOLD", "usd_inr": "USD/INR", "vix": "INDIAVIX"}.get(name, name.upper())
                market_snapshot[sym] = {
                    "price":     data["price"],
                    "change":    f"{ch:+.2f}%",
                    "direction": data["direction"]
                }

        # Format top news (most impactful)
        news_items = [
            {
                "headline": n["title"][:80],
                "source":   n["source"],
                "category": n["category"],
                "bias":     n["market_bias"],
                "link":     n.get("link", "#")
            }
            for n in sorted(top_news, key=lambda x: x["severity"], reverse=True)[:5]
        ]
        
        # Determine overall IMSI for the dashboard
        imsi_value = indices.get("IMSI", 0)
        
        brent_data = market.get("brent_crude", {})

        return {
            "terminal": "India Macro Intelligence Terminal",
            "version":  "1.0",
            "timestamp": signal["timestamp"],
            
            "BRENT_DATA": {
                "brent_price": brent_data.get("price"),
                "brent_change_pct": brent_data.get("change_pct"),
                "data_source": "Brent Crude (BZ=F)",
                "delay_minutes": 15
            } if brent_data.get("price") is not None else None,

            "SIGNAL": {
                "direction":  signal["direction"],
                "level":      signal["level"],
                "confidence": f"{int(signal['confidence']*100)}%",
                "summary":    f"Market bias {signal['direction']} ({signal['level']}) with {int(signal['confidence']*100)}% confidence",
                "imsi_breakdown": signal.get("imsi_breakdown", "")
            },

            "INDICES": {
                "IMSI": {"score": indices["IMSI"], "label": "IMSI", "name": "India Macro Stress Index"},
                "OIL":  {"score": indices["OIL"],  "label": "OIL",  "name": "Oil Pressure"},
                "CUR":  {"score": indices["CUR"],  "label": "INR",  "name": "Currency Pressure"},
                "FII":  {"score": indices["FII"],  "label": "FII",  "name": "Flow Pressure"},
                "GEO":  {"score": indices["GEO"],  "label": "GEO",  "name": "Geopolitcal Risk"},
                "VIX":  {"score": indices["VIX"],  "label": "VIX",  "name": "Volatility Stress"},
                "CMD":  {"score": indices["CMD"],  "label": "CMD",  "name": "Commodity Press (Ex-Oil)"},
                "COMPOSITE": {"score": indices["COMPOSITE"], "label": "COMP", "name": "Overall Stress"}
            },

            "MARKET": market_snapshot,
            "TOP_MOVERS": top_movers,
            "MACRO_SECTORS": features.get("macro_sectors", []),
            "FII_DII": macro_data.get("fii_real", {}),
            "RBI": macro_data.get("rbi", {}),

            "DRIVERS": signal["drivers"],
            "RISK_FACTORS": signal["risk_factors"],

            "NEWS": news_items,

            "META": {
                "news_articles_processed": len(top_news),
                "bearish_news_count":      features["bearish_count"],
                "bullish_news_count":      features["bullish_count"],
                "geo_risk_events":         features["geo_high_count"],
                "data_quality_note":       "RSS=live | yfinance=~15min delay | FII=proxy"
            }
        }
