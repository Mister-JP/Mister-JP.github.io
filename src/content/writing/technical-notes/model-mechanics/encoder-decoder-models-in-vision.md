---
title: "Encoder-decoder models in vision"
slug: "encoder-decoder-models-in-vision"
summary: "How encoder-decoder models separate representation learning from output construction, why compression and reconstruction stay in tension, and how the pattern evolved from autoencoders and U-Net to DETR, MAE, diffusion, and SAM."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
in_draft: true
tags:
  - Encoder-Decoder
  - Dense Prediction
  - Representation Learning
  - Transformers
sortOrder: 6
relatedProjects: []
---

Encoder-decoder models are one of the most persistent ideas in computer vision. They keep returning because they solve a recurring systems problem: a model often needs high-level semantic understanding while still producing an output that is structured, spatial, and precise. In plain terms, the model has to answer both **what is here?** and **where exactly is it?** The encoder-decoder pattern exists to separate those jobs. The encoder builds compressed, abstract understanding. The decoder turns that understanding into the output form the task needs.[^fcn]

That idea did not begin with segmentation. Its roots are older. Early neural network work established end-to-end learning of internal representations through backpropagation, and later deep autoencoder work made the "compress into a hidden code, then reconstruct" pattern especially influential.[^rumelhart][^hinton2006] In that older setting, the central question was not yet about masks or dense maps. It was about whether a network could learn a useful latent representation of the input rather than merely memorize raw values. That is the conceptual origin of encoder-decoder thinking in vision: first as a mechanism for **representation learning**, and only later as a mechanism for **structured prediction**.[^rumelhart][^hinton2006]

## The core problem these models solve

A vision system becomes harder to design when the output is not a single label but an image-shaped object: a segmentation mask, a depth map, a denoised image, a restored image, a super-resolved image, or some other dense field. In those settings, the model cannot stay shallow and local, because local evidence is often ambiguous. A small patch may look like many things until the model sees larger context. But the model also cannot discard too much spatial detail, because the final output still needs to line up with the image. Encoder-decoder models exist because they offer a structured compromise: **compress to gain context, then reconstruct to recover structure**.[^fcn][^unet]

## The simplest end-to-end picture

The cleanest way to understand an encoder-decoder model is to imagine the data moving through a pipeline.

You begin with an image tensor, for example
$x \in \mathbb{R}^{H \times W \times C}$.
In a typical convolutional model, the first few layers produce feature maps that are still close to the original image grid. These early feature maps respond to local visual patterns such as edges, corners, simple textures, blobs, or contrast boundaries. As the model goes deeper, it repeatedly applies convolutions and downsampling operations such as max pooling or strided convolution. This reduces height and width while usually increasing channel depth. The model is gradually trading raw spatial detail for more abstract internal features.[^fcn]

A simplified progression might look like this:

- input: $256 \times 256 \times 3$
- early features: $256 \times 256 \times 64$
- after downsampling: $128 \times 128 \times 128$
- deeper features: $64 \times 64 \times 256$
- bottleneck: $32 \times 32 \times 512$

The exact numbers vary, but the trend is the same: **smaller in space, richer in channels, more abstract in meaning**. That spatial reduction is useful because deeper units effectively see larger regions of the original image. In other words, they have larger receptive fields and more context. This makes it easier for the network to understand objects, regions, and scene structure rather than isolated pixels.[^fcn]

## What the encoder is really doing

The encoder is often described as "extracting features," but that phrase is too vague to build a real mental model. More concretely, the encoder is building a **hierarchy of representations**. Early layers preserve fine spatial layout but know little about meaning. Deeper layers know much more about meaning but represent the image more coarsely. So the encoder's real job is to convert a raw image into a set of internal tensors that are progressively better at answering semantic questions.

This is why classification backbones became so useful in later dense-vision systems. A good encoder already knows how to organize visual information into increasingly meaningful features. The problem is that classification alone only needs a final label. Dense vision needs the model to come back down and produce a spatial answer. That is where the decoder enters.[^fcn]

## Why the bottleneck matters

In many encoder-decoder models, the middle of the network acts like a bottleneck or latent code. This bottleneck is useful because it forces the model to summarize the input in a compact internal form. That idea is inherited directly from autoencoders. In deep autoencoders, the network learned a low-dimensional code that still preserved enough structure to reconstruct the original input. The existence of a small central layer pushed the model to learn internal structure rather than simply pass everything through unchanged.[^hinton2006]

