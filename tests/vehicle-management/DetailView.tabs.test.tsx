// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as detailViewModule from '../../src/prototypes/vehicle-management/components/DetailView';
import vehicles from '../../src/prototypes/vehicle-management/data/vehicles.json';
import type { VehicleRecord } from '../../src/prototypes/vehicle-management/types';
import {
  buttonByName,
  click,
  renderReact,
  type RenderReactResult,
} from './detailTestUtils';

const { DetailView } = detailViewModule;

let rendered: RenderReactResult | undefined;

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await rendered?.unmount();
  rendered = undefined;
});

describe('vehicle DetailView tabs', () => {
  it('does not export mutable shared tab layout configuration', () => {
    expect('DETAIL_TABS_WITH_ASIDE' in detailViewModule).toBe(false);
  });

  it('defaults to lifecycle and adapts the aside layout to the selected tab', async () => {
    const noOp = () => {};
    rendered = await renderReact(
      <DetailView
        record={vehicles[0] as VehicleRecord}
        onBack={noOp}
        onOps={noOp}
        onOperateCity={noOp}
        onUpdate={noOp}
        onToast={noOp}
      />,
    );
    const { container } = rendered;
    const grid = container.querySelector<HTMLElement>('.va-form-page-grid');

    expect(buttonByName(container, '生命周期').getAttribute('aria-selected')).toBe('true');
    expect(grid?.classList.contains('is-wide-tab')).toBe(false);
    expect(container.querySelector('aside[aria-label="车辆侧栏信息"]')).not.toBeNull();

    await click(buttonByName(container, '型号参数'));

    expect(grid?.classList.contains('is-wide-tab')).toBe(true);
    expect(container.querySelector('aside[aria-label="车辆侧栏信息"]')).toBeNull();

    await click(buttonByName(container, '基本信息'));

    expect(grid?.classList.contains('is-wide-tab')).toBe(false);
    expect(container.querySelector('aside[aria-label="车辆侧栏信息"]')).not.toBeNull();
  });

  it('integrates every redesigned full-width detail tab', async () => {
    const noOp = () => {};
    rendered = await renderReact(
      <DetailView
        record={vehicles[0] as VehicleRecord}
        onBack={noOp}
        onOps={noOp}
        onOperateCity={noOp}
        onUpdate={noOp}
        onToast={noOp}
      />,
    );
    const { container } = rendered;
    const cases = [
      ['型号参数', () => container.querySelector('section[aria-label="型号参数（只读）"]')],
      ['证照信息', () => container.querySelector('nav[aria-label="证照分类"]')],
      ['保险记录', () => container.querySelector('section[aria-label="车辆保险档案"]')],
      ['租赁记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '合同编码')],
      ['事故记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '事故编码')],
      ['故障记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '故障编号')],
      ['违章记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '违法行为')],
      ['异动记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '异动开始日期')],
      ['调拨记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '调拨日期')],
      ['年审记录', () => Array.from(container.querySelectorAll('th')).find((cell) => cell.textContent === '检验有效期至')],
    ] as const;

    for (const [tabName, landmark] of cases) {
      await click(buttonByName(container, tabName));
      expect(landmark(), `${tabName} landmark`).toBeTruthy();
      expect(container.querySelector('.va-form-page-grid')?.classList.contains('is-wide-tab')).toBe(true);
      expect(container.querySelector('aside[aria-label="车辆侧栏信息"]')).toBeNull();
    }
  });
});
