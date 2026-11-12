// Plays the recorded feature montage and shows the feature of the current cut, timed by mission-cues.js.
// The video is recorded from ../scene-src (see the README) and loops.
import { CUES } from './mission-cues.js';

const root = document.querySelector('[data-mission]');

if (root) {
  const video = root.querySelector('.mission__video');
  const feature = root.querySelector('.mission__feature');
  const playButton = root.querySelector('[data-play]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shown = '';
  let swap = 0;
  let userPaused = false;
  let visible = false;

  function showFeature() {
    const label = [...CUES].reverse().find((cue) => video.currentTime >= cue.at - 0.05)?.label || CUES[0].label;
    if (label === shown) return;
    shown = label;
    clearTimeout(swap);
    feature.classList.add('is-swapping');
    swap = setTimeout(() => { feature.textContent = label; feature.classList.remove('is-swapping'); }, 150);
  }

  const sync = () => {
    root.classList.toggle('is-paused', video.paused);
    playButton.setAttribute('aria-label', video.paused ? 'Play the video' : 'Pause the video');
  };
  playButton.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause(); else video.play().catch(() => {});
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  ['timeupdate', 'seeked'].forEach((type) => video.addEventListener(type, showFeature));

  // timeupdate fires about four times a second, so frames between them keep the label on the cut
  function tick() {
    showFeature();
    if (visible && !video.paused) requestAnimationFrame(tick);
  }
  video.addEventListener('playing', () => requestAnimationFrame(tick));

  if (reduced) {
    video.preload = 'none';
    playButton.hidden = true;
    root.classList.add('is-paused');
  } else {
    const show = () => { visible = true; if (!userPaused) video.play().catch(() => {}); };
    const hide = () => { visible = false; video.pause(); };
    if (window.SAFEMission) window.SAFEMission.register({ play: show, pause: hide, seek: (k) => { video.currentTime = k * video.duration; } });
    else new IntersectionObserver(([e]) => (e.isIntersecting ? show() : hide())).observe(root);
    sync();
  }
}
