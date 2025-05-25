import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DataPoint } from '../types';
import { Card } from './common/Card';

interface PlotDisplayProps {
  title: string;
  data: DataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  lineColor?: string;
  isLoading?: boolean;
  referenceLines?: Array<{ x?: number; y?: number; label?: string; stroke?: string }>;
  yDomain?: [number | 'auto', number | 'auto'];
}

export const PlotDisplay: React.FC<PlotDisplayProps> = ({
  title,
  data,
  xAxisLabel,
  yAxisLabel,
  lineColor = '#8884d8',
  isLoading = false,
  referenceLines = [],
  yDomain = ['auto', 'auto'],
}) => {
  if (isLoading) {
    return (
      <Card title={title} className="h-96 flex items-center justify-center">
        <p className="text-slate-400">正在生成圖表...</p>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title={title} className="h-96 flex items-center justify-center">
        <p className="text-slate-400">無數據可顯示。</p>
      </Card>
    );
  }
  
  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.01 && num !== 0) return num.toExponential(1);
    return Math.round(num * 100) / 100;
  }


  return (
    <Card title={title} className="h-96"> {/* Ensure Card has defined height for ResponsiveContainer */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="x" 
            label={{ value: xAxisLabel, position: 'insideBottomRight', offset: -15, fill: '#94a3b8' }} 
            stroke="#94a3b8"
            tickFormatter={formatNumber}
          />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: 40 }} 
            stroke="#94a3b8"
            domain={yDomain}
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#cbd5e1' }}
            itemStyle={{ color: lineColor }}
            formatter={(value: number) => formatNumber(value)}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="y" stroke={lineColor} strokeWidth={2} dot={false} name={yAxisLabel || '值'} />
          {referenceLines.map((line, index) => (
             line.x !== undefined ? 
             <ReferenceLine key={`ref-x-${index}`} x={line.x} stroke={line.stroke || "red"} strokeDasharray="3 3" label={{ value: line.label, fill: line.stroke || 'red', position: 'insideTopRight' }} /> :
             line.y !== undefined ?
             <ReferenceLine key={`ref-y-${index}`} y={line.y} stroke={line.stroke || "red"} strokeDasharray="3 3" label={{ value: line.label, fill: line.stroke || 'red', position: 'insideTopRight' }} /> :
             null
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
