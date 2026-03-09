---
title: "Depthwise and 1x1 convolution: spatial filtering vs channel mixing"
slug: "depthwise-and-1x1-convolution"
summary: "How standard convolution combines spatial filtering and channel mixing, and why depthwise plus 1x1 convolutions split those jobs apart."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
in_draft: true
tags:
  - Convolution
  - CNNs
  - Efficiency
sortOrder: 20
relatedProjects: []
---

Standard convolution is often introduced as a single primitive, but it is really doing two different jobs at once. It looks across a local spatial neighborhood, and it mixes information across channels. Depthwise convolution keeps the spatial part while removing cross-channel mixing. A $1 \times 1$ convolution does the opposite: it mixes channels at each spatial location without looking across a wider neighborhood. Put together, they form a depthwise separable convolution, which became the central efficiency idea behind MobileNet and one of the clearest factorization stories in Xception.[^mobilenet][^xception]

That is why these two operations are worth comparing directly. They are not interchangeable, but they are complementary. Each isolates one part of what a standard convolution normally does in one fused operator.

## Standard convolution

A standard $k \times k$ convolution with $N$ input channels and $M$ output channels uses a weight tensor of shape $k \times k \times N \times M$. For an input feature map $x$ of shape $H \times W \times N$, each output channel is built by scanning a $k \times k$ neighborhood and summing across all input channels:

$$
y[i, j, m] = \sum_{u, v, n} W[u, v, n, m] \, x[i + u, j + v, n]
$$

This means each output channel is free to learn both a local spatial pattern and a specific combination of input channels. That fused behavior is exactly what makes standard convolution such a strong primitive: a single layer can jointly reason about local structure and channel interactions in one step.

The cost of that flexibility is easy to see in the parameter count:

$$
k^2 N M
$$

and in the dominant feature-map compute:

$$
H W k^2 N M
$$

For a $3 \times 3$ layer, each output channel carries $9N$ learned weights, so producing $M$ output channels scales that to $9NM$. At large spatial resolutions or high channel counts, that becomes expensive quickly. This is one reason later architectures leaned so heavily on bottlenecks and factorized blocks rather than paying for dense spatial-channel mixing everywhere.[^googlenet][^resnet]

<figure>
  <video controls preload="metadata" playsinline>
    <source src="/videos/writing/ClassicConvolutionStory.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <figcaption>
    Standard convolution fuses both jobs: each output filter spans a local spatial window and all input channels at once.
  </figcaption>
</figure>

A useful mental model is that standard convolution is a fused operator. It does not expose a separate spatial-filtering stage and a separate channel-mixing stage. Depthwise and $1 \times 1$ convolutions make that split explicit.

## Depthwise convolution

Depthwise convolution keeps the spatial filtering but removes cross-channel mixing. Instead of learning one $k \times k \times N$ filter per output channel, it learns one $k \times k$ spatial filter for each input channel. If the input has $N$ channels, the depthwise layer applies $N$ separate kernels independently:

$$
z[i, j, n] = \sum_{u, v} D[u, v, n] \, x[i + u, j + v, n]
$$

There is no sum over different channels. Each channel is filtered on its own.

The parameter count drops from $k^2 N M$ to:

$$
k^2 N
$$

and the dominant feature-map cost drops to:

$$
H W k^2 N
$$

That reduction is dramatic when $M$ is large. But the tradeoff is equally important: depthwise convolution alone cannot learn new interactions between channels. It can sharpen, smooth, or detect spatial patterns inside each channel, but it cannot recombine channels into richer composite features by itself.[^mobilenet]

<figure>
  <video controls preload="metadata" playsinline>
    <source src="/videos/writing/DepthwiseConvolution.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <figcaption>
    Depthwise convolution applies one spatial filter per channel, so spatial processing remains while channel mixing disappears.
  </figcaption>
</figure>

That is why depthwise convolution is better understood as one half of a factorized design rather than as a full replacement for standard convolution.

## 1x1 convolution

A $1 \times 1$ convolution makes the opposite tradeoff. It removes the wider spatial neighborhood but keeps channel mixing. At each spatial location $(i, j)$, it takes the channel vector $x[i, j, :]$ and applies a learned linear projection from $N$ channels to $M$ channels:

$$
y[i, j, m] = \sum_n P[n, m] \, x[i, j, n]
$$

So while the kernel is $1 \times 1$ in space, it is not a trivial operation. It is a full learned channel transform applied independently at every location. Network in Network helped make this interpretation influential by treating $1 \times 1$ layers as a real modeling tool for local cross-channel transformation rather than as a degenerate special case.[^nin]

The parameter count is:

$$
N M
$$

and the dominant feature-map cost is:

$$
H W N M
$$

This makes $1 \times 1$ convolution a strong architectural tool for changing the channel geometry of a network. It can reduce channels before an expensive spatial layer, expand channels to increase capacity, recombine channels after a factorized operation, and build bottlenecks or inverted bottlenecks that control where computation happens. GoogLeNet used $1 \times 1$ reductions to make wider multi-branch modules practical, and ResNet turned $1 \times 1 \rightarrow 3 \times 3 \rightarrow 1 \times 1$ bottlenecks into a standard deep vision pattern.[^googlenet][^resnet]

