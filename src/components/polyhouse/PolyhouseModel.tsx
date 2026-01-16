import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PolyhouseConfig } from '@/types/polyhouse';
import * as THREE from 'three';

interface PolyhouseModelProps {
  config: PolyhouseConfig;
}

export function PolyhouseModel({ config }: PolyhouseModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { length, width, eaveHeight, ridgeHeight, roofType, coverMaterial } = config;

  // Get cover material properties
  const coverProps = useMemo(() => {
    switch (coverMaterial) {
      case 'polyethylene':
        return { color: '#a8d5a2', opacity: 0.4, transparent: true };
      case 'polycarbonate':
        return { color: '#e8f4e8', opacity: 0.5, transparent: true };
      case 'shade-net':
        return { color: '#4a7c59', opacity: 0.6, transparent: true };
      case 'glass':
        return { color: '#d4e8d4', opacity: 0.3, transparent: true };
      default:
        return { color: '#a8d5a2', opacity: 0.4, transparent: true };
    }
  }, [coverMaterial]);

  // Create roof geometry based on type
  const roofGeometry = useMemo(() => {
    const halfWidth = width / 2;
    const roofHeight = ridgeHeight - eaveHeight;

    switch (roofType) {
      case 'gable': {
        // A-frame roof
        const shape = new THREE.Shape();
        shape.moveTo(-halfWidth, 0);
        shape.lineTo(0, roofHeight);
        shape.lineTo(halfWidth, 0);
        shape.lineTo(-halfWidth, 0);
        
        const extrudeSettings = {
          depth: length,
          bevelEnabled: false,
        };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
      }
      case 'gothic': {
        // Gothic arch roof
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-halfWidth, 0, 0),
          new THREE.Vector3(-halfWidth * 0.5, roofHeight * 0.9, 0),
          new THREE.Vector3(0, roofHeight, 0),
          new THREE.Vector3(halfWidth * 0.5, roofHeight * 0.9, 0),
          new THREE.Vector3(halfWidth, 0, 0),
        ]);
        
        const points = curve.getPoints(20).map(p => new THREE.Vector2(p.x, p.y));
        const shape = new THREE.Shape(points);
        
        return new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
      }
      case 'quonset': {
        // Round/barrel roof
        const segments = 16;
        const shape = new THREE.Shape();
        shape.moveTo(-halfWidth, 0);
        
        for (let i = 0; i <= segments; i++) {
          const angle = Math.PI * (i / segments);
          const x = -halfWidth * Math.cos(angle);
          const y = roofHeight * Math.sin(angle);
          shape.lineTo(x, y);
        }
        shape.lineTo(-halfWidth, 0);
        
        return new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
      }
      case 'venlo': {
        // Multi-peak venlo style
        const peakCount = Math.max(2, Math.floor(width / 6));
        const peakWidth = width / peakCount;
        const shape = new THREE.Shape();
        
        shape.moveTo(-halfWidth, 0);
        for (let i = 0; i < peakCount; i++) {
          const peakX = -halfWidth + (i + 0.5) * peakWidth;
          const baseX = -halfWidth + (i + 1) * peakWidth;
          shape.lineTo(peakX, roofHeight);
          shape.lineTo(baseX, 0);
        }
        
        return new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
      }
      default:
        return new THREE.BoxGeometry(width, roofHeight, length);
    }
  }, [width, length, ridgeHeight, eaveHeight, roofType]);

  // Gentle rotation for visual interest
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[length * 1.5, width * 1.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Polyhouse Structure */}
      <group position={[0, 0, -length / 2]}>
        {/* Frame Posts - Corners */}
        {[
          [-width / 2, 0, 0],
          [width / 2, 0, 0],
          [-width / 2, 0, length],
          [width / 2, 0, length],
        ].map((pos, i) => (
          <mesh key={`post-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, eaveHeight, 8]} />
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Side posts */}
        {Array.from({ length: Math.floor(length / 4) - 1 }).map((_, i) => {
          const z = (i + 1) * 4;
          return (
            <group key={`side-posts-${i}`}>
              <mesh position={[-width / 2, eaveHeight / 2, z]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, eaveHeight, 8]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[width / 2, eaveHeight / 2, z]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, eaveHeight, 8]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          );
        })}

        {/* Horizontal beams */}
        <mesh position={[0, eaveHeight, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, width, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, eaveHeight, length]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, width, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Side walls */}
        <mesh position={[-width / 2, eaveHeight / 2, length / 2]}>
          <boxGeometry args={[0.02, eaveHeight, length]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[width / 2, eaveHeight / 2, length / 2]}>
          <boxGeometry args={[0.02, eaveHeight, length]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>

        {/* End walls */}
        <mesh position={[0, eaveHeight / 2, 0]}>
          <boxGeometry args={[width, eaveHeight, 0.02]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, eaveHeight / 2, length]}>
          <boxGeometry args={[width, eaveHeight, 0.02]} />
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>

        {/* Roof */}
        <mesh 
          geometry={roofGeometry} 
          position={[0, eaveHeight, 0]}
          rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        >
          <meshStandardMaterial {...coverProps} side={THREE.DoubleSide} />
        </mesh>

        {/* Ventilation indicators */}
        {config.sideVentilation && (
          <>
            <mesh position={[-width / 2 - 0.1, eaveHeight * 0.7, length / 2]}>
              <boxGeometry args={[0.1, eaveHeight * 0.2, length * 0.6]} />
              <meshStandardMaterial color="#4a90d9" opacity={0.3} transparent />
            </mesh>
            <mesh position={[width / 2 + 0.1, eaveHeight * 0.7, length / 2]}>
              <boxGeometry args={[0.1, eaveHeight * 0.2, length * 0.6]} />
              <meshStandardMaterial color="#4a90d9" opacity={0.3} transparent />
            </mesh>
          </>
        )}

        {/* Plants inside */}
        {Array.from({ length: 3 }).map((_, row) => (
          Array.from({ length: Math.floor(length / 3) }).map((_, col) => (
            <mesh 
              key={`plant-${row}-${col}`} 
              position={[
                -width / 3 + row * (width / 3),
                0.3,
                2 + col * 3
              ]}
            >
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color="#228b22" roughness={0.8} />
            </mesh>
          ))
        ))}
      </group>
    </group>
  );
}
