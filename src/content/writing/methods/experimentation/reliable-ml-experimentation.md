---
title: "Reliable ML experimentation"
slug: "reliable-ml-experimentation"
summary: "Why trustworthy ML experimentation starts with protected evaluation, simple baselines, controlled reruns, direct data inspection, and artifacts that preserve evidence."
featureImage: "/images/entry-previews/writing-detail.svg"
category: "method"
series: "Experiment Design"
listed: true
in_draft: false
tags:
  - Reproducibility
  - System Design
  - Tooling
sortOrder: 40
relatedProjects:
  - microscopy-benchmark-pipeline
---

The goal of ML experimentation is not to produce the highest score you can find, but to build a process that tells you whether a score is worth believing. We do care about model quality, of course, but first make sure the experiment itself is capable of producing trustworthy evidence. That is why so much experienced guidance, from Google's engineering rules to PyTorch's reproducibility notes, focuses on evaluation discipline, simple baselines, repeatability, and system design rather than only on model cleverness.[^rules-ml][^pytorch-randomness]

## The real problem is not just how to train a model

A more useful question is: **How do I design an experiment so that improvement means something?** If a result comes from leakage, duplicated examples, a worn-out validation set, a lucky seed, or an untracked config change, then the model may not have improved at all. Only the illusion of progress improved. Google's guidance on dataset splitting is very direct here: evaluation should be on separate data, validation and test sets can wear out with repeated use, and duplicates between training and evaluation can make results look better than they are.[^dataset-splits]

That is why reliable experimentation is best understood as a measurement discipline. Training is part of it, but measurement comes first. Before asking whether a new idea helps, you want to know whether the experimental setup is clean enough to detect real change. Google's tuning playbook makes the same point in practice by recommending that teams start from a simple configuration, improve incrementally, and accept only changes backed by strong evidence.[^tuning-scientific]

If you want trustworthy conclusions, the first thing to protect is the evaluation. Train, validation, and test are not just administrative folders; they play different roles. Training teaches the model. Validation helps you choose between ideas. Test is the final check on whether your conclusions still hold on data that has stayed mostly untouched. When the same validation or test set is reused again and again to make decisions, it slowly stops behaving like fresh evidence. Google explicitly warns that both validation and test sets wear out with repeated use and may need refreshing.[^dataset-splits]

This sounds simple, but it has deep consequences. You have to choose the right split unit, remove duplicates, make sure the evaluation set is representative of the real problem, and define leakage before you start tuning. A split that looks technically correct can still be scientifically weak if related examples, temporal leakage, or preprocessing mistakes let training information seep into evaluation. That is why mature practice treats the split as part of the experiment design, not as a quick preprocessing step.[^dataset-splits]

## Start simple enough to learn

Google's Rules of ML says to keep the first model simple and get the infrastructure right, and the tuning playbook says to begin projects with proven architectures and common optimizers, then aim for a simple initial configuration that already performs reasonably on the validation set. The reason is not conservatism for its own sake. Simplicity makes it easier to see what is happening.[^rules-ml][^tuning-new-project]

A simple baseline does several quiet but important jobs. It tells you whether the pipeline works at all. It gives you a fair reference point for future changes. It shows whether complexity is buying meaningful gains or only adding noise and maintenance cost. The ML Test Score rubric explicitly recommends regular comparison against a very simple baseline model, precisely because sophistication can hide problems instead of solving them.[^ml-test-score]

The same goes for objectives. Early on, it helps to choose a metric that is simple, observable, and attributable. Google's Rules of ML recommends exactly that for the first objective. This does not mean the metric captures everything that matters. It means the metric is clear enough to let the team reason about whether the training setup is actually improving anything.[^rules-ml]

## Reproducibility means controlled uncertainty

It is helpful to be gentle but honest here: reproducibility in modern ML is not absolute. PyTorch's own documentation states that completely reproducible results are not guaranteed across releases, commits, platforms, or even CPU and GPU executions, including cases with identical seeds. That warning matters because it keeps people from treating one run as sacred truth.[^pytorch-randomness]

But the lesson is not that reproducibility is impossible. The lesson is that you should reduce unnecessary randomness and record enough context that another run, or another person, can reasonably check your conclusion. PyTorch recommends controlling sources of randomness and using deterministic algorithms when needed, even though this can trade off performance for consistency. In practice, treat reproducibility as a spectrum: same code, same data, same config, same environment, similar outcome, same conclusion.[^pytorch-randomness]

That is a healthier standard for research code too. The aim is not magical sameness. The aim is that your result does not depend on hidden state, forgotten tweaks, or one unusually lucky run.

## Look at the data directly, not only at the dashboard

One of the most important lessons in experienced ML writing is that summary metrics hide a lot. Google's Good Data Analysis guide recommends looking at richer distribution views, considering noise carefully, inspecting concrete examples, and slicing the data into meaningful subgroups instead of trusting a single aggregate number.[^good-data-analysis]

This matters because many experimental mistakes are visible in examples before they are visible in summary statistics. A misparsed field, broken label mapping, strange augmentation artifact, minority-slice collapse, or edge-case failure may barely move the top-line metric at first. But once you inspect examples and slice behavior, the problem becomes obvious. Google's guidance is especially clear that whenever you write new analysis code, you should look at actual examples and check how the code interprets them.[^good-data-analysis]

The same mindset extends to data validation over time. TensorFlow Data Validation is built around checking whether data conforms to expectations and detecting training-serving skew and span-to-span drift. That is a formal version of a very old lesson: if the data distribution changes quietly, your experiment can stay numerically neat while becoming conceptually wrong.[^tfdv]

