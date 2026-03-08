---
title: "How to evaluate dense prediction"
slug: "how-to-evaluate-dense-prediction"
summary: "A technical note on the difference between what a dense-prediction model optimizes during training and what should actually be inspected at evaluation time."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Dense Prediction"
listed: true
in_draft: true
tags:
  - Dense Prediction
  - Metrics
  - Evaluation
sortOrder: 80
relatedProjects: []
---
## Optimization target versus evaluation target

Dense prediction work gets confusing when the training loss and the evaluation metric are treated as if they answer the same question. They do not. The loss tells the model what to optimize. The metric tells the reader how to judge the behavior that emerged.

That distinction matters because a model can optimize the chosen loss faithfully while still looking weak under the task behavior that actually matters.

## What a useful evaluation should expose

A useful evaluation surface should make it easier to see:

- what kind of error the model is making
- which metric families emphasize or hide those errors
- whether saved outputs agree with the metric story
- whether improvements reflect the target the project actually cares about

Dense prediction is especially vulnerable to misleading summary metrics because spatial failures can be unevenly distributed.

## Why artifacts matter

Metrics without qualitative review are often too weak. Saved outputs help reveal whether the model improved the right structures, only smoothed the prediction, or learned a shortcut that the main metric does not punish enough.

## Common mistakes

The most common mistakes are:

- optimizing one objective and talking as if it guarantees the real task goal
- switching metrics casually between runs
- relying on a single headline number when the failure mode is visibly structured
