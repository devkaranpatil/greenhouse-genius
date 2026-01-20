import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { PolyhouseConfig } from '@/types/polyhouse';
import * as THREE from 'three';

interface PolyhouseModelProps {
  config: PolyhouseConfig;
}

// Dimension label component
function DimensionLabel({ 
  position, 
  value, 
  unit = 'm',
}: { 
  position: [number, number, number]; 
  value: number; 
  unit?: string;
}) {
  return (
    <Html position={position} center>
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded px-2 py-1 text-xs font-mono whitespace-nowrap shadow-lg">
        <span className="text-primary font-semibold">{value.toFixed(1)}</span>
        <span className="text-muted-foreground ml-0.5">{unit}</span>
      </div>
    </Html>
  );
}

// Dimension line with arrows
function DimensionLine({
  start,
  end,
  value,
  offset = 0,
  color = '#22c55e'
}: {
  start: [number, number, number];
  end: [number, number, number];
  value: number;
  offset?: number;
  color?: string;
}) {
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + offset,
    (start[2] + end[2]) / 2
  ];

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={2}
        dashed
        dashSize={0.3}
        gapSize={0.15}
      />
      <mesh position={start}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <DimensionLabel position={midPoint} value={value} />
    </group>
  );
}

// Roll-up Side Ventilation
function SideVentilation({ 
  position, 
  length, 
  height, 
  ventType 
}: { 
  position: [number, number, number]; 
  length: number; 
  height: number;
  ventType: 'manual-rollup' | 'motorized-rollup' | 'louver';
}) {
  const rollHeight = height * 0.4;
  
  return (
    <group position={position}>
      {ventType === 'louver' ? (
        // Louver vents
        <>
          {Array.from({ length: Math.floor(height / 0.3) }).map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + 0.15 + i * 0.3, 0]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.02, length * 0.8]} />
              <meshStandardMaterial color="#d4d4d4" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Rolled curtain at top */}
          <mesh position={[0, height / 2 - rollHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, length * 0.8, 16]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
          {/* Motor for motorized version */}
          {ventType === 'motorized-rollup' && (
            <mesh position={[0, height / 2 - rollHeight / 2, length * 0.45]}>
              <boxGeometry args={[0.2, 0.2, 0.3]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
            </mesh>
          )}
          {/* Vent opening area */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.05, height - rollHeight, length * 0.8]} />
            <meshStandardMaterial color="#87ceeb" opacity={0.3} transparent />
          </mesh>
          {/* Guide rails */}
          <mesh position={[0, 0, length * 0.42]}>
            <boxGeometry args={[0.04, height, 0.04]} />
            <meshStandardMaterial color="#666666" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -length * 0.42]}>
            <boxGeometry args={[0.04, height, 0.04]} />
            <meshStandardMaterial color="#666666" metalness={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Door Component with different types
function Door({ 
  position, 
  type,
  frameMaterial 
}: { 
  position: [number, number, number]; 
  type: 'single-sliding' | 'double-sliding' | 'roll-up' | 'curtain';
  frameMaterial: { color: string; metalness: number; roughness: number };
}) {
  const doorWidth = type === 'double-sliding' ? 2.4 : 1.2;
  const doorHeight = 2.2;
  
  return (
    <group position={position}>
      {type === 'double-sliding' ? (
        <>
          {/* Double sliding doors */}
          <mesh position={[-doorWidth / 4, doorHeight / 2, 0.08]}>
            <boxGeometry args={[doorWidth / 2 - 0.05, doorHeight, 0.06]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[doorWidth / 4, doorHeight / 2, 0.08]}>
            <boxGeometry args={[doorWidth / 2 - 0.05, doorHeight, 0.06]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Glass panels */}
          <mesh position={[-doorWidth / 4, doorHeight / 2 + 0.2, 0.12]}>
            <boxGeometry args={[doorWidth / 2 - 0.2, doorHeight * 0.6, 0.02]} />
            <meshStandardMaterial color="#a8d8ea" opacity={0.4} transparent />
          </mesh>
          <mesh position={[doorWidth / 4, doorHeight / 2 + 0.2, 0.12]}>
            <boxGeometry args={[doorWidth / 2 - 0.2, doorHeight * 0.6, 0.02]} />
            <meshStandardMaterial color="#a8d8ea" opacity={0.4} transparent />
          </mesh>
        </>
      ) : type === 'roll-up' ? (
        <>
          {/* Roll-up door */}
          <mesh position={[0, doorHeight + 0.2, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, doorWidth, 16]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Open area */}
          <mesh position={[0, doorHeight / 2, 0.05]}>
            <boxGeometry args={[doorWidth, doorHeight, 0.02]} />
            <meshStandardMaterial color="#87ceeb" opacity={0.2} transparent />
          </mesh>
        </>
      ) : type === 'curtain' ? (
        <>
          {/* Curtain door */}
          <mesh position={[0, doorHeight / 2, 0.1]}>
            <boxGeometry args={[doorWidth + 0.3, doorHeight, 0.02]} />
            <meshStandardMaterial color="#f5f5f5" opacity={0.7} transparent />
          </mesh>
          {/* Curtain folds */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-doorWidth / 2 + 0.15 + i * (doorWidth / 7), doorHeight / 2, 0.12]}>
              <boxGeometry args={[0.02, doorHeight, 0.02]} />
              <meshStandardMaterial color="#e0e0e0" />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Single sliding door */}
          <mesh position={[0, doorHeight / 2, 0.1]}>
            <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
          {/* Door handle */}
          <mesh position={[doorWidth / 2 - 0.15, doorHeight / 2, 0.18]}>
            <boxGeometry args={[0.05, 0.15, 0.06]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Track */}
          <mesh position={[0, doorHeight + 0.1, 0.1]}>
            <boxGeometry args={[doorWidth + 0.5, 0.08, 0.06]} />
            <meshStandardMaterial color="#666666" metalness={0.8} />
          </mesh>
        </>
      )}
      {/* Door frame */}
      <mesh position={[0, doorHeight / 2, 0.05]}>
        <boxGeometry args={[doorWidth + 0.2, doorHeight + 0.15, 0.04]} />
        <meshStandardMaterial {...frameMaterial} />
      </mesh>
    </group>
  );
}

