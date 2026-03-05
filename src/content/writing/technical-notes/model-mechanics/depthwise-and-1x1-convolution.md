---
title: "Depthwise and 1x1 convolution: spatial filtering vs channel mixing"
slug: "depthwise-and-1x1-convolution"
summary: "A technical note on the different jobs played by depthwise and 1x1 convolution, and why they are often paired when efficiency or channel control matters."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
status: "Draft in progress"
tags:
  - Convolution
  - CNNs
  - Efficiency
sortOrder: 20
relatedProjects: []
---
## Why these two are worth comparing together

Depthwise convolution and 1x1 convolution are often discussed near each other because they solve different parts of the same problem. One focuses on spatial filtering inside each channel. The other focuses on mixing and projecting information across channels.

Putting them side by side makes their roles easier to keep straight.

## What depthwise convolution changes

Depthwise convolution applies a spatial filter to each input channel separately. That makes it cheaper than a full convolution, but it also means it does not perform full cross-channel mixing on its own.

Its value is that it can preserve spatial processing capacity while reducing parameter and compute cost.

## What 1x1 convolution changes

A 1x1 convolution does not expand spatial context. Instead, it mixes channels at each spatial location. That makes it useful for projection, width changes, bottlenecks, and restoring channel interaction after a depthwise stage.

## Why they are often paired

The pair works because the two layers divide labor cleanly:

- depthwise handles cheap spatial filtering
- 1x1 handles channel mixing and projection

That is why separable-style blocks often combine them rather than expecting either layer to do everything alone.

## Common misunderstandings

Depthwise convolution is not a drop-in replacement for a full convolution in every setting. A 1x1 convolution is not a substitute for wider spatial aggregation. Each one is useful precisely because its role is narrower.
