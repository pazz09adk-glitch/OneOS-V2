// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  OperationActions,
  splitOperationActions,
  type OperationActionItem,
} from '../../src/common/OperationActions';

const action = (key: string, label: string): OperationActionItem => ({
  key,
  label,
  onClick: vi.fn(),
});

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

async function renderActions(element: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(element);
  });
  return container;
}

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  document.querySelectorAll('.vm-op-dropdown').forEach((menu) => menu.remove());
  root = undefined;
  container = undefined;
});

describe('splitOperationActions', () => {
  it('separates the detail entry from history actions', () => {
    const items = [
      action('history', '操作记录'),
      action('edit', '编辑'),
      action('view', '查看详情'),
      action('owner', '设置运维负责人'),
    ];

    const result = splitOperationActions(items);

    expect(result.view?.label).toBe('查看详情');
    expect(result.edit?.label).toBe('编辑');
    expect(result.more.map((item) => item.label)).toEqual([
      '操作记录',
      '设置运维负责人',
    ]);
  });

  it('does not promote 查看记录 as a detail entry', () => {
    const result = splitOperationActions([
      action('viewRecords', '查看记录'),
      action('process', '处置'),
    ]);

    expect(result.view).toBeUndefined();
    expect(result.process?.label).toBe('处置');
    expect(result.more.map((item) => item.label)).toEqual(['查看记录']);
  });
});

describe('OperationActions', () => {
  it('renders detail before the workflow action and more', async () => {
    const rendered = await renderActions(
      <OperationActions
        view={{ label: '查看', onClick: vi.fn() }}
        edit={{ label: '编辑', onClick: vi.fn() }}
        process={{ label: '处置', onClick: vi.fn() }}
        more={[action('owner', '设置运维负责人')]}
      />,
    );
    const buttonLabels = Array.from(rendered.querySelectorAll('button')).map(
      (button) => button.getAttribute('aria-label'),
    );

    expect(buttonLabels).toEqual(['查看', '编辑', '更多操作']);
  });

  it('renders edit then process when there is no detail entry', async () => {
    const rendered = await renderActions(
      <OperationActions
        edit={{ label: '编辑', onClick: vi.fn() }}
        process={{ label: '处置', onClick: vi.fn() }}
      />,
    );
    const buttonLabels = Array.from(rendered.querySelectorAll('button')).map(
      (button) => button.getAttribute('aria-label'),
    );

    expect(buttonLabels).toEqual(['编辑', '处置']);
    expect(rendered.querySelector('[aria-label="更多操作"]')).toBeNull();
  });

  it('filters hidden primary actions before allocating external slots', async () => {
    const rendered = await renderActions(
      <OperationActions
        view={{ label: '查看', onClick: vi.fn() }}
        edit={{ label: '编辑', onClick: vi.fn(), hidden: true }}
        process={{ label: '处置', onClick: vi.fn() }}
      />,
    );
    const buttonLabels = Array.from(rendered.querySelectorAll('button')).map(
      (button) => button.getAttribute('aria-label'),
    );

    expect(buttonLabels).toEqual(['查看', '处置']);
  });

  it('does not render more when all menu actions are hidden', async () => {
    const rendered = await renderActions(
      <OperationActions
        view={{ label: '详情', onClick: vi.fn() }}
        more={[{ ...action('owner', '设置运维负责人'), hidden: true }]}
      />,
    );

    expect(rendered.querySelector('[aria-label="详情"]')).not.toBeNull();
    expect(rendered.querySelector('[aria-label="更多操作"]')).toBeNull();
  });

  it('renders an empty marker and no buttons when all actions are hidden', async () => {
    const rendered = await renderActions(
      <OperationActions
        view={{ label: '查看', onClick: vi.fn(), hidden: true }}
        edit={{ label: '编辑', onClick: vi.fn(), hidden: true }}
        process={{ label: '处置', onClick: vi.fn(), hidden: true }}
        more={[{ ...action('owner', '设置运维负责人'), hidden: true }]}
      />,
    );

    expect(rendered.textContent).toBe('-');
    expect(rendered.querySelectorAll('button')).toHaveLength(0);
  });

  it('portals more to document.body and closes it with Escape', async () => {
    const rendered = await renderActions(
      <OperationActions more={[action('owner', '设置运维负责人')]} />,
    );

    const moreButton = rendered.querySelector<HTMLButtonElement>(
      '[aria-label="更多操作"]',
    );
    expect(moreButton).not.toBeNull();

    await act(async () => {
      moreButton?.click();
    });

    const menu = document.body.querySelector<HTMLElement>('.vm-op-dropdown');
    expect(menu).not.toBeNull();
    expect(menu?.parentElement).toBe(document.body);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(document.body.querySelector('.vm-op-dropdown')).toBeNull();
  });

  it('closes the portal menu on an outside mousedown', async () => {
    const rendered = await renderActions(
      <OperationActions more={[action('owner', '设置运维负责人')]} />,
    );
    const moreButton = rendered.querySelector<HTMLButtonElement>(
      '[aria-label="更多操作"]',
    );

    await act(async () => {
      moreButton?.click();
    });
    expect(document.body.querySelector('.vm-op-dropdown')).not.toBeNull();

    await act(async () => {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true }),
      );
    });

    expect(document.body.querySelector('.vm-op-dropdown')).toBeNull();
  });
});
