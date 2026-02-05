# Ch 5 - Deep Dive Tools (Tool Cards as Mini-Essays)

Modular again: one tool per section.

## Tool card template
- What problem it solves (and what it doesn’t)
- Inputs/outputs and expected conventions
- Common pitfalls (data types, normalization, coordinate systems)
- Performance concerns (CPU vs GPU, memory)
- How we’ll integrate it cleanly (wrappers, adapters, version pinning)
- Minimal example workflow (conceptual; code later)

## Tools likely to have cards
- scikit-image baselines (Otsu/watershed pipeline)
- simple U-Net stack (PyTorch or similar)
- Cellpose-like wrapper (optional)
- Allen 3D segmentation tooling (reference baseline)
- registration tooling (conceptual, even if v1 skips full ANTs pipelines)
- reporting stack (Markdown/HTML generator approach)

## Deliverables
- Tool cards folder: `docs/books/microscopy-segmentation-benchmark/tools/`
