# Mister-JP.github.io

This repository is a working Astro portfolio scaffold for Jignasu Pathak. The route structure, shared layout system, content collections, and placeholder entries are already in place. It is not an empty starter, but it is also not content-complete yet.

## What this repo is

This repo is a content-first Astro 5 site for a personal portfolio with a fixed top-level information architecture:

- `Home`
- `About`
- `Projects`
- `Writing`
- `Tools`
- `Resume`

The current build already includes:

- shared layout and navigation primitives
- content collections for page copy, projects, writing, and tools
- list and detail routes for projects, writing, and tools
- a recruiter-facing resume route with an embedded PDF contract
- placeholder content files and scaffolds that make future content entry predictable

Most content is still placeholder content, but the site structure is real and already wired.

## Current architecture

The current implementation is organized around four separate responsibilities and should stay that way:

- layout: `src/layouts/` and `src/components/layout/`
- content: `src/content/`
- curation/config: `src/data/`
- utility helpers: `src/lib/`

The main architectural contract today is:

- `src/layouts/SiteShell.astro` is the shared page shell. It imports `src/styles/global.css`, wraps every page with the shared header and footer, and carries the HTML document shell.
- `src/components/layout/` contains shared structural pieces such as `Header.astro`, `Footer.astro`, and `PageHeader.astro`.
- `src/components/navigation/` contains the navigation primitives used by the shared header.
- `src/components/ui/` contains reusable UI primitives such as `Container`, `Card`, `Button`, `Grid`, `Section`, `GroupedPanel`, `Divider`, `Tag`, `SectionIntro`, and `Prose`.
- `src/components/projects/`, `src/components/tools/`, and `src/components/writing/` contain collection-specific cards and detail templates.
- `src/pages/` contains route files only. The routes compose shared primitives and data helpers; they are not the source of truth for long-form content.
- `src/content/config.ts` defines four Astro content collections: `pages`, `projects`, `writing`, and `tools`.
- `src/data/` contains small non-article config such as primary navigation (`src/data/navigation.ts`) and shared shell/footer data (`src/data/site.ts`).
- `src/lib/content-paths.ts` centralizes URL generation for projects, writing, and tools.
- `src/lib/home-content.ts` resolves homepage copy and featured content references from `src/content/pages/home.md`, and it throws if a referenced entry is missing or grouped under the wrong writing kind.
- `src/lib/resume-content.ts` resolves resume copy from `src/content/pages/resume.md` and checks whether the configured PDF exists in `public/`.
- `src/lib/writing-detail.ts` prepares writing detail pages, including optional related-project data and rendered markdown headings.
- `src/lib/collection-utils.ts` centralizes sorting by `sortOrder` and then `title`.
- `src/styles/tokens.css` holds shared design tokens and CSS variables. `src/styles/base.css` holds shared global element rules. `src/styles/global.css` imports both.

Current page ownership is split like this:

- Fully content-driven: `/`, `/about`, `/projects`, `/tools`, `/writing`, `/resume`, `/projects/[slug]`, `/tools/[slug]`, `/writing/case-studies/[slug]`, `/writing/methods/[slug]`
- Internal-only composition harness: `/internal/primitives`

The current visual direction is intentionally soft, graceful, pastel, calm, highly controlled, and readable first, with calligraphic styling reserved for limited accent use. Keep that intent in design decisions, not in technical naming. Use neutral implementation names such as `SiteShell`, `PageHeader`, `Section`, and token names. Do not turn aesthetic language into structural labels, and keep the banned implementation term documented in `.agent-harness/` out of identifiers, class names, file names, and examples.

## Local development

Run the site with the commands already defined in `package.json`:

1. `npm ci`
2. `npm run dev`
3. `npm run check`
4. `npm run build`
5. `npm run preview`

Current setup notes:

- `astro.config.mjs` is currently minimal: `defineConfig({})`
- no deployment workflow is present in this snapshot
- no extra environment-variable contract is documented in the repo right now

## Folder guide

Use this as the current folder contract:

- `src/pages/`: route files only, including list pages, dynamic detail pages, and the internal primitive harness
- `src/layouts/`: the shared page shell (`SiteShell.astro`)
- `src/components/layout/`: header, footer, and shared page-header structure
- `src/components/navigation/`: shared nav composition used by the header
- `src/components/ui/`: reusable UI primitives
- `src/components/projects/`: project cards and the project detail template
- `src/components/tools/`: tool cards and the tool detail template
- `src/components/writing/`: writing cards and the writing detail template
- `src/content/pages/`: page-copy content entries for `home` and `about`
- `src/content/projects/`: project entries
- `src/content/writing/`: case studies and method articles
- `src/content/tools/`: tool entries
- `src/data/`: small config and curation data, not long-form content
- `src/lib/`: helper utilities for sorting, URL paths, and route-ready data composition
- `src/styles/`: shared tokens and base styles
- `public/`: passthrough assets, including the current resume PDF
- `scaffolds/`: markdown starter templates for new projects, writing entries, and tools
- `.agent-harness/`: repository ground truth and architectural guardrails

