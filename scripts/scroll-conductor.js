import { CAMERA_KEYFRAMES, POSES, interpolateCamera, interpolatePose, applyCamera, applyPose } from './camera-rig.js';

// Linear timeline of sections. Each `3d` section pins for its duration and drives
// camera + pose interpolation between previous and current keyframes.
const TIMELINE = [
  { id: 'hero',         type: '3d',     camera: 'hero',      pose: 'hero' },
  { id: 'manifesto',    type: '3d',     camera: 'manifesto', pose: 'manifesto' },
  { id: 'interlude-01', type: 'video' },
  { id: 'work',         type: '3d',     camera: 'work',      pose: 'work' },
  { id: 'interlude-02', type: 'video' },
  { id: 'method',       type: '3d',     camera: 'method',    pose: 'method' },
  { id: 'trust',        type: 'static' },
  { id: 'why',          type: 'static' },
  { id: 'testimonials', type: 'static' },
  { id: 'founders',     type: '3d',     camera: 'founders',  pose: 'founders' },
  { id: 'contact',      type: '3d',     camera: 'contact',   pose: 'contact' },
];

export function initScrollConductor({ canvas, camera, bones, figureMaterial }) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) { console.warn('[conductor] ScrollTrigger not loaded'); return; }
  window.gsap?.registerPlugin(ScrollTrigger);

  applyCamera(camera, CAMERA_KEYFRAMES.hero);
  applyPose(bones, POSES.apose);
  applyPose(bones, POSES.hero);

  TIMELINE.forEach((section, i) => {
    const el = document.getElementById(section.id);
    if (!el) return;

    if (section.type === 'static') return;

    if (section.type === 'video') {
      bindInterlude(el, canvas);
      return;
    }

    const prev = lastKeyframe(TIMELINE, i);
    const fromCam = CAMERA_KEYFRAMES[prev.camera];
    const toCam   = CAMERA_KEYFRAMES[section.camera];
    const fromPose = POSES[prev.pose];
    const toPose   = POSES[section.pose];

    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onEnter:     () => fadeCanvas(canvas, 1),
      onEnterBack: () => fadeCanvas(canvas, 1),
      onUpdate: (self) => {
        const p = self.progress;
        interpolateCamera(camera, fromCam, toCam, p);
        interpolatePose(bones, fromPose, toPose, p);
        sectionOverlay(section.id, p, el, figureMaterial);
      },
    });
  });

  // Lime accents reveal once per element when scrolled into view
  document.querySelectorAll('.lime').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

function sectionOverlay(id, p, el, figureMaterial) {
  if (id === 'manifesto') {
    const spans = el.querySelectorAll('.manifesto__headline span');
    spans[0]?.classList.toggle('is-visible', p > 0.20);
    spans[1]?.classList.toggle('is-visible', p > 0.50);
  }
  if (id === 'work') {
    el.querySelectorAll('.work-card').forEach((card, i) => {
      const threshold = 0.30 + (i * 0.18);
      card.classList.toggle('is-visible', p >= threshold);
    });
    if (figureMaterial) {
      figureMaterial.emissiveIntensity = (p > 0.45 && p < 0.55) ? 1.2 : 0.6;
    }
  }
  if (id === 'method') {
    const steps = el.querySelectorAll('.method-steps > li');
    const thresholds = [0.20, 0.45, 0.70, 0.90];
    steps.forEach((step, i) => step.classList.toggle('is-visible', p >= thresholds[i]));
  }
  if (id === 'contact' && figureMaterial) {
    figureMaterial.emissiveIntensity = 0.6 + Math.max(0, p - 0.7) / 0.3 * 0.9;
  }
}

function lastKeyframe(timeline, fromIdx) {
  for (let i = fromIdx - 1; i >= 0; i--) {
    if (timeline[i].type === '3d') return timeline[i];
  }
  return { camera: 'hero', pose: 'hero' };
}

function fadeCanvas(canvas, opacity) {
  if (!canvas) return;
  canvas.style.opacity = String(opacity);
}

function bindInterlude(section, canvas) {
  const ScrollTrigger = window.ScrollTrigger;
  const video = section.querySelector('video');
  const bottomEyebrow = section.querySelector('.eyebrow--bottom-left, .eyebrow--bottom-right');
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
    pin: true,
    pinSpacing: true,
    onEnter:     () => fadeCanvas(canvas, 0),
    onEnterBack: () => fadeCanvas(canvas, 0),
    onLeave:     () => fadeCanvas(canvas, 1),
    onLeaveBack: () => fadeCanvas(canvas, 1),
    onUpdate: (self) => {
      const p = self.progress;
      if (video?.duration) video.currentTime = p * video.duration;
      bottomEyebrow?.classList.toggle('is-visible', p >= 0.7);
    },
  });
}

