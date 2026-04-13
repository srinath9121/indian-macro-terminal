class IndexEngine:
    """
    Computes 4 custom indices — equivalent of GeoTrade's GTI.
    Each index: 0-100. Higher = more stress/risk.
    """

    def compute_imsi_geo(self, features: dict) -> float:
        """India Macro Stress Index - Geopolitical component"""
        score = (
            features.get("geo_high_count", 0) * 15 +
            features.get("avg_severity", 0)   * 30 +
            features.get("bearish_count", 0)  * 5  +
            features.get("oil_risk_count", 0) * 10
        )
        return round(min(score, 100), 1)

    def compute_cpi(self, features: dict) -> float:
        """Commodity Pressure Index (Gold/Ex-Oil)"""
        gold_ch = features.get("gold_change", 0)
        score = abs(gold_ch) * 10
        return round(min(score, 100), 1)

    def compute_opi(self, features: dict) -> float:
        """Oil Pressure Index"""
        oil_ch = features.get("oil_change", 0)
        score = min(abs(oil_ch) * 20, 100)
        return round(score, 1)

    def compute_csi(self, features: dict) -> float:
        """Currency Stress Index"""
        usd_inr        = features.get("usd_inr", 83.5)
        usd_inr_change = features.get("usd_inr_change", 0.0)
        
        # Base stress from high absolute value
        base_inr_stress = max(0, (usd_inr - 83.0) * 20)
        dynamic_inr_stress = usd_inr_change * 15
        
        inr_stress = base_inr_stress + dynamic_inr_stress
        return round(min(max(inr_stress, 0), 100), 1)

    def compute_fpi(self, features: dict) -> float:
        """Flow Pressure Index (FII)"""
        fii_proxy = features.get("fii_proxy", "neutral")
        base = {"selling": 70, "mild_selling": 45, "neutral": 30, "buying": 10}
        score = base.get(fii_proxy, 30)
        return round(min(score, 100), 1)

    def compute_vsi(self, features: dict) -> float:
        """VIX Stress Index"""
        vix_val = features.get("vix_value", 15)
        # Scale 10-30 to 0-100
        score = max(0, (vix_val - 10) * 5)
        return round(min(score, 100), 1)

    def compute_all(self, features: dict) -> dict:
        imsi_geo = self.compute_imsi_geo(features)
        oil_score = self.compute_opi(features)
        cur_score = self.compute_csi(features)
        fii_score = self.compute_fpi(features)
        vix_score = self.compute_vsi(features)
        cmd_score = self.compute_cpi(features)

        # Composite index (weighted)
        # Oil (25%), Currency (25%), FII (20%), Geopolitical (15%), VIX (10%), Commodity (5%)
        composite = round(
            0.25 * oil_score +
            0.25 * cur_score +
            0.20 * fii_score +
            0.15 * imsi_geo +
            0.10 * vix_score +
            0.05 * cmd_score,
            1
        )

        return {
            "IMSI": composite,
            "OIL": oil_score,
            "CUR": cur_score,
            "FII": fii_score,
            "GEO": imsi_geo,
            "VIX": vix_score,
            "CMD": cmd_score,
            "COMPOSITE": composite
        }

    @staticmethod
    def label(score: float) -> str:
        if score >= 75: return "CRITICAL"
        if score >= 55: return "ELEVATED"
        if score >= 35: return "MODERATE"
        return "LOW"
