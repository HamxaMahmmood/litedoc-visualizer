'use client';

import { ModelConfig } from '@/types/model';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpertRetentionChartProps {
  modelData: ModelConfig;
}

export default function ExpertRetentionChart({ modelData }: ExpertRetentionChartProps) {
  const chartData = modelData.layers.map((layer) => ({
    layer: `L${layer.layerId}`,
    retained: layer.activeExperts,
    pruned: layer.prunedExperts,
  }));

  return (
    <div className="w-full h-80 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Layer-wise Expert Retention
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
          <XAxis 
            dataKey="layer" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="retained" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="pruned" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded" />
          <span className="text-slate-600 dark:text-slate-400">Retained</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-slate-600 dark:text-slate-400">Pruned</span>
        </div>
      </div>
    </div>
  );
}