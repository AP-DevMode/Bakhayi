"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Text } from "troika-three-text";
import { createIbiTextMaterial, type IbiTextMaterial } from "@/lib/webgl/createIbiTextMaterial";

interface TextRevealCanvasProps {
  children: React.ReactNode;
  className?: string;
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

export default function TextRevealCanvas({ children, className }: TextRevealCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        const text = (node.textContent ?? "").trim();
        const style = getComputedStyle(node);
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

      renderer.compile(scene, camera);
      renderer.render(scene, camera);
      container.setAttribute("data-ibi-ready", "true");
      canvas.style.opacity = "1";

      const startedAt = performance.now() + REVEAL_DELAY_MS;
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
      animationFrame = requestAnimationFrame(render);
    };

    // Hero sits at the top of the page, so firing on mount always meant
    // "in view" in practice. About (and any later section reusing this
    // component) doesn't have that guarantee — building and animating a
    // reveal no one is looking at wastes the moment entirely. Gate the
    // first build behind the same fire-once IntersectionObserver pattern
    // IllustrationReveal uses, so the WebGL text reveals when the section
    // actually scrolls into frame instead of racing the page load.
    let hasTriggered = false;
    const triggerBuild = () => {
      if (hasTriggered || cancelled) return;
      hasTriggered = true;
      // Still wait on next/font so measurements aren't based on the
      // fallback serif before the real face installs.
      void document.fonts.ready.then(() => {
        if (!cancelled) build();
      });
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerBuild();
          visibilityObserver.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    visibilityObserver.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      // Only reacts to resizes after the first build has actually run —
      // otherwise a resize firing before the section ever scrolls into view
      // (e.g. a font/layout shift while it's still off-screen) would call
      // build() directly and defeat the visibility gate above.
      if (!hasTriggered) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        container.removeAttribute("data-ibi-ready");
        canvas.style.opacity = "0";
        cancelAnimationFrame(animationFrame);
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
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
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
