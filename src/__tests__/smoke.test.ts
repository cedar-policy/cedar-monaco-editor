import { describe, it, expect } from 'vitest';
import * as pkg from '../index';

describe('package entry', () => {
  it('exports expected public API', () => {
    expect(pkg.VERSION).toBeTypeOf('string');
    expect(pkg.CedarPolicyEditor).toBeTypeOf('function');
    expect(pkg.CedarSchemaEditor).toBeTypeOf('function');
    expect(pkg.CedarJsonEditor).toBeTypeOf('function');
    expect(pkg.useCedar).toBeTypeOf('function');
    expect(pkg.registerCedarLanguages).toBeTypeOf('function');
    expect(pkg.configureCedarEditors).toBeTypeOf('function');
  });
});
