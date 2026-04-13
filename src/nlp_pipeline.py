import os

EVENT_KEYWORDS = {
    "geopolitical_high": [
        "war", "conflict", "sanctions", "military", "attack", "missile",
        "tension", "border", "nuclear", "strike", "invasion"
    ],
    "geopolitical_medium": [
        "diplomatic", "protest", "election", "coup", "trade war",
        "tariff", "embargo"
    ],
    "oil_risk": [
        "opec", "crude", "oil price", "petroleum", "strait of hormuz",
        "pipeline", "energy crisis", "fuel"
    ],
    "rbi_policy": [
        "rbi", "repo rate", "monetary policy", "interest rate",
        "inflation", "cpi", "rbi governor"
    ],
    "market_stress": [
        "fii", "foreign outflow", "sell-off", "market crash", "circuit",
        "volatility", "rupee falls", "bear market"
    ],
    "positive": [
        "gdp growth", "investment", "surplus", "rate cut", "recovery",
        "bullish", "record high", "boom", "rally"
    ]
}

class EventClassifier:
    """
    Lightweight keyword-based NLP.
    """

    def classify(self, article: dict) -> dict:
        text   = (article.get("title", "") + " " + article.get("summary", "")).lower()
        scores = {}

        for category, keywords in EVENT_KEYWORDS.items():
            hits = sum(1 for kw in keywords if kw in text)
            scores[category] = hits

        # Determine dominant category
        dominant = max(scores, key=scores.get) if max(scores.values()) > 0 else "neutral"
        total_hits = sum(scores.values())

        # Severity: 0-1 scale
        severity = min(total_hits / 5.0, 1.0)

        # Sentiment: positive keywords reduce severity
        if scores.get("positive", 0) > scores.get("market_stress", 0):
            sentiment = "positive"
            market_bias = "bullish"
        elif scores.get("geopolitical_high", 0) > 0 or scores.get("market_stress", 0) > 1:
            sentiment = "negative"
            market_bias = "bearish"
        else:
            sentiment = "neutral"
            market_bias = "neutral"

        return {
            "category":    dominant,
            "severity":    round(severity, 3),
            "sentiment":   sentiment,
            "market_bias": market_bias,
            "scores":      scores,
            "id":          article.get("id", ""),
            "title":       article.get("title", ""),
            "source":      article.get("source", ""),
            "link":        article.get("link", ""),
            "published":   article.get("published", "")
        }

    def batch_classify(self, articles: list) -> list:
        return [self.classify(a) for a in articles]
