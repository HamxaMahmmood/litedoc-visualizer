'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ModelConfig } from '@/types/model';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoERoutingFlowProps {
  modelData: ModelConfig;
}

export default function MoERoutingFlow({ modelData }: MoERoutingFlowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [activeExperts, setActiveExperts] = useState<Set<number>>(new Set());
  const [tokenPositions, setTokenPositions] = useState<number[]>([]);

  const topK = 6; // DeepSeek-VL2 uses top-6 routing

  // Generate random expert activations for visualization
  const generateExpertActivation = (layerData: any) => {
    const experts = new Set<number>();
    while (experts.size < topK) {
      experts.add(Math.floor(Math.random() * layerData.activeExperts));
    }
    return experts;
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentLayer((prev) => {
          if (prev >= modelData.layers.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isPlaying, modelData.layers.length]);

  useEffect(() => {
    if (currentLayer < modelData.layers.length) {
      setActiveExperts(generateExpertActivation(modelData.layers[currentLayer]));
      
      // Generate token positions
      const positions = Array.from({ length: topK }, () => Math.random());
      setTokenPositions(positions);
    }
  }, [currentLayer, modelData.layers]);

  const handleReset = () => {
    setCurrentLayer(0);
    setIsPlaying(false);
    setActiveExperts(new Set());
  };

  const currentLayerData = modelData.layers[currentLayer];

  // Calculate expert grid dimensions
  const expertsPerRow = 8;
  const totalRows = Math.ceil(currentLayerData?.activeExperts / expertsPerRow);

  return (
    <div className="w-full space-y-6">
      {/* Control Panel */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="default"
            size="lg"
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Inference
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-slate-600 dark:text-slate-400">
              Layer: <span className="font-bold text-slate-900 dark:text-white">{currentLayer + 1}</span> / {modelData.layers.length}
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Active Experts: <span className="font-bold text-emerald-600">{topK}</span> / {currentLayerData?.activeExperts}
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        
        {/* Layer Label */}
        <div className="absolute top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-lg">
          MoE Layer {currentLayer}
        </div>

        {/* Stats Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div className="text-slate-600 dark:text-slate-400">
            Pruned: <span className="font-bold text-red-600">{currentLayerData?.prunedExperts}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Retained: <span className="font-bold text-emerald-600">{currentLayerData?.activeExperts}</span>
          </div>
        </div>

        {/* Token Input Visualization */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg">
              Input Token Stream
            </div>
            
            {/* Animated flow lines to experts */}
            {isPlaying && Array.from(activeExperts).map((expertId, idx) => {
              const expertRow = Math.floor(expertId / expertsPerRow);
              const expertCol = expertId % expertsPerRow;
              
              return (
                <svg
                  key={expertId}
                  className="absolute top-full left-1/2 pointer-events-none"
                  style={{
                    width: '400px',
                    height: '150px',
                    marginLeft: '-200px',
                  }}
                >
                  <path
                    d={`M 200 0 Q 200 75 ${(expertCol - 3.5) * 60 + 200} 150`}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-dash"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              );
            })}
          </div>
        </div>

        {/* Expert Grid */}
        <div className="mt-20">
          <div 
            className="grid gap-3 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${expertsPerRow}, minmax(0, 1fr))`,
              maxWidth: `${expertsPerRow * 70}px`
            }}
          >
            {Array.from({ length: currentLayerData?.activeExperts || 0 }).map((_, idx) => {
              const isActive = activeExperts.has(idx);
              const isPruned = idx >= currentLayerData?.activeExperts;

              return (
                <div
                  key={idx}
                  className={`
                    relative aspect-square rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-xs font-bold
                    ${
                      isPruned
                        ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 opacity-30'
                        : isActive
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/50 scale-110'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-emerald-400 animate-ping opacity-20" />
                  )}
                  <span className={isActive ? 'text-white z-10' : 'text-slate-600 dark:text-slate-400'}>
                    E{idx}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pruned Experts Indicator */}
          {currentLayerData && currentLayerData.prunedExperts > 0 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                {currentLayerData.prunedExperts} experts pruned (not shown)
              </div>
            </div>
          )}
        </div>

        {/* Output Aggregation */}
        <div className="mt-8 flex justify-center">
          <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold shadow-lg">
            Aggregated Output → Layer {currentLayer + 1}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded border-2 border-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Active Expert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white dark:bg-slate-800 rounded border-2 border-slate-300 dark:border-slate-600" />
          <span className="text-slate-600 dark:text-slate-400">Inactive Expert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded border-2 border-slate-300 dark:border-slate-600 opacity-30" />
          <span className="text-slate-600 dark:text-slate-400">Pruned Expert</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
        .animate-dash {
          animation: dash 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}