// Static placeholder values — wire to your live quotes endpoint.
const TICKERS = [
  { dot: '#4F46E5', label: 'N', name: 'NIFTY 50', value: '24,832.10', change: '+0.62%', up: true },
  { dot: '#16A34A', label: 'S', name: 'SENSEX', value: '81,559.40', change: '+0.58%', up: true },
  { dot: '#F97316', label: 'B', name: 'BANK NIFTY', value: '52,104.85', change: '-0.21%', up: false },
  { dot: '#EC4899', label: 'V', name: 'INDIA VIX', value: '14.82', change: '-3.10%', up: false },
  { dot: '#0EA5E9', label: '$', name: 'USD/INR', value: '83.24', change: '+0.18%', up: true },
  { dot: '#8B5CF6', label: 'O', name: 'BRENT CRUDE', value: '$85.12', change: '+1.49%', up: true },
];
 
export default function Ticker() {
  return (
    <div className="ticker">
      {TICKERS.map((t, i) => (
        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <div className="tick-item">
            <div className="tick-dot" style={{ background: t.dot }}>{t.label}</div>
            <span className="tick-name">{t.name}</span>
            <span className="tick-val num">{t.value}</span>
            <span className={'tick-chg num ' + (t.up ? 'up' : 'down')}>{t.change}</span>
          </div>
          {i < TICKERS.length - 1 && <div className="tick-sep" />}
        </div>
      ))}
    </div>
  );
}
