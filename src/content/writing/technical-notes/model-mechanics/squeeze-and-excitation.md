---
title: "Squeeze-and-Excitation"
slug: "squeeze-and-excitation"
summary: "How squeeze-and-excitation uses global context to recalibrate channels, why the block stayed cheap enough to spread, and what later attention papers changed."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
in_draft: true
tags:
  - Attention
  - CNNs
  - Architecture
  - Efficiency
sortOrder: 4
relatedProjects: []
---
Squeeze-and-Excitation, usually shortened to SE, is one of the clearest cases of a small architectural change carrying a large conceptual lesson. Its importance is not only that it improved ImageNet accuracy. The deeper contribution was to show that a standard convolutional block is missing an explicit mechanism for input-conditioned channel reweighting. SE fills that gap by letting a block summarize global context and then use that summary to amplify or suppress channels for the current input.[^senet]

That framing matters because SE is often described loosely as "attention," which is true but incomplete. The claim is narrower. A convolution mixes spatial and channel information through fixed learned weights applied locally. SE adds a second question after that transformation: given the features this block just produced, which channels matter most for this image, at this depth, right now? The answer is turned into channel-wise gates and applied before the tensor moves on.[^senet]

## The gap SE is trying to fix

Suppose a convolutional block produces a feature tensor

$$
U \in \mathbb{R}^{C \times H \times W}.
$$

In an ordinary CNN, those $C$ channels are passed forward as they are. The next layer can learn how to use them, but the block itself has no explicit module that models global, nonlinear dependencies between channels conditioned on the current sample. Hu et al. argued that this makes learning harder than necessary, because useful global context exists but is not directly exposed as a control signal.[^senet]

This is why the module is split into two named stages. The squeeze stage compresses each channel into a global descriptor. The excitation stage turns that descriptor into a set of channel gates. The original feature tensor is then rescaled channel by channel. The important point is that the rescaling is instance-specific: the same backbone block can behave differently for different images because the gates depend on the current input.[^senet]

## The mechanics of the SE block

The squeeze step uses global average pooling. If $u_c$ denotes channel $c$, then the pooled channel descriptor
$z \in \mathbb{R}^C$
is

$$
z_c = \frac{1}{HW} \sum_{i=1}^{H} \sum_{j=1}^{W} u_c(i, j).
$$

This choice is deliberately simple. The goal is not to preserve spatial layout. The goal is to compress the global response of each channel into a statistic that can drive a control signal.[^senet]

The excitation step maps $z$ into a gate vector $s \in \mathbb{R}^C$:

$$
s = \sigma(W_2 \, \delta(W_1 z)).
$$

Here,

$$
W_1 \in \mathbb{R}^{\frac{C}{r} \times C},
\qquad
W_2 \in \mathbb{R}^{C \times \frac{C}{r}},
$$

$\delta$ is ReLU, and $\sigma$ is sigmoid. The reduction ratio $r$ creates a bottleneck so the gating function stays cheap enough to insert across many layers. The final recalibration is channel-wise multiplication:

$$
\tilde{u}_c = s_c \cdot u_c.
$$

The paper is explicit about why sigmoid is used instead of a competitive normalization like softmax: multiple channels may need to be emphasized together, so the desired relationship is not mutually exclusive.[^senet]

That design has a very specific interpretation. The excitation vector does not create new features. It acts as a learned set of gains over existing features. In control language, SE is a lightweight global-context controller wrapped around a convolutional transformation. In representation-learning language, it is conditional feature selection. In both views, the key point is the same: ordinary convolutions do not explicitly expose channel importance as an input-dependent quantity, and SE does.[^senet]

## Why the block stayed cheap enough to matter

Many architectural ideas fail because they are too expensive to deploy broadly. SE succeeded partly because the overhead is small. In the original paper, Hu et al. analyze ResNet-50 and report that adding SE increases computation from about 3.86 GFLOPs to 3.87 GFLOPs, roughly a 0.26\% relative increase.[^senet] That is a tiny systems cost for a nontrivial representational change.