But in dense vision, the bottleneck is also dangerous. If the model compresses too aggressively, fine spatial details can disappear. Boundaries blur. Small objects vanish. Thin structures become hard to reconstruct. This is one of the central tensions in encoder-decoder design: the bottleneck helps semantic abstraction, but too much compression harms localization. Much of the history of encoder-decoder vision models can be read as different attempts to manage that tension.[^unet]

## What the decoder is really doing

The decoder is not simply "the encoder in reverse." That is too simplistic. Its real job is to take coarse, semantically rich internal features and transform them into the output representation required by the task.

If the task is semantic segmentation, the decoder must produce a dense class prediction for each pixel or location. If the task is image restoration, it must reconstruct a clean image. If the task is depth estimation, it must produce a scalar depth value at each output location. If the task is object detection in a transformer-style model, it may decode a set of object queries rather than rebuild a full image grid.

So the decoder is best understood as an **output constructor**. It takes a compressed semantic representation and reorganizes it into a structured answer. In classical convolutional systems, this often means upsampling: increasing spatial resolution stage by stage, then refining the feature map with convolution. In other systems, it may mean attention-based decoding, query decoding, or masked reconstruction.[^fcn][^detr][^mae]

## The canonical dense-prediction flow

The classical convolutional encoder-decoder became especially important once computer vision moved from image classification to dense prediction. A major turning point was the Fully Convolutional Network, or FCN. FCN showed that classification-style convolutional networks could be adapted into pixel-to-pixel predictors by removing fixed fully connected endpoints and producing spatial outputs directly. The key architectural insight was that dense prediction could be learned end to end, and that coarse semantic information from deeper layers could be combined with finer information from shallower layers for better localization.[^fcn]

U-Net made this logic even clearer. It formalized a contracting path and an expanding path. The contracting path collects context through downsampling. The expanding path recovers localization through upsampling. Most importantly, U-Net introduced a very explicit skip-connection strategy: features from the encoder at a given spatial scale are copied to the decoder at the matching scale. This gives the decoder access to both coarse semantic information and fine spatial detail at the same time. That design became especially influential in biomedical imaging, where thin structures, boundaries, and small objects matter a great deal.[^unet]

Seen end to end, a segmentation forward pass looks like this:

1. The input image enters the encoder.
2. Each encoder block extracts richer features and usually downsamples them.
3. The deepest layers contain the strongest context but the coarsest spatial resolution.
4. The decoder upsamples the representation step by step.
5. At each stage, the decoder may fuse in encoder features from the same scale through a skip connection.
6. A final projection layer maps the last feature tensor into output channels, often one per class.
7. A sigmoid or softmax converts those channels into probabilities.
8. The loss compares those predictions with the ground-truth target map.
9. Backpropagation updates both encoder and decoder weights so the next forward pass produces better spatial predictions.[^rumelhart][^fcn]

That is the mechanical heart of the classical encoder-decoder model.

## Why skip connections changed the field

Without skip connections, a model that compresses too much often produces overly smooth outputs. The reason is simple: once fine detail has been destroyed by repeated downsampling, the decoder has to guess it back from coarse semantic features. That usually works poorly for boundaries and small structures.

Skip connections fix this by directly passing high-resolution encoder information to the decoder. Instead of asking the bottleneck to preserve everything, the architecture allows the model to preserve different kinds of information at different depths. Deep layers can focus on context and semantics. Shallow layers can preserve detail. The decoder then fuses them. This is one of the clearest examples of architecture expressing an information-flow decision rather than just stacking more layers blindly.[^fcn][^unet]

## Other ways researchers tried to solve the same problem

U-Net is not the only answer. SegNet proposed a different decoder mechanism in which pooling indices from the encoder are reused during decoding. Instead of copying full feature maps, the decoder uses the remembered locations of maxima from max pooling to guide nonlinear upsampling. This makes a different tradeoff between memory use and reconstruction detail.[^segnet]

Feature Pyramid Networks, or FPN, approach the same broader issue from a multi-scale perspective. They use top-down pathways and lateral connections to build semantically strong features at several resolutions. Although FPN is more often discussed in detection than in pure encoder-decoder segmentation language, it expresses the same core design concern: how do we combine high-level semantics with fine-resolution structure?[^fpn]

## The transformer era changed the meaning of "decoder"

When transformers entered vision, the encoder-decoder idea did not disappear, but the meaning of the decoder started to change.

Vision Transformer, or ViT, showed that an image could be split into patches, embedded as tokens, and processed with transformer self-attention. In ViT, the heavy lifting is mainly done by an encoder-like token-processing stack. The representation is global and sequence-based rather than based purely on spatial convolution.[^vit]

