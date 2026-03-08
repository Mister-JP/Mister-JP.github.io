---
title: "Defining the first BSCCM task"
slug: "defining-the-first-bsccm-task-why-23-to-6-came-first"
summary: "A project note on making the BSCCM benchmark concrete: what the 23-input to 6-target task actually is, why it is a disciplined first scope, and why it came before more semantic or less directly assay-linked alternatives."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "project-note"
series: "BSCCM Project Notes"
listed: true
in_draft: false
tags:
  - Microscopy
  - BSCCM
  - Dense Prediction
sortOrder: 20
relatedProjects:
  - microscopy-benchmark-pipeline

---

The first challenge in BSCCM was not choosing a network. It was choosing a question.

That sounds smaller than it is. BSCCM is rich enough that “start training a model” is not a real plan. The dataset contains hundreds of thousands of single white blood cells imaged under multiple LED-array illumination patterns, paired 6-channel fluorescence measurements, and a subset with matched histology.[^bsccm][^bsccm-site] That makes many projects possible at once: classification, reconstruction, virtual staining, marker prediction, cross-modal learning, and later biological inference. The hard part was deciding which of those should come first.

This note explains why I chose the first task as **23→6**: a conditional dense-prediction problem that takes 23 label-free input channels and predicts 6 fluorescence channels. I did not choose it because it was the most ambitious-looking task in the dataset. I chose it because it sits at a strong intersection of measurement fidelity, dense supervision, biological relevance, and interpretability. It is the first BSCCM task that felt both technically meaningful and disciplined enough to support trustworthy iteration.

## BSCCM is best understood as an imaging-system benchmark

A useful way to read the BSCCM paper is to stop thinking of it as a generic cell-image dataset and start thinking of it as an imaging-system benchmark.

The paper’s real contribution is not just scale. It is the pairing. The same single white blood cells are imaged through a programmable LED-array microscope for label-free acquisition and then through a fluorescence path for 6-channel fluorescence measurement. For a subset, there is also matched histology collected afterward.[^bsccm][^bsccm-site] That same-cell correspondence is what makes BSCCM especially valuable for dense prediction. It turns the benchmark into a controlled setting for asking whether information present in a label-free imaging path can be mapped to information usually obtained through more conventional assay channels.

That distinction matters because it changes what a sensible first project looks like. If BSCCM only provided label-free images and cell-type labels, the natural entry point would be classification. But BSCCM gives something richer than that: paired measurements across modalities on the same cells. That makes image-to-image prediction feel native to the dataset rather than artificially imposed on it.[^bsccm]

## The first task had to be chosen, not assumed

A large benchmark does not automatically tell you what the first task should be. In BSCCM, several tasks are possible, but not all of them are equally good starting points.

Direct cell-type prediction was not the right first task. BSCCM does provide classification labels, but those labels are not the cleanest target in the dataset. They are built from fluorescence-derived protein measurements for only a subset of the all-antibody cells, one fluorescence-derived channel was considered too noisy to use for defining classes, and the paper explicitly says it is unclear whether all 10 classes reflect biological variability rather than measurement noise.[^bsccm] That makes classification useful later, but not the strongest first benchmark target.

Histology was also not the best place to begin. It is valuable, especially because stained blood-smear style imaging makes white blood cell morphology easier for humans to read, but in BSCCM it is only available for a subset of cells and is collected later, after Wright staining, remounting, and imaging under a different optical setup.[^bsccm] That makes it an important reference modality, but not the cleanest first prediction target.

What remained was the task that stays closest to the main paired measurement structure of the dataset: predicting the fluorescence image stack from the LED-array image stack. That keeps the first problem dense, widely available across the dataset, and close to what the microscope actually measured.[^bsccm][^bsccm-site] It also fits the broader motivation of the paper, which frames BSCCM as a way to compare label-free microscopy against existing assays used for white blood cell characterization.[^bsccm] That is why 23→6 came first.



## What 23→6 actually means

In practical terms, the task is simple to state.

The input is a stack of **23 label-free channels** from the LED-array microscope: 22 multi-LED patterns and 1 single-LED image.[^bsccm]
The target is a stack of **6 fluorescence channels** from the fluorescence path on the same cell.[^bsccm][^bsccm-site]
The model is also given the **stain condition** used for that sample, because fluorescence is not determined by morphology alone. BSCCM includes unstained, single-antibody, and all-antibody conditions, and the per-cell metadata records which condition each cell came from.[^bsccm][^dryad]

That shorthand matters because it makes the benchmark concrete. The input is not one microscopy image. It is a structured stack of label-free observations under different illumination patterns. The target is not a class label or a handcrafted summary. It is a fluorescence image stack for the same cell. That means the model is asked to produce a spatially structured output, not just a global prediction.

This is exactly the kind of problem where dense prediction starts to feel like the right language. The task preserves morphology, localization, and channel-specific structure. It gives you outputs that can be inspected visually instead of only scored numerically. That makes it a stronger first learning problem than many more compressed alternatives.

## Why fluorescence came before more semantic targets

The most important design choice was deciding what the model should imitate.

One tempting route was to predict the fluorescence-derived protein-abundance outputs discussed in the BSCCM paper. Those targets are attractive because they feel closer to biology. But they are not the microscope’s raw measurement. They are downstream products of background correction, shading correction, and spectral unmixing. The paper is explicit that this becomes harder in the all-antibody setting, where spectra overlap, autofluorescence is present, and the problem is underdetermined enough that some markers must be grouped in the fuller unmixing model.[^bsccm][^dryad]

