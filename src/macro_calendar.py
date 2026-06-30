from datetime import datetime, timedelta
import pytz

IST = pytz.timezone('Asia/Kolkata')

def _next_thursday_expiry():
    """Compute the next Nifty expiry (last Thursday of current month)."""
    today = datetime.now(IST).date()
    # Find last Thursday of current month
    import calendar
    year, month = today.year, today.month
    last_day = calendar.monthrange(year, month)[1]
    last_date = datetime(year, month, last_day)
    # Go back to find Thursday (weekday 3)
    while last_date.weekday() != 3:
        last_date -= timedelta(days=1)
    expiry = last_date.date()
    if expiry < today:
        # Move to next month
        if month == 12:
            month, year = 1, year + 1
        else:
            month += 1
        last_day = calendar.monthrange(year, month)[1]
        last_date = datetime(year, month, last_day)
        while last_date.weekday() != 3:
            last_date -= timedelta(days=1)
        expiry = last_date.date()
    return expiry.strftime("%Y-%m-%d")

def _count_trading_days(start_date, end_date):
    """Count weekdays (Mon-Fri) between two dates, excluding start, including end."""
    count = 0
    current = start_date + timedelta(days=1)
    while current <= end_date:
        if current.weekday() < 5:  # Mon=0, Fri=4
            count += 1
        current += timedelta(days=1)
    return count

def get_upcoming_events(days=60):
    """
    Returns upcoming macro events relevant to India.
    Dates updated for 2026 H2. Nifty expiry is auto-computed.
    """
    nifty_expiry = _next_thursday_expiry()

    all_events = [
        # RBI MPC meetings 2026
        {"type": "MPC_MEETING",        "date": "2026-08-06", "label": "RBI MPC Policy Decision",      "impact": "HIGH",   "india_relevance": "Drives interest rates and banking sector liquidity."},
        {"type": "MPC_MEETING",        "date": "2026-10-07", "label": "RBI MPC Policy Decision",      "impact": "HIGH",   "india_relevance": "Drives interest rates and banking sector liquidity."},
        {"type": "MPC_MEETING",        "date": "2026-12-09", "label": "RBI MPC Policy Decision",      "impact": "HIGH",   "india_relevance": "Drives interest rates and banking sector liquidity."},
        # CPI releases (approx 12th of each month)
        {"type": "INFLATION_RELEASE",  "date": "2026-07-14", "label": "CPI Inflation Data (Jun)",     "impact": "HIGH",   "india_relevance": "Key metric for RBI rate decision targets."},
        {"type": "INFLATION_RELEASE",  "date": "2026-08-13", "label": "CPI Inflation Data (Jul)",     "impact": "HIGH",   "india_relevance": "Key metric for RBI rate decision targets."},
        {"type": "INFLATION_RELEASE",  "date": "2026-09-14", "label": "CPI Inflation Data (Aug)",     "impact": "HIGH",   "india_relevance": "Key metric for RBI rate decision targets."},
        # GDP
        {"type": "GDP_RELEASE",        "date": "2026-08-31", "label": "Quarterly GDP (Q1FY27)",       "impact": "HIGH",   "india_relevance": "Measures overall economic health and sectoral growth."},
        {"type": "GDP_RELEASE",        "date": "2026-11-28", "label": "Quarterly GDP (Q2FY27)",       "impact": "HIGH",   "india_relevance": "Measures overall economic health and sectoral growth."},
        # Nifty expiry (auto-computed for next month)
        {"type": "NIFTY_EXPIRY",       "date": nifty_expiry, "label": "Nifty Monthly Expiry",         "impact": "MEDIUM", "india_relevance": "High volatility day for derivatives settlement."},
        # US FOMC
        {"type": "US_FED_MEETING",     "date": "2026-07-29", "label": "US FOMC Rate Decision",        "impact": "HIGH",   "india_relevance": "Affects FII flows and USD/INR exchange rates."},
        {"type": "US_FED_MEETING",     "date": "2026-09-16", "label": "US FOMC Rate Decision",        "impact": "HIGH",   "india_relevance": "Affects FII flows and USD/INR exchange rates."},
        {"type": "US_FED_MEETING",     "date": "2026-11-04", "label": "US FOMC Rate Decision",        "impact": "HIGH",   "india_relevance": "Affects FII flows and USD/INR exchange rates."},
        # Union Budget
        {"type": "UNION_BUDGET",       "date": "2027-02-01", "label": "Union Budget FY2028",          "impact": "CRITICAL", "india_relevance": "Annual budget defines fiscal policy, capex, and sector priorities."},
    ]

    now = datetime.now(IST).date()
    cutoff = now + timedelta(days=days)
    upcoming = []
    for evt in all_events:
        evt_date = datetime.strptime(evt["date"], "%Y-%m-%d").date()
        if now <= evt_date <= cutoff:
            days_until = (evt_date - now).days
            trading_days = _count_trading_days(now, evt_date)
            upcoming.append({
                **evt,
                "days_until": days_until,
                "trading_days": trading_days,
                "urgency": "red" if days_until < 7 else "amber" if days_until < 14 else "green"
            })

    upcoming.sort(key=lambda x: x["date"])
    return upcoming[:8]
