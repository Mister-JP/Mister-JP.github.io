---
template: about
title: About me
description: I’m an engineer focused on production ML, computer vision, and evaluation-first systems built to be reliable, measurable, and easy to trust.
eyebrow: Profile

background:
  heading: Background
  paragraphs:
    - >-
      My professional foundation is in production engineering shaped by applied
      machine learning. At Amazon, I worked on computer vision systems that had
      to perform under real operational constraints: high throughput, strict
      latency targets, edge deployment on Nvidia GPU devices, and releases that
      needed to remain stable as the system evolved. That environment taught me
      to treat deployment as part of the same engineering responsibility as
      development itself. I built and maintained hardened CI/CD pipelines, ran
      integration checks before release, and relied on canaries, staged
      rollouts, rollback paths, and deployment health tracking to keep changes
      safe, controlled, and predictable.
    - >-
      Working in that kind of setting naturally pushed my attention toward the
      parts of machine learning that matter once a model leaves the notebook. I
      care deeply about evaluation design, sampling discipline, monitoring, and
      the practical mechanics of improving a system without weakening trust in
      its behavior. In practice, that has meant building continuous evaluation
      loops, making performance easier to inspect across representative slices
      of data, and tuning decision thresholds with clear trade-offs in mind
      rather than treating model output as something to accept without
      scrutiny. The work that interests me most is the work that keeps results
      legible over time, so that performance can be reviewed, questioned, and
      refined with confidence.
    - >-
      That same perspective extends beyond model behavior into the surrounding
      systems that determine whether a solution is actually useful in
      production. I have built internal tools used by large frontline teams,
      removed time-consuming manual bottlenecks through asynchronous
      orchestration, and strengthened operational reliability through cleaner
      processes, clearer runbooks, and better support for day-to-day use. I
      have also implemented compliance workflows such as GDPR right-to-erasure,
      with the safeguards and monitoring needed to make those guarantees real in
      practice. Across all of this, the common thread is simple: I am most
      drawn to work that turns complex, failure-prone processes into systems
      that are dependable, reviewable, and easier for other people to trust.

work:
  heading: Engineering Approach
  paragraphs:
    - >-
      I am most drawn to technical work where change has to be controlled and
      system behavior needs to stay understandable across repeated releases. In
      practice, that has pushed me toward reproducible experiment setup,
      continuous evaluation, and release workflows built around integration
      checks, canary promotion, staged rollout, and rollback criteria. I value
      systems where changes are traceable, operational behavior is observable,
      and improvement does not come at the cost of clarity.
    - >-
      That same instinct shapes how I think about evaluation. I care not only
      about whether a system appears to work, but how it was tested, which
      trade-offs define its behavior, and what evidence should justify a tighter
      threshold, a redesign, or a rollback. In machine learning work, that
      means representative sampling, monitored production checks, and explicit
      handling of metrics such as precision and recall so that model behavior
      remains understandable under real operating conditions.
    - >-
      Across projects, this has led me to build systems that are easier to
      operate as well as easier to improve: production pipelines with controlled
      deployments, evaluation loops that catch regressions before they spread,
      and internal tools that remove manual bottlenecks for the teams using
      them. I do my best work when I can
      turn complex, failure-prone processes into systems that are easier to
      review, safer to change, and more trustworthy for the people who depend on
      them.

focus:
  heading: Current Focus
  summary: >-
    I’m building a portfolio of artifacts that demonstrate reliable ML engineering: reproducible
    workflows, evaluation-first benchmark harnesses, and lightweight tools that make technical
    judgment easier to trust.
  details:
    - That includes experiment lineage, dataset and split discipline, continuous evaluation patterns, and tooling that makes results legible.
    - I’m especially interested in roles that value shipping and rigor together like Applied ML / ML Systems / Computer Vision Engineering where the goal is measurable reliability, not just novelty.

contact:
  heading: Contact
  intro: Reach out directly for collaboration or roles in applied ML and production engineering, or follow the work where it’s easiest to stay current.
---
