import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PolyhouseConfig } from '@/types/polyhouse';
import * as THREE from 'three';
import { lerp } from '@/hooks/useAnimations';

interface CameraControllerProps {
  config: PolyhouseConfig;
  orbitControlsRef: React.RefObject<any>;
}

// Camera preset positions for different polyhouse types
const getCameraPresets = (config: PolyhouseConfig) => {
  const { length, width, ridgeHeight, polyhouseType } = config;
  const baseDistance = Math.max(length, width) * 1.8;
  
  const presets = {
    'naturally-ventilated': {
      position: new THREE.Vector3(width * 1.2, ridgeHeight * 2.2, length * 1.4),
      target: new THREE.Vector3(0, ridgeHeight * 0.4, 0),
      fov: 45,
    },
    'climate-controlled': {
      position: new THREE.Vector3(-width * 0.8, ridgeHeight * 1.8, length * 1.6),
      target: new THREE.Vector3(0, ridgeHeight * 0.3, 0),
      fov: 50,
    },
    'shade-net': {
      position: new THREE.Vector3(width * 1.5, ridgeHeight * 2.5, length * 0.8),
      target: new THREE.Vector3(0, ridgeHeight * 0.5, 0),
      fov: 42,
    },
  };
  
  return presets[polyhouseType] || presets['naturally-ventilated'];
};

// Easing function for smooth camera movement
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function CameraController({ config, orbitControlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const prevTypeRef = useRef(config.polyhouseType);
  const startPositionRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const targetTargetRef = useRef(new THREE.Vector3());
  
  // Intermediate waypoint for fly-through effect
  const waypointRef = useRef(new THREE.Vector3());
  
  const animationDuration = 2.0; // seconds
  const animationStartTimeRef = useRef(0);
  
  // Detect polyhouse type changes and start animation
  useEffect(() => {
    if (prevTypeRef.current !== config.polyhouseType) {
      const preset = getCameraPresets(config);
      
      // Store starting positions
      startPositionRef.current.copy(camera.position);
      if (orbitControlsRef.current) {
        startTargetRef.current.copy(orbitControlsRef.current.target);
      }
      
      // Store target positions
      targetPositionRef.current.copy(preset.position);
      targetTargetRef.current.copy(preset.target);
      
      // Calculate waypoint (fly up and over for dramatic effect)
      const midPoint = new THREE.Vector3().lerpVectors(
        startPositionRef.current,
        targetPositionRef.current,
        0.5
      );
      waypointRef.current.set(
        midPoint.x,
        Math.max(startPositionRef.current.y, targetPositionRef.current.y) + config.ridgeHeight * 1.5,
        midPoint.z
      );
      
      // Start animation
      setAnimationProgress(0);
      setIsAnimating(true);
      animationStartTimeRef.current = 0;
      
      // Disable orbit controls during animation
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
      
      prevTypeRef.current = config.polyhouseType;
    }
  }, [config.polyhouseType, config.ridgeHeight, camera, orbitControlsRef]);
  
  // Animation frame
  useFrame((_, delta) => {
    if (!isAnimating) return;
    
    animationStartTimeRef.current += delta;
    const progress = Math.min(animationStartTimeRef.current / animationDuration, 1);
    const easedProgress = easeInOutQuart(progress);
    
    setAnimationProgress(progress);
    
    // Bezier curve path through waypoint
    const t = easedProgress;
    const p0 = startPositionRef.current;
    const p1 = waypointRef.current;
    const p2 = targetPositionRef.current;
    
    // Quadratic bezier
    const oneMinusT = 1 - t;
    const newX = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
    const newY = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
    const newZ = oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z;
    
    camera.position.set(newX, newY, newZ);
    
    // Smoothly interpolate look-at target
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.lerpVectors(
        startTargetRef.current,
        targetTargetRef.current,
        easedProgress
      );
    }
    
    camera.lookAt(
      lerp(startTargetRef.current.x, targetTargetRef.current.x, easedProgress),
      lerp(startTargetRef.current.y, targetTargetRef.current.y, easedProgress),
      lerp(startTargetRef.current.z, targetTargetRef.current.z, easedProgress)
    );
    
    // End animation
    if (progress >= 1) {
      setIsAnimating(false);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.update();
      }
    }
  });
  
  return null;
}
