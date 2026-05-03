// Camera keyframes per section. Each: position, lookAt, fov.
// Interpolation runs scroll-driven via lerp (not GSAP .to).
export const CAMERA_KEYFRAMES = {
  hero: {
    position: { x: 0.3, y: 1.5, z: 3.8 },
    lookAt:   { x: 0,   y: 1.0, z: 0 },
    fov: 35,
  },
  manifesto: {
    position: { x: -0.8, y: 1.4, z: 3.5 },
    lookAt:   { x: 0,    y: 1.0, z: 0 },
    fov: 38,
  },
  work: {
    position: { x: -1.5, y: 1.5, z: 4.5 },
    lookAt:   { x: -0.5, y: 1.0, z: 0 },
    fov: 35,
  },
  method: {
    position: { x: 1.2, y: 1.2, z: 3.8 },
    lookAt:   { x: 0.5, y: 1.0, z: 0 },
    fov: 35,
  },
  founders: {
    position: { x: -1.0, y: 1.7, z: 3.5 },
    lookAt:   { x: -0.3, y: 1.1, z: 0 },
    fov: 38,
  },
  contact: {
    position: { x: 0,   y: 1.5, z: 3.2 },
    lookAt:   { x: 0,   y: 1.2, z: 0 },
    fov: 35,
  },
};

// Bone rotations per section. Bone names match Meshy GLB (no mixamorig prefix).
// Default axis convention: arm down ~ Z negative on Right side, Z positive on Left side.
// Calibrated for the rest pose of woetive-figure.glb.
export const POSES = {
  apose: {
    RightArm:     { x: 0, y: 0, z: 0 },
    RightForeArm: { x: 0, y: 0, z: 0 },
    RightHand:    { x: 0, y: 0, z: 0 },
    LeftArm:      { x: 0, y: 0, z: 0 },
    LeftForeArm:  { x: 0, y: 0, z: 0 },
    LeftHand:     { x: 0, y: 0, z: 0 },
    Spine01:      { x: 0, y: 0, z: 0 },
    Spine02:      { x: 0, y: 0, z: 0 },
    Head:         { x: 0, y: 0, z: 0 },
  },
  hero: {
    Spine01: { x: 0,    y: 0.05, z: 0 },
    Head:    { x: -0.05, y: 0.10, z: 0 },
  },
  manifesto: {
    Spine01: { x: -0.02, y: 0,    z: 0 },
    Head:    { x: 0,     y: 0,    z: 0 },
  },
  work: {
    RightArm:     { x: 0,    y: 0,    z: -1.2 },
    RightForeArm: { x: 0,    y: -0.3, z:  0   },
    RightHand:    { x: 0,    y: 0,    z: -0.2 },
    Spine01:      { x: 0,    y: -0.08, z: 0   },
    Head:         { x: 0,    y: -0.10, z: 0   },
  },
  method: {
    RightArm:     { x: -0.6, y: 0, z: -0.3 },
    RightForeArm: { x: -0.8, y: 0, z:  0   },
    LeftArm:      { x: -0.6, y: 0, z:  0.3 },
    LeftForeArm:  { x: -0.8, y: 0, z:  0   },
    Spine01:      { x: -0.05, y: 0, z: 0   },
    Head:         { x: -0.10, y: 0, z: 0   },
  },
  founders: {
    Spine01: { x: 0,     y: 0.02, z: 0 },
    Head:    { x: 0,     y: 0.05, z: 0 },
  },
  contact: {
    RightArm:     { x: -0.7,  y: 0, z: -0.4 },
    RightForeArm: { x: -0.5,  y: 0, z:  0   },
    RightHand:    { x: 0,     y: 0, z:  0   },
    Spine01:      { x: -0.03, y: 0, z: 0    },
    Head:         { x: -0.05, y: 0, z: 0    },
  },
};

const lerp = (a, b, t) => a + (b - a) * t;

export function interpolateCamera(camera, from, to, t) {
  camera.position.x = lerp(from.position.x, to.position.x, t);
  camera.position.y = lerp(from.position.y, to.position.y, t);
  camera.position.z = lerp(from.position.z, to.position.z, t);
  const lx = lerp(from.lookAt.x, to.lookAt.x, t);
  const ly = lerp(from.lookAt.y, to.lookAt.y, t);
  const lz = lerp(from.lookAt.z, to.lookAt.z, t);
  camera.lookAt(lx, ly, lz);
  const newFov = lerp(from.fov, to.fov, t);
  if (Math.abs(newFov - camera.fov) > 0.01) {
    camera.fov = newFov;
    camera.updateProjectionMatrix();
  }
}

export function interpolatePose(bones, fromPose, toPose, t) {
  const all = new Set([...Object.keys(fromPose), ...Object.keys(toPose)]);
  all.forEach((name) => {
    const bone = bones[name];
    if (!bone) return;
    const f = fromPose[name] || { x: 0, y: 0, z: 0 };
    const o = toPose[name]   || { x: 0, y: 0, z: 0 };
    bone.rotation.x = lerp(f.x ?? 0, o.x ?? 0, t);
    bone.rotation.y = lerp(f.y ?? 0, o.y ?? 0, t);
    bone.rotation.z = lerp(f.z ?? 0, o.z ?? 0, t);
  });
}

export function applyCamera(camera, kf) {
  camera.position.set(kf.position.x, kf.position.y, kf.position.z);
  camera.lookAt(kf.lookAt.x, kf.lookAt.y, kf.lookAt.z);
  camera.fov = kf.fov;
  camera.updateProjectionMatrix();
}

export function applyPose(bones, pose) {
  Object.entries(pose).forEach(([name, rot]) => {
    const b = bones[name];
    if (!b) return;
    b.rotation.x = rot.x ?? 0;
    b.rotation.y = rot.y ?? 0;
    b.rotation.z = rot.z ?? 0;
  });
}
