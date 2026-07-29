import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMermaidInMarkdown } from './render-mermaid-blocks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const protoRoot = path.resolve(__dirname, '..');
const specRoot = path.join(protoRoot, '.spec');
const resourcesPrd = path.resolve(protoRoot, '../../resources/lease-contract-management/PRD.md');

const listPrd = fs.readFileSync(path.join(specRoot, 'requirements-prd-list.md'), 'utf8');
const createPrd = fs.readFileSync(path.join(specRoot, 'requirements-prd-create.md'), 'utf8');
const fullPrd = fs.readFileSync(resourcesPrd, 'utf8');
const flowPrdRaw = fs.readFileSync(path.join(specRoot, 'requirements-flow-operations.md'), 'utf8');
const annotationContextPrd = fs.readFileSync(path.join(specRoot, 'requirements-annotation-context.md'), 'utf8');

const [flowPrd, fullPrdRendered, listPrdRendered, createPrdRendered] = await Promise.all([
  renderMermaidInMarkdown(flowPrdRaw, '操作流程图'),
  renderMermaidInMarkdown(fullPrd, '流程图'),
  renderMermaidInMarkdown(listPrd, '流程图'),
  renderMermaidInMarkdown(createPrd, '流程图'),
]);

const NODE_DEFS = [
  { id: 'lc-list-filter', title: '筛选条件', pageId: 'list', color: '#2563eb', aiPrompt: '列表筛选区字段与查询逻辑。', annotationText: '默认展示 4 项，可展开至 13 项；合同结束日期用 DateRangeFilterField（「至」）；合同模板联动标准合同名称；查询与 KPI 联动。' },
  { id: 'lc-list-kpi', title: 'KPI 统计卡片', pageId: 'list', color: '#64748b', aiPrompt: '五张 KPI 卡片口径与点击筛选。', annotationText: '全部 / 草稿 / 进行中 / 审批中 / 已终止。' },
  { id: 'lc-fleet-summary', title: '在租车辆概览', pageId: 'list', color: '#32a06e', aiPrompt: '按品牌型号统计在租车辆，支持品牌标签筛选。', annotationText: '顶部展示在租总数；品牌标签筛选车型卡片；点击卡片查看车辆明细。' },
  { id: 'lc-list-toolbar', title: '列表工具栏', pageId: 'list', color: '#0f766e', aiPrompt: '费用模板、导出、新增入口。', annotationText: '「新增」进入租赁合同创建页。' },
  { id: 'lc-list-table', title: '合同台账列表', pageId: 'list', color: '#2563eb', aiPrompt: '台账表格列与操作。', annotationText: '' },
  { id: 'lc-list-action-more', title: '更多操作', pageId: 'list', color: '#2563eb', aiPrompt: '列表行更多菜单入口。', annotationText: '' },
  { id: 'lc-action-convert-tripartite', title: '转三方合同', pageId: 'list', color: '#7c3aed', aiPrompt: '进行中合同转三方。', annotationText: '' },
  { id: 'lc-action-trial-to-formal', title: '试用转正式', pageId: 'list', color: '#0f766e', aiPrompt: '试用合同一步转正式。', annotationText: '' },
  { id: 'lc-create-main-contract', title: '主体合同信息', pageId: 'create', color: '#32a06e', aiPrompt: '签约、里程、费用三块表单。', annotationText: '完成度徽章；甲乙档案只读同步。' },
  { id: 'lc-create-signing-method', title: '合同签署方式', pageId: 'create', color: '#0369a1', aiPrompt: '线上电子签章或线下人工上传。', annotationText: '影响电子签发送或盖章合同补传闭环。' },
  { id: 'lc-card-signing', title: '签约信息', pageId: 'create', color: '#0d9488', aiPrompt: '合同编号、甲乙双方与乙方负责人。', annotationText: '' },
  { id: 'lc-credentials-ocr', title: '客户资质证照 OCR', pageId: 'create', color: '#dc2626', aiPrompt: '客户证照 OCR 识别与有效期校验。', annotationText: '' },
  { id: 'lc-signing-customer-principal', title: '乙方负责人', pageId: 'create', color: '#0d9488', aiPrompt: '乙方签约对接负责人。', annotationText: '' },
  { id: 'lc-create-lease-order', title: '附件1：租赁订单', pageId: 'create', color: '#2563eb', aiPrompt: '订单车辆与交车信息。', annotationText: '三者责任险等为完成度必填项。' },
  { id: 'lc-lease-order-brand-model', title: '品牌车型与在库', pageId: 'create', color: '#0f766e', aiPrompt: '选择车型后展示全国在库台数。', annotationText: '运营状态为「可运营」「待运营」计为在库；数据来自车辆管理主数据。' },
  { id: 'lc-lease-order-rent', title: '车辆租金与最低租金', pageId: 'create', color: '#c2410c', aiPrompt: '租金低于车型最低值触发非标审批。', annotationText: '最低租金可在后台按品牌·型号配置；原型配置见 lease-order-vars.js。' },
  { id: 'lc-lease-order-service-content', title: '服务项配置', pageId: 'create', color: '#7c3aed', aiPrompt: '服务项后台可配置与计价规则。', annotationText: '' },
  { id: 'lc-lease-order-lease-period', title: '租赁期限与到期计算', pageId: 'create', color: '#0369a1', aiPrompt: '租期两种计算模式与合同到期规则。', annotationText: '' },
  { id: 'lc-create-poa', title: '授权委托书', pageId: 'create', color: '#7c3aed', aiPrompt: '受托人列表编辑。', annotationText: '至少一行且姓名/联系方式/身份证完整。' },
  { id: 'lc-create-contract-remark', title: '合同备注', pageId: 'create', color: '#64748b', aiPrompt: '独立卡片填写合同备注。', annotationText: '选填，最多 500 字；与授权委托书分离。' },
  { id: 'lc-create-seal', title: '用章类型', pageId: 'create', color: '#7c3aed', aiPrompt: '电子签章用章类型多选。', annotationText: '' },
  { id: 'lc-create-preview', title: '实时预览', pageId: 'create', color: '#0ea5e9', aiPrompt: 'Word 版式预览与可编辑正文。', annotationText: '改动风控红线条款将触发非标准合同。' },
  { id: 'lc-create-footer', title: '底栏操作', pageId: 'create', color: '#64748b', aiPrompt: '取消、保存草稿、提交审核。', annotationText: '保存/提交时展示将走的审批类型。' },
];

