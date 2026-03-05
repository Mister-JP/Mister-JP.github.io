---
title: "Why deep networks need nonlinearity"
slug: "why-deep-networks-need-nonlinearity"
summary: "A technical note on what nonlinearity adds to a model, why ReLU became the default teaching example, and where simple activation intuition starts to break down."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
status: "Draft scaffold"
tags:
  - Activations
  - Neural Networks
sortOrder: 40
relatedProjects: []
---
## What nonlinearity changes

If every layer were purely linear, stacking more of them would collapse into another linear transformation. Nonlinearity is what lets depth buy expressive power instead of only extra parameters arranged in a longer chain.

## Why ReLU became the common example

ReLU is easy to explain and easy to use, which is why it became the usual teaching example. It also carries practical tradeoffs around sparsity, dead activations, and how gradients move during training.

## Where the simple story breaks

The simple story is useful, but incomplete. Nonlinearity does not automatically make a model good, and ReLU is not the final word on activation choice. The main point is to understand what expressive role the activation is playing before comparing variants.
