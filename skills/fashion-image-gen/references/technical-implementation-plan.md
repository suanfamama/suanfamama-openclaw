# Fashion MVP Technical Implementation Plan

## Goal

Build a thin fashion workflow layer on top of OpenClaw's native image-generation capability instead of introducing a separate generation stack.

## Existing Foundation

- `image_generate` is already the native image-generation tool.
- OpenClaw supports reference-image editing through the shared image-generation capability.
- Google-backed flows support multiple reference images.
- `fal` supports a single reference image edit flow.

## MVP System Shape

### Layer 1: Fashion workflow model

Add a structured fashion prompt builder that maps:

- workflow mode
- style preset
- background
- framing
- tone
- optional model direction
- garment details

into a stable image-generation prompt.

This layer should stay vendor-agnostic.

### Layer 2: Skill-driven orchestration

The `fashion-image-gen` skill should:

- classify the request into a supported mode
- extract missing required inputs
- choose the right reference-image strategy
- call `image_generate`
- score the outputs with a fashion quality rubric

### Layer 3: UI workflow

Later, wire the structured fashion fields into a dedicated UI flow:

- Upload
- Mode Select
- Style Setup
- Model Setup
- Generate Board
- Refine
- Export

The UI should submit structured values, not raw prompt fragments.

## Implementation Phases

### Phase 1

- Add the skill and reference docs
- Add a reusable TypeScript prompt builder
- Keep invocation agent-driven

### Phase 2

- Add a dedicated UI form or panel that collects fashion workflow fields
- Build board generation and refine chips on top of the prompt builder
- Persist presets and recent selections

### Phase 3

- Add stronger garment-preservation workflows
- Add collection batch mode
- Add consistent model/look continuity across a set

### Phase 4

- Define a real `virtual-tryon` capability if exact garment transfer becomes a requirement
- Keep this separate from generic image generation

## Backend Mapping

Recommended default model strategy:

- primary: `google/gemini-3-pro-image-preview`
- fallback: `fal/fal-ai/flux/dev`
- optional second fallback: `openai/gpt-image-1`

Reference-image guidance:

- multiple garment photos: prefer Google-backed edit flows
- one strong hero image: `fal` can be acceptable
- no edits needed: any configured provider can be used

## Quality Gates

Auto-reject or regenerate obvious failures:

- anatomy breaks
- garment silhouette drift
- unrealistic fabric rendering
- broken logos or text
- styling that obscures the product
- scene mismatch with the chosen workflow mode

## Non-Goals For MVP

- fit-accurate virtual try-on
- guaranteed garment transfer fidelity
- video generation
- exact model identity continuity
