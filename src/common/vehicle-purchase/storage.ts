import type { PurchaseContract, InspectionTask, StockedVehicleRecord } from './types';
import { resolveApprovalKind } from './approvalRules';

export const STORAGE_KEYS = {
  schemaVersion: 'oneos.vp.schemaVersion',
  contracts: 'oneos.vp.contracts',
  inspections: 'oneos.vp.inspections',
  stocked: 'oneos.vp.stockedVehicles',
  workOrders: 'oneos.vp.linkedWorkOrders',
  workOrderPrefill: 'oneos.vp.workOrderPrefill',
} as const;

/** 字段模型升级时递增，强制用新种子覆盖旧 localStorage */
export const VP_SCHEMA_VERSION = 3;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSchema() {
  const ver = Number(localStorage.getItem(STORAGE_KEYS.schemaVersion) || '0');
  if (ver === VP_SCHEMA_VERSION) return;
  localStorage.removeItem(STORAGE_KEYS.contracts);
  localStorage.removeItem(STORAGE_KEYS.inspections);
  localStorage.removeItem(STORAGE_KEYS.stocked);
  localStorage.setItem(STORAGE_KEYS.schemaVersion, String(VP_SCHEMA_VERSION));
}

export function loadContracts(seed: PurchaseContract[]): PurchaseContract[] {
  ensureSchema();
  const stored = readJson<PurchaseContract[] | null>(STORAGE_KEYS.contracts, null);
  if (!stored || !stored.length) {
    writeJson(STORAGE_KEYS.contracts, seed);
    return seed.map((c) => ({ ...c }));
  }
  return stored;
}

export function saveContracts(list: PurchaseContract[]) {
  ensureSchema();
  writeJson(STORAGE_KEYS.contracts, list);
}

export function loadInspections(seed: InspectionTask[]): InspectionTask[] {
  ensureSchema();
  const stored = readJson<InspectionTask[] | null>(STORAGE_KEYS.inspections, null);
  if (!stored || !stored.length) {
    writeJson(STORAGE_KEYS.inspections, seed);
    return seed.map((t) => ({ ...t }));
  }
  return stored;
}

export function saveInspections(list: InspectionTask[]) {
  ensureSchema();
  writeJson(STORAGE_KEYS.inspections, list);
}

export function loadStocked(seed: StockedVehicleRecord[] = []): StockedVehicleRecord[] {
  return readJson(STORAGE_KEYS.stocked, seed);
}

export function saveStocked(list: StockedVehicleRecord[]) {
  writeJson(STORAGE_KEYS.stocked, list);
}

export function bumpContractApproval(
  contract: PurchaseContract,
  totalAmount = contract.totalAmount,
): PurchaseContract {
  return {
    ...contract,
    approvalKind: resolveApprovalKind(totalAmount),
    totalAmount,
  };
}

export function setWorkOrderPrefill(payload: unknown) {
  sessionStorage.setItem(STORAGE_KEYS.workOrderPrefill, JSON.stringify(payload));
}

export function consumeWorkOrderPrefill<T = unknown>(): T | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.workOrderPrefill);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEYS.workOrderPrefill);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function peekWorkOrderPrefill<T = unknown>(): T | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.workOrderPrefill);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function countLinkedWorkOrders(contractId: string): number {
  const map = readJson<Record<string, number>>(STORAGE_KEYS.workOrders, {});
  return map[contractId] || 0;
}

export function bumpLinkedWorkOrders(contractId: string, delta: number) {
  const map = readJson<Record<string, number>>(STORAGE_KEYS.workOrders, {});
  map[contractId] = (map[contractId] || 0) + delta;
  writeJson(STORAGE_KEYS.workOrders, map);
}
