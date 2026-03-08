---
title: "Microscopy segmentation is mature, but not solved"
slug: "microscopy-segmentation-is-mature-but-not-solved"
summary: "A literature-oriented view of why microscopy segmentation looks mature at the model level while portability, trust, and operational usability remain unresolved."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "research"
series: "Microscopy Research"
listed: true
in_draft: false
tags:
  - Microscopy
  - Segmentation
  - Literature Review
sortOrder: 20
relatedProjects:
  - microscopy-benchmark-pipeline
---

Segmentation is one of the most mature technical areas in biomedical image analysis. The field has strong benchmark culture, widely adopted architectural templates, and several systems that make a credible case for broad transfer across datasets and tasks. But that visible maturity creates a useful tension. If segmentation were functionally solved in microscopy, recent papers would not still be opening from the claim that accurate segmentation remains a bottleneck, nor would they still be building new systems around tracking, correction, retraining, multidimensional workflows, and broader cross-domain generalization.[^musam][^cellsam]

Many different segmentation problems in Microscopy clearly has a shared computational core and a shared broad solution family. Cellpose and nnU-Net are strong evidence for that side of the story. But the field is still not operationally solved, because making good segmentation travel reliably across modalities, morphologies, acquisition conditions, dimensional settings, and downstream biological workflows remains incomplete.[^cellpose][^nnunet][^multimod]

The interesting question is no longer whether the community knows how to produce masks in principle. It is whether strong segmentation can be made portable, trustworthy, and low-burden enough that it behaves like dependable infrastructure rather than a recurring experimental problem.[^musam][^rembi][^rankings]

## Strong methods exist, but the hard work has not disappeared

A useful place to start is not taxonomy, but field outcome. Recent microscopy work still introduces segmentation as a live practical bottleneck despite the number of available tools. μSAM is explicit about this: accurate segmentation of microscopy images remains a bottleneck for many researchers, and the system is presented not as a narrow benchmark model but as a tool for segmentation and tracking in multidimensional microscopy data.[^musam]

That framing is important because it shifts attention away from architecture novelty alone. The remaining burden is not just whether a model can draw masks on a favorable dataset. It is whether a workflow remains usable across different experiments without repeated manual adaptation. The multimodality cell segmentation challenge states this directly: existing methods are often tailored to specific modalities or require manual intervention to specify hyperparameters in different experimental settings.[^multimod]

Taken together, those papers support a more precise interpretation of the current field state. Biomedical and microscopy imaging are not waiting for the first good segmentation model to arrive. The field already has capable models. What remains unresolved is whether those models can be depended on across real microscopy conditions with low enough setup burden and strong enough evidence that users can treat the result as trustworthy.[^musam][^multimod]

## Why the same broad recipe keeps working?

It is worth conceding the obvious point directly: a large share of biomedical and microscopy segmentation really is “the same problem” in an important computational sense. Across many tasks, the model still has to resolve boundaries, separate adjacent structures, integrate local texture with wider spatial context, and make dense predictions over structured images. The literature does not look like a field that forgot this common core. It looks like a field that has found it, reused it, and pushed it a long way.[^cellpose][^nnunet]

Cellpose is one of the clearest pieces of evidence. Its contribution is not just high performance on one benchmark. The paper argues for a generalist segmentation method that can precisely segment cells across a wide range of image types without retraining or parameter adjustment. That is a strong signal that many microscopy segmentation settings share a real reusable engine rather than requiring a fully different solution for every case.[^cellpose]

nnU-Net makes the systems-level point even more strongly. It shows that the field does not only have a successful network family; it has a successful self-configuring pipeline. nnU-Net automatically configures preprocessing, architecture, training, and post-processing for new tasks, which means a large part of what once felt like expert customization can be systematized and transferred.[^nnunet]

That concession makes the unresolved part of the story more interesting, not less. If Cellpose and nnU-Net had failed broadly, the explanation would be simple: segmentation would still just be a weak technical capability. But that is not what the literature shows. The field has a strong shared recipe. The harder question is why that recipe still does not fully collapse the surrounding work in microscopy practice.[^cellpose][^nnunet]

## Where the common recipe stops being enough?

The right word here is portability, but the term is only useful if it is kept concrete. In this literature, portability means at least four things: transfer across modalities and experimental settings, robustness in hard image regimes, extension into multidimensional and tracking workflows, and a tolerable burden of setup, correction, or adaptation when conditions change.[^livecell][^multimod][^musam][^cellsam][^usegment3d]

LIVECell helps pin down the “hard image regimes” part of the problem. It focuses on label-free live-cell instance segmentation in phase-contrast imaging and introduces a large, manually annotated, expert-validated dataset with more than 1.6 million cells. The paper is useful here not because it disproves progress, but because it shows that an important practical regime still required major dataset and benchmark construction simply to make progress visible and measurable.[^livecell]

The multimodality challenge captures a different break point. A method can be strong and still remain too tied to particular modalities or too dependent on manual hyperparameter changes when imaging conditions shift. That is exactly the kind of result that explains why a field can have a shared solution family and still not feel operationally solved. “Same broad method” is not the same thing as “solved operating problem.”[^multimod]

