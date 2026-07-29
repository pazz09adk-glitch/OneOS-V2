import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { V2Button } from '../../../src/prototypes/oneos-v2/UIComponents';

describe('OneOS V2 component exports', () => {
  it('resolves the shared V2Button from the showcase component barrel', () => {
    expect(typeof V2Button).toBe('function');
  });

  it('shows the canonical design-system version in the showcase', () => {
    const designSource = readFileSync('src/resources/design-system/DESIGN.md', 'utf8');
    const showcaseSource = readFileSync('src/prototypes/oneos-v2/DesignSystemShowcase.tsx', 'utf8');
    const version = designSource.match(/^version:\s*"([^"]+)"/m)?.[1];

    expect(version).toBe('2.6');
    expect(showcaseSource).toContain(`v${version} 复杂台账列个性化规范`);
  });
});
