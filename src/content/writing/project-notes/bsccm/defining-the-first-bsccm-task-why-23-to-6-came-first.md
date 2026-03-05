---
title: "Defining the first BSCCM task: why 23→6 came first"
slug: "defining-the-first-bsccm-task-why-23-to-6-came-first"
summary: "A project note on making the BSCCM benchmark concrete: what the 23-input to 6-target task actually is, why it is a disciplined first scope, and what it makes easier to learn before broader segmentation-style evaluation."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "project-note"
series: "BSCCM Project Notes"
listed: true
status: "Task framing locked"
tags:
  - Microscopy
  - BSCCM
  - Dense Prediction
sortOrder: 20
relatedProjects:
  - microscopy-benchmark-pipeline
---
## Making the task concrete

Once BSCCM became the starting point, the next job was to define a first task that was precise enough to implement and stable enough to compare later. The current task is: given 23 label-free microscopy views of a single cell, predict 6 fluorescence image channels for that same cell.

That sounds simple when reduced to a single sentence, but it still required careful framing. I needed to understand what the channels represented, what counted as the true prediction target, and where task confusion could creep in before any modeling began.

## Why this task came before broader alternatives

I chose the 23→6 image-to-image task because it is a cleaner first benchmark surface than jumping directly into a broader segmentation story. It keeps the project closer to the paired-modality supervision problem and avoids adding an extra layer of downstream interpretation too early.

For a first benchmark, that matters. It makes the model-to-signal relationship easier to reason about and keeps the evaluation contract tighter while I am still learning the data.

## What this task makes easier to learn

This framing is useful because it makes a few things easier to study directly:

- how the input modalities relate to the fluorescence targets
- how dense prediction errors show up in saved outputs
- how preprocessing and metric choices influence interpretation
- which model changes actually improve the mapping rather than only the reporting surface

It is not the final question I care about in microscopy, but it is a better first question than trying to answer everything at once.

## What it still leaves unresolved

This task does not eliminate the need for careful evaluation. It still leaves open questions around target handling, metric choice, split stability, and how results should be reviewed before they become a reference baseline.

What it does provide is a disciplined first scope where those questions can be answered inside a concrete benchmark instead of in the abstract.

## Next step

With the task definition in place, the remaining work is to build and validate the first comparison-ready baseline under a stable evaluation contract.