μSAM pushes the point further by making workflow complexity visible. Once microscopy moves beyond static 2D mask production into segmentation plus tracking, interactive correction, and retraining, the practical problem is larger than architecture choice alone. The need for a loop that includes automatic segmentation, user correction, and updated model behavior is itself evidence that the remaining difficulty is operational, not merely algorithmic.[^musam]

CellSAM marks the frontier more explicitly. The paper frames a major challenge with existing methods as their inability to generalize across cellular targets, imaging modalities, and cell morphologies. That is exactly the portability pressure this post is trying to describe. The significance of CellSAM is not just that it is a newer model. It is that the paper itself positions broad cross-domain generalization as a still-open target.[^cellsam]

The dimensional setting matters too. Universal consensus 3D segmentation of cells from 2D segmented stacks is especially useful because it says the quiet part out loud: deep learning has substantially advanced 2D cell segmentation, but 3D segmentation still poses substantial challenges, and manual labeling of 3D cells for broadly applicable models is prohibitive, ambiguous, and time-consuming. That is a clean example of dimensional lift reopening the problem even after major 2D progress.[^usegment3d]

So the unresolved part of segmentation is not the abstract ability to produce masks. It is the ability to maintain stable, low-burden, biologically usable performance across the regimes that matter in practice: different modalities, different morphologies, hard imaging conditions, multidimensional workflows, and 3D settings where annotation itself becomes a bottleneck again.[^livecell][^multimod][^musam][^cellsam][^usegment3d]

## Why the breakage is often hard to see clearly?

Once the central field problem becomes portability and reliability rather than first-pass segmentation capability, the evidence layer matters much more. A model can look strong or weak for reasons that are partly hidden in annotation procedure, metadata coverage, and evaluation design. In other words, some of the remaining difficulty is epistemic: even judging whether a method really worked can be fragile.[^labeling][^rembi]

The labeling-instructions paper is important here because it shows that annotation quality is not merely a property of annotator effort. Labeling instructions themselves measurably affect annotation quality. That matters for segmentation benchmarks because the reference masks are not neutral objects floating above the workflow; they are produced through instructions, examples, and conventions. If those move, then some apparent model gains or failures may partly reflect the reference process rather than the model alone.[^labeling]

REMBI makes a related point from the metadata side. The paper argues that unlocking the reuse potential of bioimaging data requires systematic archiving of data and metadata. In microscopy, image meaning is entangled with acquisition conditions, specimen context, and other experimental details. When that layer is thin or inconsistent, it becomes much harder to diagnose why a method failed to transfer.[^rembi]

This is one reason the field can feel less settled in practice than a leaderboard-heavy literature suggests. The problem is not only that methods fail in some settings. It is also that, when they fail, the surrounding evidence is often not strong enough to explain why. For example, a model may look worse because annotators were given different instructions, because important imaging metadata was missing, or because the evaluation setup changed in a way that made the comparison less clean. In those cases, it becomes harder to tell whether we are seeing a true limitation of the method or a weakness in the evidence around it.[^labeling][^rembi]

## Why benchmark scores can make the field look more solved than it is?

None of this means benchmarks are useless. Quite the opposite: challenge datasets and shared evaluation are part of why segmentation matured so quickly. But benchmark abundance is not the same thing as operating closure. A field can have many leaderboards and still remain uncertain about how stable or transferable those rankings really are.[^rankings][^metrics]

The challenge-rankings paper makes this point sharply. It shows that rankings in biomedical image-analysis competitions are often not robust to variables such as the test data used, the ranking scheme applied, and the observers generating the reference annotations. That does not make benchmarks meaningless. It makes them conditional evidence, which is a very different thing from final truth.[^rankings]

The metric-misinterpretations paper tightens the argument further. Common segmentation scores are often misinterpreted, and multiple definitions can coexist under the same name. The paper shows that these ambiguities can alter the leaderboards of influential competitions. So even when the surface of the literature looks orderly, the semantic layer underneath evaluation can still be unstable.[^metrics]

The practical conclusion is straightforward. A good benchmark score is real evidence, but it is not identical to solved portability, solved reliability, or solved downstream usability. In a mature field, the question is not whether metrics matter. It is whether they are precise enough, stable enough, and well-matched enough to the operating problem to support strong conclusions.[^rankings][^metrics]

## Model families as responses to the unresolved problem

This changes how architectural history should be read. The useful question is not simply “what came after U-Net?” The better question is: what unresolved constraint was each method family trying to reduce? Reading that way makes the literature becomes less like a parade of unrelated models and more like a sequence of responses to recurring operational gaps.[^nnunet][^cellpose][^musam][^cellsam]

nnU-Net is best understood as a response to setup burden and hidden pipeline expertise. Its importance lies in reducing the amount of bespoke design required to stand up a strong segmentation system on a new task. The issue being addressed is not whether segmentation exists at all, but whether a strong baseline can be reproduced without excessive manual configuration.[^nnunet]

