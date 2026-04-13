from datetime import datetime
try:
    from .model import MarketModel
except ImportError:
    from model import MarketModel

class SignalEngine:
    """
    Takes features + indices → generates final market signal.
    Hybrid approach: uses LightGBM model if available, else falls back to rule-based.
    """
    def __init__(self, use_ml=True):
        self.use_ml = use_ml
        self.model = MarketModel()

    def generate_signal(self, features: dict, indices: dict) -> dict:
        composite = indices["COMPOSITE"]
        nifty_ch  = features["nifty_change"]
        oil_ch    = features["oil_change"]

        # --- Rule-based Scoring logic (fallback/weighted) ---
        bearish_score = 0
        bullish_score = 0
        drivers       = []

        if composite >= 65:
            bearish_score += 3
            drivers.append(f"High composite stress index ({composite})")

        if oil_ch > 1.5:
            bearish_score += 2
            drivers.append(f"Oil price surge ({oil_ch:+.1f}%)")

        if features["usd_inr"] > 84.0:
            bearish_score += 1
            drivers.append(f"Rupee weakness (USD/INR: {features['usd_inr']})")

        if features["fii_proxy"] == "selling":
            bearish_score += 2
            drivers.append("Inferred FII selling pressure")

        if features["geo_high_count"] >= 2:
            bearish_score += 2
            drivers.append(f"Multiple geopolitical risk events ({features['geo_high_count']})")

        if features["vix_change"] > 5:
            bearish_score += 1
            drivers.append(f"India VIX spike ({features['vix_change']:+.1f}%)")

        if features["bullish_count"] >= 3:
            bullish_score += 2
            drivers.append("Positive macro news flow")

        if nifty_ch > 0.5:
            bullish_score += 1
            drivers.append(f"NIFTY positive momentum ({nifty_ch:+.1f}%)")

        # --- ML Prediction ---
        ml_direction, ml_confidence = self.model.predict(features)
        
        # --- Decision (Hybrid) ---
        net = bearish_score - bullish_score
        
        if self.use_ml and ml_direction is not None:
            # Shift confidence towards rule-based if they agree
            if ml_direction == "BEARISH" and net > 0:
                direction, level = "BEARISH", "STRONG"
                confidence = min(ml_confidence + (net * 0.05), 0.95)
            elif ml_direction == "BULLISH" and net < 0:
                direction, level = "BULLISH", "STRONG"
                confidence = min(ml_confidence + (abs(net) * 0.05), 0.95)
            else:
                direction, level = ml_direction, "MODERATE"
                confidence = ml_confidence
        else:
            # Pure rule-based fallback
            if   net >= 4:  direction, level = "BEARISH", "STRONG"
            elif net >= 2:  direction, level = "BEARISH", "MODERATE"
            elif net <= -3: direction, level = "BULLISH", "STRONG"
            elif net <= -1: direction, level = "BULLISH", "MODERATE"
            else:           direction, level = "NEUTRAL", "WEAK"
            
            raw_confidence = min(0.50 + (abs(net) * 0.08) + (composite / 500), 0.92)
            confidence = round(raw_confidence, 2)

        # Risk factors (top bearish drivers)
        risk_factors = [d for d in drivers if any(
            kw in d.lower() for kw in ["oil", "rupee", "fii", "geo", "stress", "vix"]
        )]

        # IMSI Breakdown for transparency
        imsi_breakdown = f"IMSI: {composite} — Oil: {indices['OIL']} | Rupee: {indices['CUR']} | FII: {indices['FII']} | Geo: {indices['GEO']} | VIX: {indices['VIX']}"

        return {
            "direction":    direction,
            "level":        level,
            "confidence":   confidence,
            "net_score":    net,
            "imsi_breakdown": imsi_breakdown,
            "drivers":      drivers[:5],       # top 5 drivers
            "risk_factors": risk_factors[:3],  # top 3 risks
            "timestamp":    str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        }
