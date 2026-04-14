type CedarWasmModule = typeof import('@cedar-policy/cedar-wasm');

export type CedarWasm = CedarWasmModule;

let cached: CedarWasmModule | undefined;

export async function initCedarWasm(): Promise<CedarWasmModule> {
  if (cached) return cached;
  cached = await import('@cedar-policy/cedar-wasm');
  return cached;
}
