import { describe, expect, it } from "vitest";
import {
  applyFashionRefineChip,
  applyFashionWorkflowModeDefaults,
  buildFashionWorkflowChatMessage,
  buildFashionWorkflowPromptPreview,
  createDefaultFashionWorkflowFormState,
} from "../ui/src/ui/fashion-workflow.ts";

describe("fashion workflow helpers", () => {
  it("builds a prompt preview from form state", () => {
    const form = createDefaultFashionWorkflowFormState();
    form.productName = "Pleated wool midi skirt";
    form.category = "skirt";
    form.garmentDetails = "knife pleats, midi length, charcoal wool";

    const preview = buildFashionWorkflowPromptPreview(form);
    expect(preview).toContain("Pleated wool midi skirt");
    expect(preview).toContain("knife pleats, midi length, charcoal wool");
  });

  it("builds a chat message that instructs image_generate usage", () => {
    const form = createDefaultFashionWorkflowFormState();
    const message = buildFashionWorkflowChatMessage(form);
    expect(message).toContain("Use image_generate for this fashion workflow.");
    expect(message).toContain("generate 4 candidates");
  });

  it("creates default form state for model-styling", () => {
    const form = createDefaultFashionWorkflowFormState();
    expect(form.mode).toBe("model-styling");
    expect(form.stylePreset).toBe("minimal-luxury");
  });

  it("appends refine chip text into notes", () => {
    const form = createDefaultFashionWorkflowFormState();
    const next = applyFashionRefineChip(form, "More realistic fabric");
    expect(next.notes).toContain("More realistic fabric");
  });

  it("applies campaign mode defaults", () => {
    const form = createDefaultFashionWorkflowFormState();
    const next = applyFashionWorkflowModeDefaults(form, "campaign");
    expect(next.background).toBe("luxury-interior");
    expect(next.framing).toBe("full-body");
    expect(next.tone).toBe("editorial");
  });
});
