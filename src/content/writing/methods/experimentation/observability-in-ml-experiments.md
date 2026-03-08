---
title: "Observability in ML experiments"
slug: "observability-in-ml-experiments"
summary: "Why trustworthy ML training needs more than loss curves: stable metric semantics, structured logging, qualitative inspection, and run records that make behavior legible over time."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
in_draft: false
tags:
  - Observability
  - Experiment Design
  - TorchMetrics
  - TensorBoard
  - Tooling
sortOrder: 41
relatedProjects:
  - microscopy-benchmark-pipeline
---
A training run can finish successfully and still tell you very little. The loss may go down. A validation score may improve a little. A dashboard may look busy and reassuring. But none of that guarantees that the run is easy to interpret. If the metric semantics are inconsistent, if the logged history is sparse or ambiguous, or if qualitative behavior is invisible, then the experiment is not very observable even if it is heavily instrumented.[^torchmetrics-overview][^tensorboard]

My earlier thinking about reliable ML experimentation was mainly about protecting conclusions: clean evaluation, controlled reruns, preserved artifacts, and simple baselines. This piece is narrower. It is about observability inside the experiment itself. What should the software layer expose so that a training run becomes legible while it is happening and interpretable afterward?

Two tools sit near the center of that question in many PyTorch projects. TorchMetrics helps standardize how metrics are defined and computed, and for stateful metric objects it supports accumulation and synchronization behavior across batches and devices. TensorBoard provides the live surface where scalar histories, images, and other summaries become inspectable over time through event logs. Used well, they do not solve all of experimentation. But they do make the run much easier to see.[^torchmetrics-overview][^torchmetrics-metric][^tensorboard]

## Observability is not the same as reproducibility

It helps to separate these ideas early. Reproducibility asks whether a conclusion can be checked again under controlled conditions. Observability asks whether the run can be understood in the first place. A system can be partially reproducible and still be hard to interpret. It can also be highly instrumented and still be misleading if the emitted signals are not stable or meaningful.[^pytorch-randomness][^torchmetrics-overview]

That distinction matters because a surprising amount of ML debugging is really observability work. A run diverges late. Validation stops improving while training keeps falling. One data slice collapses while the aggregate metric stays acceptable. A model starts producing visually worse outputs before the top-line number reveals it. None of those problems are solved by “log more stuff” alone. They are solved by designing a measurement layer that makes the right behavior visible at the right level of detail.

So the question is not just whether a run leaves behind artifacts. It is whether those artifacts let you answer practical questions such as: what exactly was measured, when did behavior change, which split produced the signal, and what did the predictions actually look like at that point in training.

## What observability means in an ML training system

In ordinary software systems, observability usually means being able to infer internal behavior from emitted signals. In ML experiments, those signals are different. They include metric histories, per-split summaries, qualitative examples, step and epoch context, and the artifact trail that ties those signals back to a particular run.[^tensorboard][^hydra-intro]

For me, that leads to three useful layers of observability.

First, there is **measurement observability**: what exactly is being computed, how it is reduced, and whether the number means the same thing across code paths. Second, there is **temporal observability**: how behavior changes over steps and epochs, not just what the final score happened to be. Third, there is **qualitative observability**: what the model is actually producing, where it fails, and whether visible failure modes agree with the scalar summaries.

That is why observability in ML is not just “have a dashboard.” A dashboard with unstable metric semantics is not very informative. A stable metric with no time history is hard to debug. A clean scalar history with no qualitative inspection can hide some of the most important failures. Good observability needs all three layers to work together.


## What TorchMetrics contributes

TorchMetrics is useful here because it tries to turn metric computation into a more disciplined software layer. The library presents itself as a collection of metric implementations with a standardized interface, reduced boilerplate, automatic accumulation over batches, and automatic synchronization between multiple devices for metric classes.[^torchmetrics-overview][^torchmetrics-quickstart]

