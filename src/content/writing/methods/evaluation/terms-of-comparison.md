---
title: "Terms of Comparison: The Contract Behind Trustworthy Model Iteration"
slug: "terms-of-comparison"
summary: "A method for defining the comparison contract before optimization begins: split discipline, target definitions, metric interpretation, artifact review, and the checks that keep early results from becoming false confidence."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
in_draft: false
tags:
  - Evaluation
  - Model comparison
  - Data Splits
sortOrder: 2
relatedProjects:
  - microscopy-benchmark-pipeline
---

## Why this matters before the first result

The most misleading result in a project is often the first one that looks good.

Not because early experiments are inherently worthless, but because they are easy to over-interpret. A model appears to beat another model, the metric moves in the right direction, and the run feels like progress. Then later, often quietly, you realize the split policy changed, the target-generation rule changed, the ranking metric changed, or the saved evidence is too thin to tell whether the score movement reflects better behavior or just different judgment conditions.

At that point, the problem is not simply that the experiment was imperfect. The deeper problem is that the comparison may no longer be answering the same question from one run to the next. In empirical machine learning, that kind of drift is not a minor clerical issue. Leakage and related evaluation failures have been documented across many scientific fields, with Kapoor and Narayanan surveying 17 fields and 329 affected papers, and arguing that data leakage has led to severe reproducibility failures in ML-based science.[^kapoor] Herrmann and colleagues make a related point from a broader methodological angle: much empirical ML work is written as though it were a clean test of a fixed claim, even when the setup was still evolving and the result is better understood as exploratory evidence.[^herrmann]

Before architecture comparison means anything, the evaluation contract has to stop moving underneath the runs.

## The comparison contract

By *comparison contract*, I mean the set of benchmark conditions that must remain fixed before score differences can be interpreted as evidence about the model.

This is not a call to freeze a project forever. Benchmarks should change when you learn something important. But once a comparison is presented as evidence that model B is better than model A, the reader should be able to trust that the underlying terms of judgment stayed stable enough for that statement to mean what it appears to mean.

In practice, I want five parts of the benchmark frozen before serious optimization begins:

- split logic and sampling policy
- target definition and preprocessing assumptions
- metric surface and ranking rule
- required saved artifacts for direct inspection
- run review criteria that decide whether a run counts as evidence

Those choices are not ornamental. They define what counts as new data, what the task means, what success means, what evidence must be visible, and what bar a run must clear before it becomes a legitimate comparison point. Documentation frameworks like *Datasheets for Datasets* and *Model Cards* exist for exactly this reason: assumptions about data, intended use, evaluation conditions, and performance are too important to remain implicit.[^datasheets] Reproducibility checklists make the same idea more operational by explicitly asking for train/validation/test split details, preprocessing steps, excluded data, annotator instructions, and evaluation setup.[^checklist]

## Split discipline: split logic is benchmark logic

A split is not just a partition of rows. It is a claim about what counts as genuinely unseen.

When we choose a split, we are making a statement about independence and about the generalization question we care about. In a dense-prediction setting, image-level randomization asks a different question than plate-level, well-level, patient-level, site-level, or time-blocked splitting. The split tells the model what kinds of familiarity are permitted and what kinds of novelty count as a real test.

That is why split logic belongs to the benchmark definition rather than hiding inside the data loader. Leakage is dangerous precisely because it lets familiarity cross the train-test boundary while preserving the outward appearance of independence. Kapoor and Narayanan show that leakage is not a niche problem but a widespread source of invalid conclusions in ML-based science.[^kapoor] Rosenblatt et al. provide a useful concrete example: in connectome-based prediction, leakage via feature selection and repeated subjects drastically inflated apparent performance, and the effect was worse in smaller datasets.[^rosenblatt]

For model comparison, the consequence is simple. If split logic changes casually between runs, every later comparison inherits ambiguity about what the model actually saw and what it was being asked to generalize to. A changed split is not automatically a cleaner estimate of the same benchmark. Very often it is a different generalization question.

This matters especially in microscopy-style workflows, where naive randomization can accidentally put highly related examples on both sides of the partition: neighboring crops from the same field of view, samples from the same plate, acquisitions from the same batch, or temporally adjacent observations that share nuisance structure. If one run uses image-level randomization and another uses plate-aware grouping, the score difference cannot be read as a pure model win. The benchmark itself moved.

The operational rule I want is therefore strict: define the true unit of independence before optimization, freeze the grouping keys, save the split manifest, and keep any split-sensitive transforms inside the training-only path. If split logic changes, the benchmark version changes.

## Target definition: labels are part of the benchmark

The target is not a natural constant sitting inside the dataset. It is a protocol.