<figure>
  <video controls preload="metadata" playsinline>
    <source src="/videos/writing/PointwiseConvolution.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <figcaption>
    A 1x1 convolution mixes channels at each pixel location without increasing spatial receptive field on its own.
  </figcaption>
</figure>

The cleanest short description is this: a $1 \times 1$ convolution is a channel mixer.

## Putting them together: depthwise separable convolution

Once those roles are separated, the natural composition is:

1. depthwise convolution for spatial filtering inside each channel
2. $1 \times 1$ pointwise convolution for channel mixing across the filtered responses

Written explicitly:

$$
z[i, j, n] = \sum_{u, v} D[u, v, n] \, x[i + u, j + v, n]
$$

$$
y[i, j, m] = \sum_n P[n, m] \, z[i, j, n]
$$

The total parameter count becomes:

$$
k^2 N + N M
$$

instead of:

$$
k^2 N M
$$

The dominant compute becomes:

$$
H W (k^2 N + N M)
$$

instead of:

$$
H W k^2 N M
$$

For a $3 \times 3$ layer, the relative compute becomes:

$$
\frac{9N + NM}{9NM} = \frac{1}{M} + \frac{1}{9}
$$

That is the core efficiency story in MobileNet. The model is not getting speed for free; it is assuming that spatial correlations and cross-channel correlations can often be modeled in two cheaper stages instead of one dense monolithic kernel.[^mobilenet][^xception]

## Why the factorization is more than a speed trick

The deeper idea is not just parameter reduction. It is a structural claim about representation learning: spatial pattern extraction and cross-channel recombination may be separable enough that it is useful to learn them in different operators. Xception makes this argument explicitly by framing depthwise separable convolution as an extreme version of the Inception factorization idea.[^xception]

That perspective also clarifies why $1 \times 1$ convolution is more important than it first appears. In MobileNet, most of the parameters and much of the computation still live in the pointwise $1 \times 1$ layers, not the depthwise ones. The depthwise stage removes the expensive spatial cross-channel coupling, but the pointwise stage still does much of the representational heavy lifting.[^mobilenet]

MobileNetV2 pushes that logic further. Its block expands channels with a $1 \times 1$ layer, applies depthwise spatial filtering in that expanded space, and then projects back down with another $1 \times 1$ layer. The paper's argument is that the geometry of the feature space around the depthwise operation matters, and that narrow bottlenecks should stay linear to avoid throwing away information too early.[^mobilenetv2]

## Where these operators show up

The importance of $1 \times 1$ convolution was visible before depthwise separable convolution became famous. In Network in Network, it appeared as part of the *mlpconv* idea: instead of treating local patches with a single linear filter followed by a nonlinearity, the paper proposed richer local channel-wise transformations. That made $1 \times 1$ convolution an explicit modeling tool rather than a trivial edge case. The paper reported state-of-the-art results at the time, including 8.81\% test error on CIFAR-10 with augmentation and 35.68\% on CIFAR-100, helping establish that local channel mixing could be a serious representational primitive in its own right.[^nin]

That idea became architecturally central in GoogLeNet. The Inception design used $1 \times 1$ convolutions as reductions before the more expensive $3 \times 3$ and $5 \times 5$ branches, which made wider multi-branch modules computationally feasible. The paper describes most experiments as operating under a budget of about 1.5 billion multiply-adds and reports a 6.67\% top-5 error on the ILSVRC 2014 classification benchmark. It also notes that GoogLeNet used roughly 5 million parameters, about 12 times fewer than AlexNet. In other words, the contribution of $1 \times 1$ convolution here was not just mathematical neatness; it was a concrete mechanism for keeping expressive architectures computationally practical.[^googlenet]

In ResNet, $1 \times 1$ convolution took on a different but equally important role. The deeper ResNet variants standardized the bottleneck pattern
$1 \times 1 \rightarrow 3 \times 3 \rightarrow 1 \times 1$,
using the first $1 \times 1$ layer to compress channels before the expensive spatial operation and the last one to restore dimensionality afterward. This made it feasible to scale depth much further without paying the full cost of wide $3 \times 3$ convolutions everywhere. The 152-layer ResNet reported a 4.49\% top-5 validation error as a single model, and the final ensemble reached 3.57\% top-5 error on the ImageNet test set, winning ILSVRC 2015.[^resnet]

The next major shift came with MobileNet, where depthwise separable convolution became the central efficiency primitive rather than a secondary trick. The main empirical result was unusually clear: replacing a reference model built from standard convolutions with depthwise separable layers reduced computation from 4866 million multiply-adds to 569 million, and parameters from 29.3 million to 4.2 million, while top-1 ImageNet accuracy fell only from 71.7\% to 70.6\%. That is why the method mattered. Most of the computation disappeared, but most of the accuracy remained. The same paper also makes a subtler systems point: 95\% of MobileNet's computation and 75\% of its parameters were still in the $1 \times 1$ convolutions, which means the pointwise stage remained the real workhorse of the block.[^mobilenet]

