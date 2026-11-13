// Cinematic story captions for each film, from data-captions: [[seconds, "kicker", "line"], ...].
// A film may also pop up a small onboard-camera window, from data-inset: {src, from, to, label}.
// Screen readers get the whole story from the video's aria-label, so captions and windows are hidden from them.
function makeCaption(frame) {
  const caption = document.createElement('div');
  caption.className = 'film-caption';
  caption.setAttribute('aria-hidden', 'true');
  caption.innerHTML = '<p class="film-caption__kicker"></p><p class="film-caption__line"></p>';
  frame.append(caption);
  return caption;
}

function makeInset(frame, { src, label }) {
  const inset = document.createElement('figure');
  inset.className = 'film-inset';
  inset.setAttribute('aria-hidden', 'true');
  inset.innerHTML = `<video muted playsinline preload="none" src="${src}"></video><figcaption>${label}</figcaption>`;
  frame.append(inset);
  return inset;
}

document.querySelectorAll('video[data-captions]').forEach((video) => {
  const beats = JSON.parse(video.dataset.captions);
  const frame = video.closest('figure, .hero__art');
  const caption = makeCaption(frame);
  const [kicker, line] = caption.children;
  const insetSpec = video.dataset.inset && JSON.parse(video.dataset.inset);
  const inset = insetSpec && makeInset(frame, insetSpec);
  let shown = -1;

  const show = () => {
    const t = video.currentTime;
    const index = beats.findLastIndex(([at]) => t >= at);
    if (index !== shown) {
      shown = index;
      caption.classList.remove('is-in');
      void caption.offsetWidth; // restart the entrance animation for the new beat
      kicker.textContent = beats[index][1];
      line.textContent = beats[index][2];
      caption.classList.add('is-in');
    }
    if (inset) {
      const open = t >= insetSpec.from && t < insetSpec.to;
      if (open !== inset.classList.contains('is-open')) {
        inset.classList.toggle('is-open', open);
        const clip = inset.querySelector('video');
        if (open) { clip.currentTime = 0; clip.play().catch(() => {}); } else clip.pause();
      }
    }
  };
  video.addEventListener('timeupdate', show);
  video.addEventListener('seeked', show);
  show();
});