// Climate Control Unit
function ClimateControlUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main unit */}
      <mesh>
        <boxGeometry args={[1.5, 2, 0.8]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Vent grills */}
      <mesh position={[0, 0.5, 0.41]}>
        <boxGeometry args={[1.2, 0.6, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, -0.5, 0.41]}>
        <boxGeometry args={[1.2, 0.6, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0, 0.41]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.1, 0, 0.43]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
    </group>
  );
}

// Shade Net Structure (for shade-net type)
function ShadeNetStructure({ 
  width, 
  length, 
  height 
}: { 
  width: number; 
  length: number; 
  height: number;
}) {
  return (
    <group>
      {/* Shade net covering */}
      <mesh position={[0, height - 0.1, 0]}>
        <boxGeometry args={[width, 0.02, length]} />
        <meshStandardMaterial color="#2d5a27" opacity={0.6} transparent wireframe={false} />
      </mesh>
      {/* Net pattern overlay */}
      <mesh position={[0, height - 0.05, 0]}>
        <boxGeometry args={[width, 0.01, length]} />
        <meshStandardMaterial color="#1a3d15" opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

export function PolyhouseModel({ config }: PolyhouseModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { 
    length, width, gutterHeight, ridgeHeight, roofType, coverMaterial,
    structureMaterial, polyhouseType, sideVentilation, doorEntry
  } = config;
  
  const roofHeight = ridgeHeight - gutterHeight;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  // Get cover material properties
  const coverProps = useMemo(() => {
    switch (coverMaterial) {
      case 'uv-polyfilm':
        return { color: '#a8e6cf', opacity: 0.35, transparent: true };
      case 'shade-net':
        return { color: '#4a7c59', opacity: 0.55, transparent: true };
      case 'insect-net':
        return { color: '#d4d4d4', opacity: 0.3, transparent: true };
      default:
        return { color: '#a8e6cf', opacity: 0.35, transparent: true };
    }
  }, [coverMaterial]);

  // Get frame material based on structure type
  const frameMaterial = useMemo(() => {
    switch (structureMaterial) {
      case 'gi-steel':
        return { color: '#7a7a7a', metalness: 0.9, roughness: 0.2 };
      case 'aluminium':
        return { color: '#d4d4d4', metalness: 0.95, roughness: 0.1 };
      case 'bamboo':
        return { color: '#c4a35a', metalness: 0.1, roughness: 0.8 };
      default:
        return { color: '#4a4a4a', metalness: 0.9, roughness: 0.2 };
    }
  }, [structureMaterial]);

  // Create roof geometry
  const roofGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    switch (roofType) {
      case 'flat': {
        // Slight slope for drainage
        shape.moveTo(-halfWidth, 0);
        shape.lineTo(-halfWidth, roofHeight * 0.1);
        shape.lineTo(halfWidth, roofHeight * 0.1);
        shape.lineTo(halfWidth, 0);
        shape.closePath();
        break;
      }
      case 'gable': {
        shape.moveTo(-halfWidth, 0);
        shape.lineTo(0, roofHeight);
        shape.lineTo(halfWidth, 0);
        shape.closePath();
        break;
      }
      case 'gothic': {
        const segments = 20;
        shape.moveTo(-halfWidth, 0);
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const x = -halfWidth + width * t;
          const y = roofHeight * Math.sin(Math.PI * t);
          shape.lineTo(x, y);
        }
        shape.closePath();
        break;
      }
      default: {
        shape.moveTo(-halfWidth, 0);
        shape.lineTo(0, roofHeight);
        shape.lineTo(halfWidth, 0);
        shape.closePath();
      }
    }
    
    const extrudeSettings = {
      depth: length,
      bevelEnabled: false,
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [roofType, halfWidth, roofHeight, width, length]);

  // End wall geometry
  const endWallGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-halfWidth, 0);
    shape.lineTo(-halfWidth, gutterHeight);
    
    if (roofType === 'flat') {
      shape.lineTo(halfWidth, gutterHeight + roofHeight * 0.1);
    } else if (roofType === 'gable') {
      shape.lineTo(0, ridgeHeight);
      shape.lineTo(halfWidth, gutterHeight);
    } else {
      // Gothic - approximate arc
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = -halfWidth + width * t;
        const y = gutterHeight + roofHeight * Math.sin(Math.PI * t);
        shape.lineTo(x, y);
      }
    }
    
    shape.lineTo(halfWidth, 0);
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, [roofType, halfWidth, gutterHeight, ridgeHeight, roofHeight, width]);

  // Gentle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.03;
    }
  });

  // Calculate post positions
  const postSpacing = 4;
  const numSidePosts = Math.max(2, Math.floor(length / postSpacing) + 1);

  // Is bamboo structure
  const isBamboo = structureMaterial === 'bamboo';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ground/Foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[width + 10, length + 10]} />
        <meshStandardMaterial color="#6b5b47" roughness={0.9} />
      </mesh>
      
      {/* Concrete foundation border */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[width + 0.4, 0.15, length + 0.4]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[width - 0.2, 0.2, length - 0.2]} />
        <meshStandardMaterial color="#6b5b47" roughness={0.9} />
      </mesh>

      {/* Dimension Lines */}
      <group>
        <DimensionLine
          start={[-halfWidth - 3, 0.5, -halfLength]}
          end={[-halfWidth - 3, 0.5, halfLength]}
          value={length}
          color="#22c55e"
        />
        <DimensionLine
          start={[-halfWidth, 0.5, halfLength + 3]}
          end={[halfWidth, 0.5, halfLength + 3]}
          value={width}
          color="#3b82f6"
        />
        <DimensionLine
          start={[halfWidth + 2, 0, halfLength + 2]}
          end={[halfWidth + 2, gutterHeight, halfLength + 2]}
          value={gutterHeight}
          color="#f59e0b"
        />
        <DimensionLine
          start={[halfWidth + 4, 0, halfLength + 2]}
          end={[halfWidth + 4, ridgeHeight, halfLength + 2]}
          value={ridgeHeight}
          color="#ef4444"
        />
      </group>

      {/* Main Structure */}
      <group>
        {/* Corner posts */}
        {[
          [-halfWidth, -halfLength],
          [halfWidth, -halfLength],
          [-halfWidth, halfLength],
          [halfWidth, halfLength],
        ].map(([x, z], i) => (
          <mesh key={`corner-${i}`} position={[x, gutterHeight / 2, z]} castShadow>
            <cylinderGeometry args={[isBamboo ? 0.05 : 0.08, isBamboo ? 0.06 : 0.08, gutterHeight, isBamboo ? 8 : 12]} />
            <meshStandardMaterial {...frameMaterial} />
          </mesh>
        ))}

        {/* Side posts along length */}
        {Array.from({ length: numSidePosts }).map((_, i) => {
          const z = -halfLength + (i * length) / (numSidePosts - 1);
          if (i === 0 || i === numSidePosts - 1) return null;
          return (
            <group key={`side-posts-${i}`}>
              <mesh position={[-halfWidth, gutterHeight / 2, z]} castShadow>
                <cylinderGeometry args={[isBamboo ? 0.04 : 0.06, isBamboo ? 0.05 : 0.06, gutterHeight, 8]} />
                <meshStandardMaterial {...frameMaterial} />
              </mesh>
              <mesh position={[halfWidth, gutterHeight / 2, z]} castShadow>
                <cylinderGeometry args={[isBamboo ? 0.04 : 0.06, isBamboo ? 0.05 : 0.06, gutterHeight, 8]} />
                <meshStandardMaterial {...frameMaterial} />
              </mesh>
            </group>
          );
        })}

        {/* Top horizontal beams */}
        <mesh position={[-halfWidth, gutterHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[isBamboo ? 0.04 : 0.05, isBamboo ? 0.04 : 0.05, length, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        <mesh position={[halfWidth, gutterHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[isBamboo ? 0.04 : 0.05, isBamboo ? 0.04 : 0.05, length, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        
        {/* Ridge beam (for gable and gothic) */}
        {(roofType === 'gable' || roofType === 'gothic') && (
          <mesh position={[0, ridgeHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[isBamboo ? 0.05 : 0.06, isBamboo ? 0.05 : 0.06, length, 8]} />
            <meshStandardMaterial {...frameMaterial} />
          </mesh>
        )}

        {/* Cross beams at ends */}
        <mesh position={[0, gutterHeight, -halfLength]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[isBamboo ? 0.04 : 0.05, isBamboo ? 0.04 : 0.05, width, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        <mesh position={[0, gutterHeight, halfLength]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[isBamboo ? 0.04 : 0.05, isBamboo ? 0.04 : 0.05, width, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>

        {/* Roof trusses/rafters */}
        {Array.from({ length: numSidePosts }).map((_, i) => {
          const z = -halfLength + (i * length) / (numSidePosts - 1);
          if (roofType === 'gable') {
            return (
              <group key={`truss-${i}`}>
                <Line
                  points={[
                    [-halfWidth, gutterHeight, z],
                    [0, ridgeHeight, z],
                  ]}
                  color={frameMaterial.color}
                  lineWidth={3}
                />
                <Line
                  points={[
                    [halfWidth, gutterHeight, z],
                    [0, ridgeHeight, z],
                  ]}
                  color={frameMaterial.color}
                  lineWidth={3}
                />
              </group>
            );
          }
          return null;
        })}

        {/* Side walls (cover material) - only for non-shade-net types */}
        {polyhouseType !== 'shade-net' && (
          <>
            <mesh position={[-halfWidth - 0.01, gutterHeight / 2, 0]}>
              <boxGeometry args={[0.02, gutterHeight, length]} />
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[halfWidth + 0.01, gutterHeight / 2, 0]}>
              <boxGeometry args={[0.02, gutterHeight, length]} />
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* Shade net covering for shade-net type */}
        {polyhouseType === 'shade-net' && (
          <ShadeNetStructure width={width} length={length} height={ridgeHeight} />
        )}

        {/* End walls */}
        {polyhouseType !== 'shade-net' && (
          <>
            <mesh geometry={endWallGeometry} position={[0, 0, -halfLength - 0.01]}>
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={endWallGeometry} position={[0, 0, halfLength + 0.01]} rotation={[0, Math.PI, 0]}>
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* Roof cover - only for non-shade-net types */}
        {polyhouseType !== 'shade-net' && (
          <mesh 
            geometry={roofGeometry} 
            position={[0, gutterHeight, -halfLength]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Gutters */}
        <mesh position={[-halfWidth - 0.15, gutterHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, length, 8, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[halfWidth + 0.15, gutterHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, length, 8, 1, true, Math.PI, Math.PI]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Side Ventilation */}
      {sideVentilation !== 'none' && (
        <>
          <SideVentilation 
            position={[-halfWidth - 0.1, gutterHeight * 0.5, 0]} 
            length={length} 
            height={gutterHeight * 0.5}
            ventType={sideVentilation}
          />
          <SideVentilation 
            position={[halfWidth + 0.1, gutterHeight * 0.5, 0]} 
            length={length} 
            height={gutterHeight * 0.5}
            ventType={sideVentilation}
          />
        </>
      )}

      {/* Climate Control Units (for climate controlled) */}
      {polyhouseType === 'climate-controlled' && (
        <>
          <ClimateControlUnit position={[-halfWidth + 2, 1, -halfLength + 1.5]} />
          <ClimateControlUnit position={[halfWidth - 2, 1, -halfLength + 1.5]} />
        </>
      )}

      {/* Interior elements */}
      <group>
        {/* Growing beds/rows */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = -halfWidth * 0.7 + i * (width * 0.7 / 3);
          return (
            <mesh key={`bed-${i}`} position={[x, 0.15, 0]} receiveShadow>
              <boxGeometry args={[width * 0.15, 0.3, length * 0.85]} />
              <meshStandardMaterial color="#3d2817" roughness={0.95} />
            </mesh>
          );
        })}

        {/* Plants */}
        {Array.from({ length: 4 }).map((_, row) => 
          Array.from({ length: Math.floor(length / 2.5) }).map((_, col) => {
            const x = -halfWidth * 0.7 + row * (width * 0.7 / 3);
            const z = -halfLength * 0.8 + col * 2.5;
            const plantHeight = 0.3 + Math.random() * 0.4;
            return (
              <group key={`plant-${row}-${col}`} position={[x, 0.3, z]}>
                <mesh position={[0, plantHeight / 2, 0]}>
                  <cylinderGeometry args={[0.02, 0.03, plantHeight, 6]} />
                  <meshStandardMaterial color="#228b22" roughness={0.8} />
                </mesh>
                <mesh position={[0, plantHeight, 0]}>
                  <sphereGeometry args={[0.25 + Math.random() * 0.15, 8, 6]} />
                  <meshStandardMaterial color="#32cd32" roughness={0.9} />
                </mesh>
              </group>
            );
          })
        )}

        {/* Irrigation lines */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = -halfWidth * 0.7 + i * (width * 0.7 / 3);
          return (
            <mesh key={`irrigation-${i}`} position={[x, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, length * 0.85, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
          );
        })}
      </group>

      {/* Entry Door */}
      <Door 
        position={[0, 0, halfLength]} 
        type={doorEntry}
        frameMaterial={frameMaterial}
      />

      {/* Polyhouse Type Label */}
      <Html position={[0, ridgeHeight + 2, 0]} center>
        <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg capitalize whitespace-nowrap">
          {polyhouseType.replace(/-/g, ' ')}
        </div>
      </Html>

      {/* Material indicator */}
      <Html position={[-halfWidth - 1, gutterHeight + 1, 0]} center>
        <div className="bg-muted/90 text-foreground px-2 py-1 rounded text-[10px] font-medium shadow whitespace-nowrap">
          {structureMaterial === 'gi-steel' ? 'GI Steel' : 
           structureMaterial === 'aluminium' ? 'Aluminium' : 'Bamboo'} Frame
        </div>
      </Html>
    </group>
  );
}
