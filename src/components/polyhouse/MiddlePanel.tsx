import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import { Box, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolyhouseConfig } from '@/types/polyhouse';
import { PolyhouseModel } from './PolyhouseModel';

interface MiddlePanelProps {
  config: PolyhouseConfig;
  onDimensionEdit?: (dimension: keyof PolyhouseConfig, value: number) => void;
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

export function MiddlePanel({ config, onDimensionEdit }: MiddlePanelProps) {
  const area = config.length * config.width;
  const volume = area * ((config.gutterHeight + config.ridgeHeight) / 2);

  return (
    <div className="h-full flex flex-col panel-middle">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Box className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">3D Visualization</h2>
            <p className="text-xs text-muted-foreground">Interactive polyhouse model</p>
          </div>
        </div>
        
        {/* Controls hint */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Move3D className="w-3.5 h-3.5" />
          <span>Drag to rotate • Scroll to zoom</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Dimensions:</span>
          <span className="text-sm font-medium font-mono">
            {config.length}m × {config.width}m × {config.ridgeHeight}m
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Area:</span>
          <span className="text-sm font-medium font-mono">{area.toFixed(0)} m²</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Volume:</span>
          <span className="text-sm font-medium font-mono">{volume.toFixed(0)} m³</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 canvas-container relative">
        <Canvas shadows>
          <Suspense fallback={<LoadingFallback />}>
            <PerspectiveCamera 
              makeDefault 
              position={[config.width * 1.5, config.ridgeHeight * 2, config.length * 1.2]} 
              fov={45}
            />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={200}
              maxPolarAngle={Math.PI / 2 - 0.1}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[50, 50, 25]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-30, 30, -25]} intensity={0.4} />
            
            {/* Environment */}
            <fog attach="fog" args={['#e8ebe8', 100, 300]} />
            
            {/* Grid */}
            <Grid
              position={[0, -0.02, 0]}
              args={[200, 200]}
              cellSize={2}
              cellThickness={0.5}
              cellColor="#9ca3af"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#6b7280"
              fadeDistance={150}
              fadeStrength={1}
            />

            {/* The Polyhouse */}
            <PolyhouseModel config={config} />
          </Suspense>
        </Canvas>

        {/* View Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" className="w-8 h-8 shadow-soft">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="w-8 h-8 shadow-soft">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="w-8 h-8 shadow-soft">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Roof Type Indicator */}
        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2">
          <span className="text-xs text-muted-foreground">Roof: </span>
          <span className="text-sm font-medium capitalize">{config.roofType.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  );
}
