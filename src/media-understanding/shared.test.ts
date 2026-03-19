import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchGuardMocks = vi.hoisted(() => ({
  fetchWithSsrFGuard: vi.fn(),
  withStrictGuardedFetchMode: vi.fn((params) => ({ ...params, mode: "strict" })),
  withTrustedEnvProxyGuardedFetchMode: vi.fn((params) => ({
    ...params,
    mode: "trusted_env_proxy",
  })),
}));

vi.mock("../../infra/net/fetch-guard.js", () => ({
  fetchWithSsrFGuard: fetchGuardMocks.fetchWithSsrFGuard,
  withStrictGuardedFetchMode: fetchGuardMocks.withStrictGuardedFetchMode,
  withTrustedEnvProxyGuardedFetchMode: fetchGuardMocks.withTrustedEnvProxyGuardedFetchMode,
}));

import { postJsonRequest } from "./shared.js";

describe("media understanding shared request helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGuardMocks.fetchWithSsrFGuard.mockResolvedValue({
      response: new Response(null, { status: 200 }),
      finalUrl: "https://example.test",
      release: vi.fn(),
    });
  });

  it("uses strict guarded fetch mode by default", async () => {
    await postJsonRequest({
      url: "https://example.test",
      headers: new Headers({ "content-type": "application/json" }),
      body: { ok: true },
      timeoutMs: 1_000,
      fetchFn: fetch,
    });

    expect(fetchGuardMocks.withStrictGuardedFetchMode).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://example.test",
        timeoutMs: 1_000,
      }),
    );
    expect(fetchGuardMocks.withTrustedEnvProxyGuardedFetchMode).not.toHaveBeenCalled();
    expect(fetchGuardMocks.fetchWithSsrFGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "strict",
      }),
    );
  });

  it("uses trusted env proxy mode when requested", async () => {
    await postJsonRequest({
      url: "https://example.test",
      headers: new Headers({ "content-type": "application/json" }),
      body: { ok: true },
      timeoutMs: 1_000,
      fetchFn: fetch,
      useEnvProxy: true,
    });

    expect(fetchGuardMocks.withTrustedEnvProxyGuardedFetchMode).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://example.test",
        timeoutMs: 1_000,
      }),
    );
    expect(fetchGuardMocks.withStrictGuardedFetchMode).not.toHaveBeenCalled();
    expect(fetchGuardMocks.fetchWithSsrFGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "trusted_env_proxy",
      }),
    );
  });
});
