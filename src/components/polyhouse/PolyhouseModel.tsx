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

// Exhaust Fan Component
function ExhaustFan({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const fanRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fanRef.current) {
      fanRef.current.rotation.z = state.clock.elapsedTime * 8;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Fan housing */}
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.2]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Fan blades */}
      <group ref={fanRef} position={[0, 0, 0.12]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0.2, 0, 0]}>
            <boxGeometry args={[0.25, 0.08, 0.02]} />
            <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* Center hub */}
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Fogger Nozzle Component
function FoggerNozzle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Nozzle body */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.05, 0.1, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Spray indicator */}
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.15, 0.2, 8]} />
        <meshStandardMaterial color="#add8e6" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

// Cooling Pad Component (for fan-and-pad system)
function CoolingPad({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pad frame */}
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#4a9f4a" opacity={0.7} transparent />
      </mesh>
      {/* Corrugated texture lines */}
      {Array.from({ length: Math.floor(size[1] / 0.3) }).map((_, i) => (
        <mesh key={i} position={[0, -size[1] / 2 + 0.15 + i * 0.3, size[2] / 2 + 0.01]}>
          <boxGeometry args={[size[0] - 0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#3a8f3a" />
        </mesh>
      ))}
      {/* Water tray at bottom */}
      <mesh position={[0, -size[1] / 2 - 0.1, 0]}>
        <boxGeometry args={[size[0] + 0.1, 0.15, size[2] + 0.1]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
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

// Roll-up Side Ventilation
function SideVentilation({ 
  position, 
  length, 
  height, 
  isOpen 
}: { 
  position: [number, number, number]; 
  length: number; 
  height: number;
  isOpen: boolean;
}) {
  const rollHeight = height * 0.4;
  
  return (
    <group position={position}>
      {/* Rolled curtain at top */}
      <mesh position={[0, height / 2 - rollHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, length * 0.8, 16]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Vent opening area */}
      {isOpen && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, height - rollHeight, length * 0.8]} />
          <meshStandardMaterial color="#87ceeb" opacity={0.3} transparent />
        </mesh>
      )}
      {/* Guide rails */}
      <mesh position={[0, 0, length * 0.42]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, height, 0.04]} />
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, -length * 0.42]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, height, 0.04]} />
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </mesh>
    </group>
  );
}

// Top Ridge Ventilation
function TopVentilation({ 
  position, 
  length, 
  isOpen 
}: { 
  position: [number, number, number]; 
  length: number;
  isOpen: boolean;
}) {
  return (
    <group position={position}>
      {/* Vent flap - angled when open */}
      <mesh rotation={[isOpen ? 0.4 : 0, 0, 0]} position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.02, length * 0.7]} />
        <meshStandardMaterial color="#e8e8e8" opacity={0.8} transparent />
      </mesh>
      {/* Vent frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.08, length * 0.75]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
      </mesh>
      {/* Open air indicator */}
      {isOpen && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.3, length * 0.6]} />
          <meshStandardMaterial color="#87ceeb" opacity={0.2} transparent />
        </mesh>
      )}
    </group>
  );
}

