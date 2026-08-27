import sys
import os

# Create absolute path to src to allow imports
sys.path.append(os.path.abspath("src"))

from indices import IndexEngine

def test_currency_stress():
    engine = IndexEngine()
    
    # Base Case
    f_base = {
        "usd_inr": 83.5,
        "usd_inr_change": 0.0,
        "vix_change": 0.0
    }
    
    # 83.5 to 84.5 -> USD/INR rises, Rupee weakens -> Change is positive
    change_up = ((84.5 - 83.5) / 83.5) * 100
    f_up = {
        "usd_inr": 84.5,
        "usd_inr_change": change_up,
        "vix_change": 0.0
    }
    
    # 84.5 to 83.0 -> USD/INR falls, Rupee strengthens -> Change is negative
    change_down = ((83.0 - 84.5) / 84.5) * 100
    f_down = {
        "usd_inr": 83.0,
        "usd_inr_change": change_down,
        "vix_change": 0.0
    }
    
    csi_base = engine.compute_csi(f_base)
    csi_up = engine.compute_csi(f_up)
    csi_down = engine.compute_csi(f_down)
    
    print("--- Currency Stress Index (CSI) Test ---")
    print(f"Base case (USD/INR = 83.5, change = 0.0%): {csi_base}")
    print(f"Rupee weakens (USD/INR 83.5 -> 84.5, change = {change_up:+.2f}%): {csi_up}")
    print(f"Rupee strengthens (USD/INR 84.5 -> 83.0, change = {change_down:+.2f}%): {csi_down}")
    
    if csi_up > csi_base and csi_down < csi_up:
        print("\n✅ TEST PASSED: Stress increases when USD/INR rises, decreases when it falls.")
    else:
        print("\n❌ TEST FAILED: Sign logic incorrect.")

if __name__ == "__main__":
    test_currency_stress()