Xception sharpened the conceptual argument. Instead of presenting depthwise separable convolution as merely a cheap approximation, Chollet framed it as a meaningful factorization of convolution itself: first learn spatial correlations independently per channel, then learn cross-channel correlations with pointwise mixing. The empirical results supported that framing. On ImageNet, Xception reported 79.0\% top-1 and 94.5\% top-5 accuracy, compared with 78.2\% and 94.1\% for Inception V3. On JFT, it reported a 4.3\% relative improvement in FastEval14k MAP@100. Since the model sizes were nearly the same, the paper's argument was not that Xception simply used more capacity, but that the factorization itself was a more effective use of parameters.[^xception]

MobileNetV2 refined the same design logic rather than replacing it. Its inverted residual block makes the role of $1 \times 1$ convolutions even clearer: expand channels, apply depthwise filtering in that richer intermediate space, and then project back down with a linear bottleneck. On ImageNet, the paper reports 72.0\% top-1 accuracy with 3.4M parameters and 300M multiply-adds, improving on MobileNetV1's 70.6\% accuracy with 4.2M parameters and 569M multiply-adds. The same paper also shows that the design transfers well beyond classification: MobileNetV2 + SSDLite reaches 22.1 mAP on COCO with 4.3M parameters and 0.8B MAdds, giving a strong efficiency-accuracy tradeoff for mobile detection as well.[^mobilenetv2]

## Distinctions that matter

A standard convolution should be understood as a fused operator. It does not merely slide a spatial template across the feature map; it simultaneously performs spatial aggregation over a neighborhood and channel mixing across the full input depth. That is why it is expressive, and also why it is expensive.

A depthwise convolution keeps only the spatial part of that operator. Each channel receives its own spatial filter, so local pattern extraction remains, but new cross-channel features cannot be formed at that stage. The layer is cheap because it removes dense channel coupling, not because it somehow preserves the full expressive power of a regular convolution.

A $1 \times 1$ convolution does the opposite. It keeps channel interaction while discarding the wider spatial neighborhood. At each pixel location, it applies a learned linear map to the channel vector, which is why it is best understood as a channel projector or channel mixer. This is also why it keeps appearing in so many roles across the literature: reduction, expansion, bottlenecking, projection, and recombination are all channel-space operations.

A depthwise separable convolution is simply those last two roles composed in sequence:

$$
\text{depthwise spatial filtering} \;\rightarrow\; \text{$1 \times 1$ channel mixing}
$$

Its parameter count becomes

$$
k^2 N + N M
$$

instead of

$$
k^2 N M
$$

and that factorization explains both the computational savings and the architectural appeal. The deeper lesson is not only that the block is cheaper. It is that spatial correlations and cross-channel correlations can often be learned effectively in separate stages, which is the real conceptual link between depthwise and $1 \times 1$ convolution.[^xception][^mobilenet]

## Conclusion

Depthwise convolution and $1 \times 1$ convolution matter because they split apart the two jobs that a standard convolution normally performs together. Depthwise convolution preserves local spatial processing while dropping channel interaction. A $1 \times 1$ convolution preserves channel interaction while dropping wider spatial extent. Combined, they form depthwise separable convolution, which became foundational in efficient CNN design because it reduces computation sharply while keeping a clean and interpretable division of labor inside the block.[^xception][^mobilenet]

## References

[^nin]: Lin, Chen, and Yan. "Network in Network." 2013. [https://arxiv.org/abs/1312.4400](https://arxiv.org/abs/1312.4400)

[^googlenet]: Szegedy et al. "Going Deeper with Convolutions." 2015. [https://www.cs.unc.edu/~wliu/papers/GoogLeNet.pdf](https://www.cs.unc.edu/~wliu/papers/GoogLeNet.pdf)

[^resnet]: He et al. "Deep Residual Learning for Image Recognition." 2016. [https://www.cv-foundation.org/openaccess/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf](https://www.cv-foundation.org/openaccess/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf)

[^xception]: Chollet. "Xception: Deep Learning with Depthwise Separable Convolutions." 2017. [https://openaccess.thecvf.com/content_cvpr_2017/papers/Chollet_Xception_Deep_Learning_CVPR_2017_paper.pdf](https://openaccess.thecvf.com/content_cvpr_2017/papers/Chollet_Xception_Deep_Learning_CVPR_2017_paper.pdf)

[^mobilenet]: Howard et al. "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications." 2017. [https://arxiv.org/abs/1704.04861](https://arxiv.org/abs/1704.04861)

[^mobilenetv2]: Sandler et al. "MobileNetV2: Inverted Residuals and Linear Bottlenecks." 2018. [https://openaccess.thecvf.com/content_cvpr_2018/papers/Sandler_MobileNetV2_Inverted_Residuals_CVPR_2018_paper.pdf](https://openaccess.thecvf.com/content_cvpr_2018/papers/Sandler_MobileNetV2_Inverted_Residuals_CVPR_2018_paper.pdf)
