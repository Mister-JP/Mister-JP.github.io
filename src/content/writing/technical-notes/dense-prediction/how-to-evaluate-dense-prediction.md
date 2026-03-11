---
title: "How to evaluate dense prediction"
slug: "how-to-evaluate-dense-prediction"
summary: "How dense-prediction metrics change the object being compared, and why region, boundary, topology, instance, perceptual, and uncertainty errors need different evaluation lenses."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Dense Prediction"
listed: true
in_draft: false
tags:
  - Dense Prediction
  - Metrics
  - Evaluation
sortOrder: 80
relatedProjects: []
---
Dense prediction is easy to describe and surprisingly hard to evaluate. A model receives an image and predicts an output at every location: a class label, a depth value, a flow vector, an RGB value, an uncertainty score, or something similar. That sounds like "classification at every pixel" or "regression at every pixel," but that description is too shallow. The deeper object is a field over space. If $\Omega$ is the image grid, then the model predicts a function

$$
\hat{y} : \Omega \to \mathcal{Y}.
$$

The important fact is not just that the model makes many predictions. It is that those predictions are spatially organized. Neighboring outputs belong to shapes, contours, objects, paths, textures, and scenes. That is why dense prediction cannot be evaluated well by thinking only in terms of independent pixels. A good evaluation has to ask how two structured spatial fields differ, and which kinds of difference matter for the actual task. This is the same broad principle emphasized by Metrics Reloaded: metric choice should follow the problem fingerprint, meaning the domain interest, target structure, output form, and failure modes that matter in practice.[^metrics-reloaded]

That single idea explains why dense-prediction evaluation so often goes wrong. A single metric usually sees only one aspect of correctness. Overlap metrics are good at region agreement but can miss boundary displacement. Pixelwise fidelity metrics can punish harmless intensity changes while under-emphasizing structural damage. Semantic metrics can look strong even when object identity is broken. Calibration can look fine even when the system is poor at anomaly detection. In other words, the main problem is not that the field lacks metrics. The problem is that different metrics are looking at different versions of the output.[^metrics-reloaded]

The most useful way to read any dense-prediction metric is to slow down and ask three questions.

- What object is being compared? Is the metric comparing full foreground regions, thin boundary bands, skeletons, instance sets, local image patches, deep features, or uncertainty rankings?
- What operation is it performing on that object? Is it taking an intersection and a union, averaging local errors, matching instances, comparing local statistics, or ranking pixels by uncertainty?
- Which failures does that operation reveal, and which does it hide?

Once those three questions are in place, the formulas stop looking arbitrary. They start looking like deliberate choices.

## The first layer: region agreement

Start with the most familiar case. Suppose the target is a binary segmentation mask. Let $G$ be the set of foreground pixels in the ground truth and $P$ the set of foreground pixels in the prediction. The standard Intersection over Union is

$$
\operatorname{IoU}(P, G) = \frac{|P \cap G|}{|P \cup G|}.
$$

Read the formula in words before interpreting it.

The numerator, $|P \cap G|$, is the number of pixels that both masks call foreground. The denominator, $|P \cup G|$, is the number of pixels that at least one of the masks calls foreground.

So IoU is simply

$$
\text{shared foreground} \,/\, \text{total claimed foreground}.
$$

That makes IoU a region-overlap metric. It does not directly ask whether the boundary is crisp, whether a thin bridge was preserved, or whether two objects were merged. It asks how much the foreground supports overlap as sets. That is exactly why IoU is useful and exactly why it is limited.[^boundary-iou]

A carefully chosen example makes this concrete. Imagine the ground truth is a $100 \times 100$ square, so it contains $10{,}000$ foreground pixels. Now imagine the prediction is the same square shifted one pixel to the right. Almost the whole square still overlaps, except for one missing strip on the left and one extra strip on the right. The overlap is

$$
|P \cap G| = 99 \times 100 = 9900,
$$

and the union is

$$
|P \cup G| = 10000 + 10000 - 9900 = 10100.
$$

So the IoU is

$$
\operatorname{IoU} = \frac{9900}{10100} \approx 0.9802.
$$