That is why I did **not** want the first task to be “predict the paper’s final semantic estimate.” That would have made the network imitate both the microscope and the authors’ downstream demixing assumptions at the same time.

Predicting the **6 measured fluorescence channels** is cleaner. It keeps the first objective closer to the instrument. The model is not trying to infer true biology directly. It is trying to emulate what the fluorescence microscope would have measured for that same cell under that same staining setup. That is a more defensible first target, and it leaves later biological interpretation as a second-stage question rather than pretending it was solved inside the first mapping.

## Why not start with cell type or histology

Cell-type prediction is interesting, but it compresses the problem too early.

BSCCM does include cell-type structure through fluorescence-derived protein patterns, but classification would throw away most of what makes the dataset valuable for dense prediction. It would turn a rich paired imaging problem into a label-prediction problem before learning whether the model can reproduce the assay channel itself.[^bsccm] It also makes debugging harder. A wrong class label tells you much less about what failed than a wrong fluorescence map does.

Histology is more subtle. It is an important modality in BSCCM, but it is not the cleanest first target. The paper makes clear that matched histology is available only for a subset, and that it is collected afterward, after the chamber is disassembled, the cells are Wright-stained, remounted, and imaged again with a different optical setup and a higher-NA objective.[^bsccm] That makes histology valuable, but also more complicated as a first image-to-image target.

It is worth saying briefly why histology is so useful in the first place. Wright-style blood staining helps human readers identify white blood cell morphology because it makes structures like the nucleus, cytoplasmic character, and some granules easier to see. In Wright-Giemsa staining, acid cell components such as the nucleus, cytoplasmic RNA, and basophilic granules stain blue or purple, while basic components such as hemoglobin and eosinophilic granules stain red or orange.[^wright] That is one reason stained blood-smear review remains such a strong human reference view for WBC typing. But in BSCCM it is still a later, subset-only, different-optics measurement, which is why it did not come first.

Fluorescence stays closer to the immediate same-cell assay story. That is why it came first.

## Why the stain condition had to be part of the task

Once fluorescence became the target, the next question was whether single-antibody and all-antibody data should be treated as separate tasks or as one conditional task.

The right answer, at least for the first benchmark formulation, was to make the assay condition explicit.

Without conditioning, the model would be asked a confused question. The fluorescence output is not determined by morphology alone. It also depends on which staining protocol was applied. BSCCM itself is organized around these assay regimes, and the metadata includes which antibody condition each cell belongs to.[^bsccm][^dryad] So instead of pretending the target distribution is one uniform pool, the model should be told which stain condition generated the measurement.

That does not magically remove target noise or assay imperfections. It does something more important: it makes the question well posed. The model becomes a conditional virtual fluorescence system. Given this cell under these label-free observations and under this staining setup, what fluorescence response should the microscope produce?

That is a much clearer first problem than pooling incompatible supervision and hoping the network sorts it out.

## What this task does and does not claim

One of the reasons I like this formulation is that it forces the project to stay grounded in reviewable evidence. A dense fluorescence prediction can be inspected channel by channel, cell by cell, and failure mode by failure mode. That matters because my broader interest is not only in making a model work once. It is in learning how to build reliable dense-prediction systems whose behavior remains inspectable as the benchmark grows.

At the same time, it is important to say what this task is **not**. It is not a full solution to phenotyping. It is not a proof that label-free microscopy has replaced staining. It does not erase the assay imperfections documented in the paper. BSCCM itself is candid about batch effects, unmixing complexity, and the difference between direct fluorescence measurements and downstream semantic quantities derived from them.[^bsccm][^dryad]

That is exactly why this first task matters. It is a disciplined stepping stone, not a grand claim. It narrows the project to a question that is meaningful, paired, dense, and inspectable enough to support serious learning.

So the short answer is simple.

I chose 23→6 first because it is the first BSCCM task that is simultaneously dense enough to matter for image-to-image modeling, close enough to measured data to stay interpretable, biological enough to be more than a toy reconstruction problem, structured enough to benefit from conditional modeling, and honest enough to serve as a foundation for later, harder tasks.

Not the most ambitious-looking question in the benchmark. The first one I can defend.

## References

[^bsccm]: Pinkard, H. et al. “The Berkeley Single Cell Computational Microscopy (BSCCM) Dataset.” arXiv (2024). [https://arxiv.org/abs/2402.06191](https://arxiv.org/abs/2402.06191)

[^bsccm-site]: Waller Lab. “The Berkeley Single Cell Computational Microscopy (BSCCM) Dataset.” [https://waller-lab.github.io/BSCCM/](https://waller-lab.github.io/BSCCM/)

[^dryad]: Pinkard, H.; Waller, L. “Berkeley Single-Cell Computational Microscopy (BSCCM) dataset.” Dryad (2025 update). [https://doi.org/10.5061/dryad.sxksn038s](https://doi.org/10.5061/dryad.sxksn038s)

[^wright]: Merck Manual Professional Edition. “Wright-Giemsa Stain of Peripheral Blood Smear.” [https://www.merckmanuals.com/professional/multimedia/image/wright-giemsa-stain-of-peripheral-blood-smear](https://www.merckmanuals.com/professional/multimedia/image/wright-giemsa-stain-of-peripheral-blood-smear)
