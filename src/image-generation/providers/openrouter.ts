import { resolveApiKeyForProvider } from "../../agents/model-auth.js";
import { resolveProviderAttributionHeaders } from "../../agents/provider-attribution.js";
import {
  assertOkOrThrowHttpError,
  normalizeBaseUrl,
  postJsonRequest,
} from "../../media-understanding/providers/shared.js";
import type { ImageGenerationProviderPlugin } from "../../plugins/types.js";

const DEFAULT_OPENROUTER_IMAGE_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_IMAGE_MODEL = "openai/gpt-image-1";
const DEFAULT_OUTPUT_MIME = "image/png";
const DEFAULT_SIZE = "1024x1024";
const OPENROUTER_SUPPORTED_SIZES = ["1024x1024", "1024x1536", "1536x1024"] as const;

type OpenRouterImageApiResponse = {
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
  }>;
};

function resolveOpenRouterBaseUrl(
  cfg: Parameters<typeof resolveApiKeyForProvider>[0]["cfg"],
): string {
  return normalizeBaseUrl(
    cfg?.models?.providers?.openrouter?.baseUrl?.trim(),
    DEFAULT_OPENROUTER_IMAGE_BASE_URL,
  );
}

export function buildOpenRouterImageGenerationProvider(): ImageGenerationProviderPlugin {
  return {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: DEFAULT_OPENROUTER_IMAGE_MODEL,
    models: [DEFAULT_OPENROUTER_IMAGE_MODEL],
    capabilities: {
      generate: {
        maxCount: 4,
        supportsSize: true,
        supportsAspectRatio: false,
        supportsResolution: false,
      },
      edit: {
        enabled: false,
        maxCount: 0,
        maxInputImages: 0,
        supportsSize: false,
        supportsAspectRatio: false,
        supportsResolution: false,
      },
      geometry: {
        sizes: [...OPENROUTER_SUPPORTED_SIZES],
      },
    },
    async generateImage(req) {
      if ((req.inputImages?.length ?? 0) > 0) {
        throw new Error(
          "OpenRouter image generation provider does not support reference-image edits",
        );
      }
      const auth = await resolveApiKeyForProvider({
        provider: "openrouter",
        cfg: req.cfg,
        agentDir: req.agentDir,
        store: req.authStore,
      });
      if (!auth.apiKey) {
        throw new Error("OpenRouter API key missing");
      }

      const headers = new Headers({
        Authorization: `Bearer ${auth.apiKey}`,
        "Content-Type": "application/json",
        ...resolveProviderAttributionHeaders("openrouter"),
      });
      const model = req.model?.trim() || DEFAULT_OPENROUTER_IMAGE_MODEL;
      const { response, release } = await postJsonRequest({
        url: `${resolveOpenRouterBaseUrl(req.cfg)}/images/generations`,
        headers,
        body: {
          model,
          prompt: req.prompt,
          n: req.count ?? 1,
          size: req.size ?? DEFAULT_SIZE,
        },
        timeoutMs: 60_000,
        fetchFn: globalThis.fetch,
        useEnvProxy: true,
      });

      try {
        await assertOkOrThrowHttpError(response, "OpenRouter image generation failed");
        const data = (await response.json()) as OpenRouterImageApiResponse;
        const images = (data.data ?? [])
          .map((entry, index) => {
            if (!entry.b64_json) {
              return null;
            }
            return {
              buffer: Buffer.from(entry.b64_json, "base64"),
              mimeType: DEFAULT_OUTPUT_MIME,
              fileName: `image-${index + 1}.png`,
              ...(entry.revised_prompt ? { revisedPrompt: entry.revised_prompt } : {}),
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

        return {
          images,
          model,
        };
      } finally {
        await release();
      }
    },
  };
}
