---
title: "The limits of microscopy benchmarks"
slug: "the-limits-of-microscopy-benchmarks"
summary: "Microscopy already has real benchmarks, and some remain open today. The harder problem is that leaderboard rank often reflects a submitted pipeline under a narrow benchmark contract, while practitioners need evidence they can trust when choosing methods for real data."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "research"
series: "Microscopy Research"
listed: true
in_draft: false
tags:
  - Microscopy
  - Benchmarking
  - Domain Shift
  - Evaluation
sortOrder: 2
relatedProjects:
  - microscopy-benchmark-pipeline
---

At first glance, microscopy benchmarking seems straightforward. A challenge organizer defines the task, releases training data, hides the test labels, fixes the official metric, and ranks submissions. If that machinery is working, then a practical conclusion should follow: for this task, this family of methods is reliably strong, and this is where a sensible practitioner would start. That is the common-sense promise of a leaderboard.

Microscopy is not missing benchmark infrastructure. The field already has mature challenge ecosystems, and some are still active today.[^ctcsubmit][^cellseg-gc] The Cell Tracking Challenge has been running for more than a decade and remains one of the clearest public benchmark infrastructures for cell segmentation and tracking.[^ctcpaper] The Multi-modality Cell Segmentation Challenge was explicitly designed to benchmark cell segmentation across a much broader range of microscopy conditions, using more than 1,500 labeled images from more than 50 biological experiments.[^cellsegpaper] More recent resources such as CellBinDB are also trying to widen the benchmark surface rather than keep evaluating methods on tiny, narrow slices forever.[^cellbindb]

So the problem is not that microscopy has no leaderboards. The problem is that leaderboard success does not automatically become trustworthy method choice. A benchmark can be real, serious, and well run, yet still answer a narrower question than practitioners want it to answer.

That narrower question is the key one: when a microscopy leaderboard says a method is first, what exactly has come first?å

## What many microscopy leaderboards rank is a submitted pipeline, not architecture in isolation

In several major microscopy benchmarks, first place does not simply mean “best architecture.” It more often means the strongest submitted system under the challenge rules. The Cell Tracking Challenge distinguishes between regular benchmarking and more constrained generalizable benchmarking precisely because those are not the same question.[^ctcsubmit][^ctcpaper] The Multi-modality Cell Segmentation Challenge is similar in spirit: external datasets and pre-trained models are allowed, and the published analysis of top teams reports substantial diversity in augmentation and post-processing strategies.[^cellsegpaper]

That does not make the result invalid. In some ways it makes it more realistic, because real users do care about whether a method can be trained effectively, whether it depends on stronger outside supervision, and whether substantial post-processing is needed to reach its final performance. But it does change what the rank can safely be said to mean.

Practitioners are rarely asking only who won a challenge. They are asking what to build, what to reproduce, what to trust, or what to adopt as a baseline. A pipeline win can inform that decision, but it does not cleanly reveal how much of the gain came from the architecture itself, how much came from extra data or pretraining, and how much came from the surrounding recipe. A leaderboard can therefore be genuinely useful and still fall short of being a clean method recommendation.

## Why the same ground truth is not always enough

A reasonable objection remains. Even if a benchmark is ranking a full submission pipeline rather than isolating architecture alone, everyone is still being trained and evaluated against the same reference labels. Should that not be enough to make the comparison fair, at least on the benchmark’s own terms?

It is enough to define a shared local target. What it does not guarantee is that the target affects every method in the same way, or that benchmark alignment cleanly maps to the best practical choice outside the benchmark.

In microscopy, that matters because the target is often less clean than it first appears. Boundaries may be faint, overlapping, truncated at the image edge, or dependent on subtle inclusion rules. Two models can both be reasonable in how they segment such cases, while one happens to align more closely with the particular annotation style encoded in the benchmark reference.

Consider two touching nuclei separated by a weak boundary. One annotation convention splits them whenever a plausible separation is visible. Another keeps them merged unless that separation is visually unambiguous. A model trained toward the first convention may learn aggressive splitting and score better on that benchmark. A more conservative model may be preferable for another lab’s images or downstream analysis. The leaderboard result is still real. What becomes weaker is the claim that the winner is therefore the more generally trustworthy method.

