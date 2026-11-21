'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const POWER_STOPS: [number, number][] = [
  [0, 1],
  [0.1, 0.7],
  [0.2, 0],
  [0.38, 0],
  [0.48, 0.5],
  [0.6, 1],
  [0.68, 0.2],
  [0.76, 0],
  [0.88, 0],
  [1, 1]
];

const WAVE_CONFIGS = [
  { amp: 5, waves: 9, speed: 1.4, phase: 0, jitter: 1.3 },
  { amp: 4.5, waves: 13, speed: -1.9, phase: 2.1, jitter: 1.1 },
  { amp: 3.5, waves: 6, speed: 2.4, phase: 4.2, jitter: 0.9 }
];

const LAYER_CONFIGS = [
  { width: 7, tone: '--color-ember', alpha: 0.07, flare: 1.6, thick: false },
  { width: 2.2, tone: '--color-flame', alpha: 0.28, flare: 1.2, thick: true },
  { width: 0.8, tone: '--color-core', alpha: 0.7, flare: 1, thick: false },
  { width: 1.5, tone: '--color-core', alpha: 0.38, flare: 1, thick: true }
];

interface Point {
  x: number;
  y: number;
  nx: number;
  ny: number;
  s: number;
}

function calculatePathPoints(width: number, height: number, inset: number, radius: number, step: number) {
  const innerW = width - inset;
  const innerH = height - inset;
  const straightW = Math.max(0, innerW - inset - 2 * radius);
  const straightH = Math.max(0, innerH - inset - 2 * radius);
  const cornerArc = (Math.PI / 2) * radius;
  const perimeter = (straightW + straightH) * 2 + 4 * cornerArc;
  const numPoints = Math.ceil(perimeter / step);
  const points: Point[] = [];

  for (let i = 0; i < numPoints; i++) {
    const s = (i / numPoints) * perimeter;
    let dist = s;

    const makeCorner = (cx: number, cy: number, startAngle: number): Point => {
      const angle = startAngle + dist / radius;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        nx: Math.cos(angle),
        ny: Math.sin(angle),
        s
      };
    };

    if (dist < straightW) {
      points.push({ x: inset + radius + dist, y: inset, nx: 0, ny: -1, s });
      continue;
    }
    dist -= straightW;

    if (dist < cornerArc) {
      points.push(makeCorner(innerW - radius, inset + radius, -Math.PI / 2));
      continue;
    }
    dist -= cornerArc;

    if (dist < straightH) {
      points.push({ x: innerW, y: inset + radius + dist, nx: 1, ny: 0, s });
      continue;
    }
    dist -= straightH;

    if (dist < cornerArc) {
      points.push(makeCorner(innerW - radius, innerH - radius, 0));
      continue;
    }
    dist -= cornerArc;

    if (dist < straightW) {
      points.push({ x: innerW - radius - dist, y: innerH, nx: 0, ny: 1, s });
      continue;
    }
    dist -= straightW;

    if (dist < cornerArc) {
      points.push(makeCorner(inset + radius, innerH - radius, Math.PI / 2));
      continue;
    }
    dist -= cornerArc;

    if (dist < straightH) {
      points.push({ x: inset, y: innerH - radius - dist, nx: -1, ny: 0, s });
      continue;
    }
    dist -= straightH;

    points.push(makeCorner(inset + radius, inset + radius, Math.PI));
  }

  return { points, total: perimeter };
}

