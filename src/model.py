import lightgbm as lgb
import os
import joblib
import numpy as np

class MarketModel:
    """
    LightGBM classifier for market direction.
    """
    def __init__(self, model_path="models/lgb_model.pkl"):
        self.model_path = model_path
        self.model = None
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)

    def train(self, X, y):
        """
        Train the LightGBM model.
        X: feature matrix
        y: targets (0: neutral, 1: bullish, 2: bearish)
        """
        params = {
            'objective': 'multiclass',
            'num_class': 3,
            'metric': 'multi_logloss',
            'verbosity': -1,
            'boosting_type': 'gbdt',
        }
        
        train_data = lgb.Dataset(X, label=y)
        self.model = lgb.train(params, train_data, num_boost_round=100)
        
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        print(f"Model saved to {self.model_path}")

    def predict(self, feature_dict):
        """
        Predict market direction.
        Returns (direction, confidence)
        """
        if self.model is None:
            return None, 0.0
            
        # Convert feature_dict to list/array in correct order
        # This order must match training!
        features = [
            feature_dict.get("nifty_change", 0),
            feature_dict.get("oil_change", 0),
            feature_dict.get("gold_change", 0),
            feature_dict.get("vix_change", 0),
            feature_dict.get("usd_inr", 83.5),
            feature_dict.get("avg_severity", 0),
            feature_dict.get("geo_high_count", 0),
            feature_dict.get("bearish_count", 0),
            feature_dict.get("bullish_count", 0),
            feature_dict.get("oil_risk_count", 0),
            feature_dict.get("rbi_policy_count", 0)
        ]
        
        preds = self.model.predict([features])[0]
        class_idx = np.argmax(preds)
        confidence = preds[class_idx]
        
        mapping = {0: "NEUTRAL", 1: "BULLISH", 2: "BEARISH"}
        return mapping[class_idx], confidence
