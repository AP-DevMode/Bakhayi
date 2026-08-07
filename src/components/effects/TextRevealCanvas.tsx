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

        const mesh = new Text() as SdfLine["mesh"];
        const material = createIbiTextMaterial(fontSize, text.length);
        mesh.text = text;
        mesh.font = `/api/hero-font/${isItalic ? "italic" : "regular"}`;
        mesh.fontSize = fontSize;
        mesh.letterSpacing = letterSpacing;
        mesh.lineHeight = String(lineHeight);
        mesh.anchorX = "center" as unknown as number;
        mesh.anchorY = "middle" as unknown as number;
        mesh.color = 0xffffff;
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
              const fontScale = nodeRect.width / renderedWidth;
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

    // Match measurements only after next/font has installed the exact face;
    // otherwise the first layout can be based on the serif fallback.
    void document.fonts.ready.then(() => build());

    const resizeObserver = new ResizeObserver(() => {
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