// Insect Net Overlay
function InsectNet({ 
  position, 
  width, 
  height, 
  depth 
}: { 
  position: [number, number, number]; 
  width: number; 
  height: number;
  depth: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color="#cccccc" 
        opacity={0.15} 
        transparent 
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Door Component with different types
function Door({ 
  position, 
  type, 
  frameMaterial 
}: { 
  position: [number, number, number]; 
  type: 'naturally-ventilated' | 'fan-and-pad' | 'climate-controlled';
  frameMaterial: { color: string; metalness: number; roughness: number };
}) {
  const doorWidth = type === 'climate-controlled' ? 1.8 : 1.2;
  const doorHeight = type === 'climate-controlled' ? 2.4 : 2.2;
  const isDouble = type === 'climate-controlled';
  
  return (
    <group position={position}>
      {isDouble ? (
        <>
          {/* Double sliding doors for climate controlled */}
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
      ) : (
        <>
          {/* Standard door */}
          <mesh position={[0, doorHeight / 2, 0.1]}>
            <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
            <meshStandardMaterial color={type === 'fan-and-pad' ? '#2f4f4f' : '#8b4513'} roughness={0.7} />
          </mesh>
          {/* Door handle */}
          <mesh position={[doorWidth / 2 - 0.15, doorHeight / 2, 0.18]}>
            <boxGeometry args={[0.05, 0.15, 0.06]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
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

export function PolyhouseModel({ config }: PolyhouseModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { 
    length, width, eaveHeight, ridgeHeight, roofType, coverMaterial,
    structureMaterial, polyhouseType, sideVentilation, topVentilation,
    insectNet, foggers, fans
  } = config;
  
  const roofHeight = ridgeHeight - eaveHeight;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  // Get cover material properties
  const coverProps = useMemo(() => {
    switch (coverMaterial) {
      case 'polyethylene':
        return { color: '#a8e6cf', opacity: 0.35, transparent: true };
      case 'polycarbonate':
        return { color: '#e8f5e9', opacity: 0.45, transparent: true };
      case 'shade-net':
        return { color: '#4a7c59', opacity: 0.55, transparent: true };
      case 'glass':
        return { color: '#e3f2fd', opacity: 0.25, transparent: true };
      default:
        return { color: '#a8e6cf', opacity: 0.35, transparent: true };
    }
  }, [coverMaterial]);

  // Get frame material based on structure type
  const frameMaterial = useMemo(() => {
    switch (structureMaterial) {
      case 'gi-pipe':
        return { color: '#7a7a7a', metalness: 0.9, roughness: 0.2 }; // Galvanized silver
      case 'ms-pipe':
        return { color: '#4a4a4a', metalness: 0.8, roughness: 0.3 }; // Dark steel
      case 'aluminum':
        return { color: '#d4d4d4', metalness: 0.95, roughness: 0.1 }; // Bright aluminum
      default:
        return { color: '#4a4a4a', metalness: 0.9, roughness: 0.2 };
    }
  }, [structureMaterial]);

  // Create roof geometry
  const roofGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    switch (roofType) {
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
      case 'quonset': {
        const segments = 20;
        shape.moveTo(-halfWidth, 0);
        for (let i = 1; i <= segments; i++) {
          const angle = Math.PI * (i / segments);
          const x = -halfWidth * Math.cos(angle);
          const y = roofHeight * Math.sin(angle);
          shape.lineTo(x, y);
        }
        shape.closePath();
        break;
      }
      case 'venlo': {
        const peakCount = Math.max(2, Math.floor(width / 8));
        const peakWidth = width / peakCount;
        shape.moveTo(-halfWidth, 0);
        for (let i = 0; i < peakCount; i++) {
          const startX = -halfWidth + i * peakWidth;
          const peakX = startX + peakWidth / 2;
          const endX = startX + peakWidth;
          shape.lineTo(peakX, roofHeight);
          shape.lineTo(endX, 0);
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
    if (roofType === 'gable' || roofType === 'venlo') {
      const shape = new THREE.Shape();
      shape.moveTo(-halfWidth, 0);
      shape.lineTo(-halfWidth, eaveHeight);
      
      if (roofType === 'venlo') {
        const peakCount = Math.max(2, Math.floor(width / 8));
        const peakWidth = width / peakCount;
        for (let i = 0; i < peakCount; i++) {
          const startX = -halfWidth + i * peakWidth;
          const peakX = startX + peakWidth / 2;
          const endX = startX + peakWidth;
          shape.lineTo(peakX, eaveHeight + roofHeight);
          shape.lineTo(endX, eaveHeight);
        }
      } else {
        shape.lineTo(0, ridgeHeight);
        shape.lineTo(halfWidth, eaveHeight);
      }
      
      shape.lineTo(halfWidth, 0);
      shape.closePath();
      
      return new THREE.ShapeGeometry(shape);
    }
    return null;
  }, [roofType, halfWidth, eaveHeight, ridgeHeight, roofHeight, width]);

  // Gentle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.03;
    }
  });

  // Calculate post positions
  const postSpacing = 4;
  const numSidePosts = Math.max(2, Math.floor(length / postSpacing) + 1);

  // Fan positions
  const numFans = Math.max(2, Math.floor(length / 6));
  
  // Fogger positions
  const foggerRows = 3;
  const foggersPerRow = Math.floor(length / 4);

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
          end={[halfWidth + 2, eaveHeight, halfLength + 2]}
          value={eaveHeight}
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
          <mesh key={`corner-${i}`} position={[x, eaveHeight / 2, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, eaveHeight, 12]} />
            <meshStandardMaterial {...frameMaterial} />
          </mesh>
        ))}

        {/* Side posts along length */}
        {Array.from({ length: numSidePosts }).map((_, i) => {
          const z = -halfLength + (i * length) / (numSidePosts - 1);
          if (i === 0 || i === numSidePosts - 1) return null;
          return (
            <group key={`side-posts-${i}`}>
              <mesh position={[-halfWidth, eaveHeight / 2, z]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, eaveHeight, 8]} />
                <meshStandardMaterial {...frameMaterial} />
              </mesh>
              <mesh position={[halfWidth, eaveHeight / 2, z]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, eaveHeight, 8]} />
                <meshStandardMaterial {...frameMaterial} />
              </mesh>
            </group>
          );
        })}

        {/* Top horizontal beams */}
        <mesh position={[-halfWidth, eaveHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, length, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        <mesh position={[halfWidth, eaveHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, length, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        
        {/* Ridge beam */}
        {(roofType === 'gable' || roofType === 'gothic') && (
          <mesh position={[0, ridgeHeight, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, length, 8]} />
            <meshStandardMaterial {...frameMaterial} />
          </mesh>
        )}

        {/* Cross beams at ends */}
        <mesh position={[0, eaveHeight, -halfLength]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, width, 8]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
        <mesh position={[0, eaveHeight, halfLength]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, width, 8]} />
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
                    [-halfWidth, eaveHeight, z],
                    [0, ridgeHeight, z],
                  ]}
                  color={frameMaterial.color}
                  lineWidth={3}
                />
                <Line
                  points={[
                    [halfWidth, eaveHeight, z],
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

        {/* Side walls (cover material) */}
        <mesh position={[-halfWidth - 0.01, eaveHeight / 2, 0]}>
          <boxGeometry args={[0.02, eaveHeight, length]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[halfWidth + 0.01, eaveHeight / 2, 0]}>
          <boxGeometry args={[0.02, eaveHeight, length]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>

        {/* End walls */}
        {endWallGeometry ? (
          <>
            <mesh geometry={endWallGeometry} position={[0, 0, -halfLength - 0.01]}>
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={endWallGeometry} position={[0, 0, halfLength + 0.01]} rotation={[0, Math.PI, 0]}>
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[0, eaveHeight / 2, -halfLength - 0.01]}>
              <boxGeometry args={[width, eaveHeight, 0.02]} />
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, eaveHeight / 2, halfLength + 0.01]}>
              <boxGeometry args={[width, eaveHeight, 0.02]} />
              <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* Roof cover */}
        <mesh 
          geometry={roofGeometry} 
          position={[0, eaveHeight, -halfLength]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>

        {/* Gutters */}
        <mesh position={[-halfWidth - 0.15, eaveHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, length, 8, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[halfWidth + 0.15, eaveHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, length, 8, 1, true, Math.PI, Math.PI]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Side Ventilation - Roll-up curtains */}
      {sideVentilation && (
        <>
          <SideVentilation 
            position={[-halfWidth - 0.1, eaveHeight * 0.5, 0]} 
            length={length} 
            height={eaveHeight * 0.5}
            isOpen={true}
          />
          <SideVentilation 
            position={[halfWidth + 0.1, eaveHeight * 0.5, 0]} 
            length={length} 
            height={eaveHeight * 0.5}
            isOpen={true}
          />
        </>
      )}

      {/* Top Ventilation - Ridge vents */}
      {topVentilation && (roofType === 'gable' || roofType === 'venlo') && (
        <TopVentilation 
          position={[0, ridgeHeight + 0.1, 0]} 
          length={length}
          isOpen={true}
        />
      )}

      {/* Insect Netting overlay */}
      {insectNet && (
        <>
          {/* Side nets */}
          <InsectNet 
            position={[-halfWidth - 0.15, eaveHeight / 2, 0]}
            width={0.08}
            height={eaveHeight}
            depth={length}
          />
          <InsectNet 
            position={[halfWidth + 0.15, eaveHeight / 2, 0]}
            width={0.08}
            height={eaveHeight}
            depth={length}
          />
          {/* End nets */}
          <InsectNet 
            position={[0, eaveHeight / 2, -halfLength - 0.15]}
            width={width}
            height={eaveHeight}
            depth={0.08}
          />
        </>
      )}

      {/* Exhaust Fans (for fan-and-pad or climate controlled) */}
      {fans && (
        <>
          {Array.from({ length: numFans }).map((_, i) => {
            const z = -halfLength + 2 + (i * (length - 4)) / (numFans - 1);
            return (
              <ExhaustFan 
                key={`fan-${i}`}
                position={[halfWidth + 0.15, eaveHeight * 0.6, z]} 
                rotation={[0, -Math.PI / 2, 0]}
              />
            );
          })}
        </>
      )}

      {/* Cooling Pads (for fan-and-pad system) */}
      {polyhouseType === 'fan-and-pad' && (
        <CoolingPad 
          position={[-halfWidth - 0.3, eaveHeight * 0.45, 0]}
          size={[0.3, eaveHeight * 0.7, length * 0.8]}
        />
      )}

      {/* Climate Control Units (for climate controlled) */}
      {polyhouseType === 'climate-controlled' && (
        <>
          <ClimateControlUnit position={[-halfWidth + 2, 1, -halfLength + 1.5]} />
          <ClimateControlUnit position={[halfWidth - 2, 1, -halfLength + 1.5]} />
        </>
      )}

      {/* Fogging System */}
      {foggers && (
        <group>
          {/* Fogger supply line */}
          <mesh position={[0, ridgeHeight - 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, length * 0.9, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Fogger nozzles */}
          {Array.from({ length: foggerRows }).map((_, row) =>
            Array.from({ length: foggersPerRow }).map((_, col) => {
              const x = -halfWidth * 0.5 + row * (width * 0.5);
              const z = -halfLength * 0.8 + col * 4;
              return (
                <FoggerNozzle 
                  key={`fogger-${row}-${col}`}
                  position={[x, ridgeHeight - 0.6, z]}
                />
              );
            })
          )}
        </group>
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

      {/* Entry Door - different based on polyhouse type */}
      <Door 
        position={[0, 0, halfLength]} 
        type={polyhouseType}
        frameMaterial={frameMaterial}
      />

      {/* Polyhouse Type Label */}
      <Html position={[0, ridgeHeight + 2, 0]} center>
        <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg capitalize whitespace-nowrap">
          {polyhouseType.replace(/-/g, ' ')}
        </div>
      </Html>

      {/* Material indicator */}
      <Html position={[-halfWidth - 1, eaveHeight + 1, 0]} center>
        <div className="bg-muted/90 text-foreground px-2 py-1 rounded text-[10px] font-medium shadow whitespace-nowrap">
          {structureMaterial === 'gi-pipe' ? 'GI Pipe' : 
           structureMaterial === 'ms-pipe' ? 'MS Pipe' : 'Aluminum'} Frame
        </div>
      </Html>
    </group>
  );
}
