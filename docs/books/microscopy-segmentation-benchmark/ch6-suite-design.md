# Ch 6 - The Benchmark Suite Design (HLD of the System)

Bridge between knowledge and code.

## Core architecture
- Dataset loaders (unified interface)
- Method runners (baselines/models as plugins)
- Metric engine (unit-tested, consistent conventions)
- Report generator (overlays + CSV + HTML/Markdown)
- CLI UX (`micseg run`, `micseg eval`)

## Key design decisions
- Canonical internal data model (image, mask, instance labels)
- Config system (YAML/TOML + CLI overrides)
- Caching downloads + checksums
- Deterministic runs (seeds + version pinning)
- What runs in CI vs locally

## Deliverables
- Architecture diagram + component contracts
- Contribution guide skeleton (add dataset/method/metric)