DETR then introduced a transformer encoder-decoder architecture for object detection, but the decoder was no longer reconstructing an image-sized map. Instead, it decoded a fixed set of learned object queries into object predictions. This was a major conceptual shift. In older convolutional encoder-decoder systems, the decoder usually meant "recover spatial resolution." In DETR, the decoder meant "turn image representation into a structured set of objects." So the encoder-decoder pattern survived, but the type of output being decoded changed.[^detr]

SETR made that shift explicit from the segmentation side. It described most existing segmentation systems as FCN-style encoder-decoder architectures, then proposed a transformer-based alternative with a simple decoder. The important point is not that the encoder-decoder idea vanished. It is that the division of labor became more flexible. The encoder increasingly became the heavy representation learner, while the decoder often became lighter and more task-specific.[^setr]

Mask2Former pushed this even further. It used masked attention and transformer-based decoding to address semantic, instance, and panoptic segmentation with a unified architecture. Again, the decoder was not simply a pixel upsampler in the old sense. It was a structured prediction module operating through attention and mask reasoning.[^mask2former]

## Self-supervised learning brought back the autoencoder idea

One of the most important modern evolutions is the Masked Autoencoder, or MAE. MAE returns to the original reconstruction spirit of autoencoders, but in a much more scalable form. The input image is split into patches, many patches are masked out, the encoder processes only the visible subset, and a lightweight decoder reconstructs the missing content. The paper explicitly emphasizes an **asymmetric encoder-decoder** design: a strong encoder for representation learning and a lightweight decoder used mainly during pretraining.[^mae]

This is an important change in how to think about decoders. In a classical U-Net, the decoder is central at inference time because the final output depends on it. In MAE, the decoder is often mainly a training instrument. After pretraining, the encoder is usually the part kept for downstream tasks. That means the decoder has become, in some settings, a temporary device for forcing the model to learn good representations rather than a permanent part of deployment.[^mae]

## Generative vision kept the pattern alive too

Encoder-decoder thinking also remains central in modern image generation. Latent diffusion models rely on an autoencoding stage that compresses images into a latent space and later decodes them back into image space. The reason is efficiency: diffusion directly in pixel space is expensive, while latent space can preserve perceptually meaningful structure at much lower cost. In this setting, the encoder-decoder acts as a learned interface between image space and a more efficient internal generative space.[^ldm]

So even when the visible "main model" is a diffusion process, encoder-decoder structure still matters. It has simply moved into the representation layer surrounding the generative core.

## Promptable foundation models changed the decoder again

Segment Anything, or SAM, introduced another modern version of the decoder idea. SAM is built around promptable segmentation: the model takes an image plus prompts such as points, boxes, or masks, and produces a segmentation mask. This means the decoder is no longer just reconstructing pixels or only predicting fixed outputs. It is turning **image representation plus external guidance** into a spatial answer.[^sam]

SAM 2 extended that idea to both images and videos, adding streaming memory for real-time video processing. This again expands what the decoder side of a vision system can mean. The architecture is still performing a form of structured decoding, but now it is interactive, prompt-conditioned, and temporally aware.[^sam2]

## What stayed constant across all these changes

The most important thing to understand is that encoder-decoder models are not one fixed architecture. They are a recurring solution to an information-allocation problem.

The encoder is responsible for building a useful internal representation.
The decoder is responsible for turning that representation into the output form the task demands.
The tension between abstraction and detail never goes away.

What changes across eras is:

- how aggressively the model compresses
- what information it preserves along the way
- how the decoder receives that information
- what kind of object the decoder is expected to produce

In early autoencoders, the decoder reconstructed the input.[^hinton2006]
In FCN and U-Net, it reconstructed dense spatial predictions.[^fcn][^unet]
In SegNet and FPN-like designs, it recovered structure through alternative multi-scale mechanisms.[^segnet][^fpn]
In DETR, it decoded object queries.[^detr]
In MAE, it reconstructed masked patches during pretraining.[^mae]
In latent diffusion, it mapped latent variables back into image space.[^ldm]
In SAM, it turned image features and prompts into masks.[^sam]

That is why the idea keeps returning. The field changes, tasks change, and model families change, but the need to separate **understanding** from **structured output construction** keeps reappearing.

## Closing perspective

The most useful way to think about encoder-decoder models today is not as a narrow historical family, but as a durable design pattern. Whenever a vision system must gather broad context, reason over learned internal structure, and then emit a rich output rather than a single label, some version of encoder-decoder logic tends to appear. Sometimes it is symmetric and obvious, like U-Net. Sometimes it is asymmetric and mostly useful during training, like MAE. Sometimes it is query-based, like DETR. Sometimes it is promptable, like SAM. But the core engineering idea remains the same: **compress what matters, preserve what must not be lost, and decode into the form the task actually needs.**

