---
title: "Software layers for reproducible ML experimentation"
slug: "software-layers-for-reproducible-ml-experimentation"
summary: "How Hydra, Pydantic, and PyTorch help make machine learning runs easier to define, validate, rerun, and audit."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
in_draft: false
tags:
  - Reproducibility
  - Hydra
  - Pydantic
  - PyTorch
  - System Design
sortOrder: 41
relatedProjects:
  - microscopy-benchmark-pipeline
---

Reliable experimentation is not only about careful evaluation design. It is also about software structure. A model can be trained on a clean split and still produce hard-to-trust results if the run configuration is implicit, the resolved inputs are loosely typed, or the execution path depends on uncontrolled randomness. Reproducibility starts to become practical when those layers are made explicit. Hydra, Pydantic, and PyTorch are useful here because they each address a different part of the problem: defining the experiment, validating the experiment, and executing the experiment under controlled conditions.[^hydra-defaults][^pydantic-base-model][^pytorch-randomness]

The distinction matters because reproducibility is not one thing. A run can fail to reproduce because the wrong config was selected, because the config shape drifted silently, or because the runtime followed a different random path. Those are different failure modes, and they need different kinds of software help. Hydra is strongest when the problem is configuration composition. Pydantic is strongest when the problem is schema and boundary validation. PyTorch is strongest when the problem is execution-time randomness and algorithm choice.[^hydra-defaults][^pydantic-base-model][^pytorch-randomness]

## Hydra: making experiment definition explicit

Hydra is useful in ML because it treats configuration as a compositional system rather than as one large file. Its config groups define valid choices, and its defaults list tells Hydra how to build the final output config from those choices. That gives an experiment a clear configuration path: not just a bag of settings, but a sequence of selections that resolves into one concrete run definition.[^hydra-defaults]

This becomes especially valuable once experiments have several moving parts. A project may need to vary model architecture, dataset configuration, split policy, trainer settings, and runtime behavior independently. Hydra makes those axes easier to reason about because they can live in separate config groups and be composed together only at run time. The resulting run is still concrete, but it is assembled from reusable pieces rather than rewritten from scratch.[^hydra-defaults]

<figure>
  <video controls preload="metadata" playsinline>
    <source src="/videos/writing/hydra-config-composition.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <figcaption>
    Hydra config composition walkthrough. The animation starts at task/train.yaml, follows the defaults chain into experiment/baseline_unet.yaml, resolves each selected config group, and merges the result into one concrete run config.
  </figcaption>
</figure>

Hydra also makes an important distinction between two kinds of change. Its override grammar treats config-group overrides as changes to the defaults list, while ordinary field overrides manipulate the composed config object. That difference is useful in experiments because replacing one trainer or model config is not the same kind of change as editing a learning rate or batch size inside an already selected structure.[^hydra-overrides]

For reproducibility, one of Hydra's quieter strengths is that it can create a new output directory for each run and preserve config snapshots and logs there. That does not make a result scientifically correct by itself, but it does leave behind a clearer record of what the run actually was. In practice, that makes configuration drift easier to spot and reruns easier to audit.[^hydra-working-dir]

## Pydantic: turning resolved config into a typed contract

If Hydra answers "what config did this run select?", Pydantic answers "is the resolved result structurally valid enough for the runtime to trust?" Pydantic models are `BaseModel` classes with annotated fields, and they exist to define and enforce schema. In an experimentation system, that means the resolved config no longer has to travel through the codebase as a loose dictionary. It can become a typed object graph with explicit field names, defaults, constraints, and validation behavior.[^pydantic-base-model]

That boundary matters because configuration composition is necessarily flexible. A composed config may still contain missing keys, outdated field names, invalid combinations, or unexpected extras. Pydantic narrows that flexibility into a runtime contract through methods such as `model_validate()`, which construct validated model instances from input data, and `model_dump()`, which serialize model instances back into structured output. The effect is that the same schema layer can be used both when an experiment begins and when its artifacts are written out.[^pydantic-base-model]

Pydantic is also helpful because it supports controlled compatibility. Aliases allow one schema to accept multiple input names for the same canonical field, and `validation_alias` can use tools such as `AliasChoices` when older and newer naming conventions both need to load cleanly. That is particularly useful in research code, where experiment schemas tend to evolve over time while old configs and saved artifacts still need to remain readable.[^pydantic-alias]

The same is true for extra fields. Pydantic's model configuration can ignore, forbid, or allow unexpected inputs. That lets an experimentation system be strict where strictness is valuable, while still preserving compatibility in long-lived metadata or artifact formats when needed. Structural discipline does not have to mean brittleness.[^pydantic-config]

Under the hood, Pydantic v2 separates model definition from validation and serialization. Model classes are defined in Python, while the actual validation and serialization work is handled by `pydantic-core`. That architecture is one reason Pydantic fits well as a boundary layer: the schema stays readable to the developer, while enforcement is delegated to a dedicated validation engine.[^pydantic-architecture]

## PyTorch: controlling execution-time variation

