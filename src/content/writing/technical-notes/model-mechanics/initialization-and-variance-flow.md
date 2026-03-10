---
title: "Initialization and variance flow"
slug: "initialization-and-variance-flow"
summary: "How initialization controls signal and gradient scale, why Xavier and Kaiming rules exist, and what later theory adds about criticality and Jacobian conditioning."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "technical-note"
series: "Model Mechanics"
listed: true
in_draft: false
tags:
  - Optimization
  - Initialization
  - Signal Propagation
sortOrder: 5
relatedProjects: []
---
Weight initialization is easiest to misunderstand when it is described only as a way to "pick starting values." That is true, but it misses the important part. A deep network does not use its weights once. It uses them repeatedly, layer after layer, in both the forward pass and the backward pass. Initialization therefore sets the starting scale of signal transport through the network. If that scale is wrong, the model begins training in a regime where activations become too small or too large as depth increases, and gradients in backpropagation suffer the same fate. Glorot and Bengio framed this as a trainability problem tied to activation scale and Jacobian behavior, and later work made the propagation view even more explicit.[^glorot]

## Weighted sums and fan-in

The key idea is that every layer performs a weighted sum. Before any nonlinearity is applied, one output coordinate looks like

$$
z_j = \sum_{i=1}^{n_{\text{in}}} W_{ji} x_i.
$$

This equation is simple, but it already contains the whole initialization story. The output is determined by three things: the size of the incoming activations $x_i$, the size of the weights $W_{ji}$, and the number of terms being added. That last quantity, the number of incoming terms, is the fan-in. If a neuron sums many independent contributions, the total spread of the sum grows unless each contribution is scaled down. So fan-in is not a naming detail. It is the reason weight scale must depend on layer width.[^glorot]

To make that concrete, suppose the inputs are centered around zero and have variance $q$, and the weights are also centered around zero with variance $\sigma_w^2$. Under the standard independence approximation used in initialization theory, the variance of one output coordinate is approximately

$$
\mathrm{Var}(z_j) \approx n_{\text{in}} \sigma_w^2 q.
$$

This is the first equation worth really understanding. It says that a layer does not preserve scale automatically. It multiplies scale by roughly $n_{\text{in}} \sigma_w^2$. If that factor is larger than 1, the typical squared size of the activations grows from one layer to the next. If it is smaller than 1, the activations shrink. So if the goal is to keep the forward signal at roughly the same scale across layers, the natural requirement is

$$
n_{\text{in}} \sigma_w^2 \approx 1
\qquad \Rightarrow \qquad
\sigma_w^2 \approx \frac{1}{n_{\text{in}}}.
$$

This is the conceptual origin of fan-in scaling. The weights must get smaller as the number of incoming terms grows, otherwise the sum becomes larger simply because there are more things being added.[^glorot]

This matters because deep networks repeat that scaling many times. If one layer multiplies the typical activation variance by 1.1, then after $L$ layers the effect is roughly $1.1^L$. If it multiplies variance by 0.9, the effect is roughly $0.9^L$. The local mismatch may look mild, but depth turns it into a large distortion. This is what people mean when they say activations "explode" or "vanish." They are not describing a mysterious pathology. They are describing repeated multiplicative scaling across depth. Schoenholz and colleagues formalized this by showing that random deep networks have propagation regimes where information dies out, regimes where it becomes chaotic, and a narrow critical region where it can travel much deeper.[^deepinfo]

## The backward pass and fan-out

The backward pass has the same structure. For the linear layer $z = Wx$, backpropagation sends the gradient backward as

$$
g_x = W^\top g_z,
$$

where $g_z = \partial L / \partial z$ is the upstream gradient and $g_x = \partial L / \partial x$ is the gradient with respect to the input of the layer. If we zoom into one coordinate,

$$
(g_x)_i = \sum_{j=1}^{n_{\text{out}}} W_{ji} (g_z)_j.
$$

