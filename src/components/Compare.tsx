'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { caseStudyContent } from '@/data/site-config';
import { ChevronIcon } from './Icons';
import { cn } from '@/lib/utils';

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function Compare() {
  const { examples, compare } = caseStudyContent;
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const splitRef = useRef(0.5);
  const animFrame = useRef(0);
  const isDragging = useRef(false);

  const [panelHeight, setPanelHeight] = useState(0);
  useEffect(() => {
    const panel = document.querySelector('[data-panel]');
    if (!panel) return;
    const update = () => setPanelHeight((panel as HTMLElement).offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  const activeExample = examples[activeTab];
  const hasMultiple = examples.length > 1;
  const bottomGap = hasMultiple ? '4.5rem' : '0px';
  const aspect = activeExample.width / activeExample.height;

  const setSplit = (val: number) => {
    splitRef.current = val;
    containerRef.current?.style.setProperty('--split', String(val));
    sliderRef.current?.setAttribute('aria-valuenow', String(Math.round(100 * val)));
  };

  // Intro bounce animation
  useEffect(() => {
    let start = 0;
    const tick = (now: number) => {
      start ||= now;
      const progress = Math.min(1, (now - start) / 1400);
      splitRef.current = 0.5 - ((1 - Math.cos(progress * Math.PI * 2)) / 2) * 0.1;
      containerRef.current?.style.setProperty('--split', String(splitRef.current));
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(tick);
      }
    };

    const timeout = setTimeout(() => {
      animFrame.current = requestAnimationFrame(tick);
    }, 700);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animFrame.current);
    };
  }, [activeTab]);

  const updatePosition = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setSplit(clamp((e.clientX - rect.left) / rect.width));
    }
  };

  return (
    <section
      className="absolute inset-0 flex p-4 max-lg:pb-[calc(var(--panel)+1rem)] lg:py-10 lg:pr-10 lg:pl-[calc(clamp(27rem,30vw,34rem)+2.5rem)]"
      style={{ '--panel': `${panelHeight}px` } as React.CSSProperties}
    >
      <div className="[container-type:size] flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 lg:gap-5">
        <div
          className="tile rise ease-out-soft relative shrink-0 rounded-[17px] p-[5px] transition-[width,height] duration-[450ms] md:rounded-[28px] md:p-2"
          style={{
            width: `min(100cqw, calc((100cqh - ${bottomGap}) * ${aspect}))`,
            height: `min(calc(100cqw / ${aspect}), calc(100cqh - ${bottomGap}))`
          }}
        >
          <div
            ref={containerRef}
            className="relative size-full cursor-ew-resize touch-none overflow-hidden rounded-[12px] bg-[#0e0d0c] select-none md:rounded-[20px]"
            style={{ '--split': 0.5 } as React.CSSProperties}
            onPointerDown={(e) => {
              cancelAnimationFrame(animFrame.current);
              isDragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              updatePosition(e);
            }}
            onPointerMove={(e) => {
              if (isDragging.current) updatePosition(e);
            }}
            onPointerUp={() => {
              isDragging.current = false;
            }}
            onPointerCancel={() => {
              isDragging.current = false;
            }}
          >
            {examples.map((item, idx) => (
              <div
                key={item.label}
                aria-hidden={idx !== activeTab}
                className="ease-out-soft absolute inset-0 transition-[scale] duration-[450ms]"
                style={{
                  opacity: idx === activeTab ? 1 : 0,
                  transform: idx === activeTab ? 'scale(1)' : 'scale(1.03)'
                }}
              >
                {/* Before Image */}
                <Image
                  src={item.before}
                  alt={`${item.label}, ${compare.before}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  draggable={false}
                  className="object-cover"
                />

                {/* After Image with clip */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: 'inset(0 0 0 calc(var(--split) * 100%))' }}
                >
                  <Image
                    src={item.after}
                    alt={`${item.label}, ${compare.after}`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 65vw, 100vw"
                    draggable={false}
                    className="object-cover"
                  />
                </div>
              </div>
            ))}

            {/* Labels */}
            <span
              className="bar pointer-events-none absolute top-3 left-3 rounded-full px-2.5 py-1 text-[13px] font-medium md:top-4 md:left-4 md:px-3 md:py-1.5 md:text-sm"
              style={{ opacity: 'clamp(0, calc((var(--split) - 0.1) * 16), 1)' }}
            >
              {compare.before}
            </span>

            <span
              className="bar pointer-events-none absolute top-3 right-3 rounded-full px-2.5 py-1 text-[13px] font-medium md:top-4 md:right-4 md:px-3 md:py-1.5 md:text-sm"
              style={{ opacity: 'clamp(0, calc((0.9 - var(--split)) * 16), 1)' }}
            >
              {compare.after}
            </span>

            {/* Draggable Divider & Handle */}
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 compare-line"
              style={{ left: 'calc(var(--split) * 100%)' }}
            >
              <span
                ref={sliderRef}
                role="slider"
                tabIndex={0}
                aria-label={compare.handle}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    cancelAnimationFrame(animFrame.current);
                    setSplit(clamp(splitRef.current + (e.key === 'ArrowLeft' ? -0.05 : 0.05)));
                  }
                }}
                className="button-cream pointer-events-auto absolute top-1/2 left-1/2 flex size-9 -translate-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:size-11"
              >
                <ChevronIcon className="size-4 rotate-180" />
                <ChevronIcon className="-ml-1.5 size-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        {hasMultiple && (
          <div
            className="bar rise flex shrink-0 items-center gap-1 rounded-full p-1"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            {examples.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={idx === activeTab}
                onClick={() => {
                  if (idx !== activeTab) {
                    cancelAnimationFrame(animFrame.current);
                    setSplit(0.5);
                    setActiveTab(idx);
                  }
                }}
                className={cn(
                  "press relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  idx === activeTab
                    ? "button-cream text-black"
                    : "text-muted hover:text-text"
                )}
              >
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
