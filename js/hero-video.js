// Plays the hero loop while it is on screen, with a pause button. Under reduced motion the poster stays.
const video = document.querySelector('.hero__video');
if (video) {
  const art = video.closest('.hero__art');
  const button = art.querySelector('.hero__pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = reduced;
  const sync = () => {
    art.classList.toggle('is-paused', video.paused);
    button.setAttribute('aria-label', video.paused ? 'Play the video' : 'Pause the video');
  };
  if (reduced) { video.pause(); button.hidden = true; }
  button.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause(); else video.play();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !userPaused) video.play().catch(() => {});
    else video.pause();
  }).observe(video);
  sync();
}
