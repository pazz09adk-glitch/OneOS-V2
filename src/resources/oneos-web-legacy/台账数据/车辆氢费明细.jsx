// 【重要】必须使用 const Component 作为组件变量名
// 台账数据 - 车辆氢费明细（业务人员手动录入；保存后为未对账，勾选后「完成对账」）
// 原型：联调后对接加氢站、车辆、客户、公司及登录账号接口

// 车辆氢费明细 PRD 正文（与 车辆氢费明细-需求文档.md 同步）
var H2_LEDGER_REQUIREMENT_DOC = `# 车辆氢费明细 — 产品需求说明（PRD）

| 项目 | 内容 |
|------|------|
| 文档版本 | v2.1（业务版） |
| 产品模块 | 台账数据 → 车辆氢费明细 |
| 文档类型 | 产品需求说明 |
| 适用读者 | 产品、业务、运营、测试、项目 |
| 修订说明 | 同步列表字段顺序、顶部合计条、承担方式、系统带出字段等现行页面行为 |

---

## 一、为什么做这件事

### 1.1 业务痛点

- 车辆加氢费用分散在业务同事手工记录中，缺少统一台账，难以按客户、站点、时间核对。
- 录入后需区分「是否已正式提交」「是否已完成对账」，避免未核实数据进入对账与结算环节。
- 加氢量偏大、单价与公司在该站该时段的标准价不一致等情况，需要**提前暴露**，减少后续财务纠纷。

### 1.2 产品价值

| 价值点 | 说明 |
|--------|------|
| 统一台账 | 一条记录对应一次加氢业务，关联车辆、客户、站点与金额 |
| 流程可控 | 待保存 → 未对账 → 已对账，责任边界清晰 |
| 效率提升 | 支持批量导入、批量改价、复制同类记录 |
| 风险可见 | 异常数据标黄，可一键只看有问题记录 |
| 可追溯 | 关键修改留痕，便于主管复核与客诉查证 |

### 1.3 本期目标

建设 Web 端「车辆氢费明细」页面，支撑业务人员**查询、录入、保存、对账、导入导出**全流程；财务相关字段（开票、付款等）由系统按客户等信息自动带出，减少手工填写错误。

### 1.4 本期不做

- 多级审批流、与 ERP 自动过账（可后续迭代）。
- 按组织架构的复杂数据权限（本期按「业务员 / 主管」两类角色描述，上线后对接权限中心）。
- 导入文件格式的完整兼容方案以业务验收为准（需支持模板化批量录入）。

---

## 二、谁在用、用来干什么

### 2.1 用户角色

| 角色 | 典型诉求 |
|------|----------|
| **业务员** | 日常录入加氢记录；批量导入历史数据；保存后推进对账；导出给财务或客户核对 |
| **主管** | 复核异常数据；必要时修正或删除**已对账**记录；查看变更记录 |

### 2.2 核心使用场景（用户故事）

1. **单笔补录**  
   业务员得知某车在某站加氢后，在页面新增一行，填写时间、站点、车牌、加氢量与单价，保存后进入「未对账」列表等待勾选完成对账。

2. **批量导入历史**  
   业务员下载模板，在 Excel 中整理多笔记录后上传，系统生成多条状态为「未对账」数据。

3. **日常对账**  
   业务员按客户或时间筛选「未对账」记录，勾选确认无误后点击「完成对账」，数据变为「已对账」，本人不可再随意修改。

4. **异常排查**  
   业务员勾选「仅显示异常数据」，优先处理加氢量过大（＞60kg）或单价与标准不一致的记录，修正后再保存或对账。

5. **主管纠错**  
   已对账数据发现错误，主管进入编辑后修改；业务员侧编辑/删除按钮不可用，需联系主管处理。

6. **导出报送**  
   业务员按筛选条件导出「未对账 + 已对账」正式数据（不含尚未保存的草稿），自选列字段生成表格文件。

---

## 三、业务主流程

### 3.1 端到端流程（推荐操作顺序）

\`\`\`mermaid
flowchart LR
    A[录入/复制] --> B[待保存]
    B --> C[点击保存]
    C[保存/导入] --> D[未对账]
    D --> E[勾选并完成对账]
    E --> F[已对账]
\`\`\`

**说明：**

- **待保存**：草稿态，可反复修改；尚未进入对账池。
- **未对账**：已保存的正式数据，可「编辑」「删除」勾选「完成对账」。
- **已对账**：对账完成，业务员不可改删；主管可特殊处理「编辑」「删除」。

### 3.2 「保存」与「完成对账」的区别

| 操作 | 业务含义 | 对象 | 结果 |
|------|----------|------|------|
| **保存** | 将草稿确认为可参与对账的正式记录 | 当前页所有「待保存」记录 | 全部变为「未对账」 |
| **完成对账** | 确认与客户/内部核对无误，结案 | 用户勾选的「未对账」记录 | 变为「已对账」 |

**保存前校验：** 必填项未填完整时，在对应格子标红提示，**不弹出成功提示**，也不变更状态。

**完成对账前确认：** 系统提示「完成对账后只能联系主管修改」，用户确认后执行。

---

## 四、页面功能说明（业务视角）

### 4.1 页面组成

用户进入「台账数据 → 车辆氢费明细」后，自上而下为：

1. **查询条件区** — 按时间、订单、车辆、客户等筛选  
2. **数据列表区** — 展示氢费明细、合计、操作按钮  
3. **弹窗** — 批量导入、批量导出、变更日志  

列表下方提供 **「新增一行」**，用于手工补录。

### 4.2 查询条件

**交互原则：** 修改条件后不会立刻刷新列表，需点击 **「查询」** 才生效；**「重置」** 清空条件并恢复全量展示。

**默认展示：** 第一行条件（加氢时间、订单编号、查询按钮）；点击 **「展开」** 可看到更多条件。

| 查询项 | 业务说明 |
|--------|----------|
| 加氢时间 | 起止日期范围 |
| 订单编号 | 支持模糊搜索 |
| 车牌号 | 从公司车辆库选择 |
| 客户名称 | 从客户库选择 |
| 加氢站名称 | 从加氢站库选择 |
| 业务员 | 按客户归属业务员筛选 |
| 承担方式 | 客户承担 / 我司承担 / 客户自行结算 / 其他结算 |
| 客户收款状态 | 已付款 / 未付款（系统带出，用于筛选） |
| 开票公司 | 从开票主体选择（系统带出字段对应公司） |

查询成功给予简短成功提示。

**与列表的关系：**

- 列表默认展示符合查询条件的记录。  
- **例外：** 本人刚新增、尚未保存的记录，即使暂时不符合筛选条件，也会显示在列表中，避免「点了新增却找不到行」。  
- **「仅显示异常数据」** 开启时，只展示有风险提示的记录；本人待保存的新增行仍会显示，以免录入中断。

### 4.3 列表展示规则

**分区展示（便于扫读）：**

| 区域顺序（上→下） | 记录状态 | 排序习惯 |
|-------------------|----------|----------|
| 第一区 | 已对账 | 加氢时间新的在前 |
| 第二区 | 未对账 | 加氢时间新的在前 |
| 第三区 | 待保存 | 先录入的在前，新加的靠下 |

不同区域之间有明显分隔，已对账区背景略灰、待保存区背景略黄，降低误操作概率。

**顶部合计条：** 表格上方独立展示 **加氢量(kg)、成本总价(元)、加氢总价(元)** 三项合计。

- **统计范围：** 与当前列表可见行一致。  
- **随查询重算：** 点击「查询」应用筛选条件后，合计立即按新结果重新汇总。  
- **随「仅显示异常数据」变化：** 开关开启时，仅对当前可见的异常记录（及本人待保存行）合计。  
- **说明：** 合计条含「待保存 / 未对账 / 已对账」等当前列表中的全部可见记录，与导出范围（仅未对账+已对账）不同。

**列表列顺序（左→右，业务视角）：**  
序号 → 加氢日期 → 加氢时间 → 加氢站名称 → 客户名称 → 车牌号 → 加氢量 → 成本单价 → 成本总价 → 加氢单价 → 加氢总价 → 行驶里程 → 备注 → 业务员 → 承担方式 → 对账日期 → **收票日期** → **加氢站付款状态** → **开票日期** → **客户收款状态** → **开票公司** → 状态 → 订单编号 → 操作（操作列固定右侧）。

**系统带出字段（不可手工维护）：** 收票日期、加氢站付款状态、开票日期、客户收款状态、开票公司；选择/变更客户等信息后由系统自动刷新，单元格为浅灰底只读样式。

**列表勾选：** 仅 **未对账** 记录可勾选，用于批量「完成对账」。

### 4.4 工具栏操作

从左到右、从业务使用频率排列：

| 按钮 | 业务作用 |
|------|----------|
| 仅显示异常数据 | 开关，快速聚焦有风险提示的记录 |
| 批量导入 | 按模板上传多条待保存记录 |
| 批量导出 | 按当前查询条件导出正式数据 |
| 保存 | 将全部待保存记录提交为未对账 |
| 完成对账 | 将勾选的未对账记录结案为已对账 |

---

## 五、单条记录：填什么、怎么算

### 5.1 用户可见字段说明

| 信息项 | 用户是否填写 | 业务说明 |
|--------|--------------|----------|
| 加氢时间 | 是* | 精确到秒，必填 |
| 加氢日期 | 否 | 由加氢时间自动得出，只读 |
| 加氢站名称 | 是* | 必选 |
| 客户名称 | 是* | 必选，位于加氢站右侧；决定业务员与系统带出信息 |
| 车牌号 | 是* | 必选，须为公司登记车辆 |
| 加氢量(kg) | 是* | 必填，用于算总价 |
| 成本单价 | 是* | 必填，向站点的采购成本价 |
| 成本总价 | 否 | 加氢量 × 成本单价，自动计算 |
| 加氢单价 | 是* | 必填，对客户的销售单价 |
| 加氢总价 | 否 | 加氢量 × 加氢单价，自动计算 |
| 行驶里程 | 否 | 选填，位于加氢总价之后 |
| 备注 | 否 | 自由文本 |
| 业务员 | 否 | 选客户后自动带出 |
| 承担方式 | 是* | 客户承担 / 我司承担 / 客户自行结算 / 其他结算 |
| 对账日期 | 否 | 完成对账等流程带出，只读 |
| 收票日期 | 否 | 由财务/收票模块自动带出，不可编辑 |
| 加氢站付款状态 | 否 | 已付款 / 未付款，由加氢站打款管理带出 |
| 开票日期 | 否 | 由开票模块自动带出 |
| 客户收款状态 | 否 | 已付款 / 未付款，由客户收款模块带出 |
| 开票公司 | 否 | 显示开票公司名称，系统自动带出 |
| 状态 | 否 | 展示「未对账」「已对账」；待保存不显示标签；列在列表末尾 |
| 订单编号 | 否 | 系统按规则自动生成，不可改；列在列表末尾 |

\\* 保存时校验，缺失则标红提示。

### 5.2 订单编号规则（业务口径）

便于业务与财务对齐、按站按日追溯：

- 编号以 **JQ** 开头，后接 **加氢站编码**、**加氢日期（6 位）**、**当日流水号（5 位）**。  
- 同一加氢站、同一天内，按加氢时间先后依次编号，每日从 1 号起。  
- 用户无需手填，保存或数据重算时由系统生成。

### 5.3 金额计算

- **成本总价** = 加氢量 × 成本单价（保留两位小数）  
- **加氢总价** = 加氢量 × 加氢单价（保留两位小数）  

任一项未填齐时，对应总价为空，填齐后自动更新。

---

## 六、谁能改、谁能删

### 6.1 按状态的权限（业务员 vs 主管）

| 数据状态 | 业务员 | 主管 |
|----------|--------|------|
| 待保存（本人录入） | 可直接改表格；可复制、删除 | 同业务员（本期不单独区分待保存） |
| 待保存（他人录入） | 不可见或不可改（按账号权限，上线后明确） | — |
| 未对账 | 需点「编辑」后才能改；可复制、删除；可勾选完成对账 | 同业务员 |
| 已对账 | 不可编辑、不可删除（按钮灰显+提示联系主管） | 可点「编辑」修改；可删除 |

### 6.2 行内操作说明

| 操作 | 适用情况 | 业务说明 |
|------|----------|----------|
| 编辑 | 未对账、已对账（主管） | 进入编辑模式后方可改单元格；待保存无需点编辑 |
| 复制 | 未对账、本人待保存 | 可一次复制 1～100 条相似记录，生成新的待保存行 |
| 删除 | 未对账、本人待保存；已对账仅主管 | 二次确认后删除 |
| 更多 → 变更日志 | 未对账、已对账 | 查看该条历史修改记录 |

---

## 七、异常数据（标黄）— 业务规则

### 7.1 什么是「异常」

系统在列表中用**黄色背景**提示以下三类情况（不影响保存，但需业务留意）：

| 异常类型 | 判定逻辑（业务语言） | 用户看到的提示 |
|----------|----------------------|----------------|
| 加氢量偏大 | 单次加氢量超过 60 kg | 加氢量疑似有误 |
| 成本单价异常 | 所填成本单价与「该站该时段公司标准成本价」不一致 | 成本单价与系统该时间段不一致 |
| 加氢单价异常 | 所填加氢单价与「该站该时段公司标准对客户价」不一致 | 加氢单价与系统该时间段不一致 |

标准价随 **加氢站 + 加氢时间** 匹配；若公司未配置该站该时段价格，则不提示单价类异常。

### 7.2 「仅显示异常数据」

- 默认关闭，展示符合查询条件的全部记录（含待保存例外规则）。  
- 开启后只显示至少有一项异常提示的记录，方便集中核对。  
- **导出不受此开关影响**（见下文）。

---

## 八、批量能力

### 8.1 表头批量改价 / 改结算

- 在 **成本单价**、**加氢单价** 列表头可批量填入统一单价，作用于当前可编辑的所有记录（待保存 + 未对账）。  
- 在 **承担方式** 列表头可批量改为四种承担方式之一。  
- **已对账** 记录不参与批量修改。

### 8.2 批量导入

**适用：** 历史数据、线下表格整理后的批量录入。

**流程：**

1. 点击「批量导入」→ 下载标准模板  
2. 按模板填写（无需填对账日期及收票/开票/付款等系统带出字段）  
3. 上传文件 → 系统生成多条 **待保存** 记录  
4. 业务核对列表 → 点击 **保存** 进入未对账  

**模板包含列：** 加氢时间、加氢站名称、车牌号、加氢量、成本单价、客户名称、加氢单价、承担方式、备注（行驶里程可在备注前按业务需要填写，导入模板列顺序以页面下载为准）。

**导入后状态：** 均为待保存，与手工新增一致，须保存后才参与对账与导出。

### 8.3 批量导出

**适用：** 向财务、客户或内部汇报正式台账。

**规则：**

- 导出范围 = **当前查询条件下** 的 **未对账 + 已对账** 数据。  
- **不包含待保存**（草稿不对外报送）。  
- **不受**「仅显示异常数据」开关限制。  
- 弹窗文案：「请选择导出的列」；支持全选/取消全选；默认勾选全部可导出列。  
- 无符合条件数据时提示：暂无未对账或已对账数据可导出。

**可导出列（业务名称）：** 序号、状态、订单编号、加氢时间、加氢日期、加氢站名称、车牌号、加氢量、成本单价、成本总价、客户名称、加氢单价、加氢总价、行驶里程、业务员、承担方式、对账日期、备注、收票日期、加氢站付款状态、开票日期、客户收款状态、开票公司。

---

## 九、变更日志

### 9.1 记录什么

满足审计与纠纷查证，以下变化需留痕：

- 保存（待保存 → 未对账）  
- 完成对账（未对账 → 已对账）  
- 各业务字段修改（前后值不同）  
- 新增、复制、批量导入产生记录  

### 9.2 怎么查看

在操作列点击 **「更多」→ 变更日志**，弹窗展示：

- 修改时间、修改人、修改字段、修改前（红）、修改后（绿）  
- 按时间倒序排列  

---

## 十、业务规则汇总（验收必读）

### 10.1 保存

- 一次保存处理页面上**全部**待保存记录。  
- 必填：加氢时间、加氢站、车牌（须为登记车辆）、客户、加氢量、成本单价、加氢单价、承担方式。  
- 校验失败：仅格子标红，无「保存成功」类提示。  

### 10.2 完成对账

- 必须先勾选未对账记录。  
- 仅未对账可勾选。  
- 确认文案强调：完成后需主管才能改。  

### 10.3 筛选与列表

- 查询点击后生效；重置恢复。  
- **顶部合计条** 对当前列表可见行实时汇总；修改筛选并点击「查询」后重新计算；「仅显示异常数据」开启时仅统计可见行。  
- 本人待保存新增行在筛选后仍可见（合计亦包含这些行，若其在列表中展示）。  

### 10.4 导出

- 仅未对账、已对账；遵循查询条件；可自选列。  

### 10.5 复制

- 单次最多 100 条；生成待保存记录。  

---

## 十一、业务验收场景（UAT 建议）

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| U1 | 新增一行并填齐必填项后保存 | 变为未对账，出现订单编号 |
| U2 | 必填项缺一项点保存 | 对应格标红，状态仍为待保存 |
| U3 | 勾选多条未对账并完成对账 | 变为已对账，业务员不可改删 |
| U4 | 业务员打开已对账记录 | 编辑/删除不可用，有主管联系提示 |
| U5 | 加氢量填 65kg | 单元格标黄，提示加氢量疑似有误 |
| U6 | 单价填与标准价不一致 | 标黄并提示与系统该时段不一致 |
| U7 | 开启「仅显示异常数据」 | 仅异常记录可见，本人新加待保存仍可见 |
| U8 | 设置筛选后导出 | 仅导出未对账+已对账且符合筛选的数据 |
| U9 | 导入模板 5 条后保存 | 5 条均变未对账 |
| U10 | 未对账记录点编辑后改客户 | 业务员、开票信息等随客户更新，变更日志有记录 |

---

## 十二、名词与枚举（业务词典）

| 名词 | 含义 |
|------|------|
| 待保存 | 草稿，未进入对账流程 |
| 未对账 | 已保存，等待业务确认并完成对账 |
| 已对账 | 对账完成，业务员不可随意改动 |
| 客户承担 | 氢费由客户承担 |
| 我司承担 | 氢费由我司承担 |
| 客户自行结算 | 由客户自行与加氢站等方结算 |
| 其他结算 | 其他结算方式 |
| 加氢站付款状态 | 加氢站侧是否已付款，已付款 / 未付款 |
| 客户收款状态 | 客户侧是否已收款，已付款 / 未付款 |
| 收票日期 | 财务收票日期，系统带出 |
| 标准价 | 公司维护的、按加氢站与生效时段确定的参考单价 |

---

## 十三、版本与协作说明

- 本文档描述的是 **车辆氢费明细** 页面当前已对齐的产品行为，供评审、培训与 UAT 使用。  
- 研发实现细节、接口定义、字段编码见单独的技术设计文档（如有）。  
- 需求变更请更新本文档版本号，并在评审纪要中注明影响章节。  

---

**文档结束**
`;

/** 将 PRD Markdown 排版为 React 节点（车辆氢费明细） */
function parsePrdInlineText(text) {
	var parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
	var nodes = [];
	var i;
	for (i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (!p) continue;
		if (p.indexOf('**') === 0 && p.lastIndexOf('**') === p.length - 2) {
			nodes.push(
				React.createElement('strong', { key: i }, p.slice(2, -2))
			);
		} else {
			nodes.push(p);
		}
	}
	return nodes.length === 1 ? nodes[0] : nodes;
}

function isPrdTableRow(line) {
	return /^\|.+\|$/.test(String(line || '').trim());
}

function isPrdTableSep(line) {
	return /^\|[\s\-:|]+\|$/.test(String(line || '').trim());
}

function renderPrdTableRow(line, rowKey, isHeader) {
	var cells = String(line)
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map(function (c) {
			return c.trim();
		});
	return React.createElement(
		'tr',
		{ key: rowKey },
		cells.map(function (cell, ci) {
			var Tag = isHeader ? 'th' : 'td';
			return React.createElement(
				Tag,
				{
					key: ci,
					style: {
						border: '1px solid #e5e7eb',
						padding: '8px 10px',
						textAlign: 'left',
						verticalAlign: 'top',
						fontWeight: isHeader ? 600 : 400,
						background: isHeader ? '#f8fafc' : '#fff',
						fontSize: 13,
						lineHeight: 1.5
					}
				},
				parsePrdInlineText(cell)
			);
		})
	);
}

