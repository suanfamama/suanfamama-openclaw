export type FashionWorkflowMode =
  | "model-styling"
  | "campaign"
  | "product-detail"
  | "variant-preview";

export type FashionStylePreset =
  | "minimal-luxury"
  | "contemporary-streetwear"
  | "resort"
  | "editorial-high-fashion"
  | "clean-ecommerce"
  | "department-store-catalog";

export type FashionBackground =
  | "white-studio"
  | "soft-neutral-studio"
  | "runway"
  | "city-street"
  | "luxury-interior"
  | "resort-exterior";

export type FashionFraming = "full-body" | "three-quarter" | "waist-up" | "detail-close-up";

export type FashionVisualTone = "commercial" | "balanced" | "editorial";

export type FashionModelPresentation = "womenswear" | "menswear" | "unisex";
export type FashionAgeBand = "young-adult" | "adult" | "mature";
export type FashionBodyType = "slim" | "regular" | "curve" | "athletic";
export type FashionLookDirection = "neutral" | "luxury" | "street" | "avant-garde";

export type FashionPromptInput = {
  mode: FashionWorkflowMode;
  productName?: string;
  category?: string;
  garmentDetails?: string[];
  stylePreset: FashionStylePreset;
  background: FashionBackground;
  framing: FashionFraming;
  tone: FashionVisualTone;
  presentation?: FashionModelPresentation;
  ageBand?: FashionAgeBand;
  bodyType?: FashionBodyType;
  lookDirection?: FashionLookDirection;
  notes?: string;
};

const MODE_GOALS: Record<FashionWorkflowMode, string> = {
  "model-styling":
    "Create a polished fashion marketing image with a model wearing the referenced product.",
  campaign: "Create an aspirational campaign image featuring the referenced product.",
  "product-detail":
    "Create a clean retail-ready image that keeps visual focus on the referenced product.",
  "variant-preview":
    "Create a controlled styling or material variant preview for the referenced product.",
};

const PRESET_DIRECTIONS: Record<FashionStylePreset, string> = {
  "minimal-luxury":
    "quiet luxury, restrained styling, premium materials, understated sophistication",
  "contemporary-streetwear": "modern streetwear styling, urban confidence, current fashion energy",
  resort: "light resort styling, warm premium leisure mood, effortless polish",
  "editorial-high-fashion":
    "editorial high-fashion styling, elevated mood, dramatic but controlled presentation",
  "clean-ecommerce": "clean commercial styling, neutral lighting, product clarity first",
  "department-store-catalog":
    "commercial catalog styling, accessible polish, clear product presentation",
};

const BACKGROUND_DIRECTIONS: Record<FashionBackground, string> = {
  "white-studio": "white studio background",
  "soft-neutral-studio": "soft neutral studio background",
  runway: "runway-inspired setting",
  "city-street": "clean city street setting",
  "luxury-interior": "luxury interior setting",
  "resort-exterior": "premium resort exterior setting",
};

const FRAMING_DIRECTIONS: Record<FashionFraming, string> = {
  "full-body": "full-body framing",
  "three-quarter": "three-quarter framing",
  "waist-up": "waist-up framing",
  "detail-close-up": "detail close-up framing",
};

function formatModelDirection(input: FashionPromptInput): string | null {
  if (input.mode === "product-detail") {
    return null;
  }
  const details = [input.presentation, input.ageBand, input.bodyType, input.lookDirection].filter(
    (
      value,
    ): value is
      | FashionModelPresentation
      | FashionAgeBand
      | FashionBodyType
      | FashionLookDirection => Boolean(value),
  );
  if (details.length === 0) {
    return input.mode === "model-styling" || input.mode === "campaign"
      ? "Use a believable fashion model suited to the styling direction."
      : null;
  }
  return `Model direction: ${details.join(", ")}.`;
}

function formatProductIdentity(input: FashionPromptInput): string {
  const parts = [input.productName, input.category].filter((value): value is string =>
    Boolean(value),
  );
  if (parts.length === 0) {
    return "The referenced item is the hero product.";
  }
  return `Hero product: ${parts.join(", ")}.`;
}

function formatGarmentDetails(input: FashionPromptInput): string | null {
  const details = (input.garmentDetails ?? []).map((value) => value.trim()).filter(Boolean);
  return details.length > 0 ? `Key garment details: ${details.join(", ")}.` : null;
}

export function buildFashionImagePrompt(input: FashionPromptInput): string {
  const lines = [
    MODE_GOALS[input.mode],
    formatProductIdentity(input),
    formatGarmentDetails(input),
    `Style direction: ${PRESET_DIRECTIONS[input.stylePreset]}.`,
    `Scene: ${BACKGROUND_DIRECTIONS[input.background]}.`,
    `Composition: ${FRAMING_DIRECTIONS[input.framing]} with a ${input.tone} fashion tone.`,
    formatModelDirection(input),
    input.mode === "variant-preview"
      ? "Preserve the original shape and construction while varying only approved styling, color, or material cues."
      : "Preserve the garment's core silhouette, recognizable construction, and overall identity from the reference images.",
    "Keep fabric behavior believable and avoid distorted logos, labels, hardware, or prints.",
    "Keep the product visible, marketable, and aligned with the requested workflow mode.",
    input.notes?.trim() ? `Additional notes: ${input.notes.trim()}.` : null,
  ];
  return lines.filter((value): value is string => Boolean(value)).join("\n");
}
