/**
 * Shared types for the portfolio.
 *
 * The only file most people need to touch is `src/data/projects.ts` and
 * `src/data/site-config.ts` — the types below describe their shape so
 * TypeScript tells you when a field is missing.
 */

/** One project card on the infinite canvas. */
export interface Project {
  /** Unique id. Also the folder under `public/projects/` that holds its media. */
  slug: string;
  /** Shown as the accessible label for the card and the full-screen view. */
  title: string;
  /** Free-form label, e.g. "Brand identity". */
  category: string;
  /** Free-form year label, e.g. "2025". */
  year: string;
  /** Cover image path, e.g. `/projects/project-01/cover.webp`. */
  cover: string;
  /** Cover image width in pixels. Drives the masonry aspect ratio. */
  width: number;
  /** Cover image height in pixels. Drives the masonry aspect ratio. */
  height: number;
  /**
   * Optional hover/full-screen videos. Leave this out and the cover image is
   * shown instead — that is the default while the site is still placeholders.
   */
  video?: {
    /** Short looping clip used on the canvas cards, ideally < 2 MB. */
    tile: string;
    /** Larger clip played in the full-screen view. */
    full: string;
    /** Still frame shown on the card before the tile starts playing. */
    poster?: string;
  };
}

export interface PricingPlan {
  title: string;
  price: string;
  unit: string;
  featured: boolean;
  features: string[];
}

export interface PricingContent {
  label: string;
  title: string;
  lead: string;
  cta: string;
}

export interface Mood {
  /** Hour (0-23) from which this status line applies. */
  from: number;
  text: string;
}

export interface PanelContent {
  name: string;
  status: string;
  /** Two lines of the headline: [plain, highlighted]. */
  title: [string, string];
  text: string;
  cta: string;
  pricing: string;
  close: string;
  time: string;
  follow: string;
  moods: Mood[];
}

export interface SiteConfig {
  name: string;
  url: string;
  title: string;
  headline: string;
  description: string;
  x: { label: string; href: string };
  email: string;
  contra: { label: string; href: string };
  /** IANA timezone for the live clock, e.g. "Asia/Calcutta". */
  timezone: string;
  /** Short zone label shown next to the clock, e.g. "GMT+5:30". */
  zone: string;
}

export interface CaseStudyExample {
  label: string;
  before: string;
  after: string;
  width: number;
  height: number;
}

export interface CaseStudyContent {
  meta: {
    title: string;
    headline: string;
    description: string;
  };
  panel: {
    title: [string, string];
    text: string;
    cta: string;
    more: string;
  };
  compare: {
    before: string;
    after: string;
    handle: string;
  };
  examples: CaseStudyExample[];
  offer: {
    title: string;
    lead: string;
    cta: string;
    plan: PricingPlan;
  };
}

export type SheetType = 'pricing' | 'contact' | 'offer' | 'brief' | null;

export interface HeroConfig {
  title: [string, string];
  text: string;
  cta: { label: string; sheet: SheetType };
  more: { label: string; sheet: SheetType };
}

export interface ContactFormData {
  name: string;
  email: string;
  details: string;
  handle: string;
  other: string;
  services: string[];
  budget: string | null;
}