## Content collections

### `pages`

Purpose:
Owns structured page copy for the top-level `home` and `about` routes.

Main required fields:
This collection is a discriminated union keyed by `template`.

- `template: home` requires `title`, `description`, `hero`, `intro`, `featuredProjects`, `selectedWriting`, `featuredTools`, `resumeCta`, and optional `authorNotes`
- `template: about` requires `title`, `description`, `eyebrow`, `intro`, `background`, `work`, `focus`, `contact`, and optional `authorNotes`

Long-form markdown body:
Not part of the public rendering contract right now. The current routes read frontmatter only.

How it appears in the site:
`src/content/pages/home.md` powers `/`. `src/content/pages/about.md` powers `/about`.

References:
No cross-collection references are defined here.

### `projects`

Purpose:
Owns the main project library plus the per-project detail pages.

Main required fields:
`title`, `summary`, `whyItMatters`, `status`, `currentMilestone`, `tags`, `featured`, `sortOrder`, `links`, `relatedWriting`, `relatedTools`, and `resultSnapshot`

Long-form markdown body:
Optional but supported. `src/pages/projects/[slug].astro` renders the markdown body when it exists.

How it appears in the site:
Project entries appear in `/projects`, on the homepage featured-projects section, and at `/projects/[slug]`.

References:
Yes. `relatedWriting` is an array of `writing` references. `relatedTools` is an array of `tools` references.

### `writing`

Purpose:
Owns both case studies and reusable methods articles.

Main required fields:
`title`, `summary`, `kind`, `status`, `sortOrder`, with optional/defaulted `tags`, `featured`, and `relatedProject`

Long-form markdown body:
Expected for real articles. Both writing detail routes render the markdown body when it exists.

How it appears in the site:
Writing entries appear in `/writing`, on the homepage selected-writing section, and at either `/writing/case-studies/[slug]` or `/writing/methods/[slug]`.

References:
Yes. `relatedProject` can point to one `projects` entry.

Important split:
`writing` uses `kind` to divide entries into `case-study` and `method`. `src/lib/content-paths.ts` and the two dynamic writing routes depend on that split.

### `tools`

Purpose:
Owns the tool library plus each tool detail page.

Main required fields:
`title`, `summary`, `status`, `sortOrder`, `links`, with optional/defaulted `featured`, `previewImage`, `tags`, `relatedProject`, and `relatedWriting`

Long-form markdown body:
Expected for real tool detail pages. `src/pages/tools/[slug].astro` renders the markdown body when it exists.

How it appears in the site:
Tool entries appear in `/tools`, on the homepage featured-tools section, and at `/tools/[slug]`.

References:
Yes. A tool can reference one related `projects` entry and multiple `writing` entries.

## How maintainers update structure

Use these steps before changing layout, routes, or shared behavior:

1. Preserve the current separation exactly: layout in `src/layouts/` and `src/components/layout/`, content in `src/content/`, shared non-content config in `src/data/`, and utility helpers in `src/lib/`.
2. Treat `src/layouts/SiteShell.astro` as the shared page wrapper. Structural changes that affect every page should start there, not inside individual routes.
3. Treat `src/components/ui/` as the shared UI primitive layer. If a pattern repeats, add or update a primitive there instead of cloning markup into multiple pages.
4. Keep route files in `src/pages/` thin. Their job is to compose layouts, shared components, and data helpers, not to become long-term content stores.
5. Remember which pages are already content-driven: every public route except `src/pages/internal/primitives.astro` reads structured content and should stay that way.
6. Keep content references valid. `projects` can reference `writing` and `tools`; `writing` can reference one `project`; `tools` can reference one `project` and many `writing` entries; `src/content/pages/home.md` also references featured `projects`, `writing`, and `tools`.
7. Add a new route only when the existing content model cannot express the new need. If the change is “new project,” “new tool,” “new article,” or “new homepage selection,” add content instead of adding a route.
8. Use shared tokens from `src/styles/tokens.css` and shared global rules from `src/styles/base.css`. Page-specific styling hacks create drift, make visual fixes harder to propagate, and break the current design-system contract.
9. If you intentionally change architecture, route ownership, or folder responsibilities, update the matching `.agent-harness/` document as part of the same change. In practice, that usually means `repo-structure.md` for folder ownership and `architecture.md` for route/IA changes.

