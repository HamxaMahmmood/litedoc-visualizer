'use client';

import { ModelConfig } from '@/types/model';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Zap, Database, Cpu } from 'lucide-react';

interface ModelStatsProps {
  modelData: ModelConfig;
}

export default function ModelStats({ modelData }: ModelStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{modelData.compressionRatio}×</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Compression</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">{modelData.totalParams} total</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">{modelData.performanceScore}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Score</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Across 7 benchmarks</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{modelData.vramUsage}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">VRAM Usage</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Peak memory</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">{modelData.throughput}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Throughput</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Inference speed</p>
        </CardContent>
      </Card>
    </div>
  );
}