/*
  motion.js - the GSAP motion layer (marketing/motion-plan.md).

  Deliberate overrides of the taste skill, approved by Pranav on 2026-11-09:
  - the hero headline rises line by line on load (skill: hero text in place on the first frame)
  - each section's content enters once on scroll (skill: no reveal or stagger on scroll)
  - section photographs settle from a slight zoom once (skill: photographs zoom on hover only)
  - the approval, trial and contact rules and the trial timeline draw on once (skill: no line draws)
  Kept from the skill: content is visible without JavaScript and under reduced motion, every effect
  plays once and never replays, transform and opacity only, one ease family, nothing bounces.
*/
(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !window.CustomEase) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('safe.out', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('safe.inOut', 'M0,0 C0.65,0 0.35,1 1,1');
  gsap.defaults({ ease: 'safe.out', duration: 0.8 });
  gsap.config({ nullTargetWarn: false });   // not every section has rules, photos or a timeline

  const html = document.documentElement;
  const hero = document.querySelector('.hero');
  const fontsReady = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]);

  // one shared shape for every effect: plays once, then the inline styles go so the kit's hover layer owns the element again
  const settle = (targets, vars) => gsap.to(targets, { ...vars, clearProps: 'transform,opacity,transition,clipPath' });

  function heroIntro(isDesktop) {
    if (!hero) return;
    const h1 = hero.querySelector('h1');
    const photo = hero.querySelector('.hero__photo');
    fontsReady.then(() => {
      // the rotating word is ignored so its own nodes stay in place for the word-rotate moment
      const split = SplitText.create(h1, { type: 'lines', mask: 'lines', aria: 'none', ignore: '.hero__word' });
      gsap.set(h1, { opacity: 1 });
      const tl = gsap.timeline({ onComplete: () => unwrapLines(split) });
      tl.to(hero.querySelector('.hero__kicker'), { opacity: 1, y: 0, startAt: { y: 8 }, duration: 0.45 }, 0)
        .from(split.lines, { yPercent: 110, stagger: 0.09 }, 0.08)
        .to([hero.querySelector('.hero__lead'), hero.querySelector('.btn-row')], { opacity: 1, y: 0, startAt: { y: 12 }, stagger: 0.08 }, 0.45)
        .to(hero.querySelectorAll('.chips > li'), { opacity: 1, y: 0, startAt: { y: 16 }, stagger: 0.07 }, 0.65)
        .to(hero.querySelector('.hero__for'), { opacity: 1, duration: 0.45 }, 0.9);
      if (isDesktop && photo) tl.add(photoSettle(photo, 1.2), 0.3);
    });
  }

  // SplitText.revert() rewrites innerHTML, which would detach the word-rotate nodes: unwrap the line divs in place instead
  function unwrapLines(split) {
    [...split.masks, ...split.lines].forEach(el => el.isConnected && el.replaceWith(...el.childNodes));
  }

  // scale and clip move together, so the photograph settles inside its own outline and never spills past it
  function photoSettle(img, duration = 0.9) {
    const radius = getComputedStyle(img).borderRadius;
    return gsap.fromTo(img, { scale: 1.06, transition: 'none' }, {
      scale: 1, duration,
      onUpdate() { const s = gsap.getProperty(img, 'scale'); img.style.clipPath = `inset(${(1 - 1 / s) * 50}% round ${radius})`; },
      onComplete() { gsap.set(img, { clearProps: 'transform,transition,clipPath' }); },
    });
  }

  function sectionEntrances(isDesktop) {
    const rise = isDesktop ? 24 : 12;
    document.querySelectorAll('main > section.section').forEach(section => {
      const head = section.querySelectorAll(':scope h2, :scope .t-lead');
      const items = section.querySelectorAll('.card, .proof > article, .logos-row, .figures > div, .contact__mail');
      const rules = section.querySelectorAll('.ruled > li');
      const steps = section.querySelectorAll('.timeline > li');
      const photos = isDesktop ? section.querySelectorAll('.frame--photo img') : [];
      gsap.set([...head, ...items, ...rules], { opacity: 0, y: rise });
      gsap.set(rules, { '--draw': 0 });
      gsap.set(steps, { opacity: 0, y: 8, '--draw': 0 });
      ScrollTrigger.create({
        trigger: section, start: 'top 80%', once: true,
        onEnter() {
          settle(head, { opacity: 1, y: 0, stagger: 0.12 });
          settle([...items, ...rules], { opacity: 1, y: 0, stagger: { each: 0.07, amount: Math.min(0.4, 0.07 * (items.length + rules.length)) }, delay: 0.15 });
          gsap.to(rules, { '--draw': 1, duration: 0.45, stagger: 0.07, delay: 0.3 });
          if (steps.length) {
            // the connector of each milestone draws towards the next one, and the next settles as it arrives
            const tl = gsap.timeline({ delay: 0.3 });
            steps.forEach((li, i) => {
              tl.add(settle(li, { opacity: 1, y: 0, duration: 0.45 }), i * 0.3);
              tl.to(li, { '--draw': 1, duration: 0.3, ease: 'none' }, i * 0.3 + 0.15);
            });
          }
          photos.forEach(img => photoSettle(img));
        },
      });
    });
  }


  gsap.matchMedia().add({
    isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
    isPhone: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  }, ctx => {
    const { isDesktop } = ctx.conditions;
    html.classList.add('motion-ready');
    // if the intro never starts, the hero must not stay hidden
    const guard = setTimeout(() => gsap.set(hero?.querySelectorAll('h1, .hero__kicker, .hero__lead, .btn-row, .chips > li, .hero__for') || [], { opacity: 1 }), 3000);
    heroIntro(isDesktop);
    sectionEntrances(isDesktop);
    fontsReady.then(() => ScrollTrigger.refresh());
    return () => { clearTimeout(guard); html.classList.remove('motion-ready'); };
  });
})();
