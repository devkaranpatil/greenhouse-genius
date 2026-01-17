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
  rotation = [0, 0, 0]
}: { 
  position: [number, number, number]; 
  value: number; 
  unit?: string;
  rotation?: [number, number, number];
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
      {/* Arrow heads */}
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

export function PolyhouseModel({ config }: PolyhouseModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { length, width, eaveHeight, ridgeHeight, roofType, coverMaterial } = config;
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

  // Frame material
  const frameMaterial = useMemo(() => ({
    color: '#4a4a4a',
    metalness: 0.9,
    roughness: 0.2,
  }), []);

  // Create roof shape vertices for different roof types
  const roofShape = useMemo(() => {
    switch (roofType) {
      case 'gable': {
        // Simple A-frame gable roof
        return {
          type: 'gable',
          leftSlope: [
            new THREE.Vector3(-halfWidth, eaveHeight, -halfLength),
            new THREE.Vector3(-halfWidth, eaveHeight, halfLength),
            new THREE.Vector3(0, ridgeHeight, halfLength),
            new THREE.Vector3(0, ridgeHeight, -halfLength),
          ],
          rightSlope: [
            new THREE.Vector3(halfWidth, eaveHeight, -halfLength),
            new THREE.Vector3(halfWidth, eaveHeight, halfLength),
            new THREE.Vector3(0, ridgeHeight, halfLength),
            new THREE.Vector3(0, ridgeHeight, -halfLength),
          ],
        };
      }
      case 'gothic': {
        // Gothic arch - curved roof
        const segments = 12;
        const leftPoints: THREE.Vector3[] = [];
        const rightPoints: THREE.Vector3[] = [];
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = Math.PI * t;
          const x = -halfWidth + halfWidth * t;
          const y = eaveHeight + roofHeight * Math.sin(angle);
          leftPoints.push(new THREE.Vector3(x, y, -halfLength));
        }
        
        return { type: 'gothic', points: leftPoints, segments };
      }
      case 'quonset': {
        // Quonset/barrel roof - semicircular
        const segments = 16;
        const points: THREE.Vector3[] = [];
        
        for (let i = 0; i <= segments; i++) {
          const angle = Math.PI * (i / segments);
          const x = -halfWidth * Math.cos(angle);
          const y = eaveHeight + roofHeight * Math.sin(angle);
          points.push(new THREE.Vector3(x, y, 0));
        }
        
        return { type: 'quonset', points, segments };
      }
      case 'venlo': {
        // Multi-span venlo with multiple peaks
        const peakCount = Math.max(2, Math.floor(width / 8));
        return { type: 'venlo', peakCount, peakWidth: width / peakCount };
      }
      default:
        return { type: 'flat' };
    }
  }, [roofType, halfWidth, halfLength, eaveHeight, ridgeHeight, roofHeight, width]);

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

  // End wall geometry (triangular for gable)
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
  const postSpacing = 4; // meters between posts
  const numSidePosts = Math.max(2, Math.floor(length / postSpacing) + 1);
  const numWidthPosts = Math.max(2, Math.floor(width / postSpacing) + 1);

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
        {/* Length dimension */}
        <DimensionLine
          start={[-halfWidth - 3, 0.5, -halfLength]}
          end={[-halfWidth - 3, 0.5, halfLength]}
          value={length}
          color="#22c55e"
        />
        
        {/* Width dimension */}
        <DimensionLine
          start={[-halfWidth, 0.5, halfLength + 3]}
          end={[halfWidth, 0.5, halfLength + 3]}
          value={width}
          color="#3b82f6"
        />
        
        {/* Height dimension (eave) */}
        <DimensionLine
          start={[halfWidth + 2, 0, halfLength + 2]}
          end={[halfWidth + 2, eaveHeight, halfLength + 2]}
          value={eaveHeight}
          color="#f59e0b"
        />
        
        {/* Height dimension (ridge) */}
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
          if (i === 0 || i === numSidePosts - 1) return null; // Skip corners
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

        {/* Top horizontal beams (purlins) along length */}
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
                {/* Left rafter */}
                <Line
                  points={[
                    [-halfWidth, eaveHeight, z],
                    [0, ridgeHeight, z],
                  ]}
                  color="#4a4a4a"
                  lineWidth={3}
                />
                {/* Right rafter */}
                <Line
                  points={[
                    [halfWidth, eaveHeight, z],
                    [0, ridgeHeight, z],
                  ]}
                  color="#4a4a4a"
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

        {/* End walls with proper shape */}
        {endWallGeometry ? (
          <>
            <mesh geometry={endWallGeometry} position={[0, 0, -halfLength - 0.01]} rotation={[0, 0, 0]}>
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

      {/* Ventilation indicators */}
      {config.sideVentilation && (
        <group>
          {/* Ventilation openings on sides */}
          <mesh position={[-halfWidth - 0.05, eaveHeight * 0.75, 0]}>
            <boxGeometry args={[0.05, eaveHeight * 0.15, length * 0.7]} />
            <meshStandardMaterial color="#87ceeb" opacity={0.4} transparent />
          </mesh>
          <mesh position={[halfWidth + 0.05, eaveHeight * 0.75, 0]}>
            <boxGeometry args={[0.05, eaveHeight * 0.15, length * 0.7]} />
            <meshStandardMaterial color="#87ceeb" opacity={0.4} transparent />
          </mesh>
        </group>
      )}

      {config.topVentilation && (roofType === 'gable' || roofType === 'venlo') && (
        <mesh position={[0, ridgeHeight + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.8, length * 0.6, 0.05]} />
          <meshStandardMaterial color="#87ceeb" opacity={0.4} transparent />
        </mesh>
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
                {/* Stem */}
                <mesh position={[0, plantHeight / 2, 0]}>
                  <cylinderGeometry args={[0.02, 0.03, plantHeight, 6]} />
                  <meshStandardMaterial color="#228b22" roughness={0.8} />
                </mesh>
                {/* Leaves/foliage */}
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

      {/* Entry door indicator */}
      <group position={[0, 0, halfLength]}>
        <mesh position={[0, 1.1, 0.1]}>
          <boxGeometry args={[1.2, 2.2, 0.08]} />
          <meshStandardMaterial color="#8b4513" roughness={0.7} />
        </mesh>
        {/* Door frame */}
        <mesh position={[0, 1.1, 0.05]}>
          <boxGeometry args={[1.4, 2.4, 0.04]} />
          <meshStandardMaterial {...frameMaterial} />
        </mesh>
      </group>
    </group>
  );
}
