# Ch 3 - Deep Dive Datasets (Dataset Cards as Mini-Essays)

This chapter is modular: one section per dataset.

## Dataset card template
- Origin + scientific intent ("what question is this dataset for?")
- Imaging modality + acquisition quirks
- Annotation protocol + what ground truth means
- File formats + channels + metadata
- Typical failure modes (where algorithms break)
- What "good segmentation" means here
- Recommended baselines + expected metric ranges (rough)

## Deliverables
- Dataset cards folder: `docs/books/microscopy-segmentation-benchmark/datasets/`
- Finalized list of 2–3 datasets for v1 implementation

## Notes
BBBC is a candidate, not a default. It stays only if it scores well on the axes and offers clean ground truth + variety.
