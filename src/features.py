import numpy as np

class FeatureEngine:
    """
    Combines all raw signals into a unified feature vector.
    """

    def build(self, market: dict, macro: dict, events: list) -> dict:

        # --- Market features ---
        nifty_change = market.get("nifty",     {}).get("change_pct", 0) or 0
        oil_change   = market.get("brent_crude", {}).get("change_pct", 0) or market.get("crude_oil", {}).get("change_pct", 0) or 0
        gold_change  = market.get("gold",      {}).get("change_pct", 0) or 0
        vix_change   = market.get("vix",       {}).get("change_pct", 0) or 0
        vix_value    = market.get("vix",       {}).get("price", 15) or 15
        usd_inr      = macro.get("currency",   {}).get("usd_inr", 83.5) or 83.5
        usd_inr_change = market.get("usd_inr", {}).get("change_pct", 0.0) or 0.0

        # --- News aggregate features ---
        if events:
            avg_severity       = np.mean([e["severity"] for e in events])
            geo_high_count     = sum(1 for e in events if e["category"] == "geopolitical_high")
            bearish_count      = sum(1 for e in events if e["market_bias"] == "bearish")
            bullish_count      = sum(1 for e in events if e["market_bias"] == "bullish")
            oil_risk_count     = sum(1 for e in events if e["category"] == "oil_risk")
            rbi_policy_count   = sum(1 for e in events if e["category"] == "rbi_policy")
        else:
            avg_severity = geo_high_count = bearish_count = 0
            bullish_count = oil_risk_count = rbi_policy_count = 0

        # --- Macro -> Sector Mappings (Only the 5 verified rules) ---
        macro_sectors = []
        
        # 1. Oil -> Airlines / Paint
        if abs(oil_change) >= 0.1:
            if oil_change > 0:
                macro_sectors.append({
                    "icon": "🛢️", "title": "Oil Spike", "change": f"+{oil_change:.1f}%",
                    "reason": "Fuel & raw material costs rising",
                    "sectors": [
                        {"name": "Airlines", "direction": "down", "impact": "HIGH"},
                        {"name": "Paint", "direction": "down", "impact": "HIGH"}
                    ]
                })
            else:
                macro_sectors.append({
                    "icon": "🛢️", "title": "Oil Drop", "change": f"{oil_change:.1f}%",
                    "reason": "Cost relief for intensive sectors",
                    "sectors": [
                        {"name": "Airlines", "direction": "up", "impact": "HIGH"},
                        {"name": "Paint", "direction": "up", "impact": "HIGH"}
                    ]
                })
                
        # 2. Rupee -> IT / Pharma
        inr_change = market.get("usd_inr", {}).get("change_pct", 0) or 0
        if usd_inr >= 83.5 or inr_change > 0.05:
            macro_sectors.append({
                "icon": "💱", "title": "Rupee Weakness", "change": f"₹{usd_inr}",
                "reason": "Export competitiveness improves",
                "sectors": [
                    {"name": "IT", "direction": "up", "impact": "MEDIUM"},
                    {"name": "Pharma", "direction": "up", "impact": "MEDIUM"}
                ]
            })
        elif inr_change < -0.05:
            macro_sectors.append({
                "icon": "💱", "title": "Rupee Strength", "change": f"₹{usd_inr}",
                "reason": "Export margins pressure",
                "sectors": [
                    {"name": "IT", "direction": "down", "impact": "MEDIUM"},
                    {"name": "Pharma", "direction": "down", "impact": "MEDIUM"}
                ]
            })

        # 3. Rates -> Banks / Real Estate
        repo = macro.get("rbi", {}).get("repo_rate", 6.25)
        macro_sectors.append({
            "icon": "🏦", "title": "Interest Rates", "change": f"{repo}%",
            "reason": "Banks earn more, loans expensive",
            "sectors": [
                {"name": "Banks", "direction": "up", "impact": "HIGH"},
                {"name": "Real Estate", "direction": "down", "impact": "HIGH"}
            ]
        })
        
        # 4. Monsoon -> FMCG / Auto
        monsoon_count = sum(1 for e in events if "monsoon" in e.get("title", "").lower() or "rain" in e.get("title", "").lower())
        if monsoon_count > 0:
             macro_sectors.append({
                "icon": "🌧️", "title": "Good Monsoon", "change": "Active",
                "reason": "Rural demand increases",
                "sectors": [
                    {"name": "FMCG", "direction": "up", "impact": "MEDIUM"},
                    {"name": "Auto", "direction": "up", "impact": "MEDIUM"}
                ]
             })
             
        # 5. Infra -> Cement / Steel
        infra_count = sum(1 for e in events if "infra" in e.get("title", "").lower() or "budget" in e.get("title", "").lower())
        if infra_count > 0:
             macro_sectors.append({
                "icon": "🏗️", "title": "Infra Spending", "change": "High",
                "reason": "Govt projects drive demand",
                "sectors": [
                    {"name": "Cement", "direction": "up", "impact": "HIGH"},
                    {"name": "Steel", "direction": "up", "impact": "HIGH"}
                ]
             })

        # Limit to top 2-3 most relevant if there are many
        if len(macro_sectors) > 3:
            macro_sectors = macro_sectors[:3]

        return {
            # Market
            "nifty_change":    nifty_change,
            "oil_change":      oil_change,
            "gold_change":     gold_change,
            "vix_change":      vix_change,
            "usd_inr":         usd_inr,
            "usd_inr_change":  usd_inr_change,

            # News-derived
            "avg_severity":    round(float(avg_severity), 3),
            "geo_high_count":  geo_high_count,
            "bearish_count":   bearish_count,
            "bullish_count":   bullish_count,
            "oil_risk_count":  oil_risk_count,
            "rbi_policy_count": rbi_policy_count,

            # Macro proxy
            "fii_proxy":       macro.get("fii", {}).get("fii_proxy_signal", "neutral"),
            "market_pressure": macro.get("fii", {}).get("market_pressure", "LOW"),
            
            # New mapping
            "macro_sectors":   macro_sectors
        }
