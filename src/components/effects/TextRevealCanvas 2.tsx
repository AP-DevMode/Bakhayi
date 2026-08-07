"use client";

import { useEffect, useRef } from "react";

interface TextRevealCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export default function TextRevealCanvas({ children, className }: TextRevealCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-text]"));
    lines.forEach((line, index) => {
      line.style.setProperty("--hero-reveal-index", String(index));
    });

    const frame = requestAnimationFrame(() => {
      container.setAttribute("data-reveal-visible", "true");
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id="hero-noise" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.075" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </svg>
      {children}
    </div>
  );
}
