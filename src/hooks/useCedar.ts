import { useState, useEffect, useCallback, useRef } from 'react';

type CedarWasmModule = typeof import('@cedar-policy/cedar-wasm');

export function useCedar() {
  const [isReady, setIsReady] = useState(false);
  const [cedarVersion, setCedarVersion] = useState('');
  const wasmRef = useRef<CedarWasmModule | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('@cedar-policy/cedar-wasm').then((mod) => {
      if (cancelled) return;
      wasmRef.current = mod;
      setCedarVersion(mod.getCedarVersion());
      setIsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const validate = useCallback((policy: string, schema?: string) => {
    if (!wasmRef.current) return { success: false, errors: ['WASM not loaded'] };
    if (schema) {
      const result = wasmRef.current.validate({
        schema,
        policies: { staticPolicies: policy },
      });
      if (result.type === 'failure') return { success: false, errors: result.errors.map((e) => e.message) };
      const errs = result.validationErrors.map((e) => e.error.message);
      return { success: errs.length === 0, errors: errs };
    }
    const result = wasmRef.current.checkParsePolicySet({ staticPolicies: policy });
    if (result.type === 'success') return { success: true, errors: [] as string[] };
    return { success: false, errors: result.errors.map((e) => e.message) };
  }, []);

  const format = useCallback((policy: string) => {
    if (!wasmRef.current) return { success: false, formatted: policy };
    const result = wasmRef.current.formatPolicies({ policyText: policy, lineWidth: 80, indentWidth: 2 });
    if (result.type === 'success') return { success: true, formatted: result.formatted_policy };
    return { success: false, formatted: policy };
  }, []);

  const parse = useCallback((policy: string) => {
    if (!wasmRef.current) return { success: false, errors: ['WASM not loaded'] };
    const result = wasmRef.current.checkParsePolicySet({ staticPolicies: policy });
    if (result.type === 'success') return { success: true, errors: [] as string[] };
    return { success: false, errors: result.errors.map((e) => e.message) };
  }, []);

  return { validate, format, parse, cedarVersion, isReady };
}
