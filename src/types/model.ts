export interface ExpertStats {
  expertId: number;
  tokenCount: number;
  activationFrequency: number;
  isPruned: boolean;
}

export interface LayerStats {
  layerId: number;
  totalExperts: number;
  activeExperts: number;
  prunedExperts: number;
  experts: ExpertStats[];
}

export interface ModelConfig {
  name: string;
  pruningRate: number;
  totalParams: string;
  compressionRatio: number;
  layers: LayerStats[];
  ckaMatrix?: number[][];
}

export interface RoutingPath {
  tokenId: number;
  layerId: number;
  selectedExperts: number[];
  gatingScores: number[];
}

export type PruningLevel = '0%' | '40%' | '80%';