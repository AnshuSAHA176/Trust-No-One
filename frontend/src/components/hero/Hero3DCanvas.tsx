import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { InterrogationRoom3D } from '../3d/InterrogationRoom3D';
import { Characters3D } from '../3d/Characters3D';
import { Evidence3D } from '../3d/Evidence3D';
import { AtmosphereParticles } from '../3d/AtmosphereParticles';
import { CameraRig } from '../3d/CameraRig';

interface Hero3DCanvasProps {
  scrollProgress: number;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ scrollProgress }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-noir-950 p-8 text-center">
        <div className="max-w-md p-6 border border-crimson/30 bg-noir-900/80 rounded-lg">
          <div className="stamp-top-secret mb-4">CLASSIFIED DOSSIER</div>
          <h2 className="font-editorial text-2xl text-ivory-100 mb-2">3D Acceleration Unavailable</h2>
          <p className="text-sm text-ivory-300">
            Proceeding in 2D tactical investigation mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5.2, 12.5], fov: 42 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          <InterrogationRoom3D scrollProgress={scrollProgress} />
          <Characters3D scrollProgress={scrollProgress} />
          <Evidence3D scrollProgress={scrollProgress} />
          <AtmosphereParticles />
          <CameraRig scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
};
