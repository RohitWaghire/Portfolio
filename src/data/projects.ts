import { Project } from '@/types';

/**
 * YOUR WORK LIVES HERE.
 *
 * Every object below is one card on the infinite canvas. The list order and the
 * `width` / `height` values control the masonry layout — keep the ratios honest
 * and the mosaic lines up.
 *
 * How to replace a placeholder project:
 *   1. Put your cover image at   public/projects/<slug>/cover.webp
 *      (or reuse a different folder name, just update `cover` below)
 *   2. Update `title`, `category` and `year`
 *   3. Optional: drop `tile.mp4` and `full.mp4` into the same folder and
 *      uncomment the `video` block — cards play the clip on hover and the
 *      full-screen view plays `full.mp4`. Without it the cover image is used.
 *
 * Add or remove entries freely: the canvas tiles whatever is in this array.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'project-01',
    title: 'AI PDF Chat',
    category: 'AI product',
    year: '2026',
    width: 1920,
    height: 1080,
    cover: '/projects/project-01/cover.webp',
    video: {
      tile: '/projects/project-01/tile.mp4',
      full: '/projects/project-01/full.mp4',
      poster: '/projects/project-01/poster.webp'
    }
  },
  {
    slug: 'project-02',
    title: 'Clearview Growth',
    category: 'SaaS',
    year: '2026',
    width: 1918,
    height: 944,
    cover: '/projects/project-02/cover.webp',
    video: {
      tile: '/projects/project-02/tile.mp4',
      full: '/projects/project-02/full.mp4',
      poster: '/projects/project-02/poster.webp'
    }
  },
  {
    slug: 'project-03',
    title: 'Halo Wealth',
    category: 'Fintech',
    year: '2026',
    width: 1904,
    height: 944,
    cover: '/projects/project-03/cover.webp',
    video: {
      tile: '/projects/project-03/tile.mp4',
      full: '/projects/project-03/full.mp4',
      poster: '/projects/project-03/poster.webp'
    }
  },
  {
    slug: 'project-04',
    title: 'Private Charters',
    category: 'Travel',
    year: '2026',
    width: 1902,
    height: 980,
    cover: '/projects/project-04/cover.webp',
    video: {
      tile: '/projects/project-04/tile.mp4',
      full: '/projects/project-04/full.mp4',
      poster: '/projects/project-04/poster.webp'
    }
  },
  {
    slug: 'project-05',
    title: 'Phished',
    category: 'Cybersecurity',
    year: '2026',
    width: 1602,
    height: 790,
    cover: '/projects/project-05/cover.webp?v=2',
    video: {
      tile: '/projects/project-05/tile.mp4?v=2',
      full: '/projects/project-05/full.mp4?v=2',
      poster: '/projects/project-05/poster.webp?v=2'
    }
  },
  {
    slug: 'project-06',
    title: 'Artistic Intelligence',
    category: 'Creative AI',
    year: '2025',
    width: 1900,
    height: 984,
    cover: '/projects/project-06/cover.webp',
    video: {
      tile: '/projects/project-06/tile.mp4',
      full: '/projects/project-06/full.mp4',
      poster: '/projects/project-06/poster.webp'
    }
  },
  {
    slug: 'project-07',
    title: 'Two Frames',
    category: 'E-commerce',
    year: '2025',
    width: 1898,
    height: 974,
    cover: '/projects/project-07/cover.webp',
    video: {
      tile: '/projects/project-07/tile.mp4',
      full: '/projects/project-07/full.mp4',
      poster: '/projects/project-07/poster.webp'
    }
  },
  {
    slug: 'project-08',
    title: 'Ashfall Rain',
    category: 'Experience',
    year: '2025',
    width: 1902,
    height: 984,
    cover: '/projects/project-08/cover.webp',
    video: {
      tile: '/projects/project-08/tile.mp4',
      full: '/projects/project-08/full.mp4',
      poster: '/projects/project-08/poster.webp'
    }
  },
  {
    slug: 'project-09',
    title: 'NetWatch',
    category: 'Chrome extension',
    year: '2024',
    width: 1800,
    height: 1200,
    cover: '/projects/project-09/cover.webp'
    // video: { tile: '/projects/project-09/tile.mp4', full: '/projects/project-09/full.mp4' }
  },
  {
    slug: 'project-10',
    title: 'Finance Launch',
    category: 'Mobile app',
    year: '2024',
    width: 1903,
    height: 944,
    cover: '/projects/project-10/cover.webp'
    // video: { tile: '/projects/project-10/tile.mp4', full: '/projects/project-10/full.mp4' }
  },
  {
    slug: 'project-11',
    title: 'Token Cost Calculator',
    category: 'Developer tool',
    year: '2024',
    width: 1907,
    height: 946,
    cover: '/projects/project-11/cover.webp'
    // video: { tile: '/projects/project-11/tile.mp4', full: '/projects/project-11/full.mp4' }
  },
  {
    slug: 'project-12',
    title: 'The Connection',
    category: 'Architecture',
    year: '2023',
    width: 1901,
    height: 946,
    cover: '/projects/project-12/cover.webp'
    // video: { tile: '/projects/project-12/tile.mp4', full: '/projects/project-12/full.mp4' }
  },
  {
    slug: 'project-13',
    title: 'Universe Without Limits',
    category: 'Travel',
    year: '2023',
    width: 1897,
    height: 891,
    cover: '/projects/project-13/cover.webp'
    // video: { tile: '/projects/project-13/tile.mp4', full: '/projects/project-13/full.mp4' }
  },
  {
    slug: 'project-14',
    title: 'DelveDeep',
    category: 'Hospitality',
    year: '2026',
    width: 1921,
    height: 1537,
    cover: '/projects/project-14/cover.webp'
    // video: { tile: '/projects/project-14/tile.mp4', full: '/projects/project-14/full.mp4' }
  },
  {
    slug: 'project-15',
    title: 'DelveDeep Sanctuaries',
    category: 'Hospitality',
    year: '2026',
    width: 1921,
    height: 1537,
    cover: '/projects/project-15/cover.webp'
    // video: { tile: '/projects/project-15/tile.mp4', full: '/projects/project-15/full.mp4' }
  }
];