## Treat data, code, and configuration as one system

An experiment is not just a model plus a dataset, but a whole system made of data generation, preprocessing, configuration, training code, evaluation code, logging, artifact storage, and human decisions. The ML Test Score rubric makes this explicit by organizing ML reliability around tests for features and data, model development, infrastructure, and monitoring.[^ml-test-score]

That idea pairs naturally with the "hidden technical debt" paper, which warns that ML systems often accumulate costly system-level debt through data dependencies, configuration issues, hidden feedback loops, entanglement, and changing external conditions. The warning is not just about messy code. It is about how easy it is for ML systems to become fragile when the surrounding pipeline is treated as incidental.[^hidden-debt]

So from a software-design point of view, reliable experimentation usually means a few quiet disciplines: config-driven runs, versioned datasets and splits, explicit preprocessing, small tests for the pipeline, reviewable code, and artifacts that can be traced back to the run that created them. The ML Test Score rubric goes as far as recommending full-pipeline integration tests that run from original data sources through feature creation, training, and serving.[^ml-test-score]

## Train in a way that preserves evidence

Once the experimental frame is sound, training itself becomes easier to reason about. Google's tuning playbook recommends fast initial iteration, beginning with standard architectures and optimizers, using a simple configuration with reasonable validation performance, and then tuning scientifically rather than by scattered intuition. It also recommends short early rounds for insight, followed by a small number of longer runs for final candidates.[^tuning-new-project][^tuning-scientific]

A particularly mature piece of advice is to separate the budget of the run from the choice of the final checkpoint. Google recommends periodic evaluation during training and retrospective checkpoint selection, noting that the best checkpoint is often not the last one. It also recommends saving enough information from evaluation to support offline analysis, including predictions on selected examples, because those artifacts are valuable for debugging.[^tuning-pipeline]

This is such a useful mindset for research code. Instead of asking only, "Did training finish?" you ask, "What evidence did this run leave behind?" A good run leaves metrics, configs, checkpoints, example predictions, notes, and enough context that you can compare it fairly with the next run. Google's playbook is blunt that untracked experiments might as well not exist.[^tuning-pipeline]

## What this adds up to

Reliable ML experimentation means building a process where:

- the evaluation is protected
- the first system is simple enough to understand
- the data is inspected directly and in slices
- repeated runs are controlled enough to support the same conclusion
- and the whole pipeline is treated as software, not as a pile of scripts

When those pieces are in place, "empirically correct" starts to mean something concrete. It means a careful reader could look at your setup and believe that the reported gain is more likely to reflect real model behavior than leakage, drift, randomness, or confusion in the pipeline. That is the kind of result worth building on.[^dataset-splits][^tuning-scientific]

## A checklist to carry forward

Before trusting an experiment, it helps to ask five calm questions:

1. **Is the evaluation still clean?** Separate roles for train, validation, and test; no duplicates; no silent leakage; no worn-out holdouts.[^dataset-splits]
2. **Is there a simple baseline that makes the result interpretable?** Start simple, compare often, and do not let complexity outrun understanding.[^rules-ml][^ml-test-score]
3. **Can someone rerun this well enough to check the conclusion?** Control randomness where possible and capture the environment, config, and code.[^pytorch-randomness]
4. **Did I look at real examples and slices, not just one metric?** Inspect distributions, examples, subgroup behavior, skew, and drift.[^good-data-analysis][^tfdv]
5. **Did the run leave a trace?** Checkpoints, notes, metrics, configs, and artifacts should be logged in a way that supports later comparison.[^tuning-pipeline]

That is the heart of it. The best experimentation systems do not merely produce models. They produce believable evidence.

## References

[^rules-ml]: Zinkevich, M. "Rules of Machine Learning: Best Practices for ML Engineering." Google for Developers. [https://developers.google.com/machine-learning/guides/rules-of-ml](https://developers.google.com/machine-learning/guides/rules-of-ml)

[^dataset-splits]: Google for Developers. "Datasets: Dividing the original dataset." [https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets)

[^tuning-scientific]: Google for Developers. "A scientific approach to improving model performance." [https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/scientific](https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/scientific)

[^tuning-new-project]: Google for Developers. "Guide for starting a new project." [https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/new-project](https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/new-project)

[^tuning-pipeline]: Google for Developers. "Additional guidance for the training pipeline." [https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/additional-guidance](https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook/additional-guidance)

[^pytorch-randomness]: PyTorch Documentation. "Reproducibility." [https://docs.pytorch.org/docs/stable/notes/randomness.html](https://docs.pytorch.org/docs/stable/notes/randomness.html)

[^good-data-analysis]: Google for Developers. "Good Data Analysis." [https://developers.google.com/machine-learning/guides/good-data-analysis](https://developers.google.com/machine-learning/guides/good-data-analysis)

[^tfdv]: TensorFlow. "TensorFlow Data Validation: Checking and analyzing your data." [https://www.tensorflow.org/tfx/guide/tfdv](https://www.tensorflow.org/tfx/guide/tfdv)

[^hidden-debt]: Sculley, D. et al. "Hidden Technical Debt in Machine Learning Systems." NeurIPS (2015). [https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf](https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)

[^ml-test-score]: Breck, E. et al. "What's your ML test score? A rubric for ML production systems." Reliable Machine Learning in the Wild, NIPS 2016 Workshop. [https://research.google.com/pubs/archive/45742.pdf](https://research.google.com/pubs/archive/45742.pdf)