Cellpose is best understood as a response to narrow specialization. Its contribution is a generalist 2D segmentation system that reduces dependence on task-specific retraining or manual adjustment across many cellular image types. The pressure it addresses is portability across common microscopy settings.[^cellpose]

μSAM and CellSAM belong to the next wave of the same story. Their importance is not that the field forgot how to segment and had to reinvent the core task from scratch. Their importance is that the field is still trying to reduce cross-domain fragility, workflow burden, and the amount of user effort needed to make segmentation useful across real microscopy scenarios.[^musam][^cellsam]

Architecture evolution in this literature is therefore best read as repeated attempts to shrink the remaining operational gap. The core recipe is strong. Newer model families matter because the field is still trying to make that recipe travel farther, with less setup, less manual correction, and more reliable usability across biological contexts.[^nnunet][^cellpose][^musam][^cellsam]

## Why downstream work still does not disappear?

This is where the practical intuition becomes clearest. Even when a model is good enough to generate plausible masks, downstream work does not vanish. Labs still need assay-aware setup, quality control, correction, exception handling, and judgment about whether a segmentation is biologically usable for counting, morphology analysis, tracking, or other follow-on tasks. That claim is partly an inference, but it is a grounded one: it is supported by the kinds of tools, metadata standards, and challenge designs the field continues to build.[^musam][^rembi][^multimod]

That should not be read as a sign that the models are weak. It is better understood as a sign that segmentation has become infrastructural. Infrastructure has to survive real variation. It has to be diagnosable when it fails. It has to fit into larger workflows without silently distorting the biological question. That is why tool support, metadata standards, benchmark doctrine, and correction workflows persist alongside strong models.[^musam][^rembi][^rankings]

So when the field continues to produce new generalist models, new metadata standards, new challenge analyses, and new human-in-the-loop workflow tools, that should not be read as evidence that segmentation progress was fake. It should be read as evidence that the unresolved problem is operational, not merely architectural.[^musam][^cellsam][^rankings]

## Lessons learned

This literature changes how I think about benchmarking work in microscopy. The goal is not to prove that segmentation can work somewhere under favorable conditions. The goal is to make it easier to tell whether performance is portable, whether the evidence is trustworthy, and whether the outputs are usable for the downstream biological question the benchmark is meant to support.[^cellpose][^nnunet][^musam][^rankings]

That implies a more explicit doctrine. One common segmentation core does not remove the need for disciplined split design, metadata policy, annotation awareness, saved qualitative evidence, and precise metric definitions. If portability is the real remaining challenge, then comparison has to be set up in a way that makes portability visible rather than hiding it behind aggregate score movement.[^labeling][^rembi][^rankings][^metrics]

That is the main lesson I take from the field right now: microscopy segmentation is not held back by the absence of capable models; it remains unresolved because making those models travel reliably across real imaging settings, with evidence strong enough to trust and outputs usable enough for downstream biology, is still an open problem.[^musam][^cellpose][^nnunet][^cellsam]

## References

[^musam]: Archit, A. et al. “Segment Anything for Microscopy.” *Nature Methods* (2025). https://www.nature.com/articles/s41592-024-02580-4
[^cellpose]: Stringer, C. et al. “Cellpose: a generalist algorithm for cellular segmentation.” *Nature Methods* (2021). https://www.nature.com/articles/s41592-020-01018-x
[^nnunet]: Isensee, F. et al. “nnU-Net: a self-configuring method for deep learning-based biomedical image segmentation.” *Nature Methods* (2021). https://www.nature.com/articles/s41592-020-01008-z
[^livecell]: Edlund, C. et al. “LIVECell—A large-scale dataset for label-free live cell segmentation.” *Nature Methods* (2021). https://www.nature.com/articles/s41592-021-01249-6
[^multimod]: Ma, J. et al. “The multimodality cell segmentation challenge.” *Nature Methods* (2024). https://pubmed.ncbi.nlm.nih.gov/38532015/
[^cellsam]: Marks, M. et al. “CellSAM: a foundation model for cell segmentation.” *Nature Methods* (2025). https://www.nature.com/articles/s41592-025-02879-w
[^usegment3d]: Zhou, F.Y. et al. “Universal consensus 3D segmentation of cells from 2D segmented stacks.” *Nature Methods* (2025). https://www.nature.com/articles/s41592-025-02887-w
[^labeling]: Rädsch, T. et al. “Labelling instructions matter in biomedical image analysis.” *Nature Machine Intelligence* (2023). https://www.nature.com/articles/s42256-023-00625-5
[^rembi]: Sarkans, U. et al. “REMBI: Recommended Metadata for Biological Images—enabling reuse of microscopy data in biology.” *Nature Methods* (2021). https://www.nature.com/articles/s41592-021-01166-8
[^rankings]: Maier-Hein, L. et al. “Why rankings of biomedical image analysis competitions should be interpreted with care.” *Nature Communications* (2018). https://www.nature.com/articles/s41467-018-07619-7
[^metrics]: Hirling, D. et al. “Segmentation metric misinterpretations in bioimage analysis.” *Nature Methods* (2024). https://www.nature.com/articles/s41592-023-01942-8
