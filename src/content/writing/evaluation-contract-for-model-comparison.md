---
title: "Evaluation Before Optimization"
summary: "A method for defining what must stay fixed before model comparisons mean anything: data handling, split discipline, metric interpretation, and output inspection. The goal is to reduce false confidence and make early results more trustworthy."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
status: "In progress"
tags:
  - Evaluation
  - Model comparison
sortOrder: 40
relatedProjects:
  - microscopy-benchmark-pipeline
---
# Recurring Engineering Problem
TODO: define how model comparison fails when evaluation rules shift between runs.

# Why It Matters
TODO: explain the cost of comparing models without a fixed evaluation contract.

# Approach
TODO: describe the reusable rules that keep comparisons stable and inspectable.

# Implementation Pattern
TODO: outline the checks, configs, and reporting structure that enforce the contract.

# Pitfalls
TODO: call out the most common ways evaluation drift sneaks back in.

# Reuse Across Projects
TODO: show where this comparison contract transfers beyond one benchmark.
