import { describe, expect, it } from "vitest";
import { buildFashionImagePrompt } from "./fashion-prompt-builder.js";

describe("buildFashionImagePrompt", () => {
  it("builds a model-styling prompt with garment preservation and model guidance", () => {
    const prompt = buildFashionImagePrompt({
      mode: "model-styling",
      productName: "Satin bias-cut slip dress",
      category: "dress",
      garmentDetails: ["cowl neckline", "ankle length", "liquid satin finish"],
      stylePreset: "minimal-luxury",
      background: "soft-neutral-studio",
      framing: "three-quarter",
      tone: "commercial",
      presentation: "womenswear",
      ageBand: "adult",
      bodyType: "slim",
      lookDirection: "luxury",
      notes: "show graceful drape and premium sheen",
    });

    expect(prompt).toContain("model wearing the referenced product");
    expect(prompt).toContain("Hero product: Satin bias-cut slip dress, dress.");
    expect(prompt).toContain(
      "Key garment details: cowl neckline, ankle length, liquid satin finish.",
    );
    expect(prompt).toContain("Model direction: womenswear, adult, slim, luxury.");
    expect(prompt).toContain("Preserve the garment's core silhouette");
    expect(prompt).toContain("Additional notes: show graceful drape and premium sheen.");
  });

  it("keeps product-detail prompts product-first and omits model direction", () => {
    const prompt = buildFashionImagePrompt({
      mode: "product-detail",
      productName: "Structured leather tote",
      category: "bag",
      stylePreset: "clean-ecommerce",
      background: "white-studio",
      framing: "detail-close-up",
      tone: "commercial",
    });

    expect(prompt).toContain("clean retail-ready image");
    expect(prompt).toContain("Hero product: Structured leather tote, bag.");
    expect(prompt).not.toContain("Model direction:");
    expect(prompt).toContain("white studio background");
  });

  it("uses variant-preview language for controlled changes", () => {
    const prompt = buildFashionImagePrompt({
      mode: "variant-preview",
      productName: "Boxy cropped jacket",
      category: "jacket",
      stylePreset: "department-store-catalog",
      background: "soft-neutral-studio",
      framing: "three-quarter",
      tone: "balanced",
    });

    expect(prompt).toContain("controlled styling or material variant preview");
    expect(prompt).toContain(
      "Preserve the original shape and construction while varying only approved styling, color, or material cues.",
    );
  });
});
