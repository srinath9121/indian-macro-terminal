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

The **India Macro Terminal** bridges the gap between macroeconomic indicators (GDP forecasts, CPI inflation, RBI liquidity, FII/DII institutional flows), global geopolitical risk events (GDELT 2.0 / Goldstein conflict severity scores), and real-time Indian capital market movements (NSE indices & equities). 

Designed with an institutional **Dark Terminal** and **Light Glass** aesthetic, it offers latency-optimized telemetry, high-density analytical dashboards, and interactive 3D risk visualization tailored for analysts, hedge funds, and market participants.

---

## ✨ Key Capabilities & Dashboards

### 1. 📊 Macro Scoreboard & Pulse (`/`)
- Real-time tracking of India's **GDP Growth Forecasts**, **CPI YoY Inflation**, **RBI System Liquidity**, and **FII/DII Institutional Flow trends**.
- Automated **Market Bias computation** (Bullish / Defensive / Neutral) paired with algorithmic confidence grading.
- Live telemetry for **Nifty 50, Sensex, Bank Nifty, India VIX, Brent Crude, and USD/INR**.

### 2. 🌍 3D Geopolitical Risk Globe (`/geomap`)
- Interactive WebGL 3D globe powered by Three.js rendering **global energy transit corridors and geopolitical stress arcs** (Strait of Hormuz, Malacca, Bab-el-Mandeb, Red Sea).
- Country-level Geopolitical Tension Index (**GTI**) and Goldstein conflict severity metrics derived from live **GDELT 2.0** feeds.
- Dynamic HUD sidebars delivering immediate India macro transmission channels and sector impact alerts upon country inspection.

### 3. 📈 Multi-Asset Markets Intelligence (`/markets`)
- Real-time NSE sectoral performance heatmaps, top gainers, top losers, and volume shockers.
- 30-day historical sparkline strips across key benchmark indices.
- Institutional foreign (FII) vs. domestic (DII) flow delta comparisons.

### 4. ⚡ Adani Group Intelligence (`/adani`)
- High-frequency risk tracking across flagship group equities (*ADANIENT, ADANIPORTS, ADANIPOWER, ADANIGREEN, ATGL, AWL*).
- Anomaly detection engine monitoring cross-asset volatility divergence and rapid institutional position unwinding.

### 5. 🎯 Risk Radar & Macro Models (`/risk-radar` & `/backtest`)
- Multi-factor India Macro Stress Index (**IMSI**) aggregating FX pressure, imported commodity shock, and bond yield spreads.
- Algorithmic backtesting harness for cross-market warning systems.

### 6. 🌓 Dual Theme & Typography
- **Dark Terminal**: High-contrast obsidian slate (`#080C14`), electric cyan (`#00E5FF`), and mint emerald (`#059669`) accents.
- **Light Glass**: Frosted glassmorphism design with crisp readability for daytime trading desks.
- **Departure Mono & JetBrains Mono**: Monospace typefaces optimized for financial tickers, basis points, and numeric readouts.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   External Real-Time Feeds     │
                                  │ (yfinance, NSE, GDELT 2.0, RBI)│
                                  └───────────────┬────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FastAPI Backend Engine                                        │
│  ├── /api/market/movers         (Gainers, Losers, Volume Shockers, Index Sparklines)            │
│  ├── /api/gdelt/india-events    (Geopolitical Tension Index & Event Severity)                   │
│  ├── /api/fii-history           (Institutional FII/DII Net Inflows & Historical Trends)         │
│  ├── /api/india-risk-score      (Composite Multi-Factor India Macro Stress Index)               │
│  └── /ws/live                   (WebSocket telemetry stream for live price and pulse updates)   │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React 18 + Vite SPA Frontend                                  │
│  ├── Pulse Dashboard            (Macro Health, Impact Chains, Live Telemetry)                   │
│  ├── 3D Geo Map HUD             (Three-Globe WebGL, Country Conflict Breakdown)                 │
│  ├── Markets Dashboard          (Sector Heatmaps, Sparklines, Global Comparison)                │
│  └── Adani Intelligence         (Group Anomaly Scanner, Live Alerts)                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
indian-macro-terminal/
├── backend/          # Modular FastAPI application (routes, models, services)
├── frontend/         # React 18 + Vite client (Three.js globe, components, pages)
│   ├── public/       # Static assets, GeoJSON country boundaries, fonts
│   └── src/          # React components, custom hooks, Zustand store
├── src/              # Core production backend engine, scrapers & calculation pipelines
├── tests/            # Test suite for APIs, NSE sessions, and risk models
├── data/             # Persistent JSON configurations & reference calendars
├── Dockerfile        # Multi-stage production container build
├── render.yaml       # Blueprint configuration for Render deployment
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
# Create and activate Python virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8080)
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

Open your browser at **`http://localhost:5173`**.

---

## 🐳 Docker Deployment

To build and run the unified single-container setup (serving both frontend and backend):

```bash
# Build the Docker image
docker build -t indian-macro-terminal .

# Run container on port 8080
docker run -p 8080:8080 indian-macro-terminal
```

Access the application in your browser at **`http://localhost:8080`**.

---

## 🧪 Testing

Run backend tests using Python:

```bash
# API endpoint tests
python tests/test_api.py

# NSE session and fetcher tests
python tests/test_nse.py

# Currency stress engine tests
python tests/test_currency_stress.py
```

---

## 📜 License

This project is licensed under the **MIT License**.