Even when the raw images are fixed, the task can still move, because supervised learning is defined not by the inputs alone but by the targets the model is asked to match. In an image-to-image benchmark, those targets are never just “there”; they come from a policy. That policy includes how annotations or output images were created, how ambiguous cases were resolved, what preprocessing was applied, whether weak structures were clipped, smoothed, normalized, or thresholded, which cases were included or excluded, and what conventions determined the boundary between signal and background. Together, those decisions define what counts as a correct prediction. If they change, then the task changes with them. A model is no longer being judged against the same benchmark, even if the input images are identical, because the meaning of the target has shifted underneath the comparison.

That is why target definition belongs inside the comparison contract. Rädsch et al. show that labelling instructions materially affect annotation quality in biomedical image analysis, and that poor or missing instruction quality is not some theoretical concern. In their analysis of recent MICCAI competition tasks matching the inclusion criteria, 76% did not report any labelling instructions.[^radsch] That number is especially striking because competitions are supposed to represent some of the field's cleaner validation setups.

For dense prediction, label policy can move in surprisingly quiet ways. Are faint structures counted as foreground or ignored as noise? Are touching cells merged or separated? Are border objects included? Is dim fluorescence clipped, smoothed, or preserved? Those are not secondary details. They shape what success means. If they change between runs, then the model is no longer being judged against the same task definition.

In segmentation, a model may appear to improve simply because its masks match a revised annotation style more closely. For example, if the benchmark changes how faint boundaries are traced, whether touching cells are split or merged, or whether border objects are included, then a higher score may reflect better agreement with the new labeling convention rather than a deeper improvement in how the model understands cell structure. The same issue appears in image-to-image prediction. If target-generation preprocessing starts clipping weak fluorescence, smoothing noisy regions, or excluding low-signal cases that were previously part of the task, then some of the original difficulty has been removed from the benchmark itself. A later model may score higher, but that does not automatically mean it learned more; it may simply be solving an easier or differently defined task. In both cases the number goes up, but what that number is measuring has shifted underneath the comparison.

So the rule here is the same as for splits: write the target specification, make ambiguous-case handling explicit, preserve annotation guidance as an artifact, and treat changes in target-generation logic as benchmark changes rather than model wins.

## Metric surface: what moves the score is not always what improves the task

A metric is not a neutral mirror of quality. It is a compression rule.

Metrics collapse rich behavior into a number, which means every metric sees some failures clearly and hides others almost by design. That is why “keep the metric fixed” is only the beginning. The more important question is whether the metric surface is actually aligned with the task and whether the reader understands what the chosen metric is allowed to miss.

*Metrics Reloaded* is useful here because it treats metric choice as a structured design problem rather than a habit. The framework recommends selecting metrics through a problem fingerprint, mapping the validation setup to the relevant problem category and task characteristics before choosing a suitable pool of metrics.[^metricsreloaded] Reinke et al. make the danger even more explicit: if performance is not measured according to relevant validation metrics, then no reliable statement can be made about the suitability of the algorithm, and unsuitable methods can be wrongly regarded as best-performing ones.[^reinke]

That warning matters because rankings can change with metric choice, aggregation policy, and evaluation design. Maier-Hein et al. show that in biomedical image analysis challenges, algorithm rank is sensitive to design choices including the test sets used, the annotators who generated the reference data, the selected metrics, and the way values are aggregated.[^maierhein]

For dense prediction, these are familiar pathologies. A region-overlap metric can look stable while boundaries worsen. A global average can hide collapse on rare structures. A micro-style summary can wash out behavior that a macro-style summary would expose. Dice may tell one story, boundary-sensitive evaluation another, object-level accounting a third. None of those metrics is automatically wrong. The problem starts when the benchmark treats them as interchangeable or lets the ranking rule drift after optimization has already begun.

My preference is to define the metric surface explicitly: name the primary metric, state what it is intended to capture, add supporting diagnostics for failure modes the primary metric can hide, and fix the aggregation rule before tuning starts. If the official ranking metric changes, the benchmark changed.

## Artifacts and slice review: scalar scores are not enough

A scalar score can be correct and still be dangerously incomplete.

Aggregate held-out performance often carries more authority than it deserves. Oakden-Rayner et al. show why: hidden stratification can produce relative performance differences of more than 20% on clinically important subsets even when overall performance appears acceptable.[^oakden] A model can therefore look strong in the aggregate while failing badly on the cases that matter most.

This is exactly why I do not want metrics alone. I want saved evidence.

