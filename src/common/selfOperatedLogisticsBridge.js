/**
 * 自营物流闭环桥：自营合同 ↔ 轻量调度任务 ↔ 车辆运营态 ↔ 物流业务明细自动生成
 * 原型本地种子 + localStorage，未接真实 API。
 * 规则见：src/resources/self-operated-logistics/assumptions.md
 */

export const SO_CONTRACT_STORAGE_KEY = 'oneos.self-operated.contracts.v1';
export const SO_DISPATCH_STORAGE_KEY = 'oneos.self-operated.dispatch-tasks.v1';
export const SO_LEDGER_AUTO_STORAGE_KEY = 'oneos.self-operated.ledger-auto.v1';
export const SO_VEHICLE_OPS_STORAGE_KEY = 'oneos.self-operated.vehicle-ops.v1';

export const CONTRACT_STATUS = {
  draft: { key: 'draft', label: '草稿', color: 'default' },
  active: { key: 'active', label: '生效', color: 'processing' },
  performing: { key: 'performing', label: '履约中', color: 'success' },
  ended: { key: 'ended', label: '已结束', color: 'default' },
  terminated: { key: 'terminated', label: '已终止', color: 'error' },
};

export const DISPATCH_STATUS = {
  pending_assign: { key: 'pending_assign', label: '待派', color: 'default' },
  assigned: { key: 'assigned', label: '已派', color: 'processing' },
  in_progress: { key: 'in_progress', label: '执行中', color: 'warning' },
  completed: { key: 'completed', label: '已办结', color: 'success' },
  cancelled: { key: 'cancelled', label: '已取消', color: 'error' },
};

/** inventory | self_operated */
export const VEHICLE_OPS = {
  inventory: 'inventory',
  self_operated: 'self_operated',
};

export const SEED_VEHICLES = [
  { plateNo: '粤BH2001', brandModel: '佛山飞驰·35T', opsStatus: VEHICLE_OPS.inventory },
  { plateNo: '粤BH2002', brandModel: '佛山飞驰·35T', opsStatus: VEHICLE_OPS.self_operated },
  { plateNo: '粤BH2003', brandModel: '未势能源·49T', opsStatus: VEHICLE_OPS.inventory },
  { plateNo: '粤BH2008', brandModel: '未势能源·49T', opsStatus: VEHICLE_OPS.inventory },
];

