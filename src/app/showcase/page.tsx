import type { Metadata } from 'next';
import { Compare } from '@/components/Compare';
import { SidePanel } from '@/components/SidePanel';
import { Sheets } from '@/components/Sheets';
import { caseStudyContent } from '@/data/site-config';
import { HeroConfig } from '@/types';

export const metadata: Metadata = {
  title: caseStudyContent.meta.title,
  description: caseStudyContent.meta.description
};

export default function CaseStudyPage() {
  const caseStudyHero: HeroConfig = {
    title: caseStudyContent.panel.title,
    text: caseStudyContent.panel.text,
    cta: {
      label: caseStudyContent.panel.cta,
      sheet: 'brief'
    },
    more: {
      label: caseStudyContent.panel.more,
      sheet: 'pricing'
    }
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Compare />
      <SidePanel
        hero={caseStudyHero}
        back={{ href: '/', label: 'Back to portfolio' }}
      />
      <Sheets />
    </main>
  );
}
