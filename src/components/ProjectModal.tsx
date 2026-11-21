'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PROJECTS } from '@/data/projects';
import { Project } from '@/types';
import { ChevronIcon, VolumeIcon, MuteIcon, CloseIcon } from './Icons';
import { Glow } from './Glow';

export function ProjectModal({
  projectIndex,
  onClose,
  onStep
}: {
  projectIndex: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const project = PROJECTS[projectIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [dimensions, setDimensions] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const calculateDimensions = useCallback((c: Project) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const padding = winW < 768 ? 12 : 32;
    const maxW = winW - 2 * padding;
    const maxH = winH - padding - 92;

    let targetW = maxW;
    const calcH = ((targetW - 16) * c.height) / c.width + 16;
    let targetH = calcH;

    if (targetH > maxH) {
      targetH = maxH;
      targetW = ((maxH - 16) * c.width) / c.height + 16;
    }

    return {
      left: (winW - targetW) / 2,
      top: padding + (maxH - targetH) / 2,
      width: targetW,
      height: targetH
    };
  }, []);

  useEffect(() => {
    setDimensions(calculateDimensions(project));
    const handleResize = () => setDimensions(calculateDimensions(project));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [project, calculateDimensions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'ArrowRight') onStep(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onStep]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video.play().catch(() => {
        setIsMuted(true);
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [projectIndex, isMuted]);

  const { cover, video } = project;
  const currentIndexStr = String(projectIndex + 1).padStart(2, '0');
  const totalCountStr = String(PROJECTS.length).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="relative z-50 touch-manipulation"
      style={{ isolation: 'isolate' }}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="fade fixed inset-0 z-40 cursor-default bg-[#151413]/85"
      />

      {/* Main card modal */}
      <div
        className="tile fixed z-50 rounded-[17px] p-[5px] md:rounded-[28px] md:p-2 transition-all duration-300"
        style={{
          left: `${dimensions.left}px`,
          top: `${dimensions.top}px`,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`
        }}
      >
        <div className="relative size-full overflow-hidden rounded-[12px] bg-[#0e0d0c] md:rounded-[20px]">
          {video ? (
            <video
              ref={videoRef}
              key={project.slug}
              src={video.full}
              loop
              playsInline
              muted={isMuted}
              className="fade absolute inset-0 size-full object-cover"
            />
          ) : (
            <img
              key={project.slug}
              src={cover}
              alt=""
              draggable={false}
              className="fade absolute inset-0 size-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Bottom control bar */}
      <div
        className="bar rise fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1"
        style={{ animationDelay: '260ms' }}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={() => onStep(-1)}
          className="press text-text/85 hover:text-text relative flex size-10 items-center justify-center rounded-full transition-colors outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <ChevronIcon className="size-5 rotate-180" />
        </button>

        <span className="text-muted min-w-[3.25rem] text-center text-sm tabular-nums">
          {currentIndexStr} / {totalCountStr}
        </span>

        <button
          type="button"
          aria-label="Next"
          onClick={() => onStep(1)}
          className="press text-text/85 hover:text-text relative flex size-10 items-center justify-center rounded-full transition-colors outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <ChevronIcon className="size-5" />
        </button>

        {video && (
          <>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />

            <button
              type="button"
              aria-label={isMuted ? "Unmute" : "Mute"}
              onClick={() => setIsMuted(!isMuted)}
              className="press text-text/85 hover:text-text relative flex size-10 items-center justify-center rounded-full transition-colors outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {isMuted ? <MuteIcon className="size-5" /> : <VolumeIcon className="size-5" />}
            </button>
          </>
        )}
      </div>

      {/* Top right close button */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="press button-quiet fade fixed top-4 right-4 z-50 flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:top-6 md:right-6"
      >
        <Glow quiet />
        <span className="relative flex items-center gap-2">
          <CloseIcon className="size-5" />
        </span>
      </button>
    </div>
  );
}