export const SEED_DRIVERS = [
  { name: '陈志强', phone: '13800138001' },
  { name: '李伟', phone: '13800138002' },
  { name: '王海涛', phone: '13800138003' },
];

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function todayDate() {
  return nowStamp().slice(0, 10);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  try {
    window.dispatchEvent(new CustomEvent('oneos-self-operated-bridge', { detail: { key } }));
  } catch {
    /* ignore */
  }
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function computeAmount(unitPrice, quantity) {
  return roundMoney(Number(unitPrice || 0) * Number(quantity || 0));
}

function computeTotalCost(row) {
  return roundMoney(
    Number(row.hydrogenFee || 0)
      + Number(row.manualReimbursement || 0)
      + Number(row.etcFee || 0)
      + Number(row.electricityFee || 0)
      + Number(row.salary || 0)
      + Number(row.vehicleFee || 0),
  );
}

function brandModelOf(plateNo) {
  const hit = SEED_VEHICLES.find((v) => v.plateNo === plateNo);
  return hit ? hit.brandModel : '';
}

// —— 车辆运营态 ——

export function loadVehicleOpsMap() {
  const stored = readJson(SO_VEHICLE_OPS_STORAGE_KEY, null);
  if (stored && typeof stored === 'object') return stored;
  const map = {};
  SEED_VEHICLES.forEach((v) => {
    map[v.plateNo] = v.opsStatus;
  });
  writeJson(SO_VEHICLE_OPS_STORAGE_KEY, map);
  return map;
}

export function getVehicleOpsStatus(plateNo) {
  const map = loadVehicleOpsMap();
  return map[plateNo] || VEHICLE_OPS.inventory;
}

export function setVehicleOpsStatus(plateNo, status) {
  const map = loadVehicleOpsMap();
  map[plateNo] = status;
  writeJson(SO_VEHICLE_OPS_STORAGE_KEY, map);
  return map;
}

/**
 * 模拟运维交车：库存 → 自营
 */
export function simulateHandover(plateNo) {
  const plate = String(plateNo || '').trim();
  if (!plate) return { ok: false, message: '请选择车牌' };
  const current = getVehicleOpsStatus(plate);
  if (current === VEHICLE_OPS.self_operated) {
    return { ok: true, message: `${plate} 已在自营运营态`, already: true };
  }
  setVehicleOpsStatus(plate, VEHICLE_OPS.self_operated);
  return { ok: true, message: `已模拟交车：${plate} → 自营运营态` };
}

/**
 * 模拟运维还车：自营 → 库存；存在未办结任务时拦截
 */
export function simulateReturn(plateNo) {
  const plate = String(plateNo || '').trim();
  if (!plate) return { ok: false, message: '请选择车牌' };
  const open = loadDispatchTasks().filter(
    (t) => t.plateNo === plate && !['completed', 'cancelled'].includes(t.status),
  );
  if (open.length > 0) {
    return {
      ok: false,
      message: `${plate} 仍有 ${open.length} 条未办结调度任务，无法还车`,
    };
  }
  setVehicleOpsStatus(plate, VEHICLE_OPS.inventory);
  return { ok: true, message: `已模拟还车：${plate} → 库存` };
}

// —— 合同 ——

function seedContracts() {
  return [
    {
      id: 'soc-seed-001',
      contractCode: 'ZY-2026-0001',
      customerName: '深圳城配物流有限公司',
      businessName: '深圳南山短驳项目',
      vehicleType: '35T 氢能重卡',
      vehicleCount: 2,
      serviceStart: '2026-07-01',
      serviceEnd: '2026-12-31',
      handoverDate: '2026-07-05',
      handoverPlace: '深圳坪山运维基地',
      pricingSummary: '线路计价 · 元/趟',
      unitPriceDefault: 1800,
      status: 'active',
      attachmentName: '自营服务合同-南山短驳.pdf',
      createdAt: '2026-06-28 10:00',
      activatedAt: '2026-06-28 15:20',
      remark: '种子合同：已生效，可创建调度任务',
    },
    {
      id: 'soc-seed-002',
      contractCode: 'ZY-2026-0002',
      customerName: '广州港务运输集团',
      businessName: '南沙港区接驳',
      vehicleType: '49T 氢能重卡',
      vehicleCount: 1,
      serviceStart: '2026-08-01',
      serviceEnd: '2027-01-31',
      handoverDate: '2026-08-03',
      handoverPlace: '广州南沙停车场',
      pricingSummary: '线路计价 · 元/趟',
      unitPriceDefault: 2200,
      status: 'draft',
      attachmentName: '',
      createdAt: '2026-07-10 09:30',
      activatedAt: '',
      remark: '草稿：需业务确认生效',
    },
  ];
}

export function loadContracts() {
  const stored = readJson(SO_CONTRACT_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  const seed = seedContracts();
  writeJson(SO_CONTRACT_STORAGE_KEY, seed);
  return seed;
}

export function saveContracts(list) {
  writeJson(SO_CONTRACT_STORAGE_KEY, list || []);
}

export function getContractById(id) {
  return loadContracts().find((c) => c.id === id) || null;
}

export function getActiveContracts() {
  return loadContracts().filter((c) => c.status === 'active' || c.status === 'performing');
}

export function createContract(payload) {
  const list = loadContracts();
  const n = list.length + 1;
  const row = {
    id: `soc-${Date.now()}`,
    contractCode: payload.contractCode || `ZY-2026-${String(n).padStart(4, '0')}`,
    customerName: String(payload.customerName || '').trim(),
    businessName: String(payload.businessName || '').trim(),
    vehicleType: String(payload.vehicleType || '').trim(),
    vehicleCount: Number(payload.vehicleCount) || 1,
    serviceStart: payload.serviceStart || '',
    serviceEnd: payload.serviceEnd || '',
    handoverDate: payload.handoverDate || '',
    handoverPlace: payload.handoverPlace || '',
    pricingSummary: payload.pricingSummary || '线路计价',
    unitPriceDefault: Number(payload.unitPriceDefault) || 0,
    status: 'draft',
    attachmentName: payload.attachmentName || '',
    createdAt: nowStamp(),
    activatedAt: '',
    remark: payload.remark || '',
  };
  list.unshift(row);
  saveContracts(list);
  return row;
}

/**
 * 草稿 → 生效；进入可派车；标记可发起交车（原型 toast/handoverHint）
 */
export function activateContract(contractId) {
  const list = loadContracts();
  const idx = list.findIndex((c) => c.id === contractId);
  if (idx < 0) return { ok: false, message: '合同不存在' };
  const c = list[idx];
  if (c.status !== 'draft') {
    return { ok: false, message: `当前状态「${CONTRACT_STATUS[c.status]?.label || c.status}」不可生效` };
  }
  list[idx] = {
    ...c,
    status: 'active',
    activatedAt: nowStamp(),
  };
  saveContracts(list);
  return {
    ok: true,
    contract: list[idx],
    message: `合同 ${c.contractCode} 已生效，可创建调度任务；交车请在调度侧「模拟交车」或运维交车办理`,
    handoverHint: {
      contractCode: c.contractCode,
      handoverDate: c.handoverDate,
      handoverPlace: c.handoverPlace,
      vehicleCount: c.vehicleCount,
    },
  };
}

export function endContract(contractId) {
  const list = loadContracts();
  const idx = list.findIndex((c) => c.id === contractId);
  if (idx < 0) return { ok: false, message: '合同不存在' };
  const open = loadDispatchTasks().filter(
    (t) => t.contractId === contractId && !['completed', 'cancelled'].includes(t.status),
  );
  if (open.length > 0) {
    return { ok: false, message: `仍有 ${open.length} 条未办结调度任务，无法结束合同` };
  }
  list[idx] = { ...list[idx], status: 'ended' };
  saveContracts(list);
  return { ok: true, message: `合同 ${list[idx].contractCode} 已结束` };
}

// —— 调度任务 ——

function seedDispatchTasks() {
  return [
    {
      id: 'sdt-seed-001',
      taskCode: 'DD-2026-0001',
      contractId: 'soc-seed-001',
      contractCode: 'ZY-2026-0001',
      businessName: '深圳南山短驳项目',
      customerName: '深圳城配物流有限公司',
      planDate: '2026-07-18',
      routeDesc: '坪山基地 → 南山仓 A',
      multiTrip: '否',
      routePricing: '线路计价',
      unitPrice: 1800,
      quantity: 1,
      plateNo: '粤BH2002',
      driver: '陈志强',
      phone: '13800138001',
      status: 'assigned',
      salary: 350,
      remark: '种子任务：车辆已在自营态，可直接办结演示自动台账',
      createdAt: '2026-07-15 11:00',
      assignedAt: '2026-07-15 11:05',
      completedAt: '',
      ledgerRowId: '',
    },
  ];
}

export function loadDispatchTasks() {
  const stored = readJson(SO_DISPATCH_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  const seed = seedDispatchTasks();
  writeJson(SO_DISPATCH_STORAGE_KEY, seed);
  return seed;
}

export function saveDispatchTasks(list) {
  writeJson(SO_DISPATCH_STORAGE_KEY, list || []);
}

export function createDispatchTask(payload) {
  const contract = getContractById(payload.contractId);
  if (!contract) return { ok: false, message: '请选择自营合同' };
  if (!['active', 'performing'].includes(contract.status)) {
    return { ok: false, message: '仅生效/履约中的合同可创建调度任务' };
  }
  const list = loadDispatchTasks();
  const n = list.length + 1;
  const plateNo = String(payload.plateNo || '').trim();
  const hasPlate = Boolean(plateNo);
  const row = {
    id: `sdt-${Date.now()}`,
    taskCode: `DD-2026-${String(n).padStart(4, '0')}`,
    contractId: contract.id,
    contractCode: contract.contractCode,
    businessName: contract.businessName,
    customerName: contract.customerName,
    planDate: payload.planDate || todayDate(),
    routeDesc: String(payload.routeDesc || '').trim(),
    multiTrip: payload.multiTrip === '是' ? '是' : '否',
    routePricing: payload.routePricing || contract.pricingSummary || '线路计价',
    unitPrice: Number(payload.unitPrice ?? contract.unitPriceDefault) || 0,
    quantity: Number(payload.quantity) || 1,
    plateNo,
    driver: String(payload.driver || '').trim(),
    phone: String(payload.phone || '').trim(),
    status: hasPlate ? 'assigned' : 'pending_assign',
    salary: Number(payload.salary) || 0,
    remark: String(payload.remark || '').trim(),
    createdAt: nowStamp(),
    assignedAt: hasPlate ? nowStamp() : '',
    completedAt: '',
    ledgerRowId: '',
  };
  list.unshift(row);
  saveDispatchTasks(list);
  if (contract.status === 'active') {
    const contracts = loadContracts();
    const cidx = contracts.findIndex((c) => c.id === contract.id);
    if (cidx >= 0) {
      contracts[cidx] = { ...contracts[cidx], status: 'performing' };
      saveContracts(contracts);
    }
  }
  return { ok: true, task: row, message: `已创建调度任务 ${row.taskCode}` };
}

export function assignDispatchTask(taskId, payload) {
  const list = loadDispatchTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx < 0) return { ok: false, message: '任务不存在' };
  const t = list[idx];
  if (['completed', 'cancelled'].includes(t.status)) {
    return { ok: false, message: '已办结/已取消任务不可改派' };
  }
  const plateNo = String(payload.plateNo || '').trim();
  if (!plateNo) return { ok: false, message: '请选择车牌' };
  list[idx] = {
    ...t,
    plateNo,
    driver: String(payload.driver || t.driver || '').trim(),
    phone: String(payload.phone || t.phone || '').trim(),
    status: 'assigned',
    assignedAt: nowStamp(),
  };
  saveDispatchTasks(list);
  return { ok: true, task: list[idx], message: `已派车 ${plateNo}` };
}

export function startDispatchTask(taskId) {
  const list = loadDispatchTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx < 0) return { ok: false, message: '任务不存在' };
  const t = list[idx];
  if (t.status !== 'assigned') {
    return { ok: false, message: '仅「已派」任务可开始执行' };
  }
  if (!t.plateNo) return { ok: false, message: '请先派车' };
  list[idx] = { ...t, status: 'in_progress' };
  saveDispatchTasks(list);
  return { ok: true, task: list[idx], message: '任务已进入执行中' };
}

export function cancelDispatchTask(taskId) {
  const list = loadDispatchTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx < 0) return { ok: false, message: '任务不存在' };
  const t = list[idx];
  if (t.status === 'completed') {
    return { ok: false, message: '已办结任务不可取消（台账行已生成）' };
  }
  if (t.status === 'cancelled') return { ok: true, task: t, message: '任务已是取消状态' };
  list[idx] = { ...t, status: 'cancelled' };
  saveDispatchTasks(list);
  return { ok: true, task: list[idx], message: `已取消 ${t.taskCode}` };
}

