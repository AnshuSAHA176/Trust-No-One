import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Characters3DProps {
  scrollProgress: number;
}

export const Characters3D: React.FC<Characters3DProps> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle breathing / idling micro-animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.position.y = Math.sin(t * 1.5 + i * 1.2) * 0.02;
    });
  });

  // Calculate sequential reveal intensities based on scroll (Scene 2 & 3: 0.15 - 0.75)
  // Character 1 lights up around 0.20
  // Character 2 lights up around 0.35
  // Character 3 lights up around 0.50
  // Character 4 lights up around 0.65 (and gets obscured by shadow in Scene 3)
  const c1Intensity = Math.min(1, Math.max(0, (scrollProgress - 0.15) * 4));
  const c2Intensity = Math.min(1, Math.max(0, (scrollProgress - 0.30) * 4));
  const c3Intensity = Math.min(1, Math.max(0, (scrollProgress - 0.45) * 4));
  
  // Character 4: Lights up then gets enveloped in dramatic shadow during reveal (around 0.65-0.85)
  let c4Intensity = Math.min(1, Math.max(0, (scrollProgress - 0.55) * 4));
  if (scrollProgress > 0.68 && scrollProgress < 0.90) {
    // Obscured by shadow during reveal
    c4Intensity = Math.max(0.08, 1 - (scrollProgress - 0.68) * 4.5);
  }

  return (
    <group ref={groupRef}>
      {/* CHARACTER 1: North / Facing visitor (Investigator / Human slot) */}
      <group position={[0, 0, -2.4]} rotation={[0, 0, 0]}>
        <CharacterSilhouette
          coatColor="#161922"
          highlightColor="#e6e0d4"
          rimIntensity={0.3 + c1Intensity * 0.7}
          label="INVESTIGATOR"
        />
        <spotLight
          position={[0, 4.5, 0.5]}
          target-position={[0, 1.2, 0]}
          intensity={0.2 + c1Intensity * 2.8}
          color="#f3efe8"
          angle={0.45}
          penumbra={0.8}
          castShadow
        />
      </group>

      {/* CHARACTER 2: East (Suspect Alpha - The Executive) */}
      <group position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <CharacterSilhouette
          coatColor="#12141c"
          highlightColor="#d97706"
          rimIntensity={0.25 + c2Intensity * 0.75}
          label="SUSPECT I"
        />
        <spotLight
          position={[0, 4.5, 0.5]}
          target-position={[0, 1.2, 0]}
          intensity={0.15 + c2Intensity * 2.6}
          color="#f59e0b"
          angle={0.45}
          penumbra={0.8}
          castShadow
        />
      </group>

      {/* CHARACTER 3: West (Suspect Beta - The Insider) */}
      <group position={[-2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <CharacterSilhouette
          coatColor="#11131a"
          highlightColor="#e6e0d4"
          rimIntensity={0.25 + c3Intensity * 0.75}
          label="SUSPECT II"
        />
        <spotLight
          position={[0, 4.5, 0.5]}
          target-position={[0, 1.2, 0]}
          intensity={0.15 + c3Intensity * 2.6}
          color="#f3efe8"
          angle={0.45}
          penumbra={0.8}
          castShadow
        />
      </group>

      {/* CHARACTER 4: South / Foreground (Suspect Gamma - Shrouded) */}
      <group position={[0, 0, 2.4]} rotation={[0, Math.PI, 0]}>
        <CharacterSilhouette
          coatColor="#0d0e14"
          highlightColor="#b91c1c"
          rimIntensity={c4Intensity * 0.9}
          label="SUSPECT III"
        />
        <spotLight
          position={[0, 4.5, 0.5]}
          target-position={[0, 1.2, 0]}
          intensity={c4Intensity * 2.4}
          color="#b91c1c"
          angle={0.45}
          penumbra={0.85}
          castShadow
        />
      </group>
    </group>
  );
};

interface CharacterSilhouetteProps {
  coatColor: string;
  highlightColor: string;
  rimIntensity: number;
  label: string;
}

const CharacterSilhouette: React.FC<CharacterSilhouetteProps> = ({
  coatColor,
  highlightColor,
  rimIntensity,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Chair */}
      <group position={[0, 0, -0.2]}>
        {/* Seat */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.1, 0.9]} />
          <meshStandardMaterial color="#181a24" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Chair Back */}
        <mesh position={[0, 1.45, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 1.3, 0.08]} />
          <meshStandardMaterial color="#141720" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Chair Legs */}
        {[-0.35, 0.35].map((x, xi) =>
          [-0.35, 0.35].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.38, z]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.76]} />
              <meshStandardMaterial color="#0c0e14" roughness={0.4} metalness={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* Human Silhouette Figure */}
      {/* Torso / Overcoat */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.44, 1.1, 12]} />
        <meshStandardMaterial
          color={coatColor}
          roughness={0.85}
          metalness={0.1}
          emissive={highlightColor}
          emissiveIntensity={rimIntensity * 0.12}
        />
      </mesh>

      {/* Trenchcoat Collar & Lapels */}
      <mesh position={[0, 1.82, 0.1]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.22, 0.2]} />
        <meshStandardMaterial color={coatColor} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.5, 4, 8]} />
        <meshStandardMaterial color={coatColor} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.9} />
      </mesh>

      {/* Head / Detective Fedora or Silhouette Face */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial
          color="#151720"
          roughness={0.7}
          emissive={highlightColor}
          emissiveIntensity={rimIntensity * 0.15}
        />
      </mesh>

      {/* Detective Hat Brim (Noir Silhouette) */}
      <mesh position={[0, 2.3, 0]} rotation={[-0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.04, 16]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.85} />
      </mesh>
      {/* Hat Crown */}
      <mesh position={[0, 2.45, -0.02]} rotation={[-0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.26, 16]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.85} />
      </mesh>

      {/* Subtle Rim Light Shader Mesh */}
      <mesh position={[0, 1.8, 0]} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial
          color={highlightColor}
          transparent
          opacity={rimIntensity * 0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
