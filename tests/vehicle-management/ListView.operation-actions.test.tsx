// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ListView } from '../../src/prototypes/vehicle-management/components/ListView';
import { EMPTY_FILTERS, type VehicleRecord } from '../../src/prototypes/vehicle-management/types';

let root: Root | undefined;
let container: HTMLDivElement | undefined;
const matchMediaMock = vi.fn();

function setMobileViewport(matches: boolean) {
  matchMediaMock.mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

function buttonsByAccessibleName(scope: ParentNode, name: string): HTMLButtonElement[] {
  return Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).filter((button) => {
    const accessibleName = button.getAttribute('aria-label') ?? button.textContent?.trim();
    return accessibleName === name;
  });
}

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = matchMediaMock;
  setMobileViewport(false);
});

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  document.querySelectorAll('.vm-op-dropdown').forEach((menu) => menu.remove());
  root = undefined;
  container = undefined;
});

describe('vehicle ListView operation column', () => {
  it('keeps vehicle edit inside more and dispatches the selected row', async () => {
    setMobileViewport(false);
    const row = {
      id: 'vehicle-1',
      plateNo: '沪A12345',
      vin: 'VIN123',
      brand: '测试品牌',
      model: '测试车型',
    } as VehicleRecord;
    const onOpenDetail = vi.fn();
    const onEdit = vi.fn();
    const onOps = vi.fn();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <ListView
          records={[row]}
          kpiCounts={{
            all: 1,
            lease: 0,
            logistics: 0,
            stock: 0,
            nonOperating: 0,
            exit: 0,
            licenseAbnormal: 0,
            insuranceAbnormal: 0,
          }}
          kpiTab="all"
          onKpiChange={vi.fn()}
          pendingFilters={EMPTY_FILTERS}
          appliedFilters={EMPTY_FILTERS}
          onPendingChange={vi.fn()}
          onSearch={vi.fn()}
          onReset={vi.fn()}
          filtered={[row]}
          insuranceMap={new Map()}
          onOpenDetail={onOpenDetail}
          onExport={vi.fn()}
          onImportOpen={vi.fn()}
          onOps={onOps}
          onOperateCity={vi.fn()}
          onMap={vi.fn()}
          onEdit={onEdit}
          onToast={vi.fn()}
          page={1}
          pageSize={10}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />,
      );
    });

    const view = container.querySelector<HTMLButtonElement>('[aria-label="查看"]');
    const edit = container.querySelector<HTMLButtonElement>('[aria-label="编辑"]');
    const more = container.querySelector<HTMLButtonElement>('[aria-label="更多操作"]');
    expect(view).not.toBeNull();
    expect(edit).toBeNull();
    expect(more).not.toBeNull();

    await act(async () => {
      view?.click();
      more?.click();
    });
    const menuEdit = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('.vm-op-dropdown button'),
    ).find((button) => button.textContent?.trim() === '编辑');
    expect(menuEdit).not.toBeNull();
    await act(async () => menuEdit?.click());

    await act(async () => more?.click());
    const owner = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('.vm-op-dropdown button'),
    ).find((button) => button.textContent?.includes('设置运维负责人'));
    expect(owner).not.toBeNull();
    await act(async () => owner?.click());

    expect(onOpenDetail).toHaveBeenCalledWith(row);
    expect(onEdit).toHaveBeenCalledWith(row);
    expect(onOps).toHaveBeenCalledWith(row);
  });

  it('renders one mobile action set and dispatches the mobile row', async () => {
    setMobileViewport(true);
    const mobileRow = {
      id: 'vehicle-mobile-1',
      plateNo: '沪B54321',
      vin: 'VIN-MOBILE',
      brand: '移动品牌',
      model: '移动车型',
    } as VehicleRecord;
    const onOpenDetail = vi.fn();
    const onEdit = vi.fn();
    const onOps = vi.fn();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <ListView
          records={[mobileRow]}
          kpiCounts={{
            all: 1,
            lease: 0,
            logistics: 0,
            stock: 0,
            nonOperating: 0,
            exit: 0,
            licenseAbnormal: 0,
            insuranceAbnormal: 0,
          }}
          kpiTab="all"
          onKpiChange={vi.fn()}
          pendingFilters={EMPTY_FILTERS}
          appliedFilters={EMPTY_FILTERS}
          onPendingChange={vi.fn()}
          onSearch={vi.fn()}
          onReset={vi.fn()}
          filtered={[mobileRow]}
          insuranceMap={new Map()}
          onOpenDetail={onOpenDetail}
          onExport={vi.fn()}
          onImportOpen={vi.fn()}
          onOps={onOps}
          onOperateCity={vi.fn()}
          onMap={vi.fn()}
          onEdit={onEdit}
          onToast={vi.fn()}
          page={1}
          pageSize={10}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />,
      );
    });

    const viewButtons = buttonsByAccessibleName(container, '查看');
    const editButtons = buttonsByAccessibleName(container, '编辑');
    const moreButtons = buttonsByAccessibleName(container, '更多操作');
    expect(viewButtons).toHaveLength(1);
    expect(editButtons).toHaveLength(0);
    expect(moreButtons).toHaveLength(1);

    await act(async () => {
      viewButtons[0].click();
      moreButtons[0].click();
    });

    const menuEditButtons = buttonsByAccessibleName(document.body, '编辑');
    expect(menuEditButtons).toHaveLength(1);
    await act(async () => menuEditButtons[0].click());

    await act(async () => moreButtons[0].click());
    const ownerButtons = buttonsByAccessibleName(document.body, '设置运维负责人');
    expect(ownerButtons).toHaveLength(1);
    await act(async () => ownerButtons[0].click());

    expect(onOpenDetail).toHaveBeenCalledTimes(1);
    expect(onOpenDetail).toHaveBeenCalledWith(mobileRow);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mobileRow);
    expect(onOps).toHaveBeenCalledTimes(1);
    expect(onOps).toHaveBeenCalledWith(mobileRow);
  });
});
