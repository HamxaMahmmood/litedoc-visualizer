import { create } from 'zustand';
import { PruningLevel, ModelConfig } from '@/types/model';

interface VisualizationStore {
  selectedLevel: PruningLevel;
  modelData: Record<PruningLevel, ModelConfig | null>;
  setSelectedLevel: (level: PruningLevel) => void;
  loadModelData: (level: PruningLevel, data: ModelConfig) => void;
}

export const useVisualizationStore = create<VisualizationStore>((set) => ({
  selectedLevel: '0%',
  modelData: {
    '0%': null,
    '40%': null,
    '80%': null,
  },
  setSelectedLevel: (level) => set({ selectedLevel: level }),
  loadModelData: (level, data) =>
    set((state) => ({
      modelData: { ...state.modelData, [level]: data },
    })),
}));