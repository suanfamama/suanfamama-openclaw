import { afterEach, describe, expect, it, vi } from "vitest";
import * as modelAuth from "../../agents/model-auth.js";

const sharedProviderMocks = vi.hoisted(() => ({
  postJsonRequest: vi.fn(),
  assertOkOrThrowHttpError: vi.fn(),
  normalizeBaseUrl: vi.fn((baseUrl: string | undefined, fallback: string) =>
    (baseUrl?.trim() || fallback).replace(/\/+$/u, ""),
  ),
}));

vi.mock("../../media-understanding/providers/shared.js", () => ({
  postJsonRequest: sharedProviderMocks.postJsonRequest,
  assertOkOrThrowHttpError: sharedProviderMocks.assertOkOrThrowHttpError,
  normalizeBaseUrl: sharedProviderMocks.normalizeBaseUrl,
}));

import { buildOpenRouterImageGenerationProvider } from "./openrouter.js";

describe("OpenRouter image-generation provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("generates images through the OpenRouter images endpoint", async () => {
    vi.spyOn(modelAuth, "resolveApiKeyForProvider").mockResolvedValue({
      apiKey: "openrouter-test-key",
      source: "env",
      mode: "api-key",
    });
    sharedProviderMocks.postJsonRequest.mockResolvedValue({
      response: {
        ok: true,
        json: async () => ({
          data: [
            {
              b64_json: Buffer.from("png-data").toString("base64"),
              revised_prompt: "revised prompt",
            },
          ],
        }),
      },
      finalUrl: "https://openrouter.ai/api/v1/images/generations",
      release: vi.fn(),
    });

    const provider = buildOpenRouterImageGenerationProvider();
    const result = await provider.generateImage({
      provider: "openrouter",
      model: "openai/gpt-image-1",
      prompt: "draw a blazer campaign image",
      cfg: {},
      size: "1536x1024",
    });

    expect(sharedProviderMocks.postJsonRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://openrouter.ai/api/v1/images/generations",
        useEnvProxy: true,
        body: {
          model: "openai/gpt-image-1",
          prompt: "draw a blazer campaign image",
          n: 1,
          size: "1536x1024",
        },
      }),
    );
    const [call] = sharedProviderMocks.postJsonRequest.mock.calls[0];
    expect(new Headers(call.headers).get("authorization")).toBe("Bearer openrouter-test-key");
    expect(new Headers(call.headers).get("HTTP-Referer")).toBe("https://openclaw.ai");
    expect(result).toEqual({
      images: [
        {
          buffer: Buffer.from("png-data"),
          mimeType: "image/png",
          fileName: "image-1.png",
          revisedPrompt: "revised prompt",
        },
      ],
      model: "openai/gpt-image-1",
    });
  });

  it("rejects reference-image edits for now", async () => {
    const provider = buildOpenRouterImageGenerationProvider();
    await expect(
      provider.generateImage({
        provider: "openrouter",
        model: "openai/gpt-image-1",
        prompt: "edit this image",
        cfg: {},
        inputImages: [
          {
            buffer: Buffer.from("ref"),
            mimeType: "image/png",
            fileName: "reference.png",
          },
        ],
      }),
    ).rejects.toThrow("does not support reference-image edits");
  });
});
