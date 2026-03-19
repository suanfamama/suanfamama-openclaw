---
name: fashion-image-gen
description: Generate fashion marketing visuals and styling mockups from real garment or accessory photos using OpenClaw's native image-generation capability. Use when designers or buyers need campaign images, model styling previews, product-detail visuals, variant previews, or early virtual-try-on style mockups from one or more reference photos.
---

# Fashion Image Gen

Use this skill to turn product photos into fashion visuals without making the user write camera, lighting, or styling prompts from scratch.

This skill does not replace OpenClaw's image-generation runtime. It wraps the native `image_generate` tool with fashion-specific workflow selection, prompt structure, reference-image strategy, and quality review.

## Workflow

1. Classify the request into a workflow mode.
2. Extract the garment facts and output constraints from the user's photos and request.
3. Choose the right preset and reference-image edit strategy.
4. Generate a first board with `image_generate`.
5. Review the results for garment fidelity and marketing usefulness before returning them.

## Choose A Mode

- `model-styling`
  Use when the user wants a model wearing the product for polished marketing visuals. This is the closest current MVP mode to virtual try-on.
- `campaign`
  Use when the user wants aspirational advertising or lookbook-style images.
- `product-detail`
  Use when the user wants a cleaner commercial or ecommerce visual that keeps focus on the item.
- `variant-preview`
  Use when the user wants alternate color/material/styling directions from a real product photo.

When the user asks for exact fit simulation or guaranteed garment transfer accuracy, state clearly that this workflow creates marketing mockups, not production-accurate virtual try-on.

## Gather Inputs

Extract or ask for only the missing essentials:

- garment category
- one-line product name or description
- reference images available: front, back, detail, fabric, inspiration
- target mode
- style preset
- framing
- background
- commercial vs editorial tone
- optional model direction

Prefer presets over freeform prompt writing. If the user is vague, default to:

- mode: `model-styling`
- style preset: `minimal-luxury`
- framing: `three-quarter`
- background: `soft-neutral-studio`
- tone: `commercial`

## Use Native Image Generation

Use OpenClaw's built-in `image_generate` tool. Do not invent a parallel image stack inside the skill.

Preferred model strategy:

- primary: `google/gemini-3-pro-image-preview`
- fallback: `fal/fal-ai/flux/dev`
- optional second fallback: `openai/gpt-image-1`

For reference-image workflows:

- prefer Google-backed edit flows when multiple garment photos are available
- use `fal` when a single strong hero image is available
- do not choose OpenAI when reference-image edit behavior is required

Generate a first board with:

- `count: 4`
- a mode-specific prompt assembled from the references in this skill
- one or more reference images when the user provided product photos
- aspect ratio and resolution matched to the mode

## Review Before Returning

Before returning results, check the images against the rubric in [`references/quality-rubric.md`](references/quality-rubric.md).

If obvious failures appear, regenerate rather than handing bad outputs to the user:

- broken hands or limbs
- distorted garment edges
- implausible fabric behavior
- corrupted logos, labels, or patterns
- styling that hides the product too much
- scene mismatch with the chosen mode

## References

- Use [`references/mvp-ux-wireframes.md`](references/mvp-ux-wireframes.md) for the stored product and wireframe plan.
- Use [`references/technical-implementation-plan.md`](references/technical-implementation-plan.md) for the implementation roadmap and system boundaries.
- Use [`references/workflow-modes.md`](references/workflow-modes.md) to choose mode-specific defaults.
- Use [`references/prompt-recipes.md`](references/prompt-recipes.md) to build a concrete generation prompt.
- Use [`references/quality-rubric.md`](references/quality-rubric.md) to score and refine outputs.

## Asset

- Use [`assets/prompt-templates.json`](assets/prompt-templates.json) for compact preset names and reusable fragments when assembling prompts programmatically.
