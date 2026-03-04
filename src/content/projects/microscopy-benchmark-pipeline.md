---
title: "BSCCM microscopy image-to-image pipeline"
summary: "A reproducible image-to-image benchmark pipeline built on the BSCCM dataset. The project uses 23 label-free microscopy views to predict 6 fluorescence channels, with an emphasis on controlled data handling, explicit run configuration, and stable evaluation before broader model comparisons."
featureImage: "/images/entry-previews/project-detail.svg"
cardEyebrowDetail: "Computational Microscopy"
featuredLabel: "Image-to-image dense prediction"
whyItMatters: "Microscopy model comparisons are easy to distort when data handling, preprocessing, and evaluation are inconsistent. This project focuses on building a baseline that is stable enough to trust before adding more model complexity."
status: "Building the first comparison-ready baseline"
currentMilestone: "Locking down a baseline that is actually trustworthy to compare: fixed data handling, explicit run configuration, stable metrics, and saved artifacts that make errors easier to inspect."
tags:
  - Microscopy
  - Reproducibility
  - Evaluation
sortOrder: 10
links:
  code: https://github.com/jignasu/example-microscopy-benchmark
---

## Overview

This project builds a reproducible image-to-image pipeline on the BSCCM dataset as a disciplined entry point into microscopy computer vision. The current task uses 23 label-free microscopy inputs for a single cell to predict 6 corresponding fluorescence image channels. The immediate goal is not to chase a flashy result or claim a benchmark win. It is to establish a baseline that can be trusted, inspected, and extended without changing the evaluation contract underneath it.

I started here because I wanted a project that would force the right fundamentals: careful data handling, explicit experiment structure, stable scoring, and model comparisons that remain meaningful when the baseline changes. The work is intentionally scoped as a benchmark foundation first, because in microscopy, weak setup can make model improvements look more convincing than they really are.

## Why this work exists

Microscopy model development is easy to compare poorly. Small differences in preprocessing, split logic, normalization, or reporting can make one run look better than another even when the comparison is not actually fair. Once that happens, it becomes difficult to tell whether a model improved, whether the data contract changed, or whether the score changed because the testing conditions were no longer the same.

This project exists to reduce that ambiguity. Before expanding into broader architecture comparisons, I wanted a stable comparison surface: one place where the data path is fixed, the training contract is explicit, the reporting is repeatable, and the outputs are easy to inspect. That makes later improvements easier to interpret and easier to trust.

## Why BSCCM

BSCCM is a strong starting point because it is a serious computational microscopy benchmark rather than an arbitrary collection of images. It provides paired modalities for the same cells, which makes it possible to define a supervised task with a clear input and target relationship. It is also large and structured enough that data handling, experiment organization, and evaluation discipline actually matter.

Just as importantly, BSCCM gives me a practical way to enter microscopy vision through a task that is concrete, measurable, and technically honest. It is rich enough to support real learning and model comparison, but focused enough that I can build strong fundamentals before moving into broader questions around robustness, expert-facing reliability, and higher-stakes imaging workflows.

## Task definition

The current task is straightforward: given 23 label-free LED-array microscopy images of a single cell, predict that cell's 6 fluorescence image channels. This is an image-to-image dense prediction problem. It shares some modeling patterns with segmentation, but it is not the same task, and I do not present it as segmentation here.

I chose to start from fluorescence image prediction instead of the downstream derived marker labels for a simple reason: the image channels are the more direct supervision target. The derived labels sit further downstream and depend on additional processing decisions and stronger assumptions. For a first benchmark, learning the paired modality mapping is the cleaner and more controlled place to begin. That lets the project focus on the model-to-signal relationship first, before adding another layer of interpretation on top of it.

## What I am building

The project is not the dataset itself. The project is the reproducible benchmark harness built on top of it.

That includes the practical pieces that make a comparison usable: dataset framing, loading policy, preprocessing decisions, run configuration, training flow, metric reporting, and artifact generation for inspection. The goal is to make each run understandable enough that a changed score can be traced back to a real change in the experiment rather than an untracked change in data handling or evaluation.

In other words, the core deliverable is not only a model checkpoint. It is a pipeline where experiments can be repeated, compared, and reviewed with enough structure that later model work has a reliable base to build on.

## Comparison contract

The most important part of this project is the comparison contract: what stays fixed so that model differences can be interpreted clearly.

That means keeping the input-target definition stable, making preprocessing decisions explicit, treating configuration as part of the recorded experiment state, and using a repeatable metric surface rather than one-off spot checks. It also means saving enough artifacts to inspect behavior directly, not just reading a single score and assuming the model is healthy.

For the initial baseline, I am using the released fluorescence crops directly as the target representation. I am not treating preprocessing or intensity policy as invisible background detail. Those choices are part of the benchmark design space, and they need to stay explicit so that future comparisons remain honest. The intent is to reduce accidental drift, not hide it.

## Current milestone

The current milestone is the first comparison-ready baseline.

At this stage, success does not mean state-of-the-art performance. Success means the baseline is stable enough that future model changes can be judged against it without reopening the entire setup. That includes fixed data handling, explicit run configuration, stable metrics, and saved predictions that make failure patterns easier to inspect.

This stage is deliberately conservative. A baseline only becomes useful once it is boring in the right ways: repeatable, legible, and hard to misread.

## Why this matters

Reliable model development starts with reliable comparison. In microscopy and other expert-facing domains, weak evaluation can create false confidence long before anyone notices the failure mode. A model that looks promising under a loose setup can waste time, hide regressions, or make follow-up work harder to trust.

This project focuses on the earlier layer of that problem: building a benchmark foundation where results are easier to audit before more complexity is added. If the baseline is disciplined, later improvements become easier to compare, easier to question, and easier to refine with confidence.

## Next steps

The next step is to finish the first stable baseline and use it as the fixed reference point for broader model comparisons. Once that baseline is locked down, I plan to evaluate stronger model families under the same contract rather than changing the task definition every time the architecture changes.

That next phase includes comparing baseline encoder-decoder approaches against more expressive variants, while keeping the data path, scoring logic, and review artifacts consistent. Deeper analysis, architecture notes, and longer-form benchmark reasoning will live in the related writing pieces. This page is intentionally focused on the project itself: what it is, why it exists, and how the foundation is being built.