This is why the methodological criticism in biomedical image analysis is stronger than the generic complaint that labels are noisy. In their large analysis of 150 biomedical image analysis challenges, Maier-Hein and colleagues argue that algorithm rank is often not robust to changes in test data, ranking schemes, or observer variation.[^rankings] That is a much stronger claim than saying only that labels are imperfect. It means the benchmark setup itself can influence who appears to win.

There is another practical layer to this: a mask is not just a shape drawn on an image. It is also a frozen set of decisions about what counts as part of the object, how touching structures are separated, what to ignore, and how ambiguous cases are handled. A good benchmark does not only need images and masks. It also needs those decisions to be specified clearly enough that the reader understands what “correct” was supposed to mean.

That is why reporting labeling instructions matters so much. The 2023 paper *Labelling instructions matter in biomedical image analysis* showed that many biomedical image analysis competition tasks still did not report labeling instructions, despite existing reporting guidance.[^labeling] The issue here is not paperwork for its own sake. It is that part of the task definition may be missing from the public record.

And once that happens, the practical problem is obvious. A practitioner looking at a leaderboard does not only want to know which model matched these masks best. They also want to know what those masks were actually asking the model to do in difficult cases. Without that, a benchmark can look more fully specified than it really is. You still have an image, a target, and a metric, but some of the meaning of the task is hidden inside undocumented annotation judgment.

That is why the same ground truth is not always enough to settle the matter. The comparison may still be fair within the benchmark’s own rules, but fairness at that level is not the same as a strong practical recommendation. A model may be especially good at matching the annotation style encoded in the benchmark and still be less obviously preferable for a neighboring lab, a different protocol, or a downstream analysis that cares about slightly different boundary behavior.

## Hidden tests are necessary, but they do not make a result field-ready by themselves

Another instinctive reply is that hidden test sets should solve most of this. If participants cannot see the final labels, then at least the comparison is honest.

And yes, hidden tests matter. They reduce direct leakage and prevent the worst form of tuning to the answer key. The Multi-modality Cell Segmentation Challenge used a hidden holdout test set and standardized evaluation through one platform precisely to make the final comparison fairer.[^cellsegpaper] That is good benchmark design.

But a hidden test set does not automatically create the kind of evidence practitioners actually need. It shows that a method generalized to *this* held-out slice of the benchmark under *this* evaluation protocol. It does not guarantee that the held-out slice captures the variability that matters to your lab, your tissue, your microscope, your staining protocol, your failure tolerance, or your downstream use. Nor does it neutralize the effect of broad training freedom if the challenge allows extra data, strong pretraining, or challenge-specific tuning.

A protected exam is not the same thing as a field-ready recommendation.

The Cell Tracking Challenge authors state this limitation in unusually direct terms. In their 2023 update, they note that many deep learning methods still do not transfer well to dataset types different from those used for training.[^ctcpaper] The important point is that “different type” here means more than unseen test images from the same benchmark. It refers to a genuinely different microscopy regime: different cell morphologies, imaging modalities, acquisition conditions, or biological settings. That is what makes the sentence worth keeping. It names the practical gap clearly: benchmark success often still does not eliminate the need for retraining or local validation when the method is moved to a new dataset type.

This is where the benchmark problem stops being an abstract critique of evaluation design and becomes a field problem. If experts still have to say, *this method looks strong, but you should expect to retrain it on your own data*, then the benchmark has not fully become the practical decision surface people hoped it would be. It is still useful. It is just not enough on its own.

## What the field is learning

The encouraging part is that the literature has started moving in the right direction. The response has not been to abandon benchmarking. It has been to make benchmark design more explicit, more interpretable, and more honest about what a result can mean.

Some of that response is visible inside the benchmarks themselves. The Cell Tracking Challenge introduced more constrained generalizability-oriented evaluation rather than pretending all leaderboard wins mean the same thing.[^ctcpaper] The Multi-modality Cell Segmentation Challenge widened the test surface and standardized evaluation through one platform.[^cellsegpaper] Resources such as CellBinDB are trying to expand diversity and take generalization more seriously at the dataset level.[^cellbindb]

