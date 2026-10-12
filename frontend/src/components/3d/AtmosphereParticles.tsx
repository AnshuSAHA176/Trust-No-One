import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const AtmosphereParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Clustered predominantly in the conical light shaft around the table
      const r = Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.random() * 4.2 + 0.6; // Y: 0.6 to 4.8
      pos[i * 3 + 2] = Math.sin(theta) * r;

      spd[i] = 0.003 + Math.random() * 0.006;
    }

    return [pos, spd];
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i];
      if (pos[i * 3 + 1] < 0.6) {
        pos[i * 3 + 1] = 4.6;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#ffe2a8"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
