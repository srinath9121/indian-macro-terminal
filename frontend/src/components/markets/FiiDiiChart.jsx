import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function FiiDiiChart({ data = [] }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 border-[#1a3348] text-[10px] font-data">
          <p className="text-[#7a9bb5] mb-1">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className={p.value >= 0 ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
              {p.name}: {p.value >= 0 ? '+' : ''}{p.value.toLocaleString()} Cr
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass p-6 h-[400px] flex flex-col gap-4">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase">Institutional Flow History (20D)</h3>
      
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3d5a70', fontSize: 9 }}
              interval={2}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3d5a70', fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={0} stroke="#1a3348" strokeWidth={1} />
            <Bar dataKey="fii_net" name="FII" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-fii-${index}`} fill={entry.fii_net > 0 ? '#00E5FF' : '#FF3355'} fillOpacity={0.6} />
              ))}
            </Bar>
            <Bar dataKey="dii_net" name="DII" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-dii-${index}`} fill={entry.dii_net > 0 ? '#AA55FF' : '#FF3355'} fillOpacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] opacity-60" />
          <span className="text-[9px] font-heading text-[#7a9bb5]">FII FLOW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#AA55FF] opacity-60" />
          <span className="text-[9px] font-heading text-[#7a9bb5]">DII FLOW</span>
        </div>
      </div>
    </div>
  );
}
