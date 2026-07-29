import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('vehicle management entrypoint styles', () => {
  it('loads the shared operation actions stylesheet', () => {
    const entrypoint = readFileSync(
      new URL('../../src/prototypes/vehicle-management/index.tsx', import.meta.url),
      'utf8',
    );

    expect(entrypoint).toContain("import '../../common/vm-operation-actions.css';");
  });

  it('uses the neutral design-system border for the lifecycle search focus state', () => {
    const styles = readFileSync(
      new URL('../../src/prototypes/vehicle-management/style.css', import.meta.url),
      'utf8',
    );

    expect(styles).toContain('.va-life__search:focus-within');
    expect(styles).toContain('border-color: var(--ln-hairline-strong, #d4d4d8);');
    expect(styles).toContain('.va-life__search input:focus-visible');
    expect(styles).toContain('outline: none;');
  });
});
