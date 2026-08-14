"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Text } from "troika-three-text";
import { createIbiTextMaterial, type IbiTextMaterial } from "@/lib/webgl/createIbiTextMaterial";

// Optional override for WHEN the reveal fires. Defaults reproduce the
// original behaviour exactly (observe this component's own box, fire the
// instant any part of it clears 10% up from the bottom of the viewport),
// which is right for anything that arrives by ordinary vertical scrolling —
// Hero, About, and the Rishikesh lockup.
//
// It exists for the horizontal rail, where the default rootMargin's -10%
// bottom inset is meaningless (panels arrive sideways, not upward) and the
// question is instead how far through the slide the reveal should start.
//
// Note what `selector` is NOT for. The river panel originally pointed it at
// the panel with `threshold: 0.98`, so the dissolve couldn't begin until the
// rail came to rest — no overlap with the slide. That read badly: the reveal
// was tied to the panel's last pixel arriving, so the heading sat blank in
// frame for most of the travel and only resolved once everything had stopped.
// Watching the text block's own box at threshold 0 starts the clock when the
// text itself clears the clip, which is what the eye is actually tracking.
// Reach for `selector` when the reveal genuinely belongs to a beat some other
// element owns, not to delay a heading past its own arrival.
interface TextRevealTrigger {
  // CSS selector for an ancestor to watch INSTEAD of this component's own
  // box. Falls back to the component's box if the selector matches nothing,
  // so a typo degrades to the default behaviour rather than to no reveal.
  selector?: string;
  // Fraction of the observed element that must be visible. Note this has to
  // be paired with a rootMargin that doesn't shrink the root, or a
  // full-height target can never reach it.
  threshold?: number;
  rootMargin?: string;
}

interface TextRevealCanvasProps {
  children: React.ReactNode;
  className?: string;
  // Passthrough for geometry that comes from a *.data.ts file rather than
  // from a class string. Tailwind only extracts arbitrary values it can see
  // statically in JSX, so a data-driven width can't be a className — and
  // wrapping this component in yet another sized div to carry it would put a
  // box between the reveal's `relative` container and the text it measures.
  style?: React.CSSProperties;
  trigger?: TextRevealTrigger;
}

type SdfLine = {
  mesh: Text &
    THREE.Object3D & {
      geometry: THREE.BufferGeometry;
      sync: (callback?: () => void) => void;
      textRenderInfo?: { blockBounds: [number, number, number, number] };
    };
  material: IbiTextMaterial;
  node: HTMLElement;
};

const REVEAL_DELAY_MS = 120;
const REVEAL_DURATION_MS = 966;
const CANVAS_OVERSCAN_PX = 72;

function easeInOut(progress: number) {
  return progress * progress * (3 - 2 * progress);
}

