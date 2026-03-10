---
title: "BatchNorm vs GroupNorm in vision models"
slug: "batchnorm-vs-groupnorm-in-vision-models"
summary: "What BatchNorm and GroupNorm actually normalize inside CNNs, why that changes optimization behavior, and when batch-dependent statistics become a liability."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
in_draft: false
tags:
  - Normalization
  - Optimization
  - Vision Models
  - Neural Networks
sortOrder: 3
relatedProjects:
  - microscopy-benchmark-pipeline
---
BatchNorm and GroupNorm are often described as normalization techniques, but that phrase is too broad to explain much. A more precise description is that both are layers placed inside a network to stabilize intermediate activations. They take the output of a layer, normalize it using statistics computed from a selected set of values, and then apply a learned scale-and-shift transform before passing the result forward. The two methods are closely related in form, but they differ in one crucial choice: which activations share the same mean and variance. That is the core of the comparison.

## Where these layers sit in the forward pass

The easiest way to understand both methods is to start from the forward pass of a convolutional model. A common block looks like

$$
\text{input} \rightarrow \text{convolution} \rightarrow \text{normalization} \rightarrow \text{activation} \rightarrow \text{next layer}.
$$

The convolution comes first. It produces feature maps. The normalization layer acts on those feature maps. The activation function then applies the nonlinearity to the normalized result. So BatchNorm and GroupNorm are not usually acting on the raw image itself. They are acting on hidden activations produced by a convolution.[^1][^4][^5]

If a convolution produces a tensor

$$
x \in \mathbb{R}^{N \times C \times H \times W},
$$

then $N$ is the batch size, $C$ is the number of channels, and $H, W$ are the spatial dimensions. This is the object the normalization layer receives. Both BatchNorm and GroupNorm operate on this same kind of tensor. The difference is not in the shape of the input they receive, but in how they choose the subset of values used to compute normalization statistics.[^4][^5]

## The shared structure

At a mathematical level, both layers share the same basic structure. First, they standardize the selected activations,

$$
\hat{x} = \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}},
$$

and then they apply a learned affine transform,

$$
y = \gamma \hat{x} + \beta.
$$

This second step is important and often underexplained. The normalization layer does not stop after producing zero-centered, unit-variance activations. It also learns how to rescale and shift them. The parameters $\gamma$ and $\beta$ belong to the normalization layer itself. They are not part of the convolution. In practice they are usually learned per channel, so if a tensor has 64 channels, the layer typically learns 64 scale values and 64 shift values.[^4][^5]

This means a normalization layer is doing more than a fixed statistical cleanup step. It first standardizes the selected activations, then learns how strongly each channel should be stretched or shifted afterward. That learned affine step gives the network back its freedom. Without it, normalization would force every feature into a standardized form with no way to recover a more useful scale or offset. If normalization produces values like $[-1, 0, 1]$, and the layer learns $\gamma = 2$ and $\beta = 3$, then the final output becomes $[1, 3, 5]$. The feature was normalized first, but the model still decided what final scale and position it wanted.

## The real difference

The real difference between BatchNorm and GroupNorm appears when deciding what set of values should contribute to $\mu$ and $\sigma^2$. BatchNorm computes statistics per channel, pooling across the batch dimension and the spatial dimensions. For a fixed channel $c$, it uses the set

$$
\{x_{n,c,h,w}\}_{n,h,w}.
$$

So if the activation tensor has shape $[8, 64, 32, 32]$, then for channel 17, BatchNorm gathers all values from channel 17 across all 8 images and all spatial locations, computes one mean and one variance from that set, and uses those statistics to normalize channel 17 everywhere in the batch. It then repeats that independently for the other channels. In effect, BatchNorm says that for each channel, the current mini-batch is the reference population.[^1][^4]

That detail matters because it means BatchNorm statistically couples examples together. The normalized value of one image depends partly on the other images present in the same mini-batch. This is one reason BatchNorm can work very well when batch statistics are reliable, but it is also the source of its fragility when batch size becomes very small.

GroupNorm keeps the same overall normalize-then-affine pattern, but changes the normalization set. Instead of using the batch dimension, it splits the channels into groups and computes statistics within each sample, within each group. If the tensor has $C$ channels and we choose $G$ groups, then each group contains $C/G$ channels. For one sample $n$ and one group $g$, GroupNorm computes statistics over

$$
\{x_{n,c,h,w} : c \in g,\ h,w\}.
$$

So if the tensor shape is $[8, 64, 32, 32]$ and we choose 8 groups, then each group contains 8 channels. For image 3 and group 2, GroupNorm computes mean and variance using only those 8 channels of that one image across all spatial positions. It does not use the other 7 images in the batch at all.[^2][^5]

That is the key conceptual split. BatchNorm groups values across images for each channel. GroupNorm groups values across channels within a single image. Once that is clear, many practical differences become much easier to reason about.

