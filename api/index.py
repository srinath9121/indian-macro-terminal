import sys
import os
from pathlib import Path

# Define Base Path relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

# Add root src to path so we can import modules correctly in Serverless context
if str(SRC_DIR) not in sys.path:
    sys.path.append(str(SRC_DIR))

# Vercel needs the app object to be named 'app'
from server import app
