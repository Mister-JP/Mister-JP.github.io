---
title: "Why microscopy computer vision is hard to benchmark"
slug: "why-microscopy-computer-vision-is-hard-to-benchmark"
summary: "A research note on why microscopy benchmarks stay fragmented: domain shift, annotation friction, task variation, and the gap between leaderboard-style comparison and decision-grade reliability."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "research"
series: "Microscopy Research"
listed: true
status: "Draft in progress"
tags:
  - Microscopy
  - Benchmarking
  - Domain Shift
sortOrder: 10
relatedProjects:
  - microscopy-benchmark-pipeline
---
## The core difficulty

Microscopy computer vision is hard to benchmark because the field does not revolve around one stable task, one stable data regime, or one stable notion of success. Datasets differ in modality, staining, acquisition setup, annotation quality, and downstream use, which makes comparison fragile even before model architecture enters the picture.

## Why domain shift matters so much

Domain shift is not a side issue here. It is one of the main reasons benchmark claims weaken so quickly. Changes in lab protocol, hardware, image statistics, cell populations, and annotation style can all change what a model is really being asked to generalize to.

That is why a model that looks strong on one benchmark surface can still be weak evidence for broader reliability.

## Why the field stays fragmented

The fragmentation is structural, not only organizational. Different microscopy problems invite different targets, different labels, and different evaluation choices. That makes it difficult for the field to converge on a single benchmark surface that is both broadly representative and clean enough to compare fairly.

In practice, many papers settle for narrower benchmark habits that are useful locally but do not add up to a widely trusted common reference point.

## Where comparison breaks down

Comparison usually weakens when one of these things becomes implicit:

- how the task is framed
- what kind of shift the data already contains
- how labels were produced
- which metrics hide important failure modes
- whether the benchmark was built for ranking models or supporting decisions

Once those assumptions drift out of view, a leaderboard becomes much easier to produce than a trustworthy benchmark.

## What this implies

The practical implication is not that benchmarking is impossible. It is that microscopy needs more careful benchmark contracts than fields where the task surface is already narrow and standardized.
