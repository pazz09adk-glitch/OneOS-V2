import type { FaultRecord } from './types';
import { buildSeedFaults } from './seed';

export const STORAGE_KEYS = {
  schemaVersion: 'oneos.vf.schemaVersion',
  faults: 'oneos.vf.faults',
} as const;

export const VF_SCHEMA_VERSION = 1;

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
  if (typeof localStorage === 'undefined') return;
  const ver = Number(localStorage.getItem(STORAGE_KEYS.schemaVersion) || '0');
  if (ver === VF_SCHEMA_VERSION) return;
  localStorage.removeItem(STORAGE_KEYS.faults);
  localStorage.setItem(STORAGE_KEYS.schemaVersion, String(VF_SCHEMA_VERSION));
}

export function loadFaults(): FaultRecord[] {
  const seed = buildSeedFaults();
  if (typeof localStorage === 'undefined') return seed.map((f) => ({ ...f }));
  ensureSchema();
  const stored = readJson<FaultRecord[] | null>(STORAGE_KEYS.faults, null);
  if (!stored || !stored.length) {
    writeJson(STORAGE_KEYS.faults, seed);
    return seed.map((f) => ({ ...f }));
  }
  return stored;
}

export function saveFaults(list: FaultRecord[]) {
  if (typeof localStorage === 'undefined') return;
  ensureSchema();
  writeJson(STORAGE_KEYS.faults, list);
}

export function upsertFault(list: FaultRecord[], next: FaultRecord): FaultRecord[] {
  const idx = list.findIndex((f) => f.id === next.id);
  const copy = list.slice();
  if (idx >= 0) copy[idx] = next;
  else copy.unshift(next);
  saveFaults(copy);
  return copy;
}