In dense prediction work, saved outputs are part of the evidence because the metric alone cannot show how the score was earned. Imagine two segmentation runs where the second model scores slightly higher overall. On paper, that looks like progress. But when you inspect the predictions, the story may be different. The new model may trace the large, bright cell bodies more cleanly, which improves the aggregate score, while at the same time erasing faint protrusions, merging touching cells, or dropping small structures that matter scientifically. In an image-to-image setting, a model may improve its average error mostly on easy high-signal regions while still failing on dim, noisy, or rare cases that were the real challenge of the task. The scalar reports the net effect, but it hides where the improvement came from and what tradeoff produced it. Saved predictions make that tradeoff visible. They let you see whether the model became broadly better, or whether it simply improved on the regions the metric rewards most while getting worse elsewhere. Without that inspection, it is too easy to mistake a favorable number for a well-understood improvement.

This is also where model reporting frameworks point in the right direction. *Model Cards* argue for reporting benchmarked evaluation in a variety of relevant conditions and documenting the context in which performance was measured, rather than offering one naked aggregate score as if it were universally self-explanatory.[^modelcards]

For a dense-prediction benchmark, the artifact bundle should therefore be explicit: fixed review cases, representative predictions, failure slices, side-by-side outputs for the same samples across runs, and enough metadata to trace each artifact back to the exact benchmark and run version. A score without that evidence bundle is incomplete.

## Run review: a completed training job is not yet a comparison point

A finished run is not automatically a trustworthy result.

This distinction matters because ML workflows make it easy to confuse completion with evidence. The run ended, the logs exist, the metric improved, and the temptation is to drop the number straight into a comparison table. But if the point of the benchmark is to support interpretable model iteration, then the final step of training is not celebration. It is review.

Pineau et al. describe reproducibility as a matter of improving how machine learning research is conducted, communicated, and evaluated.[^pineau] That framing is helpful because it shifts attention away from the fantasy that a single scalar can carry the entire burden of trust. The NeurIPS reproducibility checklist makes the same idea concrete by asking for the details that determine whether a result can actually be interpreted: split definitions, preprocessing, excluded data, annotation instructions, evaluation setup, hyperparameter search, and code-related artifacts.[^checklist]

By run review, I mean a brief but disciplined pass to confirm that the run respected the comparison contract. Did the run use the frozen split manifest? Did target generation match the benchmark version? Did it keep the promised metric surface? Are the required artifacts present? Do the outputs look plausible on the fixed review cases? If any of those answers is no, the run may still be useful, but it should lose the status of comparison-grade evidence. A contract-violating run can still teach you something exploratory. What it should not do is sit in the same ranking table as runs that actually respected the frozen terms of comparison.

## What this prevents: model change versus benchmark change

The most important distinction in the whole method is this one: model change versus benchmark change.

Some changes belong to ordinary iteration within a stable benchmark: architecture, decoder design, loss weighting, optimizer schedules, augmentation, and regularization. These choices may produce better or worse models, but they still operate inside the same evaluation question. 

Other changes move the benchmark itself. A new split policy, a different grouping rule, revised target-generation logic, a new official metric or aggregation method, updated annotation guidance, or new artifact requirements can all change how performance is defined and judged. Those are not just model iterations. They change the evaluation contract, which means later score differences can no longer be read in exactly the same way.

This distinction matters because once model change and benchmark change are mixed together, later score movement becomes hard to interpret. A benchmark version is supposed to hold the terms of judgment steady long enough that improvement can be attributed, however imperfectly, to model-side decisions. If the judgment surface itself keeps drifting, the project starts optimizing against setup movement and mistaking that for learning.

The literature on challenges and validation design makes that concern hard to dismiss as personal preference. Maier-Hein et al. show that in biomedical image analysis, reproduction, adequate interpretation, and cross-comparison are not possible in the majority of challenges because only a fraction of relevant information is reported and challenge design is highly heterogeneous.[^maierhein] That is the large-scale version of the same problem.

The practical response is versioning discipline. When the comparison contract changes, the benchmark deserves a new name. Put the benchmark version in the run directory, in the plots, in the tables, and in the prose. That simple move prevents a large amount of false continuity.

## Reuse across projects

The exact checklist will vary by domain, but the principle transfers cleanly.

In microscopy and dense prediction, the examples may involve plate-aware splitting, annotation ambiguity, faint boundaries, object-level versus pixel-level evaluation, and fixed qualitative review panels. In another domain the details will differ. But the logic is the same: define what stays fixed early, make that definition visible, and treat any later change to those terms as a benchmark revision rather than a quiet model win.

That, to me, is the real purpose of the method. It is not rigidity for its own sake. It is a way to make iteration interpretable. Before I try to improve a model, I want the benchmark stable enough that a score change means what I think it means. Otherwise optimization can quietly attach itself to drift in the setup, and the project starts confusing benchmark movement with actual learning.

## Minimal comparison checklist

Before I start treating score differences as evidence, I want answers to these questions:

