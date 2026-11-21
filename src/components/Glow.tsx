'use client';

import React, { useRef, useEffect } from 'react';

export function Glow({ quiet, rest }: { quiet?: boolean; rest?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    if (parent.parentElement) {
      parent.parentElement.style.isolation = 'isolate';
    }

    const state = { x: 0, y: 0, tx: 0, ty: 0, speed: 0.35 };
    let raf = 0;

    const apply = () => {
      el.style.setProperty('--gx', `${state.x}px`);
      el.style.setProperty('--gy', `${state.y}px`);
    };

    const step = () => {
      state.x += (state.tx - state.x) * state.speed;
      state.y += (state.ty - state.y) * state.speed;
      if (Math.abs(state.tx - state.x) < 0.3 && Math.abs(state.ty - state.y) < 0.3) {
        state.x = state.tx;
        state.y = state.ty;
        apply();
        raf = 0;
        return;
      }
      apply();
      raf = requestAnimationFrame(step);
    };

    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(step);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      state.tx = e.clientX - rect.left;
      state.ty = e.clientY - rect.top;
      state.speed = 0.35;
      schedule();
    };

    const onPointerEnter = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      state.tx = e.clientX - rect.left;
      state.ty = e.clientY - rect.top;
      state.x = state.tx;
      state.y = state.ty;
      apply();
      el.style.setProperty('--glow', '1');
    };

    const onPointerLeave = () => {
      el.style.setProperty('--glow', '0');
    };

    parent.addEventListener('pointermove', onPointerMove);
    parent.addEventListener('pointerenter', onPointerEnter);
    parent.addEventListener('pointerleave', onPointerLeave);

    if (rest) {
      state.tx = parent.offsetWidth - 8;
      state.ty = parent.offsetHeight / 2;
      state.x = state.tx;
      state.y = state.ty;
      apply();
    }

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('pointermove', onPointerMove);
      parent.removeEventListener('pointerenter', onPointerEnter);
      parent.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [rest]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] [--glow:0]"
    >
      {quiet ? (
        <span className="absolute inset-0 rounded-[inherit] opacity-(--glow) transition-opacity duration-500 [background:radial-gradient(140px_70px_at_var(--gx)_var(--gy),color-mix(in_srgb,var(--color-text)_9%,transparent),transparent_75%)]" />
      ) : (
        <>
          <span className="absolute -inset-8 -z-10 [mask-image:radial-gradient(150px_circle_at_calc(var(--gx)+32px)_calc(var(--gy)+32px),black_15%,transparent)] opacity-(--glow) transition-opacity duration-500">
            <span className="bg-ember absolute inset-8 rounded-full blur-[11px]" />
            <span className="bg-flame absolute inset-8 rounded-full blur-[3px]" />
          </span>
          <span className="absolute inset-0 rounded-[inherit] opacity-(--glow) transition-opacity duration-500 [background:radial-gradient(120px_80px_at_var(--gx)_var(--gy),var(--color-core),color-mix(in_srgb,var(--color-core)_50%,transparent)_45%,transparent_80%)]" />
        </>
      )}
    </span>
  );
}
