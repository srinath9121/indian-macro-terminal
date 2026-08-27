# 🇮🇳 India Macro Terminal

> **Institutional-grade macroeconomic, geopolitical, and real-time capital market intelligence platform designed specifically for the Indian financial ecosystem.**

[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 📸 Overview

The **India Macro Terminal** bridges the gap between macroeconomic indicators (GDP, CPI, Liquidity, FII/DII flows), global geopolitical conflict data (GDELT 2.0 / Goldstein scores), and real-time NSE market movements. Built with an institutional **Dark Terminal** and **Light Glass** design system, it delivers high-density financial data with zero noise.

---

## ✨ Key Features

### 1. 📊 India Macro Scoreboard & Pulse
- Real-time tracking of India's **GDP Growth Forecasts**, **CPI Inflation YoY**, **System Liquidity**, and **FII/DII Net Flow trends**.
- Automated **Market Bias computation** (Bullish / Defensive / Neutral) with confidence grading.
- Live Nifty 50, Sensex, Bank Nifty, India VIX, Brent Crude, and USD/INR market snapshots.

### 2. 🌍 3D Geopolitical Risk Globe (Geo Map)
- Full-screen interactive 3D WebGL globe visualizing **active global trade routes and risk arcs** (Middle East crude routes, Russia sanctions, China supply chain pressure, US Fed interest rate dynamics).
- Country-level Geopolitical Tension Index (**GTI**) and Goldstein conflict severity scores derived from **GDELT 2.0**.
- Seamless frosted HUD overlay panels providing instant India-specific macro impact signals upon country selection.

### 3. ⚡ Adani Group Intelligence & Live Alerts
- High-frequency tracking across flagship group equities (*ADANIENT, ADANIPORTS, ADANIPOWER, ADANIGREEN, ATGL, AWL*).
- Correlation spike detection and automated anomaly alerting for sudden price movements and institutional flow reversals.

### 4. 🌓 Dual Theme Architecture & Typography
- **Dark Terminal Theme**: High-contrast obsidian slate (`#0B0E14`), electric cyan (`#00D4FF`), and mint emerald (`#10B981`) accents tailored for multi-monitor trading desks.
- **Light Glass Theme**: Clean frosted glass aesthetic with subtle backdrops for daytime analysis.
- **Departure Mono Typography**: Pixel-perfect monospace typeface rendered for all numeric metrics, percentages, and tickers.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Real-Time Sources    │
                                  │ (yfinance, NSE, GDELT) │
                                  └───────────┬────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FastAPI Backend (Python 3.11)                           │
│  ├── /api/market/movers         (Gainers, Losers, Volume Shockers)                     │
│  ├── /api/gdelt/india-events    (Geopolitical Tension Index & Conflict Scores)         │
│  ├── /api/fii-history           (Institutional Foreign/Domestic Flows)                 │
│  ├── /api/india-risk-score      (Multi-factor Composite Risk Engine)                  │
│  └── /ws/live                   (WebSocket real-time price & pulse broadcast)          │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               React + Vite SPA (Tailwind / Custom CSS)                 │
│  ├── Pulse Dashboard            (Macro Scoreboard, Causal Chains, Adani Intel)         │
│  ├── 3D Geo Map HUD             (WebGL Three-Globe, Geopolitical Risk Arcs)            │
│  ├── Markets Intelligence       (Movers, 30-Day Index Sparklines, Heatmaps)            │
│  └── Risk Radar                 (Composite India Risk Factor Gauges)                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
indian-macro-terminal/
├── api/              # Serverless entrypoints (Vercel / Cloud functions)
├── backend/          # Modular FastAPI routes, services, and models
├── data/             # Persistent cache & historical data storage
├── docs/             # Design specifications, prompt guides, and project documentation
├── frontend/         # React + Vite frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI cards, 3D globe, navbar, charts
│   │   ├── hooks/       # Custom React hooks (useTheme, useLiveData, etc.)
│   │   ├── pages/       # Terminal views: Pulse, Macro, Markets, GeoMap, RiskRadar
│   │   └── store/       # Zustand centralized terminal state store
│   └── public/fonts/    # Self-hosted Departure Mono fonts
├── notebooks/        # Jupyter research & statistical exploratory notebooks
├── src/              # Core production backend engine, GDELT fetchers, and NSE session managers
├── tests/            # Automated test suite for API endpoints and market fetchers
├── Dockerfile        # Multi-stage production container build
├── render.yaml       # Render.com auto-deployment configuration
└── requirements.txt  # Python backend dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.11` or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/srinath9121/indian-macro-terminal.git
cd indian-macro-terminal
```

### 2. Backend Setup
```bash
# Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server (default port 8080)
python src/server.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🐳 Docker Deployment

To build and run the entire unified terminal via Docker:

```bash
# Build the Docker image
docker build -t indian-macro-terminal .

# Run the container
docker run -p 8080:8080 indian-macro-terminal
```

Access the production build at **`http://localhost:8080`**.

---

## 🧪 Running Tests

Run the test suite located in `tests/`:

```bash
# Run API endpoint sanity tests
python tests/test_api.py

# Run NSE session and fetcher tests
python tests/test_nse.py

# Run currency stress model tests
python tests/test_currency_stress.py
```

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
