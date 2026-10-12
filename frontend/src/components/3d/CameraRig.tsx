import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CameraRigProps {
  scrollProgress: number;
}

export const CameraRig: React.FC<CameraRigProps> = ({ scrollProgress }) => {
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    // Interpolate camera path based on scroll progress (0.0 to 1.0)
    const p = Math.max(0, Math.min(1, scrollProgress));

    if (p <= 0.28) {
      // Scene 1: High wide cinematic establishing shot pushing slowly
      const t = p / 0.28;
      targetPos.current.set(
        THREE.MathUtils.lerp(0, 0.8, t),
        THREE.MathUtils.lerp(5.2, 4.0, t),
        THREE.MathUtils.lerp(12.5, 9.0, t)
      );
      targetLook.current.set(0, 1.3, 0);
    } else if (p <= 0.62) {
      // Scene 2: Camera pushes right up to the table, revealing evidence and characters
      const t = (p - 0.28) / (0.62 - 0.28);
      targetPos.current.set(
        THREE.MathUtils.lerp(0.8, 2.2, t),
        THREE.MathUtils.lerp(4.0, 2.7, t),
        THREE.MathUtils.lerp(9.0, 5.8, t)
      );
      targetLook.current.set(
        THREE.MathUtils.lerp(0, -0.2, t),
        1.25,
        0
      );
    } else if (p <= 0.86) {
      // Scene 3: Dramatic orbit arc around the table into the shadows for the reveal
      const t = (p - 0.62) / (0.86 - 0.62);
      targetPos.current.set(
        THREE.MathUtils.lerp(2.2, -2.5, t),
        THREE.MathUtils.lerp(2.7, 2.2, t),
        THREE.MathUtils.lerp(5.8, 4.6, t)
      );
      targetLook.current.set(
        THREE.MathUtils.lerp(-0.2, 0.1, t),
        1.3,
        0
      );
    } else {
      // Scene 4: Settle directly onto the investigation table facing the suspect circle
      const t = (p - 0.86) / (1.0 - 0.86);
      targetPos.current.set(
        THREE.MathUtils.lerp(-2.5, 0, t),
        THREE.MathUtils.lerp(2.2, 2.1, t),
        THREE.MathUtils.lerp(4.6, 3.8, t)
      );
      targetLook.current.set(0, 1.25, -0.4);
    }

    // Smooth lerp to destination for butter-smooth motion on any trackpad/wheel
    camera.position.lerp(targetPos.current, 0.08);

    // Update lookAt
    const currentLook = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    currentLook.lerp(targetLook.current, 0.08);
    camera.lookAt(currentLook);
  });

  return null;
};