That score is very high, and it should be. As regions, the two masks are almost the same. The key teaching point is that IoU is not failing here. It is doing exactly what it was designed to do: reward large region agreement. The disagreement is only a thin strip compared with the full object area, so the interior dominates the count. If your question is "did the model select roughly the right region?", IoU answers it well. If your question is "did the model place the contour exactly where it belongs?", IoU is too forgiving. That is not a contradiction. It simply means the task has more than one notion of correctness.[^boundary-iou]

## When region agreement is not enough: boundary agreement

The square example becomes more interesting once we say clearly what is wrong with it. The region is almost right, but the contour is displaced. The entire left edge is one pixel off, and the entire right edge is one pixel off. If this were a cell membrane, a tumor border, a lane marking, or a drivable-area boundary, that geometric error could matter a great deal even though IoU stays above 0.98.

Boundary IoU changes the compared object before it changes the formula. Instead of comparing the full masks, it first extracts a narrow band around the contour of each mask and compares those bands. In effect, it says: ignore most of the easy interior; focus on the pixels that lie near the boundary. Cheng et al. introduced Boundary IoU precisely because Mask IoU is much less sensitive to boundary errors on large objects than one would want from a contour-aware evaluation. They also showed that Boundary IoU remains more balanced across scales than earlier boundary-focused alternatives.[^boundary-iou]

The most important moving part here is the distance parameter $d$, which controls the thickness of the boundary band. That parameter deserves real explanation because it tells you what the metric is actually tolerating.

If $d$ is large, the band becomes thick and starts swallowing much of the object interior. Then the metric behaves more like full-mask overlap.

If $d$ is small, the band hugs the contour tightly. Then even a small boundary displacement changes a large fraction of the evaluated region.

So $d$ is not just a technical implementation detail. It is a geometric tolerance knob. It tells the metric how much slack you allow around the contour before calling the prediction wrong. That is why Boundary IoU is better understood not as "another segmentation metric," but as a deliberate reweighting of attention from interior mass toward contour placement. Once that is clear, the pairing becomes natural: Mask IoU tells you whether the model found the right region; Boundary IoU tells you whether it drew that region in the right place.[^boundary-iou]

## Overlap is still not enough: topology and connectivity

Now consider a very different target: a vessel tree, a road network, an airway map, or a neuron tracing. These are not just foreground regions. They are connected path systems. A tiny break in the wrong place can destroy the output's usefulness even if the total overlap barely changes.

Let us slow down with the standard Dice score:

$$
\operatorname{Dice}(P, G) = \frac{2|P \cap G|}{|P| + |G|}.
$$

Again, the formula is just counting foreground mass. $|P|$ is predicted foreground volume. $|G|$ is true foreground volume. $|P \cap G|$ is overlapping foreground volume.

Dice is another overlap metric. It weights overlap a bit differently from IoU, but the essential object is still the same: the full set of foreground pixels. Every foreground pixel contributes as foreground mass. A pixel on a critical bridge does not receive special treatment merely because it is the only thing keeping two branches connected.[^metrics-reloaded]

Now imagine a vessel tree with two thick branches connected by a very thin bridge. Suppose the prediction misses only that bridge. The number of wrong pixels may be tiny, so Dice can still look excellent. But the topology has changed from one connected structure to two disconnected pieces. In a vascular application, that may be far more serious than losing a larger chunk inside an already-thick branch.

This is exactly the motivation for clDice. The paper's central move is not just to tweak the weights in an overlap formula. It changes the object being compared. Instead of letting thick interiors dominate the metric, it extracts the morphological skeleton of the structure. That skeleton is the centerline-like backbone that preserves the branching and connectivity pattern while removing most of the thickness. A wide tubular branch becomes a thin line through its middle. A branching vessel tree becomes a branching centerline tree. The paper explicitly argues that this shifts attention from equal weighting of every voxel toward the topology of the network.[^cldice]

That skeleton idea is the part many readers miss unless it is explained slowly. The point is not that the skeleton is magical. The point is that it is a way to compress a thick region into the part that matters most for connectivity. If a vessel is ten pixels wide, Dice lets those ten pixels dominate the count. Skeletonization removes that thickness and asks a sharper question: do the predicted paths still trace the true routes through the structure?

clDice then evaluates two directional containment relationships. One asks whether the skeleton of the prediction lies inside the ground-truth mask. The other asks whether the skeleton of the ground truth lies inside the predicted mask. Those two directions correspond to two distinct failure modes.

If the prediction invents spurious branches, the predicted skeleton will wander outside the ground-truth structure.

