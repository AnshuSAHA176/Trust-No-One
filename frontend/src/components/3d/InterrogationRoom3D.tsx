import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface InterrogationRoom3DProps {
  scrollProgress: number;
}

export const InterrogationRoom3D: React.FC<InterrogationRoom3DProps> = ({ scrollProgress }) => {
  const lampRef = useRef<THREE.Group>(null);
  const overheadLightRef = useRef<THREE.SpotLight>(null);

  // Subtle ambient pendulum motion of overhead interrogation lamp
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lampRef.current) {
      lampRef.current.rotation.z = Math.sin(t * 0.8) * 0.025;
      lampRef.current.rotation.x = Math.cos(t * 0.6) * 0.015;
    }

    // Occasional subtle light flicker (classic thriller interrogation bulb)
    if (overheadLightRef.current) {
      const flicker = Math.sin(t * 30) > 0.985 ? 0.35 : 1.0;
      // Also build intensity with scroll progress
      const baseIntensity = 3.5 + scrollProgress * 1.5;
      overheadLightRef.current.intensity = baseIntensity * flicker;
    }
  });

  return (
    <group>
      {/* Ambient Fill Light (Low-key moody noir environment) */}
      <ambientLight intensity={0.12} color="#181e28" />

      {/* The Central Suspended Interrogation Lamp */}
      <group position={[0, 4.8, 0]}>
        {/* Suspension Cable */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 2.4, 8]} />
          <meshStandardMaterial color="#0b0d12" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Lamp Hood & Light Source with slight swing */}
        <group ref={lampRef}>
          {/* Conical Industrial Shade */}
          <mesh position={[0, 0, 0]} castShadow>
            <coneGeometry args={[0.48, 0.45, 24, 1, true]} />
            <meshStandardMaterial
              color="#1a1c22"
              roughness={0.6}
              metalness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Lamp Rim */}
          <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.02, 8, 24]} />
            <meshStandardMaterial color="#2d3340" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Exposed Bulb Interior */}
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#fff3d1" />
          </mesh>

          {/* Core Table Spotlight (Warm Incandescent / Tungsten 3200K) */}
          <spotLight
            ref={overheadLightRef}
            position={[0, -0.15, 0]}
            target-position={[0, 1.2, 0]}
            color="#ffe2a8"
            intensity={4.0}
            angle={0.72}
            penumbra={0.7}
            distance={9.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
        </group>
      </group>

      {/* Interrogation Table */}
      <group position={[0, 0, 0]}>
        {/* Table Top (Heavy Dark Stained Wood / Steel Frame) */}
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.1, 2.2]} />
          <meshStandardMaterial
            color="#1c1f28"
            roughness={0.65}
            metalness={0.25}
          />
        </mesh>

        {/* Metallic Beveled Edge Trim */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[3.24, 0.06, 2.24]} />
          <meshStandardMaterial color="#0c0e14" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Table Legs (Heavy Industrial Steel) */}
        {[-1.4, 1.4].map((x, xi) =>
          [-0.9, 0.9].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.55, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.05, 0.05, 1.1, 12]} />
              <meshStandardMaterial color="#101218" metalness={0.75} roughness={0.3} />
            </mesh>
          ))
        )}
      </group>

      {/* Floor - Concrete / Distressed Tiles */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial
          color="#0c0e14"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Back Wall with Interrogation Room One-Way Mirror */}
      <group position={[0, 4, -8]}>
        {/* Wall */}
        <mesh receiveShadow>
          <planeGeometry args={[26, 10]} />
          <meshStandardMaterial color="#090b10" roughness={0.92} />
        </mesh>

        {/* One-Way Observation Mirror */}
        <group position={[0, 0, 0.05]}>
          <mesh>
            <planeGeometry args={[4.2, 2.4]} />
            <meshStandardMaterial
              color="#1a2232"
              metalness={0.85}
              roughness={0.1}
            />
          </mesh>
          {/* Mirror Frame */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[4.4, 2.6, 0.04]} />
            <meshStandardMaterial color="#0e1118" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Left Wall with File Cabinets (Parallax Depth) */}
      <group position={[-9, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[26, 10]} />
          <meshStandardMaterial color="#080a0e" roughness={0.95} />
        </mesh>
        {/* Filing Cabinets */}
        {[-2.5, 0, 2.5].map((z, i) => (
          <mesh key={i} position={[z, -2.2, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 3.6, 0.8]} />
            <meshStandardMaterial color="#12151e" metalness={0.65} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Right Wall with Venetian Blinds & Subtle Window Backlight (Film Noir Look) */}
      <group position={[9, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[26, 10]} />
          <meshStandardMaterial color="#080a0e" roughness={0.95} />
        </mesh>

        {/* Window with Cold Exterior Blue Tint */}
        <group position={[0, 0, 0.1]}>
          <mesh>
            <planeGeometry args={[3.8, 3.0]} />
            <meshBasicMaterial color="#0f1929" />
          </mesh>
          {/* Venetian Blind Slats */}
          {Array.from({ length: 14 }).map((_, idx) => (
            <mesh key={idx} position={[0, -1.3 + idx * 0.2, 0.03]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[3.8, 0.04, 0.08]} />
              <meshStandardMaterial color="#0a0d14" roughness={0.8} />
            </mesh>
          ))}
          {/* Cold Blue Slat Light casting into the room */}
          <spotLight
            position={[0, 0, 0.5]}
            target-position={[-5, -2, 0]}
            color="#3b82f6"
            intensity={0.4}
            angle={0.6}
            penumbra={0.9}
          />
        </group>
      </group>
    </group>
  );
};