A small tensor example makes this concrete. Suppose a convolution outputs a tensor with shape $[2, 4, 2, 2]$. There are 2 images, 4 channels, and each channel is a $2 \times 2$ feature map. In BatchNorm, if we focus on channel 1, the layer gathers the 4 values from image 1, channel 1 and the 4 values from image 2, channel 1. It computes one mean and one variance from those 8 values and uses them to normalize channel 1 in both images. It then repeats that process for the other channels. In GroupNorm, if the 4 channels are split into 2 groups, then for image 1, one group might contain channels 1 and 2. The layer gathers the 4 values from channel 1 and the 4 values from channel 2 of that same image, computes one mean and one variance for that group, and normalizes only that slice. The number of values may look similar in this toy case, but the axes are different. BatchNorm groups across images. GroupNorm groups across channels inside a sample.

## Training versus inference

During training, BatchNorm computes mean and variance from the current mini-batch and uses them immediately. At the same time, it maintains running estimates of those statistics for later use. During inference, it usually stops using the current batch and instead uses the stored running mean and running variance collected during training. So BatchNorm has a built-in train/eval split: during training it depends on the current batch, and during inference it usually depends on running estimates. This is a central part of how the layer works, not an implementation footnote.[^1][^4]

GroupNorm is simpler in this respect. Because its statistics are computed within each sample rather than across the batch, it does not depend on batch-level running statistics in the same way. Its behavior stays much more consistent between training and inference. This is one of the reasons it became attractive in vision workloads where batch size is small, unstable, or constrained by memory.[^2][^5]

## Why the difference matters in practice

The reason normalization layers help at all is that hidden activations can drift in scale and offset as training progresses. That makes optimization harder. The original BatchNorm paper showed that inserting normalization into deep networks made training faster and more stable, allowed higher learning rates, reduced sensitivity to initialization, and in one ImageNet setup reached the same accuracy with far fewer training steps. Historically, the method was introduced through the language of reducing internal covariate shift. That framing is important to the history of the method, but it is not the full modern explanation. Later work argued that BatchNorm's practical benefits are better explained by the way it smooths the optimization landscape and stabilizes gradients. That is a more careful way to understand why it works so well in practice.[^1][^3]

GroupNorm became important because BatchNorm's dependence on the batch can become a problem in vision settings where memory limits batch size. This happens often in detection, segmentation, video models, and high-resolution imaging. When the batch becomes very small, BatchNorm's estimates of mean and variance become noisy, because the batch is no longer a strong statistical reference. GroupNorm removes that dependency. Its statistics are computed within each sample, so its behavior remains stable even when the batch size is tiny. That is why it is often discussed as a strong alternative in memory-constrained vision training.[^2][^5]

The comparison is therefore not "old normalization versus new normalization," and it is not "general normalization versus small-batch normalization." The more accurate comparison is that both methods standardize intermediate activations and then apply learned affine parameters, but they define the reference distribution differently. BatchNorm assumes that each channel should be normalized using statistics shared across the batch. GroupNorm assumes that grouped channels should be normalized using statistics from each individual sample. BatchNorm is often strongest when the batch is a trustworthy reference population. GroupNorm becomes attractive when the batch is too small or too unstable to play that role.

Seen this way, BatchNorm and GroupNorm are best understood as two closely related answers to the same design question: when normalizing hidden activations, which values should share statistical context? Once that question is made explicit, the rest of the behavior follows naturally.

## References

[^1]: Sergey Ioffe and Christian Szegedy, *Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift*, ICML 2015. [https://proceedings.mlr.press/v37/ioffe15.html](https://proceedings.mlr.press/v37/ioffe15.html)

[^2]: Yuxin Wu and Kaiming He, *Group Normalization*, ECCV 2018. [https://openaccess.thecvf.com/content_ECCV_2018/html/Yuxin_Wu_Group_Normalization_ECCV_2018_paper.html](https://openaccess.thecvf.com/content_ECCV_2018/html/Yuxin_Wu_Group_Normalization_ECCV_2018_paper.html)

[^3]: Shibani Santurkar, Dimitris Tsipras, Andrew Ilyas, and Aleksander Madry, *How Does Batch Normalization Help Optimization?*, NeurIPS 2018. [https://papers.nips.cc/paper_files/paper/2018/hash/905056c1ac1dad141560467e0a99e1cf-Abstract.html](https://papers.nips.cc/paper_files/paper/2018/hash/905056c1ac1dad141560467e0a99e1cf-Abstract.html)

[^4]: PyTorch documentation for `torch.nn.BatchNorm2d`. [https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d)

[^5]: PyTorch documentation for `torch.nn.GroupNorm`. [https://docs.pytorch.org/docs/stable/generated/torch.nn.modules.normalization.GroupNorm.html](https://docs.pytorch.org/docs/stable/generated/torch.nn.modules.normalization.GroupNorm.html)
