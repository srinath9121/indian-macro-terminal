import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function GlobalComparisonChart({ data = [] }) {
  const colors = ['#00FF88', '#00AAFF', '#FF3355', '#FFAA00'];

  return (
    <div className="glass p-6 h-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase">Relative Performance (30D)</h3>
        <span className="text-[9px] font-data text-[#3d5a70]">INDEXED TO 100</span>
      </div>
      
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3348" opacity={0.15} vertical={false} />
            <XAxis 
              dataKey="date" 
              allowDuplicatedCategory={false}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3d5a70', fontSize: 9 }}
              interval={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3d5a70', fontSize: 9 }}
              domain={['auto', 'auto']}
              unit="%"
            />
            <Tooltip 
              contentStyle={{ background: 'rgba(13, 30, 46, 0.95)', border: '1px solid #1a3348', borderRadius: '4px', fontSize: '10px', fontFamily: 'IBM Plex Mono' }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '9px', fontFamily: 'Space Mono', paddingTop: '10px' }}
              iconType="circle"
            />
            {data.map((series, idx) => (
              <Line 
                key={series.name}
                data={series.points}
                type="monotone"
                dataKey="value"
                name={series.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1 }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
