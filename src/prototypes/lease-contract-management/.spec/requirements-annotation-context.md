# 租赁合同管理 · 标注与原型上下文

> 由 `extract-annotation-source` 从运行态 `window.__AXHUB_ANNOTATION_SOURCE__` 提取，并与仓库源码对齐。  
> 原型地址：`/prototypes/lease-contract-management`

---

## 1. 提取摘要

| 项 | 值 |
|---|---|
| 标注节点数 | 22 |
| 列表页节点 | 8（`pageId: list`） |
| 新增页节点 | 14（`pageId: create`） |
| 图片附件 | 无 |
| 开发态 `source.root` | 未发布（以仓库路径为准） |

### 1.1 目录结构

```text
租赁合同管理说明
├── 模块总览
├── 合同模板管理（链接）
├── PRD 全文
│   ├── PRD 完整文档
│   ├── 列表页 PRD
│   ├── 新增页 PRD
│   └── 验收标准
├── 列表页模块（route + 各标注说明）
├── 新增页模块（route + 各标注说明）
├── 操作流程（正向 / 逆向流程图）
└── 标注查看提示
```

### 1.2 标注节点索引

**列表页**

| id | 标题 |
|---|---|
| `lc-list-filter` | 筛选条件 |
| `lc-list-kpi` | KPI 统计卡片 |
| `lc-fleet-summary` | 在租车辆概览 |
| `lc-list-toolbar` | 列表工具栏 |
| `lc-list-table` | 合同台账列表 |
| `lc-list-action-more` | 更多操作 |
| `lc-action-convert-tripartite` | 转三方合同 |
| `lc-action-trial-to-formal` | 试用转正式 |

**新增页**

| id | 标题 |
|---|---|
| `lc-create-main-contract` | 主体合同信息 |
| `lc-create-signing-method` | 合同签署方式 |
| `lc-card-signing` | 签约信息 |
| `lc-signing-customer-principal` | 乙方负责人 |
| `lc-create-lease-order` | 附件1：租赁订单 |
| `lc-lease-order-brand-model` | 品牌车型与在库 |
| `lc-lease-order-rent` | 车辆租金与最低租金 |
| `lc-lease-order-service-content` | 服务项配置 |
| `lc-lease-order-lease-period` | 租赁期限与到期计算 |
| `lc-create-poa` | 授权委托书 |
| `lc-create-contract-remark` | 合同备注 |
| `lc-create-seal` | 用章类型 |
| `lc-create-preview` | 实时预览 |
| `lc-create-footer` | 底栏操作 |

定位器统一为：`[data-annotation-id="<id>"]`

---

## 2. 履约与交还车规则（列表子表）

| 规则 | 说明 |
|---|---|
| 审批未通过 | 合同下车辆**不视为已交车**；子表「交车」显示「未交车」，无租赁账单/还车应结款 |
| 审批通过 | 方进入履约态；有实际交车时间的车辆计入「已交车辆数」 |
| 子表还车 | **审批通过 + 已交车 + 未还车** 时，操作列显示「还车」 |
| 已还车 | 操作列为「—」；「还车应结款」按状态展示待提交/审批中/已完成 |

子表列：车辆信息、提车应收款、交车、租赁账单、还车、还车应结款、交车安排、里程要求、里程完成、操作。

---

## 3. 源码入口

| 能力 | 文件 |
|---|---|
| 标注/路由入口 | `index.tsx` |
| 列表主逻辑 | `LeaseContractManagement.jsx` |
| 列表数据与履约规则 | `lease-contract-list-data.js` |
| 新增页 | `LeaseContractCreate.jsx` |
| 主体表单 | `LeaseContractEditorForm.jsx` |
| 标注数据构建 | `scripts/build-annotation-source.mjs` |
| 标注数据 | `annotation-source.json` |
| PRD 全文 | `src/resources/lease-contract-management/PRD.md` |

同步命令：

```bash
node src/prototypes/lease-contract-management/scripts/build-annotation-source.mjs
```
