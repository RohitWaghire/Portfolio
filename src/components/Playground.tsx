'use client';

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback
} from 'react';
import dynamic from 'next/dynamic';
import { PROJECTS } from '@/data/projects';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

// The modal is only needed after a card is opened; keep it out of first load.
const ProjectModal = dynamic(
  () => import('./ProjectModal').then((mod) => mod.ProjectModal),
  { ssr: false }
);

const OFFSETS = [0, 4, 8, 2, 10, 6];
const mod = (e: number, t: number) => ((e % t) + t) % t;
const colShift = (width: number, col: number) => mod(col, 2) * Math.round(0.3 * width);

/** Card width used by the layout, described for responsive image selection. */
const CARD_SIZES = '(max-width: 428px) 84vw, (max-width: 767px) 360px, 520px';

/** `/poster.webp?v=2` -> `/poster-640.webp?v=2` */
const widthVariant = (url: string, width: number) =>
  url.replace(/\.webp(\?.*)?$/, `-${width}.webp$1`);

// Initial centring must happen before paint, but layout effects warn during SSR.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Touch screens have no hover, so at most one visible preview plays at a time.
const touchVisible = new Set<HTMLVideoElement>();
let touchPlaying: HTMLVideoElement | null = null;

const claimTouchPreview = (el: HTMLVideoElement) => {
  touchVisible.add(el);
  if (touchPlaying) return;
  touchPlaying = el;
  el.play().catch(() => {});
};

const releaseTouchPreview = (el: HTMLVideoElement) => {
  touchVisible.delete(el);
  if (touchPlaying !== el) return;
  el.pause();
  touchPlaying = null;
  const next = touchVisible.values().next().value;
  if (next) {
    touchPlaying = next;
    next.play().catch(() => {});
  }
};

interface CardItem {
  project: number;
  y: number;
  width: number;
  height: number;
  x?: number;
  key?: string;
}

interface ColumnData {
  items: CardItem[];
  period: number;
}

interface LayoutData {
  width: number;
  gap: number;
  columns: ColumnData[];
}

