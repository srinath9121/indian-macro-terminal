import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';

export default function IndexSparklineStrip({ data = {} }) {
  const indices = [
    { id: 'NIFTY', label: 'NIFTY 50' },
    { id: 'SENSEX', label: 'SENSEX' },
    { id: 'BANKNIFTY', label: 'BANK NIFTY' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {indices.map((idx) => {
        const series = data[idx.id] || [];
        const lastVal = series.length > 0 ? series[series.length - 1].value : 0;
        const firstVal = series.length > 0 ? series[0].value : 0;
        const change = lastVal - firstVal;
        const pChange = firstVal !== 0 ? (change / firstVal) * 100 : 0;
        const isUp = change >= 0;

        return (
          <div key={idx.id} className="glass p-4 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-heading text-[#7a9bb5] tracking-widest">{idx.label}</span>
              <span className="text-xl font-data font-bold text-[#e8f4f8]">{lastVal.toLocaleString()}</span>
              <span className={`text-[11px] font-data ${isUp ? 'text-[#00ff88]' : 'text-[#ff3355]'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(pChange).toFixed(2)}%
              </span>
            </div>
            
            <div className="w-32 h-16 opacity-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id={`gradient-${idx.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isUp ? '#00ff88' : '#ff3355'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isUp ? '#00ff88' : '#ff3355'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isUp ? '#00ff88' : '#ff3355'} 
                    fillOpacity={1} 
                    fill={`url(#gradient-${idx.id})`} 
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
