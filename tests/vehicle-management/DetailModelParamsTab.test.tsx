// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DetailModelParamsTab } from '../../src/prototypes/vehicle-management/components/DetailModelParamsTab';
import vehicles from '../../src/prototypes/vehicle-management/data/vehicles.json';
import type { VehicleRecord } from '../../src/prototypes/vehicle-management/types';
import { renderReact, type RenderReactResult } from './detailTestUtils';

let rendered: RenderReactResult | undefined;

function findClosingBrace(source: string, openingBraceIndex: number): number {
  let depth = 0;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await rendered?.unmount();
  rendered = undefined;
});

describe('DetailModelParamsTab', () => {
  it('renders the model parameters as semantic readonly descriptions', async () => {
    rendered = await renderReact(
      <DetailModelParamsTab record={vehicles[0] as VehicleRecord} />,
    );
    const { container } = rendered;
    const tab = container.querySelector<HTMLElement>(
      'section[aria-label="型号参数（只读）"]',
    );
    const headings = Array.from(tab?.querySelectorAll('h3') ?? [], (heading) => (
      heading.textContent?.trim()
    ));
    const grids = Array.from(tab?.querySelectorAll<HTMLElement>('.va-description-grid') ?? []);
    const items = Array.from(tab?.querySelectorAll<HTMLElement>('.va-description-item') ?? []);
    const labels = items.map((item) => item.querySelector('dt')?.textContent?.trim());

    expect(tab).not.toBeNull();
    expect(tab?.tagName).toBe('SECTION');
    expect(headings).toEqual([
      '基本情况',
      '轮胎情况',
      '电气情况',
      '供氢系统情况',
      '其他系统情况',
      '保养规则',
    ]);
    expect(grids.length).toBeGreaterThan(0);
    expect(grids.every((grid) => grid.tagName === 'DL')).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(10);
    expect(items.every((item) => (
      item.tagName === 'DIV'
      && item.querySelector(':scope > dt') !== null
      && item.querySelector(':scope > dd') !== null
    ))).toBe(true);
    expect(labels).toEqual([
      '品牌',
      '型号',
      '车辆类型',
      '公告型号',
      '燃料种类',
      '车牌颜色',
      '车辆长度(米)',
      '车辆宽度(米)',
      '车辆高度(米)',
      '轮胎数量',
      '轮胎磨损费用(元/mm)',
      '电池类型',
      '电池厂家',
      '储电量',
      '电续航里程(KM)',
      '氢瓶容量',
      '仪表盘显示模式',
      '氢续航里程(KM)',
      '冷机厂家',
    ]);
    expect(items[0].querySelector('dd')?.textContent).toBe('现代');
    expect(tab?.querySelector('.va-model-param-item__value')).toBeNull();
    expect(tab?.querySelector('input, select, textarea')).toBeNull();
    expect(tab?.querySelector('.va-model-param-table')?.textContent).toContain('保养公里周期');
    expect(tab?.querySelector('.va-model-param-table')?.textContent).toContain('变速器油');
  });

  it('associates the maintenance table with its heading and identifies column headers', async () => {
    rendered = await renderReact(
      <DetailModelParamsTab record={vehicles[0] as VehicleRecord} />,
    );
    const heading = Array.from(rendered.container.querySelectorAll<HTMLHeadingElement>('h3'))
      .find((candidate) => candidate.textContent?.trim() === '保养规则');
    const table = rendered.container.querySelector<HTMLTableElement>('.va-model-param-table');
    const columnHeaders = Array.from(table?.querySelectorAll('th') ?? []);

    expect(heading?.id).toBeTruthy();
    expect(table?.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(columnHeaders.length).toBeGreaterThan(0);
    expect(columnHeaders.every((header) => header.getAttribute('scope') === 'col')).toBe(true);
  });

  it('renders empty parameter values as an em dash', async () => {
    rendered = await renderReact(
      <DetailModelParamsTab
        record={{ ...vehicles[0], brand: '-' } as VehicleRecord}
      />,
    );
    const brandItem = Array.from(
      rendered.container.querySelectorAll<HTMLElement>('.va-description-item'),
    ).find((item) => item.querySelector('dt')?.textContent?.trim() === '品牌');

    expect(brandItem?.querySelector('dd')?.textContent).toBe('—');
  });

  it('uses the page mobile breakpoint for the single-column description grid', () => {
    const descriptionGridSelector = '.va-model-param-tab .va-description-grid';
    const styles = readFileSync(
      resolve(process.cwd(), 'src/prototypes/vehicle-management/style.css'),
      'utf8',
    );
    const selectorIndexes: number[] = [];
    let selectorIndex = styles.indexOf(descriptionGridSelector);

    while (selectorIndex >= 0) {
      selectorIndexes.push(selectorIndex);
      selectorIndex = styles.indexOf(descriptionGridSelector, selectorIndex + 1);
    }

    expect(selectorIndexes).toHaveLength(2);

    const mobileSelectorIndexes = selectorIndexes.filter((index) => {
      const ruleOpeningBrace = styles.indexOf('{', index);
      const ruleClosingBrace = findClosingBrace(styles, ruleOpeningBrace);
      const rule = styles.slice(index, ruleClosingBrace + 1);
      return rule.includes('grid-template-columns: minmax(0, 1fr)');
    });

    expect(mobileSelectorIndexes).toHaveLength(1);

    const mobileSelectorIndex = mobileSelectorIndexes[0];
    const nearestMediaIndex = styles.lastIndexOf('@media', mobileSelectorIndex);
    const nearestMediaBlockStart = styles.indexOf('{', nearestMediaIndex);
    const nearestMediaBlockEnd = findClosingBrace(styles, nearestMediaBlockStart);
    const nearestMediaHeader = styles
      .slice(nearestMediaIndex, nearestMediaBlockStart)
      .trim();
    const mobileRuleStart = styles.indexOf('{', mobileSelectorIndex);
    const mobileRuleEnd = findClosingBrace(styles, mobileRuleStart);
    const mobileRule = styles.slice(mobileSelectorIndex, mobileRuleEnd + 1);

    expect(nearestMediaHeader).toBe('@media (max-width: 767px)');
    expect(mobileSelectorIndex).toBeGreaterThan(nearestMediaBlockStart);
    expect(mobileSelectorIndex).toBeLessThan(nearestMediaBlockEnd);
    expect(mobileRuleEnd).toBeLessThan(nearestMediaBlockEnd);
    expect(mobileRule).toContain('grid-template-columns: minmax(0, 1fr)');
  });
});
