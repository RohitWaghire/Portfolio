# My Portfolio

A personal portfolio built with **Next.js 15**, **React 19**, **TypeScript** and a prebuilt
Tailwind stylesheet. It is a re-skinned version of a design portfolio: the layout, motion and
interactions are the same, every piece of content is a **placeholder** you can replace.

```bash
npm install     # only needed if node_modules is missing
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

Pages:

| Route | What it is |
| --- | --- |
| `/` | Infinite draggable canvas of your projects, plus the side panel |
| `/showcase` | Before/after case study with a draggable comparison slider |

Sheets (pricing, contact, project brief) open from the buttons in the side panel.

---

## Make it yours

Everything you normally want to change lives in two files. Search for `TODO` to find the spots.

### 1. You — `src/data/site-config.ts`

| Field | What it controls |
| --- | --- |
| `siteConfig.name` / `title` | Your name in the panel, browser tab, social cards |
| `siteConfig.headline` / `description` | Search results and social previews |
| `siteConfig.url` | Your final domain (absolute URLs) |
| `siteConfig.x` / `contra` | Social links used by the panel and the contact sheet |
| `siteConfig.timezone` / `zone` | The live clock: IANA name plus the label shown next to it |
| `panelContent.status` | The line under your name (“Open for work”, …) |
| `panelContent.title` | Two lines of the big headline: `[plain, highlighted]` |
| `panelContent.text` | The paragraph under the headline |
| `panelContent.moods` | The status line that changes with the hour |

### 2. Your work — `src/data/projects.ts`

Each object is one card on the canvas. Order and `width` / `height` drive the masonry rhythm.

```ts
{
  slug: 'my-project',
  title: 'My Project',
  category: 'Brand identity',
  year: '2025',
  width: 1600,
  height: 900,
  cover: '/projects/my-project/cover.webp',
  // optional: uncomment and drop two mp4s in the same folder
  // video: { tile: '/projects/my-project/tile.mp4', full: '/projects/my-project/full.mp4' }
}
```

- **Cover images** go in `public/projects/<slug>/cover.webp`. `width` / `height` must be the
  real pixel size of that image, otherwise the card is stretched.
- **Videos are optional.** Without `video` the cover image is shown on the card and in the
  full-screen view. With it, cards play `tile.mp4` while visible and the big view plays
  `full.mp4` (mute toggle appears automatically).
- Add or remove entries freely — the canvas tiles whatever the array contains.

### 3. Case study — `src/data/site-config.ts` → `caseStudyContent`

The `/showcase` page compares before/after images with a draggable slider. Replace the four
files in `public/showcase/` (`{dashboard,hero}-{before,after}.webp`) and keep their
`width` / `height` in `examples` accurate. Tab labels and copy live in the same object.

### 4. Pricing and services — `pricingContent` + `pricingPlans`

Placeholder tiers are `$X,XXX` plus “Placeholder feature one”. Rename freely, or empty the
`pricingPlans` array if you do not sell services — but then also remove the `See pricing`
button (`panelContent.pricing` → point `SidePanel`'s `more` at another sheet).

### 5. Forms — `formStrings` and `src/app/api/contact/route.ts`

The contact and brief sheets post to `/api/contact`, which delivers each submission to its
own Discord channel (the brief includes screenshots as attachments):

| Form | Env var |
| --- | --- |
| "Start a project" contact sheet | `DISCORD_WEBHOOK_CONTACT_URL` |
| "Project brief" sheet | `DISCORD_WEBHOOK_BRIEF_URL` |

Setup:

1. In Discord: **Channel settings → Integrations → Webhooks → New Webhook → Copy Webhook URL**
   in each channel.
2. Put both in `.env.local` (gitignored):
   ```bash
   DISCORD_WEBHOOK_CONTACT_URL=https://discord.com/api/webhooks/...
   DISCORD_WEBHOOK_BRIEF_URL=https://discord.com/api/webhooks/...
   ```
3. Restart `npm run dev`, or add the same variables in your host's dashboard when deploying.

If a webhook is missing the route returns a 500 and logs which one; it never falls back to
silently dropping submissions.

### 6. Images and social cards

Project media lives in `public/projects/project-XX/`:

| File | Used for |
| --- | --- |
| `cover.webp` | Still cover when a project has no video |
| `poster.webp` + `poster-640.webp` | Poster before playback and the LCP image |
| `tile.mp4` | 8-second hover preview |
| `full.mp4` | Full-screen project modal |

The cards reference `poster-640.webp`, `cover-640.webp` and `cover-960.webp` through
`srcset`, so add those smaller WebP variants whenever you add a project.

Identity assets:

| File | Where it shows |
| --- | --- |
| `public/avatar.webp` | Panel avatar (square, 320px+) |
| `public/opengraph-image.jpg` / `public/twitter-image.jpg` | Link previews (1200×630) |
| `src/app/icon.svg` | Browser tab favicon |
| `src/app/apple-icon.png` | Apple touch icon (180×180) |

> `scripts/generate-placeholders.py` overwrites the real project media and avatar. Do not run
> it on this copy of the site.

### 7. Colours and theme — `src/app/theme.css`

The whole design system lives in that one file. It declares the palette as custom
properties and re-skins the template classes (`.shell`, `.bar`, `.sidebar`, `.tile`,
`.button-*`, `.pill-field`, `.flow-border`, `.glow-text`, …) in terms of them.
`globals.css` is a prebuilt stylesheet you should not edit; `theme.css` is imported
after it and overrides it.

| Group | Tokens |
| --- | --- |
| Ink | `--ink`, `--ink-2`, `--ink-3`, `--ink-4` |
| Blue accent | `--blue`, `--blue-deep`, `--blue-ink`, `--blue-soft`, `--blue-line` |
| Glass | `--ground`, `--panel`, `--panel-raised`, `--line`, `--line-strong`, `--glass-blur` |
| Ambient | `--glow-a`, `--glow-b`, `--star` |
| Status | `--ok`, `--warn`, `--danger` (+ `-ink` and `-soft` variants) |

The template's original variables (`--color-ink`, `--color-text`, `--color-ember`,
`--color-flame`, `--color-core`, `--color-line`, …) are mapped onto the palette at the
top of the file, so the body, text utilities, animated border and canvas flame all
follow from the same values. Change a token there and the whole site, including the
placeholder artwork script, can be re-tuned in one place — the script has the same
colours as constants at the top of `scripts/generate-placeholders.py`.

---

## Project layout

```
src/app/            routes: / (canvas) and /showcase (before/after) + /api/contact
src/components/     Playground (canvas), ProjectModal, SidePanel, Sheets, Compare, canvas FX
src/data/           site-config.ts and projects.ts — the two files you edit
src/types/          shared TypeScript types
public/             images, videos, font
scripts/            placeholder image generator
```

## Deploying

Any Next.js host works, e.g. Vercel: push the repo, framework auto-detects, build command
`npm run build`. Update `siteConfig.url` to the live domain so social cards resolve.

## Notes

- The stylesheet in `src/app/globals.css` is a prebuilt Tailwind bundle. New utility class
  names will not be generated, so either reuse the classes already present or add plain CSS.
