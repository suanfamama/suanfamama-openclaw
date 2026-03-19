import {
  buildFashionImagePrompt,
  type FashionAgeBand,
  type FashionBackground,
  type FashionBodyType,
  type FashionFraming,
  type FashionLookDirection,
  type FashionModelPresentation,
  type FashionStylePreset,
  type FashionVisualTone,
  type FashionWorkflowMode,
} from "../../../src/image-generation/fashion-prompt-builder.js";
import { getSafeLocalStorage } from "../local-storage.ts";
import { isSupportedChatAttachmentMimeType } from "./chat/attachment-support.ts";
import type { ChatAttachment } from "./ui-types.ts";

export type FashionWorkflowFormState = {
  mode: FashionWorkflowMode;
  productName: string;
  category: string;
  garmentDetails: string;
  stylePreset: FashionStylePreset;
  background: FashionBackground;
  framing: FashionFraming;
  tone: FashionVisualTone;
  presentation: FashionModelPresentation;
  ageBand: FashionAgeBand;
  bodyType: FashionBodyType;
  lookDirection: FashionLookDirection;
  notes: string;
};

export const FASHION_REFINE_CHIPS = [
  "Keep garment closer to original",
  "More realistic fabric",
  "Cleaner commercial look",
  "More luxurious lighting",
  "Stronger editorial styling",
  "Simpler background",
  "More natural model pose",
  "Show product details better",
] as const;

