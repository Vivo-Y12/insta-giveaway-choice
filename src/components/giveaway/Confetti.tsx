"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  /** When true, fire a burst. Toggling false -> true retriggers. */
  fire: boolean;
  /** Duration in ms before particles stop spawning. */
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  life: number;
}

const COLORS = ["#FCD34D", "#F472B6", "#A78BFA", "#34D399", "#60A5FA", "#FB923C", "#FFFFFF"];

/**
 * Lightweight canvas confetti burst. Spawns particles from the top-centre of
 * the viewport and lets them fall under gravity + air drag. Self-contained —
 * no external libraries.
 */
export function Confetti({ fire, duration = 2500 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const stopAtRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.vy += 0.12; // gravity
        p.vx *= 0.995; // air drag
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life -= 1;

        const alpha = Math.max(0, Math.min(1, p.life / 60));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        if (p.life <= 0 || p.y > window.innerHeight + 40) {
          ps.splice(i, 1);
        }
      }

      if (Date.now() < stopAtRef.current && ps.length < 250) {
        spawnBurst();
      }

      if (ps.length > 0) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const spawnBurst = () => {
      const cx = window.innerWidth / 2;
      // Spawn from two cannons at the top corners for a fuller spread.
      for (const originX of [cx - window.innerWidth * 0.3, cx + window.innerWidth * 0.3]) {
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push({
            x: originX,
            y: window.innerHeight * 0.25,
            vx: (Math.random() - 0.5) * 9 + (originX < cx ? 6 : -6),
            vy: -Math.random() * 9 - 4,
            size: Math.random() * 8 + 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * 360,
            vr: (Math.random() - 0.5) * 18,
            life: 90 + Math.random() * 40,
          });
        }
      }
    };

    // If `fire` is true on mount, start immediately.
    if (fire) {
      stopAtRef.current = Date.now() + duration;
      if (!rafRef.current) {
        spawnBurst();
        rafRef.current = requestAnimationFrame(render);
      }
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      particlesRef.current = [];
    };
  }, []);

  // Separate effect: when `fire` flips true, restart the burst.
  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    stopAtRef.current = Date.now() + duration;
    if (!rafRef.current) {
      // Kick off the loop again.
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const ps = particlesRef.current;
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i];
          p.vy += 0.12;
          p.vx *= 0.995;
          p.vy *= 0.995;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vr;
          p.life -= 1;
          const alpha = Math.max(0, Math.min(1, p.life / 60));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
          if (p.life <= 0 || p.y > window.innerHeight + 40) {
            ps.splice(i, 1);
          }
        }
        if (Date.now() < stopAtRef.current && ps.length < 250) {
          for (let i = 0; i < 12; i++) {
            const cx = window.innerWidth / 2;
            const originX = i % 2 === 0 ? cx - window.innerWidth * 0.3 : cx + window.innerWidth * 0.3;
            particlesRef.current.push({
              x: originX,
              y: window.innerHeight * 0.25,
              vx: (Math.random() - 0.5) * 9 + (originX < cx ? 6 : -6),
              vy: -Math.random() * 9 - 4,
              size: Math.random() * 8 + 5,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              rotation: Math.random() * 360,
              vr: (Math.random() - 0.5) * 18,
              life: 90 + Math.random() * 40,
            });
          }
        }
        if (ps.length > 0 || Date.now() < stopAtRef.current) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          rafRef.current = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [fire, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