Some of the response is methodological. The challenge-analysis literature pushed the field to interpret rankings more carefully.[^rankings] The labeling-instructions work exposed how much of task definition can disappear from the public record.[^labeling] Metrics Reloaded argues for more problem-aware metric selection and validation doctrine in biomedical image analysis.[^metricsreloaded]

That, to me, is the cleanest way to understand the current state of microscopy benchmarking. The field does not merely want scores. It wants scores that survive contact with practical choice.

That is the limit of microscopy benchmarks. Not that the field cannot produce leaderboards, and not that narrow benchmarks are pointless, but that the question practitioners need answered is more demanding than simple ranking. They do not only want to know who won. They want to know what they should trust when the data, labels, protocols, and downstream stakes are real.

## A few open benchmarks worth knowing about

The existence of active benchmark pages today makes the point sharper, not weaker. The Cell Tracking Challenge is still accepting registered submissions for both tracking and segmentation benchmarks, and it evaluates new submissions on a monthly cycle.[^ctcsubmit] The Cell Segmentation in Multi-modality Microscopy Images benchmark also remains visible on Grand Challenge through a testing submission path, which means it still functions as a live comparison surface rather than only a closed historical event.[^cellseg-gc]

Outside segmentation and tracking, open benchmark activity continues in adjacent microscopy computer vision tasks as well. The AI4Life Microscopy Denoising Challenge 2024 now describes the main competition as over, but it still directs users to late submission, so it remains usable as a benchmarking lane.[^mdc24] The AI4Life Calcium Imaging Denoising Challenge 2025 is described by the organizers as still running, and their results post says the platform remains accessible and late submissions are welcome for benchmarking purposes.[^cidc25][^cidc25-results]

## References

[^ctcsubmit]: Cell Tracking Challenge. “Submission of Results.” https://celltrackingchallenge.net/submission-of-results/
[^ctcpaper]: Maška, M. et al. “The Cell Tracking Challenge: 10 years of objective benchmarking.” *Nature Methods* (2023). https://pmc.ncbi.nlm.nih.gov/articles/PMC10333123/
[^cellsegpaper]: Ma, J. et al. “The Multi-modality Cell Segmentation Challenge: Towards Universal Solutions.” *Nature Methods* (2024). https://pmc.ncbi.nlm.nih.gov/articles/PMC11210294/
[^cellseg-gc]: Grand Challenge. “Cell Segmentation in Multi-modality Microscopy Images.” https://neurips22-cellseg.grand-challenge.org/
[^cellbindb]: Shi, C. et al. “CellBinDB: a large-scale multimodal annotated dataset for cell segmentation with benchmarking of universal models.” *GigaScience* (2025). https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf069/8172484
[^rankings]: Maier-Hein, L. et al. “Why rankings of biomedical image analysis competitions should be interpreted with care.” *Nature Communications* (2018). https://www.nature.com/articles/s41467-018-07619-7
[^labeling]: Rädsch, T. et al. “Labelling instructions matter in biomedical image analysis.” *Nature Machine Intelligence* (2023). https://www.nature.com/articles/s42256-023-00625-5
[^metricsreloaded]: Reinke, A. et al. “Advancing standards in biomedical image analysis validation: A perspective on Metrics Reloaded.” *Communications Medicine* (2025). https://pmc.ncbi.nlm.nih.gov/articles/PMC12399785/
[^mdc24]: AI4Life. “AI4Life Microscopy Denoising Challenge 2024.” https://ai4life-mdc24.grand-challenge.org/
[^cidc25]: AI4Life. “AI4Life Calcium Imaging Denoising Challenge 2025.” https://ai4life-cidc25.grand-challenge.org/
[^cidc25-results]: AI4Life. “AI4Life Denoising Challenges 2025: Results.” https://ai4life.eurobioimaging.eu/ai4life-denoising-challenges-2025-results/