If the prediction misses a true bridge, the ground-truth skeleton will pass through a path that is not covered by the prediction.

The final clDice score combines these directional quantities with a harmonic-mean structure, analogous in spirit to how Dice combines precision-like and recall-like notions. The deep idea is simple: the metric stops asking only "how much foreground overlaps?" and starts asking "are the important connectivity routes of one structure supported by the other?" That is why clDice can punish a tiny broken bridge much more strongly than Dice. It has changed the compared object from foreground mass to connectivity backbone.[^cldice]

That example is worth internalizing because it teaches a general lesson. Some dense targets are really about area. Others are secretly about graphs. If your target is a graph-like structure disguised as a mask, then a purely volumetric metric is measuring the wrong thing very precisely.

## Semantic agreement is not object agreement

Dense prediction becomes richer again when the task is not just semantic segmentation but instance or panoptic segmentation. Suppose two pedestrians stand next to each other. The model labels every pedestrian pixel as "person," but merges both people into one connected blob.

From a pure semantic perspective, that can look very good. Every pixel still has the right class. A class-based overlap metric may remain high.

But from an instance-aware perspective, the scene understanding is wrong. There are two people, not one. The output has lost object identity.

This is where Panoptic Quality, or PQ, becomes useful. The panoptic-segmentation paper was motivated by exactly the gap between "what class is at each pixel?" and "what coherent set of thing and stuff segments explains the whole scene?" Instead of working only with pixel labels, PQ works with matched predicted and ground-truth segments.[^panoptic]

The formula is

$$
\operatorname{PQ} =
\frac{\sum_{(p,g)\in TP} \operatorname{IoU}(p, g)}
{|TP| + \tfrac{1}{2}|FP| + \tfrac{1}{2}|FN|}.
$$

To understand it, do not read the symbols too quickly.

The numerator is not "all overlapping pixels in the image." It is the sum of IoUs over matched pairs of predicted and true segments.

The denominator is counting instance-level accounting errors: $|TP|$ is the number of matched segment pairs, $|FP|$ is unmatched predicted segments, and $|FN|$ is unmatched ground-truth segments.

So PQ is evaluating pixel overlap after forcing the prediction to get the object bookkeeping right.

The paper also decomposes PQ into

$$
\operatorname{PQ} = \operatorname{SQ} \times \operatorname{RQ},
$$

where SQ is segmentation quality over the matched pairs, and RQ is recognition quality, an F1-like term that reflects whether the instance set itself is right. This decomposition is especially valuable in interpretation. It tells you whether a model is failing because the matched masks are sloppy, or because the model is not finding and separating the right objects in the first place. In the merged-pedestrians example, semantic overlap may still be high, but recognition quality drops because one predicted instance cannot correctly account for two separate people. That is the exact mechanism by which PQ sees a scene-structure error that semantic IoU largely hides.[^panoptic]

## Image-to-image prediction is not one problem

Image-to-image tasks often create confusion because people treat them as "just dense regression." But image-to-image prediction can be judged in several genuinely different ways, and those ways do not always agree.

Take a microscopy example. Suppose the model predicts a fluorescence-like image from a brightfield input.

Prediction A reproduces every nucleus and membrane in the correct place, but the whole image is 10% brighter than the target.

Prediction B matches global intensity more closely, but slightly blurs the membrane boundaries.

Which one is better?

The answer depends on what you mean by "better."

If you care about exact pixel values, then a metric derived from mean squared error, and therefore PSNR, is natural. PSNR is a transformed version of pixelwise squared error, so it reacts to any systematic intensity offset even if the structures are all in the right places. That is not a flaw. It simply means PSNR is a pixel-space fidelity metric. It asks whether the numeric values at corresponding locations are close. Wang et al. made this contrast explicit when motivating SSIM: classical methods such as MSE quantify error strength, but images with the same MSE can have very different perceptual consequences.[^ssim]

SSIM changes the comparison space. Instead of only counting pixelwise errors, it compares local image patches through three components: luminance, contrast, and structure. At a high level, it asks whether two local neighborhoods have similar means, similar variation, and similar normalized spatial arrangement. That is why the right mental model for SSIM is not "a slightly smarter MSE." It is "a local structural-comparison metric." If Prediction A keeps the spatial arrangement of membranes and nuclei intact but shifts overall brightness, SSIM may remain fairly strong. If Prediction B blurs the fine structure, SSIM will usually react more because local structural relationships degrade.[^ssim]