## How content managers update content

For normal content work, prefer `src/content/` over `src/pages/`. Use `src/data/` only for shared non-content config such as navigation and shell metadata. Use the task checklists below.

### Update homepage copy

1. Edit `src/content/pages/home.md`.
2. Update the frontmatter blocks you need: `hero`, `intro`, `featuredProjects`, `selectedWriting`, `featuredTools`, and `resumeCta`.
3. Keep `selectedWriting.groups` aligned to the existing kinds: one `case-study` group and one `method` group.
4. Keep CTA links valid, especially `/projects`, `/writing`, and `/resume`, unless you are intentionally changing navigation.
5. Test afterward: run `npm run check`, then open `/` and confirm the hero, section intros, and CTA labels changed as expected.

### Change featured project order

1. Edit `src/content/pages/home.md`.
2. Update `featuredProjects.entries` in the exact order you want the cards to appear.
3. Keep every entry reference matched to an existing file in `src/content/projects/`; `src/lib/home-content.ts` throws if a reference is missing.
4. Test afterward: open `/` and confirm the featured-project cards appear in the same order as the `entries` list.

### Add a new project

1. Copy `scaffolds/project-template.md` into `src/content/projects/<slug>.md`.
2. Replace the placeholder frontmatter with real values for `title`, `summary`, `whyItMatters`, `status`, `currentMilestone`, `tags`, `featured`, `sortOrder`, `links`, `relatedWriting`, `relatedTools`, and `resultSnapshot`.
3. Add markdown body content if the project should have long-form detail on `/projects/<slug>`. The route renders the body only when it exists.
4. Keep every `relatedWriting` and `relatedTools` reference pointed at real entry slugs in the matching collections.
5. If the project should appear on the homepage, add it to `src/content/pages/home.md` under `featuredProjects.entries`.
6. Test afterward: run `npm run check`, then open `/projects`, `/projects/<slug>`, and `/` if you featured it.

### Add a new case study

1. Copy `scaffolds/case-study-template.md` into `src/content/writing/<slug>.md`.
2. Keep `kind: case-study`.
3. Fill the frontmatter fields: `title`, `summary`, `status`, `tags`, `featured`, `sortOrder`, and optional `relatedProject`.
4. Keep `relatedProject` pointed at a real project slug if you set it.
5. Write the markdown body sections. The detail route expects the article body to carry the actual narrative.
6. If this case study should appear on the homepage, add it to the `case-study` group in `src/content/pages/home.md`.
7. Test afterward: run `npm run check`, then open `/writing`, `/writing/case-studies/<slug>`, and the related project page if one is linked.

### Add a new method article

1. Copy `scaffolds/method-template.md` into `src/content/writing/<slug>.md`.
2. Keep `kind: method`.
3. Fill the frontmatter fields: `title`, `summary`, `status`, `tags`, `featured`, `sortOrder`, and optional `relatedProject`.
4. Keep `relatedProject` pointed at a real project slug if you set it.
5. Write the markdown body sections so `/writing/methods/<slug>` has real long-form content.
6. If this method should appear on the homepage, add it to the `method` group in `src/content/pages/home.md`.
7. Test afterward: run `npm run check`, then open `/writing`, `/writing/methods/<slug>`, and the related project page if one is linked.

### Add a new tool

1. Copy `scaffolds/tool-detail-template.md` into `src/content/tools/<slug>.md`.
2. Fill the frontmatter fields: `title`, `summary`, `status`, `sortOrder`, `featured`, `links`, `tags`, optional `previewImage`, optional `relatedProject`, and `relatedWriting`.
3. Keep `relatedProject` and every `relatedWriting` value pointed at real entry slugs if you use them.
4. Add markdown body content so `/tools/<slug>` has a real detail page. The route renders the body only when it exists.
5. If the tool should appear on the homepage, add it to `src/content/pages/home.md` under `featuredTools.entries`.
6. Test afterward: run `npm run check`, then open `/tools`, `/tools/<slug>`, and `/` if you featured it.

### Update About page

1. Edit `src/content/pages/about.md`.
2. Update the frontmatter sections you need: `intro`, `background`, `work`, `focus`, and `contact`.
3. Keep every `contact.links[].href` value valid, especially external profile URLs and `mailto:` links.
4. Leave `template: about` unchanged.
5. Test afterward: open `/about` and verify the revised copy, links, and section ordering.

### Replace resume PDF