function generateAttachmentId(): string {
  return `fashion-att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type FashionOption<T extends string> = {
  value: T;
  label: string;
};

export const FASHION_MODE_OPTIONS: FashionOption<FashionWorkflowMode>[] = [
  { value: "model-styling", label: "Model Styling" },
  { value: "campaign", label: "Campaign" },
  { value: "product-detail", label: "Product Detail" },
  { value: "variant-preview", label: "Variant Preview" },
];

export const FASHION_STYLE_PRESET_OPTIONS: FashionOption<FashionStylePreset>[] = [
  { value: "minimal-luxury", label: "Minimal Luxury" },
  { value: "contemporary-streetwear", label: "Contemporary Streetwear" },
  { value: "resort", label: "Resort" },
  { value: "editorial-high-fashion", label: "Editorial High Fashion" },
  { value: "clean-ecommerce", label: "Clean Ecommerce" },
  { value: "department-store-catalog", label: "Department Store Catalog" },
];

export const FASHION_BACKGROUND_OPTIONS: FashionOption<FashionBackground>[] = [
  { value: "white-studio", label: "White Studio" },
  { value: "soft-neutral-studio", label: "Soft Neutral Studio" },
  { value: "runway", label: "Runway" },
  { value: "city-street", label: "City Street" },
  { value: "luxury-interior", label: "Luxury Interior" },
  { value: "resort-exterior", label: "Resort Exterior" },
];

export const FASHION_FRAMING_OPTIONS: FashionOption<FashionFraming>[] = [
  { value: "full-body", label: "Full Body" },
  { value: "three-quarter", label: "Three-Quarter" },
  { value: "waist-up", label: "Waist-Up" },
  { value: "detail-close-up", label: "Detail Close-Up" },
];

export const FASHION_TONE_OPTIONS: FashionOption<FashionVisualTone>[] = [
  { value: "commercial", label: "Commercial" },
  { value: "balanced", label: "Balanced" },
  { value: "editorial", label: "Editorial" },
];

export const FASHION_PRESENTATION_OPTIONS: FashionOption<FashionModelPresentation>[] = [
  { value: "womenswear", label: "Womenswear" },
  { value: "menswear", label: "Menswear" },
  { value: "unisex", label: "Unisex" },
];

export const FASHION_AGE_BAND_OPTIONS: FashionOption<FashionAgeBand>[] = [
  { value: "young-adult", label: "Young Adult" },
  { value: "adult", label: "Adult" },
  { value: "mature", label: "Mature" },
];

export const FASHION_BODY_TYPE_OPTIONS: FashionOption<FashionBodyType>[] = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "curve", label: "Curve" },
  { value: "athletic", label: "Athletic" },
];

export const FASHION_LOOK_DIRECTION_OPTIONS: FashionOption<FashionLookDirection>[] = [
  { value: "neutral", label: "Neutral" },
  { value: "luxury", label: "Luxury" },
  { value: "street", label: "Street" },
  { value: "avant-garde", label: "Avant-Garde" },
];

const FASHION_WORKFLOW_STORAGE_KEY = "openclaw.control.fashion-workflow.v1";

const FASHION_MODE_DEFAULTS: Record<
  FashionWorkflowMode,
  Pick<FashionWorkflowFormState, "background" | "framing" | "tone" | "stylePreset">
> = {
  "model-styling": {
    background: "soft-neutral-studio",
    framing: "three-quarter",
    tone: "commercial",
    stylePreset: "minimal-luxury",
  },
  campaign: {
    background: "luxury-interior",
    framing: "full-body",
    tone: "editorial",
    stylePreset: "editorial-high-fashion",
  },
  "product-detail": {
    background: "white-studio",
    framing: "detail-close-up",
    tone: "commercial",
    stylePreset: "clean-ecommerce",
  },
  "variant-preview": {
    background: "soft-neutral-studio",
    framing: "three-quarter",
    tone: "balanced",
    stylePreset: "department-store-catalog",
  },
};

export function createDefaultFashionWorkflowFormState(): FashionWorkflowFormState {
  return {
    mode: "model-styling",
    productName: "",
    category: "",
    garmentDetails: "",
    stylePreset: "minimal-luxury",
    background: "soft-neutral-studio",
    framing: "three-quarter",
    tone: "commercial",
    presentation: "womenswear",
    ageBand: "adult",
    bodyType: "regular",
    lookDirection: "luxury",
    notes: "",
  };
}

export function applyFashionWorkflowModeDefaults(
  state: FashionWorkflowFormState,
  mode: FashionWorkflowMode,
): FashionWorkflowFormState {
  return {
    ...state,
    mode,
    ...FASHION_MODE_DEFAULTS[mode],
  };
}

export function loadFashionWorkflowFormState(): FashionWorkflowFormState {
  const defaults = createDefaultFashionWorkflowFormState();
  const storage = getSafeLocalStorage();
  try {
    const raw = storage?.getItem(FASHION_WORKFLOW_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<FashionWorkflowFormState>;
    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    return defaults;
  }
}

export function saveFashionWorkflowFormState(state: FashionWorkflowFormState) {
  const storage = getSafeLocalStorage();
  try {
    storage?.setItem(FASHION_WORKFLOW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort
  }
}

function splitGarmentDetails(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function buildFashionWorkflowPromptPreview(state: FashionWorkflowFormState): string {
  return buildFashionImagePrompt({
    mode: state.mode,
    productName: state.productName.trim() || undefined,
    category: state.category.trim() || undefined,
    garmentDetails: splitGarmentDetails(state.garmentDetails),
    stylePreset: state.stylePreset,
    background: state.background,
    framing: state.framing,
    tone: state.tone,
    presentation: state.presentation,
    ageBand: state.ageBand,
    bodyType: state.bodyType,
    lookDirection: state.lookDirection,
    notes: state.notes.trim() || undefined,
  });
}

export function buildFashionWorkflowChatMessage(state: FashionWorkflowFormState): string {
  const prompt = buildFashionWorkflowPromptPreview(state);
  return [
    "Use image_generate for this fashion workflow.",
    "If garment photos are available, use them as reference images and generate 4 candidates.",
    "",
    prompt,
  ].join("\n");
}

export function applyFashionRefineChip(
  state: FashionWorkflowFormState,
  chip: (typeof FASHION_REFINE_CHIPS)[number],
): FashionWorkflowFormState {
  const existingNotes = state.notes.trim();
  const nextNotes = existingNotes ? `${existingNotes}. ${chip}` : chip;
  return {
    ...state,
    notes: nextNotes,
  };
}

export async function filesToFashionAttachments(files: Iterable<File>): Promise<ChatAttachment[]> {
  const supported = [...files].filter((file) => isSupportedChatAttachmentMimeType(file.type));
  return Promise.all(
    supported.map(
      (file) =>
        new Promise<ChatAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            resolve({
              id: generateAttachmentId(),
              dataUrl: reader.result as string,
              mimeType: file.type,
            });
          });
          reader.addEventListener("error", () => {
            reject(reader.error ?? new Error(`Failed to read attachment: ${file.name}`));
          });
          reader.readAsDataURL(file);
        }),
    ),
  );
}