LPIPS changes the space again. Instead of comparing raw pixels or hand-crafted local statistics, it passes both images through a deep network and compares activations in learned feature space. Zhang et al. showed that deep features align much better with human perceptual-similarity judgments than traditional metrics such as PSNR and SSIM. That means LPIPS is not really asking whether two images are numerically close. It is asking whether they activate similar visual representations inside a model.[^lpips]

This is where the conceptual split matters.

PSNR asks: are the pixel values close?

SSIM asks: are the local structures and patterns preserved?

LPIPS asks: are the deep visual representations similar?

Those are three different questions, so disagreement between them is not a nuisance. It is a clue.

There is also an important caution here. In scientific or medical image-to-image tasks, perceptual plausibility is not enough. A hallucinated lesion or a missing cellular structure can look visually plausible in feature space and still be scientifically wrong. That is why image-to-image evaluation often needs a fourth layer beyond fidelity, structure, and perceptual similarity: downstream semantic utility. If the generated image is meant to preserve information used for segmentation, detection, quantification, or diagnosis, then the most honest evaluation may include whether a downstream analysis on the generated image still works correctly. SSIM and LPIPS can be useful, but they do not replace content-faithfulness checks when meaning matters.

## Dense prediction in the wild: confidence, failure, and anomaly

Now consider a road-scene segmentation model that performs extremely well on the known classes in its benchmark: road, sidewalk, sky, cars, buildings. Then one day a couch appears in the middle of the road.

A closed-set semantic metric such as mIoU is not designed to answer the most important question here. It can tell you how well the model segments the known semantic classes. It cannot tell you whether the model realizes that the couch is something strange and potentially dangerous.

That is a different problem: uncertainty and anomaly awareness.

Fishyscapes was introduced precisely because standard segmentation evaluation does not address this safety-critical gap. It evaluates pixelwise uncertainty estimates for anomalous objects in real-world road scenes and shows that anomaly detection remains far from solved even when ordinary segmentation accuracy is strong. The benchmark treats anomaly identification as a ranking problem over pixels: are high-uncertainty pixels concentrated where the anomalous object is?[^fishyscapes]

ValUES pushes this line of thinking further by arguing that uncertainty estimation in semantic segmentation should be evaluated systematically across several downstream uses: OOD detection, active learning, failure detection, calibration, and ambiguity modeling. That is a very useful framework because it clarifies that "good uncertainty" is not a single property. A method can be good at calibration and mediocre at anomaly detection, or good at failure ranking and poor at ambiguity modeling. Once again, the right evaluation depends on the exact question being asked of the output field.[^values]

The broader lesson is simple. A dense predictor deployed in the real world often needs at least three evaluation layers at once: a task metric for ordinary performance, a reliability metric for confidence quality, and an OOD or anomaly metric for unfamiliar content. High segmentation accuracy without those extra layers can still be operationally unsafe.

## What all of these examples are really showing

The examples may look different, but they all express the same deeper principle.

- Mask IoU compares full regions.
- Boundary IoU compares contour neighborhoods.
- Dice compares foreground mass.
- clDice compares connectivity backbones.
- PQ compares matched object sets.
- PSNR compares pixel values.
- SSIM compares local structural statistics.
- LPIPS compares deep feature representations.
- Uncertainty and anomaly metrics compare confidence rankings over pixels.

None of these metrics is universally best. Each one changes the object or the space in which similarity is judged. That is why the question "which metric should I use?" is too vague. The real question is "which notion of wrongness matters for my task?" Metrics Reloaded is valuable precisely because it forces that question to be asked explicitly instead of assuming that historical habit is enough.[^metrics-reloaded]

## A practical evaluation stack

For most serious dense-prediction work, a single headline metric is not enough. A better pattern is to choose one primary metric that matches the core task and one or two companion metrics that expose the failure modes the primary metric hides.

For semantic segmentation of ordinary regions, a region metric such as mIoU is a natural backbone, but it often benefits from a boundary-aware companion.[^boundary-iou]

For tubular or graph-like structures, an overlap metric benefits from a topology-aware companion such as clDice.[^cldice]

For object-aware scene parsing, semantic scores need an instance-aware companion such as PQ.[^panoptic]