The payoff made the tradeoff hard to ignore. On ImageNet, the paper reports that ResNet-50 improves from 24.80\% to 23.29\% top-1 error and from 7.48\% to 6.62\% top-5 error with almost no extra compute.[^senet] Similar gains appear for deeper ResNets and ResNeXt variants. That is why SE became a drop-in module rather than a curiosity: it had an unusually strong improvement-to-overhead ratio.

## The evidence that made SE influential

The SENet paper is persuasive because it does not stop at one backbone or one benchmark. On Places365 scene classification, SE-ResNet-152 improves top-5 error from 11.61\% to 11.01\%.[^senet] On COCO detection with Faster R-CNN, replacing ResNet backbones with SE-ResNet improves AP from 25.1 to 26.4 for ResNet-50 and from 27.2 to 27.9 for ResNet-101.[^senet] Those results matter because they show SE is not only a classification trick. It changes the learned representation in a way that helps downstream visual tasks.

Historically, the method also scaled to the highest-visibility setting available at the time. The paper reports that SENet formed the foundation of the team's ILSVRC 2017 winning submission, reaching 2.251\% top-5 error on the test set.[^senet] That does not prove a scientific principle by itself, but it does show that the mechanism was practical at state-of-the-art scale.

## What the recalibration seems to do across depth

One of the more interesting parts of the original paper is its analysis of how excitation behavior changes across layers. Hu et al. report that earlier SE blocks behave in a more class-agnostic way, strengthening broadly useful lower-level features, while later blocks become increasingly class-specific and show different channel preferences for different categories.[^senet]

That observation matters because it suggests SE is not just "more parameters, therefore better accuracy." The mechanism appears to change how specialization is organized across the network. Earlier layers use recalibration to strengthen broadly useful responses. Later layers use it to bias the representation toward semantically discriminative channels.

## How later literature refined the idea

Later work largely accepted SE's main thesis: channel-wise recalibration is useful. What changed was the exact implementation.

CBAM is one of the earliest and clearest refinements. It keeps channel attention but argues that channel-only recalibration is incomplete because it says little about where the model should focus. In CBAM's ResNet-50 ablations, an SE-style channel-only block reaches 23.14\% top-1 error, while the proposed combination of channel and spatial attention reduces that to 22.66\%.[^cbam] The message is not that SE was wrong. It is that SE identified only one part of a broader attention problem.

ECA-Net attacks a different weakness. Its critique is that SE's dimensionality-reduction bottleneck may be unnecessarily destructive. Wang et al. argue that avoiding dimensionality reduction is important for channel attention, and they replace the two-layer bottleneck MLP with a very small 1D convolution over nearby channels.[^eca] Relative to a ResNet-50 backbone, the ECA module adds only 80 parameters and 4.7e-4 GFLOPs while still improving top-1 accuracy.[^eca] Conceptually, ECA preserves the SE worldview, but rejects the assumption that bottleneck compression is the best way to model channel interaction.

Selective Kernel Networks push the idea in yet another direction. Instead of only recalibrating channels, SKNet uses attention to choose among branches with different effective receptive fields. That shifts the modulation target from "which channels matter" to "which spatial scale matters." SKNet-50 reaches 20.79\% top-1 error versus 22.23\% for the ResNeXt-50 baseline, a 1.44-point absolute improvement at similar complexity.[^sknet] The broader lesson is that once global context is available, it can control more than channel gains.

## Why efficient models kept SE

A strong sign that a mechanism is genuinely useful is that it survives contact with efficiency-driven architecture design. SE did. EfficientNet explicitly includes squeeze-and-excitation inside its MBConv-based baseline model, which matters because EfficientNet was built under tight efficiency constraints rather than benchmark-maximal indulgence.[^efficientnet]

MobileNetV3 keeps SE as well, but adapts it to mobile deployment. The paper notes that SE is integrated into selected bottleneck blocks and paired with hardware-aware adjustments such as hard-sigmoid. It also reports a useful refinement: fixing the squeeze-and-excite bottleneck to one-fourth of the expansion channels improved accuracy with only a modest parameter increase and no discernible latency cost.[^mobilenetv3] That is a good engineering signal. SE was not merely tolerated in efficient models. It was preserved and tuned because it continued to earn its place.

## The main limitation of classical SE