export default function TextRevealCanvas({ children, className, style, trigger }: TextRevealCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Destructured to primitives rather than passed as an object, so the effect's
  // dependency array compares by value. A `trigger={{...}}` object literal in
  // JSX is a new reference on every render, which would tear down and rebuild
  // the whole WebGL scene on any parent re-render.
  const {
    selector: triggerSelector,
    threshold: triggerThreshold = 0,
    rootMargin: triggerRootMargin = "0px 0px -10% 0px",
  } = trigger ?? {};

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
    camera.position.z = 1;

    let lines: SdfLine[] = [];
    let animationFrame = 0;
    let resizeTimer = 0;
    let cancelled = false;

    // BUILDING and PLAYING are deliberately separate. Building is async and
    // slow — it waits on document.fonts.ready, then on one troika sync() per
    // line (each of which lays out glyphs and generates an SDF atlas), then
    // compiles the shader. Playing is one synchronous frame.
    //
    // They used to be one step, and that produced the defect this split
    // exists to fix: the reveal was kicked off by the IntersectionObserver,
    // so the whole async build ran AFTER the heading was already on screen,
    // and `data-ibi-ready` (which is what turns the DOM copy transparent)
    // only flipped at the very tail. The user saw plain, unanimated text for
    // the duration of the build, and only then the dissolve. Hero hid the
    // problem because its build overlaps page load.
    //
    // So now: build eagerly on mount, invisibly (canvas still opacity 0, DOM
    // text still opaque, nothing rendered but a single uProgress-0 frame to
    // warm the pipeline), and let the observer only PLAY. By the time a
    // heading scrolls into view the meshes are already synced and the shader
    // already compiled, so the flip to transparent and the first animated
    // frame happen together.
    //
    // Building eagerly costs no extra GPU context — the WebGLRenderer above
    // is constructed on mount for every instance either way.
    let isBuilt = false;
    let playRequested = false;
    let startedAt = 0;

    const render = (now: number) => {
      if (cancelled) return;
      const rawProgress = THREE.MathUtils.clamp((now - startedAt) / REVEAL_DURATION_MS, 0, 1);
      const progress = easeInOut(rawProgress);
      const seconds = now / 1000;

      lines.forEach(({ material }) => {
        material.uniforms.uProgress.value = progress;
        material.uniforms.uTime.value = seconds;
      });
      renderer.render(scene, camera);

      if (rawProgress < 1) animationFrame = requestAnimationFrame(render);
    };

    // Deliberately does NOT touch data-ibi-ready or the canvas opacity —
    // handing the text over to the SDF layer is the BUILD's job (see the tail
    // of build()), and by the time play() runs the heading has already been
    // invisible for as long as it's existed. All this does is start the clock.
    const play = () => {
      if (cancelled || !isBuilt) return;
      startedAt = performance.now() + REVEAL_DELAY_MS;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(render);
    };

    const disposeLines = () => {
      lines.forEach(({ mesh, material }) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        material.dispose();
      });
      lines = [];
    };

    const sizeRenderer = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width + CANVAS_OVERSCAN_PX * 2);
      const height = Math.max(1, rect.height + CANVAS_OVERSCAN_PX * 2);
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      return rect;
    };

    const build = async () => {
      disposeLines();
      const containerRect = sizeRenderer();
      const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-text]"));

      const pending = nodes.map((node) => {
        const style = getComputedStyle(node);
        // text-transform is a PAINT-time effect in CSS — it never touches
        // textContent — so the SDF copy has to reproduce it by transforming
        // the string itself. Without this, any node styled `uppercase` whose
        // source string isn't already capitalised renders in its authored
        // case on the canvas while the DOM underneath shows caps (the river
        // headline: "Where River Sets The Pace" vs "WHERE RIVER SETS THE
        // PACE"). Hero and About only escaped it because their data is
        // already written in the final case.
        const raw = (node.textContent ?? "").trim();
        const text =
          style.textTransform === "uppercase"
            ? raw.toLocaleUpperCase()
            : style.textTransform === "lowercase"
              ? raw.toLocaleLowerCase()
              : raw;
        const nodeRect = node.getBoundingClientRect();
        const fontSize = Number.parseFloat(style.fontSize);
        const letterSpacing = style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing) / fontSize;
        const lineHeightPx = Number.parseFloat(style.lineHeight);
        const lineHeight = Number.isFinite(lineHeightPx) ? lineHeightPx / fontSize : 1;
        const isItalic = style.fontStyle === "italic";
        const supportedAlign = ["left", "right", "center", "justify"] as const;
        const textAlign = (supportedAlign as readonly string[]).includes(style.textAlign)
          ? (style.textAlign as (typeof supportedAlign)[number])
          : "left";
        // Read the real authored color off the DOM node instead of hardcoding
        // white — this is what let About's ink-on-sand text silently render
        // white (Hero's white-on-video look happened to match by coincidence).
        // getComputedStyle always resolves to an rgb()/rgba() string, which
        // THREE.Color parses directly.
        const color = new THREE.Color(style.color);

        // Tight-content-width measurement, independent of the node's own CSS
        // box width. nodeRect.width is the full layout box (e.g. a `w-full`
        // column), which is fine for maxWidth (wrap point must match the box),
        // but wrong for the post-sync scale correction below: a short line
        // inside a much wider box would get scaled up to fill that box's
        // width, ballooning it far past its real font size. Range gives the
        // tight bounding box of the actual rendered glyphs regardless of the
        // parent element's width.
        const range = document.createRange();
        range.selectNodeContents(node);
        const contentRect = range.getBoundingClientRect();
        const contentWidth = Math.max(contentRect.width, 1);
        // getClientRects() gives one rect per DOM line box, so >1 means the
        // browser actually wrapped this node onto multiple lines (About's
        // headline paragraph). A single-line caption (Hero) gets exactly one.
        const isSingleLine = range.getClientRects().length <= 1;

        const mesh = new Text() as SdfLine["mesh"];
        const material = createIbiTextMaterial(fontSize, text.length, color);
        mesh.text = text;
        mesh.font = `/api/hero-font/${isItalic ? "italic" : "regular"}`;
        mesh.fontSize = fontSize;
        mesh.letterSpacing = letterSpacing;
        mesh.lineHeight = String(lineHeight);
        mesh.textAlign = textAlign;
        // Constraining maxWidth to the DOM box only matters for text that's
        // genuinely meant to wrap across multiple lines in the DOM — the SDF
        // mesh then needs the same width so its line breaks land in the same
        // places. For single-line captions this constraint is actively
        // harmful: the mesh renders with a different font resource
        // (/api/hero-font/...) than the DOM's own CSS font, so a multi-word
        // caption (e.g. Hero's "A RARE") can measure wider in that font than
        // nodeRect.width, forcing troika to wrap at the space even though the
        // real DOM text never wraps. Infinity removes that risk entirely for
        // anything confirmed single-line.
        mesh.maxWidth = isSingleLine ? Infinity : nodeRect.width + 1;
        mesh.anchorX = "center" as unknown as number;
        mesh.anchorY = "middle" as unknown as number;
        mesh.color = color;
        mesh.material = material;
        mesh.renderOrder = 20;
        mesh.position.set(
          nodeRect.left - containerRect.left + nodeRect.width / 2 - containerRect.width / 2,
          containerRect.height / 2 - (nodeRect.top - containerRect.top + nodeRect.height / 2),
          0,
        );
        scene.add(mesh);
        lines.push({ mesh, material, node });

        return new Promise<void>((resolve) => {
          mesh.sync(() => {
            const bounds = mesh.textRenderInfo?.blockBounds;
            if (bounds) {
              const renderedWidth = Math.max(bounds[2] - bounds[0], 1);
              // A single uniform scale preserves the font's real proportions.
              // Scaling X and Y independently made the SDF copy look like a
              // subtly different typeface even though it used the same file.
              // Scaled against the tight content width (not nodeRect.width) —
              // a short line inside a wide `w-full` box would otherwise be
              // blown up to fill the whole box instead of matching its own
              // real rendered size, which is what caused About's eyebrow to
              // balloon up and overlap the headline beneath it.
              const fontScale = contentWidth / renderedWidth;
              mesh.scale.setScalar(fontScale);
            }
            resolve();
          });
        });
      });

      await Promise.all(pending);
      if (cancelled) return;

      // Park every line at progress 0 before the warm-up frame. Materials are
      // freshly constructed here so this is already their value, but setting
      // it explicitly matters on a REBUILD (resize): without it the meshes
      // would inherit whatever progress the previous run's rAF loop left
      // behind and the warm frame would flash a half-dissolved heading.
      lines.forEach(({ material }) => {
        material.uniforms.uProgress.value = 0;
      });

      // compile() uploads the shader program; the render() that follows forces
      // the first real draw call so the driver's lazy pipeline work happens
      // now rather than on the frame the reveal starts. The canvas is still
      // opacity 0 at this point, so neither is visible.
      renderer.compile(scene, camera);
      renderer.render(scene, camera);

      // Hand the text over to the SDF layer NOW, at the end of the build —
      // not when it plays. data-ibi-ready is what makes the DOM copy
      // transparent, and holding it back until playback left the real text
      // fully readable in the meantime. On the rail that was glaring: panel 2
      // slid in with "Where River Sets The Pace" legible in solid ink, then
      // snapped invisible and dissolved itself back in. Vertical sections had
      // a smaller version of the same thing, in the gap between entering the
      // viewport and clearing the observer's -10% margin.
      //
      // Nothing becomes visible here. uProgress is 0, which is the dissolve's
      // scattered-particle start state, so the heading reads as absent until
      // play() runs the clock forward. That's the point: the ONLY form this
      // text ever takes on screen is the reveal.
      container.setAttribute("data-ibi-ready", "true");
      canvas.style.opacity = "1";
      isBuilt = true;

      // If the heading already came into view while this build was in flight,
      // play immediately — this is the ordinary case for Hero, which is on
      // screen from the first paint.
      if (playRequested) play();
    };

    // Warm up immediately, ungated. Note this deliberately does NOT wait for
    // visibility: the observer below decides when to PLAY, not when to build.
    //
    // An IntersectionObserver with a generous rootMargin couldn't do the
    // warm-up job anyway — the observer's intersection rect is clipped by
    // ancestor `overflow: hidden`, and rootMargin only expands the root. The
    // river panel lives inside the rail's clipping sticky frame, so it is
    // genuinely non-intersecting until the rail slides it in; there is no
    // margin wide enough to see it early. Building on mount is the only way
    // to have it ready before it arrives.
    //
    // Still waits on next/font, so measurements aren't taken against the
    // fallback serif before the real face installs.
    void document.fonts.ready.then(() => {
      if (!cancelled) void build();
    });

    // Hero sits at the top of the page, so firing on mount always meant
    // "in view" in practice. About (and any later section reusing this
    // component) doesn't have that guarantee — animating a reveal no one is
    // looking at wastes the moment entirely. So the playback is gated behind
    // the same fire-once IntersectionObserver pattern IllustrationReveal
    // uses, and the reveal starts when the section actually scrolls into
    // frame.
    const requestPlay = () => {
      if (playRequested || cancelled) return;
      playRequested = true;
      // Built already? Start this tick. Otherwise build()'s tail picks up the
      // flag and plays the moment it finishes.
      if (isBuilt) play();
    };

    // Watch the element the caller asked for, falling back to this component's
    // own box — both when no selector was given and when the selector matches
    // nothing, so a typo degrades to the default behaviour rather than to a
    // reveal that never fires.
    const observed =
      (triggerSelector && container.closest<HTMLElement>(triggerSelector)) || container;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        // Ratio is checked explicitly rather than relying on isIntersecting
        // alone: isIntersecting flips true at ANY threshold crossing, and the
        // rail's panels care specifically about having reached a near-1 ratio
        // (i.e. having come to rest inside the frame).
        if (entry.isIntersecting && entry.intersectionRatio >= triggerThreshold) {
          requestPlay();
          visibilityObserver.disconnect();
        }
      },
      { threshold: triggerThreshold, rootMargin: triggerRootMargin },
    );
    visibilityObserver.observe(observed);

    const resizeObserver = new ResizeObserver(() => {
      // No visibility guard here any more — rebuilding an off-screen instance
      // is now harmless (and desirable), because a rebuild no longer reveals
      // anything by itself. It only re-measures and re-syncs; whether the
      // result ever plays is still entirely the observer's decision via
      // playRequested.
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        isBuilt = false;
        cancelAnimationFrame(animationFrame);
        // Hand the text back to the DOM for the duration of the rebuild. The
        // canvas still holds the PREVIOUS layout's glyph positions, which the
        // resize has just invalidated — leaving it up would show the heading
        // at visibly wrong coordinates. Plain DOM text is at least correctly
        // laid out, and this is a resize, so a brief unanimated frame is the
        // better trade.
        container.removeAttribute("data-ibi-ready");
        canvas.style.opacity = "0";
        void build();
      }, 180);
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      container.removeAttribute("data-ibi-ready");
      disposeLines();
      renderer.dispose();
    };
  }, [triggerSelector, triggerThreshold, triggerRootMargin]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`} style={style}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-20 opacity-0"
        style={{
          inset: `-${CANVAS_OVERSCAN_PX}px`,
          width: `calc(100% + ${CANVAS_OVERSCAN_PX * 2}px)`,
          height: `calc(100% + ${CANVAS_OVERSCAN_PX * 2}px)`,
        }}
      />
    </div>
  );
}
