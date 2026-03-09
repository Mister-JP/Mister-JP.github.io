# Mister-JP.github.io

An Astro 5 portfolio package for Jignasu Pathak. This is not a blank starter: the route shells, content collections, reusable UI primitives, and content-entry workflow are already in place.

The repository is designed as a content-first portfolio with a fixed top-level information architecture:

- `Home`
- `About`
- `Projects`
- `Writing`
- `Tools`
- `Resume`

That structure is part of the repository ground truth in `.agent-harness/` and should stay stable unless the architecture docs are updated alongside the code.

## What Is Implemented Right Now

The current package already includes:

- a shared Astro site shell in `src/layouts/SiteShell.astro`
- reusable layout, navigation, and card primitives in `src/components/`
- page copy stored in `src/content/pages/`
- canonical reusable entries stored in `src/content/projects/`, `src/content/writing/`, and `src/content/tools/`
- ordered surface-level featuring stored separately in `src/content/curation/`
- static list routes and dynamic detail routes for projects, writing, and tools
- a resume page with a stable embedded PDF and direct download path
- scaffold templates for adding new content entries without changing layout code

This means the site structure is real and usable today, even though some portfolio copy is still placeholder content.

## Tech Stack

- `astro@^5.18.0`
- `typescript@^5.9.3`
- `@astrojs/check@^0.9.6`
- `remark-math@^6.0.0`
- `rehype-katex@^7.0.1`
- `katex@^0.16.38`

Runtime requirement:

- Node.js `>=18.20.8`

The package scripts are intentionally minimal:

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

The site now uses a small Astro markdown config in `astro.config.mjs` to support LaTeX-style math in markdown content through `remark-math` and `rehype-katex`.

## Markdown Math

Writing entries can render real formulas directly in markdown.

Inline math:

```md
$k^2MN$
```

Display math:

```md
$$
y[i, j, n] = \sum_{u, v, m} W[u, v, m, n] \, x[i + u, j + v, m]
$$
```

The KaTeX stylesheet is imported once through `src/styles/global.css`, and the dependency lockfile should be committed alongside any future package changes so the content pipeline stays reproducible across machines.

## Route Map

### Public routes

- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/writing`
- `/writing/[category]/[slug]`
- `/tools`
- `/tools/[slug]`
- `/resume`

## Deep Dive: How The Package Is Organized

### `src/pages/`

Route files only. These files compose layouts, shared components, and content helpers. They should stay thin.

### `src/layouts/`

Contains the shared page shell:

- `SiteShell.astro`: wraps the document structure, imports global styles, and applies the shared header/footer shell

### `src/components/`

This is split by responsibility:

- `layout/`: `Header`, `Footer`, `PageHeader`
- `navigation/`: desktop/mobile navigation composition
- `ui/`: shared primitives like `Button`, `Card`, `Container`, `Grid`, `GroupedPanel`, `Prose`, `Section`, `Tag`
- `projects/`, `writing/`, `tools/`: collection-specific cards and detail templates

The package is built around reusable primitives first, not page-specific one-off markup.

### `src/content/`

This is the main content source of truth. It is split into two layers:

- canonical content entries
- page/surface framing data

#### `src/content/pages/`

One content entry per top-level page shell:

- `home.md`
- `about.md`
- `projects.md`
- `writing.md`
- `tools.md`
- `resume.md`

These files store page copy and section framing. They do not store reusable project/tool/article identities.

#### `src/content/projects/`

Canonical project entries. Each project owns:

- title and summary
- why it matters
- status
- milestone
- tags
- sort order
- external links
- a result snapshot block
- optional markdown body for detail pages

#### `src/content/writing/`

Canonical writing entries. Each item is classified by `category`:

- `research`
- `project-note`
- `method`
- `technical-note`

Writing entries also support:

- summary
- status
- tags
- sort order
- related project references
- optional markdown body rendered on detail pages

Technical notes can also include LaTeX-style math syntax in their markdown bodies. That rendering is configured centrally rather than page by page.

#### `src/content/tools/`

Canonical tool entries. Each tool owns:

- summary and status
- sort order
- optional preview image
- external links
- tags
- related project references
- optional markdown body rendered on detail pages

#### `src/content/curation/`

This is the key package detail the old README missed.

The `curation` collection separates "what exists" from "what gets featured where." These files hold ordered references only:

- `home.md`: featured projects, featured writing groups, featured tools
- `projects.md`: featured projects for the projects page

This keeps canonical content in one place and page-level placement decisions in another.

### `src/data/`

Small static configuration, not long-form content:

- `navigation.ts`: the fixed primary nav and active-route matching logic
- `site.ts`: shell-level brand/footer config

### `src/lib/`

The package uses a small set of focused helpers:

- `collection-utils.ts`: sort helpers used across collections
- `content-paths.ts`: canonical URL builders for projects, tools, and writing
- `content-relations.ts`: resolves related projects, writing, and tools across collections
- `home-content.ts`: merges homepage page copy with homepage curation references
- `resume-content.ts`: loads the resume page content and prepares the stable PDF path metadata
- `writing-detail.ts`: prepares detail-template props for writing entries

The pattern is consistent: page routes stay light, while route-ready data shaping lives in `src/lib/`.

### `src/styles/`

Shared styling only:

- `tokens.css`: design tokens and reusable CSS variables
- `base.css`: shared element-level base rules
- `primitives.css`: shared primitive/component-level styles
- `global.css`: imports the shared style layers

This repository's ground truth expects shared visual rules to live here instead of being scattered as page-specific hacks.

### `public/`

Static passthrough assets. The current important contract is:

- `public/resume/jignasu-pathak-resume.pdf`

The resume route uses the path declared in `src/content/pages/resume.md` as the stable source for both the embedded preview and download link.

### `scaffolds/`

Starter templates for content entry:

- `project-template.md`
- `project-note-template.md`
- `research-template.md`
- `method-template.md`
- `technical-note-template.md`
- `tool-detail-template.md`

These are the intended starting point for new content, instead of duplicating old entries by hand.
They mirror the active Astro content schema:

- projects own their own frontmatter only
- writing and tools relate back to projects through `relatedProjects`
- featured placement belongs in `src/content/curation/`, not entry frontmatter

## Content Schema Snapshot

The Astro content collections are defined in `src/content/config.ts`. There are five active collections:

- `pages`
- `projects`
- `writing`
- `tools`
- `curation`

The most important schema decisions are:

- `pages` is a discriminated union keyed by `template`
- `writing` is a single collection split by `category`, not two separate collections
- `curation` is a discriminated union keyed by `surface`
- cross-entry relations use Astro content references, not raw string slugs

That schema choice is what lets the package keep page copy, canonical entries, and feature ordering separate without losing type safety.

## How Pages Are Composed

### Homepage

`src/pages/index.astro` loads `getHomePageContent()` from `src/lib/home-content.ts`.

That helper:

- loads `src/content/pages/home.md`
- loads `src/content/curation/home.md`
- resolves the referenced projects, writing entries, and tools
- validates that featured writing references are grouped under the correct `category`
- returns route-ready card props

### Projects

`src/pages/projects.astro` combines:

- all project entries from `projects`
- page framing from `src/content/pages/projects.md`
- featured project references from `src/content/curation/projects.md`

The page shows both a featured section and the full project library.

### Writing

`src/pages/writing.astro` combines:

- page framing from `src/content/pages/writing.md`
- all listed writing entries from the `writing` collection

It groups entries under the ordered sections declared in the page content:

- research
- project notes
- methods
- technical notes

The dynamic writing detail route uses the category path segment but still reads from the same `writing` collection.

### Tools

`src/pages/tools.astro` reads:

- all tool entries from `tools`
- page framing from `src/content/pages/tools.md`

Unlike `projects` and `writing`, the tools page currently does not use a separate curation file.

### Resume

`src/pages/resume.astro` uses `getResumePageContent()` from `src/lib/resume-content.ts`.

That helper:

- loads `src/content/pages/resume.md`
- reads the configured `pdf.path`
- checks whether the PDF exists at the expected `public/` path
- returns `hasPdf`, file metadata, and the structured copy used by the page

This makes the resume route resilient even when the PDF has not been replaced yet.

## Working In This Repository

### Update page copy

Edit the relevant file in `src/content/pages/`.

Use this for:

- page intros
- section headings
- empty states
- CTA copy
- resume labels and summary text

### Change what gets featured

Edit the relevant file in `src/content/curation/`.

Use this for:

- homepage featured projects
- homepage featured writing
- homepage featured tools
- projects-page featured entries

Do not duplicate titles or summaries in curation files. Those files should contain ordered references only.

### Add a new project, article, or tool

Start from the scaffold templates in `scaffolds/`, then create the new entry in the matching canonical content collection:

- `src/content/projects/`
- `src/content/writing/`
- `src/content/tools/`

If the new entry should surface on a page, add it to the matching curation file afterward.

When you add related content:

- writing entries use `relatedProjects: []` with Astro content references
- tool entries use `relatedProjects: []` with Astro content references
- project entries do not declare reverse links to writing or tools

### Change shared UI or layout behavior

Prefer these layers in order:

- `src/components/ui/` for reusable primitives
- `src/components/layout/` or `src/layouts/` for shell-level structure
- `src/styles/` for shared visual rules

Avoid hardcoding page content into components or scattering page-specific style overrides when a shared primitive should be updated instead.

## Repository Guardrails

Before meaningful changes, this repository expects a preflight against `.agent-harness/`. The important constraints are:

- preserve the fixed top-level route structure
- keep content, curation, layout, and styles separated
- keep route files thin
- favor shared primitives over one-off page logic
- update `.agent-harness/` when architecture or folder ownership changes

If you change the package in a way that alters folder responsibility, route ownership, or content flow, the matching `.agent-harness/` document should be updated in the same change so the documentation does not drift again.

## Practical Summary

This package is best understood as:

- a structured Astro portfolio, not a generic starter
- a typed content system with five collections
- a reusable UI/layout layer that drives all public routes
- a repository that deliberately separates canonical content from featuring/curation

If you are updating content, most work belongs in `src/content/`.
If you are updating layout or shared behavior, most work belongs in `src/components/`, `src/layouts/`, `src/lib/`, and `src/styles/`.