/**
 * 办结 → 自动生成台账行（严格：车辆须已交车）
 */
export function completeDispatchTask(taskId, confirmPayload) {
  const list = loadDispatchTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx < 0) return { ok: false, message: '任务不存在' };
  const t = list[idx];
  if (t.status === 'completed') {
    return { ok: false, message: '任务已办结', ledgerRowId: t.ledgerRowId };
  }
  if (t.status === 'cancelled') {
    return { ok: false, message: '已取消任务不可办结' };
  }
  if (!t.plateNo) return { ok: false, message: '请先派车再办结' };

  const ops = getVehicleOpsStatus(t.plateNo);
  if (ops !== VEHICLE_OPS.self_operated) {
    return {
      ok: false,
      code: 'NEED_HANDOVER',
      message: `${t.plateNo} 尚未交车（当前非自营运营态），请先「模拟交车」或完成运维交车后再办结`,
    };
  }

  const dispatchDate = (confirmPayload && confirmPayload.dispatchDate) || t.planDate || todayDate();
  const quantity = Number(confirmPayload?.quantity ?? t.quantity) || 1;
  const unitPrice = Number(confirmPayload?.unitPrice ?? t.unitPrice) || 0;
  const salary = Number(confirmPayload?.salary ?? t.salary) || 0;
  const remark = String(confirmPayload?.remark ?? t.remark ?? '').trim();

  const year = dispatchDate.slice(0, 4);
  const month = String(Number(dispatchDate.slice(5, 7)) || 1);
  const amount = computeAmount(unitPrice, quantity);
  const ledgerDraft = {
    id: `auto-${t.id}`,
    year,
    month,
    dispatchDate,
    businessName: t.businessName,
    driver: t.driver,
    phone: t.phone,
    plateNo: t.plateNo,
    systemVehicleType: brandModelOf(t.plateNo),
    unitPrice,
    quantity,
    amount,
    hydrogenFee: 0,
    etcFee: 0,
    salary,
    electricityFee: 0,
    manualReimbursement: 0,
    dailySocialSecurityFee: 0,
    dailyTrailerServiceFee: 0,
    dailyTrailerFee: 0,
    dailyParkingFee: 0,
    dailyTireFee: 0,
    vehicleFee: 0,
    totalCost: 0,
    profitLoss: 0,
    multiTrip: t.multiTrip || '否',
    routePricing: t.routePricing || '线路计价',
    remark: remark ? `[调度自动·${t.taskCode}] ${remark}` : `[调度自动·${t.taskCode}]`,
    rowSource: 'auto',
    dispatchTaskId: t.id,
    dispatchTaskCode: t.taskCode,
    contractCode: t.contractCode,
  };
  ledgerDraft.totalCost = computeTotalCost(ledgerDraft);
  ledgerDraft.profitLoss = roundMoney(amount - ledgerDraft.totalCost);

  const autoRows = loadAutoLedgerRows();
  const withoutDup = autoRows.filter((r) => r.dispatchTaskId !== t.id && r.id !== ledgerDraft.id);
  withoutDup.unshift(ledgerDraft);
  saveAutoLedgerRows(withoutDup);

  list[idx] = {
    ...t,
    status: 'completed',
    quantity,
    unitPrice,
    salary,
    remark,
    completedAt: nowStamp(),
    ledgerRowId: ledgerDraft.id,
  };
  saveDispatchTasks(list);

  return {
    ok: true,
    task: list[idx],
    ledgerRow: ledgerDraft,
    message: `已办结 ${t.taskCode}，并自动生成物流业务明细 1 行`,
  };
}