This is another weighted sum. The only difference is direction: in the forward pass, one output sums over many inputs; in the backward pass, one input coordinate collects contributions from many downstream outputs. That count is the fan-out. Under the same style of approximation as before, the gradient variance obeys

$$
\mathrm{Var}\left((g_x)_i\right) \approx n_{\text{out}} \sigma_w^2 \mathrm{Var}\left((g_z)_j\right).
$$

So backward signal scale is governed by fan-out in exactly the same way forward signal scale is governed by fan-in. If this factor is repeatedly below 1, gradients become tiny in early layers. If it is repeatedly above 1, gradients become too large and updates become unstable.[^glorot]

At this point the main difficulty becomes visible. A single layer lives in two worlds at once. Forward stability suggests choosing weight variance on the order of $1 / n_{\text{in}}$. Backward stability suggests choosing weight variance on the order of $1 / n_{\text{out}}$. These are related, but they are not identical in general. Xavier initialization is best understood as a compromise between those two requirements. Glorot and Bengio proposed scaling the weights so that

$$
\mathrm{Var}(W) \approx \frac{2}{n_{\text{in}} + n_{\text{out}}},
$$

which balances forward and backward propagation rather than treating either one in isolation. That is why Xavier initialization uses both fan-in and fan-out. It is not an arbitrary formula to memorize. It is a direct response to the fact that one layer must support stable transport in both directions.[^glorot]

## Why the activation function changes the rule

So far, though, we have still ignored the activation function. That omission matters. The weighted sum $z$ is not what gets fed directly into the next layer. The layer usually applies a nonlinearity first:

$$
a = \phi(z).
$$

This means initialization is not only trying to control the scale of $Wx$. It is trying to control the scale of $\phi(Wx)$. Different activations change the signal distribution in different ways. A nearly linear activation leaves scale relatively intact. A saturating activation can compress it. A rectifier like ReLU changes it in a very specific way by setting negative values to zero. That is why the right initialization depends on the nonlinearity, not just on the matrix dimensions.[^glorot]

This is where He initialization enters. For ReLU,

$$
\phi(z) = \max(0, z),
$$

and if the pre-activation $z$ is roughly zero-mean and symmetric, then about half of its mass is removed by the rectifier. He et al. showed that this changes the variance recurrence by an extra factor of about one half. To compensate, the weight variance should satisfy

$$
\frac{1}{2} n_{\text{in}} \sigma_w^2 \approx 1,
$$

which leads to

$$
\mathrm{Var}(W) \approx \frac{2}{n_{\text{in}}}.
$$

The extra factor of 2 is not a trick and not a historical convention. It is the mathematical correction for the variance lost through rectification. In other words, He initialization is the fan-in rule adjusted for the fact that ReLU changes the signal statistics after the weighted sum.[^he]

## Criticality, Jacobians, and signal geometry

This is also why initialization should be described as a signal propagation design choice, not just a random seed policy. Before training starts, the network is already a long chain of weighted sums and nonlinearities. Initialization chooses the distribution of those weights, which sets the typical size of forward activations and backward gradients, layer by layer. If the scale is too small, the network becomes progressively less responsive: activations weaken, representations collapse toward low-energy states, and early layers receive gradients too small to learn effectively. If the scale is too large, the network becomes progressively too sensitive: activations grow, small perturbations get amplified, and gradients become unstable. In both cases, the problem is the same at its core: repeated multiplicative distortion across depth.[^deepinfo]

A useful way to say this precisely, without overloading the reader with heavy notation, is that initialization is trying to keep the network near a regime where layerwise transformations neither systematically contract nor systematically amplify signal scale. Schoenholz et al. describe this as being near criticality or the edge of chaos: too contractive and information dies out, too expansive and it becomes unstable, sufficiently close to criticality and information can travel much farther. That language helps because it connects the algebra to an interpretable picture of trainability.[^deepinfo]

