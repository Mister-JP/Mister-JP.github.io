# Ch 7 - Implementation + Results + Scaling (The Final Build)

## Implementation milestones
- Dataset ingestion for v1 slate
- Baselines: Otsu / watershed
- Model: simple U-Net (training or inference-only)
- Optional: Cellpose-like wrapper
- Metrics: Dice/IoU, boundary F1, object-count error
- Outputs: overlays, CSV, report
- CLI: `micseg run`, `micseg eval`
- Tests + CI smoke run (2 images)

## Results
- Per-dataset summary tables
- Qualitative overlays + failure mode commentary
- "What we learned" section

## Scaling story (high level)
- Local batch → GPU acceleration → distributed possibilities
- What changes for cluster/cloud (data layout, chunking, job orchestration)

## Deliverables
- v1 release tag
- Final capstone blog tied to the job description
