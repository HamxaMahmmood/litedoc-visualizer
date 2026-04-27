export interface LayerStats {
  layerId: number;
  totalExperts: number;
  activeExperts: number;
  prunedExperts: number;
  avgTokensPerExpert: number;
}

export interface ModelConfig {
  name: string;
  pruningRate: number;
  totalParams: string;
  compressionRatio: number;
  retainedExperts: number;
  performanceScore: number;
  vramUsage: string;
  throughput: string;
  layers: LayerStats[];
}

export interface TokenRoute {
  tokenId: number;
  layerId: number;
  expertId: number;
  gatingScore: number;
}

export type PruningLevel = '0%' | '40%' | '80%';