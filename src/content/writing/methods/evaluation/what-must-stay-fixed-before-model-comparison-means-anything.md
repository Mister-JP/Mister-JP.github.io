---
title: "What must stay fixed before model comparison means anything"
slug: "what-must-stay-fixed-before-model-comparison-means-anything"
summary: "A method for defining the comparison contract before optimization begins: split discipline, target definitions, metric interpretation, artifact review, and the checks that keep early results from becoming false confidence."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
status: "In progress"
tags:
  - Evaluation
  - Model comparison
  - Data Splits
sortOrder: 30
relatedProjects:
  - microscopy-benchmark-pipeline
---
## Why this matters before the first result

Model comparison fails long before the architecture changes if the evaluation contract is still moving underneath the runs. A score only becomes useful once the reader can trust that the data path, metric surface, and review standard stayed fixed enough for the difference to mean something.

## The comparison contract

Before optimization starts, a few things need to stop drifting:

- the dataset split and sampling policy
- the target representation and preprocessing assumptions
- the reported metrics and how they are interpreted
- the artifacts required for direct inspection
- the final run review that separates a finished training job from evidence

This is the minimum surface that has to remain stable before rankings are worth discussing.

## Split discipline

Split logic is part of the benchmark, not only a data-loading detail. If the split changes casually between runs, then every later comparison carries hidden uncertainty about what the model actually saw and what it was asked to generalize to.

## Metrics and artifacts

Metrics without saved outputs are too easy to overread. Saved outputs without a stable metric surface are too easy to rationalize. The contract needs both because dense prediction tasks can hide failure in either direction.

## Run review

A completed run is not the same as a trustworthy result. The last step is a review pass that checks whether the run respected the contract, whether the artifacts look plausible, and whether the reported result should be treated as a real comparison point or only as an exploratory pass.

## What this prevents

This method exists to block a small set of expensive mistakes:

- comparing models across changed split logic
- presenting scores without the artifacts needed to inspect them
- accepting early results before the evaluation assumptions are stable
- turning every later comparison into a debate about the benchmark instead of the model

## Reuse across projects

The exact checklist will vary by domain, but the principle transfers cleanly: define what stays fixed early, keep it explicit, and treat any later change to that contract as a benchmark change rather than a model win.