Once an experiment has been defined and validated, reproducibility becomes an execution problem. This is the layer PyTorch addresses. PyTorch's reproducibility guidance is refreshingly clear that completely reproducible results are not guaranteed across releases, commits, platforms, or even CPU and GPU runs. That warning is important because it keeps reproducibility grounded in reality rather than mythology.[^pytorch-randomness]

Still, PyTorch provides several important control surfaces. The first is random number generation. Seeding PyTorch's RNG makes weight initialization, dropout, and other stochastic operations start from a controlled state. PyTorch's documentation also notes that other randomness sources, such as Python's `random` module and NumPy, should be seeded separately when they participate in the pipeline.[^pytorch-randomness]

The second is deterministic execution. PyTorch allows applications to request deterministic algorithms where possible, reducing one major source of run-to-run drift. Its documentation also warns that deterministic execution is often slower than nondeterministic execution, which is a useful reminder that reproducibility is usually a tradeoff rather than a free feature.[^pytorch-randomness]

The third is backend behavior, especially around data loading and GPU kernels. PyTorch's reproducibility notes explicitly recommend using a seeded `Generator` together with `worker_init_fn()` to make multi-worker `DataLoader` behavior more repeatable. This matters because model randomness is only one part of the story. A run whose model is seeded but whose data order or worker-local randomness changes between executions is still only partially controlled.[^pytorch-randomness]

So PyTorch's contribution is not that it can promise identical training forever. Its contribution is that it makes key sources of computational variation explicit enough to be managed. That is often the difference between a run that feels mysterious and a run that can be debugged.[^pytorch-randomness]

## How these layers fit together

Taken together, these three tools support different parts of the same discipline. Hydra makes the path from command to final experiment config explicit. Pydantic turns that resolved config into a typed contract the runtime can trust structurally. PyTorch then executes the run under controlled sources of randomness and deterministic settings where possible. Each layer narrows a different class of ambiguity.[^hydra-defaults][^pydantic-base-model][^pytorch-randomness]

That layering is useful because it separates concerns that are often blurred in research code. Configuration composition is not the same thing as schema validation. Schema validation is not the same thing as runtime determinism. Treating them as separate software responsibilities makes the whole experimentation system easier to reason about and easier to extend without introducing accidental instability.

## What this still does not solve

None of these tools can rescue a weak experiment design. Hydra can make a split policy reproducible, but it cannot by itself prove that the split is leakage-free. Pydantic cannot tell whether a metric is scientifically appropriate. PyTorch cannot guarantee identical results across machines, libraries, and hardware generations. Software structure helps by reducing accidental ambiguity, but it does not replace judgment about data, evaluation, and scientific interpretation.[^pytorch-randomness]

That is why it helps to think of reproducibility less as exact sameness and more as controlled evidence. A good system makes it clear what was asked for, what was accepted as valid, and how the computation was constrained. When those things are explicit, repeated runs become much more useful: not because they are magically identical, but because they are close enough to test whether the conclusion still holds.

## Closing thought

The deeper lesson is that reproducibility in ML is partly a software architecture problem. A trustworthy run needs more than a fixed seed. It needs an experiment definition that can be composed cleanly, a schema boundary that prevents silent drift, and an execution layer that exposes the main sources of randomness rather than hiding them. Hydra, Pydantic, and PyTorch do not solve the whole problem, but together they make a serious attempt possible.[^hydra-defaults][^pydantic-base-model][^pytorch-randomness]

## References

[^hydra-defaults]: Hydra Documentation. "The Defaults List." [https://hydra.cc/docs/advanced/defaults_list/](https://hydra.cc/docs/advanced/defaults_list/)

[^hydra-overrides]: Hydra Documentation. "Basic Override syntax." [https://hydra.cc/docs/advanced/override_grammar/basic/](https://hydra.cc/docs/advanced/override_grammar/basic/)

[^hydra-working-dir]: Hydra Documentation. "Output/Working directory." [https://hydra.cc/docs/tutorials/basic/running_your_app/working_directory/](https://hydra.cc/docs/tutorials/basic/running_your_app/working_directory/)

[^pydantic-base-model]: Pydantic Documentation. "BaseModel." [https://docs.pydantic.dev/latest/api/base_model/](https://docs.pydantic.dev/latest/api/base_model/)

[^pydantic-alias]: Pydantic Documentation. "Alias." [https://docs.pydantic.dev/latest/concepts/alias/](https://docs.pydantic.dev/latest/concepts/alias/)

[^pydantic-config]: Pydantic Documentation. "Configuration." [https://docs.pydantic.dev/latest/api/config/](https://docs.pydantic.dev/latest/api/config/)

[^pydantic-architecture]: Pydantic Documentation. "Architecture." [https://docs.pydantic.dev/latest/internals/architecture/](https://docs.pydantic.dev/latest/internals/architecture/)

[^pytorch-randomness]: PyTorch Documentation. "Reproducibility." [https://docs.pytorch.org/docs/stable/notes/randomness.html](https://docs.pytorch.org/docs/stable/notes/randomness.html)