export function CanvasWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const borderEl = canvas?.parentElement?.querySelector('.flow-border') as HTMLElement | null;
    if (!canvas || !ctx) return;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let pathData = calculatePathPoints(1, 1, 0, 1, 4);
    let animId = 0;
    let isIntersecting = false;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    const borderWidth = borderEl ? (parseFloat(getComputedStyle(borderEl).borderTopWidth) || 0) : 0;
    const borderRadius = borderEl
      ? (parseFloat(getComputedStyle(borderEl).borderTopLeftRadius) || 28) - borderWidth / 2
      : 24;

    const layerColors = LAYER_CONFIGS.map((cfg) => {
      const rawHex = getComputedStyle(document.documentElement)
        .getPropertyValue(cfg.tone)
        .trim()
        .replace('#', '') || 'ff7d38';
      const fullHex = rawHex.length === 3 ? [...rawHex].map((c) => c + c).join('') : rawHex;
      const num = parseInt(fullHex, 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1 : 1.5);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      pathData = calculatePathPoints(width, height, 40 + borderWidth / 2, borderRadius, isCoarse ? 6 : 4);
    };

    const turnEl = canvas.parentElement?.querySelector('.flow-turn') as HTMLElement | null;
    let turnAnimation: Animation | undefined;
    let turnDuration = 14000;
    let lastTime = 0;

    const render = (time: number) => {
      if (time - lastTime > 31) {
        lastTime = time;
        const seconds = time / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineJoin = 'round';

        if (!turnAnimation && turnEl) {
          turnAnimation = turnEl.getAnimations().find((a) => (a as CSSAnimation).animationName === 'flow-turn');
          if (turnAnimation?.effect) {
            turnDuration = Number(turnAnimation.effect.getComputedTiming().duration) || 14000;
          }
        }

        const animCurrent = Number(turnAnimation?.currentTime ?? 0);
        const turnAngle = ((animCurrent % turnDuration) / turnDuration) * Math.PI * 2;
        const cx = width / 2;
        const cy = height / 2;
        const { points, total } = pathData;
        const angleScale = (2 * Math.PI) / total;

        const evaluatedPoints = points
          .filter((_, idx) => idx % 4 === 0)
          .map((p) => {
            const angle = Math.atan2(p.x - cx, cy - p.y);
            const pos = ((angle / (2 * Math.PI)) % 1 + 1) % 1;
            const diffAngle = ((angle - turnAngle) / (2 * Math.PI) % 1 + 1) % 1;

            let powerVal = POWER_STOPS[0][1];
            for (let i = 1; i < POWER_STOPS.length; i++) {
              const [stopPos, stopVal] = POWER_STOPS[i];
              const [prevPos, prevVal] = POWER_STOPS[i - 1];
              if (diffAngle <= stopPos) {
                powerVal = prevVal + ((diffAngle - prevPos) / (stopPos - prevPos || 1)) * (stopVal - prevVal);
                break;
              }
            }

            const s = p.s;
            const mod1 = Math.pow(
              0.5 + 0.5 * Math.sin(0.011 * s + 0.6 * seconds) * Math.sin(0.027 * s - 0.9 * seconds + 1.3),
              1.6
            );
            const mod2 = 0.85 + 0.15 * Math.sin(0.09 * s + 9 * seconds);
            const finalPower = powerVal * (0.08 + 0.92 * (mod1 * mod2));
            const thick =
              0.45 +
              0.75 *
                (0.5 + 0.5 * Math.sin(0.019 * s - 0.8 * seconds) * Math.sin(0.047 * s + 1.3 * seconds + 0.7));

            return { position: pos, power: finalPower, thick };
          })
          .sort((a, b) => a.position - b.position);

        if (evaluatedPoints.length === 0) return;

        const first = evaluatedPoints[0];
        const last = evaluatedPoints[evaluatedPoints.length - 1];

        const wavePaths = WAVE_CONFIGS.map((cfg) => {
          const path = new Path2D();
          points.forEach((p, idx) => {
            const scaledS = p.s * angleScale;
            const waveOffset =
              cfg.amp *
                (0.65 * Math.sin(scaledS * cfg.waves + seconds * cfg.speed + cfg.phase) +
                  0.35 * Math.sin(scaledS * cfg.waves * 2 - seconds * cfg.speed * 1.6 + 1.7 * cfg.phase)) +
              cfg.jitter * Math.sin(61 * scaledS + 11 * seconds + 3 * cfg.phase) * Math.sin(23 * scaledS - 7 * seconds);
            const px = p.x + p.nx * waveOffset;
            const py = p.y + p.ny * waveOffset;
            if (idx === 0) path.moveTo(px, py);
            else path.lineTo(px, py);
          });
          path.closePath();
          return path;
        });

        LAYER_CONFIGS.forEach((layer, layerIdx) => {
          const grad = ctx.createConicGradient(-Math.PI / 2, cx, cy);
          const getColor = (pt: { power: number; thick: number }) => {
            const alpha = Math.min(1, Math.pow(pt.power, layer.flare) * layer.alpha * (layer.thick ? pt.thick : 1));
            return `rgba(${layerColors[layerIdx]}, ${alpha.toFixed(3)})`;
          };

          const avgColor = getColor({
            power: (first.power + last.power) / 2,
            thick: (first.thick + last.thick) / 2
          });

          grad.addColorStop(0, avgColor);
          for (const pt of evaluatedPoints) {
            grad.addColorStop(pt.position, getColor(pt));
          }
          grad.addColorStop(1, avgColor);

          ctx.strokeStyle = grad;
          ctx.lineWidth = layer.width;
          for (const pth of wavePaths) {
            ctx.stroke(pth);
          }
        });
      }

      if (isIntersecting) {
        animId = requestAnimationFrame(render);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = !!entry?.isIntersecting;
      if (isIntersecting && !animId) {
        animId = requestAnimationFrame(render);
      } else if (!isIntersecting && animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-30 [mix-blend-mode:multiply]"
      style={{
        left: -40,
        top: -40,
        width: 'calc(100% + 80px)',
        height: 'calc(100% + 80px)'
      }}
    />
  );
}

const MASK_PASSES = [
  { spread: 8, width: 12, radius: 34, blur: 22, alpha: 0.55 },
  { spread: 4, width: 6, radius: 30, blur: 10, alpha: 0.5 },
  { spread: 0, width: 3, radius: 28, blur: 5, alpha: 0.35 }
];

export function CanvasMask({ outside }: { outside?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const parent = container?.parentElement;
    if (!container || !parent) return;

    const update = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (!w || !h) return;

      const canvas = document.createElement('canvas');
      canvas.width = w + 112;
      canvas.height = h + 112;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const offset = canvas.width + 400;
      ctx.globalCompositeOperation = 'lighter';

      for (const pass of MASK_PASSES) {
        const inset = pass.width / 2 - pass.spread;
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${pass.alpha})`;
        ctx.shadowBlur = 2 * pass.blur;
        ctx.shadowOffsetX = offset;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = pass.width;
        ctx.beginPath();
        ctx.roundRect(
          56 + inset - offset,
          56 + inset,
          w - 2 * inset,
          h - 2 * inset,
          Math.max(0, pass.radius - pass.width / 2)
        );
        ctx.stroke();
        ctx.restore();
      }

      if (outside) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.roundRect(59, 59, w - 6, h - 6, 25);
        ctx.fill();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const maskVal = `url(${dataUrl})`;
      container.style.maskImage = maskVal;
      container.style.webkitMaskImage = maskVal;

      const img = new Image();
      img.src = dataUrl;
      img.decode()
        .catch(() => {})
        .then(() => {
          requestAnimationFrame(() => {
            container.style.opacity = '1';
          });
        });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [outside]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="[container-type:size] pointer-events-none absolute z-20 overflow-hidden [mask-size:100%_100%] opacity-0 [mix-blend-mode:multiply] transition-opacity duration-500"
      style={{ inset: -56 }}
    >
      <div className="flow-turn" />
    </div>
  );
}

export function FlowBorder() {
  return (
    <div
      aria-hidden="true"
      className="[container-type:size] pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[28px] p-1 [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
    >
      <div className="flow-turn" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.9),rgb(255_255_255/0)_22%,rgb(18_22_29/0)_70%,rgb(18_22_29/0.05))]" />
    </div>
  );
}

export function Lit({
  children,
  className,
  outside
}: {
  children?: React.ReactNode;
  className?: string;
  outside?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <FlowBorder />
      <CanvasMask outside={outside} />
      <CanvasWave />
    </div>
  );
}
