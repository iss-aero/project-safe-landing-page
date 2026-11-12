# SAFE site

Static single page. No build step and no framework. Fonts (Roboto, Roboto Mono) and photographs are
bundled, so the page makes no third-party requests.

The public brand is **SAFE**, always in full capitals, expanded as *Swarm Autonomy Flight Environment*
(the name in the SAFE Product Strategy). The grant keeps SAFE-POS on Innovate UK paperwork.

## Run locally

```sh
python3 -m http.server 8741 -d site
# open http://localhost:8741
```

A server is required, because ES modules do not load from `file://`.

## How the page is built

The words come from `../marketing/site-content.md` (buyer profiles, section order, copy deck and claims
check). The design follows the design-taste-frontend skill (kit copied into `assets/`: `system.css`,
`system.js`, `motion/`, `layout/`, `moments/`, `ui/`). Page-only CSS is `css/page.css`. The worked
example and the hero loop are videos recorded from the 3D scene in `../scene-src` (see below). The scene's
three.js r186 bundle there was built with esbuild from the three npm package: an entry that re-exports the
`THREE.*` names the scene uses plus GLTFLoader, HDRLoader, MeshoptDecoder, EffectComposer, RenderPass,
UnrealBloomPass, BokehPass, OutputPass and ShaderPass (`esbuild entry.js --bundle --minify --format=esm`).

Sections: hero, pain, worked example (recorded 3D mission), outcomes, who it is for, approval, proof,
statement, trial offer, contact.

## Decisions

- **No product screens.** SAFE has no operator interface yet, so the page shows no console or UI mock-ups.
  The worked example is an illustrated 3D site, labelled as an illustration.
- **Sections are as tall as their content.** This overrides the skill's one-section-per-screen rule, which
  left the page too empty.
- **Photographs** come from the ISS marketing library (`../marketing/iss-library-2026`), exported as web
  sizes into `assets/photos/`.
- **Nothing Commercial in Confidence** from the Product Strategy goes on the page, and no internal safety
  artefact names. SAFE is not described as certified.
- **Colours** are the ISS brand: orange `#FF5832`, dark `#3B3838`, grey `#A8A8A8`, light orange `#FFCFBF`.

## Motion overrides

`js/motion.js` runs GSAP 3.15.0, vendored in `vendor/gsap/` under the GSAP Standard Licence (free,
Webflow). The plan is `../marketing/motion-plan.md`. These break the taste skill's motion rules on
purpose, approved by Pranav on 2026-11-09, so its checker's reveal and scroll findings for them are
expected:

- The hero headline rises line by line on load, with the lead, buttons and outcome cards after it.
- Each section's heading, lead and cards enter once on scroll. Nothing replays or reverses.
- Section photographs settle from a slight zoom once, on desktop.
- The ruled lists and the trial timeline draw on once.

Kept from the skill: without JavaScript and under reduced motion every element is visible and still,
the hidden start states exist only under `html.motion-ready`, motion is transform and opacity only,
one ease family (`safe.out`), nothing bounces, and native scrolling with smooth anchor links.
The 2027 figure does not count. `DrawSVGPlugin` and `ScrollToPlugin` are vendored but not loaded.

## The mission section and the hero loop

Both are videos recorded from the real-time 3D scene in `../scene-src` (its README says how to re-record with
one command). The page loads no three.js and no models.

- **Mission section:** a quick-cut feature montage, about 23 s, looping: patrol, search, tracking, logistics,
  fault handling (two cuts) and operation without GPS. `assets/video/mission.av1.mp4` (AV1, first) and
  `mission.mp4` (H.264 fallback) at 1920 x 1080, plus `mission-mobile.*` at 1080 x 1350 for phones, chosen with
  `<source media>`. Frames are rendered at twice (phones three times) the output size and scaled down. Vehicle
  labels, sensor footprints and the vehicle-camera insets are drawn into the frames.
- **Feature label:** `js/mission-video.js` shows the current cut's feature (top left), timed by
  `js/mission-cues.js`, which the recorder writes. Play and pause sit in the corner. It plays only on screen
  (through the motion layer's `SAFEMission` hook). Under reduced motion the poster stays.
- **Hero loop:** `assets/video/hero-loop.av1.mp4` and `hero-loop.mp4`, 864 x 1080 at 30 fps, four cuts of the
  same montage (patrol, tracking, logistics, fault) in a 4:5 framing composed for the hero frame.
  `js/hero-video.js` plays it on screen and runs the pause button. Under reduced motion only the poster shows.
- **The Sensus M4 model** in the recordings is an exterior shell of ISS CAD. ISS must confirm it may be
  shown publicly before this page goes live.

## Before you post the link

- [ ] Replace `safe@iss-aerospace.example` with the ISS general inbox (form action and email link).
- [ ] Confirm "We handle the trial approvals with you" and the Sensus M4 line with ISS.
- [ ] Re-check the 129 and 105 RIDDOR figures against the Port Skills and Safety 2025 report.
- [ ] Confirm the photographs are cleared for public web use, or replace the quay stand-in with ISS's own.
