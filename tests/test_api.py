import asyncio
import json
import logging
from src.server import fetch_composite_signals

logging.basicConfig(level=logging.INFO)

async def test():
    print("\n[DIAGNOSTIC] Running fetch_composite_signals()...")
    try:
        from src.server import fetch_composite_signals
        data = await fetch_composite_signals()
        print(f"\n[SUCCESS] Response:\n{json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"\n[CRASH] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