1. Replace the file at `public/resume/jignasu-pathak-resume.pdf` if you are keeping the current contract.
2. If you change the file name or location, also edit `src/content/pages/resume.md` and update `pdf.path`.
3. Keep `pdf.path` aligned with the actual file location; the page now derives availability from the file system and does not use a manual ready flag.
4. Do not forget that the same `pdf.path` drives the download button, the open-in-new-tab action, and the inline iframe preview.
5. Test afterward: open `/resume`, use both buttons, and confirm the inline preview still loads.

### Change recruiter-facing resume summary

1. Edit `src/content/pages/resume.md`.
2. Update `pdf.summary` for the short recruiter-facing overview.
3. Update `highlights.items` for the quick-highlight bullets if the pitch changed.
4. Keep `pdf.path` unchanged unless you are also moving the PDF.
5. Test afterward: open `/resume` and confirm the summary and highlight copy render correctly.

## How homepage curation works

The homepage uses a single content entry:

- `src/content/pages/home.md` controls both homepage copy and homepage composition

Current behavior:

- `src/content/pages/home.md` owns the visible text and the featured entry references for projects, writing groups, and tools.
- `src/lib/home-content.ts` resolves those references into the final homepage payload.
- Homepage ordering follows the order of the `entries` arrays in `src/content/pages/home.md`.
- If a referenced entry does not exist, the build fails.
- If a homepage writing group includes an entry whose `kind` does not match the configured group, the build fails.

Most important rule:
Changing homepage cards now happens in `src/content/pages/home.md`.

## How resume updates work

The resume route is driven by one content entry plus one static asset:

- content: `src/content/pages/resume.md`
- asset: `public/resume/jignasu-pathak-resume.pdf`

Current contract:

- `pdf.path` is the public URL used for download, open-in-new-tab, and preview
- `src/lib/resume-content.ts` checks whether the file exists at `public${pdf.path}`
- `pdf.summary` and `highlights.items` control the recruiter-facing copy
- The page automatically switches between active buttons/iframe and the fallback state based on whether the file exists
- The rest of the `pdf.*` fields control labels and fallback copy

The current snapshot already includes the PDF at the configured path. The placeholder copy in `pdf.summary` and `highlights.items` still needs to be replaced.

## Authoring workflow using scaffolds

Use the existing scaffold files instead of hand-inventing frontmatter:

1. Choose the matching starter in `scaffolds/`: `project-template.md`, `case-study-template.md`, `method-template.md`, or `tool-detail-template.md`.
2. Copy it into the correct collection folder under `src/content/`.
3. Rename the file to the slug you want in the final URL. The filename becomes the route slug.
4. Replace every `TODO:` placeholder in the frontmatter that applies to the entry.
5. Add or revise the markdown body so the detail page has real long-form content where the route supports it.
6. Keep cross-collection references valid. Do not point at slugs that do not exist.
7. If the new entry should be featured on the homepage, update `src/content/pages/home.md`.
8. Run the validation checklist at the end of this README before considering the entry done.

## Known gaps / pending setup

### Current state / pending work

- Content is still mostly placeholder content.
- Many existing entries still contain explicit `TODO:` markers in frontmatter, markdown body content, or both.
- The resume route is structurally complete, but the recruiter-facing summary and highlights still contain placeholder copy.
- Deployment workflow is not present in this snapshot.
- `astro.config.mjs` is intentionally minimal right now.
- The internal primitives harness still exists as a route-level composition reference in `src/pages/internal/primitives.astro`.

Maintainer caution about ignored files:

- The current `.gitignore` starts with `.*`, which ignores root dot-directories.
- That means future paths such as `.github/workflows/` can be accidentally ignored until the rule is narrowed.
- `.gitignore` also explicitly ignores `AGENTS.md`.

## Common mistakes to avoid

- Editing `src/pages/index.astro` to change homepage copy when that copy already belongs in `src/content/pages/home.md`.
- Changing homepage section text in `src/content/pages/home.md` and forgetting that the same file also owns the featured entry references.
- Changing a content filename slug without updating every collection reference and every homepage `entries` array that points to it.
- Forgetting that `writing.kind` controls whether an entry routes to `/writing/case-studies/` or `/writing/methods/`.
- Adding a new route when the change only requires a new content entry.
- Pushing page-specific style literals instead of using the shared token layer in `src/styles/tokens.css`.
- Moving the resume PDF without updating `src/content/pages/resume.md`.
- Leaving placeholder external links such as `your-handle`, `hello@example.com`, or placeholder GitHub URLs in public content.

## Validation checklist

- `npm ci`
- `npm run check`
- `npm run build`
- Click through every affected route
- Verify collection references resolve
- Verify no placeholder links remain accidentally
- Verify the resume asset path still works if you changed it
