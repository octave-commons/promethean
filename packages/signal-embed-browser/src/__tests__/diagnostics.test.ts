import { describe, it, expect, vi } from "vitest";

// We test the backend detection diagnostics structure.
// Since navigator is unavailable in Node, we verify the WASM-only fallback path
// and that the diagnostics object has the expected shape.

describe("RuntimeDiagnostics structure", () => {
  it("has all required fields with correct types", async () => {
    // Import at runtime so vi.stubGlobal can take effect
    const { resolveAvailableBackends } = await import("../backends.js");
    const diag = await resolveAvailableBackends();

    expect(diag).toHaveProperty("available_backends");
    expect(diag).toHaveProperty("active_backend");
    expect(diag).toHaveProperty("webnn_supported");
    expect(diag).toHaveProperty("webgpu_supported");
    expect(diag).toHaveProperty("wasm_supported");
    expect(diag).toHaveProperty("device_preference");

    expect(Array.isArray(diag.available_backends)).toBe(true);
    expect(typeof diag.active_backend).toBe("string");
    expect(typeof diag.webnn_supported).toBe("boolean");
    expect(typeof diag.webgpu_supported).toBe("boolean");
    expect(typeof diag.wasm_supported).toBe("boolean");
    expect(typeof diag.device_preference).toBe("string");
  });

  it("always includes wasm in available backends", async () => {
    const { resolveAvailableBackends } = await import("../backends.js");
    const diag = await resolveAvailableBackends();
    expect(diag.available_backends).toContain("wasm");
    expect(diag.wasm_supported).toBe(true);
  });

  it("reports wasm_supported=true in environments without WebGPU/WebNN", async () => {
    // In Node test environment, navigator doesn't exist → no WebGPU/WebNN
    const { resolveAvailableBackends } = await import("../backends.js");
    const diag = await resolveAvailableBackends();
    expect(diag.wasm_supported).toBe(true);
    expect(diag.webgpu_supported).toBe(false);
    expect(diag.webnn_supported).toBe(false);
  });

  it("active_backend defaults to 'pending' before engine init", async () => {
    const { resolveAvailableBackends } = await import("../backends.js");
    const diag = await resolveAvailableBackends();
    expect(diag.active_backend).toBe("pending");
  });
});

describe("resolveExecutionProviders", () => {
  it("returns wasm-only for 'wasm' preference", async () => {
    const { resolveExecutionProviders } = await import("../backends.js");
    expect(resolveExecutionProviders("wasm")).toEqual(["wasm"]);
  });

  it("returns webgpu-only for 'webgpu' preference", async () => {
    const { resolveExecutionProviders } = await import("../backends.js");
    expect(resolveExecutionProviders("webgpu")).toEqual(["webgpu"]);
  });

  it("returns all providers in order for 'auto' preference", async () => {
    const { resolveExecutionProviders } = await import("../backends.js");
    const providers = resolveExecutionProviders("auto");
    expect(providers).toEqual(["webnn", "webgpu", "wasm"]);
  });

  it("returns webnn for 'webnn-npu' preference", async () => {
    const { resolveExecutionProviders } = await import("../backends.js");
    expect(resolveExecutionProviders("webnn-npu")).toEqual(["webnn"]);
  });
});

describe("resolveWebNNOptions", () => {
  it("returns npu device type for webnn-npu", async () => {
    const { resolveWebNNOptions } = await import("../backends.js");
    expect(resolveWebNNOptions("webnn-npu")).toEqual({ deviceType: "npu" });
  });

  it("returns gpu device type for webnn-gpu", async () => {
    const { resolveWebNNOptions } = await import("../backends.js");
    expect(resolveWebNNOptions("webnn-gpu")).toEqual({ deviceType: "gpu" });
  });

  it("returns undefined for wasm preference", async () => {
    const { resolveWebNNOptions } = await import("../backends.js");
    expect(resolveWebNNOptions("wasm")).toBeUndefined();
  });

  it("returns undefined for auto preference", async () => {
    const { resolveWebNNOptions } = await import("../backends.js");
    expect(resolveWebNNOptions("auto")).toBeUndefined();
  });
});
