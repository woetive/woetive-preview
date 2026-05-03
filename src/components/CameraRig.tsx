import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { cameraStateAt, type CameraState } from '../scene/cameraPath';

type Props = {
  scrollRef: React.RefObject<number>;
  figureGroupRef: React.RefObject<THREE.Group>;
  particlesGroupRef: React.RefObject<THREE.Group>;
  limeMatRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Drives camera + model + particles + bg + lime intensity from scroll progress.
// All updates are damped so fast scrolling still looks cinematic.
export function CameraRig({ scrollRef, figureGroupRef, particlesGroupRef, limeMatRef }: Props) {
  const { scene, gl, camera } = useThree();
  const sceneBg = useRef(new THREE.Color('#050505'));
  const tmp = useRef(new THREE.Color());
  const cur = useRef<CameraState>({
    pos: [0, 0, 0], look: [0, 0, 0], fov: 35, bg: '#050505',
    mp: [0, 0, 0], mr: 0, ms: 1, pa: 0.4, li: 1.15,
  });

  useEffect(() => {
    scene.background = sceneBg.current;
    gl.setClearColor(sceneBg.current, 1);
  }, [scene, gl]);

  useFrame(() => {
    const target = cameraStateAt(scrollRef.current ?? 0);
    const c = cur.current;

    // Camera position + look + fov
    const D = 0.085;
    c.pos[0]  += (target.pos[0]  - c.pos[0])  * D;
    c.pos[1]  += (target.pos[1]  - c.pos[1])  * D;
    c.pos[2]  += (target.pos[2]  - c.pos[2])  * D;
    c.look[0] += (target.look[0] - c.look[0]) * 0.10;
    c.look[1] += (target.look[1] - c.look[1]) * 0.10;
    c.look[2] += (target.look[2] - c.look[2]) * 0.10;
    c.fov     += (target.fov     - c.fov)     * 0.10;

    camera.position.set(c.pos[0], c.pos[1], c.pos[2]);
    camera.lookAt(c.look[0], c.look[1], c.look[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(c.fov - camera.fov) > 0.01) {
        camera.fov = c.fov;
        camera.updateProjectionMatrix();
      }
    }

    // Figure transform
    const fg = figureGroupRef.current;
    if (fg) {
      c.mp[0] += (target.mp[0] - c.mp[0]) * 0.09;
      c.mp[1] += (target.mp[1] - c.mp[1]) * 0.09;
      c.mp[2] += (target.mp[2] - c.mp[2]) * 0.09;
      c.mr    += (target.mr    - c.mr)    * 0.09;
      c.ms    += (target.ms    - c.ms)    * 0.09;
      fg.position.set(c.mp[0], c.mp[1], c.mp[2]);
      fg.userData.baseRotY = c.mr;          // Humanoid component reads this
      fg.scale.setScalar(c.ms);
    }

    // Particles — opacity + follow figure
    const pg = particlesGroupRef.current;
    if (pg) {
      c.pa += (target.pa - c.pa) * 0.06;
      pg.userData.opacity = c.pa;
      pg.position.set(c.mp[0] - 1.0, c.mp[1] + 1.4, c.mp[2] - 1.2);
    }

    // Lime emissive
    if (limeMatRef.current) {
      c.li += (target.li - c.li) * 0.08;
      limeMatRef.current.emissiveIntensity = c.li;
    }

    // Background color lerp
    tmp.current.set(target.bg);
    sceneBg.current.lerp(tmp.current, 0.06);
    gl.setClearColor(sceneBg.current, 1);

    // Theme inversion
    const lum = sceneBg.current.r * 0.299 + sceneBg.current.g * 0.587 + sceneBg.current.b * 0.114;
    document.documentElement.dataset.theme = lum > 0.5 ? 'light' : 'dark';
  });

  return null;
}
