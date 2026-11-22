// Only one use-case film plays at a time so two films side by side never compete for attention.
// The active film plays once, then the next film on screen takes over. Hovering a film or pressing its play button makes it the active one.
// The pause button stops the films until play is pressed again. Under reduced motion nothing plays until the visitor presses play.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cases = [...document.querySelectorAll('.case')];
const onScreen = new Set();
let active = null;
let userPaused = reducedMotion;

const filmOf = (item) => item.querySelector('video');

const syncPlayback = () => {
  if (active && !onScreen.has(active)) active = cases.find((item) => onScreen.has(item)) || null;
  cases.forEach((item) => {
    const isActive = item === active;
    const film = filmOf(item);
    if (isActive && !userPaused) film.play().catch(() => {}); else film.pause();
    item.classList.toggle('is-active', isActive);
    item.classList.toggle('is-paused', !isActive || userPaused);
    item.querySelector('.case__pause').setAttribute('aria-label', isActive && !userPaused ? 'Pause the film' : 'Play the film');
  });
};

const makeActive = (item) => { active = item; syncPlayback(); };

const nextOnScreen = (item) => {
  const visible = cases.filter((other) => onScreen.has(other));
  return visible[(visible.indexOf(item) + 1) % visible.length] || null;
};

cases.forEach((item) => {
  const film = filmOf(item);
  film.loop = false;
  film.addEventListener('ended', () => { film.currentTime = 0; makeActive(nextOnScreen(item)); });
  item.addEventListener('mouseenter', () => { if (item !== active && !userPaused) makeActive(item); });
  item.querySelector('.case__pause').addEventListener('click', () => {
    if (item === active) userPaused = !userPaused; else { userPaused = false; active = item; }
    syncPlayback();
  });
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) onScreen.add(item); else onScreen.delete(item);
    if (!active && onScreen.size) active = cases.find((other) => onScreen.has(other));
    syncPlayback();
  }, { threshold: 0.4 }).observe(item);
});
