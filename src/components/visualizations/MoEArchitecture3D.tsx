'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ModelConfig } from '@/types/model';
import { Maximize2, X } from 'lucide-react';

interface TokenParticleProps {
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  delay: number;
  color: string;
}

function TokenParticle({ startPosition, targetPosition, delay, color }: TokenParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const elapsed = state.clock.elapsedTime - delay;
      if (elapsed > 0) {
        const duration = 1.5;
        const progress = (elapsed % duration) / duration;

        // Interpolate position
        const x = THREE.MathUtils.lerp(startPosition[0], targetPosition[0], progress);
        const y = THREE.MathUtils.lerp(startPosition[1], targetPosition[1], progress);
        const z = THREE.MathUtils.lerp(startPosition[2], targetPosition[2], progress);
        
        meshRef.current.position.set(x, y, z);
        meshRef.current.scale.setScalar(0.12 + Math.sin(progress * Math.PI) * 0.08);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={startPosition}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}

interface RouterNodeProps {
  position: [number, number, number];
  isActive: boolean;
}

function RouterNode({ position, isActive }: RouterNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={isActive ? 0.8 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

interface ExpertNodeProps {
  position: [number, number, number];
  isActive: boolean;
  isPruned: boolean;
  expertId: number;
  onHover: (id: number | null) => void;
}

const ExpertNode = React.memo(({ position, isActive, isPruned, expertId, onHover }: ExpertNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const color = isPruned ? '#ffffff' : isActive ? '#10b981' : '#3b82f6';
  const scale = hovered ? 1.3 : isActive ? 1.15 : 1;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={() => {
        setHovered(true);
        onHover(expertId);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={isActive ? '#10b981' : isPruned ? '#ffffff' : '#000000'}
        emissiveIntensity={isActive ? 0.6 : isPruned ? 0.3 : 0}
        metalness={0.4}
        roughness={0.3}
        opacity={isPruned ? 0.6 : 1}
        transparent={isPruned}
      />
    </mesh>
  );
});

ExpertNode.displayName = 'ExpertNode';

interface LayerProps {
  layerData: any;
  layerIndex: number;
  totalLayers: number;
  hoveredExpert: number | null;
  onHoverExpert: (id: number | null) => void;
  activeExpertIndices: number[];
  isAnimating: boolean;
  showConnections: boolean;
}

const Layer = React.memo(({ 
  layerData, 
  layerIndex, 
  totalLayers, 
  hoveredExpert, 
  onHoverExpert,
  activeExpertIndices,
  isAnimating,
  showConnections
}: LayerProps) => {
  const yPosition = (layerIndex - totalLayers / 2) * 2.5;
  const activeExperts = layerData.activeExperts;
  const radius = 2.5;

  const { experts, prunedExperts, routerConnections } = useMemo(() => {
    const totalExperts = 64;
    const angleStep = (Math.PI * 2) / totalExperts;

    const activeExpertsArray = Array.from({ length: activeExperts }).map((_, idx) => {
      const angle = idx * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      return {
        position: [x, yPosition, z] as [number, number, number],
        id: layerIndex * 100 + idx,
        isActive: activeExpertIndices.includes(idx),
        isPruned: false,
      };
    });

    const prunedCount = totalExperts - activeExperts;
    const prunedExpertsArray = Array.from({ length: prunedCount }).map((_, idx) => {
      const angle = (activeExperts + idx) * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      return {
        position: [x, yPosition, z] as [number, number, number],
        id: layerIndex * 100 + activeExperts + idx,
        isActive: false,
        isPruned: true,
      };
    });

    const connections = activeExpertIndices.map(idx => {
      if (idx < activeExpertsArray.length) {
        const expert = activeExpertsArray[idx];
        return {
          start: new THREE.Vector3(0, yPosition, 0),
          end: new THREE.Vector3(expert.position[0], expert.position[1], expert.position[2]),
          expertIdx: idx,
        };
      }
      return null;
    }).filter(Boolean);

    return { experts: activeExpertsArray, prunedExperts: prunedExpertsArray, routerConnections: connections };
  }, [activeExperts, yPosition, layerIndex, activeExpertIndices, radius]);

  return (
    <group>
      <Text
        position={[-3.5, yPosition, 0]}
        fontSize={0.22}
        color="#94a3b8"
        anchorX="right"
        anchorY="middle"
      >
        L{layerIndex}
      </Text>

      <RouterNode position={[0, yPosition, 0]} isActive={isAnimating} />

      {showConnections && isAnimating && routerConnections.map((connection: any, idx) => (
        <Line
          key={`conn-${idx}`}
          points={[connection.start, connection.end]}
          color="#fbbf24"
          lineWidth={1.5}
          opacity={0.4}
          transparent
        />
      ))}

      {experts.map((expert, idx) => (
        <ExpertNode
          key={`e-${idx}`}
          position={expert.position}
          isActive={expert.isActive}
          isPruned={expert.isPruned}
          expertId={expert.id}
          onHover={onHoverExpert}
        />
      ))}

      {prunedExperts.map((expert, idx) => (
        <ExpertNode
          key={`p-${idx}`}
          position={expert.position}
          isActive={expert.isActive}
          isPruned={expert.isPruned}
          expertId={expert.id}
          onHover={onHoverExpert}
        />
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, yPosition, 0]}>
        <ringGeometry args={[radius - 0.04, radius + 0.04, 48]} />
        <meshBasicMaterial color="#334155" opacity={0.25} transparent />
      </mesh>
    </group>
  );
});

Layer.displayName = 'Layer';

interface MoEArchitecture3DProps {
  modelData: ModelConfig;
}

export default function MoEArchitecture3D({ modelData }: MoEArchitecture3DProps) {
  const [hoveredExpert, setHoveredExpert] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentTokenLayer, setCurrentTokenLayer] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConnections, setShowConnections] = useState(true);

  const layerActiveExperts = useMemo(() => {
    return modelData.layers.map(layer => {
      const topK = 6;
      const indices: number[] = [];
      const available = Array.from({ length: layer.activeExperts }, (_, i) => i);
      
      for (let i = 0; i < topK; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        indices.push(available[randomIndex]);
        available.splice(randomIndex, 1);
      }
      
      return indices.sort((a, b) => a - b);
    });
  }, [modelData.layers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTokenLayer(prev => {
        if (prev >= modelData.layers.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [modelData.layers.length]);

  const tokenParticles = useMemo(() => {
    const particles: any[] = [];
    const totalLayers = modelData.layers.length;
    
    for (let layerIdx = 0; layerIdx <= currentTokenLayer && layerIdx < totalLayers; layerIdx++) {
      const yPosition = (layerIdx - totalLayers / 2) * 2.5;
      const activeIndices = layerActiveExperts[layerIdx];
      const radius = 2.5;
      const angleStep = (Math.PI * 2) / modelData.layers[layerIdx].activeExperts;

      // Only tokens from router to experts (removed expert to router)
      activeIndices.forEach((expertIdx, tokenIdx) => {
        const angle = expertIdx * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        particles.push({
          key: `t-r-e-${layerIdx}-${tokenIdx}`,
          startPosition: [0, yPosition, 0] as [number, number, number],
          targetPosition: [x, yPosition, z] as [number, number, number],
          delay: layerIdx * 1.6 + tokenIdx * 0.08,
          color: '#fbbf24',
        });
      });
    }

    return particles;
  }, [currentTokenLayer, modelData.layers, layerActiveExperts]);

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const canvasContent = (
    <Canvas gl={{ antialias: false, powerPreference: 'high-performance' }} dpr={[1, 1.5]}>
      <PerspectiveCamera makeDefault position={[10, 6, 10]} fov={50} />
      
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[0, 15, 0]} intensity={0.6} color="#10b981" />

      {modelData.layers.map((layer, idx) => (
        <Layer
          key={idx}
          layerData={layer}
          layerIndex={idx}
          totalLayers={modelData.layers.length}
          hoveredExpert={hoveredExpert}
          onHoverExpert={setHoveredExpert}
          activeExpertIndices={layerActiveExperts[idx]}
          isAnimating={idx <= currentTokenLayer}
          showConnections={showConnections}
        />
      ))}

      {tokenParticles.map((particle) => (
        <TokenParticle
          key={particle.key}
          startPosition={particle.startPosition}
          targetPosition={particle.targetPosition}
          delay={particle.delay}
          color={particle.color}
        />
      ))}

      <gridHelper args={[30, 30, '#334155', '#1e293b']} position={[0, -14, 0]} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        maxDistance={25}
        minDistance={6}
      />
    </Canvas>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900">
        <button
          onClick={handleExitFullscreen}
          className="absolute top-4 right-4 z-50 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 space-y-2">
          <div className="text-xs text-slate-400 mb-2 font-semibold">Controls</div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                autoRotate
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Auto Rotate: {autoRotate ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                showConnections
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Connections: {showConnections ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="absolute top-4 right-20 z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-slate-300">Inactive Expert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
              <span className="text-slate-300">Active Expert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full opacity-60" />
              <span className="text-slate-300">Pruned Expert</span>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-700 pt-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span className="text-slate-300">Router</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
              <span className="text-slate-300">Token Flow</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="text-sm font-semibold text-white mb-1">{modelData.name}</div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Total Layers: {modelData.layers.length}</div>
            <div>Experts/Layer: ~{modelData.retainedExperts}</div>
            <div>Compression: {modelData.compressionRatio}×</div>
            <div className="text-emerald-400 font-semibold border-t border-slate-700 pt-1 mt-1">
              Current Layer: {currentTokenLayer}
            </div>
          </div>
        </div>

        {hoveredExpert !== null && (
          <div className="absolute bottom-4 right-4 z-50 bg-emerald-600/90 backdrop-blur-sm rounded-lg p-3 border border-emerald-500">
            <div className="text-xs text-white font-medium">
              Expert #{hoveredExpert % 100}
            </div>
            <div className="text-xs text-emerald-100">
              Layer {Math.floor(hoveredExpert / 100)}
            </div>
          </div>
        )}

        <div className="w-full h-full">
          {canvasContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 space-y-2">
        <div className="text-xs text-slate-400 mb-2 font-semibold">3D Architecture</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              autoRotate
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Rotate: {autoRotate ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleFullscreen}
            className="px-3 py-1.5 rounded text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2 justify-center"
          >
            <Maximize2 className="w-3 h-3" />
            Fullscreen
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
        <div className="text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            <span className="text-slate-300">Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span className="text-slate-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-white rounded-full opacity-60" />
            <span className="text-slate-300">Pruned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm" />
            <span className="text-slate-300">Router</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700">
        <div className="text-xs font-semibold text-white mb-1">{modelData.name}</div>
        <div className="text-xs text-slate-400 space-y-0.5">
          <div>Layers: {modelData.layers.length}</div>
          <div>Experts: ~{modelData.retainedExperts}</div>
          <div className="text-emerald-400 font-semibold">Layer: {currentTokenLayer}</div>
        </div>
      </div>

      {hoveredExpert !== null && (
        <div className="absolute bottom-4 right-4 z-10 bg-emerald-600/90 backdrop-blur-sm rounded-lg p-2 border border-emerald-500">
          <div className="text-xs text-white font-medium">
            Expert #{hoveredExpert % 100}
          </div>
          <div className="text-xs text-emerald-100">
            Layer {Math.floor(hoveredExpert / 100)}
          </div>
        </div>
      )}

      {canvasContent}
    </div>
  );
}