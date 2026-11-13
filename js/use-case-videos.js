// Plays each use-case clip only while it is on screen. With reduced motion the posters stay still.
const clips = document.querySelectorAll('[data-cases] video');

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) target.play().catch(() => {}); else target.pause();
  }), { threshold: 0.5 });
  clips.forEach((clip) => observer.observe(clip));
}
