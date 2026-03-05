---
title: "Experiment lineage and observability"
slug: "experiment-lineage-and-observability"
summary: "A method for preserving how runs evolved across configuration changes, reruns, and review passes so experiment history stays inspectable after the original context has faded."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
status: "Notes in progress"
tags:
  - Reproducibility
  - Observability
  - Configuration
sortOrder: 20
relatedProjects:
  - microscopy-benchmark-pipeline
---
## Why this needs to be one note

Configuration lineage and run observability are really the same reliability problem seen from two angles. Lineage tells me how a run came to exist. Observability tells me whether I can still understand that run once I return to it later.

If either half is missing, the result is the same: comparison slows down because the evidence is incomplete.

## What lineage has to preserve

At minimum, lineage should answer a few questions without manual archaeology:

- which configuration produced this run
- what changed relative to the run before it
- which dataset and split contract were active
- whether this run was a fresh branch, a rerun, or a resumed attempt

Without that ancestry, experiment history collapses into a pile of isolated outputs.

## What observability has to preserve

A run also needs a review surface. That usually means:

- key metadata that changes interpretation
- the metric slice that matters for the task
- saved predictions or artifacts that make failure visible
- lightweight checks that catch obvious issues before trust hardens

The point is not to log everything. The point is to log the fields that save the most review time later.

## The practical pattern

The practical pattern is to pair every run with explicit configuration context, a stable identity, and a compact review record. The combination matters more than any one field on its own. Metadata without artifacts is weak. Artifacts without ancestry are weak. A trustworthy run record needs both.

## Common ways this fails

The usual failure modes are predictable:

- logging too much noise and missing the fields that actually matter
- allowing manual overrides that never get captured
- renaming or reusing runs in ways that destroy ancestry
- treating observability as a one-time setup instead of a maintained contract

## Reuse across projects

This pattern applies well anywhere experiments are iterative, collaborative, or likely to be revisited after the original context has faded. The exact fields will vary, but the underlying requirement stays the same: every meaningful result should leave a dependable trail behind it.