1. What is the true unit of independence for the split?
2. Where is the split manifest stored, and has it stayed fixed?
3. Where is the target specification written, including hard cases and exclusions?
4. Which preprocessing assumptions are part of target generation or evaluation?
5. What is the primary metric, and what failure modes can it hide?
6. Which secondary diagnostics are required to interpret the primary metric?
7. Which artifacts must be saved before a run can be reviewed?
8. What makes a run exploratory versus comparison-grade?
9. Which changes force a benchmark version bump?

If those answers are not written down, then the comparison contract is probably still too implicit to support strong conclusions.

## References

[^kapoor]: Sayash Kapoor and Arvind Narayanan, [*Leakage and the Reproducibility Crisis in ML-based Science*](https://arxiv.org/abs/2207.07048), 2022. The paper surveys 17 fields and 329 affected papers, presents a taxonomy of 8 leakage types, and argues that leakage has caused severe reproducibility failures in ML-based science.

[^herrmann]: Moritz Herrmann et al., [*Why We Must Rethink Empirical Research in Machine Learning*](https://arxiv.org/abs/2405.02200), 2024. The paper argues that much empirical ML research is framed as confirmatory even though it should often be treated as exploratory.

[^datasheets]: Timnit Gebru et al., [*Datasheets for Datasets*](https://arxiv.org/abs/1803.09010), 2018. The paper proposes dataset documentation covering motivation, composition, collection process, recommended uses, and related context.

[^checklist]: [*The Machine Learning Reproducibility Checklist (v2.0, Apr. 7 2020)*](https://www.cs.mcgill.ca/~jpineau/ReproducibilityChecklist.pdf). The checklist explicitly asks for dataset statistics, train/validation/test split details, excluded data, preprocessing, annotator instructions, methods for quality control, and evaluation details.

[^rosenblatt]: Matthew Rosenblatt et al., [*Data Leakage Inflates Prediction Performance in Connectome-based Machine Learning Models*](https://www.nature.com/articles/s41467-024-46150-w), *Nature Communications*, 2024. The study reports that leakage via feature selection and repeated subjects drastically inflates prediction performance, with stronger effects in smaller datasets.

[^radsch]: Tim Rädsch et al., [*Labelling Instructions Matter in Biomedical Image Analysis*](https://www.nature.com/articles/s42256-023-00625-5), *Nature Machine Intelligence*, 2023. The paper shows labelling instructions are key to annotation quality and reports that 76% of recent MICCAI competition tasks in the analyzed sample did not report any labelling instructions.

[^metricsreloaded]: Lena Maier-Hein et al., [*Metrics Reloaded: Recommendations for Image Analysis Validation*](https://pmc.ncbi.nlm.nih.gov/articles/PMC11182665/), *Nature Methods*, 2024. The framework recommends selecting validation metrics through problem fingerprinting and task characteristics rather than by habit.

[^reinke]: Annika Reinke et al., [*Understanding Metric-related Pitfalls in Image Analysis Validation*](https://pmc.ncbi.nlm.nih.gov/articles/PMC11181963/), *Nature Methods*, 2024. The paper argues that if performance is not measured according to relevant validation metrics, reliable statements about suitability cannot be made and unsuitable methods may be wrongly treated as best-performing.

[^maierhein]: Lena Maier-Hein et al., [*Why Rankings of Biomedical Image Analysis Competitions Should Be Interpreted with Care*](https://www.nature.com/articles/s41467-018-07619-7), *Nature Communications*, 2018. The paper shows that reproduction, adequate interpretation, and cross-comparison are often impossible because relevant information is underreported and challenge rankings are sensitive to design choices such as test sets, annotators, metrics, and aggregation.

[^oakden]: Luke Oakden-Rayner et al., [*Hidden Stratification Causes Clinically Meaningful Failures in Machine Learning for Medical Imaging*](https://pmc.ncbi.nlm.nih.gov/articles/PMC7665161/), *Proceedings of the ACM Conference on Health, Inference, and Learning*, 2020. The paper reports that hidden stratification can create relative performance differences of over 20% on clinically important subsets.

[^modelcards]: Margaret Mitchell et al., [*Model Cards for Model Reporting*](https://arxiv.org/abs/1810.03993), 2018. The paper recommends model documentation that includes intended use, evaluation context, and benchmarked performance across relevant conditions and groups.

[^pineau]: Joelle Pineau et al., [*Improving Reproducibility in Machine Learning Research (A Report from the NeurIPS 2019 Reproducibility Program)*](https://jmlr.org/papers/v22/20-303.html), *JMLR*, 2021. The paper describes a reproducibility program meant to improve standards for how ML research is conducted, communicated, and evaluated.
