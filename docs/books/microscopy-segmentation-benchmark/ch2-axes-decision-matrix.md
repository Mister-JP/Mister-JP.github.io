# Ch 2 - The Selection Axes and Decision Matrix

This is the backbone that keeps the project from drifting.

## Dataset axes
- Modality: fluorescence / phase-contrast / brightfield / histology / calcium imaging / EM
- Dimensionality: 2D / 3D / 2D+t / 3D+t
- Label type: semantic vs instance vs counts vs tracks
- Scale: tiny (CI-friendly) vs medium vs huge
- Format friction: PNG/TIF masks vs OME-TIFF / zarr / multi-channel stacks
- Task fit: cells vs nuclei vs organelles vs neurons
- Evaluation fit: instance metrics? boundary metrics?
- Relevance to job: segmentation + (optionally) registration/tracking adjacency
- License + accessibility: easy download + permissive usage

## Outputs
- Decision matrix template (dataset cards scored on axes)
- Final v1 dataset slate (e.g., 2D easy + 2D harder + optional 3D)
