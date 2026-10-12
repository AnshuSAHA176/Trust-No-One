import React, { useMemo } from 'react';
import * as THREE from 'three';

interface Evidence3DProps {
  scrollProgress: number;
}

export const Evidence3D: React.FC<Evidence3DProps> = ({ scrollProgress }) => {
  // Clues slide into scene with depth as visitor scrolls into Scene 2 (0.25 - 0.65)
  const slideProgress = Math.min(1, Math.max(0, (scrollProgress - 0.2) * 2.5));
  const redThreadGlow = Math.min(1, Math.max(0, (scrollProgress - 0.3) * 3));

  // 3D curve for the glowing red evidence thread connecting clues
  const points = useMemo(() => {
    return [
      new THREE.Vector3(-0.8, 1.25, -0.6), // Photo A
      new THREE.Vector3(-0.2, 1.35, -0.2), // Raised thread pin
      new THREE.Vector3(0.5, 1.25, -0.4),  // Dossier file
      new THREE.Vector3(0.7, 1.32, 0.3),   // Tape recorder
      new THREE.Vector3(-0.4, 1.25, 0.5),  // Photo B
    ];
  }, []);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.008, 8, false);
  }, [curve]);

  return (
    <group position={[0, 0, 0]}>
      {/* Evidence Dossier Folders on Table */}
      <group
        position={[
          0.5 * slideProgress,
          1.22,
          -0.4 - (1 - slideProgress) * 0.4,
        ]}
        rotation={[0, 0.25, 0]}
      >
        {/* Manila Folder Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.02, 0.48]} />
          <meshStandardMaterial color="#c2b08a" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Red Confidential Label */}
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0.05]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color="#b91c1c" />
        </mesh>
      </group>

      {/* Forensic Evidence Photograph 1 */}
      <group
        position={[
          -0.8 * slideProgress,
          1.23,
          -0.6 - (1 - slideProgress) * 0.3,
        ]}
        rotation={[0, -0.35, 0]}
      >
        {/* Photo Paper */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.008, 0.46]} />
          <meshStandardMaterial color="#f5f2eb" roughness={0.5} />
        </mesh>
        {/* Photo Image Black/White Tone */}
        <mesh position={[0, 0.006, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.32, 0.34]} />
          <meshStandardMaterial color="#1a1c24" roughness={0.8} />
        </mesh>
        {/* Red Pushpin */}
        <mesh position={[0, 0.03, -0.18]} castShadow>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={redThreadGlow * 0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Forensic Evidence Photograph 2 */}
      <group
        position={[
          -0.45 * slideProgress,
          1.23,
          0.5 + (1 - slideProgress) * 0.3,
        ]}
        rotation={[0, 0.42, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.008, 0.44]} />
          <meshStandardMaterial color="#ece7de" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.006, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.32]} />
          <meshStandardMaterial color="#181920" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.03, -0.17]} castShadow>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={redThreadGlow * 0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Retro Reel-to-Reel Audio Recorder (Clue Device) */}
      <group
        position={[
          0.7 * slideProgress,
          1.27,
          0.3 + (1 - slideProgress) * 0.2,
        ]}
        rotation={[0, -0.15, 0]}
      >
        {/* Main Recorder Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.09, 0.35]} />
          <meshStandardMaterial color="#222630" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Tape Spools */}
        {[-0.12, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
            <meshStandardMaterial color="#0e1017" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* VU Meter Amber Light */}
        <mesh position={[0, 0.048, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.04]} />
          <meshBasicMaterial color="#d97706" />
        </mesh>
      </group>

      {/* The Iconic Red Evidence Thread linking suspicious clues */}
      {redThreadGlow > 0.05 && (
        <group>
          <mesh geometry={tubeGeometry}>
            <meshStandardMaterial
              color="#b91c1c"
              emissive="#ef4444"
              emissiveIntensity={0.8 + redThreadGlow * 1.4}
              roughness={0.2}
            />
          </mesh>
          {/* Subtle thread point light */}
          <pointLight
            position={[0, 1.35, 0]}
            color="#ef4444"
            intensity={redThreadGlow * 0.7}
            distance={2.5}
          />
        </group>
      )}
    </group>
  );
};