That matters more than the convenience alone. In a loosely organized codebase, metric logic often becomes a scattering of helper functions and inline calculations. In a more disciplined setup, metric computation becomes explicit: a known implementation, a known lifecycle, and a known place where state is accumulated and finalized. TorchMetrics helps push projects toward the second pattern.

The strongest version of that idea appears in the `Metric` base class. The documentation describes it as handling transfer of metric states to the correct device, synchronization of metric states across processes, and the overall behavior of the metric and its states. The intended custom-metric pattern is to register state with `add_state`, update it in `update`, derive the final value in `compute`, and rely on the base class to handle reset behavior.[^torchmetrics-metric][^torchmetrics-implement]

That design matters because many useful metrics are not well represented by a loose “compute something on each batch and average it later” habit. Some need sufficient statistics accumulated over time. Others need a carefully defined reduction rule. Observability improves when the software makes that accumulation path explicit rather than leaving it implicit inside the training loop.

TorchMetrics is therefore helpful not because it magically makes an experiment correct, but because it makes metric computation harder to improvise badly. It reduces the number of places where metric meaning can silently drift.

## The important nuance: functional metrics and metric objects are not the same

This distinction is easy to miss and worth stating clearly. TorchMetrics offers both a functional API and stateful metric classes, but they do not contribute the same way.

The metric classes carry their own distributed synchronization logic. In Lightning’s integration docs, this point is stated very directly: the metric class contains its own distributed synchronization logic, but this is only true for metrics that inherit from the base `Metric` class. The functional metric API does not provide built-in distributed synchronization or reduction functions.[^torchmetrics-lightning]

That is an important design boundary. If you use the functional API, TorchMetrics still helps by giving canonical formulas and reducing ad hoc implementation drift. But accumulation policy, epoch aggregation, and distributed consistency are still design responsibilities in your own training code. If you use `Metric` objects, TorchMetrics helps at a deeper layer because the state model itself becomes part of the metric abstraction.

For observability, that means the contribution of TorchMetrics comes in degrees. At the lighter end, it standardizes formulas. At the deeper end, it standardizes the lifecycle of measurement.

## What TensorBoard contributes

If TorchMetrics helps define the number, TensorBoard helps preserve the history of the number.

PyTorch’s TensorBoard integration centers on `SummaryWriter`, which writes entries directly to event files under a log directory to be consumed by TensorBoard. The docs describe it as a high-level API for creating event files, adding summaries and events, and updating file contents asynchronously so logging can happen from the training loop without slowing training too much.[^tensorboard]

That is the key mental model. TensorBoard is not just a graphing tool bolted onto training. It is a structured event-log surface for the run. Scalars, images, and other summaries become time-indexed records that can be inspected while the run is active and revisited later through the same event stream.[^tensorboard]

This is especially useful because training behavior is temporal. A final metric does not tell you whether the model improved steadily, became unstable halfway through, overfit late, or produced a short-lived period of better predictions that disappeared by the end. TensorBoard makes those transitions visible. It turns “what happened during training?” from a vague memory into something you can inspect.

The PyTorch docs also recommend hierarchical tag naming such as `Loss/train` and `Loss/test` so related plots stay grouped together. That may sound cosmetic, but it is really part of the schema of the run record. A good observability layer does not just emit values. It names them in a way that keeps their meaning stable and their comparisons readable.[^tensorboard]

## Scalar curves are not enough

The most common observability failure in ML is to assume that train loss and validation loss are the whole story. They are not.

Scalar curves are useful because they compress a lot of behavior into a compact view. But that compression is also their limit. They show trend more easily than mechanism. They may reveal that something changed without revealing what changed.

That is why observability improves when scalar logging is paired with richer summaries. TensorBoard supports not only scalars but also images and other structured artifacts through the same logging interface.[^tensorboard] In practice, that matters because many of the most important ML failures are easier to see than to summarize. A model may blur structure, collapse a minority slice, produce unstable masks, or drift in a visually obvious way long before a single aggregate metric makes the problem unmistakable.

