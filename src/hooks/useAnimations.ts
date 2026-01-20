import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Smooth lerp function
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Smooth value hook for animating numbers
export function useAnimatedValue(target: number, speed: number = 0.08): number {
  const [current, setCurrent] = useState(target);
  const frameRef = useRef<number>();
  
  useEffect(() => {
    let animating = true;
    
    const animate = () => {
      if (!animating) return;
      
      setCurrent(prev => {
        const diff = Math.abs(target - prev);
        if (diff < 0.001) return target;
        return lerp(prev, target, speed);
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      animating = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, speed]);
  
  return current;
}

// Hook for animating 3D positions
export function useAnimatedPosition(
  targetX: number, 
  targetY: number, 
  targetZ: number, 
  speed: number = 0.08
): [number, number, number] {
  const x = useAnimatedValue(targetX, speed);
  const y = useAnimatedValue(targetY, speed);
  const z = useAnimatedValue(targetZ, speed);
  
  return [x, y, z];
}

// Hook for animating scale with bounce effect
export function useAnimatedScale(target: number, speed: number = 0.1): number {
  const [current, setCurrent] = useState(0);
  const velocityRef = useRef(0);
  
  useEffect(() => {
    let animating = true;
    
    const animate = () => {
      if (!animating) return;
      
      setCurrent(prev => {
        const diff = target - prev;
        velocityRef.current += diff * speed;
        velocityRef.current *= 0.8; // Damping
        
        const newValue = prev + velocityRef.current;
        
        if (Math.abs(diff) < 0.001 && Math.abs(velocityRef.current) < 0.001) {
          return target;
        }
        
        return newValue;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      animating = false;
    };
  }, [target, speed]);
  
  return current;
}

// Hook for entrance animation
export function useEntranceAnimation(delay: number = 0): { scale: number; opacity: number } {
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let progress = 0;
      
      const animate = () => {
        progress += 0.02;
        
        // Elastic easing for scale
        const elasticScale = progress < 1 
          ? 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI) / 3)
          : 1;
        
        setScale(Math.min(elasticScale, 1));
        setOpacity(Math.min(progress * 2, 1));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [delay]);
  
  return { scale, opacity };
}

// Create an animated color that transitions smoothly
export function useAnimatedColor(targetColor: string, speed: number = 0.05): THREE.Color {
  const colorRef = useRef(new THREE.Color(targetColor));
  const targetRef = useRef(new THREE.Color(targetColor));
  
  useEffect(() => {
    targetRef.current.set(targetColor);
  }, [targetColor]);
  
  useEffect(() => {
    let animating = true;
    
    const animate = () => {
      if (!animating) return;
      
      colorRef.current.lerp(targetRef.current, speed);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      animating = false;
    };
  }, [speed]);
  
  return colorRef.current;
}

// Stagger delay calculator for sequential animations
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}