The clearest limitation of SE is also the source of its elegance: the squeeze step collapses a full $H \times W$ map into a single scalar per channel. That gives strong global context at low cost, but it also destroys spatial structure. Later work on Coordinate Attention states this criticism directly, arguing that SE-like channel attention neglects positional information and that reducing a feature map to one vector makes it harder to preserve the spatial cues needed for accurate localization.[^coordatt]

That limitation does not make SE less important. It clarifies its role. SE is the canonical lightweight answer to the question, "How can a convolutional block use global context to modulate its channels?" It is not the final answer to the broader problem of attention in vision models. Later methods add spatial selectivity, preserve position, or change how channel interactions are parameterized, but many of them are best understood as refinements of the problem formulation that SE made mainstream.

## Conclusion

The lasting contribution of Squeeze-and-Excitation is not just that it improved benchmark numbers. It showed that explicit, input-conditioned modeling of channel dependencies is a useful inductive bias in vision networks. It also showed that this kind of modulation can be made cheap enough to use broadly. That is why SE remains one of the most important architectural ideas in modern CNN design: simple enough to explain clearly, strong enough to matter empirically, and fertile enough to shape the literature that came after it.[^senet][^cbam][^eca][^sknet]

## References

[^senet]: Hu, Shen, and Sun. "Squeeze-and-Excitation Networks." CVPR 2018. [https://openaccess.thecvf.com/content_cvpr_2018/papers/Hu_Squeeze-and-Excitation_Networks_CVPR_2018_paper.pdf](https://openaccess.thecvf.com/content_cvpr_2018/papers/Hu_Squeeze-and-Excitation_Networks_CVPR_2018_paper.pdf)

[^cbam]: Woo et al. "CBAM: Convolutional Block Attention Module." ECCV 2018. [https://openaccess.thecvf.com/content_ECCV_2018/papers/Sanghyun_Woo_Convolutional_Block_Attention_ECCV_2018_paper.pdf](https://openaccess.thecvf.com/content_ECCV_2018/papers/Sanghyun_Woo_Convolutional_Block_Attention_ECCV_2018_paper.pdf)

[^eca]: Wang et al. "ECA-Net: Efficient Channel Attention for Deep Convolutional Neural Networks." CVPR 2020. [https://openaccess.thecvf.com/content_CVPR_2020/papers/Wang_ECA-Net_Efficient_Channel_Attention_for_Deep_Convolutional_Neural_Networks_CVPR_2020_paper.pdf](https://openaccess.thecvf.com/content_CVPR_2020/papers/Wang_ECA-Net_Efficient_Channel_Attention_for_Deep_Convolutional_Neural_Networks_CVPR_2020_paper.pdf)

[^sknet]: Li et al. "Selective Kernel Networks." CVPR 2019. [https://openaccess.thecvf.com/content_CVPR_2019/papers/Li_Selective_Kernel_Networks_CVPR_2019_paper.pdf](https://openaccess.thecvf.com/content_CVPR_2019/papers/Li_Selective_Kernel_Networks_CVPR_2019_paper.pdf)

[^efficientnet]: Tan and Le. "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." ICML 2019. [https://proceedings.mlr.press/v97/tan19a/tan19a.pdf](https://proceedings.mlr.press/v97/tan19a/tan19a.pdf)

[^mobilenetv3]: Howard et al. "Searching for MobileNetV3." ICCV 2019. [https://openaccess.thecvf.com/content_ICCV_2019/papers/Howard_Searching_for_MobileNetV3_ICCV_2019_paper.pdf](https://openaccess.thecvf.com/content_ICCV_2019/papers/Howard_Searching_for_MobileNetV3_ICCV_2019_paper.pdf)

[^coordatt]: Hou, Zhou, and Feng. "Coordinate Attention for Efficient Mobile Network Design." CVPR 2021. [https://openaccess.thecvf.com/content/CVPR2021/papers/Hou_Coordinate_Attention_for_Efficient_Mobile_Network_Design_CVPR_2021_paper.pdf](https://openaccess.thecvf.com/content/CVPR2021/papers/Hou_Coordinate_Attention_for_Efficient_Mobile_Network_Design_CVPR_2021_paper.pdf)
