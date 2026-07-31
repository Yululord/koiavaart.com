# Valeriia Koiava — Artist Portfolio Website

## Client
Valeriia Koiava — Ukrainian contemporary artist based in Kropyvnytskyi. Works across
painting (primary medium), photography, jewelry, interiors/objects. Runs her own
studio, **Artlab**, teaching painting and drawing.

Quote used on site: *"Art is the ability to arrest a fleeting moment of beauty."*
Bio line: *"Art is born from an inner need, not from calculation."*

Categories/nav taxonomy: **Painting · Photography · Objects · Interiors**

Social/contact (placeholders seen in Figma, confirm real handles):
- Email: her@email.com (placeholder)
- Instagram: @koiavalera
- Photography IG: @koiava_photography
- Jewelry IG: @koiava_jewelry, @harni_zgardy
- Artlab Art Studio: @artlab_kr

## Design source
Figma file: https://www.figma.com/design/hao5yIt8O2vOcS4InWJq9W/Valeriia-Koiava-Web
(single page "Main", frames laid out left-to-right in this order — reads as one
continuous scroll sequence):

1. **Hero** ("Desktop - 3") — big "VALERIIA KOIAVA" wordmark, "Contemporary" /
   "Artist" tagline either side, floating project thumbnails arranged in a 3D arc
   above the fold, footer bar (copyright, category list, black pill "Contact"
   button) already visible at bottom.
2. **Desktop - 5 / 9** — a single wide image band; "Desktop - 9" adds an artwork
   detail overlay: title ("The Fragility Of Being"), medium/size
   ("Oil on Canvas • 31.5 x 31.5 in"), and a short process description. This is the
   pattern for individual artwork call-outs.
3. **Desktop - 6 / 7** — About section: pull quote, portrait image, three short bio
   paragraphs (identity → philosophy → practice/Artlab).
4. **Desktop - 8** — Gallery + Contact/footer: a large scattered/organic
   arrangement of ~12+ images (this is very likely the "line" resting state of the
   floating gallery — see mechanic below), plus contact block (email + social
   links) and the repeated footer bar.
5. A long strip of large portrait-oriented artwork images (nodes `image 47`–`55`,
   `telegram-cloud-photo…`) laid out further right on the canvas — looks like the
   full works/portfolio gallery feeding the floating-image mechanic.

**Type:** General Sans (Fontshare, free licence) throughout — the file
originally specified Gilroy, which is paid, and was switched. Self-hosted
woff2 in `src/fonts/`, wired up with `next/font/local`. Headlines are the
Medium weight, uppercase, tracked -0.04em (the Figma hero is 180px with
-7.2px). Body copy is Regular at natural tracking.

No Figma variables/design tokens defined — colors/type styles are raw values baked
into layers; pull exact values per-component via Figma dev-mode when building each
section rather than relying on a shared token set.

## Image roles (IMPORTANT — got this wrong once)
Two distinct image sets in the Figma file. Do not mix them:

1. **The artist's paintings** (`image 47`–`image 55`, far right on the canvas)
   → `public/images/works/`. These ride the **hero ring** and unwind into the
   line. Nine real paintings; portrait format.
2. **Cutout figure collage** (`image 31`–`image 46`, inside node `2005:431`)
   → `public/images/gallery/`. This is a **static decorative collage** that
   belongs in the dark contact panel at the bottom of the page. It is *not*
   animated and must not be used for the ring.

The greyscale poster-like images visible in the Figma hero (`image 27`) are a
flattened screenshot of the Obys reference used as a placeholder comp — not
content. The real ring content is set 1.

## Reference mechanic
https://experiment.obys.agency/ (Obys "Experiment Space")

- WebGL/canvas scene: images float as scattered 3D planes; scrolling "rewinds" them
  along a path until they line up into a single flat horizontal row (seen at rest
  in the footer/gallery strip in the Figma "Desktop - 8" frame — the cut-out
  figures lined up edge-to-edge match this resting state almost exactly).
  Automated screenshot of the live reference rendered black in this sandboxed
  browser (WebGL likely blocked/no GPU in this headless context) — mechanic
  understanding is based on the page's own description ("3D floating images that
  rewind into a line on scroll") plus DOM text, not a direct visual capture.
- Likely implementation approach: Three.js (or OGL) scene with instanced image
  planes positioned along a curve, curve "progress" driven by scroll position
  (GSAP ScrollTrigger or Lenis + rAF), interpolating each plane between its
  scattered 3D position and its position in the final line.