For image-to-image tasks, raw fidelity should usually be separated from structural similarity and perceptual similarity, and in meaning-critical settings it should often be paired with a downstream utility check.

For deployment-oriented dense prediction, task accuracy should be paired with uncertainty and anomaly evaluation.[^values][^fishyscapes]

That is the portfolio-grade answer to dense-prediction evaluation: do not ask one number to stand in for every kind of correctness. Ask what structure the output carries, what errors are cheap versus catastrophic, and which metric makes those failures visible.

## Closing thought

Dense prediction should be evaluated as agreement between structured spatial fields under a task-specific notion of equivalence. Once that idea clicks, the rest becomes much cleaner. Metrics stop looking like a random toolbox. They become ways of deciding which spatial differences count as meaningful. The craft of evaluation is deciding which of those differences your task can afford to ignore, and which it cannot.[^metrics-reloaded]

## References

[^metrics-reloaded]: Maier-Hein et al. "Metrics Reloaded: Recommendations for image analysis validation." *Nature Methods* 21, 2024. [https://pmc.ncbi.nlm.nih.gov/articles/PMC11182665/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11182665/)

[^boundary-iou]: Cheng et al. "Boundary IoU: Improving Object-Centric Image Segmentation Evaluation." CVPR 2021. [https://openaccess.thecvf.com/content/CVPR2021/papers/Cheng_Boundary_IoU_Improving_Object-Centric_Image_Segmentation_Evaluation_CVPR_2021_paper.pdf](https://openaccess.thecvf.com/content/CVPR2021/papers/Cheng_Boundary_IoU_Improving_Object-Centric_Image_Segmentation_Evaluation_CVPR_2021_paper.pdf)

[^cldice]: Shit et al. "clDice: A Novel Topology-Preserving Loss Function for Tubular Structure Segmentation." CVPR 2021. [https://openaccess.thecvf.com/content/CVPR2021/papers/Shit_clDice_-_A_Novel_Topology-Preserving_Loss_Function_for_Tubular_Structure_CVPR_2021_paper.pdf](https://openaccess.thecvf.com/content/CVPR2021/papers/Shit_clDice_-_A_Novel_Topology-Preserving_Loss_Function_for_Tubular_Structure_CVPR_2021_paper.pdf)

[^panoptic]: Kirillov et al. "Panoptic Segmentation." CVPR 2019. [https://openaccess.thecvf.com/content_CVPR_2019/papers/Kirillov_Panoptic_Segmentation_CVPR_2019_paper.pdf](https://openaccess.thecvf.com/content_CVPR_2019/papers/Kirillov_Panoptic_Segmentation_CVPR_2019_paper.pdf)

[^ssim]: Wang et al. "Image Quality Assessment: From Error Visibility to Structural Similarity." *IEEE Transactions on Image Processing* 13(4), 2004. [https://ece.uwaterloo.ca/~z70wang/publications/ssim.html](https://ece.uwaterloo.ca/~z70wang/publications/ssim.html)

[^lpips]: Zhang et al. "The Unreasonable Effectiveness of Deep Features as a Perceptual Metric." CVPR 2018. [https://openaccess.thecvf.com/content_cvpr_2018/papers/Zhang_The_Unreasonable_Effectiveness_CVPR_2018_paper.pdf](https://openaccess.thecvf.com/content_cvpr_2018/papers/Zhang_The_Unreasonable_Effectiveness_CVPR_2018_paper.pdf)

[^values]: Kahl et al. "ValUES: A Framework for Systematic Validation of Uncertainty Estimation in Semantic Segmentation." ICLR 2024. [https://openreview.net/forum?id=Hkje52C9tX](https://openreview.net/forum?id=Hkje52C9tX)

[^fishyscapes]: Blum et al. "Fishyscapes: A Benchmark for Safe Semantic Segmentation in Autonomous Driving." ICCV Workshops 2019. [https://openaccess.thecvf.com/content_ICCVW_2019/papers/ADW/Blum_Fishyscapes_A_Benchmark_for_Safe_Semantic_Segmentation_in_Autonomous_Driving_ICCVW_2019_paper.pdf](https://openaccess.thecvf.com/content_ICCVW_2019/papers/ADW/Blum_Fishyscapes_A_Benchmark_for_Safe_Semantic_Segmentation_in_Autonomous_Driving_ICCVW_2019_paper.pdf)