There is an even deeper geometric version of the story. The forward pass transports small perturbations through the Jacobian of the network, and backpropagation transports loss sensitivities through its transpose. If that end-to-end transformation crushes most directions, both forward distinctions and backward gradients disappear. If it stretches them too aggressively, both become unstable. This is why later theory moved beyond average variance alone and studied Jacobian conditioning more directly. Saxe et al. showed, in deep linear networks, that special orthogonal initial conditions can avoid some of the severe depth-dependent slowdown seen with generic random initializations. That result sharpened the broader lesson: good initialization is not only about average size, but about preserving useful signal geometry as depth increases.[^saxe]

## Convolutions follow the same logic

For vision models, the same logic applies directly to convolutions. A convolutional layer is still a weighted sum; it is just a structured one. The fan-in is the kernel height times kernel width times the number of input channels, so initialization still has to respect how many contributions are being aggregated into each output. That is why the same fan-in and fan-out logic developed for fully connected layers carries naturally into CNNs. The architecture changes, but the scale propagation problem does not.[^he]

## Implementation note

One practical mistake is to assume that a modern framework like PyTorch, Tensorflow, or Keras will silently choose the theoretically right initializer for the architecture you had in mind. Frameworks do initialize standard layers automatically, but their defaults are not identical across ecosystems, and they are not always the same as the textbook Xavier or He rules discussed in the literature.[^pytorch-linear][^keras-dense]

### PyTorch

In PyTorch, `nn.Linear` initializes its weights automatically, and the documentation states that the weights are drawn from a uniform distribution with bound $k = 1 / \sqrt{\text{in\_features}}$.[^pytorch-linear] The source code makes the implementation detail explicit: `Linear.reset_parameters()` calls `kaiming_uniform_(self.weight, a=math.sqrt(5))`, with a comment noting that this is equivalent to `uniform(-1/sqrt(in_features), 1/sqrt(in_features))`.[^pytorch-linear-source] That means PyTorch's built-in `Linear` default is not the usual ReLU-He initialization with variance $2 / \text{fan\_in}$; it is a narrower fan-in-style default chosen by the library implementation.[^pytorch-linear][^pytorch-linear-source]

PyTorch does expose explicit Xavier and Kaiming initializers through `torch.nn.init`. The docs describe `kaiming_uniform_` and `kaiming_normal_` as He initialization, note that `mode="fan_in"` preserves variance in the forward pass while `mode="fan_out"` preserves variance in the backward pass, and show ReLU-aware usage directly.[^pytorch-init]

So in PyTorch, the safe rule is simple: if initialization matters to your reasoning, set it explicitly rather than relying on the module default.

```python
import torch.nn as nn

def init_relu_he(module):
    if isinstance(module, (nn.Linear, nn.Conv1d, nn.Conv2d, nn.Conv3d)):
        nn.init.kaiming_uniform_(module.weight, mode="fan_in", nonlinearity="relu")
        if module.bias is not None:
            nn.init.zeros_(module.bias)

def init_xavier(module):
    if isinstance(module, (nn.Linear, nn.Conv1d, nn.Conv2d, nn.Conv3d)):
        nn.init.xavier_uniform_(module.weight)
        if module.bias is not None:
            nn.init.zeros_(module.bias)
```

### TensorFlow / Keras

Keras makes a different default choice. The `Dense` layer documentation lists `kernel_initializer="glorot_uniform"` and `bias_initializer="zeros"` as defaults, and `Conv2D` does the same.[^keras-dense][^keras-conv2d] The Keras initializer documentation defines `GlorotUniform` as Xavier uniform initialization with limit $\sqrt{6 / (\text{fan\_in} + \text{fan\_out})}$.[^keras-initializers]

Keras also provides explicit He initializers. The same initializer docs define `HeNormal` with standard deviation $\sqrt{2 / \text{fan\_in}}$ and `HeUniform` with limit $\sqrt{6 / \text{fan\_in}}$.[^keras-initializers] So in Keras, Dense and Conv layers default to a Xavier-style initializer unless you override them with a He-style choice.[^keras-dense][^keras-conv2d][^keras-initializers]

