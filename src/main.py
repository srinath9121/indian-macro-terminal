import json
import os
from datetime import datetime

try:
    from .data_ingestion import NewsIngestion, MarketIngestion, MacroIngestion
    from .nlp_pipeline import EventClassifier
    from .features import FeatureEngine
    from .indices import IndexEngine
    from .signal_engine import SignalEngine
    from .formatter import OutputFormatter
except ImportError:
    from data_ingestion import NewsIngestion, MarketIngestion, MacroIngestion
    from nlp_pipeline import EventClassifier
    from features import FeatureEngine
    from indices import IndexEngine
    from signal_engine import SignalEngine
    from formatter import OutputFormatter

class IndiaMacroTerminal:
    """
    The main orchestrator for the India Macro Intelligence Terminal.
    Runs the full end-to-end pipeline.
    """

    def __init__(self, output_path="outputs/signals.json"):
        self.news_ingest   = NewsIngestion()
        self.market_ingest = MarketIngestion()
        self.macro_ingest  = MacroIngestion()
        self.classifier    = EventClassifier()
        self.features      = FeatureEngine()
        self.indices       = IndexEngine()
        self.signals       = SignalEngine()
        self.formatter     = OutputFormatter()
        
        self.output_path = output_path
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

    def run(self) -> dict:
        print(f"\n--- Terminal Run Started at {datetime.now().strftime('%H:%M:%S')} ---")

        # 1. Ingestion
        print("[1/5] Ingesting news, market, and macro data...")
        raw_news = self.news_ingest.fetch_rss()
        market_data = self.market_ingest.fetch()
        top_movers = self.market_ingest.fetch_top_movers()
        macro_currency = self.macro_ingest.fetch_currency()
        macro_fii = self.macro_ingest.fetch_fii_proxy(market_data)
        real_fii = self.macro_ingest.fetch_fii_dii()
        rbi_data = self.macro_ingest.fetch_rbi_tracker()
        macro_data = {
            "currency": macro_currency, 
            "fii": macro_fii, 
            "fii_real": real_fii, 
            "rbi": rbi_data
        }

        # 2. NLP Pipeline
        print(f"[2/5] Analyzing {len(raw_news)} articles...")
        classified_events = self.classifier.batch_classify(raw_news)

        # 3. Feature Engineering
        print("[3/5] Building intelligence features...")
        feature_vector = self.features.build(market_data, macro_data, classified_events)

        # 4. Intelligence Indices & Signal
        print("[4/5] Computing GTI/CPI/CSI/FPI and generating signals...")
        index_scores = self.indices.compute_all(feature_vector)
        final_signal = self.signals.generate_signal(feature_vector, index_scores)

        # 5. Result Formatting & Export
        print("[5/5] Exporting final signals...")
        output = self.formatter.format(
            signal=final_signal,
            indices=index_scores,
            market=market_data,
            features=feature_vector,
            top_news=classified_events,
            top_movers=top_movers,
            macro_data=macro_data
        )

        with open(self.output_path, "w") as f:
            json.dump(output, f, indent=2)
        
        print(f"Termimal execution complete. Output saved to {self.output_path}\n")
        return output

if __name__ == "__main__":
    terminal = IndiaMacroTerminal()
    terminal.run()