## References

[^rumelhart]: Rumelhart, Hinton, and Williams. "Learning Representations by Back-Propagating Errors." *Nature* 323, 1986. [https://www.nature.com/articles/323533a0](https://www.nature.com/articles/323533a0)

[^hinton2006]: Hinton and Salakhutdinov. "Reducing the Dimensionality of Data with Neural Networks." *Science* 313, 2006. [https://dbirman.github.io/learn/hierarchy/pdfs/Hinton2006.pdf](https://dbirman.github.io/learn/hierarchy/pdfs/Hinton2006.pdf)

[^fcn]: Long, Shelhamer, and Darrell. "Fully Convolutional Networks for Semantic Segmentation." CVPR 2015. [https://www.cv-foundation.org/openaccess/content_cvpr_2015/papers/Long_Fully_Convolutional_Networks_2015_CVPR_paper.pdf](https://www.cv-foundation.org/openaccess/content_cvpr_2015/papers/Long_Fully_Convolutional_Networks_2015_CVPR_paper.pdf)

[^unet]: Ronneberger, Fischer, and Brox. "U-Net: Convolutional Networks for Biomedical Image Segmentation." 2015. [https://arxiv.org/abs/1505.04597](https://arxiv.org/abs/1505.04597)

[^segnet]: Badrinarayanan, Kendall, and Cipolla. "SegNet: A Deep Convolutional Encoder-Decoder Architecture for Image Segmentation." 2015. [https://arxiv.org/abs/1511.00561](https://arxiv.org/abs/1511.00561)

[^fpn]: Lin et al. "Feature Pyramid Networks for Object Detection." CVPR 2017. [https://openaccess.thecvf.com/content_cvpr_2017/papers/Lin_Feature_Pyramid_Networks_CVPR_2017_paper.pdf](https://openaccess.thecvf.com/content_cvpr_2017/papers/Lin_Feature_Pyramid_Networks_CVPR_2017_paper.pdf)

[^vit]: Dosovitskiy et al. "An Image Is Worth 16x16 Words: Transformers for Image Recognition at Scale." 2020. [https://arxiv.org/abs/2010.11929](https://arxiv.org/abs/2010.11929)

[^detr]: Carion et al. "End-to-End Object Detection with Transformers." 2020. [https://arxiv.org/abs/2005.12872](https://arxiv.org/abs/2005.12872)

[^setr]: Zheng et al. "Rethinking Semantic Segmentation from a Sequence-to-Sequence Perspective with Transformers." 2020. [https://arxiv.org/abs/2012.15840](https://arxiv.org/abs/2012.15840)

[^mask2former]: Cheng et al. "Masked-Attention Mask Transformer for Universal Image Segmentation." CVPR 2022. [https://openaccess.thecvf.com/content/CVPR2022/papers/Cheng_Masked-Attention_Mask_Transformer_for_Universal_Image_Segmentation_CVPR_2022_paper.pdf](https://openaccess.thecvf.com/content/CVPR2022/papers/Cheng_Masked-Attention_Mask_Transformer_for_Universal_Image_Segmentation_CVPR_2022_paper.pdf)

[^mae]: He et al. "Masked Autoencoders Are Scalable Vision Learners." CVPR 2022. [https://openaccess.thecvf.com/content/CVPR2022/papers/He_Masked_Autoencoders_Are_Scalable_Vision_Learners_CVPR_2022_paper.pdf](https://openaccess.thecvf.com/content/CVPR2022/papers/He_Masked_Autoencoders_Are_Scalable_Vision_Learners_CVPR_2022_paper.pdf)

[^ldm]: Rombach et al. "High-Resolution Image Synthesis with Latent Diffusion Models." CVPR 2022. [https://openaccess.thecvf.com/content/CVPR2022/papers/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.pdf](https://openaccess.thecvf.com/content/CVPR2022/papers/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.pdf)

[^sam]: Kirillov et al. "Segment Anything." ICCV 2023. [https://openaccess.thecvf.com/content/ICCV2023/papers/Kirillov_Segment_Anything_ICCV_2023_paper.pdf](https://openaccess.thecvf.com/content/ICCV2023/papers/Kirillov_Segment_Anything_ICCV_2023_paper.pdf)

[^sam2]: Ravi et al. "SAM 2: Segment Anything in Images and Videos." 2024. [https://arxiv.org/abs/2408.00714](https://arxiv.org/abs/2408.00714)