function Card({
  card,
  project,
  active,
  empty,
  eager,
  highPriority,
  isDragged,
  onOpen
}: {
  card: CardItem;
  project: Project;
  active: boolean;
  empty: boolean;
  eager?: boolean;
  highPriority?: boolean;
  isDragged: React.MutableRefObject<boolean>;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { cover, video } = project;
  const poster = video?.poster;

  // Preview clips play on hover only, so a wall of cards does not animate at
  // once. Touch screens have no hover, so one mostly-visible card plays after
  // the first interaction — never competing with the LCP poster on load.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!active) {
      el.pause();
      releaseTouchPreview(el);
      return;
    }

    if (window.matchMedia('(hover: hover)').matches) {
      el.pause();
      return;
    }

    const interactionEvents = [
      'pointerdown',
      'touchstart',
      'wheel',
      'keydown',
      'scroll'
    ] as const;
    let observer: IntersectionObserver | null = null;
    let started = false;
    let cancelled = false;

    const start = () => {
      if (started || cancelled) return;
      started = true;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) claimTouchPreview(el);
          else releaseTouchPreview(el);
        },
        { threshold: 0.55 }
      );
      observer.observe(el);
    };

    const removeListeners = () => {
      interactionEvents.forEach((event) => window.removeEventListener(event, onFirst));
    };

    const onFirst = () => {
      removeListeners();
      start();
    };

    if (navigator.userActivation?.hasBeenActive) start();
    else {
      interactionEvents.forEach((event) =>
        window.addEventListener(event, onFirst, { once: true, passive: true })
      );
    }

    return () => {
      cancelled = true;
      removeListeners();
      observer?.disconnect();
      el.pause();
      releaseTouchPreview(el);
    };
  }, [active]);

  const playPreview = () => {
    if (!active) return;
    videoRef.current?.play().catch(() => {});
  };

  const pausePreview = () => {
    videoRef.current?.pause();
  };

  return (
    <button
      type="button"
      aria-label={project.title}
      data-key={card.key}
      data-project={card.project}
      disabled={empty}
      onClick={() => {
        if (!isDragged.current) onOpen();
      }}
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
      onFocus={playPreview}
      onBlur={pausePreview}
      className={cn(
        "appear ease-out-soft absolute rounded-[17px] p-[5px] outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:rounded-[28px] md:p-2",
        empty
          ? "border border-dashed border-[rgb(239_233_222/0.18)] bg-white/[0.02]"
          : "tile transition-[translate,box-shadow] duration-500 hover:-translate-y-1"
      )}
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height
      }}
    >
      <span
        className={cn(
          "relative block size-full overflow-hidden rounded-[12px] bg-[#0e0d0c] md:rounded-[20px]",
          empty && "invisible"
        )}
      >
        {video ? (
          <>
            <video
              ref={videoRef}
              src={video.tile}
              muted
              loop
              playsInline
              preload="none"
              draggable={false}
              onPlaying={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="absolute inset-0 size-full object-cover"
            />
            {/* Responsive poster sits above the video until playback starts. */}
            {poster && (
              <img
                src={poster}
                srcSet={`${widthVariant(poster, 640)} 640w, ${poster} 960w`}
                sizes={CARD_SIZES}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={highPriority ? 'high' : 'auto'}
                className={cn(
                  'absolute inset-0 size-full object-cover transition-opacity duration-300',
                  isPlaying ? 'opacity-0' : 'opacity-100'
                )}
              />
            )}
          </>
        ) : (
          /* No video yet, so show the cover image. Add `video` to the project in
             src/data/projects.ts (plus tile.mp4 / full.mp4) to switch it on. */
          <img
            src={cover}
            srcSet={`${widthVariant(cover, 640)} 640w, ${widthVariant(cover, 960)} 960w, ${cover} 1900w`}
            sizes={CARD_SIZES}
            alt=""
            draggable={false}
            decoding="async"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={highPriority ? 'high' : 'auto'}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/[0.05] ring-inset"
        />
      </span>
    </button>
  );
}

export function Playground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const coords = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const hasInitialized = useRef(false);
  const lastClickTime = useRef(0);

  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0, qx: 0, qy: 0 });

  // Warm the modal chunk on the first interaction, never during initial load.
  useEffect(() => {
    const prefetch = () => {
      void import('./ProjectModal');
    };
    window.addEventListener('pointerdown', prefetch, { once: true, passive: true });
    return () => window.removeEventListener('pointerdown', prefetch);
  }, []);

  // Center the initial view before paint, so cards are never shown untransformed.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!layout || !container || hasInitialized.current) return;
    hasInitialized.current = true;

    const panelRect = document.querySelector("[data-panel] > *")?.getBoundingClientRect();
    const isDesktop = container.clientWidth >= 1024;
    const panelRight = panelRect && isDesktop ? panelRect.right : 0;
    const panelTop = panelRect && !isDesktop ? panelRect.top : container.clientHeight;

    const colStride = layout.width + layout.gap;
    const centerCol = layout.columns[mod(2, layout.columns.length)];
    // Focus beacon (index 4) or first
    const targetItem = centerCol.items.find((i) => i.project === 4) ?? centerCol.items[0];
    const initialTarget = {
      x: 2 * colStride,
      y: colShift(layout.width, 2) + targetItem.y,
      width: targetItem.width,
      height: targetItem.height
    };

    coords.current.x = Math.round(initialTarget.x + initialTarget.width / 2 - (panelRight + container.clientWidth) / 2);
    coords.current.y = Math.round(initialTarget.y + initialTarget.height / 2 - panelTop / 2);

    if (innerRef.current) {
      innerRef.current.style.transform = `translate3d(${-coords.current.x}px, ${-coords.current.y}px, 0)`;
    }

    // The virtual grid renders only the cards around the current quadrant, so
    // the initial off-centre jump has to publish the new window or the canvas
    // would stay empty until the first drag.
    setViewport((prev) => ({
      ...prev,
      qx: Math.floor(coords.current.x / 240),
      qy: Math.floor(coords.current.y / 240)
    }));
  }, [layout]);

  // Handle window resizing and layout calculation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const isMobile = width < 768;
      const cardWidth = isMobile
        ? Math.round(Math.min(360, 0.84 * width))
        : Math.round(Math.min(780, Math.max(520, 0.4 * width)));
      const gap = isMobile ? 22 : 44;

      setLayout((prev) => {
        if (prev?.width === cardWidth) return prev;

        const numProjects = PROJECTS.length;
        const columns = OFFSETS.map((offset) => {
          let accY = 0;
          const items = Array.from({ length: numProjects }, (_, s) => {
            const projectIdx = mod(s + offset, numProjects);
            const c = PROJECTS[projectIdx];
            const innerW = cardWidth - 16;
            const innerH = Math.round(Math.min((innerW * c.height) / c.width, 1.02 * innerW)) + 16;
            const item: CardItem = {
              project: projectIdx,
              y: accY,
              width: cardWidth,
              height: innerH
            };
            accY += innerH + gap;
            return item;
          });
          return { items, period: accY };
        });

        return { width: cardWidth, gap, columns };
      });

      setViewport((prev) => ({ ...prev, width, height }));
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Pan, drag, momentum physics loop
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const pos = coords.current;
    let pointerState: { id: number; x: number; y: number; time: number } | null = null;
    let dragStart = { x: 0, y: 0 };
    let lastTime = 0;
    let animId = 0;
    let lastQuant = { x: NaN, y: NaN };

    const updateTransform = () => {
      inner.style.transform = `translate3d(${-pos.x}px, ${-pos.y}px, 0)`;
      const qx = Math.floor(pos.x / 240);
      const qy = Math.floor(pos.y / 240);
      if (qx !== lastQuant.x || qy !== lastQuant.y) {
        lastQuant = { x: qx, y: qy };
        setViewport((prev) => ({ ...prev, qx, qy }));
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!pointerState) {
        const friction = Math.pow(0.03, dt);
        pos.vx *= friction;
        pos.vy *= friction;
        pos.x += pos.vx * dt;
        pos.y += pos.vy * dt;
      }

      updateTransform();
      animId = pointerState || Math.hypot(pos.vx, pos.vy) > 4 ? requestAnimationFrame(tick) : 0;
    };

    const startLoop = () => {
      if (!animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerState = { id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp };
      dragStart = { x: e.clientX, y: e.clientY };
      pos.vx = 0;
      pos.vy = 0;
      isDragging.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerState || e.pointerId !== pointerState.id) return;

      if (!isDragging.current && Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 6) {
        isDragging.current = true;
        container.setPointerCapture(e.pointerId);
        container.dataset.dragging = '';
      }

      if (!isDragging.current) return;

      const dx = e.clientX - pointerState.x;
      const dy = e.clientY - pointerState.y;
      const dt = Math.max(8, e.timeStamp - pointerState.time) / 1000;

      pos.x -= dx;
      pos.y -= dy;
      pos.vx = 0.25 * pos.vx - (dx / dt) * 0.75;
      pos.vy = 0.25 * pos.vy - (dy / dt) * 0.75;

      pointerState = { id: pointerState.id, x: e.clientX, y: e.clientY, time: e.timeStamp };
      startLoop();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerState && e.pointerId === pointerState.id) {
        if (e.timeStamp - pointerState.time > 90) {
          pos.vx = 0;
          pos.vy = 0;
        }
        pointerState = null;
        delete container.dataset.dragging;
        startLoop();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const mult = e.deltaMode === 1 ? 16 : 1;
      pos.x += e.deltaX * mult;
      pos.y += e.deltaY * mult;
      pos.vx = 0;
      pos.vy = 0;
      startLoop();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    startLoop();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Compute visible cards for infinite virtual grid
  const visibleCards = useMemo(() => {
    if (!layout || !viewport.width) return [];
    const minX = 240 * viewport.qx - 420;
    const minY = 240 * viewport.qy - 420;
    const maxX = minX + viewport.width + 240 + 840;
    const maxY = minY + viewport.height + 240 + 840;

    const colStride = layout.width + layout.gap;
    const startCol = Math.floor(minX / colStride);
    const endCol = Math.floor(maxX / colStride);
    const result: (CardItem & { x: number; key: string })[] = [];

    for (let c = startCol; c <= endCol; c++) {
      const colData = layout.columns[mod(c, layout.columns.length)];
      const shift = colShift(layout.width, c);
      const startP = Math.floor((minY - shift) / colData.period) - 1;
      const endP = Math.floor((maxY - shift) / colData.period);

      for (let p = startP; p <= endP; p++) {
        for (const item of colData.items) {
          const itemY = shift + p * colData.period + item.y;
          if (itemY + item.height < minY || itemY > maxY) continue;
          result.push({
            ...item,
            y: itemY,
            x: c * colStride,
            key: `${c}:${p}:${item.project}`
          });
        }
      }
    }

    return result;
  }, [layout, viewport]);

  const handleOpenProject = useCallback((idx: number) => {
    if (performance.now() - lastClickTime.current < 400) return;
    lastClickTime.current = performance.now();
    setActiveProject(idx);
  }, []);

  const handleStep = useCallback((delta: number) => {
    setActiveProject((prev) => {
      if (prev === null) return null;
      return mod(prev + delta, PROJECTS.length);
    });
  }, []);

  const handleClose = useCallback(() => {
    lastClickTime.current = performance.now();
    setActiveProject(null);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab touch-none overflow-hidden select-none data-dragging:cursor-grabbing data-dragging:[&_*]:cursor-grabbing data-dragging:[&_button]:pointer-events-none"
      >
        <div ref={innerRef} className="absolute top-0 left-0 will-change-transform">
          {layout &&
            visibleCards.map((card) => (
              <Card
                key={card.key}
                card={card}
                project={PROJECTS[card.project]}
                active={activeProject === null}
                empty={activeProject === card.project}
                eager={card.project >= 4 && card.project <= 7}
                highPriority={card.project >= 4 && card.project <= 7}
                isDragged={isDragging}
                onOpen={() => handleOpenProject(card.project)}
              />
            ))}
        </div>
      </div>

      {activeProject !== null && (
        <ProjectModal
          projectIndex={activeProject}
          onClose={handleClose}
          onStep={handleStep}
        />
      )}
    </>
  );
}