// —— 台账自动行 ——

export function loadAutoLedgerRows() {
  const stored = readJson(SO_LEDGER_AUTO_STORAGE_KEY, null);
  return Array.isArray(stored) ? stored : [];
}

export function saveAutoLedgerRows(list) {
  writeJson(SO_LEDGER_AUTO_STORAGE_KEY, list || []);
}

export function removeAutoLedgerRow(rowId) {
  const next = loadAutoLedgerRows().filter((r) => r.id !== rowId);
  saveAutoLedgerRows(next);
  return next;
}

/**
 * 合并种子/当前列表与自动生成行：自动行按 id 覆盖同 id，其余追加到顶部
 */
export function mergeLedgerWithAutoRows(baseRows) {
  const auto = loadAutoLedgerRows();
  const autoIds = new Set(auto.map((r) => r.id));
  const rest = (baseRows || []).filter((r) => !autoIds.has(r.id));
  return [...auto, ...rest];
}

export function subscribeSelfOperatedBridge(handler) {
  const fn = (e) => handler(e?.detail);
  window.addEventListener('oneos-self-operated-bridge', fn);
  window.addEventListener('storage', fn);
  return () => {
    window.removeEventListener('oneos-self-operated-bridge', fn);
    window.removeEventListener('storage', fn);
  };
}
