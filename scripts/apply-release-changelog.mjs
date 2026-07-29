/**
 * 将版本发布的功能变更说明写入 prototype-registry.json（覆盖 commit 131b963 对应条目）。
 *
 * 用法：node scripts/apply-release-changelog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(projectRoot, 'src/prototypes/oneos-prototype-nav/prototype-registry.json');
const RELEASE_COMMIT = '131b963';
const RELEASE_DATE = '2026-07-12';
const RELEASE_TIME = '22:45';
const MAX_RECENT = 40;

/** @type {Record<string, { summary: string, details: string[] }>} */
const RELEASE_NOTES = {
  'oneos-prototype-nav': {
    summary: '统一标注壳与操作规范，租赁明细/合同/提车应收款增强，新增任务工单，同步合包页面',
    details: [
      '【平台】全项目接入 PrototypeAnnotationHost，PRD 迁入右侧标注目录；列表统一 OperationActions 与工具栏图标规范',
      '【租赁业务明细】收款状态列、47 列宽表、氢费钻取、字段校验、变更记录、导入导出与主管解锁',
      '【租赁合同】KPI/状态收敛、查看页、线上/线下签署、交付变更、附加费用与提车应收联动',
      '【提车应收款】独立原型上线；finance 合包仅保留租赁账单；工作台快捷入口改跳独立原型',
      '【任务工单】新增业管发起端：合同/独立双入口、六类任务类型与督办催办',
      '【合包】business/ops/finance/ledger-data/lease-contract/h2-station 等移除面包屑并标准化操作区',
      '【下线】移除 login/requirements/vehicle-asset 合包；侧栏新增任务工单与提车应收款',
      '【发布】导航页固定发布至 /oneos-prototype-nav/index.html',
    ],
  },
  'lease-business-detail': {
    summary: '租赁业务明细大改版：收款状态、47 列宽表、字段校验与变更记录',
    details: [
      '新增收款状态列（未收款/部分收款/已结清）；月份、部门+业务员合并展示；表尾 23 项金额汇总',
      '氢费可钻取 Popover；编辑/删除/变更记录；公式列（应收合计、未收、盈亏、氢费等）自动重算',
      '客户/提车日期/租金等与车辆/客户/合同交叉校验，支持一键替换建议值',
      '批量导入 36 列手工字段、导出 47 列；部分成功 + 错误日志；已对账锁定与主管解锁',
    ],
  },
  'lease-contract-management': {
    summary: '租赁合同增强：KPI/状态收敛、查看页、签署方式与提车应收联动',
    details: [
      '列表 KPI：全部/草稿/进行中/审批中/已终止；合同状态收敛；在租车队 KPI 迁至车辆管理',
      '筛选：合同模板类型 + 标准合同名称二级联动；统一流程入口（新增/续签/转正式/增车等）',
      '新增只读查看页；线上电子签章 / 线下人工上传；主动终止与交付安排变更（Cascader/TBD）',
      '附加费用拆分已有/新增服务项；红线条款 + 新增条款检测；先付后用/先用后付',
      '提交审批与交付计划变更同步提车应收 bridge',
    ],
  },
  'lease-business-ledger': {
    summary: '租赁业务台账：操作区统一为 OperationActions，标注壳切换',
    details: [
      '行操作：编辑 / 操作记录 / 保存（编辑态）',
      '关联收款、事故/维保/收据链接弹窗保留',
      '接入 PrototypeAnnotationHost，移除内嵌原型导航目录',
    ],
  },
  'self-operated-business-ledger': {
    summary: '物流业务明细：更名、列对齐 Excel、批量导入与自动计算',
    details: [
      '模块更名：物流业务台账 → 物流业务明细',
      '列对齐 Excel 1.2：薪资、电费、日社保/挂车/停车/轮胎、线路计价等；系统车型列',
      '新增批量导入：模板下载、错误日志、导入后自动计算金额/总成本/盈亏',
      '移除行勾选与批量删除',
    ],
  },
  'business-dept-ledger': {
    summary: '业务部台账：分组表头与表格可读性增强',
    details: [
      '统一边框 token、分组表头双层样式（业务板块 + 业绩/成本/盈亏）',
      '冻结列滚动修复；金额列防裁切；盈亏钻取链接样式调整',
    ],
  },
  'vehicle-management': {
    summary: '车辆管理：在租车队 KPI 迁入、车型分布弹窗与列表样式优化',
    details: [
      '在租车队 KPI 从租赁合同列表迁入；按品牌型号统计在租数量',
      '车型分布弹窗：品牌筛选、车型卡片、占比进度条、车辆明细',
      '详情 Tab 与列表筛选/导入/KPI 操作区统一；表格样式优化',
    ],
  },
  'customer-management': {
    summary: '客户管理：OperationActions 统一操作列，移除面包屑',
    details: [
      '列表操作：详情 / 编辑 / 管理标签 / 删除',
      '风险标签、批量打标等业务逻辑不变',
    ],
  },
  'contract-template-management': {
    summary: '合同模板：启用/停用、先付后用/先用后付变量与操作区重构',
    details: [
      '行操作：编辑 + 更多（启用/停用、版本日志、删除）；启用中不可编辑/删除',
      '模板变量新增 paymentMethod；付款周期与氢费结算文案更新',
    ],
  },
  'insurance-procurement': {
    summary: '保险采购：OperationActions 统一操作列',
    details: [
      '保单列表：编辑 / 预览 / 下载 / 更多',
      '标注壳切换',
    ],
  },
  'vehicle-pickup-receivable': {
    summary: '提车应收款独立原型上线：自动生成/手动办理与合同双向联动',
    details: [
      '收款情况列：租车数 / 已提车（Popover 钻取）',
      '合同提交审批即生成主表；有交付时间则提前 2 天生成应收',
      '手动办理勾选品牌型号与交付时间；15 日前/后分档计费规则',
      '与租赁合同 bridge 联动；finance 合包剥离；工作台入口改跳本原型',
    ],
  },
  'task-work-order': {
    summary: '任务工单新原型：业管发起端（合同/独立双入口）',
    details: [
      '任务类型：里程履约、维保履约、政策兑现、付款/交付节点、条款跟进、通用临时',
      '列表 KPI：全部/我发布的/我督办的 + 状态视角；详情含进度、反馈、催办',
      '执行人不可见合同原文与金额（第一版仅业管端）',
    ],
  },
  'payment-records': {
    summary: '收款记录：OperationActions 与关联账单操作',
    details: [
      '操作列标准化；表格新增「关联账单」',
      '标注壳切换',
    ],
  },
  'supplier-management': {
    summary: '供应商管理：工具栏与操作区图标标准化',
    details: [
      '新增供应商按钮图标统一；删除收入 OperationActions',
    ],
  },
  'oneos-web-business': {
    summary: '业务管理合包：18 页移除面包屑，OperationActions 统一',
    details: [
      '保险采购、交车任务、客户/供应商、租赁账单、ETC 管理等页操作区标准化',
    ],
  },
  'oneos-web-ops': {
    summary: '运维管理合包：45 页操作列与工具栏按钮标准化',
    details: [
      '备件/调拨/交还车/故障/异动/证件/型号参数等页 OperationActions 与 data-vm-icon 图标',
    ],
  },
  'oneos-web-finance': {
    summary: '财务管理合包：提车应收款剥离，仅保留租赁账单',
    details: [
      '提车应收款 6 页移除；合包默认页改为租赁账单',
      '提车流程由 vehicle-pickup-receivable 独立原型承接',
    ],
  },
  'oneos-web-ledger-data': {
    summary: '台账数据合包：5 页操作区标准化',
    details: [
      '保险分摊、氢费、维修明细、氢费采购端汇总、租赁业务台账等页 OperationActions',
    ],
  },
  'oneos-web-lease-contract': {
    summary: '租赁合同合包：8 子页同步签署/流程字段与 OperationActions',
    details: [
      '新增、续签、转正式、三方变更、附加费用等子页操作区标准化',
      '修复移除面包屑后的 JSX 括号语法',
    ],
  },
  'oneos-web-data-analysis': {
    summary: '数据分析合包：业务部台账列宽与盈亏着色优化',
    details: [
      '9 页操作区标准化；业务部台账列宽加大；盈亏负值着色',
    ],
  },
  'oneos-web-h2-station': {
    summary: '加氢站合包：站点信息编辑提升为主操作',
    details: [
      '加氢订单/记录/站点信息 3 页 OperationActions；站点编辑不再藏在「更多」',
    ],
  },
  'oneos-web-workbench': {
    summary: '工作台：提车应收款快捷入口改跳独立原型',
    details: [
      '快捷入口指向 /prototypes/vehicle-pickup-receivable',
      'protoNav 支持直接 location 跳转原型 URL',
    ],
  },
  'oneos-web-contract-template': {
    summary: '合同模板合包：操作区与独立原型对齐',
    details: ['模板管理页 OperationActions 统一'],
  },
  'oneos-web-procurement': {
    summary: '采购管理合包：三方退租车页操作区标准化',
    details: ['退租申请与管理页 OperationActions'],
  },
  'oneos-web-h2-station-site': {
    summary: '站点信息：标注目录清理',
    details: ['移除内嵌原型导航节点；标注壳切换'],
  },
  'lease-business-line-overview': {
    summary: '业务条线说明：标注目录微调',
    details: ['条线数据更新；移除内嵌导航节点'],
  },
  'vehicle-h2-fee-ledger': {
    summary: '车辆氢费明细：标注壳与操作区统一',
    details: ['OperationActions；标注目录规范化'],
  },
  'vehicle-maintenance-ledger': {
    summary: '车辆维修明细：标注壳与操作区统一',
    details: ['OperationActions；标注目录规范化'],
  },
  'vehicle-return-settlement-v2': {
    summary: '还车应结算 V2：OperationActions 统一为详情主操作',
    details: ['列表操作列标准化'],
  },
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function applyReleaseNotes(registry) {
  let updated = 0;
  for (const [prototypeId, notes] of Object.entries(RELEASE_NOTES)) {
    const record = registry.prototypes?.[prototypeId];
    if (!record) continue;

    const changelog = Array.isArray(record.changelog) ? [...record.changelog] : [];
    let targetIndex = changelog.findIndex((entry) => entry.commit === RELEASE_COMMIT);
    if (targetIndex < 0 && changelog.length > 0) targetIndex = 0;

    const base = targetIndex >= 0 ? changelog[targetIndex] : {
      version: record.version,
      date: RELEASE_DATE,
      time: RELEASE_TIME,
      files: record.trackedFiles?.slice(0, 12) || [],
    };

    const nextEntry = {
      ...base,
      date: RELEASE_DATE,
      time: RELEASE_TIME,
      summary: notes.summary,
      details: notes.details,
      commit: RELEASE_COMMIT,
    };

    if (targetIndex >= 0) {
      changelog[targetIndex] = nextEntry;
    } else {
      changelog.unshift(nextEntry);
    }

    record.changelog = changelog.slice(0, 30);
    record.lastUpdated = `${RELEASE_DATE}T14:45:00.000Z`;
    updated += 1;
  }

  const recent = [];
  for (const [prototypeId, notes] of Object.entries(RELEASE_NOTES)) {
    const record = registry.prototypes?.[prototypeId];
    if (!record) continue;
    const entry = record.changelog?.[0];
    if (!entry) continue;
    recent.push({
      prototypeId,
      title: record.title || prototypeId,
      version: entry.version || record.version,
      date: entry.date || RELEASE_DATE,
      time: entry.time || RELEASE_TIME,
      summary: notes.summary,
      details: notes.details,
      files: entry.files || [],
    });
  }

  recent.sort((a, b) => {
    const ta = new Date(`${a.date}T${a.time}:00+08:00`).getTime();
    const tb = new Date(`${b.date}T${b.time}:00+08:00`).getTime();
    return tb - ta;
  });

  registry.recentUpdates = recent.slice(0, MAX_RECENT);
  registry.updatedAt = `${RELEASE_DATE}T14:45:00.000Z`;
  return updated;
}

const registry = readJson(REGISTRY_PATH);
const count = applyReleaseNotes(registry);
writeJson(REGISTRY_PATH, registry);
console.log(`完成：已写入 ${count} 个原型的版本发布变更说明（commit ${RELEASE_COMMIT}）`);
