---
template: home
title: Home
description: Curated homepage sections that hydrate featured cards from the source content collections.
hero:
  eyebrow: "TODO: hero eyebrow"
  title: "TODO: hero headline"
  subtitle: >-
    TODO: one-sentence positioning that points to projects, writing, and
    proof-of-work without locking the final copy yet.
  primaryCtaLabel: "TODO: browse projects"
  primaryCtaHref: /projects
  secondaryCtaLabel: "TODO: read writing"
  secondaryCtaHref: /writing
intro:
  heading: "TODO: intro heading"
  body: >-
    TODO: brief site orientation that explains this portfolio will collect
    projects, writing, tools, and a direct resume path without turning into a
    biography block.
  supportingNote: >-
    TODO: optional supporting note that nudges visitors toward the strongest
    next click while the final content is still pending.
featuredProjects:
  sectionTitle: "TODO: featured projects title"
  sectionIntro: >-
    TODO: short section intro that frames these cards as the fastest
    build-oriented proof on the homepage.
selectedWriting:
  sectionTitle: "TODO: selected writing title"
  sectionIntro: >-
    TODO: short section intro that separates project-specific case studies from
    reusable engineering methods.
  groups:
    - kind: case-study
      label: Case Studies
    - kind: method
      label: Methods
featuredTools:
  sectionTitle: "TODO: featured tools title"
  sectionIntro: >-
    TODO: short section intro that frames these as interactive artifacts
    distinct from projects and writing.
resumeCta:
  heading: "TODO: resume CTA heading"
  body: >-
    TODO: resume CTA body that keeps the closing action direct,
    recruiter-friendly, and structurally separate from the footer.
  primaryCtaLabel: "TODO: view resume"
  primaryCtaHref: /resume
  secondaryCtaLabel: "TODO: download resume"
  secondaryCtaHref: /resume#download
authorNotes:
  - Replace the placeholder homepage copy with concise, recruiter-legible language.
  - Keep this file focused on public-facing text; use src/data/home.ts only for homepage curation rules.
  - Remove explicit slug ordering from src/data/home.ts only when the featured fallback is good enough.
---

<!-- Homepage rendering is driven from frontmatter so these author notes stay private. -->