```python
from keras import initializers, layers

x = layers.Dense(
    256,
    activation="relu",
    kernel_initializer=initializers.HeUniform(),
    bias_initializer="zeros",
)(x)

x = layers.Conv2D(
    64,
    kernel_size=3,
    activation="relu",
    kernel_initializer=initializers.HeNormal(),
    bias_initializer="zeros",
)(x)
```

### What to do in practice

The implementation lesson is simple. If your architecture is strongly ReLU-based and your theoretical discussion is about preserving forward variance under rectification, use an explicit He or Kaiming initializer. If your architecture or discussion is framed around the Xavier compromise between fan-in and fan-out, set Xavier or Glorot explicitly. Do not assume that framework defaults and theory are the same thing just because both are automatic initialization. PyTorch and Keras make different default choices, and those defaults encode different assumptions about how scale should propagate at initialization.[^pytorch-linear][^pytorch-init][^keras-dense][^keras-initializers]

## What to remember

The most important takeaway is simple: initialization is trying to make the network numerically hospitable to learning before learning begins. In the forward pass, it tries to prevent activations from progressively shrinking or expanding as they move through depth. In the backward pass, it tries to prevent gradients from progressively shrinking or expanding as they return through depth. Xavier initialization does this by balancing fan-in and fan-out for roughly symmetric activations. He initialization modifies the rule for ReLU by accounting for the variance lost through rectification. Both are specific answers to the same underlying question: how should the weights be scaled so that repeated transformations do not destroy the signals the network needs in order to represent and to learn?[^glorot]

## References

[^glorot]: Glorot and Bengio. "Understanding the Difficulty of Training Deep Feedforward Neural Networks." AISTATS 2010. [https://proceedings.mlr.press/v9/glorot10a/glorot10a.pdf](https://proceedings.mlr.press/v9/glorot10a/glorot10a.pdf)

[^he]: He et al. "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification." ICCV 2015. [https://www.cv-foundation.org/openaccess/content_iccv_2015/papers/He_Delving_Deep_into_ICCV_2015_paper.pdf](https://www.cv-foundation.org/openaccess/content_iccv_2015/papers/He_Delving_Deep_into_ICCV_2015_paper.pdf)

[^deepinfo]: Schoenholz et al. "Deep Information Propagation." 2016. [https://arxiv.org/abs/1611.01232](https://arxiv.org/abs/1611.01232)

[^saxe]: Saxe, McClelland, and Ganguli. "Exact Solutions to the Nonlinear Dynamics of Learning in Deep Linear Neural Networks." 2013. [https://ganguli-gang.stanford.edu/pdf/DynamLearn.pdf](https://ganguli-gang.stanford.edu/pdf/DynamLearn.pdf)

[^pytorch-linear]: PyTorch documentation for `torch.nn.Linear`. [https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html](https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html)

[^pytorch-linear-source]: PyTorch source for `torch.nn.modules.linear.Linear.reset_parameters`. [https://raw.githubusercontent.com/pytorch/pytorch/v2.10.0/torch/nn/modules/linear.py](https://raw.githubusercontent.com/pytorch/pytorch/v2.10.0/torch/nn/modules/linear.py)

[^pytorch-init]: PyTorch documentation for `torch.nn.init`. [https://docs.pytorch.org/docs/stable/nn.init.html](https://docs.pytorch.org/docs/stable/nn.init.html)

[^keras-dense]: Keras documentation for `Dense`. [https://keras.io/api/layers/core_layers/dense/](https://keras.io/api/layers/core_layers/dense/)

[^keras-conv2d]: Keras documentation for `Conv2D`. [https://keras.io/api/layers/convolution_layers/convolution2d/](https://keras.io/api/layers/convolution_layers/convolution2d/)

[^keras-initializers]: Keras documentation for layer weight initializers. [https://keras.io/api/layers/initializers/](https://keras.io/api/layers/initializers/)
