// Runs the use-case films as a sequence: the active film plays once while the row is on screen, then the next one opens.
// Hover, focus, a click, a swipe on phones or a #film-name link jumps to a film, and a film under the mouse repeats until the mouse leaves.
// Under reduced motion nothing plays or advances until the visitor presses play on a film.
const row = document.querySelector('[data-cases]');
const cases = [...row.querySelectorAll('.case')];
const swipeStrip = matchMedia('(max-width: 639px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let rowOnScreen = false;
let userPaused = reducedMotion;
let caseUnderMouse = null;

function syncPlayback() {
  cases.forEach((item) => {
    const film = item.querySelector('video');
    const playing = item.classList.contains('is-active') && !userPaused;
    if (playing && rowOnScreen) film.play().catch(() => {}); else film.pause();
    item.classList.toggle('is-paused', !playing);
    item.querySelector('.case__pause').setAttribute('aria-label', playing ? 'Pause the film' : 'Play the film');
  });
}

function activate(item) {
  if (item.classList.contains('is-active')) return;
  cases.forEach((other) => {
    const active = other === item;
    const film = other.querySelector('video');
    other.classList.toggle('is-active', active);
    other.querySelector('.case__switch').setAttribute('aria-pressed', active);
    if (!active && film.readyState) film.currentTime = 0; // each film starts its story from the first caption
  });
  syncPlayback();
}

function playChosen(item) {
  userPaused = false;
  activate(item);
  syncPlayback();
}

function advanceFrom(item) {
  if (reducedMotion) { userPaused = true; syncPlayback(); return; }
  if (item === caseUnderMouse) { item.querySelector('video').play().catch(() => {}); return; }
  const next = cases[(cases.indexOf(item) + 1) % cases.length];
  activate(next);
  if (swipeStrip.matches) row.scrollTo({ left: next.offsetLeft - cases[0].offsetLeft, behavior: 'smooth' });
}

cases.forEach((item) => {
  const film = item.querySelector('video');
  const clip = item.querySelector('.case__clip');
  const button = item.querySelector('.case__switch');
  film.loop = false; // the end of a film hands over to the next one
  film.addEventListener('ended', () => advanceFrom(item));
  film.addEventListener('timeupdate', () => clip.style.setProperty('--played', film.currentTime / film.duration || 0));
  button.addEventListener('click', () => (reducedMotion ? playChosen(item) : activate(item)));
  item.querySelector('.case__pause').addEventListener('click', () => {
    if (item.classList.contains('is-active') && !userPaused) { userPaused = true; syncPlayback(); } else playChosen(item);
  });
  if (reducedMotion) return;
  button.addEventListener('focus', () => activate(item));
  item.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { caseUnderMouse = item; activate(item); } });
  item.addEventListener('pointerleave', () => { caseUnderMouse = null; });
  // on the phone swipe strip the film that fills the strip becomes active
  new IntersectionObserver(([entry]) => { if (swipeStrip.matches && entry.isIntersecting) activate(item); }, { root: row, threshold: 0.75 }).observe(item);
});

new IntersectionObserver(([entry]) => { rowOnScreen = entry.isIntersecting; syncPlayback(); }, { threshold: 0.3 }).observe(row);

const linked = cases.find((item) => `#${item.id}` === location.hash);
if (linked) activate(linked);
syncPlayback();
