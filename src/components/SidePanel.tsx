'use client';

import React, { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { panelContent, siteConfig } from '@/data/site-config';
import { openSheet } from '@/lib/store';
import { HeroConfig } from '@/types';
import { TwitterIcon, ArrowRightIcon } from './Icons';
import { Shine } from './Shine';
import { Lit } from './CanvasWave';
import { ArrowFillButton } from './ui/arrow-fill-button';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: siteConfig.timezone,
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: 'h12'
});

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: siteConfig.timezone,
  hour: 'numeric',
  hourCycle: 'h23'
});

const subscribeTimer = (callback: () => void) => {
  const timer = window.setInterval(callback, 1000);
  return () => window.clearInterval(timer);
};

const getTimerSnapshot = () => {
  const now = Date.now();
  return `${timeFormatter.format(now)}|${Number(hourFormatter.format(now)) % 24}`;
};

function useTime() {
  const snapshot = useSyncExternalStore(subscribeTimer, getTimerSnapshot, () => '');
  if (!snapshot) return null;
  const [time, hour] = snapshot.split('|');
  return { time, hour: Number(hour) };
}

function LocalClock() {
  const timeData = useTime();
  const [hourMin, ampm] = timeData?.time.split(':') ?? ['--', '-- --'];
  return (
    <span className="tabular-nums">
      {hourMin}
      <span className="animate-[blink_2s_ease-in-out_infinite]">:</span>
      {ampm} ({siteConfig.zone})
    </span>
  );
}

function StatusMood() {
  const timeData = useTime();
  if (!timeData) return null;
  const currentMood = [...panelContent.moods].reverse().find((m) => timeData.hour >= m.from);
  return <span className="fade">{currentMood?.text}</span>;
}

const defaultHero: HeroConfig = {
  title: panelContent.title,
  text: panelContent.text,
  cta: { label: panelContent.cta, sheet: 'contact' },
  more: { label: panelContent.pricing, sheet: 'pricing' }
};

export function SidePanel({
  hero = defaultHero,
  back
}: {
  hero?: HeroConfig;
  back?: { href: string; label: string };
}) {
  return (
    <aside
      data-panel="true"
      className="absolute inset-x-0 bottom-0 z-20 lg:inset-y-0 lg:right-auto lg:w-[clamp(27rem,30vw,34rem)]"
    >
      <div className="sidebar border-line relative isolate flex flex-col overflow-hidden border-t px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:h-full lg:border-t-0 lg:px-10 lg:pt-10 lg:pb-4">
        {back && (
          <div className="flex shrink-0 justify-center pb-6">
            <ArrowFillButton
              href={back.href}
              btnText={back.label}
              arrowIcon={<ArrowRightIcon className="rotate-180" />}
            />
          </div>
        )}
        {/* Header */}
        <div className="rise flex shrink-0 flex-col items-center gap-4 text-center">
          <Image
            src="/avatar.webp?v=3"
            alt=""
            width={288}
            height={288}
            quality={95}
            priority
            className="avatar-hero rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.1)]"
          />
          <div className="flex flex-col items-center leading-[1.35]">
            <span className="text-[15px] font-semibold">{panelContent.name}</span>
            <span className="text-muted flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="status-dot" aria-hidden="true" />
              {panelContent.status}
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="panel-scroll-bleed flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1
            className="rise mt-6 text-[1.875rem] leading-[1.1] font-medium tracking-[-0.012em] text-balance lg:mt-0 lg:text-[clamp(2.25rem,2.5vw,2.625rem)]"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            {hero.title[0]}{' '}
            <span className="glow-text">{hero.title[1]}</span>
          </h1>

          <p
            className="rise text-muted mt-4 max-w-[25rem] text-base leading-[1.55] font-[450]"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            {hero.text}
          </p>

          <div
            className="panel-cta-row rise mt-7 flex flex-wrap items-center gap-3"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Lit className="rounded-full p-[3px]">
              <button
                type="button"
                onClick={() => openSheet(hero.cta.sheet)}
                className="btn button-cream"
              >
                <Shine className="gap-2.5">
                  {hero.cta.label}
                  <ArrowRightIcon className="size-4" />
                </Shine>
              </button>
            </Lit>

            <button
              type="button"
              onClick={() => openSheet(hero.more.sheet)}
              className="btn button-quiet"
            >
              <Shine quiet>{hero.more.label}</Shine>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="rise mt-8 flex shrink-0 items-center justify-between gap-4 border-line border-t pt-7 text-sm lg:-mx-10 lg:px-10"
          style={{ '--i': 4 } as React.CSSProperties}
        >
          <div className="flex flex-col gap-2">
            <p className="text-text/85 min-h-[1.25rem]">
              <StatusMood />
            </p>
            <p className="text-faint">
              {panelContent.time} <LocalClock />
            </p>
          </div>
          <ArrowFillButton
            href={siteConfig.x.href}
            target="_blank"
            rel="noreferrer"
            aria-label={panelContent.follow}
            icon={<TwitterIcon />}
            iconOnly
          />
        </footer>
      </div>
    </aside>
  );
}