- The reference explicitly gates the experience to desktop ("designed for desktop,
  please revisit from a larger screen") — need to decide our own mobile strategy
  (see open questions).

## Content strategy
- **Now:** all content hardcoded directly in components/config (no CMS calls).
- **Later:** migrate content to **Sanity CMS**. Implication for now: structure
  hardcoded data (artworks, categories, bio copy, social links) as plain
  data files/objects shaped like they could become Sanity documents later
  (e.g. one object per artwork with title/medium/size/description/image), rather
  than scattering literal strings through JSX — makes the future swap mostly a
  data-fetching change, not a markup rewrite.

## Decisions (2026-07-30)
- **Stack:** Next.js (App Router, TypeScript) + React Three Fiber / drei (Three.js)
  for the floating-image scene + GSAP (ScrollTrigger) for scroll-driven animation.
  Tailwind CSS for layout/type since the design is a small, consistent set of
  black/white styles. Shaped so Sanity can be dropped in later as a data source.
- **Mobile:** fully responsive — the floating/rewind-to-line mechanic must work
  (tuned, not stripped) on touch + small screens, not just gated to desktop like
  the Obys reference.
- **Assets:** build with Figma placeholder images for now; real photography swapped
  in later by the client.
- **Site structure:** single continuous scrolling page (no separate routes),
  matching the Figma frame order — sections as scroll anchors, "Contact" scrolls
  to the footer block.
- **Contact:** mailto link + social handles only, no backend contact form.
- **Language:** English only.
- **Repo/deploy:** git initialized in this folder; project set up to deploy to
  Vercel.

## Tuning the hero cylinder
Every parameter lives in `src/config/ring.ts`. Spacing, card width and
vertical position are separate controls, and the coiled cylinder and the
unrolled line each get their own set — so the ring can sit low, tight and
small while the line sits centred, wide and large.

**Copies of the set** wraps the works around the cylinder more than once to
fill it out: 1…9, 1…9, in order. Cloning the whole set in sequence keeps each
copy of a painting the maximum distance from its twin — half the ring at two
copies — so repeats never read as a mistake, and nothing has to fade out on
the way into the line. The card count is therefore always a whole number of
sets, which is also what lets the ring close seamlessly; the gap that falls
out of radius and copies is reported in the panel.

Motion is measured in *passes through the set of works*, not laps of the whole
band, so `idleSpeed`, `stripTravel` and `pointerPush` keep their meaning when
the copy count changes.

One asymmetry worth knowing: a cylinder only looks seamless if its cards
divide the circumference exactly, so the ring's card count is a whole number
and its gap slider steps rather than glides. The panel reports the count and
the exact gap it settles on ("9 @ 0.293"). The line has no such constraint, so
its gap is continuous. Raising the ring's card count past the number of works
makes a painting recur — that is the cost of a denser ring.

Also on tap: radius, vertical position, tilt on two axes, per-card roll,
height/size scatter, depth fade, idle speed, scroll travel, pointer parallax,
unwrap timing, field of view and hover zoom.

Append **`?tune`** to any URL to open a live panel of sliders (works locally
and on a deployed preview; it is hidden without the flag). Adjust until it
looks right, hit **Copy config**, and paste over the defaults in
`src/config/ring.ts` to make it permanent.

`?p=<0–1>` pins the scroll sequence at a given point, which pairs well with
`?tune` for dialling in a specific moment — e.g. `?tune&p=0.2` for mid-unwrap.
`?o=<px>` pins how far the band has scrolled away past the end of the runway,
so `?p=1&o=300` shows the hand-off into the About section.

### Handing off to the next section
Once the strip has travelled through every work there is nothing left for the
runway to drive, so the scene stops being pinned and simply rides the page:
the band translates up one-for-one with the scroll and About slides up over
it. Because the whole sequence is a pure function of scroll position, this
reverses exactly — scrolling back up slides the band down, then walks the
strip backwards, then re-coils it into the cylinder.

The band therefore never dissolves. `fadeStart` is kept as a control but 1
(the default) disables the fade; lower it only if you want the old behaviour
where the strip dissolves before the runway ends.

## Implementation notes
- **Ring** (`src/components/three/works-ring.tsx`): planes sit on a full 360°
  circle around the group's own origin, each rotated to face outward, so the
  far half shows its back and reads mirrored — matching the Figma hero. The
  group is pushed back by one radius so the near edge sits at z = 0; rotating
  the group therefore spins the ring about its centre rather than swinging it
  sideways. Scroll lerps every plane from circle pose → flat line, unwinding
  the group's spin, tilt and depth offset to zero.
- **Scroll progress** (`src/lib/scroll-progress.ts`): read directly from the
  runway element's `getBoundingClientRect()`, memoised per frame. Deliberately
  *not* GSAP ScrollTrigger — it silently failed to update in the preview
  harness, and reading layout directly is simpler and survives resizes and
  restored scroll positions.
- **Smooth scroll** (`src/components/smooth-scroll.tsx`): Lenis, mounted at
  the root. It wraps native scroll rather than transforming a container, so
  `fixed`, `sticky` and `getBoundingClientRect()` all still behave and the
  hero sequence needed no changes. Mounting it above the page also means its
  animation frame runs before the hero's, so scroll is written before it is
  read. Disabled entirely under `prefers-reduced-motion`.
- **Stacking**: `position: sticky` creates its own stacking context, so the
  hero's z-index must live on the sticky element itself, not its children,
  or the fixed ring canvas paints over the wordmark.
- The bottom bar is a normal in-flow footer, not fixed.

## Preview-harness caveats (not app bugs)
- The in-app browser pane pauses `requestAnimationFrame` when hidden, so the
  WebGL canvas goes blank in screenshots taken while it is not fronted.
- Its screenshot capture does not honour `position: sticky`, so any scrolled
  state photographs as blank white even though the DOM is correct.
- Reloading a tab repeatedly exhausts WebGL contexts ("Context Lost"); a fresh
  tab is needed after several reloads.
- Net effect: **the ring at rest is visually verified; the scroll-driven
  unwind-to-line is verified numerically (progress 0 → 0.57 → 0.95) but has
  not been visually confirmed.** Check it in a real browser.

## Open questions / follow-ups
- Real final copy for bio paragraphs, artwork titles/mediums/descriptions, and
  actual social handles + email — currently using Figma placeholder text.
- Exact list + high-res images of artworks for the gallery/floating scene.
- Any custom typeface (the Figma wordmark/headings use a geometric sans — confirm
  exact family/license, e.g. self-hosted font files vs a Google Fonts equivalent).