This is one reason I do not think of TensorBoard as merely “a place to put loss curves.” At its best, it is the live surface of the experiment: the place where time-series behavior and qualitative behavior meet.

## The division of labor between TorchMetrics and TensorBoard

The cleanest way to think about the two tools is this:

TorchMetrics helps define and compute the number correctly. TensorBoard helps preserve and inspect the history of the number.

Or, said a little differently: TorchMetrics is the **measurement layer**, while TensorBoard is the **observation layer**.[^torchmetrics-overview][^tensorboard]

That division of labor is useful because it keeps each tool honest. TensorBoard cannot rescue unstable metric semantics. It will happily visualize measurements that were defined inconsistently. TorchMetrics, on the other hand, cannot give you temporal or qualitative visibility by itself. A well-defined metric that is never logged in a structured way is still hard to interpret during training.

Observability improves when both layers are treated carefully. The metric has to mean something stable. The run history has to be visible in a form that supports comparison and debugging.


## What good observability looks like in practice

At a practical level, good observability usually has a few recognizable qualities.

There is one canonical path for computing a given metric, rather than several slightly different implementations spread across training, evaluation, and notebooks. There is a clear distinction between per-step and per-epoch reporting. Train, validation, and test signals are kept separate and named consistently. Scalar summaries are paired with richer views when the task demands them. And the logs live inside a run structure that preserves enough context to make comparison possible later.[^torchmetrics-overview][^tensorboard][^hydra-intro]

That is the quiet software value of these tools. They do not make the experiment intelligent. They make it legible.

## Boundaries that still matter

It is worth being explicit about what these tools do **not** solve.

TorchMetrics does not make training deterministic. PyTorch’s reproducibility notes are very clear that completely reproducible results are not guaranteed across releases, commits, platforms, or even CPU and GPU executions, even with identical seeds in some cases.[^pytorch-randomness] So metric discipline is not the same thing as full runtime reproducibility.

TensorBoard is not the source of truth by itself. It is a structured logging and visualization surface built on event files and asynchronous writes. That makes it powerful and lightweight enough for live monitoring, but it also means it should be treated as part of a broader run-record system rather than as the whole experiment archive.[^tensorboard]

And again, the functional TorchMetrics API does not carry the same distributed and stateful guarantees as `Metric` objects. If the experiment relies on the functional path, then part of the observability burden still lives in the surrounding training code.[^torchmetrics-lightning]

Those boundaries do not reduce the value of the tools. They just clarify where their value actually lies.

## What this adds up to

Observability in ML experiments starts before the dashboard and extends beyond it. It starts when metric computation becomes stable enough to trust, continues when run history is logged in a structured and inspectable way, and becomes much stronger when qualitative behavior is visible alongside scalar summaries.

That is why TorchMetrics and TensorBoard are useful together. TorchMetrics helps turn measurement into a more explicit software layer. TensorBoard helps turn training history into something that can be watched, compared, and revisited. Hydra helps keep those signals attached to a concrete run definition. None of that guarantees a perfect experiment. But it does make the run much easier to understand.

And that is a meaningful engineering goal in its own right. A good experiment system should not only produce final numbers. It should make the behavior that produced those numbers visible enough that someone can inspect it, question it, and learn from it.

## References

[^torchmetrics-overview]: TorchMetrics documentation, overview and quickstart materials.

[^torchmetrics-quickstart]: TorchMetrics documentation, quickstart.

[^torchmetrics-metric]: TorchMetrics documentation, `torchmetrics.Metric` reference.

[^torchmetrics-implement]: TorchMetrics documentation, custom metric implementation guide.

[^torchmetrics-lightning]: TorchMetrics documentation, Lightning integration notes on `Metric` objects versus the functional API.

[^tensorboard]: PyTorch documentation, `torch.utils.tensorboard` and `SummaryWriter`.

[^hydra-intro]: Hydra documentation, introduction and configuration model.

[^pytorch-randomness]: PyTorch documentation, reproducibility notes.
