import { useState, useEffect } from 'react';

// ────── FETCH REAL DATA ──────
const fetchLegalData = async (symbol) => {
  try {
    const resp = await fetch(`/warning/api/legal/${symbol}`);
    if (!resp.ok) throw new Error('API error');
    const d = await resp.json();
    const filings = d.filings || [];
    const usLegal = filings.filter(f => f.source === 'CourtListener').map(f => ({ ...f, isNew: f.days_ago < 30 }));
    const sebi = filings.filter(f => f.source === 'SEBI').map(f => ({ ...f, isNew: f.days_ago < 30 }));
    const pib = filings.filter(f => f.source === 'PIB').map(f => ({ ...f, type: 'Notice', isNew: true }));
    return { usLegal, sebi, pib, supremeCourt: [], legalScore: d.legal_score || {} };
  } catch (e) {
    console.warn('LegalTab fetch error:', e);
    return { usLegal: [], sebi: [], pib: [], supremeCourt: [], legalScore: {} };
  }
};

const LegalSection = ({ title, data, type }) => {
  const hasData = data && data.length > 0;
  const hasNew = hasData && data.some(d => d.isNew);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px', borderBottom: '1px solid #E5E7EB', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '0.05em' }}>
          {title}
        </div>
        {hasNew ? (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '4px 10px', borderRadius: 4 }}>
            FILING DETECTED
          </div>
        ) : (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: 4 }}>
            MONITORING ACTIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {!hasData ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 16, borderRadius: 6, color: '#16A34A', fontSize: 13, fontWeight: 600 }}>
            CLEAR - No active proceedings found in this jurisdiction.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '0 0 8px 0', color: '#6B7280', fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0 0 8px 0', color: '#6B7280', fontWeight: 600 }}>Court / Agency</th>
                <th style={{ textAlign: 'left', padding: '0 0 8px 0', color: '#6B7280', fontWeight: 600 }}>Case Title</th>
                <th style={{ textAlign: 'left', padding: '0 0 8px 0', color: '#6B7280', fontWeight: 600 }}>Docket / Type</th>
                <th style={{ textAlign: 'left', padding: '0 0 8px 0', color: '#6B7280', fontWeight: 600 }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const rowColor = type === 'pib' 
                  ? (row.type === 'Positive' ? '#EFF6FF' : '#FEF2F2') 
                  : (row.isNew ? '#FEF2F2' : '#F9FAFB');
                
                const textColor = type === 'pib'
                  ? (row.type === 'Positive' ? '#1D4ED8' : '#B91C1C')
                  : (row.isNew ? '#B91C1C' : '#4B5563');

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #E5E7EB', background: rowColor }}>
                    <td style={{ padding: '12px 8px', color: textColor, fontWeight: row.isNew ? 600 : 400 }}>{row.date}</td>
                    <td style={{ padding: '12px 8px', color: textColor }}>{row.court}</td>
                    <td style={{ padding: '12px 8px', color: textColor, fontWeight: row.isNew ? 600 : 400 }}>{row.title}</td>
                    <td style={{ padding: '12px 8px', color: textColor }}>{row.type || row.status}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <a href={row.link} style={{ color: '#2563EB', textDecoration: 'none' }}>View →</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default function LegalTab({ symbol }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchLegalData(symbol).then(setData);
  }, [symbol]);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading legal data...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#111827' }}>
        Automated Legal & Regulatory Radar
      </div>
      
      <LegalSection title="US DEPARTMENT OF JUSTICE / SEC" data={data.usLegal} type="us" />
      <LegalSection title="SEBI ENFORCEMENT" data={data.sebi} type="sebi" />
      <LegalSection title="PIB GOVERNMENT NOTICES" data={data.pib} type="pib" />
      <LegalSection title="SUPREME COURT OF INDIA" data={data.supremeCourt} type="sci" />

      <div style={{ marginTop: 32, padding: 20, background: '#F3F4F6', borderRadius: 8, fontSize: 11, color: '#6B7280', fontStyle: 'italic', lineHeight: 1.5 }}>
        <strong>DISCLAIMER:</strong> Legal monitoring is automated by parsing CourtListener, SEBI, and PIB APIs. 
        It may experience delays or miss filings entirely. Always verify legal statuses directly with 
        CourtListener.com and SEBI.gov.in. Not legal advice.
      </div>
    </div>
  );
}
