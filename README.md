# LiteDoc Visualization

An interactive 3D visualization tool for exploring Mixture-of-Experts (MoE) architecture compression and expert pruning in Vision-Language Models, specifically showcasing the LiteDoc compression pipeline applied to DeepSeek-VL2 Tiny.

![LiteDoc Visualization](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![Three.js](https://img.shields.io/badge/Three.js-Powered-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 📄 Research Paper

This visualization accompanies our research paper:

**LiteDoc: Distilling Large Document Models into Efficient Task-Specific Encoders**  
*Submitted to ICDAR 2026*

The paper presents a two-stage compression pipeline for optimizing large MoE-based Vision-Language Models for Document Understanding tasks through CKA-based expert pruning and Sparse-to-Sparse knowledge distillation.

## 🎯 Overview

LiteDoc Visualization provides an interactive way to understand how expert pruning affects the Mixture-of-Experts architecture across three compression levels:

- **Baseline (0% Pruned)**: Full DeepSeek-VL2 Tiny model with 64 experts per layer (3.37B parameters)
- **40% Pruned (LiteDoc-60)**: ~38 experts per layer (2.4B parameters, 1.4× compression)
- **80% Pruned (LiteDoc-20)**: ~13 experts per layer (1.4B parameters, 2.4× compression)

## ✨ Features

### 🎨 Interactive 3D Visualization
- **Real-time token routing animation** showing inference flow through MoE layers
- **Random expert activation** demonstrating top-6 routing mechanism
- **Router visualization** with octahedral nodes at each layer center
- **Color-coded experts**:
  - 🔵 Blue: Inactive experts
  - 🟢 Green: Active experts (top-6 routing)
  - ⚪ White: Pruned experts
  - 🟡 Yellow: Router nodes

### 📊 Performance Analytics
- **Model statistics dashboard** showing:
  - Compression ratio
  - Average performance score
  - VRAM usage
  - Inference throughput
- **Layer-wise expert retention charts**
- **Interactive comparison** across pruning levels

### 🎮 Interactive Controls
- **Auto-rotation toggle** for hands-free viewing
- **Fullscreen mode** for detailed exploration
- **Connection toggle** to show/hide routing paths
- **Hover tooltips** displaying expert and layer information
- **Orbit controls** (drag to rotate, scroll to zoom)

### ⚡ Performance Optimized
- Reduced polygon count for smooth 60 FPS rendering
- Memoized React components
- Optimized lighting and materials
- Efficient particle system for token animation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HamxaMahmmood/litedoc-visualizer.git
cd litedoc-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

litedoc-visualizer/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── visualizations/
│   │   │   ├── MoEArchitecture3D.tsx      # 3D architecture viewer
│   │   │   ├── MoERoutingFlow.tsx         # 2D routing simulation
│   │   │   ├── ModelStats.tsx             # Performance metrics
│   │   │   └── ExpertRetentionChart.tsx   # Bar chart visualization
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   └── store.ts              # Zustand state management
│   └── types/
│       └── model.ts              # TypeScript interfaces
├── public/
│   └── data/
│       ├── baseline.json         # 0% pruned model data
│       ├── pruned40.json         # 40% pruned model data
│       └── pruned80.json         # 80% pruned model data
└── package.json

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **3D Helpers**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📊 Architecture Details

### MoE Layer Structure

Each layer in the visualization contains:
- **1 Router Node** (central octahedron) - Routes tokens to experts
- **64 Total Expert Slots** - Arranged in a circle
  - Active experts (retained after pruning)
  - Pruned experts (removed during compression)
- **Top-6 Routing** - Each token activates 6 experts
- **Token Flow Animation** - Shows inference progression

### Pruning Strategy

The visualization demonstrates our CKA-based expert pruning approach:

1. **Centered Kernel Alignment (CKA)** - Measures functional similarity between experts
2. **Graph-based Selection** - Identifies redundant experts via similarity clustering
3. **Activation Frequency** - Retains most-utilized experts within each cluster
4. **Routing Coherence** - Redirects pruned expert traffic to CKA-nearest neighbors

## 🎓 Key Research Contributions

1. **Task-Aware Expert Pruning** - First systematic study of expert utilization in VLMs for document understanding
2. **CKA-based Redundancy Detection** - Robust, permutation-invariant metric for identifying functionally redundant experts
3. **Sparse-to-Sparse (S2S) Distillation** - Novel compression framework combining pruning with multi-level knowledge distillation
4. **Aggressive Compression** - Achieves 80% expert pruning while retaining 89.6% of teacher performance

## 📈 Performance Results

| Model | Parameters | Compression | Avg Score | VRAM | Throughput |
|-------|-----------|-------------|-----------|------|------------|
| Baseline | 3.37B | 1.0× | 85.48 | 12.3 GB | 47.2 tok/s |
| LiteDoc-60 (40%) | 2.4B | 1.4× | 81.2 | 9.8 GB | 58.1 tok/s |
| LiteDoc-20 (80%) | 1.4B | 2.4× | 76.7 | 7.4 GB | 71.6 tok/s |

## 🎮 Usage Guide

### Navigation
- **Switch Models**: Use the tabs at the top (Baseline, 40% Pruned, 80% Pruned)
- **Rotate View**: Click and drag on the 3D model
- **Zoom**: Scroll wheel to zoom in/out
- **Auto-Rotate**: Toggle automatic rotation
- **Fullscreen**: Click the purple fullscreen button for immersive viewing

### Understanding the Visualization

1. **Token Flow**: Yellow particles show tokens being routed from the router to active experts
2. **Active Experts**: Green spheres indicate experts currently processing tokens (top-6 routing)
3. **Pruned Experts**: White semi-transparent spheres show removed experts
4. **Layer Progress**: Watch the animation progress through all 11 layers automatically

### 2D Routing Simulation

The right panel shows a simplified 2D view:
- **Play/Pause**: Control the inference simulation
- **Layer Progression**: Shows which layer is currently processing
- **Expert Grid**: Visual representation of expert activation patterns

## 🔬 Benchmarks

The models were evaluated on 7 standard document understanding benchmarks:

- **KIE Tasks**: CORD, SROIE, FUNSD
- **VQA Tasks**: DocVQA, InfoVQA
- **Table QA**: WikiTableQuestions (WTQ)
- **Classification**: RVL-CDIP

## 🚀 Deployment


### Build for Production

```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request








**Note**: This visualization tool is part of ongoing research. The paper is currently under review for ICDAR 2026.