function renderPrdMarkdown(markdown) {
	var lines = String(markdown || '').split(/\r?\n/);
	var nodes = [];
	var i = 0;
	var inCode = false;
	var codeBuf = [];

	while (i < lines.length) {
		var line = lines[i];
		var trimmed = String(line || '').trim();

		if (trimmed.indexOf('```') === 0) {
			if (inCode) {
				nodes.push(
					React.createElement(
						'pre',
						{
							key: 'code-' + i,
							style: {
								margin: '12px 0',
								padding: '12px 14px',
								background: '#f6f8fa',
								border: '1px solid #e5e7eb',
								borderRadius: 8,
								fontSize: 12,
								lineHeight: 1.6,
								overflow: 'auto',
								color: '#334155',
								whiteSpace: 'pre-wrap'
							}
						},
						codeBuf.join('\n')
					)
				);
				codeBuf = [];
				inCode = false;
			} else {
				inCode = true;
			}
			i += 1;
			continue;
		}

		if (inCode) {
			codeBuf.push(line);
			i += 1;
			continue;
		}

		if (trimmed === '---') {
			nodes.push(
				React.createElement('hr', {
					key: 'hr-' + i,
					style: { border: 'none', borderTop: '1px solid #e8ecf0', margin: '20px 0' }
				})
			);
			i += 1;
			continue;
		}

		if (isPrdTableRow(trimmed)) {
			var tableLines = [];
			while (i < lines.length && isPrdTableRow(String(lines[i]).trim())) {
				tableLines.push(String(lines[i]).trim());
				i += 1;
			}
			var bodyRows = [];
			var ti;
			for (ti = 0; ti < tableLines.length; ti++) {
				if (isPrdTableSep(tableLines[ti])) continue;
				bodyRows.push(
					renderPrdTableRow(tableLines[ti], 'tr-' + i + '-' + ti, ti === 0)
				);
			}
			if (bodyRows.length) {
				nodes.push(
					React.createElement(
						'div',
						{
							key: 'tbl-' + i,
							style: { overflowX: 'auto', margin: '12px 0 16px' }
						},
						React.createElement(
							'table',
							{
								style: {
									width: '100%',
									borderCollapse: 'collapse',
									fontSize: 13
								}
							},
							React.createElement('tbody', null, bodyRows)
						)
					)
				);
			}
			continue;
		}

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (trimmed.indexOf('# ') === 0) {
			nodes.push(
				React.createElement(
					'h1',
					{
						key: 'h1-' + i,
						style: {
							fontSize: 20,
							fontWeight: 700,
							color: '#0f172a',
							margin: '0 0 16px',
							lineHeight: 1.35
						}
					},
					parsePrdInlineText(trimmed.slice(2).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('## ') === 0) {
			nodes.push(
				React.createElement(
					'h2',
					{
						key: 'h2-' + i,
						style: {
							fontSize: 16,
							fontWeight: 700,
							color: '#1e293b',
							margin: '24px 0 12px',
							paddingBottom: 6,
							borderBottom: '2px solid #e0f2fe',
							lineHeight: 1.4
						}
					},
					parsePrdInlineText(trimmed.slice(3).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('### ') === 0) {
			nodes.push(
				React.createElement(
					'h3',
					{
						key: 'h3-' + i,
						style: {
							fontSize: 14,
							fontWeight: 600,
							color: '#334155',
							margin: '16px 0 8px',
							lineHeight: 1.45
						}
					},
					parsePrdInlineText(trimmed.slice(4).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed === '**文档结束**') {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'end-' + i,
						style: {
							marginTop: 24,
							paddingTop: 16,
							borderTop: '1px dashed #e2e8f0',
							color: '#94a3b8',
							fontSize: 13,
							textAlign: 'center'
						}
					},
					'— 文档结束 —'
				)
			);
			i += 1;
			continue;
		}

		if (/^\d+\.\s/.test(trimmed)) {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'ol-' + i,
						style: {
							fontSize: 13,
							color: '#475569',
							lineHeight: 1.75,
							margin: '6px 0 6px 4px',
							paddingLeft: 4
						}
					},
					parsePrdInlineText(trimmed)
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('- ') === 0) {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'ul-' + i,
						style: {
							display: 'flex',
							gap: 8,
							fontSize: 13,
							color: '#475569',
							lineHeight: 1.75,
							margin: '4px 0 4px 2px'
						}
					},
					React.createElement('span', { style: { color: '#1677ff', flexShrink: 0 } }, '•'),
					React.createElement('span', { style: { flex: 1 } }, parsePrdInlineText(trimmed.slice(2).trim()))
				)
			);
			i += 1;
			continue;
		}

		nodes.push(
			React.createElement(
				'p',
				{
					key: 'p-' + i,
					style: {
						fontSize: 13,
						color: '#475569',
						lineHeight: 1.75,
						margin: '6px 0'
					}
				},
				parsePrdInlineText(trimmed)
			)
		);
		i += 1;
	}

	return nodes;
}

function renderH2RequirementDocPanel() {
	var md =
		typeof H2_LEDGER_REQUIREMENT_DOC !== 'undefined' && H2_LEDGER_REQUIREMENT_DOC
			? H2_LEDGER_REQUIREMENT_DOC
			: '';
	if (!md) {
		return React.createElement(
			'div',
			{ style: { padding: 24, color: '#64748b', textAlign: 'center' } },
			'需求文档未加载，请确认已引入同目录文件：车辆氢费明细-需求内容.js'
		);
	}
	return React.createElement(
		'div',
		{ className: 'h2-req-doc-panel', style: { padding: '4px 4px 16px' } },
		renderPrdMarkdown(md)
	);
}

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var Row = antd.Row;
	var Col = antd.Col;
	var Space = antd.Space;
	var Tag = antd.Tag;
	var Popconfirm = antd.Popconfirm;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var Upload = antd.Upload;
	var Checkbox = antd.Checkbox;
	var Dropdown = antd.Dropdown;
	var message = antd.message;

	var WARN_HYDROGEN_KG_TIP = '加氢量疑似有误';
	var WARN_COST_PRICE_TIP = '成本单价与系统该时间段不一致';
	var WARN_CUSTOMER_PRICE_TIP = '加氢单价与系统该时间段不一致';
	var WARN_CELL_WRAP_STYLE = { background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, display: 'block', width: '100%' };

	var CURRENT_USER = { id: 'u_biz_li', name: '李业务', role: 'sales' };

	var RECONCILE_DRAFT = 'draft';
	var RECONCILE_PENDING = 'pending';
	var RECONCILE_RECONCILED = 'reconciled';

	var VEHICLE_INFO_TABLE = [
		'浙AD12345F',
		'浙AH55660F',
		'浙BK33210F',
		'粤BK33210F',
		'沪AD12345F',
		'苏EF99887F',
		'京CN88771F',
		'川AL55602F'
	];

	var HYDROGEN_STATION_LIST = [
		{ value: '000082', label: '广安弘正能源官盛综合能源站', stationCode: '000082' },
		{ value: '000045', label: '九江城区城西港加油站', stationCode: '000045' },
		{ value: '000074', label: '金瑞汽油柴油LNG加油加气站', stationCode: '000074' },
		{ value: 'HS000042', label: '中国石化南二环油电氢合建站', stationCode: 'HS000042' },
		{ value: '000077', label: '凯豪达氢能源加氢站', stationCode: '000077' },
		{ value: 'HS000053', label: '四周能源云浮新区加氢站', stationCode: 'HS000053' },
		{ value: '000091', label: '重庆双溪加氢站', stationCode: '000091' },
		{ value: 'HS000041', label: '宿迁沭阳开发区加氢站', stationCode: 'HS000041' },
		{ value: '000062', label: '滨化加氢站', stationCode: '000062' },
		{ value: 'HS000054', label: '中国石化绿能加气加氢站', stationCode: 'HS000054' },
		{ value: '000067', label: '中国石油天然气股份有限公司四川成都销售分公司郫都区古城加油站', stationCode: '000067' },
		{ value: '000088', label: '永川高升加氢站', stationCode: '000088' },
		{ value: '000058', label: '中国石化青云店气能加油加气站', stationCode: '000058' },
		{ value: 'HS000037', label: '佛罗路加氢站', stationCode: 'HS000037' },
		{ value: '000068', label: '丹灶海德利森加氢站', stationCode: '000068' },
		{ value: '000059', label: '神华加氢站', stationCode: '000059' },
		{ value: 'HS000040', label: '扬州文昌西路站', stationCode: 'HS000040' },
		{ value: '000086', label: '涪陵长寿化中大道加能站', stationCode: '000086' },
		{ value: '000070', label: '中国石化龙珠源加油加气站', stationCode: '000070' },
		{ value: 'HS000030', label: '大兴国际氢能示范区海珀尔加氢站', stationCode: 'HS000030' },
		{ value: 'HS000038', label: '普特氢能加氢站', stationCode: 'HS000038' },
		{ value: 'HS000043', label: '淄博齐鲁加氢站', stationCode: 'HS000043' },
		{ value: '000048', label: '南京溧水柘塘东站', stationCode: '000048' },
		{ value: '000063', label: '张家港公交保养场站', stationCode: '000063' },
		{ value: '000073', label: '河北欣聚元氢能科技有限公司加氢站', stationCode: '000073' },
		{ value: 'HS000035', label: '广州联新氢能东晖加氢站', stationCode: 'HS000035' },
		{ value: 'HS000048', label: '如皋神华加氢站', stationCode: 'HS000048' },
		{ value: 'HS000059', label: '佛山南海羚牛加氢站', stationCode: 'HS000059' },
		{ value: '000085', label: '江南空港加气站', stationCode: '000085' },
		{ value: '000078', label: '中国石化江南半山环道加能站', stationCode: '000078' },
		{ value: '000090', label: '成都天府机场高速北站', stationCode: '000090' },
		{ value: 'HS000057', label: '重庆元琨双宝氢能综合能源站', stationCode: 'HS000057' },
		{ value: '000080', label: '重庆龙洲湾氢能综合能源站', stationCode: '000080' },
		{ value: '000089', label: '成都天府机场高速南站', stationCode: '000089' },
		{ value: 'HS000034', label: '中国石油时顺苑加油加氢站', stationCode: 'HS000034' },
		{ value: 'HS000039', label: '海盐JUPITER厂内加氢站', stationCode: 'HS000039' },
		{ value: '000081', label: '成都博能燃气综合能源站', stationCode: '000081' },
		{ value: 'HS000049', label: '东明三路综合能源站', stationCode: 'HS000049' },
		{ value: '000053', label: '武汉革新大道加油站', stationCode: '000053' },
		{ value: '000052', label: '强劲荔村加氢站', stationCode: '000052' },
		{ value: '000043', label: '豪汇综合能源站', stationCode: '000043' },
		{ value: 'HS000033', label: '氢源嘉创东方氢港加氢站', stationCode: 'HS000033' },
		{ value: 'HS000052', label: '中国石化滨文路CNG加气站', stationCode: 'HS000052' },
		{ value: '000044', label: '佛山青龙加油站', stationCode: '000044' },
		{ value: '000056', label: '绕城大道加气加氢加油站', stationCode: '000056' },
		{ value: '000049', label: '宁波镇海区中国石化加氢站', stationCode: '000049' },
		{ value: 'HS000050', label: '硕放加氢站', stationCode: 'HS000050' },
		{ value: 'HS000047', label: '盐城创咏加氢站', stationCode: 'HS000047' },
		{ value: 'HS000051', label: '成都华通加氢站', stationCode: 'HS000051' },
		{ value: 'HS000045', label: '佛山佛西加气站', stationCode: 'HS000045' },
		{ value: '000075', label: '河南焦煤能源有限公司演马庄矿冯营加氢站', stationCode: '000075' },
		{ value: '000087', label: '高管汉宜潜江服务北站', stationCode: '000087' },
		{ value: 'HS000081', label: '武汉群力加油站', stationCode: 'HS000081' },
		{ value: '000069', label: '中国石化广州开泰北加油加氢站', stationCode: '000069' },
		{ value: '000072', label: '中国石化广州金坑加氢站', stationCode: '000072' },
		{ value: 'HS000007', label: '上海嘉氢实业加氢站（江桥重塑）', stationCode: 'HS000007' },
		{ value: 'HS000082', label: '武汉雄众加氢站', stationCode: 'HS000082' },
		{ value: 'HS000083', label: '中国石化青岛炼油化工有限责任公司', stationCode: 'HS000083' },
		{ value: 'HS000084', label: '皖能集团龙塘综合能源港(CNG、H2、充换电)', stationCode: 'HS000084' },
		{ value: 'HS000085', label: '佛燃', stationCode: 'HS000085' },
		{ value: 'HS000086', label: '空气化工产品（浙江）有限公司海盐经济开发区加氢站', stationCode: 'HS000086' },
		{ value: 'HS000087', label: '国家电投宁波慈溪加氢站', stationCode: 'HS000087' },
		{ value: 'HS000088', label: '诚志空气产品银河路加氢站', stationCode: 'HS000088' },
		{ value: 'HS000089', label: '乌鲁木齐市隆盛达环保科技有限公司沙坪加油加气加氢充电站', stationCode: 'HS000089' },
		{ value: 'HS000090', label: '茄子岗综合能源站', stationCode: 'HS000090' },
		{ value: 'HS000091', label: '中国石化江南西彭综合能源站', stationCode: 'HS000091' },
		{ value: 'HS000092', label: '昆山市中国石油昆山花桥加油站(花安路北50米)', stationCode: 'HS000092' },
		{ value: 'HS000093', label: '武汉中石化双龙站', stationCode: 'HS000093' },
		{ value: 'HS000094', label: '重庆丝路加氢站', stationCode: 'HS000094' },
		{ value: 'HS000095', label: '超亿LNG-CNG加气站-H2加氢站', stationCode: 'HS000095' },
		{ value: 'HS000096', label: '松江九亭加油站', stationCode: 'HS000096' },
		{ value: 'HS000017', label: '中国石化张家港朝阳加能站', stationCode: 'HS000017' },
		{ value: 'HS000097', label: 'K零售第六十二站', stationCode: 'HS000097' },
		{ value: 'HS000098', label: '沪实油气站', stationCode: 'HS000098' },
		{ value: 'HS000099', label: '洛阳新红山加油站', stationCode: 'HS000099' },
		{ value: 'HS000100', label: 'K闵茂加油站', stationCode: 'HS000100' },
		{ value: 'HS000101', label: '虹井加油站', stationCode: 'HS000101' },
		{ value: 'HS000102', label: '幸福加油站', stationCode: 'HS000102' },
		{ value: 'HS000103', label: '佛山南海金三角加油站', stationCode: 'HS000103' },
		{ value: 'HS000104', label: '虹光经营部', stationCode: 'HS000104' },
		{ value: 'HS000105', label: '江阴河塘站', stationCode: 'HS000105' },
		{ value: 'HS000106', label: '安徽高速清溪南站', stationCode: 'HS000106' },
		{ value: 'HS000107', label: '嘉定解放岛加油站', stationCode: 'HS000107' },
		{ value: 'HS000108', label: '闵行航华加油站', stationCode: 'HS000108' },
		{ value: 'HS000109', label: 'K祁山加油站', stationCode: 'HS000109' },
		{ value: 'HS000110', label: '嘉定曹王加油站', stationCode: 'HS000110' },
		{ value: 'HS000111', label: '徐州铜山兴华站', stationCode: 'HS000111' },
		{ value: 'HS000112', label: '广州交投沙贝南加油站', stationCode: 'HS000112' },
		{ value: 'HS000113', label: '肇庆四会龙甫加油站', stationCode: 'HS000113' },
		{ value: 'HS000016', label: '东莞沙田大道综合能源服务站', stationCode: 'HS000016' },
		{ value: 'HS000114', label: '佛山新城加油站', stationCode: 'HS000114' },
		{ value: 'HS000002', label: '上海浦江加氢站', stationCode: 'HS000002' },
		{ value: 'HS000009', label: '中石化西上海发展站加油站', stationCode: 'HS000009' },
		{ value: 'HS000011', label: '中国石化站前路加气加氢站', stationCode: 'HS000011' },
		{ value: 'HS000003', label: '上海安亭加氢站', stationCode: 'HS000003' },
		{ value: 'HS000004', label: '常熟嘉化氢能加氢站', stationCode: 'HS000004' },
		{ value: 'HS000012', label: '中国石化善通加油加氢站', stationCode: 'HS000012' },
		{ value: 'HS000008', label: '驿蓝能源加氢站', stationCode: 'HS000008' },
		{ value: 'HS000018', label: '韶钢产业园加氢站', stationCode: 'HS000018' },
		{ value: 'HS000006', label: '上海临港平霄路油氢合建站', stationCode: 'HS000006' },
		{ value: 'HS000001', label: '嘉兴滨海大道加油加气站', stationCode: 'HS000001' },
		{ value: 'HS000014', label: '嘉兴嘉燃经开站', stationCode: 'HS000014' },
		{ value: 'HS000013', label: '嘉兴嘉锦亭桥北综合供能服务站', stationCode: 'HS000013' },
		{ value: 'HS000005', label: '江苏嘉化氢能港城加氢站', stationCode: 'HS000005' },
		{ value: 'HS000010', label: '中石化青卫油氢混合站', stationCode: 'HS000010' },
	];

	var STATION_SYSTEM_PRICE_MAP = {
		'000043': { costPrice: 35.0, costPriceEffective: '2025-11-01', customerPrice: 35.0, customerPriceEffective: '2025-11-01' },
		'000044': { costPrice: 35.0, costPriceEffective: '2025-11-01', customerPrice: 35.0, customerPriceEffective: '2025-11-01' },
		'000045': { costPrice: 25.0, costPriceEffective: '2025-11-01', customerPrice: 25.0, customerPriceEffective: '2025-11-01' },
		'000048': { costPrice: 60.0, costPriceEffective: '2025-11-01', customerPrice: 60.0, customerPriceEffective: '2025-11-01' },
		'000049': { costPrice: 35.0, costPriceEffective: '2025-11-01', customerPrice: 35.0, customerPriceEffective: '2025-11-01' },
		'000052': { costPrice: 40.0, costPriceEffective: '2025-11-01', customerPrice: 40.0, customerPriceEffective: '2025-11-01' },
		'000053': { costPrice: 35.0, costPriceEffective: '2025-11-01', customerPrice: 35.0, customerPriceEffective: '2025-11-01' },
		'000056': { costPrice: 30.0, costPriceEffective: '2025-10-31', customerPrice: 30.0, customerPriceEffective: '2025-10-31' },
		'000058': { costPrice: 30.0, costPriceEffective: '2025-01-01', customerPrice: 30.0, customerPriceEffective: '2025-01-01' },
		'000059': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'000062': { costPrice: 25.0, costPriceEffective: '2025-01-01', customerPrice: 25.0, customerPriceEffective: '2025-01-01' },
		'000063': { costPrice: 55.0, costPriceEffective: '2025-01-01', customerPrice: 55.0, customerPriceEffective: '2025-01-01' },
		'000067': { costPrice: 30.0, costPriceEffective: '2025-01-01', customerPrice: 30.0, customerPriceEffective: '2025-01-01' },
		'000068': { costPrice: 44.0, costPriceEffective: '2025-01-01', customerPrice: 44.0, customerPriceEffective: '2025-01-01' },
		'000069': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'000070': { costPrice: 40.0, costPriceEffective: '2025-01-01', customerPrice: 40.0, customerPriceEffective: '2025-01-01' },
		'000072': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'000073': { costPrice: 21.0, costPriceEffective: '2025-01-01', customerPrice: 21.0, customerPriceEffective: '2025-01-01' },
		'000074': { costPrice: 25.0, costPriceEffective: '2025-01-01', customerPrice: 25.0, customerPriceEffective: '2025-01-01' },
		'000075': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'000077': { costPrice: 35.0, costPriceEffective: '2026-01-01', customerPrice: 35.0, customerPriceEffective: '2026-01-01' },
		'000078': { costPrice: 25.0, costPriceEffective: '2026-01-01', customerPrice: 25.0, customerPriceEffective: '2026-01-01' },
		'000080': { costPrice: 25.0, costPriceEffective: '2026-01-01', customerPrice: 25.0, customerPriceEffective: '2026-01-01' },
		'000081': { costPrice: 29.9, costPriceEffective: '2026-01-01', customerPrice: 29.9, customerPriceEffective: '2026-01-01' },
		'000082': { costPrice: 30.0, costPriceEffective: '2026-02-28', customerPrice: 30.0, customerPriceEffective: '2026-02-28' },
		'000085': { costPrice: 25.0, costPriceEffective: '2026-03-01', customerPrice: 25.0, customerPriceEffective: '2026-03-01' },
		'000086': { costPrice: 25.0, costPriceEffective: '2026-03-01', customerPrice: 25.0, customerPriceEffective: '2026-03-01' },
		'000087': { costPrice: 35.0, costPriceEffective: '2026-03-01', customerPrice: 35.0, customerPriceEffective: '2026-03-01' },
		'000088': { costPrice: 25.0, costPriceEffective: '2026-03-01', customerPrice: 25.0, customerPriceEffective: '2026-03-01' },
		'000089': { costPrice: 29.99, costPriceEffective: '2026-03-01', customerPrice: 29.99, customerPriceEffective: '2026-03-01' },
		'000090': { costPrice: 29.99, costPriceEffective: '2026-03-01', customerPrice: 29.99, customerPriceEffective: '2026-03-01' },
		'000091': { costPrice: 25.0, costPriceEffective: '2026-03-01', customerPrice: 25.0, customerPriceEffective: '2026-03-01' },
		'HS000001': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000002': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000003': { costPrice: 58.0, costPriceEffective: '2025-01-01', customerPrice: 58.0, customerPriceEffective: '2025-01-01' },
		'HS000004': { costPrice: 50.0, costPriceEffective: '2025-01-01', customerPrice: 50.0, customerPriceEffective: '2025-01-01' },
		'HS000005': { costPrice: 50.0, costPriceEffective: '2025-01-01', customerPrice: 50.0, customerPriceEffective: '2025-01-01' },
		'HS000006': { costPrice: 55.0, costPriceEffective: '2026-01-01', customerPrice: 55.0, customerPriceEffective: '2026-01-01' },
		'HS000007': { costPrice: 55.0, costPriceEffective: '2025-01-01', customerPrice: 55.0, customerPriceEffective: '2025-01-01' },
		'HS000008': { costPrice: 55.0, costPriceEffective: '2025-01-01', customerPrice: 55.0, customerPriceEffective: '2025-01-01' },
		'HS000009': { costPrice: 58.0, costPriceEffective: '2025-01-01', customerPrice: 58.0, customerPriceEffective: '2025-01-01' },
		'HS000010': { costPrice: 58.0, costPriceEffective: '2025-01-01', customerPrice: 58.0, customerPriceEffective: '2025-01-01' },
		'HS000011': { costPrice: 36.0, costPriceEffective: '2025-01-01', customerPrice: 36.0, customerPriceEffective: '2025-01-01' },
		'HS000012': { costPrice: 36.0, costPriceEffective: '2025-01-01', customerPrice: 36.0, customerPriceEffective: '2025-01-01' },
		'HS000013': { costPrice: 26.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000014': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000016': { costPrice: 45.0, costPriceEffective: '2023-04-25', customerPrice: 65.0, customerPriceEffective: '2023-04-25' },
		'HS000017': { costPrice: 48.0, costPriceEffective: '2025-01-01', customerPrice: 48.0, customerPriceEffective: '2025-01-01' },
		'HS000018': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000030': { costPrice: 30.0, costPriceEffective: '2025-01-01', customerPrice: 30.0, customerPriceEffective: '2025-01-01' },
		'HS000033': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000034': { costPrice: 30.0, costPriceEffective: '2025-01-01', customerPrice: 30.0, customerPriceEffective: '2025-01-01' },
		'HS000035': { costPrice: 40.0, costPriceEffective: '2025-01-01', customerPrice: 40.0, customerPriceEffective: '2025-01-01' },
		'HS000037': { costPrice: 40.0, costPriceEffective: '2024-10-01', customerPrice: 40.0, customerPriceEffective: '2025-12-31' },
		'HS000038': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 40.0, customerPriceEffective: '2025-12-31' },
		'HS000039': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000040': { costPrice: 46.0, costPriceEffective: '2025-01-01', customerPrice: 46.0, customerPriceEffective: '2025-01-01' },
		'HS000041': { costPrice: 43.0, costPriceEffective: '2024-12-01', customerPrice: 43.0, customerPriceEffective: '2024-12-01' },
		'HS000042': { costPrice: 35.0, costPriceEffective: '2024-12-01', customerPrice: 35.0, customerPriceEffective: '2024-12-01' },
		'HS000043': { costPrice: 33.6, costPriceEffective: '2024-12-01', customerPrice: 33.6, customerPriceEffective: '2024-12-01' },
		'HS000045': { costPrice: 38.0, costPriceEffective: '2025-06-01', customerPrice: 38.0, customerPriceEffective: '2025-06-01' },
		'HS000047': { costPrice: 76.0, costPriceEffective: '2025-05-26', customerPrice: 76.0, customerPriceEffective: '2025-05-26' },
		'HS000048': { costPrice: 35.0, costPriceEffective: '2025-05-27', customerPrice: 35.0, customerPriceEffective: '2025-05-26' },
		'HS000049': { costPrice: 35.0, costPriceEffective: '2025-04-27', customerPrice: 35.0, customerPriceEffective: '2025-05-25' },
		'HS000050': { costPrice: 65.0, costPriceEffective: '2025-05-25', customerPrice: 65.0, customerPriceEffective: '2025-05-25' },
		'HS000051': { costPrice: 30.0, costPriceEffective: '2025-05-25', customerPrice: 30.0, customerPriceEffective: '2025-05-25' },
		'HS000052': { costPrice: 35.0, costPriceEffective: '2025-05-25', customerPrice: 35.0, customerPriceEffective: '2025-05-25' },
		'HS000053': { costPrice: 35.0, costPriceEffective: '2025-05-25', customerPrice: 35.0, customerPriceEffective: '2025-05-25' },
		'HS000054': { costPrice: 35.0, costPriceEffective: '2025-08-01', customerPrice: 35.0, customerPriceEffective: '2025-08-01' },
		'HS000057': { costPrice: 25.0, costPriceEffective: '2025-10-01', customerPrice: 25.0, customerPriceEffective: '2025-10-01' },
		'HS000059': { costPrice: 35.0, costPriceEffective: '2025-09-01', customerPrice: 35.0, customerPriceEffective: '2025-09-01' },
		'HS000081': { costPrice: 25.0, costPriceEffective: '2026-05-14', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000082': { costPrice: 25.0, costPriceEffective: '2026-05-14', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000083': { costPrice: 35.0, costPriceEffective: '2026-05-14', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000084': { costPrice: 25.0, costPriceEffective: '2026-05-14', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000085': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000086': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000087': { costPrice: 35.0, costPriceEffective: '2025-10-01', customerPrice: 35.0, customerPriceEffective: '2025-10-01' },
		'HS000088': { costPrice: 45.0, costPriceEffective: '2025-10-01', customerPrice: 45.0, customerPriceEffective: '2025-10-01' },
		'HS000089': { costPrice: 32.0, costPriceEffective: '2025-01-01', customerPrice: 32.0, customerPriceEffective: '2025-01-01' },
		'HS000090': { costPrice: 35.0, costPriceEffective: '2025-01-01', customerPrice: 35.0, customerPriceEffective: '2025-01-01' },
		'HS000091': { costPrice: 25.0, costPriceEffective: '2026-01-01', customerPrice: 25.0, customerPriceEffective: '2026-01-01' },
		'HS000092': { costPrice: 40.0, costPriceEffective: '2024-06-01', customerPrice: 45.0, customerPriceEffective: '2024-06-01' },
		'HS000093': { costPrice: 25.0, costPriceEffective: '2026-03-01', customerPrice: 25.0, customerPriceEffective: '2026-03-01' },
		'HS000094': { costPrice: 25.0, costPriceEffective: '2025-01-01', customerPrice: 25.0, customerPriceEffective: '2025-01-01' },
		'HS000095': { costPrice: 25.0, costPriceEffective: '2026-01-01', customerPrice: 35.0, customerPriceEffective: '2026-01-01' },
		'HS000096': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000097': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000098': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000099': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000100': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000101': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000102': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000103': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000104': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000105': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000106': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000107': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000108': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000109': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000110': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000111': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000112': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000113': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
		'HS000114': { costPrice: 0.0, costPriceEffective: '2020-01-01', customerPrice: 0.0, customerPriceEffective: '2020-01-01' },
	};
	var CUSTOMER_LIST = [
		{ value: '00317', label: '嘉兴市鑫峤供应链科技有限公司', salesperson: '董剑煜' },
		{ value: '00316', label: '嘉兴琳曜供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00315', label: '苏州睿幄物流有限公司', salesperson: '董剑煜' },
		{ value: '00314', label: '上海恒建智运供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00313', label: '扬州力骏物流有限公司', salesperson: '董剑煜' },
		{ value: '00312', label: '上海岚通国际物流有限公司', salesperson: '董剑煜' },
		{ value: '00311', label: '上海川渝之星物流有限公司', salesperson: '金可鹏' },
		{ value: '00310', label: '广东新正东能源有限公司', salesperson: '金可鹏' },
		{ value: '00309', label: '佛山市晋膳美食品供应链有限公司', salesperson: '岑彦' },
		{ value: '00308', label: '上海子初供应链管理有限公司', salesperson: '赵连飞' },
		{ value: '00307', label: '广州玉川物流有限公司', salesperson: '金可鹏' },
		{ value: '00306', label: '杭州冠泽物流有限公司', salesperson: '董剑煜' },
		{ value: '00305', label: '广州市晨康贸易发展有限公司', salesperson: '吴纬涛' },
		{ value: '00304', label: '广州新运多租赁有限公司', salesperson: '金可鹏' },
		{ value: '00303', label: '黑龙江圣合商贸有限公司新疆分公司', salesperson: '尚建华' },
		{ value: '00302', label: '广东明新供应链有限公司', salesperson: '岑彦' },
		{ value: '00244', label: '上海壹陆捌捌国际物流有限公司', salesperson: '金可鹏' },
		{ value: '00279', label: '山东聚隆供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00301', label: '广州雪萌食品有限公司', salesperson: '伍仲文' },
		{ value: '00300', label: '重庆渝怀供应链有限公司', salesperson: '吴纬涛' },
		{ value: '00202', label: '邓振雄', salesperson: '金可鹏' },
		{ value: '00230', label: '深圳市明浩货运代理有限公司', salesperson: '金可鹏' },
		{ value: '00272', label: '武汉洛安供应链有限公司', salesperson: '金可鹏' },
		{ value: '00282', label: '广州市博众供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00293', label: '广东云通供应链有限公司', salesperson: '金可鹏' },
		{ value: '00295', label: '广州壹心膳食管理有限公司', salesperson: '金可鹏' },
		{ value: '00291', label: '武汉至上云合供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00268', label: '陕西裕新物流有限公司', salesperson: '金可鹏' },
		{ value: '00259', label: '上海冉酷物流有限公司', salesperson: '金可鹏' },
		{ value: '00299', label: '成都易达创想物流科技有限责任公司', salesperson: '秦挺' },
		{ value: '00298', label: '嘉兴摩格嘉伟物流有限公司', salesperson: '陈高伟' },
		{ value: '00297', label: '广州腾通物流有限公司', salesperson: '钟祥' },
		{ value: '00296', label: '韶关市金诺郎餐饮管理服务有限公司', salesperson: '伍仲文' },
		{ value: '00294', label: '嘉兴市双瑜食品有限公司', salesperson: '刘念念' },
		{ value: '00292', label: '佛山市昊峰物流供应链有限公司', salesperson: '岑彦' },
		{ value: '00290', label: '重庆氢汀供应链有限公司', salesperson: '秦挺' },
		{ value: '00163', label: '上海心坦物流有限公司', salesperson: '秦挺' },
		{ value: '00289', label: '胡帅鹏', salesperson: '岑彦' },
		{ value: '00288', label: '广州华轩供应链管理有限公司', salesperson: '钟祥' },
		{ value: '00287', label: '无锡铭康物流有限公司-1', salesperson: '董剑煜' },
		{ value: '00286', label: '杭州宏狼物流有限公司', salesperson: '陈高伟' },
		{ value: '00285', label: '范兵', salesperson: '赵连飞' },
		{ value: '00284', label: '嘉兴吉时物流有限公司', salesperson: '刘念念' },
		{ value: '00283', label: '嘉兴坤鑫物流有限公司', salesperson: '刘念念' },
		{ value: '00281', label: '四川富庆物流有限公司', salesperson: '秦挺' },
		{ value: '00280', label: '住商国际物流有限公司无锡分公司', salesperson: '秦挺' },
		{ value: '00206', label: '广东氢沣科技有限公司', salesperson: '吴纬涛' },
		{ value: '00278', label: '佛山市顺德区南番顺货运代理有限公司', salesperson: '钟祥' },
		{ value: '00277', label: '广东省双惠食品有限公司', salesperson: '钟祥' },
		{ value: '00276', label: '广东吉胜食品有限公司', salesperson: '岑彦' },
		{ value: '00275', label: '重塑氢侣（重庆）氢能汽车科技有限公司', salesperson: '金可鹏' },
		{ value: '00075', label: '嘉兴市京宝物流有限公司', salesperson: '刘念念' },
		{ value: '00274', label: '贺州明德供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00273', label: '德阳雄丰供应链管理有限公司', salesperson: '秦挺' },
		{ value: '00262', label: '四川拱照物流有限公司', salesperson: '范军军' },
		{ value: '00229', label: '广州星达供应链管理有限公司', salesperson: '吴纬涛' },
		{ value: '00271', label: '重庆逸茜物流有限公司', salesperson: '金可鹏' },
		{ value: '00205', label: '广东鹏升冷链物流有限公司', salesperson: '岑彦' },
		{ value: '00270', label: '上海利合供应链管理有限公司 (二部)', salesperson: '刘念念' },
		{ value: '00269', label: '广州瑞运物流有限公司', salesperson: '钟祥' },
		{ value: '00267', label: '运中博(广州) 速运有限公司', salesperson: '钟祥' },
		{ value: '00266', label: '佛山市盛朗世供应链管理有限公司', salesperson: '钟祥' },
		{ value: '00264', label: '氢侣重塑（九江）汽车科技有限公司', salesperson: '赵连飞' },
		{ value: '00265', label: '无锡铭康物流有限公司', salesperson: '董剑煜' },
		{ value: '00056', label: '嘉兴大森物流有限公司', salesperson: '刘念念' },
		{ value: '00121', label: '嘉兴古道物流有限公司', salesperson: '刘念念' },
		{ value: '00106', label: '宁波乐驰物流有限公司', salesperson: '赵连飞' },
		{ value: '00120', label: '上海哲准供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00263', label: '上海畅霸实业有限公司', salesperson: '秦挺' },
		{ value: '00261', label: '嘉兴市嘉顺物流有限公司', salesperson: '赵连飞' },
		{ value: '00260', label: '嘉兴必出彩供应链有限公司', salesperson: '董剑煜' },
		{ value: '00258', label: '桐乡市丰韵快递有限责任公司', salesperson: '刘念念' },
		{ value: '00257', label: '四川蓉新顺通运输有限公司', salesperson: '秦挺' },
		{ value: '00256', label: '嘉兴智奇供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00255', label: '浙江恒运集装箱运输有限公司', salesperson: '陈高伟' },
		{ value: '00254', label: '四川邦达蜀运供应链管理有限公司', salesperson: '秦挺' },
		{ value: '00253', label: '成都诺和物流有限公司', salesperson: '秦挺' },
		{ value: '00252', label: '广东星空海实业有限公司', salesperson: '伍仲文' },
		{ value: '00251', label: '日邮物流（中国）有限公司苏州分公司', salesperson: '金可鹏' },
		{ value: '00250', label: '上海武赢货运代理有限公司', salesperson: '秦挺' },
		{ value: '00235', label: '广州市黄埔区小胖兄弟蔬果配送 中心 （个体工商户）', salesperson: '金可鹏' },
		{ value: '00248', label: '成都玉池物流有限公司', salesperson: '秦挺' },
		{ value: '00247', label: '四川群彬物流有限公司', salesperson: '秦挺' },
		{ value: '00246', label: '深圳市兴峰物流有限公司', salesperson: '吴纬涛' },
		{ value: '00245', label: '无锡双庙运输有限公司', salesperson: '谯云' },
		{ value: '00243', label: '浙江集佑供应链有限公司', salesperson: '陈高伟' },
		{ value: '00242', label: '嘉兴市南湖区新丰镇乐果货物运输服务部（个体工商户）', salesperson: '刘念念' },
		{ value: '00241', label: '武汉吉辰速运配送有限公司', salesperson: '秦挺' },
		{ value: '00240', label: '重庆金时源供应链有限公司', salesperson: '秦挺' },
		{ value: '00239', label: '四川云港冷链物流有限公司', salesperson: '秦挺' },
		{ value: '00237', label: '嘉兴港区韵达快递有限公司新仓分理部', salesperson: '刘念念' },
		{ value: '00238', label: '江苏诚之源供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00139', label: '广东布谷供应链管理有限公司', salesperson: '岑彦' },
		{ value: '00232', label: '广东谷登餐饮管理服务有限公司', salesperson: '伍仲文' },
		{ value: '00187', label: '韶关市乐诚农产品有限公司', salesperson: '伍仲文' },
		{ value: '00193', label: '广东黎耀供应链管理有限公司', salesperson: '伍仲文' },
		{ value: '00162', label: '广东雄鑫农业发展有限公司', salesperson: '伍仲文' },
		{ value: '00136', label: '广东兴顺佳集团有限公司韶关市曲江分公司', salesperson: '伍仲文' },
		{ value: '00055', label: '韶关市曲江区新供销荣丰商贸有限公司', salesperson: '伍仲文' },
		{ value: '00006', label: '广东宝地南华产城发展有限公司', salesperson: '伍仲文' },
		{ value: '00225', label: '广州金吉顺国际物流有限公司', salesperson: '岑彦' },
		{ value: '00228', label: '吴志彭', salesperson: '岑彦' },
		{ value: '00214', label: '嘉口福食品(肇庆)有限公司', salesperson: '岑彦' },
		{ value: '00191', label: '中山市蜂驰物流服务有限公司', salesperson: '岑彦' },
		{ value: '00112', label: '创氢物流科技(佛山)有限公司', salesperson: '岑彦' },
		{ value: '00236', label: '上海宏宙国际物流有限公司', salesperson: '秦挺' },
		{ value: '00234', label: '乐清市磐南装卸有限公司', salesperson: '陈高伟' },
		{ value: '00233', label: '上海明纳物流有限公司', salesperson: '谯云' },
		{ value: '00231', label: '广州长运冷链服务有限公司', salesperson: '金可鹏' },
		{ value: '00174', label: '广东利拉贝物流科技有限公司', salesperson: '金可鹏' },
		{ value: '00154', label: '盈龙物流(广州)有限公司', salesperson: '金可鹏' },
		{ value: '00177', label: '贵州省兴氢时代新能源科技有限公司', salesperson: '秦挺' },
		{ value: '00227', label: '嘉兴市飞宇物流有限公司', salesperson: '赵连飞' },
		{ value: '00226', label: '嘉兴鹏腾物流有限公司', salesperson: '刘念念' },
		{ value: '00224', label: '平湖市易皓服装经营部', salesperson: '刘念念' },
		{ value: '00223', label: '上海昂久国际物流有限公司', salesperson: '金可鹏' },
		{ value: '00218', label: '佛山车鑫邦供应链管理有限公司', salesperson: '钟祥' },
		{ value: '00222', label: '杭州张建丽信息咨询有限公司', salesperson: '刘念念' },
		{ value: '00221', label: '佛山市南海区厨神膳食管理有限公司', salesperson: '李俊作' },
		{ value: '00220', label: '嘉兴市南湖区大桥镇雪观运输装卸服务站', salesperson: '刘念念' },
		{ value: '00219', label: '嘉兴玲利供应链科技有限公司', salesperson: '陈高伟' },
		{ value: '00217', label: '昆山毅通麦物流科技有限公司', salesperson: '刘念念' },
		{ value: '00216', label: '上海朔宇物流有限公司', salesperson: '刘念念' },
		{ value: '00215', label: '阿坝州川达物流有限公司', salesperson: '秦挺' },
		{ value: '00213', label: '广东旺佳食品科技有限公司', salesperson: '金可鹏' },
		{ value: '00212', label: '广东新农人农业科技集团股份有限公司', salesperson: '金可鹏' },
		{ value: '00211', label: '普途供应链管理（重庆）有限公司', salesperson: '秦挺' },
		{ value: '00210', label: '佛山市三水区国裕饮食管理有限公司', salesperson: '钟祥' },
		{ value: '00209', label: '新疆佳淇信息科技有限公司', salesperson: '尚建华' },
		{ value: '00208', label: '广东粤祥食品供应链运营管理有限公司', salesperson: '钟祥' },
		{ value: '00207', label: '广州市汇优餐饮服务有限责任公司', salesperson: '金可鹏' },
		{ value: '00204', label: '佛山市三水淼供农产品有限公司', salesperson: '钟祥' },
		{ value: '00203', label: '深圳市扬浠物流有限公司', salesperson: '李俊作' },
		{ value: '00201', label: '浙江运畅供应链管理有限公司-1', salesperson: '陈高伟' },
		{ value: '00085', label: '嘉兴市嘉驰运输有限公司', salesperson: '陈高伟' },
		{ value: '00200', label: '广州市畅远供应链管理有限公司广州分公司', salesperson: '金可鹏' },
		{ value: '00199', label: '广州市德利新隆生鲜食品有限公司', salesperson: '金可鹏' },
		{ value: '00198', label: '浙江洋开供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00197', label: '平湖市博赢物品存放服务部(个体工商户)', salesperson: '刘念念' },
		{ value: '00196', label: '广州文创供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00195', label: '广州仁昌物流仓储有限公司', salesperson: '金可鹏' },
		{ value: '00194', label: '广州市范来餐饮管理有限公司', salesperson: '金可鹏' },
		{ value: '00192', label: '佛山日隆能源科技有限公司', salesperson: '钟祥' },
		{ value: '00189', label: '重庆正合印务有限公司', salesperson: '秦挺' },
		{ value: '00124', label: '上海馨想事辰供应链有限公司', salesperson: '金可鹏' },
		{ value: '00188', label: '广州埔供优选配送服务有限公司', salesperson: '金可鹏' },
		{ value: '00186', label: '荣达餐饮(广东)集团有限公司', salesperson: '金可鹏' },
		{ value: '00185', label: '陈海松', salesperson: '李俊作' },
		{ value: '00089', label: '新疆中铁黑豹物流有限公司', salesperson: '尚建华' },
		{ value: '00184', label: '陈肖云', salesperson: '李俊作' },
		{ value: '00183', label: '广州翼冕物流有限公司', salesperson: '金可鹏' },
		{ value: '00182', label: '东莞市浩洋物流有限公司', salesperson: '钟祥' },
		{ value: '00181', label: '嘉兴益顺冷链物流有限公司', salesperson: '尚建华' },
		{ value: '00180', label: '中山市森汇食品有限公司', salesperson: '金可鹏' },
		{ value: '00178', label: '广州健好物流有限公司', salesperson: '钟祥' },
		{ value: '00176', label: '昆山司益通物流有限公司', salesperson: '刘念念' },
		{ value: '00175', label: '乐山辰农物流有限公司', salesperson: '秦挺' },
		{ value: '00173', label: '广州毅斌物流有限公司', salesperson: '钟祥' },
		{ value: '00172', label: '平湖聚笙餐饮管理有限公司', salesperson: '刘念念' },
		{ value: '00171', label: '广东中膳金勺子食品集团有限公司', salesperson: '金可鹏' },
		{ value: '00170', label: '佛山龙天红专汽车服务有限公司', salesperson: '钟祥' },
		{ value: '00169', label: '上海大金物流有限公司', salesperson: '秦挺' },
		{ value: '00168', label: '嘉兴市豪瑞贸易有限公司', salesperson: '刘念念' },
		{ value: '00167', label: '西安御盛合供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00166', label: '现代汽车氢燃料电池系统（广州）有限公司', salesperson: '金可鹏' },
		{ value: '00165', label: '广东千寻物流有限公司', salesperson: '钟祥' },
		{ value: '00082', label: '宁波港集装箱运输有限公司嘉兴分公司', salesperson: '陈高伟' },
		{ value: '00164', label: '广东祥鑫物流有限公司', salesperson: '李俊作' },
		{ value: '00160', label: '广州市骏川物流有限公司', salesperson: '李俊作' },
		{ value: '00159', label: '新疆新铁新集供应链管理有限公司', salesperson: '尚建华' },
		{ value: '00158', label: '浙江睿迅供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00157', label: '东莞沙田炽瑞物流有限公司', salesperson: '金可鹏' },
		{ value: '00156', label: '重庆东迅物流有限公司', salesperson: '张明勇' },
		{ value: '00093', label: '海珀特科技（北京）有限公司', salesperson: '尚建华' },
		{ value: '00155', label: '广州佳晟餐饮服务有限公司', salesperson: '金可鹏' },
		{ value: '00151', label: '安徽政江物流有限公司', salesperson: '刘念念' },
		{ value: '00148', label: '浙江运畅供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00147', label: '万通亟至（天津）物流科技有限公司', salesperson: '金可鹏' },
		{ value: '00146', label: '广州天叶冷藏物流有限公司', salesperson: '李俊作' },
		{ value: '00145', label: '云浮市佳讯物流有限公司', salesperson: '黄卓华' },
		{ value: '00144', label: '芜湖莱立奇供应链有限公司', salesperson: '金可鹏' },
		{ value: '00335', label: '保正(上海)供应链管理股份有限公司', salesperson: '金可鹏' },
		{ value: '00033', label: '广东雪印集团有限公司', salesperson: '金可鹏' },
		{ value: '00115', label: '佛山市志豪物流有限公司', salesperson: '钟祥' },
		{ value: '00113', label: '源鸿物联科技有限公司', salesperson: '金可鹏' },
		{ value: '00128', label: '苏州尚工物流有限公司', salesperson: '李俊作' },
		{ value: '00132', label: '广州华文国际供应链有限公司', salesperson: '黄卓华' },
		{ value: '00138', label: '湖北安捷楚道供应链有限公司', salesperson: '金可鹏' },
		{ value: '00140', label: '佛山市捷程通供应链管理服务有限公司', salesperson: '李俊作' },
		{ value: '00141', label: '同沃新能源汽车服务(深圳)有限公司', salesperson: '钟祥' },
		{ value: '00143', label: '广州萧金物流有限公司', salesperson: '钟祥' },
		{ value: '00065', label: '新汽（北京）新能源有限公司', salesperson: '刘念念' },
		{ value: '00142', label: '北京海龙一诺物流有限责任公司', salesperson: '尚建华' },
		{ value: '00137', label: '广州市多顺储运有限公司', salesperson: '金可鹏' },
		{ value: '00129', label: '江苏港泽碳谷开发建设有限公司（盐城大丰汇祺开发建设有限公司）', salesperson: '陈高伟' },
		{ value: '00135', label: '宁波卓辉物流有限公司', salesperson: '陈高伟' },
		{ value: '00134', label: '苏州望亭远方物流有限公司', salesperson: '刘念念' },
		{ value: '00133', label: '广州市福禧农业发展有限公司', salesperson: '金可鹏' },
		{ value: '00131', label: '沈阳春风物流有限公司', salesperson: '金可鹏' },
		{ value: '00130', label: '广东省好友多味商贸有限公司', salesperson: '金可鹏' },
		{ value: '00127', label: '嘉兴市超越物流有限公司', salesperson: '陈高伟' },
		{ value: '00126', label: '连云港丰嘉物流有限公司', salesperson: '张明勇' },
		{ value: '00125', label: '苏州灿辉物流供应链有限公司', salesperson: '' },
		{ value: '00103', label: '深圳市钉铛运输有限公司', salesperson: '钟祥' },
		{ value: '00107', label: '安徽巨海国际物流有限公司', salesperson: '金可鹏' },
		{ value: '00105', label: '深圳市光音通信技术有限公司', salesperson: '钟祥' },
		{ value: '00088', label: '广东梓源供应链有限公司', salesperson: '钟祥' },
		{ value: '00038', label: '徐青', salesperson: '金可鹏' },
		{ value: '00109', label: '上海庆刚国际物流有限公司', salesperson: '陈高伟' },
		{ value: '00123', label: '山东华邑氢通新能源有限公司', salesperson: '陈高伟' },
		{ value: '00329', label: '沈阳聚德物流有限公司', salesperson: '金可鹏' },
		{ value: '00045', label: '梅兵', salesperson: '刘念念' },
		{ value: '00042', label: '李知成', salesperson: '刘念念' },
		{ value: '00122', label: '嘉兴港区众通快递有限公司', salesperson: '刘念念' },
		{ value: '00018', label: '上海浦江特种气体有限公司', salesperson: '金可鹏' },
		{ value: '00316', label: '嘉兴市乍浦港口经营有限公司', salesperson: '陈高伟' },
		{ value: '00016', label: '上海利合供应链管理有限公司', salesperson: '金可鹏' },
		{ value: '00020', label: '日邮物流(中国)有限公司', salesperson: '金可鹏' },
		{ value: '00022', label: '上海铭晨物流有限公司', salesperson: '金可鹏' },
		{ value: '00069', label: '上海协创国际货运有限公司', salesperson: '金可鹏' },
		{ value: '00072', label: '上海绿远电池有限公司', salesperson: '金可鹏' },
		{ value: '00081', label: '无锡远畅运输有限公司', salesperson: '金可鹏' },
		{ value: '00073', label: '上海聚富祥供应链有限公司', salesperson: '金可鹏' },
		{ value: '00074', label: '南京威路物流有限公司', salesperson: '金可鹏' },
		{ value: '00086', label: '嘉兴路诚物流有限公司', salesperson: '' },
		{ value: '00087', label: '科运物流（深圳）有限公司', salesperson: '陈高伟' },
		{ value: '00091', label: '南京福佑在线电子商务有限公司', salesperson: '' },
		{ value: '00102', label: '天津华兴捷运物流有限公司', salesperson: '金可鹏' },
		{ value: '00101', label: '上海安迦顺物流有限公司', salesperson: '金可鹏' },
		{ value: '00090', label: '上海晟杰供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00035', label: '嘉兴港区韵达快递有限公司', salesperson: '刘念念' },
		{ value: '00063', label: '上海昕海供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00099', label: '佛山市龙天运力新能源汽车租赁有限公司', salesperson: '钟祥' },
		{ value: '00119', label: '中天华氢有限公司', salesperson: '陈高伟' },
		{ value: '00079', label: '苏州臣服国际货运代理有限公司', salesperson: '金可鹏' },
		{ value: '00118', label: '沧州骐骥物流有限公司', salesperson: '金可鹏' },
		{ value: '00080', label: '德州市永顺运输有限公司', salesperson: '金可鹏' },
		{ value: '00117', label: '平湖市申通快递有限公司', salesperson: '刘念念' },
		{ value: '00096', label: '安徽驰远供应链管理有限公司', salesperson: '刘念念' },
		{ value: '00116', label: '新疆安能数字物流有限公司', salesperson: '尚建华' },
		{ value: '00014', label: '嘉兴中外运物流有限公司', salesperson: '尚建华' },
		{ value: '00050', label: '粤北寒牛（韶关市）畜牧贸易有限公司', salesperson: '' },
		{ value: '00114', label: '嘉兴锦湖湾集装箱运输有限责任公司', salesperson: '陈高伟' },
		{ value: '00030', label: '嘉兴启元物流有限公司', salesperson: '尚建华' },
		{ value: '00104', label: '广东政通人和供应链有限公司', salesperson: '钟祥' },
		{ value: '00111', label: '苏州下马刘物流有限公司', salesperson: '' },
		{ value: '00110', label: '上海交运沪北物流发展有限公司', salesperson: '尚建华' },
		{ value: '00108', label: '四川初尧供应链管理有限公司', salesperson: '尚建华' },
		{ value: '00334', label: '深圳市宝德田供应链有限公司', salesperson: '金可鹏' },
		{ value: '00333', label: '嘉兴市福鑫物流有限公司', salesperson: '金可鹏' },
		{ value: '00332', label: '昆山燊达物流供应链有限公司', salesperson: '金可鹏' },
		{ value: '00331', label: '上海彤鑫物流有限公司', salesperson: '金可鹏' },
		{ value: '00330', label: '浙江雷明供应链有限公司', salesperson: '金可鹏' },
		{ value: '00327', label: '李可全', salesperson: '金可鹏' },
		{ value: '00326', label: '苏州乾泰货运有限公司', salesperson: '金可鹏' },
		{ value: '00325', label: '昆山达和供应链管理有限司', salesperson: '刘念念' },
		{ value: '00324', label: '上海艺凡快递有限公司', salesperson: '金可鹏' },
		{ value: '00323', label: '倪国锋', salesperson: '金可鹏' },
		{ value: '00322', label: '胡敏敏', salesperson: '金可鹏' },
		{ value: '00321', label: '李康', salesperson: '金可鹏' },
		{ value: '00320', label: '王东连', salesperson: '金可鹏' },
		{ value: '00319', label: '魏小彦', salesperson: '金可鹏' },
		{ value: '00318', label: '上海豫声国际物流有限公司', salesperson: '金可鹏' },
		{ value: '00317', label: '新森(上海)物流有限公司', salesperson: '金可鹏' },
		{ value: '00038', label: '上海保正供应链有限公司', salesperson: '金可鹏' },
		{ value: '00003', label: '上海知伟物流有限公司', salesperson: '刘念念' },
		{ value: '00025', label: '韶宝新增试用车辆申请', salesperson: '' },
		{ value: '00026', label: '郁海洋', salesperson: '金可鹏' },
		{ value: '00027', label: '上海栀影运输有限公司', salesperson: '金可鹏' },
		{ value: '00028', label: '上海小吉供应链有限公司', salesperson: '金可鹏' },
		{ value: '00029', label: '运满满', salesperson: '' },
		{ value: '00034', label: '李刚', salesperson: '陈高伟' },
		{ value: '00037', label: '徐丽', salesperson: '金可鹏' },
		{ value: '00036', label: '韶关市丰和速递有限公司', salesperson: '' },
		{ value: '00046', label: '苏州众揽星河供应链管理有限公司', salesperson: '' },
		{ value: '00047', label: '上海艾讯物流有限公司', salesperson: '' },
		{ value: '00048', label: '徐洪波', salesperson: '金可鹏' },
		{ value: '00051', label: '高春时', salesperson: '金可鹏' },
		{ value: '00052', label: '上海双田物流有限公司', salesperson: '金可鹏' },
		{ value: '00053', label: '韶关市海成船务有限公司', salesperson: '' },
		{ value: '00057', label: '广东马坝油粘科技开发有限公司', salesperson: '' },
		{ value: '00059', label: '广东省保炎信息服务有限公司', salesperson: '' },
		{ value: '00066', label: '嘉兴锐腾物流有限公司', salesperson: '陈高伟' },
		{ value: '00060', label: '浙江氢能产业发展有限公司', salesperson: '陈高伟' },
		{ value: '00064', label: '韶关市仁弘汽车销售服务有限公司', salesperson: '' },
		{ value: '00067', label: '嘉兴市骏达物流有限公司', salesperson: '' },
		{ value: '00092', label: '韶关市兴达运输有限公司', salesperson: '' },
		{ value: '00095', label: '上海春平实业有限公司', salesperson: '尚建华' },
		{ value: '00098', label: '龙勇', salesperson: '钟祥' },
		{ value: '00071', label: '4.2上海宣传项目', salesperson: '金可鹏' },
		{ value: '00100', label: '北京五方合创物流有限公司', salesperson: '' },
		{ value: '00097', label: '北京锋行物流服务有限公司', salesperson: '' },
		{ value: '00002', label: '上海斯派杰人力资源有限公司', salesperson: '刘念念' },
		{ value: '00084', label: '宇通商用车有限公司', salesperson: '陈高伟' },
		{ value: '00083', label: '上海广轩国际物流有限公司', salesperson: '刘念念' },
		{ value: '00078', label: '宁波鑫荣国际物流有限公司', salesperson: '' },
		{ value: '00077', label: '嘉兴晋茂供应链管理有限公司', salesperson: '' },
		{ value: '00076', label: '安吉天地物流科技有限公司', salesperson: '' },
		{ value: '00070', label: '嘉兴市良荣物流有限公司', salesperson: '刘念念' },
		{ value: '00068', label: '上海万地物流有限公司', salesperson: '尚建华' },
		{ value: '00061', label: '羚牛公务车专用', salesperson: '' },
		{ value: '00058', label: '测试用客户', salesperson: '' },
		{ value: '00054', label: '上海翼赴科技有限公司', salesperson: '刘念念' },
		{ value: '00044', label: '王兵', salesperson: '尚建华' },
		{ value: '00043', label: '龙胜', salesperson: '刘念念' },
		{ value: '00041', label: '李朝飞', salesperson: '刘念念' },
		{ value: '00040', label: '朱俊霖', salesperson: '刘念念' },
		{ value: '00032', label: '嘉兴市众立物流有限公司', salesperson: '尚建华' },
		{ value: '00031', label: '嘉兴鼎华国际货运代理有限责任公司', salesperson: '尚建华' },
		{ value: '00021', label: '羚牛氢能-物流中心', salesperson: '尚建华' },
		{ value: '00017', label: '上海怡喆供应链有限公司', salesperson: '金可鹏' },
		{ value: '00015', label: '上海有常物流有限公司', salesperson: '尚建华' },
		{ value: '00013', label: '嘉兴市申通快递有限公司', salesperson: '尚建华' },
		{ value: '00012', label: '嘉兴金小悦贸易有限公司', salesperson: '尚建华' },
		{ value: '00010', label: '韶关市韶宝物流有限公司', salesperson: '' },
		{ value: '00008', label: '宜章县顺章建材有限公司', salesperson: '金可鹏' },
		{ value: '00007', label: '上海迅杰物流有限公司', salesperson: '金可鹏' },
		{ value: '00005', label: '张家港中润物流有限公司', salesperson: '金可鹏' },
		{ value: '00004', label: '嘉兴日蒸食品有限公司', salesperson: '金可鹏' },
		{ value: '00001', label: '锡庆供应链管理(上海)有限公司', salesperson: '金可鹏' },
		{ value: '00036', label: '上海米来物流股份有限公司', salesperson: '金可鹏' },
		{ value: '00035', label: '上海宏顺物流有限公司', salesperson: '金可鹏' },
		{ value: '00315', label: '中外运物流华东有限公司', salesperson: '尚建华' },
		{ value: '00328', label: '北京中谊快运有限公司', salesperson: '金可鹏' },
	];

	/** 客户名称下拉：除客户库外的固定选项 */
	var CUSTOMER_ID_VEHICLE_MOVE = '__h2_customer_vehicle_move__';
	var CUSTOMER_ID_PENDING_CONFIRM = '__h2_customer_pending_confirm__';
	var CUSTOMER_EXTRA_OPTIONS = [
		{ value: CUSTOMER_ID_VEHICLE_MOVE, label: '车辆异动', salesperson: '' },
		{ value: CUSTOMER_ID_PENDING_CONFIRM, label: '特殊待确认客户', salesperson: '' }
	];

	function isSpecialCustomerId(customerId) {
		return (
			customerId === CUSTOMER_ID_VEHICLE_MOVE ||
			customerId === CUSTOMER_ID_PENDING_CONFIRM
		);
	}

	function isRegularCustomerId(customerId) {
		return !!customerId && !isSpecialCustomerId(customerId);
	}

	function buildCustomerSelectOptions() {
		return CUSTOMER_EXTRA_OPTIONS.map(function (c) {
			return { value: c.value, label: c.label };
		}).concat(
			CUSTOMER_LIST.map(function (c) {
				return { value: c.value, label: c.label };
			})
		);
	}

	var SALESPERSON_FILTER_OPTIONS = (function () {
		var seen = {};
		var list = [];
		CUSTOMER_LIST.forEach(function (c) {
			var s = c.salesperson;
			if (s && !seen[s]) {
				seen[s] = true;
				list.push({ value: s, label: s });
			}
		});
		list.sort(function (a, b) {
			return String(a.label).localeCompare(String(b.label), 'zh-CN');
		});
		return list;
	})();

	var COMPANY_LIST = [
		{ value: 'co1', label: '浙江羚牛氢能科技有限公司' },
		{ value: 'co2', label: '羚牛新能源运营有限公司' },
		{ value: 'co3', label: '华东氢能服务有限公司' }
	];

	var SETTLEMENT_STATUS_OPTIONS = [
		{ value: 'customer', label: '客户承担' },
		{ value: 'internal', label: '我司承担' },
		{ value: 'customer_self', label: '客户自行结算' },
		{ value: 'other', label: '其他结算' }
	];

	var PAYMENT_STATUS_OPTIONS = [
		{ value: 'unpaid', label: '未付款' },
		{ value: 'paid', label: '已付款' },
		{ value: 'partial', label: '部分付款' }
	];

	/** 加氢站付款 / 客户收款（系统带出，仅已付款、未付款） */
	var BINARY_PAID_STATUS_OPTIONS = [
		{ value: 'paid', label: '已付款' },
		{ value: 'unpaid', label: '未付款' }
	];

	var CHANGE_LOG_FIELD_LABELS = {
		reconcileStatus: '状态',
		hydrogenTime: '加氢时间',
		stationId: '加氢站名称',
		plateNo: '车牌号',
		mileageKm: '行驶里程(km)',
		hydrogenKg: '加氢量(kg)',
		costUnitPrice: '成本单价(元/kg)',
		costTotal: '成本总价(元)',
		customerId: '客户名称',
		customerUnitPrice: '加氢单价(元/kg)',
		customerAmount: '加氢总价(元)',
		settlementStatus: '承担方式',
		remark: '备注',
		orderNo: '订单编号',
		_copy: '复制新增',
		_import: '批量导入',
		_create: '新增记录'
	};

	var OTHER_CREATORS = [
		{ id: 'u_biz_wang', name: '王业务' },
		{ id: 'u_biz_zhao', name: '赵业务' }
	];

	var IMPORT_TEMPLATE_HEADERS = [
		'加氢时间',
		'加氢站名称',
		'车牌号',
		'行驶里程(km)',
		'加氢量(kg)',
		'成本单价(元/kg)',
		'客户名称',
		'加氢单价(元/kg)',
		'承担方式',
		'备注'
	];

	var SETTLEMENT_LABEL_TO_VALUE = {
		客户承担: 'customer',
		我司承担: 'internal',
		客户自行结算: 'customer_self',
		其他结算: 'other',
		客户结算: 'customer',
		公司内部: 'internal'
	};
	var PAYMENT_LABEL_TO_VALUE = { 未付款: 'unpaid', 已付款: 'paid', 部分付款: 'partial' };

	function isPlateInVehicleTable(plate) {
		return VEHICLE_INFO_TABLE.indexOf(plate) >= 0;
	}

	function findStation(val) {
		var i;
		for (i = 0; i < HYDROGEN_STATION_LIST.length; i++) {
			if (HYDROGEN_STATION_LIST[i].value === val) {
				var base = HYDROGEN_STATION_LIST[i];
				var priceMeta = STATION_SYSTEM_PRICE_MAP[base.value];
				return priceMeta ? Object.assign({}, base, priceMeta) : base;
			}
		}
		return null;
	}

	function findStationByLabel(label) {
		var i;
		var text = String(label || '').trim();
		if (!text) return null;
		for (i = 0; i < HYDROGEN_STATION_LIST.length; i++) {
			if (HYDROGEN_STATION_LIST[i].label === text) return findStation(HYDROGEN_STATION_LIST[i].value);
		}
		return null;
	}

	function findCustomerByLabel(label) {
		var i;
		var text = String(label || '').trim();
		if (!text) return null;
		for (i = 0; i < CUSTOMER_EXTRA_OPTIONS.length; i++) {
			if (CUSTOMER_EXTRA_OPTIONS[i].label === text) return CUSTOMER_EXTRA_OPTIONS[i];
		}
		for (i = 0; i < CUSTOMER_LIST.length; i++) {
			if (CUSTOMER_LIST[i].label === text) return CUSTOMER_LIST[i];
		}
		return null;
	}

	function csvEscape(v) {
		var s = String(v == null ? '' : v);
		if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
		return s;
	}

	function downloadCsv(filename, headers, rows) {
		var lines = [headers.map(csvEscape).join(',')].concat(
			(rows || []).map(function (r) {
				return r.map(csvEscape).join(',');
			})
		);
		var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function parseCsvLine(line) {
		var out = [];
		var cur = '';
		var inQuote = false;
		var i;
		for (i = 0; i < line.length; i++) {
			var ch = line.charAt(i);
			if (inQuote) {
				if (ch === '"') {
					if (line.charAt(i + 1) === '"') {
						cur += '"';
						i++;
					} else inQuote = false;
				} else cur += ch;
			} else if (ch === '"') inQuote = true;
			else if (ch === ',') {
				out.push(cur);
				cur = '';
			} else cur += ch;
		}
		out.push(cur);
		return out;
	}

	function parseImportCsv(text) {
		var raw = String(text || '').replace(/^\uFEFF/, '');
		var lines = raw.split(/\r?\n/).filter(function (ln) {
			return ln.trim().length > 0;
		});
		if (lines.length < 2) return [];
		var headers = parseCsvLine(lines[0]).map(function (h) {
			return String(h || '').trim();
		});
		var idx = {};
		headers.forEach(function (h, i) {
			idx[h] = i;
		});
		var rows = [];
		var li;
		for (li = 1; li < lines.length; li++) {
			var cells = parseCsvLine(lines[li]);
			if (!cells.some(function (c) { return String(c || '').trim(); })) continue;
			rows.push({ cells: cells, idx: idx });
		}
		return rows;
	}

	function parseImportDate(val) {
		if (!val || !window.dayjs) return null;
		var s = String(val).trim();
		if (!s) return null;
		var d = window.dayjs(s);
		return d.isValid() ? d : null;
	}

	function buildRowFromImport(item) {
		var cells = item.cells;
		var idx = item.idx;
		var get = function (h) {
			var i = idx[h];
			return i == null || i < 0 ? '' : String(cells[i] == null ? '' : cells[i]).trim();
		};
		var station = findStationByLabel(get('加氢站名称'));
		var customerLabel = get('客户名称');
		var customer = customerLabel ? findCustomerByLabel(customerLabel) : null;
		var settlementLabel = get('承担方式') || get('结算状态');
		var now = nowDayjs();
		var draft = {
			key: nextRowKey(),
			createdBy: CURRENT_USER.id,
			creatorName: CURRENT_USER.name,
			orderNo: '',
			hydrogenTime: parseImportDate(get('加氢时间')) || now,
			stationId: station ? station.value : undefined,
			stationName: station ? station.label : get('加氢站名称'),
			plateNo: get('车牌号') || undefined,
			mileageKm: normalizeMileageKm(get('行驶里程(km)')),
			hydrogenKg: normalizeBatchUnitPrice(get('加氢量(kg)')),
			costUnitPrice: normalizeBatchUnitPrice(get('成本单价(元/kg)')),
			costTotal: null,
			customerId: customer ? customer.value : undefined,
			customerName: customer ? customer.label : '',
			customerUnitPrice: normalizeBatchUnitPrice(get('加氢单价(元/kg)') || get('对客单价(元/kg)')),
			customerAmount: null,
			salesperson: customer ? customer.salesperson || '' : '',
			settlementStatus: SETTLEMENT_LABEL_TO_VALUE[settlementLabel] || 'customer',
			remark: get('备注'),
			createdAt: now,
			reconcileStatus: null
		};
		return Object.assign({}, draft, resolveLinkedModuleFields(draft));
	}

	function getSystemPricesForRow(row) {
		var station = findStation(row.stationId);
		if (!station || !row.hydrogenTime || !window.dayjs) return { cost: null, customer: null };
		var ht;
		try {
			ht = window.dayjs(row.hydrogenTime);
		} catch (e7) {
			return { cost: null, customer: null };
		}
		var cost = null;
		var customer = null;
		if (station.costPrice != null && station.costPriceEffective) {
			try {
				if (!ht.isBefore(window.dayjs(station.costPriceEffective).startOf('day'))) {
					cost = roundMoney(station.costPrice);
				}
			} catch (e8) {}
		}
		if (station.customerPrice != null && station.customerPriceEffective) {
			try {
				if (!ht.isBefore(window.dayjs(station.customerPriceEffective).startOf('day'))) {
					customer = roundMoney(station.customerPrice);
				}
			} catch (e9) {}
		}
		return { cost: cost, customer: customer };
	}

	function isHydrogenKgWarn(row) {
		return !isEmptyNum(row.hydrogenKg) && numOrZero(row.hydrogenKg) > 60;
	}

	function isCostPriceWarn(row) {
		if (isEmptyNum(row.costUnitPrice)) return false;
		var sys = getSystemPricesForRow(row);
		if (sys.cost == null) return false;
		return roundMoney(row.costUnitPrice) !== sys.cost;
	}

	function isCustomerPriceWarn(row) {
		if (isEmptyNum(row.customerUnitPrice)) return false;
		var sys = getSystemPricesForRow(row);
		if (sys.customer == null) return false;
		return roundMoney(row.customerUnitPrice) !== sys.customer;
	}

	function isRowDataWarn(row) {
		return isHydrogenKgWarn(row) || isCostPriceWarn(row) || isCustomerPriceWarn(row);
	}

	function findCustomer(val) {
		var i;
		if (!val) return null;
		for (i = 0; i < CUSTOMER_EXTRA_OPTIONS.length; i++) {
			if (CUSTOMER_EXTRA_OPTIONS[i].value === val) return CUSTOMER_EXTRA_OPTIONS[i];
		}
		for (i = 0; i < CUSTOMER_LIST.length; i++) {
			if (CUSTOMER_LIST[i].value === val) return CUSTOMER_LIST[i];
		}
		return null;
	}

	/** 原型：联调后从客户/合同/财务模块自动拉取，不可手工录入 */
	function resolveLinkedModuleFields(row) {
		if (!row || !isRegularCustomerId(row.customerId)) {
			return {
				receiptDate: null,
				stationPaymentStatus: null,
				invoiceDate: null,
				reconcileDate: null,
				paymentStatus: null,
				customerReceiptStatus: null,
				companyId: undefined,
				companyName: ''
			};
		}
		var idx = 0;
		var i;
		for (i = 0; i < CUSTOMER_LIST.length; i++) {
			if (CUSTOMER_LIST[i].value === row.customerId) {
				idx = i;
				break;
			}
		}
		var company = COMPANY_LIST[idx % COMPANY_LIST.length];
		var base = row.hydrogenTime || row.createdAt || nowDayjs();
		var invoiceDate = base;
		var reconcileDate = base;
		if (window.dayjs && base) {
			try {
				invoiceDate = window.dayjs(base).subtract(idx % 4, 'day');
				reconcileDate = window.dayjs(base).subtract((idx % 4) + 1, 'day');
			} catch (eLink) {}
		}
		var paymentStatus = idx % 3 === 0 ? 'paid' : idx % 3 === 1 ? 'partial' : 'unpaid';
		var receiptDate = base;
		if (window.dayjs && base) {
			try {
				receiptDate = window.dayjs(base).subtract((idx % 5) + 2, 'day');
			} catch (eReceipt) {}
		}
		var stationPaymentStatus = idx % 2 === 0 ? 'paid' : 'unpaid';
		var customerReceiptStatus = paymentStatus === 'paid' ? 'paid' : 'unpaid';
		return {
			receiptDate: receiptDate,
			stationPaymentStatus: stationPaymentStatus,
			invoiceDate: invoiceDate,
			reconcileDate: reconcileDate,
			paymentStatus: paymentStatus,
			customerReceiptStatus: customerReceiptStatus,
			companyId: company.value,
			companyName: company.label
		};
	}

	function isEmptyStr(v) {
		return !String(v == null ? '' : v).trim();
	}

	function isEmptyNum(v) {
		return v === null || v === undefined || v === '';
	}

	function getRowInvalidMap(row) {
		var inv = {};
		if (!row.hydrogenTime) inv.hydrogenTime = true;
		if (!row.stationId) inv.stationId = true;
		if (!row.plateNo) inv.plateNo = 'empty';
		else if (!isPlateInVehicleTable(row.plateNo)) inv.plateNo = 'not_exist';
		if (isEmptyNum(row.hydrogenKg) || numOrZero(row.hydrogenKg) <= 0) inv.hydrogenKg = true;
		if (isEmptyNum(row.costUnitPrice) || numOrZero(row.costUnitPrice) <= 0) inv.costUnitPrice = true;
		if (isEmptyNum(row.customerUnitPrice) || numOrZero(row.customerUnitPrice) <= 0) inv.customerUnitPrice = true;
		if (!row.settlementStatus) inv.settlementStatus = true;
		return inv;
	}

	function isNewRow(row) {
		return row && (!row.reconcileStatus || row.reconcileStatus === RECONCILE_DRAFT);
	}

	function isPendingRow(row) {
		return row && row.reconcileStatus === RECONCILE_PENDING;
	}

	function isReconciledRow(row) {
		return row && row.reconcileStatus === RECONCILE_RECONCILED;
	}

	function rowDisplaySortTier(row) {
		if (isReconciledRow(row)) return 0;
		if (isPendingRow(row)) return 1;
		return 2;
	}

	function rowStatusLabel(row) {
		if (isReconciledRow(row)) return '已对账';
		if (isPendingRow(row)) return '未对账';
		return '';
	}

	function canShowPendingActions(row) {
		return isPendingRow(row);
	}

	function canCopyRow(row) {
		if (!row || isReconciledRow(row)) return false;
		if (isPendingRow(row)) return true;
		return isNewRow(row) && row.createdBy === CURRENT_USER.id;
	}

	function cloneRowTimeValue(t) {
		if (!t) return t;
		try {
			if (window.dayjs && window.dayjs.isDayjs && window.dayjs.isDayjs(t)) return t.clone();
			if (window.dayjs) {
				var d = window.dayjs(t);
				return d.isValid() ? d : t;
			}
		} catch (eClone) {}
		return t;
	}

	function buildCopiedRow(sourceRow) {
		var now = nowDayjs();
		var draft = {
			key: nextRowKey(),
			createdBy: CURRENT_USER.id,
			creatorName: CURRENT_USER.name,
			orderNo: '',
			hydrogenTime: cloneRowTimeValue(sourceRow.hydrogenTime),
			stationId: sourceRow.stationId,
			stationName: sourceRow.stationName || '',
			plateNo: sourceRow.plateNo,
			mileageKm: sourceRow.mileageKm,
			hydrogenKg: sourceRow.hydrogenKg,
			costUnitPrice: sourceRow.costUnitPrice,
			costTotal: sourceRow.costTotal,
			customerId: sourceRow.customerId,
			customerName: sourceRow.customerName || '',
			customerUnitPrice: sourceRow.customerUnitPrice,
			customerAmount: sourceRow.customerAmount,
			salesperson: sourceRow.salesperson || '',
			settlementStatus: sourceRow.settlementStatus || 'customer',
			remark: sourceRow.remark || '',
			invoiceDate: cloneRowTimeValue(sourceRow.invoiceDate),
			reconcileDate: cloneRowTimeValue(sourceRow.reconcileDate),
			paymentStatus: sourceRow.paymentStatus,
			companyId: sourceRow.companyId,
			companyName: sourceRow.companyName || '',
			createdAt: now,
			reconcileStatus: null,
			savedAt: null,
			reconciledAt: null
		};
		return recalcAllRows([draft])[0];
	}

	function isRowBatchEditable(row) {
		if (isReconciledRow(row)) return false;
		if (isPendingRow(row)) return true;
		return isNewRow(row) && row.createdBy === CURRENT_USER.id;
	}

	function rowSortTime(row) {
		if (isReconciledRow(row)) return rowTimeValue(row, 'reconciledAt') || rowTimeValue(row, 'savedAt');
		if (isPendingRow(row)) return rowTimeValue(row, 'savedAt') || rowTimeValue(row, 'createdAt');
		return rowTimeValue(row, 'createdAt');
	}

	function canDeleteRow(row, isSupervisorRole) {
		if (isSupervisorRole) return true;
		if (isPendingRow(row)) return true;
		if (isNewRow(row)) return row.createdBy === CURRENT_USER.id;
		return false;
	}

	function rowTimeValue(row, field) {
		var v = row && row[field];
		if (!v || !window.dayjs) return 0;
		try {
			return window.dayjs(v).valueOf();
		} catch (e1) {
			return 0;
		}
	}

	function sortRowsWithinTier(rows, ascending) {
		return rows.slice().sort(function (a, b) {
			var ta = rowSortTime(a);
			var tb = rowSortTime(b);
			if (ta !== tb) return ascending ? ta - tb : tb - ta;
			var keyCmp = String(a.key || '').localeCompare(String(b.key || ''));
			return ascending ? keyCmp : -keyCmp;
		});
	}

	function sortRowsByDisplayTier(rows) {
		var reconciled = [];
		var pending = [];
		var drafts = [];
		(rows || []).forEach(function (r) {
			var tier = rowDisplaySortTier(r);
			if (tier === 0) reconciled.push(r);
			else if (tier === 1) pending.push(r);
			else drafts.push(r);
		});
		// 已对账/未对账：组内时间倒序；待保存：组内时间正序，新增行在表格最底部
		return sortRowsWithinTier(reconciled, false)
			.concat(sortRowsWithinTier(pending, false))
			.concat(sortRowsWithinTier(drafts, true));
	}

	var rowIdSeed = 0;
	function nextRowKey() {
		rowIdSeed += 1;
		return 'h2-' + Date.now() + '-' + rowIdSeed;
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function roundMoney(n) {
		return Math.round(numOrZero(n) * 100) / 100;
	}

	function normalizeBatchUnitPrice(val) {
		if (val === null || val === undefined || val === '') return null;
		var n = Number(val);
		if (!isFinite(n) || n <= 0) return null;
		return roundMoney(n);
	}

	function normalizeMileageKm(val) {
		return normalizeBatchUnitPrice(val);
	}

	function fmtMoney(n) {
		if (n === null || n === undefined || n === '') return '0.00';
		return roundMoney(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function fmtQty(n) {
		if (n === null || n === undefined || n === '') return '-';
		return roundMoney(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function nowDayjs() {
		try {
			if (window.dayjs) return window.dayjs();
		} catch (e1) {}
		return null;
	}

	function formatDate(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format('YYYY-MM-DD');
		} catch (e2) {
			return '';
		}
	}

	var HYDROGEN_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

	function formatDateTime(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format(HYDROGEN_DATETIME_FORMAT);
		} catch (e5) {
			return '';
		}
	}

	function exportLabelOf(opts, val) {
		var i;
		for (i = 0; i < opts.length; i++) {
			if (opts[i].value === val) return opts[i].label;
		}
		return val == null || val === '' ? '' : String(val);
	}

	function exportPlainNum(v) {
		if (isEmptyNum(v)) return '';
		return roundMoney(v).toFixed(2);
	}

	function reconcileStatusLogLabel(status) {
		if (!status || status === RECONCILE_DRAFT) return '待保存';
		if (status === RECONCILE_PENDING) return '未对账';
		if (status === RECONCILE_RECONCILED) return '已对账';
		return String(status);
	}

	function valuesEqualForLog(field, a, b) {
		if (a === b) return true;
		if ((a == null || a === '') && (b == null || b === '')) return true;
		if (field === 'hydrogenTime' && window.dayjs) {
			try {
				return window.dayjs(a).valueOf() === window.dayjs(b).valueOf();
			} catch (eLog) {
				return false;
			}
		}
		if (
			field === 'mileageKm' ||
			field === 'hydrogenKg' ||
			field === 'costUnitPrice' ||
			field === 'customerUnitPrice' ||
			field === 'costTotal' ||
			field === 'customerAmount'
		) {
			if (isEmptyNum(a) && isEmptyNum(b)) return true;
			return roundMoney(a) === roundMoney(b);
		}
		return String(a) === String(b);
	}

	function formatLogValue(field, value, rowCtx) {
		if (value == null || value === '') return '—';
		if (field === 'reconcileStatus') return reconcileStatusLogLabel(value);
		if (field === 'hydrogenTime') return formatDateTime(value) || String(value);
		if (field === 'stationId') {
			var st = findStation(value);
			return st ? st.label : (rowCtx && rowCtx.stationName) || String(value);
		}
		if (field === 'customerId') {
			var cu = findCustomer(value);
			return cu ? cu.label : (rowCtx && rowCtx.customerName) || String(value);
		}
		if (field === 'settlementStatus') return exportLabelOf(SETTLEMENT_STATUS_OPTIONS, value) || '—';
		if (field === 'paymentStatus') return exportLabelOf(PAYMENT_STATUS_OPTIONS, value) || '—';
		if (field === 'companyId') {
			return (rowCtx && rowCtx.companyName) || exportLabelOf(COMPANY_LIST, value) || String(value);
		}
		if (
			field === 'mileageKm' ||
			field === 'hydrogenKg' ||
			field === 'costUnitPrice' ||
			field === 'customerUnitPrice' ||
			field === 'costTotal' ||
			field === 'customerAmount'
		) {
			return isEmptyNum(value) ? '—' : roundMoney(value).toFixed(2);
		}
		return String(value);
	}

	function buildExportColumnDefs() {
		return [
			{ key: 'seq', label: '序号', getValue: function (r) { return r.seq != null ? String(r.seq) : ''; } },
			{
				key: 'recordStatus',
				label: '状态',
				getValue: function (r) {
					var lb = rowStatusLabel(r);
					return lb || '—';
				}
			},
			{ key: 'orderNo', label: '订单编号', getValue: function (r) { return r.orderNo || ''; } },
			{ key: 'hydrogenTime', label: '加氢时间', getValue: function (r) { return formatDateTime(r.hydrogenTime) || ''; } },
			{ key: 'hydrogenDate', label: '加氢日期', getValue: function (r) { return formatDate(r.hydrogenTime) || ''; } },
			{ key: 'stationName', label: '加氢站名称', getValue: function (r) { return r.stationName || ''; } },
			{ key: 'plateNo', label: '车牌号', getValue: function (r) { return r.plateNo || ''; } },
			{ key: 'hydrogenKg', label: '加氢量(kg)', getValue: function (r) { return exportPlainNum(r.hydrogenKg); } },
			{ key: 'costUnitPrice', label: '成本单价(元/kg)', getValue: function (r) { return exportPlainNum(r.costUnitPrice); } },
			{ key: 'costTotal', label: '成本总价(元)', getValue: function (r) { return exportPlainNum(r.costTotal); } },
			{ key: 'customerName', label: '客户名称', getValue: function (r) { return r.customerName || ''; } },
			{ key: 'customerUnitPrice', label: '加氢单价(元/kg)', getValue: function (r) { return exportPlainNum(r.customerUnitPrice); } },
			{ key: 'customerAmount', label: '加氢总价(元)', getValue: function (r) { return exportPlainNum(r.customerAmount); } },
			{ key: 'mileageKm', label: '行驶里程(km)', getValue: function (r) { return exportPlainNum(r.mileageKm); } },
			{ key: 'salesperson', label: '业务员', getValue: function (r) { return r.salesperson || ''; } },
			{
				key: 'settlementStatus',
				label: '承担方式',
				getValue: function (r) { return exportLabelOf(SETTLEMENT_STATUS_OPTIONS, r.settlementStatus); }
			},
			{ key: 'reconcileDate', label: '对账日期', getValue: function (r) { return formatDate(r.reconcileDate) || ''; } },
			{ key: 'remark', label: '备注', getValue: function (r) { return r.remark || ''; } },
			{ key: 'receiptDate', label: '收票日期', getValue: function (r) { return formatDate(r.receiptDate) || ''; } },
			{
				key: 'stationPaymentStatus',
				label: '加氢站付款状态',
				getValue: function (r) { return exportLabelOf(BINARY_PAID_STATUS_OPTIONS, r.stationPaymentStatus); }
			},
			{ key: 'invoiceDate', label: '开票日期', getValue: function (r) { return formatDate(r.invoiceDate) || ''; } },
			{
				key: 'customerReceiptStatus',
				label: '客户收款状态',
				getValue: function (r) { return exportLabelOf(BINARY_PAID_STATUS_OPTIONS, r.customerReceiptStatus); }
			},
			{
				key: 'companyName',
				label: '开票公司',
				getValue: function (r) { return r.companyName || exportLabelOf(COMPANY_LIST, r.companyId); }
			}
		];
	}

	function timeSortValue(t) {
		if (!t || !window.dayjs) return 0;
		try {
			return window.dayjs(t).valueOf();
		} catch (e3) {
			return 0;
		}
	}

	/** 订单编号：JQ + 站点编码 + YYMMDD + 五位序号（同站同日按加氢时间升序，每日从 00001 起） */
	function assignOrderNumbers(rows) {
		if (!window.dayjs) return rows;
		var groups = {};
		(rows || []).forEach(function (r) {
			var station = findStation(r.stationId);
			if (!station || !station.stationCode || !r.hydrogenTime) return;
			var ymd;
			try {
				ymd = window.dayjs(r.hydrogenTime).format('YYMMDD');
			} catch (e4) {
				return;
			}
			var gk = station.stationCode + '|' + ymd;
			if (!groups[gk]) groups[gk] = [];
			groups[gk].push({
				key: r.key,
				stationCode: station.stationCode,
				ymd: ymd,
				time: timeSortValue(r.hydrogenTime),
				createdAt: timeSortValue(r.createdAt)
			});
		});
		var orderMap = {};
		Object.keys(groups).forEach(function (gk) {
			var list = groups[gk];
			var stationCode = list[0].stationCode;
			var ymd = list[0].ymd;
			var prefix = 'JQ' + stationCode + ymd;
			list.sort(function (a, b) {
				if (a.time !== b.time) return a.time - b.time;
				if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
				return String(a.key).localeCompare(String(b.key));
			});
			list.forEach(function (item, idx) {
				orderMap[item.key] = prefix + String(idx + 1).padStart(5, '0');
			});
		});
		return (rows || []).map(function (r) {
			return Object.assign({}, r, { orderNo: orderMap[r.key] || '' });
		});
	}

	function matchStatementPatch(row, patch) {
		if (!row || !patch) return false;
		if (patch.orderNo && row.orderNo && patch.orderNo === row.orderNo) return true;
		if (patch.ledgerId && row.ledgerSyncId && patch.ledgerId === row.ledgerSyncId) return true;
		var rowTime = formatDateTime(row.hydrogenTime) || String(row.hydrogenTime || '');
		var patchTime = String(patch.hydrogenTime || '');
		return (row.stationName || '') === (patch.stationName || '')
			&& (row.plateNo || '') === (patch.plateNo || '')
			&& (rowTime === patchTime || String(row.hydrogenTime || '') === patchTime);
	}

	function applyStatementPatchesToRows(rows, patches) {
		if (!patches || !patches.length) return rows || [];
		return (rows || []).map(function (r) {
			var patch = null;
			var i;
			for (i = 0; i < patches.length; i++) {
				if (matchStatementPatch(r, patches[i])) {
					patch = patches[i];
					break;
				}
			}
			if (!patch) return r;
			return Object.assign({}, r, {
				statementPatched: true,
				reconcileDate: patch.reconcileDate,
				receiptDate: patch.receiptDate,
				stationPaymentStatus: patch.paymentStatus || 'paid',
				paymentStatus: patch.paymentStatus || 'paid',
				reconciledAt: patch.reconcileDate
			});
		});
	}

	function recalcRowFields(row) {
		var mileage = normalizeMileageKm(row.mileageKm);
		var kg = isEmptyNum(row.hydrogenKg) ? null : roundMoney(row.hydrogenKg);
		var costUnit = isEmptyNum(row.costUnitPrice) ? null : roundMoney(row.costUnitPrice);
		var customerUnit = isEmptyNum(row.customerUnitPrice) ? null : roundMoney(row.customerUnitPrice);
		var costTotal = kg != null && costUnit != null ? roundMoney(kg * costUnit) : null;
		var customerAmount = kg != null && customerUnit != null ? roundMoney(kg * customerUnit) : null;
		var station = findStation(row.stationId);
		var customer = findCustomer(row.customerId);
		var linked = resolveLinkedModuleFields(row);
		if (row && row.statementPatched) {
			linked = Object.assign({}, linked, {
				reconcileDate: row.reconcileDate,
				receiptDate: row.receiptDate,
				stationPaymentStatus: row.stationPaymentStatus,
				paymentStatus: row.paymentStatus
			});
		}
		return Object.assign({}, row, {
			mileageKm: mileage,
			hydrogenKg: kg,
			costUnitPrice: costUnit,
			customerUnitPrice: customerUnit,
			costTotal: costTotal,
			customerAmount: customerAmount,
			stationName: station ? station.label : row.stationName,
			customerName: customer ? customer.label : '',
			salesperson: customer ? customer.salesperson || '' : '',
			receiptDate: linked.receiptDate,
			stationPaymentStatus: linked.stationPaymentStatus,
			invoiceDate: linked.invoiceDate,
			reconcileDate: linked.reconcileDate,
			paymentStatus: linked.paymentStatus,
			customerReceiptStatus: linked.customerReceiptStatus,
			companyId: linked.companyId,
			companyName: linked.companyName
		});
	}

	function recalcAllRows(rows) {
		return assignOrderNumbers((rows || []).map(recalcRowFields));
	}

	function buildEmptyRow(user) {
		var now = nowDayjs();
		return recalcAllRows([
			{
				key: nextRowKey(),
				createdBy: user.id,
				creatorName: user.name,
				orderNo: '',
				hydrogenTime: now,
				stationId: undefined,
				stationName: '',
				plateNo: undefined,
				mileageKm: null,
				hydrogenKg: null,
				costUnitPrice: null,
				costTotal: null,
				customerId: undefined,
				customerName: '',
				customerUnitPrice: null,
				customerAmount: null,
				salesperson: '',
				settlementStatus: 'customer',
				remark: '',
				createdAt: now,
				reconcileStatus: null
			}
		])[0];
	}

	function buildMockAllRows() {
		var rows = [];
		var creators = [{ id: CURRENT_USER.id, name: CURRENT_USER.name }].concat(OTHER_CREATORS);
		var i;
		/** 10 条无异常演示：加氢量≤60kg，成本/加氢单价与系统价一致 */
		for (i = 0; i < 10; i++) {
			var creator = creators[i % creators.length];
			var stationBase = HYDROGEN_STATION_LIST[i % HYDROGEN_STATION_LIST.length];
			var station = findStation(stationBase.value) || stationBase;
			var customer = CUSTOMER_LIST[i % CUSTOMER_LIST.length];
			var company = COMPANY_LIST[i % COMPANY_LIST.length];
			var d = nowDayjs();
			var day = d && d.subtract ? d.subtract(i, 'day') : d;
			var reconcileStatus = RECONCILE_DRAFT;
			if (creator.id === CURRENT_USER.id) {
				if (i < 3) reconcileStatus = RECONCILE_RECONCILED;
				else if (i < 7) reconcileStatus = RECONCILE_PENDING;
			} else {
				reconcileStatus = i % 2 === 0 ? RECONCILE_RECONCILED : RECONCILE_PENDING;
			}
			var draftRow = {
				stationId: station.value,
				hydrogenTime: day
			};
			var sys = getSystemPricesForRow(draftRow);
			var costUnit = sys.cost != null ? sys.cost : roundMoney(station.costPrice != null ? station.costPrice : 30);
			var custUnit = sys.customer != null ? sys.customer : roundMoney(station.customerPrice != null ? station.customerPrice : 30);
			var kg = roundMoney(28 + (i % 6) * 2.5);
			rows.push({
				key: 'mock-h2-' + (i + 1),
				createdBy: creator.id,
				creatorName: creator.name,
				hydrogenTime: day,
				stationId: station.value,
				stationName: station.label,
				plateNo: VEHICLE_INFO_TABLE[i % VEHICLE_INFO_TABLE.length],
				mileageKm: 12000 + i * 320,
				hydrogenKg: kg,
				costUnitPrice: costUnit,
				customerId: customer.value,
				customerName: customer.label,
				customerUnitPrice: custUnit,
				salesperson: customer.salesperson,
				settlementStatus: ['customer', 'internal', 'customer_self', 'other'][i % 4],
				invoiceDate: day,
				reconcileDate: day,
				paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'unpaid',
				companyId: company.value,
				companyName: company.label,
				remark: '',
				createdAt: day,
				reconcileStatus: reconcileStatus,
				savedAt: reconcileStatus !== RECONCILE_DRAFT ? day : null,
				reconciledAt: reconcileStatus === RECONCILE_RECONCILED ? day : null
			});
		}
		return recalcAllRows(rows);
	}

	var layoutStyle = {
		padding: '16px 24px 24px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};

	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterCardStyle = {
		marginBottom: 20,
		borderRadius: 16,
		boxShadow: '0 4px 20px -4px rgba(16,24,40,0.03), 0 0 0 1px rgba(16,24,40,0.06)',
		border: 'none',
		background: '#ffffff'
	};

	var tableCardStyle = {
		borderRadius: 16,
		boxShadow: '0 10px 32px -4px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
		border: 'none',
		background: '#ffffff',
		overflow: 'hidden'
	};

	var ledgerTableStyle =
		'.h2-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.h2-ledger-table .ant-table-thead>tr>th,.h2-ledger-table .ant-table-thead .ant-table-cell{white-space:nowrap;color:#0f172a!important;font-weight:600!important;font-size:12px!important;' +
		'background:#e8f4fc!important;border-bottom:1px solid #bae6fd!important;border-inline-end:1px solid #dbeafe!important;padding:0 6px!important;height:36px!important;text-align:center!important}' +
		'.h2-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{padding:4px 6px!important;vertical-align:middle!important;font-size:12px}' +
		'.h2-ledger-table .ant-table-tbody>tr.h2-row-data:hover>td{background:#f0f9ff!important}' +
		'.h2-ledger-totals-bar{display:flex;align-items:stretch;gap:0;margin-bottom:10px;border:1px solid #bae6fd;border-radius:10px;overflow:hidden;background:#f8fafc;box-shadow:0 1px 0 rgba(15,23,42,0.04)}' +
		'.h2-ledger-totals-bar__title{display:flex;align-items:center;justify-content:center;min-width:72px;padding:10px 14px;font-size:14px;font-weight:700;color:#0f172a;background:#e8f4fc;border-right:1px solid #bae6fd}' +
		'.h2-ledger-totals-bar__items{display:flex;flex:1;flex-wrap:wrap}' +
		'.h2-ledger-totals-bar__item{flex:1;min-width:160px;padding:8px 20px;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:center;gap:4px}' +
		'.h2-ledger-totals-bar__item:last-child{border-right:none}' +
		'.h2-ledger-totals-bar__label{font-size:12px;color:rgba(15,23,42,0.55);font-weight:500;line-height:1.2}' +
		'.h2-ledger-totals-bar__value{font-size:16px;font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums;line-height:1.3}' +
		'.h2-cell-readonly{color:#64748b;background:#f8fafc;padding:4px 6px}' +
		'.h2-cell-auto{color:#475569;background:#f1f5f9;padding:4px 6px}' +
		'.h2-cell-warn{color:#874d00;background:#fffbe6!important;border:1px solid #ffe58f}' +
		'.h2-warn-input-wrap .ant-input-number,.h2-warn-input-wrap .ant-input-number-input{background:#fffbe6!important}' +
		'.h2-ledger-table .ant-picker.h2-datetime-picker{min-width:178px}' +
		'.h2-row-tier-0>td{background:#f8fafc!important}' +
		'.h2-row-tier-2>td{background:#fffbeb!important}' +
		'.h2-row-tier-boundary>td{border-top:2px solid #7dd3fc!important}' +
		'.h2-action-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;cursor:pointer;color:rgba(15,23,42,0.55);transition:background .15s,color .15s}' +
		'.h2-action-icon-btn:hover{background:#f0f9ff;color:#1677ff}' +
		'.h2-action-icon-btn.h2-action-icon-danger:hover{background:#fff1f0;color:#ff4d4f}' +
		'.h2-action-icon-btn.is-disabled{color:rgba(15,23,42,0.25);cursor:not-allowed;pointer-events:none}' +
		'.h2-row-more-btn.h2-action-icon-btn:hover{background:#f5f5f5;color:rgba(15,23,42,0.75)}' +
		'.h2-req-doc-panel{max-width:100%}' +
		'.h2-req-doc-panel h1:first-child{margin-top:0}';

	var rowsState = useState(function () {
		var base = buildMockAllRows();
		var patches = (typeof window !== 'undefined' && window.H2_STATION_STATEMENT_LEDGER_UPDATES) || [];
		return recalcAllRows(applyStatementPatchesToRows(base, patches));
	});
	var allRows = rowsState[0];
	var setAllRows = rowsState[1];

	if (typeof window !== 'undefined') {
		window.H2_VEHICLE_LEDGER_API = {
			applyPatches: function (patches) {
				if (!patches || !patches.length) return;
				setAllRows(function (prev) {
					return recalcAllRows(applyStatementPatchesToRows(prev, patches));
				});
			}
		};
	}

	var dateRangeDraftState = useState(null);
	var dateRangeDraft = dateRangeDraftState[0];
	var setDateRangeDraft = dateRangeDraftState[1];

	var plateDraftState = useState(undefined);
	var plateDraft = plateDraftState[0];
	var setPlateDraft = plateDraftState[1];

	var customerDraftState = useState(undefined);
	var customerDraft = customerDraftState[0];
	var setCustomerDraft = customerDraftState[1];

	var stationDraftState = useState(undefined);
	var stationDraft = stationDraftState[0];
	var setStationDraft = stationDraftState[1];

	var dateRangeAppliedState = useState(null);
	var dateRangeApplied = dateRangeAppliedState[0];
	var setDateRangeApplied = dateRangeAppliedState[1];

	var plateAppliedState = useState(undefined);
	var plateApplied = plateAppliedState[0];
	var setPlateApplied = plateAppliedState[1];

	var customerAppliedState = useState(undefined);
	var customerApplied = customerAppliedState[0];
	var setCustomerApplied = customerAppliedState[1];

	var stationAppliedState = useState(undefined);
	var stationApplied = stationAppliedState[0];
	var setStationApplied = stationAppliedState[1];

	var orderNoDraftState = useState('');
	var orderNoDraft = orderNoDraftState[0];
	var setOrderNoDraft = orderNoDraftState[1];

	var salespersonDraftState = useState(undefined);
	var salespersonDraft = salespersonDraftState[0];
	var setSalespersonDraft = salespersonDraftState[1];

	var settlementDraftState = useState(undefined);
	var settlementDraft = settlementDraftState[0];
	var setSettlementDraft = settlementDraftState[1];

	var paymentDraftState = useState(undefined);
	var paymentDraft = paymentDraftState[0];
	var setPaymentDraft = paymentDraftState[1];

	var companyDraftState = useState(undefined);
	var companyDraft = companyDraftState[0];
	var setCompanyDraft = companyDraftState[1];

	var orderNoAppliedState = useState('');
	var orderNoApplied = orderNoAppliedState[0];
	var setOrderNoApplied = orderNoAppliedState[1];

	var salespersonAppliedState = useState(undefined);
	var salespersonApplied = salespersonAppliedState[0];
	var setSalespersonApplied = salespersonAppliedState[1];

	var settlementAppliedState = useState(undefined);
	var settlementApplied = settlementAppliedState[0];
	var setSettlementApplied = settlementAppliedState[1];

	var paymentAppliedState = useState(undefined);
	var paymentApplied = paymentAppliedState[0];
	var setPaymentApplied = paymentAppliedState[1];

	var companyAppliedState = useState(undefined);
	var companyApplied = companyAppliedState[0];
	var setCompanyApplied = companyAppliedState[1];

	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];

	var onlyShowWarnRowsState = useState(false);
	var onlyShowWarnRows = onlyShowWarnRowsState[0];
	var setOnlyShowWarnRows = onlyShowWarnRowsState[1];

	var isSupervisor = false;

	var editingKeysState = useState([]);
	var editingKeys = editingKeysState[0];
	var setEditingKeys = editingKeysState[1];

	var rowInvalidState = useState({});
	var rowInvalid = rowInvalidState[0];
	var setRowInvalid = rowInvalidState[1];

	var selectedRowKeysState = useState([]);
	var selectedRowKeys = selectedRowKeysState[0];
	var setSelectedRowKeys = selectedRowKeysState[1];

	var changeLogsByKeyState = useState({});
	var changeLogsByKey = changeLogsByKeyState[0];
	var setChangeLogsByKey = changeLogsByKeyState[1];

	var changeLogModalState = useState({ open: false, rowKey: null, orderNo: '' });
	var changeLogModal = changeLogModalState[0];
	var setChangeLogModal = changeLogModalState[1];

	var reqDetailOpenState = useState(false);
	var reqDetailOpen = reqDetailOpenState[0];
	var setReqDetailOpen = reqDetailOpenState[1];

	var changeLogsSeededRef = useRef(false);

	var appendChangeLog = useCallback(function (rowKey, field, before, after, rowCtx, meta) {
		if (!rowKey) return;
		meta = meta || {};
		var fieldLabel = meta.fieldLabel || CHANGE_LOG_FIELD_LABELS[field] || field;
		var beforeText = meta.beforeText != null ? meta.beforeText : formatLogValue(field, before, rowCtx);
		var afterText = meta.afterText != null ? meta.afterText : formatLogValue(field, after, rowCtx);
		if (!meta.force && beforeText === afterText) return;
		setChangeLogsByKey(function (prev) {
			var list = (prev[rowKey] || []).slice();
			list.unshift({
				id: 'clog-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
				at: nowDayjs(),
				userId: CURRENT_USER.id,
				userName: CURRENT_USER.name,
				field: field,
				fieldLabel: fieldLabel,
				before: beforeText,
				after: afterText
			});
			var next = Object.assign({}, prev);
			next[rowKey] = list;
			return next;
		});
	}, []);

	var openChangeLogModal = useCallback(function (record) {
		if (!record) return;
		setChangeLogModal({
			open: true,
			rowKey: record.key,
			orderNo: record.orderNo || ''
		});
	}, []);

	var closeChangeLogModal = useCallback(function () {
		setChangeLogModal({ open: false, rowKey: null, orderNo: '' });
	}, []);

	var latestRefs = useRef({});
	latestRefs.current = {
		setAllRows: setAllRows,
		setEditingKeys: setEditingKeys,
		setSelectedRowKeys: setSelectedRowKeys,
		setRowInvalid: setRowInvalid,
		editingKeys: editingKeys,
		rowInvalid: rowInvalid,
		isSupervisor: isSupervisor,
		allRows: allRows,
		appendChangeLog: appendChangeLog
	};

	React.useEffect(function () {
		if (changeLogsSeededRef.current) return;
		changeLogsSeededRef.current = true;
		var demoAt = nowDayjs();
		var demoAt2 = demoAt && demoAt.subtract ? demoAt.subtract(2, 'hour') : demoAt;
		setChangeLogsByKey({
			'mock-h2-3': [
				{
					id: 'clog-demo-2',
					at: demoAt,
					userId: CURRENT_USER.id,
					userName: CURRENT_USER.name,
					field: 'hydrogenKg',
					fieldLabel: '加氢量(kg)',
					before: '39.50',
					after: '42.50'
				},
				{
					id: 'clog-demo-1',
					at: demoAt2,
					userId: CURRENT_USER.id,
					userName: CURRENT_USER.name,
					field: 'reconcileStatus',
					fieldLabel: '状态',
					before: '待保存',
					after: '未对账'
				}
			]
		});
	}, []);

	var canEditRow = useCallback(
		function (row) {
			if (!row) return false;
			if (isReconciledRow(row)) {
				return isSupervisor && editingKeys.indexOf(row.key) >= 0;
			}
			if (isPendingRow(row)) return editingKeys.indexOf(row.key) >= 0;
			if (isNewRow(row)) return row.createdBy === CURRENT_USER.id;
			return false;
		},
		[editingKeys, isSupervisor]
	);

	function filterRowsByAppliedFilters(rows) {
		var list = rows.slice();
		if (plateApplied) list = list.filter(function (r) { return r.plateNo === plateApplied; });
		if (customerApplied) list = list.filter(function (r) { return r.customerId === customerApplied; });
		if (stationApplied) list = list.filter(function (r) { return r.stationId === stationApplied; });
		if (salespersonApplied) {
			list = list.filter(function (r) {
				return r.salesperson === salespersonApplied;
			});
		}
		if (settlementApplied) {
			list = list.filter(function (r) {
				return r.settlementStatus === settlementApplied;
			});
		}
		if (paymentApplied) {
			list = list.filter(function (r) {
				return r.customerReceiptStatus === paymentApplied;
			});
		}
		if (companyApplied) {
			list = list.filter(function (r) {
				return r.companyId === companyApplied;
			});
		}
		if (orderNoApplied && String(orderNoApplied).trim()) {
			var kw = String(orderNoApplied).trim().toLowerCase();
			list = list.filter(function (r) {
				return r.orderNo && String(r.orderNo).toLowerCase().indexOf(kw) >= 0;
			});
		}
		if (dateRangeApplied && dateRangeApplied[0] && dateRangeApplied[1] && window.dayjs) {
			var start = window.dayjs(dateRangeApplied[0]).startOf('day');
			var end = window.dayjs(dateRangeApplied[1]).endOf('day');
			list = list.filter(function (r) {
				if (!r.hydrogenTime) return false;
				var d = window.dayjs(r.hydrogenTime);
				return d.isAfter(start.subtract(1, 'ms')) && d.isBefore(end.add(1, 'ms'));
			});
		}
		return list;
	}

	function appendCurrentUserDraftRows(list, sourceRows) {
		var keyInList = {};
		list.forEach(function (r) {
			keyInList[r.key] = true;
		});
		(sourceRows || []).forEach(function (r) {
			if (!keyInList[r.key] && isNewRow(r) && r.createdBy === CURRENT_USER.id) {
				list.push(r);
				keyInList[r.key] = true;
			}
		});
		return list;
	}

	var visibleRows = useMemo(function () {
		var list = filterRowsByAppliedFilters(allRows);
		list = appendCurrentUserDraftRows(list, allRows);
		if (onlyShowWarnRows) {
			list = list.filter(function (r) {
				if (isNewRow(r) && r.createdBy === CURRENT_USER.id) return true;
				return isRowDataWarn(r);
			});
		}
		list = sortRowsByDisplayTier(list);
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1, displayTier: rowDisplaySortTier(r) });
		});
	}, [
		allRows,
		plateApplied,
		customerApplied,
		stationApplied,
		dateRangeApplied,
		orderNoApplied,
		salespersonApplied,
		settlementApplied,
		paymentApplied,
		companyApplied,
		onlyShowWarnRows
	]);

	/** 导出：按已生效筛选条件，仅含未对账/已对账（不含待保存） */
	var exportRows = useMemo(function () {
		var list = filterRowsByAppliedFilters(allRows).filter(function (r) {
			return isPendingRow(r) || isReconciledRow(r);
		});
		list = sortRowsByDisplayTier(list);
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1, displayTier: rowDisplaySortTier(r) });
		});
	}, [
		allRows,
		plateApplied,
		customerApplied,
		stationApplied,
		dateRangeApplied,
		orderNoApplied,
		salespersonApplied,
		settlementApplied,
		paymentApplied,
		companyApplied
	]);

	var totals = useMemo(function () {
		return visibleRows.reduce(
			function (acc, r) {
				acc.hydrogenKg += numOrZero(r.hydrogenKg);
				acc.costTotal += numOrZero(r.costTotal);
				acc.customerAmount += numOrZero(r.customerAmount);
				return acc;
			},
			{ hydrogenKg: 0, costTotal: 0, customerAmount: 0 }
		);
	}, [visibleRows]);

	var handleQuery = useCallback(function () {
		setPlateApplied(plateDraft);
		setCustomerApplied(customerDraft);
		setStationApplied(stationDraft);
		setDateRangeApplied(dateRangeDraft);
		setOrderNoApplied(orderNoDraft);
		setSalespersonApplied(salespersonDraft);
		setSettlementApplied(settlementDraft);
		setPaymentApplied(paymentDraft);
		setCompanyApplied(companyDraft);
		message.success('查询成功');
	}, [
		plateDraft,
		customerDraft,
		stationDraft,
		dateRangeDraft,
		orderNoDraft,
		salespersonDraft,
		settlementDraft,
		paymentDraft,
		companyDraft
	]);

	var handleReset = useCallback(function () {
		setDateRangeDraft(null);
		setPlateDraft(undefined);
		setCustomerDraft(undefined);
		setStationDraft(undefined);
		setOrderNoDraft('');
		setSalespersonDraft(undefined);
		setSettlementDraft(undefined);
		setPaymentDraft(undefined);
		setCompanyDraft(undefined);
		setDateRangeApplied(null);
		setPlateApplied(undefined);
		setCustomerApplied(undefined);
		setStationApplied(undefined);
		setOrderNoApplied('');
		setSalespersonApplied(undefined);
		setSettlementApplied(undefined);
		setPaymentApplied(undefined);
		setCompanyApplied(undefined);
	}, []);

	function validateMaintainableRows(rows) {
		var allInvalid = {};
		(rows || []).forEach(function (r) {
			var inv = getRowInvalidMap(r);
			if (Object.keys(inv).length > 0) {
				allInvalid[r.key] = inv;
			}
		});
		if (Object.keys(allInvalid).length > 0) {
			setRowInvalid(allInvalid);
			return false;
		}
		setRowInvalid({});
		return true;
	}

	var handleSave = useCallback(function () {
		var toSave = allRows.filter(function (r) {
			return isNewRow(r);
		});
		if (!toSave.length) return;
		if (!validateMaintainableRows(toSave)) return;
		var savedAt = nowDayjs();
		toSave.forEach(function (r) {
			appendChangeLog(r.key, 'reconcileStatus', r.reconcileStatus, RECONCILE_PENDING, r, { force: true });
		});
		setAllRows(function (prev) {
			var next = prev.map(function (r) {
				if (isNewRow(r)) {
					return Object.assign({}, r, { reconcileStatus: RECONCILE_PENDING, savedAt: savedAt });
				}
				return r;
			});
			return recalcAllRows(next);
		});
		setEditingKeys([]);
	}, [allRows, appendChangeLog]);

	var handleCompleteReconcile = useCallback(function () {
		if (!selectedRowKeys.length) {
			message.warning('请先勾选需要对账的记录');
			return;
		}
		var keySet = {};
		selectedRowKeys.forEach(function (k) { keySet[k] = true; });
		var selected = allRows.filter(function (r) { return keySet[r.key]; });
		var notPending = selected.filter(function (r) { return !isPendingRow(r); });
		if (notPending.length) {
			message.warning('仅可对「未对账」状态的记录完成对账');
			return;
		}
		var reconciledAt = nowDayjs();
		selected.forEach(function (r) {
			appendChangeLog(r.key, 'reconcileStatus', RECONCILE_PENDING, RECONCILE_RECONCILED, r, { force: true });
		});
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (keySet[r.key] && isPendingRow(r)) {
					return Object.assign({}, r, { reconcileStatus: RECONCILE_RECONCILED, reconciledAt: reconciledAt });
				}
				return r;
			});
		});
		setSelectedRowKeys([]);
		setEditingKeys([]);
		message.success('已完成对账，共 ' + selected.length + ' 条');
	}, [selectedRowKeys, allRows, appendChangeLog]);

	var rowSelection = useMemo(
		function () {
			return {
				selectedRowKeys: selectedRowKeys,
				onChange: function (keys) {
					setSelectedRowKeys(keys);
				},
				getCheckboxProps: function (record) {
					return { disabled: !isPendingRow(record) };
				}
			};
		},
		[selectedRowKeys]
	);

	var addRow = useCallback(function () {
		var row = buildEmptyRow(CURRENT_USER);
		appendChangeLog(row.key, '_create', null, null, row, {
			fieldLabel: '新增记录',
			beforeText: '—',
			afterText: '新增空白行',
			force: true
		});
		setAllRows(function (prev) {
			return recalcAllRows(prev.concat([row]));
		});
		message.success('已新增一行，请填写氢费信息');
	}, [appendChangeLog]);

	var copyPopoverKeyState = useState(null);
	var copyPopoverKey = copyPopoverKeyState[0];
	var setCopyPopoverKey = copyPopoverKeyState[1];
	var copyRowCountState = useState(1);
	var copyRowCount = copyRowCountState[0];
	var setCopyRowCount = copyRowCountState[1];

	var applyCopyRows = useCallback(function (sourceKey, count) {
		var n = Math.floor(Number(count));
		if (!isFinite(n) || n < 1) {
			message.warning('请输入大于0的复制行数');
			return;
		}
		if (n > 100) {
			message.warning('单次最多复制100行');
			return;
		}
		var didCopy = false;
		setAllRows(function (prev) {
			var source = null;
			var i;
			for (i = 0; i < prev.length; i++) {
				if (prev[i].key === sourceKey) {
					source = prev[i];
					break;
				}
			}
			if (!source || !canCopyRow(source)) return prev;
			var copies = [];
			for (i = 0; i < n; i++) {
				copies.push(buildCopiedRow(source));
			}
			var ci;
			for (ci = 0; ci < copies.length; ci++) {
				appendChangeLog(copies[ci].key, '_copy', null, null, source, {
					fieldLabel: '复制新增',
					beforeText: '—',
					afterText: '复制自「' + (source.orderNo || '当前行') + '」',
					force: true
				});
			}
			didCopy = true;
			return recalcAllRows(prev.concat(copies));
		});
		setCopyPopoverKey(null);
		if (didCopy) message.success('已复制 ' + n + ' 行');
		else message.warning('无法复制该条记录');
	}, [appendChangeLog]);

	var importModalOpenState = useState(false);
	var importModalOpen = importModalOpenState[0];
	var setImportModalOpen = importModalOpenState[1];
	var importFileListState = useState([]);
	var importFileList = importFileListState[0];
	var setImportFileList = importFileListState[1];

	var openImportModal = useCallback(function () {
		setImportFileList([]);
		setImportModalOpen(true);
	}, []);

	var closeImportModal = useCallback(function () {
		setImportModalOpen(false);
		setImportFileList([]);
	}, []);

	var exportColumnDefs = useMemo(function () {
		return buildExportColumnDefs();
	}, []);

	var exportModalOpenState = useState(false);
	var exportModalOpen = exportModalOpenState[0];
	var setExportModalOpen = exportModalOpenState[1];
	var exportSelectedKeysState = useState([]);
	var exportSelectedKeys = exportSelectedKeysState[0];
	var setExportSelectedKeys = exportSelectedKeysState[1];

	var openExportModal = useCallback(function () {
		setExportSelectedKeys(exportColumnDefs.map(function (d) { return d.key; }));
		setExportModalOpen(true);
	}, [exportColumnDefs]);

	var closeExportModal = useCallback(function () {
		setExportModalOpen(false);
	}, []);

	var selectAllExportFields = useCallback(function () {
		setExportSelectedKeys(exportColumnDefs.map(function (d) { return d.key; }));
	}, [exportColumnDefs]);

	var clearAllExportFields = useCallback(function () {
		setExportSelectedKeys([]);
	}, []);

	var handleConfirmExport = useCallback(function () {
		if (!exportSelectedKeys || !exportSelectedKeys.length) {
			message.warning('请至少选择一个导出字段');
			return;
		}
		if (!exportRows.length) {
			message.warning('当前筛选条件下暂无未对账或已对账数据可导出');
			return;
		}
		var keySet = {};
		var i;
		for (i = 0; i < exportSelectedKeys.length; i++) {
			keySet[exportSelectedKeys[i]] = true;
		}
		var selectedDefs = exportColumnDefs.filter(function (d) {
			return keySet[d.key];
		});
		var headers = selectedDefs.map(function (d) { return d.label; });
		var rows = exportRows.map(function (r) {
			return selectedDefs.map(function (d) { return d.getValue(r); });
		});
		var stamp = '';
		try {
			stamp = window.dayjs ? window.dayjs().format('YYYYMMDD_HHmmss') : String(Date.now());
		} catch (eExp) {
			stamp = String(Date.now());
		}
		downloadCsv('车辆氢费明细_' + stamp + '.csv', headers, rows);
		setExportModalOpen(false);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [exportSelectedKeys, exportColumnDefs, exportRows]);

	var downloadImportTemplate = useCallback(function () {
		var sample = [
			[
				'2026-05-19 10:30:00',
				'广安弘正能源官盛综合能源站',
				'浙AD12345F',
				'12580.50',
				'42.50',
				'30.00',
				'嘉兴市鑫峤供应链科技有限公司',
				'32.00',
				'客户承担',
				''
			]
		];
		downloadCsv('车辆氢费明细导入模板.csv', IMPORT_TEMPLATE_HEADERS, sample);
		message.success('已下载导入模板');
	}, []);

	var handleImportFile = useCallback(function (file) {
		if (!file) return;
		var name = String(file.name || '').toLowerCase();
		if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
			message.warning('原型环境请使用 CSV 模板导入；联调后将支持 Excel 直接上传');
			setImportFileList([file]);
			return;
		}
		if (!name.endsWith('.csv')) {
			message.error('仅支持 .csv、.xls、.xlsx 格式');
			return;
		}
		setImportFileList([file]);
		var reader = new FileReader();
		reader.onload = function (ev) {
			var text = (ev && ev.target && ev.target.result) || '';
			var parsed = parseImportCsv(text);
			if (!parsed.length) {
				message.warning('未解析到有效数据，请检查文件内容');
				return;
			}
			var imported = [];
			var pi;
			for (pi = 0; pi < parsed.length; pi++) {
				imported.push(buildRowFromImport(parsed[pi]));
			}
			for (pi = 0; pi < imported.length; pi++) {
				appendChangeLog(imported[pi].key, '_import', null, null, imported[pi], {
					fieldLabel: '批量导入',
					beforeText: '—',
					afterText: '导入创建',
					force: true
				});
			}
			setAllRows(function (prev) {
				return recalcAllRows(prev.concat(imported));
			});
			setImportModalOpen(false);
			setImportFileList([]);
			message.success('导入成功，共 ' + imported.length + ' 条，请核对后点击保存');
		};
		reader.onerror = function () {
			message.error('文件读取失败');
		};
		reader.readAsText(file, 'UTF-8');
	}, [appendChangeLog]);

	var batchCostOpenState = useState(false);
	var batchCostOpen = batchCostOpenState[0];
	var setBatchCostOpen = batchCostOpenState[1];
	var batchCostValueState = useState(null);
	var batchCostValue = batchCostValueState[0];
	var setBatchCostValue = batchCostValueState[1];

	var batchCustomerOpenState = useState(false);
	var batchCustomerOpen = batchCustomerOpenState[0];
	var setBatchCustomerOpen = batchCustomerOpenState[1];
	var batchCustomerValueState = useState(null);
	var batchCustomerValue = batchCustomerValueState[0];
	var setBatchCustomerValue = batchCustomerValueState[1];

	var batchSettlementOpenState = useState(false);
	var batchSettlementOpen = batchSettlementOpenState[0];
	var setBatchSettlementOpen = batchSettlementOpenState[1];
	var batchSettlementValueState = useState(undefined);
	var batchSettlementValue = batchSettlementValueState[0];
	var setBatchSettlementValue = batchSettlementValueState[1];

	var applyBatchSettlement = useCallback(function (value, setPopoverOpen, setSelectValue) {
		if (!value) {
			message.warning('请选择承担方式');
			return;
		}
		var count = 0;
		setAllRows(function (prev) {
			var next = prev.map(function (r) {
				if (!isRowBatchEditable(r)) return r;
				if (!valuesEqualForLog('settlementStatus', r.settlementStatus, value)) {
					appendChangeLog(r.key, 'settlementStatus', r.settlementStatus, value, r);
				}
				count += 1;
				return Object.assign({}, r, { settlementStatus: value });
			});
			return recalcAllRows(next);
		});
		setPopoverOpen(false);
		setSelectValue(undefined);
		message.success(count > 0 ? '已批量更新 ' + count + ' 条记录的承担方式' : '暂无可批量修改的记录');
	}, [appendChangeLog]);

	var applyBatchUnitPrice = useCallback(function (field, rawValue, setPopoverOpen, setInputValue) {
		var normalized = normalizeBatchUnitPrice(rawValue);
		if (normalized == null) {
			message.warning('请输入大于0的单价，最多保留2位小数');
			return;
		}
		var count = 0;
		setAllRows(function (prev) {
			var next = prev.map(function (r) {
				if (!isRowBatchEditable(r)) return r;
				if (!valuesEqualForLog(field, r[field], normalized)) {
					appendChangeLog(r.key, field, r[field], normalized, r);
				}
				count += 1;
				var patchObj = {};
				patchObj[field] = normalized;
				return Object.assign({}, r, patchObj);
			});
			return recalcAllRows(next);
		});
		setPopoverOpen(false);
		setInputValue(null);
		var label = field === 'costUnitPrice' ? '成本单价' : '加氢单价';
		message.success(count > 0 ? '已批量更新 ' + count + ' 条记录的' + label : '暂无可批量修改的记录');
	}, [appendChangeLog]);

	var cellInputStyle = { width: '100%' };
	var cellNumStyle = { width: '100%' };
	var hydrogenDateTimePickerStyle = { width: '100%', minWidth: 178 };

	var columns = useMemo(function () {
		function patch(key, field, val) {
			var ref = latestRefs.current;
			var patchObj = {};
			patchObj[field] = val;
			ref.setAllRows(function (prev) {
				var next = prev.map(function (r) {
					if (r.key !== key) return r;
					if (ref.appendChangeLog && !valuesEqualForLog(field, r[field], val)) {
						ref.appendChangeLog(key, field, r[field], val, r);
					}
					return Object.assign({}, r, patchObj);
				});
				return recalcAllRows(next);
			});
			ref.setRowInvalid(function (prev) {
				if (!prev || !prev[key] || !prev[key][field]) return prev;
				var next = Object.assign({}, prev);
				var rowInv = Object.assign({}, next[key]);
				delete rowInv[field];
				if (Object.keys(rowInv).length === 0) delete next[key];
				else next[key] = rowInv;
				return next;
			});
		}

		function autoLinkedCell(v, align) {
			var text = v == null || v === '' ? '—' : v;
			return React.createElement(
				'span',
				{ className: 'h2-cell-auto', style: { display: 'block', textAlign: align || 'center' } },
				text
			);
		}

		function autoLinkedPaidStatus(v) {
			var label = labelOf(BINARY_PAID_STATUS_OPTIONS, v);
			if (!label || label === '-') return autoLinkedCell('—', 'center');
			var color = v === 'paid' ? 'success' : 'default';
			return React.createElement(
				'span',
				{ className: 'h2-cell-auto', style: { display: 'block', textAlign: 'center' } },
				React.createElement(Tag, { color: color, style: { margin: 0 } }, label)
			);
		}

		function readOnlyCell(v, align, warn, tip) {
			var cls = warn ? 'h2-cell-readonly h2-cell-warn' : 'h2-cell-readonly';
			var inner = React.createElement(
				'div',
				{ className: cls, style: { textAlign: align || 'center', whiteSpace: 'nowrap' } },
				v === 0 || v === '0' ? v : v || '-'
			);
			if (warn && tip) return React.createElement(Tooltip, { title: tip }, inner);
			return inner;
		}

		function wrapWarnInput(node, warn, tip) {
			if (!warn || !tip) return node;
			return React.createElement(
				Tooltip,
				{ title: tip },
				React.createElement('div', { className: 'h2-warn-input-wrap', style: WARN_CELL_WRAP_STYLE }, node)
			);
		}

		function fieldInvalid(record, field) {
			var ref = latestRefs.current;
			var rowInv = (ref.rowInvalid && ref.rowInvalid[record.key]) || {};
			return rowInv[field];
		}

		function reqTitle(text) {
			return React.createElement(
				'span',
				null,
				React.createElement('span', { style: { color: '#ff4d4f', marginRight: 2 } }, '*'),
				text
			);
		}

		function renderBatchEditIcon() {
			return React.createElement(
				'svg',
				{
					viewBox: '64 64 896 896',
					width: 14,
					height: 14,
					fill: 'currentColor',
					'aria-hidden': true
				},
				React.createElement('path', {
					d: 'M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z'
				})
			);
		}

		function makeBatchPriceTitle(columnLabel, batchLabel, field, popOpen, setPopOpen, inputVal, setInputVal) {
			var popContent = React.createElement(
				'div',
				{
					style: { minWidth: 200 },
					onClick: function (e) {
						e.stopPropagation();
					}
				},
				React.createElement(
					Space,
					{ align: 'center', size: 4, wrap: true },
					React.createElement('span', { style: { color: 'rgba(0,0,0,0.88)' } }, batchLabel + '：'),
					React.createElement(InputNumber, {
						style: { width: 120 },
						min: 0.01,
						precision: 2,
						step: 0.01,
						placeholder: '0.00',
						value: inputVal,
						onChange: function (val) {
							setInputVal(val == null ? null : val);
						},
						onBlur: function () {
							setInputVal(normalizeBatchUnitPrice(inputVal));
						}
					}),
					React.createElement('span', null, '元')
				),
				React.createElement(
					'div',
					{ style: { marginTop: 10, textAlign: 'right' } },
					React.createElement(Button, {
						type: 'primary',
						size: 'small',
						onClick: function () {
							applyBatchUnitPrice(field, inputVal, setPopOpen, setInputVal);
						}
					}, '确定')
				)
			);

			return React.createElement(
				'span',
				{
					style: {
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 4,
						whiteSpace: 'nowrap'
					}
				},
				reqTitle(columnLabel),
				React.createElement(
					Popover,
					{
						trigger: 'click',
						open: popOpen,
						placement: 'bottom',
						onOpenChange: function (open) {
							setPopOpen(open);
							if (!open) setInputVal(null);
						},
						content: popContent
					},
					React.createElement(
						'span',
						{
							className: 'h2-batch-edit-icon',
							style: {
								color: '#1677ff',
								cursor: 'pointer',
								display: 'inline-flex',
								alignItems: 'center',
								lineHeight: 1
							},
							onClick: function (e) {
								e.stopPropagation();
							}
						},
						renderBatchEditIcon()
					)
				)
			);
		}

		function makeBatchSettlementTitle(columnLabel, batchLabel, popOpen, setPopOpen, selectVal, setSelectVal) {
			var popContent = React.createElement(
				'div',
				{
					style: { minWidth: 220 },
					onClick: function (e) {
						e.stopPropagation();
					}
				},
				React.createElement(
					'div',
					{ style: { marginBottom: 8, fontSize: 13, color: 'rgba(0,0,0,0.88)' } },
					batchLabel
				),
				React.createElement(Select, {
					style: { width: '100%' },
					placeholder: '请选择',
					value: selectVal,
					options: SETTLEMENT_STATUS_OPTIONS,
					onChange: function (val) {
						setSelectVal(val);
					}
				}),
				React.createElement(
					'div',
					{ style: { marginTop: 10, textAlign: 'right' } },
					React.createElement(Button, {
						type: 'primary',
						size: 'small',
						onClick: function () {
							applyBatchSettlement(selectVal, setPopOpen, setSelectVal);
						}
					}, '确定')
				)
			);

			return React.createElement(
				'span',
				{
					style: {
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 4,
						whiteSpace: 'nowrap'
					}
				},
				reqTitle(columnLabel),
				React.createElement(
					Popover,
					{
						trigger: 'click',
						open: popOpen,
						placement: 'bottom',
						onOpenChange: function (open) {
							setPopOpen(open);
							if (!open) setSelectVal(undefined);
						},
						content: popContent
					},
					React.createElement(
						'span',
						{
							className: 'h2-batch-edit-icon',
							style: {
								color: '#1677ff',
								cursor: 'pointer',
								display: 'inline-flex',
								alignItems: 'center',
								lineHeight: 1
							},
							onClick: function (e) {
								e.stopPropagation();
							}
						},
						renderBatchEditIcon()
					)
				)
			);
		}

		function labelOf(opts, val) {
			var i;
			for (i = 0; i < opts.length; i++) {
				if (opts[i].value === val) return opts[i].label;
			}
			return val || '-';
		}

		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 52, align: 'center', fixed: 'left' },
			{
				title: '加氢日期',
				key: 'hydrogenDate',
				width: 108,
				align: 'center',
				render: function (_, record) {
					return readOnlyCell(formatDate(record.hydrogenTime) || '-');
				}
			},
			{
				title: reqTitle('加氢时间'),
				dataIndex: 'hydrogenTime',
				key: 'hydrogenTime',
				width: 192,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(formatDateTime(v) || '-');
					return React.createElement(DatePicker, {
						className: 'h2-datetime-picker',
						style: hydrogenDateTimePickerStyle,
						showTime: { format: 'HH:mm:ss' },
						format: HYDROGEN_DATETIME_FORMAT,
						placeholder: 'YYYY-MM-DD HH:mm:ss',
						allowClear: true,
						value: v,
						status: fieldInvalid(record, 'hydrogenTime') ? 'error' : undefined,
						onChange: function (d) { patch(record.key, 'hydrogenTime', d); }
					});
				}
			},
			{
				title: reqTitle('加氢站名称'),
				dataIndex: 'stationId',
				key: 'stationId',
				width: 150,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(record.stationName);
					return React.createElement(Select, {
						style: cellInputStyle,
						showSearch: true,
						allowClear: true,
						placeholder: '请选择',
						value: v,
						status: fieldInvalid(record, 'stationId') ? 'error' : undefined,
						options: HYDROGEN_STATION_LIST.map(function (s) { return { value: s.value, label: s.label }; }),
						filterOption: filterOption,
						onChange: function (val) { patch(record.key, 'stationId', val); }
					});
				}
			},
			{
				title: '客户名称',
				dataIndex: 'customerId',
				key: 'customerId',
				width: 180,
				align: 'center',
				ellipsis: true,
				render: function (v, record) {
					if (!canEditRow(record)) {
						return readOnlyCell(record.customerName || '-');
					}
					return React.createElement(Select, {
						style: cellInputStyle,
						showSearch: true,
						allowClear: true,
						placeholder: '请选择',
						value: v,
						status: fieldInvalid(record, 'customerId') ? 'error' : undefined,
						options: buildCustomerSelectOptions(),
						filterOption: filterOption,
						onChange: function (val) { patch(record.key, 'customerId', val); }
					});
				}
			},
			{
				title: reqTitle('车牌号'),
				dataIndex: 'plateNo',
				key: 'plateNo',
				width: 118,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(v);
					return React.createElement(Select, {
						style: cellInputStyle,
						showSearch: true,
						allowClear: true,
						placeholder: '请选择',
						value: v,
						status: fieldInvalid(record, 'plateNo') ? 'error' : undefined,
						options: VEHICLE_INFO_TABLE.map(function (p) { return { value: p, label: p }; }),
						filterOption: filterOption,
						notFoundContent: '车辆不存在',
						onChange: function (val) { patch(record.key, 'plateNo', val); }
					});
				}
			},
			{
				title: reqTitle('加氢量(kg)'),
				dataIndex: 'hydrogenKg',
				key: 'hydrogenKg',
				width: 100,
				align: 'right',
				render: function (v, record) {
					var kgWarn = isHydrogenKgWarn(record);
					if (!canEditRow(record)) return readOnlyCell(fmtQty(v), 'right', kgWarn, WARN_HYDROGEN_KG_TIP);
					return wrapWarnInput(
						React.createElement(InputNumber, {
							style: cellNumStyle,
							min: 0,
							precision: 2,
							placeholder: 'kg',
							value: isEmptyNum(v) ? null : v,
							status: fieldInvalid(record, 'hydrogenKg') ? 'error' : undefined,
							onChange: function (val) { patch(record.key, 'hydrogenKg', val == null ? null : val); }
						}),
						kgWarn,
						WARN_HYDROGEN_KG_TIP
					);
				}
			},
			{
				title: makeBatchPriceTitle(
					'成本单价(元/kg)',
					'批量修改成本单价',
					'costUnitPrice',
					batchCostOpen,
					setBatchCostOpen,
					batchCostValue,
					setBatchCostValue
				),
				dataIndex: 'costUnitPrice',
				key: 'costUnitPrice',
				width: 132,
				align: 'right',
				render: function (v, record) {
					var costWarn = isCostPriceWarn(record);
					if (!canEditRow(record)) return readOnlyCell(fmtMoney(v), 'right', costWarn, WARN_COST_PRICE_TIP);
					return wrapWarnInput(
						React.createElement(InputNumber, {
							style: cellNumStyle,
							min: 0,
							precision: 2,
							placeholder: '单价',
							value: isEmptyNum(v) ? null : v,
							status: fieldInvalid(record, 'costUnitPrice') ? 'error' : undefined,
							onChange: function (val) { patch(record.key, 'costUnitPrice', val == null ? null : val); }
						}),
						costWarn,
						WARN_COST_PRICE_TIP
					);
				}
			},
			{
				title: '成本总价(元)',
				dataIndex: 'costTotal',
				key: 'costTotal',
				width: 108,
				align: 'right',
				render: function (v) { return readOnlyCell(fmtMoney(v), 'right'); }
			},
			{
				title: makeBatchPriceTitle(
					'加氢单价(元/kg)',
					'批量修改加氢单价',
					'customerUnitPrice',
					batchCustomerOpen,
					setBatchCustomerOpen,
					batchCustomerValue,
					setBatchCustomerValue
				),
				dataIndex: 'customerUnitPrice',
				key: 'customerUnitPrice',
				width: 132,
				align: 'right',
				render: function (v, record) {
					var custWarn = isCustomerPriceWarn(record);
					if (!canEditRow(record)) return readOnlyCell(fmtMoney(v), 'right', custWarn, WARN_CUSTOMER_PRICE_TIP);
					return wrapWarnInput(
						React.createElement(InputNumber, {
							style: cellNumStyle,
							min: 0,
							precision: 2,
							placeholder: '单价',
							value: isEmptyNum(v) ? null : v,
							status: fieldInvalid(record, 'customerUnitPrice') ? 'error' : undefined,
							onChange: function (val) { patch(record.key, 'customerUnitPrice', val == null ? null : val); }
						}),
						custWarn,
						WARN_CUSTOMER_PRICE_TIP
					);
				}
			},
			{
				title: '加氢总价(元)',
				dataIndex: 'customerAmount',
				key: 'customerAmount',
				width: 108,
				align: 'right',
				render: function (v) { return readOnlyCell(fmtMoney(v), 'right'); }
			},
			{
				title: '行驶里程(km)',
				dataIndex: 'mileageKm',
				key: 'mileageKm',
				width: 108,
				align: 'right',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(isEmptyNum(v) ? '-' : fmtQty(v), 'right');
					return React.createElement(InputNumber, {
						style: cellNumStyle,
						min: 0.01,
						precision: 2,
						step: 0.01,
						placeholder: '0.00',
						value: isEmptyNum(v) ? null : v,
						onChange: function (val) { patch(record.key, 'mileageKm', val == null ? null : val); },
						onBlur: function () {
							patch(record.key, 'mileageKm', normalizeMileageKm(v));
						}
					});
				}
			},
			{
				title: '备注',
				dataIndex: 'remark',
				key: 'remark',
				width: 120,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(v);
					return React.createElement(Input, {
						className: 'h2-inline-input',
						value: v,
						placeholder: '备注',
						onChange: function (e) { patch(record.key, 'remark', e.target.value); }
					});
				}
			},
			{
				title: '业务员',
				dataIndex: 'salesperson',
				key: 'salesperson',
				width: 88,
				align: 'center',
				render: function (v) { return readOnlyCell(v); }
			},
			{
				title: makeBatchSettlementTitle(
					'承担方式',
					'批量修改承担方式',
					batchSettlementOpen,
					setBatchSettlementOpen,
					batchSettlementValue,
					setBatchSettlementValue
				),
				dataIndex: 'settlementStatus',
				key: 'settlementStatus',
				width: 132,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(labelOf(SETTLEMENT_STATUS_OPTIONS, v));
					return React.createElement(Select, {
						style: cellInputStyle,
						placeholder: '请选择',
						value: v,
						status: fieldInvalid(record, 'settlementStatus') ? 'error' : undefined,
						options: SETTLEMENT_STATUS_OPTIONS,
						onChange: function (val) { patch(record.key, 'settlementStatus', val); }
					});
				}
			},
			{
				title: '对账日期',
				dataIndex: 'reconcileDate',
				key: 'reconcileDate',
				width: 148,
				align: 'center',
				render: function (v) {
					if (!v) return readOnlyCell('-');
					var text = String(v);
					if (text.indexOf(':') >= 0) return readOnlyCell(text.length > 16 ? text.slice(0, 16) : text);
					return readOnlyCell(formatDateTime(v) || formatDate(v) || '-');
				}
			},
			{
				title: '收票日期',
				dataIndex: 'receiptDate',
				key: 'receiptDate',
				width: 112,
				align: 'center',
				render: function (v) {
					return autoLinkedCell(formatDate(v) || '—', 'center');
				}
			},
			{
				title: '加氢站付款状态',
				dataIndex: 'stationPaymentStatus',
				key: 'stationPaymentStatus',
				width: 120,
				align: 'center',
				render: function (v) {
					return autoLinkedPaidStatus(v);
				}
			},
			{
				title: '开票日期',
				dataIndex: 'invoiceDate',
				key: 'invoiceDate',
				width: 112,
				align: 'center',
				render: function (v) {
					return autoLinkedCell(formatDate(v) || '—', 'center');
				}
			},
			{
				title: '客户收款状态',
				dataIndex: 'customerReceiptStatus',
				key: 'customerReceiptStatus',
				width: 112,
				align: 'center',
				render: function (v) {
					return autoLinkedPaidStatus(v);
				}
			},
			{
				title: '开票公司',
				dataIndex: 'companyId',
				key: 'companyId',
				width: 180,
				align: 'center',
				ellipsis: true,
				render: function (v, record) {
					return autoLinkedCell(record.companyName || labelOf(COMPANY_LIST, v) || '—', 'center');
				}
			},
			{
				title: '状态',
				key: 'recordStatus',
				width: 72,
				align: 'center',
				render: function (_, record) {
					var label = rowStatusLabel(record);
					if (!label) return React.createElement('span', { style: { color: '#cbd5e1' } }, '—');
					var color = label === '已对账' ? 'blue' : 'orange';
					return React.createElement(Tag, { color: color, style: { margin: 0 } }, label);
				}
			},
			{
				title: '订单编号',
				dataIndex: 'orderNo',
				key: 'orderNo',
				width: 168,
				align: 'center',
				render: function (v) {
					return React.createElement('span', { style: { fontFamily: 'monospace', fontSize: 12 } }, v || '-');
				}
			},
			{
				title: '操作',
				key: 'action',
				width: 56,
				align: 'center',
				fixed: 'right',
				render: function (_, record) {
					var ref = latestRefs.current;

					function renderIconAction(title, iconNode, onClick, extraClass, disabled) {
						var cls = 'h2-action-icon-btn' + (extraClass ? ' ' + extraClass : '') + (disabled ? ' is-disabled' : '');
						var node = React.createElement(
							'span',
							{
								className: cls,
								role: 'button',
								tabIndex: disabled ? -1 : 0,
								'aria-label': title,
								onClick:
									disabled || !onClick
										? undefined
										: function (e) {
												e.stopPropagation();
												onClick(e);
											}
							},
							iconNode
						);
						return React.createElement(Tooltip, { title: title }, node);
					}

					function renderMoreIcon() {
						return React.createElement(
							'svg',
							{ viewBox: '0 0 16 16', width: 16, height: 16, fill: 'currentColor', 'aria-hidden': true },
							React.createElement('circle', { cx: '8', cy: '3', r: '1.5' }),
							React.createElement('circle', { cx: '8', cy: '8', r: '1.5' }),
							React.createElement('circle', { cx: '8', cy: '13', r: '1.5' })
						);
					}

					function toggleEditRow() {
						ref.setEditingKeys(function (prev) {
							if (prev.indexOf(record.key) >= 0) {
								return prev.filter(function (k) { return k !== record.key; });
							}
							return prev.concat([record.key]);
						});
					}

					function confirmDeleteRow() {
						ref.setAllRows(function (prev) {
							return prev.filter(function (r) { return r.key !== record.key; });
						});
						ref.setSelectedRowKeys(function (prev) {
							return prev.filter(function (k) { return k !== record.key; });
						});
						ref.setEditingKeys(function (prev) {
							return prev.filter(function (k) { return k !== record.key; });
						});
						message.success('已删除');
					}

					function buildMoreMenuItems() {
						var items = [];
						var isEditing = ref.editingKeys.indexOf(record.key) >= 0;
						var allowDelete = canDeleteRow(record, ref.isSupervisor);
						var allowCopy = canCopyRow(record);
						var editLabel = isEditing ? '完成编辑' : '编辑';

						if (isReconciledRow(record)) {
							if (!ref.isSupervisor) {
								items.push({
									key: 'edit',
									label: '编辑',
									disabled: true,
									title: '仅主管可编辑已对账数据'
								});
							} else {
								items.push({
									key: 'edit',
									label: editLabel,
									onClick: function () { toggleEditRow(); }
								});
							}
						} else if (isPendingRow(record) && canShowPendingActions(record)) {
							items.push({
								key: 'edit',
								label: editLabel,
								onClick: function () { toggleEditRow(); }
							});
						} else if (isNewRow(record) && record.createdBy === CURRENT_USER.id) {
							items.push({
								key: 'edit',
								label: editLabel,
								onClick: function () { toggleEditRow(); }
							});
						}

						if (allowCopy) {
							items.push({
								key: 'copy',
								label: '复制',
								onClick: function () {
									setCopyPopoverKey(record.key);
									setCopyRowCount(1);
								}
							});
						}

						if (isReconciledRow(record)) {
							if (!ref.isSupervisor) {
								items.push({
									key: 'delete',
									label: '删除',
									disabled: true,
									danger: true,
									title: '仅主管可删除已对账数据'
								});
							} else {
								items.push({
									key: 'delete',
									label: '删除',
									danger: true,
									onClick: function () {
										Modal.confirm({
											title: '确认删除该条氢费记录？',
											okText: '删除',
											okType: 'danger',
											cancelText: '取消',
											onOk: confirmDeleteRow
										});
									}
								});
							}
						} else if (
							(isPendingRow(record) && canShowPendingActions(record)) ||
							(isNewRow(record) && record.createdBy === CURRENT_USER.id)
						) {
							items.push({
								key: 'delete',
								label: '删除',
								disabled: !allowDelete,
								danger: true,
								onClick: function () {
									if (!allowDelete) return;
									Modal.confirm({
										title: '确认删除该条氢费记录？',
										okText: '删除',
										okType: 'danger',
										cancelText: '取消',
										onOk: confirmDeleteRow
									});
								}
							});
						}

						if (items.length) {
							items.push({ type: 'divider', key: 'divider-actions' });
						}
						items.push({
							key: 'changelog',
							label: '变更日志',
							onClick: function () {
								openChangeLogModal(record);
							}
						});
						return items;
					}

					function renderCopyPopoverContent() {
						var popOpen = copyPopoverKey === record.key;
						return React.createElement(
							'div',
							{ style: { width: 220 } },
							React.createElement(
								'div',
								{ style: { marginBottom: 8, fontSize: 13, color: 'rgba(15,23,42,0.65)' } },
								'复制当前行已填写的全部数据'
							),
							React.createElement(
								'div',
								{ style: { marginBottom: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)' } },
								'复制行数'
							),
							React.createElement(InputNumber, {
								style: { width: '100%', marginBottom: 10 },
								min: 1,
								max: 100,
								precision: 0,
								value: popOpen ? copyRowCount : 1,
								onChange: function (val) {
									setCopyRowCount(val == null ? 1 : val);
								}
							}),
							React.createElement(
								Button,
								{
									type: 'primary',
									block: true,
									size: 'small',
									onClick: function () {
										applyCopyRows(record.key, copyRowCount);
										setCopyPopoverKey(null);
									}
								},
								'确认复制'
							)
						);
					}

					function renderMoreAction() {
						var popOpen = copyPopoverKey === record.key;
						var dropdownNode = React.createElement(
							Dropdown,
							{
								trigger: ['click'],
								placement: 'bottomRight',
								menu: { items: buildMoreMenuItems() }
							},
							renderIconAction('更多', renderMoreIcon(), null, 'h2-row-more-btn')
						);
						return React.createElement(
							Popover,
							{
								trigger: [],
								placement: 'leftTop',
								open: popOpen,
								content: renderCopyPopoverContent(),
								onOpenChange: function (open) {
									if (!open && copyPopoverKey === record.key) {
										setCopyPopoverKey(null);
									}
								}
							},
							dropdownNode
						);
					}

					return renderMoreAction();
				}
			}
		];
	}, [
		canEditRow,
		editingKeys,
		isSupervisor,
		rowInvalid,
		batchCostOpen,
		batchCostValue,
		batchCustomerOpen,
		batchCustomerValue,
		batchSettlementOpen,
		batchSettlementValue,
		applyBatchUnitPrice,
		applyBatchSettlement,
		copyPopoverKey,
		copyRowCount,
		applyCopyRows,
		openChangeLogModal
	]);

	var changeLogRows = useMemo(
		function () {
			if (!changeLogModal.rowKey) return [];
			return changeLogsByKey[changeLogModal.rowKey] || [];
		},
		[changeLogModal.rowKey, changeLogsByKey]
	);

	var changeLogColumns = useMemo(
		function () {
			return [
				{
					title: '修改时间',
					dataIndex: 'at',
					key: 'at',
					width: 168,
					render: function (v) {
						return formatDateTime(v) || '—';
					}
				},
				{
					title: '修改人',
					dataIndex: 'userName',
					key: 'userName',
					width: 88,
					align: 'center'
				},
				{
					title: '修改字段',
					dataIndex: 'fieldLabel',
					key: 'fieldLabel',
					width: 120,
					align: 'center'
				},
				{
					title: '修改前',
					dataIndex: 'before',
					key: 'before',
					ellipsis: true,
					render: function (v) {
						return React.createElement(
							'span',
							{ style: { color: '#cf1322' } },
							v == null || v === '' ? '—' : v
						);
					}
				},
				{
					title: '修改后',
					dataIndex: 'after',
					key: 'after',
					ellipsis: true,
					render: function (v) {
						return React.createElement(
							'span',
							{ style: { color: '#389e0d' } },
							v == null || v === '' ? '—' : v
						);
					}
				}
			];
		},
		[]
	);

	var renderTotalsBar = useCallback(function () {
		var items = [
			{ key: 'hydrogenKg', label: '加氢量(kg)', value: fmtQty(totals.hydrogenKg) },
			{ key: 'costTotal', label: '成本总价(元)', value: fmtMoney(totals.costTotal) },
			{ key: 'customerAmount', label: '加氢总价(元)', value: fmtMoney(totals.customerAmount) }
		];
		return React.createElement(
			'div',
			{ className: 'h2-ledger-totals-bar' },
			React.createElement('div', { className: 'h2-ledger-totals-bar__title' }, '合计'),
			React.createElement(
				'div',
				{ className: 'h2-ledger-totals-bar__items' },
				items.map(function (item) {
					return React.createElement(
						'div',
						{ key: item.key, className: 'h2-ledger-totals-bar__item' },
						React.createElement('div', { className: 'h2-ledger-totals-bar__label' }, item.label),
						React.createElement('div', { className: 'h2-ledger-totals-bar__value' }, item.value)
					);
				})
			)
		);
	}, [totals]);

	return React.createElement(
		App,
		null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement(
			'div',
			{ style: layoutStyle },
			React.createElement(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 12,
						gap: 16
					}
				},
				React.createElement(Breadcrumb, {
					items: [{ title: '台账数据' }, { title: '车辆氢费明细' }]
				}),
				React.createElement(
					Button,
					{
						type: 'link',
						style: { padding: 0, flexShrink: 0, fontSize: 14 },
						onClick: function () {
							setReqDetailOpen(true);
						}
					},
					'查看需求明细'
				)
			),
			(function () {
				var filterColProps = { xs: 24, sm: 12, lg: 8 };
				var filterActions = React.createElement(
					Space,
					{ wrap: true, style: { justifyContent: 'flex-end', width: '100%' } },
					React.createElement(
						Button,
						{
							type: 'link',
							style: { padding: '4px 0' },
							onClick: function () {
								setFilterExpanded(!filterExpanded);
							}
						},
						filterExpanded ? '收起' : '展开'
					),
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
				);
				var plateSelect = React.createElement(Select, {
					allowClear: true,
					showSearch: true,
					placeholder: '全部',
					style: filterControlStyle,
					value: plateDraft,
					onChange: function (v) { setPlateDraft(v); },
					options: VEHICLE_INFO_TABLE.map(function (p) { return { value: p, label: p }; }),
					filterOption: filterOption
				});
				return React.createElement(
					Card,
					{ style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
					React.createElement(
						Row,
						{ gutter: [16, 0], align: 'bottom' },
						React.createElement(
							Col,
							filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '加氢时间'),
								React.createElement(DatePicker.RangePicker, {
									style: filterControlStyle,
									format: 'YYYY-MM-DD',
									value: dateRangeDraft,
									onChange: function (v) { setDateRangeDraft(v); }
								})
							)
						),
						React.createElement(
							Col,
							filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '订单编号'),
								React.createElement(Input, {
									allowClear: true,
									placeholder: '支持模糊搜索',
									style: filterControlStyle,
									value: orderNoDraft,
									onChange: function (e) {
										setOrderNoDraft(e && e.target ? e.target.value : '');
									}
								})
							)
						),
						React.createElement(
							Col,
							filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, filterExpanded ? '车牌号' : '\u00a0'),
								filterExpanded
									? plateSelect
									: React.createElement('div', { style: { textAlign: 'right' } }, filterActions)
							)
						)
					),
					filterExpanded
						? [
								React.createElement(
									Row,
									{ key: 'filter-row-2', gutter: [16, 0], align: 'top' },
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '客户名称'),
											React.createElement(Select, {
												allowClear: true,
												showSearch: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: customerDraft,
												onChange: function (v) { setCustomerDraft(v); },
												options: buildCustomerSelectOptions(),
												filterOption: filterOption
											})
										)
									),
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '加氢站名称'),
											React.createElement(Select, {
												allowClear: true,
												showSearch: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: stationDraft,
												onChange: function (v) { setStationDraft(v); },
												options: HYDROGEN_STATION_LIST.map(function (s) { return { value: s.value, label: s.label }; }),
												filterOption: filterOption
											})
										)
									),
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '业务员'),
											React.createElement(Select, {
												allowClear: true,
												showSearch: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: salespersonDraft,
												onChange: function (v) { setSalespersonDraft(v); },
												options: SALESPERSON_FILTER_OPTIONS,
												filterOption: filterOption
											})
										)
									)
								),
								React.createElement(
									Row,
									{ key: 'filter-row-3', gutter: [16, 0], align: 'top' },
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '承担方式'),
											React.createElement(Select, {
												allowClear: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: settlementDraft,
												onChange: function (v) { setSettlementDraft(v); },
												options: SETTLEMENT_STATUS_OPTIONS
											})
										)
									),
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '客户收款状态'),
											React.createElement(Select, {
												allowClear: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: paymentDraft,
												onChange: function (v) { setPaymentDraft(v); },
												options: BINARY_PAID_STATUS_OPTIONS
											})
										)
									),
									React.createElement(
										Col,
										filterColProps,
										React.createElement('div', { style: filterItemStyle },
											React.createElement('div', { style: filterLabelStyle }, '开票公司'),
											React.createElement(Select, {
												allowClear: true,
												showSearch: true,
												placeholder: '全部',
												style: filterControlStyle,
												value: companyDraft,
												onChange: function (v) { setCompanyDraft(v); },
												options: COMPANY_LIST,
												filterOption: filterOption
											})
										)
									)
								),
								React.createElement(
									Row,
									{ key: 'filter-actions', justify: 'end', style: { marginTop: -4 } },
									React.createElement(
										Col,
										{ span: 24 },
										React.createElement('div', { style: { textAlign: 'right', marginBottom: 4 } }, filterActions)
									)
								)
							]
						: null
				);
			})(),
			React.createElement(
				Card,
				{ style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 8,
							minHeight: 36,
							gap: 12
						}
					},
					React.createElement(
						Checkbox,
						{
							checked: onlyShowWarnRows,
							onChange: function (e) {
								setOnlyShowWarnRows(e.target.checked);
							}
						},
						'仅显示异常数据'
					),
					React.createElement(
						'div',
						{
							style: {
								flex: 1,
								textAlign: 'center',
								fontSize: 18,
								fontWeight: 700,
								color: 'rgba(15,23,42,0.92)'
							}
						},
						'车辆氢费明细'
					),
					React.createElement(
						Space,
						{ size: 8 },
						React.createElement(Button, { onClick: openImportModal }, '批量导入'),
						React.createElement(Button, { onClick: openExportModal }, '批量导出'),
						React.createElement(Button, { onClick: handleSave }, '保存'),
						React.createElement(
							Popconfirm,
							{
								title: '完成对账后数据将标记为已对账，只能联系主管进行修改，是否确认。',
								okText: '确认',
								cancelText: '取消',
								onConfirm: handleCompleteReconcile
							},
							React.createElement(Button, { type: 'primary' }, '完成对账')
						)
					)
				),
				renderTotalsBar(),
				React.createElement(
					'div',
					{ className: 'h2-ledger-table-wrap' },
					React.createElement(Table, {
						className: 'h2-ledger-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						rowSelection: rowSelection,
						columns: columns,
						dataSource: visibleRows,
						pagination: false,
						rowClassName: function (record, index) {
							var tier = record.displayTier != null ? record.displayTier : rowDisplaySortTier(record);
							var prev = visibleRows[index - 1];
							var prevTier = prev ? (prev.displayTier != null ? prev.displayTier : rowDisplaySortTier(prev)) : tier;
							var cls = 'h2-row-data h2-row-tier-' + tier;
							if (index > 0 && prevTier !== tier) cls += ' h2-row-tier-boundary';
							return cls;
						},
						scroll: { x: 'max-content', y: filterExpanded ? 'calc(100vh - 524px)' : 'calc(100vh - 464px)' },
						sticky: true
					})
				),
				React.createElement(
					Button,
					{ type: 'dashed', block: true, style: { marginTop: 12 }, onClick: addRow },
					'新增一行'
				)
			),
			React.createElement(
				Modal,
				{
					title: '批量导入',
					open: importModalOpen,
					onCancel: closeImportModal,
					footer: null,
					width: 520,
					destroyOnClose: true
				},
				React.createElement(
					'div',
					{ style: { marginBottom: 12, fontSize: 13, color: 'rgba(15,23,42,0.55)' } },
					'请下载模板填写后上传；支持 .csv、.xls、.xlsx（原型阶段 Excel 请另存为 CSV 后导入）。开票日期、对账日期、付款状态、开票公司由系统按客户等信息自动带出，无需在模板中填写。导入后为待保存状态，需点击「保存」标记为未对账。'
				),
				React.createElement(
					Upload.Dragger,
					{
						accept: '.csv,.xls,.xlsx',
						multiple: false,
						maxCount: 1,
						fileList: importFileList,
						beforeUpload: function (file) {
							handleImportFile(file);
							return false;
						},
						onRemove: function () {
							setImportFileList([]);
							return true;
						}
					},
					React.createElement('p', { style: { margin: '8px 0 4px', color: 'rgba(15,23,42,0.65)' } }, '点击或拖拽文件到此处上传'),
					React.createElement('p', { style: { margin: 0, fontSize: 12, color: 'rgba(15,23,42,0.45)' } }, '支持 .csv / .xls / .xlsx')
				),
				React.createElement(
					'div',
					{ style: { marginTop: 12 } },
					React.createElement(Button, { type: 'link', onClick: downloadImportTemplate, style: { padding: 0 } }, '下载导入模板')
				)
			),
			React.createElement(
				Modal,
				{
					title: '批量导出',
					open: exportModalOpen,
					onCancel: closeExportModal,
					width: 640,
					destroyOnClose: true,
					footer: [
						React.createElement(Button, { key: 'cancel', onClick: closeExportModal }, '取消'),
						React.createElement(Button, { key: 'ok', type: 'primary', onClick: handleConfirmExport }, '确认导出')
					]
				},
				React.createElement(
					'div',
					{ style: { marginBottom: 12, fontSize: 13, color: 'rgba(15,23,42,0.55)' } },
					'请选择导出的列'
				),
				React.createElement(
					'div',
					{ style: { marginBottom: 10 } },
					React.createElement(
						Space,
						{ size: 12 },
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: selectAllExportFields }, '全选'),
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: clearAllExportFields }, '取消全选')
					)
				),
				React.createElement(Checkbox.Group, {
					value: exportSelectedKeys,
					onChange: function (vals) {
						setExportSelectedKeys(vals || []);
					},
					style: {
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: '10px 16px',
						width: '100%'
					},
					options: exportColumnDefs.map(function (d) {
						return { label: d.label, value: d.key };
					})
				})
			),
			React.createElement(
				Modal,
				{
					title: '变更日志' + (changeLogModal.orderNo ? ' · ' + changeLogModal.orderNo : ''),
					open: changeLogModal.open,
					onCancel: closeChangeLogModal,
					footer: React.createElement(Button, { onClick: closeChangeLogModal }, '关闭'),
					width: 880,
					destroyOnClose: true
				},
				React.createElement(Table, {
					size: 'small',
					bordered: true,
					rowKey: 'id',
					pagination: changeLogRows.length > 8 ? { pageSize: 8, showSizeChanger: false } : false,
					columns: changeLogColumns,
					dataSource: changeLogRows,
					locale: { emptyText: '暂无变更记录' },
					scroll: { x: 'max-content', y: 360 }
				})
			),
			React.createElement(
				Modal,
				{
					title: '车辆氢费明细 — 需求明细',
					open: reqDetailOpen,
					onCancel: function () {
						setReqDetailOpen(false);
					},
					footer: React.createElement(
						Button,
						{
							type: 'primary',
							onClick: function () {
								setReqDetailOpen(false);
							}
						},
						'知道了'
					),
					width: 840,
					centered: true,
					destroyOnClose: true,
					styles: {
						body: {
							maxHeight: '72vh',
							overflow: 'auto',
							paddingTop: 8,
							paddingBottom: 16
						}
					}
				},
				renderH2RequirementDocPanel()
			)
		)
	);
};