const prdByKey = { list: listPrdRendered, create: createPrdRendered };

function extractSection(md, startHeading) {
  const lines = md.split('\n');
  let start = lines.findIndex((line) => line.trim() === startHeading || line.startsWith(startHeading));
  if (start < 0) return null;
  const startLevel = (lines[start].match(/^(#+)/)?.[1] ?? '##').length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      const level = lines[i].match(/^(#+)/)?.[1].length ?? 2;
      if (level <= startLevel) {
        end = i;
        break;
      }
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function extractFromPrd({ prd, heading, sub, combine }) {
  const md = prdByKey[prd];
  if (!md) return null;
  if (combine?.length) {
    return combine.map((h) => extractSection(md, h)).filter(Boolean).join('\n\n---\n\n') || null;
  }
  const base = extractSection(md, heading);
  if (!base) return null;
  if (!sub) return base;
  return extractSection(base, sub) ?? base;
}

const NODE_PRD_MAP = {
  'lc-list-filter': { prd: 'list', heading: '## 4. 筛选区' },
  'lc-list-kpi': { prd: 'list', heading: '## 5. KPI 统计卡片' },
  'lc-list-toolbar': { prd: 'list', heading: '## 6. 列表工具栏' },
  'lc-list-table': { prd: 'list', heading: '## 7. 列表字段说明', combine: ['## 7. 列表字段说明', '## 8. 操作与弹窗'] },
  'lc-create-main-contract': { prd: 'create', heading: '## 2. 主体合同信息' },
  'lc-create-lease-order': { prd: 'create', heading: '## 3. 附件1：租赁订单' },
  'lc-lease-order-brand-model': { prd: 'create', heading: '## 3. 附件1：租赁订单', sub: '### 3.1 品牌车型' },
  'lc-lease-order-rent': { prd: 'create', heading: '## 3. 附件1：租赁订单', sub: '### 3.2 租金' },
  'lc-lease-order-service-content': { prd: 'create', heading: '## 3. 附件1：租赁订单', sub: '### 3.3 服务内容' },
  'lc-create-poa': { prd: 'create', heading: '## 4. 授权委托书' },
  'lc-create-contract-remark': { prd: 'create', heading: '## 5. 合同备注' },
  'lc-create-preview': { prd: 'create', heading: '## 6. 实时预览', combine: ['## 6. 实时预览', '## 7. 审批类型判定'] },
  'lc-create-footer': { prd: 'create', heading: '## 8. 底栏操作' },
};


const CUSTOM_NODE_MARKDOWN = {
  'lc-lease-order-brand-model': `# 品牌车型与在库

选择品牌 / 型号后，在选框下方展示该车型**全国在库**台数。

- 统计口径：车辆管理中运营状态为「可运营」或「待运营」
- 按品牌 + 型号精确匹配
- 用于签约前评估库存是否满足交付需求`,
  'lc-lease-order-rent': `# 车辆租金与最低租金

- 车型最低租金可在后台按「品牌 · 型号」配置（原型见 \`LEASE_VEHICLE_MIN_RENT_BY_MODEL\`）
- 录入租金 **低于** 系统最低值时，行内提示并自动判定为 **非标准合同** 审批
- 与风控红线条款修改规则并列生效`,
  'lc-lease-order-service-content': `# 服务项配置需求

1. **后台可配置**：支持新增、编辑、自定义服务项名称和计价规则；后续新增服务项可直接在签合同环节选用，无需迭代修改产品。

2. **两类计价逻辑**：
   - **固定金额类**：如无忧包、尾板服务费，直接录入固定总价，计入合同初始服务费合计
   - **动态计费类**：如维保费、运保费，仅在合同中展示约定单价（例：0.1 元/公里），不计入合同初始总价；后续按每月实际行驶里程核算后合并计入租金账单，首期账单默认不包含该类动态服务费

3. **合同同步**：所有选中的服务项自动同步展示到正式合同对应章节，支持单独添加备注说明，作为合同不可缺失的组成部分。`,
  'lc-signing-customer-principal': `# 乙方负责人

选择乙方后，在签约信息中补充填写：

- **乙方负责人姓名**：签约对接负责人，可与客户档案中的联系人不同
- **乙方负责人手机号**：E签宝电子合同签章时乙方经办人

**签署闭环：**

- **线上电子签章**：审批通过后自动向该手机号发送 E签宝电子签章文件
- **线下人工上传**：审批通过不发送电子签，需在列表「盖章合同补传」上传 PDF/图片，查看时可预览与下载全部附件`,
  'lc-fleet-summary': `# 在租车辆概览

按品牌型号统计在租车辆，支持品牌标签筛选。

## 说明

顶部展示在租总数；品牌标签筛选车型卡片；点击卡片查看车辆明细。`,
  'lc-credentials-ocr': `# 客户资质证照（OCR 与有效期）

对 **客户营业执照**、**法人身份证正反面**、**道路运输许可证** 做 OCR 识别，校验有效期。

| 规则 | 说明 |
|---|---|
| OCR | 上传后自动识别证照信息与有效期 |
| 即将到期 | 距到期 ≤ 3 个月时，工作台提前生成待办推送给业管 |
| 已过期 | 业管未更新前，禁止提交新合同 |
| 页面展示 | 缩略图旁显示 OCR 标识、有效期与状态徽章；临期/过期时顶部展示提示条`,
  'lc-create-seal': `# 用章类型（第 6 步）

支持多选，可选范围仅包含：

| 用章 | 说明 |
|---|---|
| 合同章 | 合同正文用章 |
| 公章 | 公司公章 |
| 法人章 | 法定代表人章 |

**不含**财务章、发票章。

默认选中合同章；至少选择一种用章后方可提交审核。

**提示**：额外勾选公章、法人章会进入非标审批流程。`,
  'lc-create-signing-method': `# 合同签署方式

与「选择合同类型」同一步配置，可选：

| 方式 | 说明 |
|---|---|
| 线上电子签章 | 审批通过后向乙方负责人手机号发送 E签宝文件并自动归档 |
| 线下人工上传 | 不发送电子签，审批通过后通过列表「盖章合同补传」完成闭环 |`,
  'lc-lease-order-lease-period': `# 租赁期限与到期计算

租赁到期时间支持两种计算模式：

## 1. 固定日期模式

手动指定合同的开始日期与结束日期；系统到达设定的结束日期时，自动标记合同为过期状态。

## 2. 租期月数模式

无需手动指定起止日期，仅输入租赁总月数。系统自动以 **车辆实际交付时间** 作为租期起始点，向后顺延对应月数，自动计算合同到期日期；到达该日期后自动标记合同为过期。

### 多车合同

当合同下关联多台车辆时，按固定月份规则取当前合同下 **第一辆到期** 的车辆到期时间，作为合同整体到期时间。

> 原型表格列「租赁期限（月）」当前展示租期月数模式输入；固定日期模式在正式产品中于同行或弹层切换。`,
  'lc-list-action-more': `# 更多操作

列表操作列「更多」入口，按合同状态与类型展示不同菜单项。

- **合同进行中**：含转三方合同、续签、增车等
- **试用合同**：含试用转正式`,
  'lc-action-convert-tripartite': `# 转三方合同

**显示条件**：合同状态为「合同进行中」。

**能力**：

1. 支持 **新增多条三方协议**（协议名称）
2. 每条协议可上传 **三方协议附件**
3. 每条协议可上传 **对方公函**

提交后走变更审批（原型演示 Toast）。`,
  'lc-action-trial-to-formal': `# 试用转正式

**显示条件**：合同类型为「试用合同」。

**单步完成**（转正式与转三方可合并，无需分两步）：

1. **自动拉取**当前合同的客户信息、授权人、车辆订单
2. **车辆订单可编辑**（品牌、型号、车牌、租金、租期月数等）
3. 可勾选 **同时转三方合同**，在同一步新增三方协议并上传附件/公函

提交后生成正式合同并走审批（原型演示 Toast）。`,
};

function buildFallbackMarkdown(node) {
  const parts = [`# ${node.title}`, ''];
  if (node.aiPrompt) parts.push(node.aiPrompt, '');
  if (node.annotationText?.trim()) parts.push('## 说明', '', node.annotationText.trim());
  return parts.join('\n').trim();
}

function buildNodeMarkdown(node) {
  if (CUSTOM_NODE_MARKDOWN[node.id]) {
    return CUSTOM_NODE_MARKDOWN[node.id];
  }
  const mapping = NODE_PRD_MAP[node.id];
  if (mapping) {
    const prdBody = extractFromPrd(mapping);
    if (prdBody) return prdBody;
  }
  return buildFallbackMarkdown(node);
}

const now = Date.now();
const nodes = NODE_DEFS.map((def, index) => ({
  id: def.id,
  index: index + 1,
  title: def.title,
  pageId: def.pageId,
  locator: {
    selectors: [`[data-annotation-id="${def.id}"]`],
    fingerprint: def.id,
    path: [],
  },
  aiPrompt: def.aiPrompt,
  annotationText: def.annotationText,
  hasMarkdown: true,
  color: def.color,
  images: [],
  createdAt: 1740787200000,
  updatedAt: 1740787200000,
}));

const markdownMap = Object.fromEntries(nodes.map((node) => [node.id, buildNodeMarkdown(node)]));

const listPageNodes = nodes.filter((n) => n.pageId === 'list');
const createPageNodes = nodes.filter((n) => n.pageId === 'create');

function buildOverviewMarkdown(fullPrdText, listPrdText) {
  const parts = [
    '# 租赁合同管理 · 模块总览',
    '商用车租赁合同全生命周期管理：台账筛选与 KPI 监控、结构化草拟与实时预览、标准/非标准审批判定、进行中变更与法务归档。',
  ];

  const modulePosition = extractSection(listPrdText, '## 1. 模块定位');
  if (modulePosition) parts.push(modulePosition);

  for (const heading of [
    '## 1. 背景与目标',
    '## 2. 用户与场景',
    '## 3. 名词解释',
    '## 4. 信息架构',
    '## 6. 业务规则（全局）',
    '## 9. 与其他模块的关系',
    '## 12. 验收标准',
  ]) {
    const body = extractSection(fullPrdText, heading);
    if (body) parts.push(body);
  }

  return parts.join('\n\n---\n\n').trim() || '# 租赁合同管理';
}

const overviewMd = buildOverviewMarkdown(fullPrdRendered, listPrdRendered);

const source = {
  documentVersion: 1,
  format: 'axhub-annotation-source',
  data: {
    version: 2,
    prototypeName: 'lease-contract-management',
    pageId: 'list',
    updatedAt: now,
    nodes,
  },
  markdownMap,
  assetMap: {},
  directory: {
    nodes: [
      {
        type: 'folder',
        id: 'lc-doc-root',
        title: '租赁合同管理说明',
        defaultExpanded: true,
        children: [
          {
            type: 'markdown',
            id: 'lc-doc-overview',
            title: '模块总览',
            markdown: overviewMd,
          },
          {
            type: 'link',
            id: 'lc-link-template',
            title: '合同模板管理',
            href: '/prototypes/contract-template-management',
            target: 'self',
          },
          {
            type: 'folder',
            id: 'lc-doc-prd',
            title: 'PRD 全文',
            defaultExpanded: true,
            children: [
              {
                type: 'markdown',
                id: 'lc-doc-prd-full',
                title: 'PRD 完整文档',
                markdown: fullPrdRendered,
                markdownPath: 'src/resources/lease-contract-management/PRD.md',
              },
              {
                type: 'markdown',
                id: 'lc-doc-prd-list',
                title: '列表页 PRD',
                markdown: listPrdRendered,
                markdownPath: 'src/prototypes/lease-contract-management/.spec/requirements-prd-list.md',
              },
              {
                type: 'markdown',
                id: 'lc-doc-prd-create',
                title: '新增页 PRD',
                markdown: createPrdRendered,
                markdownPath: 'src/prototypes/lease-contract-management/.spec/requirements-prd-create.md',
              },
              {
                type: 'markdown',
                id: 'lc-doc-prd-acceptance',
                title: '验收标准',
                markdown: extractSection(fullPrdRendered, '## 12. 验收标准') ?? '## 验收标准',
              },
              {
                type: 'markdown',
                id: 'lc-doc-annotation-context',
                title: '标注与原型上下文',
                markdown: annotationContextPrd,
                markdownPath: 'src/prototypes/lease-contract-management/.spec/requirements-annotation-context.md',
              },
            ],
          },
          {
            type: 'folder',
            id: 'lc-doc-flows',
            title: '操作流程',
            defaultExpanded: false,
            children: [
              {
                type: 'markdown',
                id: 'lc-doc-flow-overview',
                title: '全流程总览',
                markdown: extractSection(flowPrd, '## 1. 总览：从新增到履约结束') ?? flowPrd,
                markdownPath: 'src/prototypes/lease-contract-management/.spec/requirements-flow-operations.md',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-create-forward',
                title: '新增合同 · 正向',
                markdown: extractSection(flowPrd, '## 2. 新增合同 · 正向流程') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-create-reverse',
                title: '新增合同 · 逆向',
                markdown: extractSection(flowPrd, '## 3. 新增合同 · 逆向流程') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-fulfill',
                title: '履约 · 交还车',
                markdown: extractSection(flowPrd, '## 4. 履约正向：交车 → 还车 → 结清') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-fulfill-reverse',
                title: '履约 · 逆向与异常',
                markdown: extractSection(flowPrd, '## 5. 履约逆向与异常') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-change-forward',
                title: '进行中变更 · 正向',
                markdown: extractSection(flowPrd, '## 6. 进行中变更 · 正向流程') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-change-reverse',
                title: '进行中变更 · 逆向',
                markdown: extractSection(flowPrd, '## 7. 进行中变更 · 逆向流程') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-delivery-edit',
                title: '交车安排编辑',
                markdown: extractSection(flowPrd, '## 8. 交车安排编辑（列表与子表）') ?? '',
              },
              {
                type: 'markdown',
                id: 'lc-doc-flow-matrix',
                title: '操作与状态对照表',
                markdown: extractSection(flowPrd, '## 9. 操作与状态对照表') ?? '',
              },
            ],
          },
          {
            type: 'folder',
            id: 'lc-doc-list',
            title: '列表页模块',
            defaultExpanded: true,
            children: [
              {
                type: 'route',
                id: 'lc-route-list',
                title: '打开列表页',
                route: 'lease-contract:list',
                payload: { pageId: 'list' },
              },
              ...listPageNodes.map((node) => ({
                type: 'markdown',
                id: `lc-doc-node-${node.id}`,
                title: node.title,
                markdown: markdownMap[node.id],
              })),
            ],
          },
          {
            type: 'folder',
            id: 'lc-doc-create',
            title: '新增页模块',
            defaultExpanded: false,
            children: [
              {
                type: 'route',
                id: 'lc-route-create',
                title: '打开新增页',
                route: 'lease-contract:create',
                payload: { pageId: 'create' },
              },
              ...createPageNodes.map((node) => ({
                type: 'markdown',
                id: `lc-doc-node-${node.id}`,
                title: node.title,
                markdown: markdownMap[node.id],
              })),
            ],
          },
          {
            type: 'markdown',
            id: 'lc-doc-annotation-hint',
            title: '标注查看提示',
            markdown: '## 标注查看提示\n\n右侧标注工具栏可浏览目录、切换主题与颜色筛选。列表页与新增页标注按当前页面自动显隐。\n\n**PRD 同步**：修改 `src/resources/lease-contract-management/PRD.md` 或 `.spec/requirements-prd-*.md`、`.spec/requirements-flow-operations.md` 后，运行 `node src/prototypes/lease-contract-management/scripts/build-annotation-source.mjs` 重新生成 `annotation-source.json`（含 Mermaid 流程图预渲染为 SVG 图片）。',
          },
        ],
      },
    ],
  },
};

fs.writeFileSync(
  path.join(protoRoot, 'annotation-source.json'),
  `${JSON.stringify(source, null, 2)}\n`,
  'utf8',
);

console.log(`Built annotation-source.json with ${nodes.length} nodes.`);
