// 氢费（采购端）汇总报表 PRD（与 氢费采购端汇总报表-需求文档.md 同步）
var H2_PURCHASE_SUMMARY_REQUIREMENT_DOC = `# 氢费（采购端）汇总报表 — 产品需求说明（PRD）

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0（业务版） |
| 产品模块 | 台账数据 → 氢费（采购端）汇总报表 |
| 文档类型 | 产品需求说明 |
| 适用读者 | 产品、采购、财务、运营、测试、项目 |

---

## 一、为什么做这件事

### 1.1 业务痛点

- 采购侧需按加氢站维度掌握氢费规模、应付与实付、开票与预付余额，现有数据分散在车辆氢费明细、打款、开票等模块，缺少一站汇总视图。
- 财务对账需快速识别「未付金额」「站点欠费」等风险，并下钻到账单、流水、发票凭据。

### 1.2 产品价值

| 价值点 | 说明 |
|--------|------|
| 站点汇总 | 一行一站，看清加氢量、应付、已付、未付、开票、未开票、当前余额 |
| 对账效率 | 顶部合计条随筛选即时汇总，支撑采购与财务日常核对 |
| 可追溯 | 关键金额可钻取明细，付款凭据、发票支持在线预览与下载 |
| 风险可见 | 未付/未开票金额为正、当前余额为负时突出展示 |

### 1.3 本期目标

建设 Web 端「氢费（采购端）汇总报表」，按地区、加氢站、结算方式查询，展示站点汇总列表及合计；支持多类钻取与 CSV 导出。

### 1.4 本期不做

- 报表内直接发起打款、开票（跳转或对接后续迭代）。
- 跨年度历史数据全量迁移方案（本期以 2026 年起统计口径描述为准，上线以数据准备结果为准）。

---

## 二、谁在用、用来干什么

### 2.1 用户角色

| 角色 | 典型诉求 |
|------|----------|
| **采购人员** | 按站点查看氢费与支付进度，核对当前余额、欠费站点 |
| **财务人员** | 核对应付/实付/未付/已开票，查看付款证明与发票附件 |
| **运营/主管** | 按地区、结算方式浏览整体规模与异常站点 |

### 2.2 核心使用场景

1. **日常巡检**：按地区或结算方式筛选，查看顶部合计与列表，关注未付、已欠费站点。  
2. **站点下钻**：点击加氢总量、应付总金额等，打开明细弹窗核对构成。  
3. **付款与发票核查**：从已付总金额、已开票金额钻取，预览付款凭据或发票。  
4. **导出报送**：按当前筛选结果导出 CSV。

---

## 三、页面功能说明

### 3.1 页面组成

路径：**台账数据 → 氢费（采购端）汇总报表**

自上而下：

1. **查询条件区** — 地区、加氢站全称、结算方式  
2. **汇总列表区** — 标题、导出、筛选摘要、顶部合计条、站点表格  
3. **弹窗** — 需求说明、各类钻取明细、附件预览  

面包屑行右上角提供 **「查看需求说明」**（本文档）；汇总列表标题右侧提供 **「导出」**。

### 3.2 查询条件

| 查询项 | 业务说明 |
|--------|----------|
| 地区 | 加氢站所属省/市，支持搜索；空为全部 |
| 加氢站全称 | 从加氢站主数据选择；空为全部 |
| 结算方式 | 预付 / 月结；空为全部 |

**交互：** 修改条件后点击 **「查询」** 生效；**「重置」** 清空条件。查询成功给予简短提示。列表上方展示当前筛选摘要（地区、加氢站、结算方式）。

### 3.3 顶部合计条

表格上方独立展示（随当前列表筛选结果汇总）：

| 合计项 | 计算口径 |
|--------|----------|
| 加氢总量(kg) | 列表各行加氢总量之和 |
| 应付总金额(元) | 列表各行应付总金额之和 |
| 已付总金额(元) | 列表各行已付总金额之和 |
| 未付总金额(元) | **应付总金额合计 − 已付总金额合计**；大于 0 时红色显示 |
| 未开票总金额(元) | **应付总金额合计 − 已开票总金额合计**；大于 0 时红色显示 |
| 充值总额(元) | 列表各行充值总额之和 |
| 当前总余额(元) | 列表各行当前余额之和；合计为负时红色显示 |

### 3.4 汇总列表字段

**列顺序（左→右）：**  
序号 → 地区 → 加氢站全称 → 结算方式 → 加氢总量(kg) → 应付总金额(元) → 已付总金额(元) → 未付总金额(元) → 已开票金额(元) → 未开票金额(元) → 充值总额(元) → 当前余额(元)

**表头列宽：** 支持鼠标拖动表头右侧调整列宽（最小宽度限制），便于长站名与金额列阅读。

| 字段 | 业务口径 | 交互 |
|------|----------|------|
| 结算方式 | 预付 / 月结 | 只读 |
| 加氢总量(kg) | 自 **2026 年起** 该站全部氢费加氢量之和 | 点击钻取 **加氢量明细**（仅加氢量，不含金额） |
| 应付总金额(元) | 该站「车辆氢费明细」**加氢总价(元)** 求和 | 点击钻取明细（加氢量、成本单价、成本总价） |
| 已付总金额(元) | 加氢站打款管理中 **已支付金额** 求和 | 点击钻取支付账单明细 |
| 未付总金额(元) | **应付总金额 − 已付总金额**（行内计算） | 只读；大于 0 红色 |
| 已开票金额(元) | 该站已开票金额合计 | 点击钻取开票记录 |
| 未开票金额(元) | **应付总金额 − 已开票金额**（行内计算） | 只读；大于 0 红色 |
| 充值总额(元) | 该站预充值（打款入账）金额合计 | 点击钻取充值明细 |
| 当前余额(元) | 2026 年期初余额，扣减 2025 年及以前未扣款记录后的实时余额 | 点击钻取余额变更明细；**为负** 时金额红色 + 左侧 **「已欠费」** 标签 |

### 3.5 钻取明细说明

#### （1）加氢量明细（由加氢总量进入）

| 列 | 说明 |
|----|------|
| 序号、加氢时间、订单编号、车牌号、加氢量(kg) | 来源于车辆氢费明细，按当前加氢站筛选 |
| 合计 | 加氢量合计 |

#### （2）应付总金额明细

| 列 | 说明 |
|----|------|
| 序号、加氢时间、订单编号、车牌号、加氢量(kg)、成本单价(元/kg)、成本总价(元) | 按站筛选的车辆氢费明细 |
| 合计 | 加氢量、成本总价；弹窗标题含站名 |

#### （3）已付总金额明细（由已付总金额进入）

| 列 | 说明 |
|----|------|
| 加氢站全称、账单开始时间、账单结束时间、应付总金额(元)、已付总金额(元)、银行付款证明 | 按账单维度展示 |
| 银行付款证明 | **查看付款凭据** — 预览付款证明图片 |
| 合计 | 应付、实付合计 |

#### （4）已开票明细（由已开票金额进入）

| 列 | 说明 |
|----|------|
| 加氢站全称、开票时间、开票金额(元)、发票 | |
| 发票 | **查看发票** — 在线预览 PDF/图片；**下载发票** — 下载 PDF/图片文件 |
| 合计 | 开票金额合计 |

#### （5）充值总额明细（由充值总额进入）

| 列 | 说明 |
|----|------|
| 加氢站全称、支付时间、预充金额(元)、付款凭证 | 支付时间为 **YYYY-MM-DD** |
| 付款凭证 | **预览** — 在线查看；**下载** — 下载凭证文件 |
| 合计 | 预充金额（充值总额）合计 |

#### （6）余额变更明细（由当前余额进入）

| 列 | 说明 |
|----|------|
| 加氢站全称、收入金额(元)、支出金额(元)、余额(元)、订单编号 | 收入/支出为空显示「—」；余额为负红色 |
| 合计 | 收入合计、支出合计、末行余额（与列表该行当前余额一致） |

### 3.6 附件预览

- 付款凭据、发票在弹窗中预览；PDF 使用文档预览，图片直接展示。  
- 发票支持下载，文件名与开票记录一致。

### 3.7 导出

- 点击 **「导出」** 下载当前筛选结果 CSV（含列表字段及合计行）。  
- 编码 UTF-8（带 BOM），便于 Excel 打开。

---

## 四、业务规则摘要

| 规则 | 说明 |
|------|------|
| 统计起点 | 加氢总量等业务口径默认 **2026 年起**（与车辆氢费明细、主数据生效规则一致） |
| 未付（行） | 应付总金额 − 已付总金额 |
| 未付（合计条） | 各站未付之和，等价于应付合计 − 已付合计 |
| 未开票（行） | 应付总金额 − 已开票金额 |
| 未开票（合计条） | 各站未开票之和，等价于应付合计 − 已开票合计 |
| 已欠费 | 仅 **当前余额 &lt; 0** 时展示标签 |
| 钻取范围 | 均限定为 **当前汇总行对应加氢站** |

---

## 五、验收要点（业务）

1. 查询、重置、筛选摘要、合计条与列表数据一致。  
2. 各可点击金额/加氢量钻取弹窗字段与上文一致，合计正确。  
3. 未付、已欠费展示规则符合第四节。  
4. 付款凭据可预览；发票可预览与下载。  
5. 列宽可拖动；导出字段完整。  
6. 「查看需求说明」可打开本 PRD 全文。

---

**文档结束**
`;

/** PRD Markdown 渲染（氢费采购端汇总报表） */
function parsePurchasePrdInlineText(text) {
	var parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
	var nodes = [];
	var i;
	for (i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (!p) continue;
		if (p.indexOf('**') === 0 && p.lastIndexOf('**') === p.length - 2) {
			nodes.push(React.createElement('strong', { key: i }, p.slice(2, -2)));
		} else {
			nodes.push(p);
		}
	}
	return nodes.length === 1 ? nodes[0] : nodes;
}
function isPurchasePrdTableRow(line) {
	return /^\|.+\|$/.test(String(line || '').trim());
}
function isPurchasePrdTableSep(line) {
	return /^\|[\s\-:|]+\|$/.test(String(line || '').trim());
}
function renderPurchasePrdTableRow(line, rowKey, isHeader) {
	var cells = String(line).trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
	return React.createElement('tr', { key: rowKey }, cells.map(function (cell, ci) {
		var Tag = isHeader ? 'th' : 'td';
		return React.createElement(Tag, {
			key: ci,
			style: { border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'left', verticalAlign: 'top', fontWeight: isHeader ? 600 : 400, background: isHeader ? '#f8fafc' : '#fff', fontSize: 13, lineHeight: 1.5 }
		}, parsePurchasePrdInlineText(cell));
	}));
}
function renderPurchasePrdMarkdown(markdown) {
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
				nodes.push(React.createElement('pre', { key: 'code-' + i, style: { margin: '12px 0', padding: '12px 14px', background: '#f6f8fa', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, lineHeight: 1.6, overflow: 'auto', color: '#334155', whiteSpace: 'pre-wrap' } }, codeBuf.join('\n')));
				codeBuf = [];
				inCode = false;
			} else inCode = true;
			i += 1;
			continue;
		}
		if (inCode) { codeBuf.push(line); i += 1; continue; }
		if (trimmed === '---') {
			nodes.push(React.createElement('hr', { key: 'hr-' + i, style: { border: 'none', borderTop: '1px solid #e8ecf0', margin: '20px 0' } }));
			i += 1;
			continue;
		}
		if (isPurchasePrdTableRow(trimmed)) {
			var tableLines = [];
			while (i < lines.length && isPurchasePrdTableRow(String(lines[i]).trim())) {
				tableLines.push(String(lines[i]).trim());
				i += 1;
			}
			var bodyRows = [];
			var ti;
			for (ti = 0; ti < tableLines.length; ti++) {
				if (isPurchasePrdTableSep(tableLines[ti])) continue;
				bodyRows.push(renderPurchasePrdTableRow(tableLines[ti], 'tr-' + i + '-' + ti, ti === 0));
			}
			if (bodyRows.length) {
				nodes.push(React.createElement('div', { key: 'tbl-' + i, style: { overflowX: 'auto', margin: '12px 0 16px' } },
					React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
						React.createElement('tbody', null, bodyRows))));
			}
			continue;
		}
		if (!trimmed) { i += 1; continue; }
		if (trimmed.indexOf('# ') === 0) {
			nodes.push(React.createElement('h1', { key: 'h1-' + i, style: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.35 } }, parsePurchasePrdInlineText(trimmed.slice(2).trim())));
			i += 1;
			continue;
		}
		if (trimmed.indexOf('## ') === 0) {
			nodes.push(React.createElement('h2', { key: 'h2-' + i, style: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '24px 0 12px', paddingBottom: 6, borderBottom: '2px solid #e0f2fe', lineHeight: 1.4 } }, parsePurchasePrdInlineText(trimmed.slice(3).trim())));
			i += 1;
			continue;
		}
		if (trimmed.indexOf('### ') === 0) {
			nodes.push(React.createElement('h3', { key: 'h3-' + i, style: { fontSize: 14, fontWeight: 600, color: '#334155', margin: '16px 0 8px', lineHeight: 1.45 } }, parsePurchasePrdInlineText(trimmed.slice(4).trim())));
			i += 1;
			continue;
		}
		if (trimmed === '**文档结束**') {
			nodes.push(React.createElement('div', { key: 'end-' + i, style: { marginTop: 24, paddingTop: 16, borderTop: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: 13, textAlign: 'center' } }, '— 文档结束 —'));
			i += 1;
			continue;
		}
		if (/^\d+\.\s/.test(trimmed)) {
			nodes.push(React.createElement('div', { key: 'ol-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0 6px 4px', paddingLeft: 4 } }, parsePurchasePrdInlineText(trimmed)));
			i += 1;
			continue;
		}
		if (trimmed.indexOf('- ') === 0) {
			nodes.push(React.createElement('div', { key: 'ul-' + i, style: { display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '4px 0 4px 2px' } },
				React.createElement('span', { style: { color: '#1677ff', flexShrink: 0 } }, '•'),
				React.createElement('span', { style: { flex: 1 } }, parsePurchasePrdInlineText(trimmed.slice(2).trim()))));
			i += 1;
			continue;
		}
		nodes.push(React.createElement('p', { key: 'p-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0' } }, parsePurchasePrdInlineText(trimmed)));
		i += 1;
	}
	return nodes;
}
function renderPurchaseRequirementDocPanel() {
	var md = typeof H2_PURCHASE_SUMMARY_REQUIREMENT_DOC !== 'undefined' && H2_PURCHASE_SUMMARY_REQUIREMENT_DOC ? H2_PURCHASE_SUMMARY_REQUIREMENT_DOC : '';
	if (!md) {
		return React.createElement('div', { style: { padding: 24, color: '#64748b', textAlign: 'center' } }, '需求文档未加载');
	}
	return React.createElement('div', { className: 'h2-req-doc-panel', style: { padding: '4px 4px 16px' } }, renderPurchasePrdMarkdown(md));
}


// 【重要】必须使用 const Component 作为组件变量名
// 台账数据 - 氢费（采购端）汇总报表

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var Row = antd.Row;
	var Col = antd.Col;
	var Space = antd.Space;
	var Tag = antd.Tag;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var message = antd.message;

	var SETTLEMENT_OPTIONS = [
		{ value: '预付', label: '预付' },
		{ value: '月结', label: '月结' }
	];

	/** 原型：加氢站主数据（联调后由接口加载） */
	var STATION_MASTER = [
		{ code: 'HS000059', name: '佛山南海羚牛加氢站', region: '广东省/佛山市', project: '佛山氢能城配', settlement: '预付' },
		{ code: 'HS000035', name: '广州联新氢能东晖加氢站', region: '广东省/广州市', project: '广州干线运输', settlement: '月结' },
		{ code: '000069', name: '中国石化广州开泰北加油加氢站', region: '广东省/广州市', project: '广州干线运输', settlement: '月结' },
		{ code: '000072', name: '中国石化广州金坑加氢站', region: '广东省/广州市', project: '广州冷链专线', settlement: '预付' },
		{ code: 'HS000030', name: '大兴国际氢能示范区海珀尔加氢站', region: '北京市/大兴区', project: '北京示范运营', settlement: '预付' },
		{ code: 'HS000007', name: '上海嘉氢实业加氢站（江桥重塑）', region: '上海市/嘉定区', project: '长三角城际', settlement: '月结' },
		{ code: 'HS000096', name: '松江九亭加油站', region: '上海市/松江区', project: '长三角城际', settlement: '月结' },
		{ code: 'HS000041', name: '宿迁沭阳开发区加氢站', region: '江苏省/宿迁市', project: '苏北物流', settlement: '预付' },
		{ code: 'HS000040', name: '扬州文昌西路站', region: '江苏省/扬州市', project: '苏北物流', settlement: '月结' },
		{ code: '000048', name: '南京溧水柘塘东站', region: '江苏省/南京市', project: '南京港口短驳', settlement: '预付' },
		{ code: 'HS000051', name: '成都华通加氢站', region: '四川省/成都市', project: '西南干线', settlement: '月结' },
		{ code: '000090', name: '成都天府机场高速北站', region: '四川省/成都市', project: '西南干线', settlement: '预付' },
		{ code: 'HS000057', name: '重庆元琨双宝氢能综合能源站', region: '重庆市/渝北区', project: '西南干线', settlement: '月结' },
		{ code: '000091', name: '重庆双溪加氢站', region: '重庆市/涪陵区', project: '西南干线', settlement: '预付' },
		{ code: '000053', name: '武汉革新大道加油站', region: '湖北省/武汉市', project: '华中城配', settlement: '月结' },
		{ code: 'HS000081', name: '武汉群力加油站', region: '湖北省/武汉市', project: '华中城配', settlement: '预付' },
		{ code: '000049', name: '宁波镇海区中国石化加氢站', region: '浙江省/宁波市', project: '浙江氢能租赁', settlement: '月结' },
		{ code: 'HS000086', name: '空气化工产品（浙江）有限公司海盐经济开发区加氢站', region: '浙江省/嘉兴市', project: '浙江氢能租赁', settlement: '预付' },
		{ code: 'HS000039', name: '海盐JUPITER厂内加氢站', region: '浙江省/嘉兴市', project: '园区通勤', settlement: '预付' },
		{ code: '000043', name: '豪汇综合能源站', region: '山东省/淄博市', project: '鲁中物流', settlement: '月结' }
	];

	var REGION_OPTIONS = (function () {
		var map = {};
		STATION_MASTER.forEach(function (s) {
			map[s.region] = s.region;
		});
		return Object.keys(map).sort().map(function (r) {
			return { value: r, label: r };
		});
	})();

	var STATION_OPTIONS = STATION_MASTER.map(function (s) {
		return { value: s.code, label: s.name };
	});

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function fmtMoney(n, digits) {
		if (n === null || n === undefined || n === '') return '-';
		var x = Number(n);
		if (isNaN(x)) return '-';
		var d = digits === undefined ? 2 : digits;
		return x.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
	}

	function fmtQty(n) {
		if (n === null || n === undefined || n === '') return '-';
		var x = Number(n);
		if (isNaN(x)) return '-';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function escapeCsv(v) {
		var s = v == null ? '' : String(v);
		if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
			return '"' + s.replace(/"/g, '""') + '"';
		}
		return s;
	}

	function downloadCsv(filename, lines) {
		var csv = lines.map(function (row) { return row.map(escapeCsv).join(','); }).join('\n');
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function findStation(code) {
		for (var i = 0; i < STATION_MASTER.length; i++) {
			if (STATION_MASTER[i].code === code) return STATION_MASTER[i];
		}
		return null;
	}

	function formatDateTime(d) {
		if (!d || !window.dayjs) return '—';
		try {
			var x = window.dayjs(d);
			return x.isValid() ? x.format('YYYY-MM-DD HH:mm:ss') : '—';
		} catch (eDt) {
			return '—';
		}
	}

	function formatDate(d) {
		if (!d || !window.dayjs) return '—';
		try {
			var x = window.dayjs(d);
			return x.isValid() ? x.format('YYYY-MM-DD') : '—';
		} catch (eD) {
			return '—';
		}
	}

	var MOCK_SAMPLE_PDF_URL =
		'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

	var MOCK_PLATES = ['粤A12345F', '浙AD12345F', '沪A06695F', '苏EF99887F', '京CN88771F', '渝A88888F'];

	/**
	 * 原型：车辆氢费明细钻取数据（联调后按加氢站 + 汇总条件查询车辆氢费明细接口）
	 * payable：应付总金额 = 该站车辆氢费明细「加氢总价」求和
	 */
	function buildMockStationDetailRows(summaryRow, drillType) {
		var seed = 0;
		var code = summaryRow.stationCode || '';
		var i;
		for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
		var lineCount = Math.max(4, 5 + (seed % 6));
		var rows = [];
		var unitPrice = numOrZero(summaryRow.unitPrice) || 28;
		var baseDay = window.dayjs ? window.dayjs('2026-05-01') : null;

		if (drillType === 'hydrogenKg') {
			var totalKg = numOrZero(summaryRow.hydrogenKg);
			var remainKg = totalKg;
			for (i = 0; i < lineCount; i++) {
				var isLast = i === lineCount - 1;
				var kg = isLast
					? Math.round(remainKg * 100) / 100
					: Math.round((totalKg / lineCount) * (0.82 + ((seed + i) % 4) * 0.06) * 100) / 100;
				if (!isLast) remainKg -= kg;
				var costTotal = Math.round(kg * unitPrice * 100) / 100;
				var customerAmount = Math.round(kg * (unitPrice + 2) * 100) / 100;
				var day = baseDay && baseDay.subtract ? baseDay.subtract((seed + i) % 40, 'day') : null;
				rows.push({
					key: code + '-kg-' + i,
					seq: i + 1,
					hydrogenTime: day,
					orderNo: 'JQ' + code + (day && day.format ? day.format('YYMMDD') : '') + String(i + 1).padStart(5, '0'),
					plateNo: MOCK_PLATES[(seed + i) % MOCK_PLATES.length],
					hydrogenKg: kg,
					costUnitPrice: unitPrice,
					costTotal: costTotal,
					customerAmount: customerAmount
				});
			}
			return rows;
		}

		if (drillType === 'payableAmount') {
			var totalPay = numOrZero(summaryRow.payableAmount);
			var remainPay = totalPay;
			for (i = 0; i < lineCount; i++) {
				var isLast = i === lineCount - 1;
				var customerAmount = isLast
					? Math.round(remainPay * 100) / 100
					: Math.round((totalPay / lineCount) * (0.8 + ((seed + i) % 5) * 0.05) * 100) / 100;
				if (!isLast) remainPay -= customerAmount;
				var kg = unitPrice > 0 ? Math.round((customerAmount / (unitPrice + 2)) * 100) / 100 : 0;
				var costTotal = Math.round(kg * unitPrice * 100) / 100;
				var day = baseDay && baseDay.subtract ? baseDay.subtract((seed + i) % 40, 'day') : null;
				rows.push({
					key: code + '-pay-' + i,
					seq: i + 1,
					hydrogenTime: day,
					orderNo: 'JQ' + code + (day && day.format ? day.format('YYMMDD') : '') + String(100 + i).padStart(5, '0'),
					plateNo: MOCK_PLATES[(seed + i + 2) % MOCK_PLATES.length],
					hydrogenKg: kg,
					costUnitPrice: unitPrice,
					costTotal: costTotal,
					customerAmount: customerAmount
				});
			}
			return rows;
		}

		return rows;
	}

	/**
	 * 原型：加氢站预付余额变更明细（联调后对接加氢站打款/余额流水接口）
	 */
	function buildMockPrepaidBalanceRows(summaryRow) {
		var seed = 0;
		var code = summaryRow.stationCode || '';
		var i;
		for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
		var stationName = summaryRow.stationName || '—';
		var finalBalance = numOrZero(summaryRow.prepaidBalance);
		var lineCount = Math.max(5, 6 + (seed % 5));
		var rows = [];
		var openingBalance = Math.round((finalBalance + 38000 + seed * 620) * 100) / 100;
		if (openingBalance < 0) openingBalance = Math.abs(openingBalance) + 50000;

		rows.push({
			key: code + '-bal-0',
			stationName: stationName,
			incomeAmount: openingBalance,
			expenseAmount: null,
			balance: openingBalance,
			orderNo: 'QC' + code + '260101'
		});

		var balance = openingBalance;
		for (i = 1; i < lineCount - 1; i++) {
			var isIncome = (seed + i) % 3 === 0;
			var incomeAmount = null;
			var expenseAmount = null;
			if (isIncome) {
				incomeAmount = Math.round((6000 + (seed + i) * 380) * 100) / 100;
				balance = Math.round((balance + incomeAmount) * 100) / 100;
			} else {
				expenseAmount = Math.round((2800 + (seed + i) * 210) * 100) / 100;
				balance = Math.round((balance - expenseAmount) * 100) / 100;
			}
			rows.push({
				key: code + '-bal-' + i,
				stationName: stationName,
				incomeAmount: incomeAmount,
				expenseAmount: expenseAmount,
				balance: balance,
				orderNo: (isIncome ? 'DK' : 'JQ') + code + String(200 + i).padStart(5, '0')
			});
		}

		var diff = Math.round((finalBalance - balance) * 100) / 100;
		if (Math.abs(diff) < 0.01) {
			rows.push({
				key: code + '-bal-last',
				stationName: stationName,
				incomeAmount: null,
				expenseAmount: null,
				balance: finalBalance,
				orderNo: 'BZ' + code + String(900).padStart(5, '0')
			});
		} else if (diff > 0) {
			rows.push({
				key: code + '-bal-last',
				stationName: stationName,
				incomeAmount: diff,
				expenseAmount: null,
				balance: finalBalance,
				orderNo: 'DK' + code + String(999).padStart(5, '0')
			});
		} else {
			rows.push({
				key: code + '-bal-last',
				stationName: stationName,
				incomeAmount: null,
				expenseAmount: Math.round(Math.abs(diff) * 100) / 100,
				balance: finalBalance,
				orderNo: 'JQ' + code + String(999).padStart(5, '0')
			});
		}

		return rows;
	}

	/** 原型：充值总额钻取（联调后对接加氢站预充值记录接口） */
	function buildMockRechargeDrillRows(summaryRow) {
		var seed = 0;
		var code = summaryRow.stationCode || '';
		var i;
		for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
		var stationName = summaryRow.stationName || '—';
		var totalRecharge = numOrZero(summaryRow.rechargeTotal);
		var rechargeCount = Math.max(2, 4 + (seed % 4));
		var rows = [];
		var remain = totalRecharge;
		var baseDay = window.dayjs ? window.dayjs('2026-01-15') : null;

		for (i = 0; i < rechargeCount; i++) {
			var isLast = i === rechargeCount - 1;
			var prepayAmount = isLast
				? Math.round(remain * 100) / 100
				: Math.round((totalRecharge / rechargeCount) * (0.75 + ((seed + i) % 5) * 0.05) * 100) / 100;
			if (!isLast) remain -= prepayAmount;
			var payDay = baseDay && baseDay.add ? baseDay.add((seed + i) * 17, 'day') : null;
			var isPdf = (seed + i) % 3 === 0;
			rows.push({
				key: code + '-rc-' + i,
				stationName: stationName,
				payTime: payDay,
				prepayAmount: prepayAmount,
				voucherUrl: isPdf
					? MOCK_SAMPLE_PDF_URL
					: 'https://picsum.photos/seed/rc-' + code + '-' + i + '/960/640',
				voucherFileName: '付款凭证_' + code + '_' + String(i + 1).padStart(2, '0') + (isPdf ? '.pdf' : '.jpg'),
				voucherMime: isPdf ? 'pdf' : 'image'
			});
		}
		return rows;
	}

	/** 原型：采购支付钻取（联调后对接加氢站打款账单接口） */
	function buildMockPaymentDrillRows(summaryRow) {
		var seed = 0;
		var code = summaryRow.stationCode || '';
		var i;
		for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
		var stationName = summaryRow.stationName || '—';
		var totalPaid = numOrZero(summaryRow.paidAmount);
		var billCount = Math.max(2, 3 + (seed % 3));
		var rows = [];
		var remainPaid = totalPaid;
		var baseMonth = window.dayjs ? window.dayjs('2026-01-01') : null;

		for (i = 0; i < billCount; i++) {
			var isLast = i === billCount - 1;
			var paidPart = isLast
				? Math.round(remainPaid * 100) / 100
				: Math.round((totalPaid / billCount) * (0.78 + ((seed + i) % 4) * 0.06) * 100) / 100;
			if (!isLast) remainPaid -= paidPart;
			var payablePart = Math.round(paidPart * (1.04 + ((seed + i) % 3) * 0.02) * 100) / 100;
			var start = baseMonth && baseMonth.add ? baseMonth.add(i * 2, 'month').startOf('month') : null;
			var end = start && start.endOf ? start.endOf('month') : null;
			rows.push({
				key: code + '-payment-' + i,
				stationName: stationName,
				billStartDate: start,
				billEndDate: end,
				payableAmount: payablePart,
				paidAmount: paidPart,
				voucherUrl: 'https://picsum.photos/seed/pay-' + code + '-' + i + '/960/640',
				voucherName: '付款凭据_' + code + '_' + String(i + 1).padStart(2, '0') + '.jpg',
				voucherMime: 'image'
			});
		}
		return rows;
	}

	/** 原型：已开票金额钻取（联调后对接开票记录接口） */
	function buildMockInvoiceDrillRows(summaryRow) {
		var seed = 0;
		var code = summaryRow.stationCode || '';
		var i;
		for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
		var stationName = summaryRow.stationName || '—';
		var totalInvoiced = numOrZero(summaryRow.invoicedAmount);
		var invoiceCount = Math.max(2, 3 + (seed % 3));
		var rows = [];
		var remainInv = totalInvoiced;
		var baseDay = window.dayjs ? window.dayjs('2026-02-01') : null;

		for (i = 0; i < invoiceCount; i++) {
			var isLast = i === invoiceCount - 1;
			var amount = isLast
				? Math.round(remainInv * 100) / 100
				: Math.round((totalInvoiced / invoiceCount) * (0.8 + ((seed + i) % 4) * 0.05) * 100) / 100;
			if (!isLast) remainInv -= amount;
			var isPdf = (seed + i) % 2 === 0;
			var invDay = baseDay && baseDay.add ? baseDay.add((seed + i) * 11, 'day') : null;
			rows.push({
				key: code + '-inv-' + i,
				stationName: stationName,
				invoiceTime: invDay,
				invoiceAmount: amount,
				invoiceUrl: isPdf
					? MOCK_SAMPLE_PDF_URL
					: 'https://picsum.photos/seed/inv-' + code + '-' + i + '/860/1200',
				invoiceFileName: '发票_' + code + '_' + String(i + 1).padStart(2, '0') + (isPdf ? '.pdf' : '.jpg'),
				invoiceMime: isPdf ? 'pdf' : 'image'
			});
		}
		return rows;
	}

	function fmtLedgerMoney(v) {
		if (v === null || v === undefined || v === '' || Number(v) === 0) return '—';
		return fmtMoney(v, 2);
	}

	/** 原型：按站点生成汇总行（联调后由后端聚合） */
	function buildMockSummaryRows() {
		return STATION_MASTER.map(function (s, idx) {
			var seed = idx + 1;
			var hydrogenKg = Math.round((1200 + seed * 137.5) * 100) / 100;
			var unitPrice = 28 + (seed % 5) * 0.5;
			/** 应付总金额 = 车辆氢费明细「加氢总价」按站点求和（原型用加氢单价近似） */
			var customerUnitPrice = unitPrice + 2;
			var payable = Math.round(hydrogenKg * customerUnitPrice * 100) / 100;
			var paid = Math.round(payable * (0.55 + (seed % 4) * 0.1) * 100) / 100;
			var unpaid = Math.round((payable - paid) * 100) / 100;
			var invoiced = Math.round(Math.min(payable, paid * (0.72 + (seed % 5) * 0.05)) * 100) / 100;
			var prepaid = Math.round((80000 - seed * 4200 + (seed % 3 === 0 ? -15000 : 0)) * 100) / 100;
			/** 原型：首行演示预付余额为负（已欠费） */
			if (idx === 0) {
				prepaid = -12580.5;
			}
			var rechargeTotal = Math.round((48000 + seed * 3200 + (idx === 0 ? 8000 : 0)) * 100) / 100;
			return {
				key: s.code,
				stationCode: s.code,
				region: s.region,
				stationName: s.name,
				hydrogenKg: hydrogenKg,
				unitPrice: unitPrice,
				payableAmount: payable,
				paidAmount: paid,
				unpaidAmount: unpaid,
				invoicedAmount: invoiced,
				rechargeTotal: rechargeTotal,
				prepaidBalance: prepaid,
				settlement: s.settlement
			};
		});
	}

	var layoutStyle = {
		padding: '16px 24px 24px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};
	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };
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
		'.h2-purchase-summary-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.h2-purchase-summary-wrap .ant-table-wrapper,.h2-purchase-summary-wrap .ant-table-content{overflow-x:hidden!important}' +
		'.h2-purchase-summary-wrap .h2-purchase-summary-table{width:100%!important;table-layout:fixed}' +
		'.h2-purchase-summary-table .ant-table-thead>tr>th{white-space:nowrap;color:#1e293b!important;font-weight:600!important;font-size:13px!important;' +
		'background:#e8f4fc!important;border-bottom:1px solid #bae6fd!important;border-inline-end:1px solid #dbeafe!important;padding:0 8px!important;height:38px!important}' +
		'.h2-purchase-summary-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{white-space:nowrap;font-variant-numeric:tabular-nums;color:#334155;border-bottom:1px solid #f1f5f9!important;border-inline-end:1px solid #f8fafc!important;padding:0 8px!important;height:38px!important;overflow:hidden!important}' +
		'.h2-purchase-summary-table td.h2-cell-prepaid-balance{overflow:hidden!important}' +
		'.h2-purchase-summary-table .h2-prepaid-balance-cell{display:flex;align-items:center;justify-content:flex-end;gap:4px;max-width:100%;min-width:0;overflow:hidden;box-sizing:border-box}' +
		'.h2-purchase-summary-table .h2-prepaid-balance-cell .h2-prepaid-balance-amount{flex:0 1 auto;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:none;background:none;padding:0;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}' +
		'.h2-purchase-summary-table .h2-prepaid-balance-cell .ant-tag{flex-shrink:0;margin:0!important;font-size:11px;line-height:16px;padding:0 5px}' +
		'.h2-purchase-summary-table .ant-table-tbody>tr.h2-purchase-row:hover>td{background:#f0f9ff!important}' +
		'.h2-purchase-summary-table .ant-table-summary>tr>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;padding:0 8px!important;height:38px!important}' +
		'.h2-ledger-totals-bar{display:flex;align-items:stretch;gap:0;margin-bottom:10px;border:1px solid #bae6fd;border-radius:10px;overflow:hidden;background:#f8fafc;box-shadow:0 1px 0 rgba(15,23,42,0.04)}' +
		'.h2-ledger-totals-bar__title{display:flex;align-items:center;justify-content:center;min-width:72px;padding:10px 14px;font-size:14px;font-weight:700;color:#0f172a;background:#e8f4fc;border-right:1px solid #bae6fd}' +
		'.h2-ledger-totals-bar__items{display:flex;flex:1;flex-wrap:wrap}' +
		'.h2-ledger-totals-bar__item{flex:1;min-width:140px;padding:8px 16px;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:center;gap:4px}' +
		'.h2-ledger-totals-bar__item:last-child{border-right:none}' +
		'.h2-ledger-totals-bar__label{font-size:12px;color:rgba(15,23,42,0.55);font-weight:500;line-height:1.2}' +
		'.h2-ledger-totals-bar__value{font-size:16px;font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums;line-height:1.3}' +
		'.h2-ledger-totals-bar__value.is-warn{color:#cf1322}' +
		'.h2-purchase-summary-table .h2-col-header{position:relative;display:flex;align-items:center;width:100%;height:100%;min-height:38px;padding:0 10px 0 8px;box-sizing:border-box}' +
		'.h2-purchase-summary-table .h2-col-header__text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
		'.h2-purchase-summary-table .h2-col-header__resizer{position:absolute;right:0;top:0;bottom:0;width:8px;cursor:col-resize;z-index:2;touch-action:none}' +
		'.h2-purchase-summary-table .h2-col-header__resizer:hover{background:rgba(22,119,255,0.12)}' +
		'.h2-purchase-summary-table.ant-table-wrapper .ant-table-thead>tr>th{position:relative}' +
		'.h2-req-doc-panel{max-width:100%}' +
		'.h2-req-doc-panel h1:first-child{margin-top:0}';

	/** 主表默认列宽 */
	var DEFAULT_MAIN_COLUMN_WIDTHS = {
		seq: 48,
		region: 96,
		stationName: 148,
		settlement: 72,
		hydrogenKg: 96,
		payableAmount: 100,
		paidAmount: 100,
		unpaidAmount: 100,
		invoicedAmount: 100,
		uninvoicedAmount: 100,
		rechargeTotal: 100,
		prepaidBalance: 118
	};
	var MIN_COLUMN_WIDTH = 48;

	var drillLinkStyle = {
		cursor: 'pointer',
		color: '#1677ff',
		border: 'none',
		background: 'none',
		padding: 0,
		font: 'inherit',
		fontVariantNumeric: 'tabular-nums',
		textDecoration: 'underline',
		textUnderlineOffset: 2
	};

	var regionDraftState = useState(undefined);
	var regionDraft = regionDraftState[0];
	var setRegionDraft = regionDraftState[1];
	var stationDraftState = useState(undefined);
	var stationDraft = stationDraftState[0];
	var setStationDraft = stationDraftState[1];
	var settlementDraftState = useState(undefined);
	var settlementDraft = settlementDraftState[0];
	var setSettlementDraft = settlementDraftState[1];

	var regionAppliedState = useState(undefined);
	var regionApplied = regionAppliedState[0];
	var setRegionApplied = regionAppliedState[1];
	var stationAppliedState = useState(undefined);
	var stationApplied = stationAppliedState[0];
	var setStationApplied = stationAppliedState[1];
	var settlementAppliedState = useState(undefined);
	var settlementApplied = settlementAppliedState[0];
	var setSettlementApplied = settlementAppliedState[1];

	var detailDrillModalState = useState({
		open: false,
		type: '',
		stationName: '',
		summary: null,
		rows: []
	});
	var detailDrillModal = detailDrillModalState[0];
	var setDetailDrillModal = detailDrillModalState[1];

	var prepaidBalanceDrillModalState = useState({
		open: false,
		stationName: '',
		endingBalance: 0,
		rows: []
	});
	var prepaidBalanceDrillModal = prepaidBalanceDrillModalState[0];
	var setPrepaidBalanceDrillModal = prepaidBalanceDrillModalState[1];

	var paymentDrillModalState = useState({ open: false, stationName: '', rows: [] });
	var paymentDrillModal = paymentDrillModalState[0];
	var setPaymentDrillModal = paymentDrillModalState[1];

	var invoiceDrillModalState = useState({ open: false, stationName: '', rows: [] });
	var invoiceDrillModal = invoiceDrillModalState[0];
	var setInvoiceDrillModal = invoiceDrillModalState[1];

	var rechargeDrillModalState = useState({ open: false, stationName: '', rows: [] });
	var rechargeDrillModal = rechargeDrillModalState[0];
	var setRechargeDrillModal = rechargeDrillModalState[1];

	var attachmentPreviewState = useState({ open: false, url: '', title: '', mime: 'image' });
	var attachmentPreview = attachmentPreviewState[0];
	var setAttachmentPreview = attachmentPreviewState[1];

	var reqDetailOpenState = useState(false);
	var reqDetailOpen = reqDetailOpenState[0];
	var setReqDetailOpen = reqDetailOpenState[1];

	var columnWidthsState = useState(function () {
		return Object.assign({}, DEFAULT_MAIN_COLUMN_WIDTHS);
	});
	var columnWidths = columnWidthsState[0];
	var setColumnWidths = columnWidthsState[1];
	var columnWidthsRef = { current: columnWidths };
	columnWidthsRef.current = columnWidths;

	var handleColumnResize = useCallback(function (key, width) {
		setColumnWidths(function (prev) {
			var next = Object.assign({}, prev);
			next[key] = Math.max(MIN_COLUMN_WIDTH, Math.round(width));
			return next;
		});
	}, []);

	var makeResizableTitle = useCallback(
		function (title, key) {
			return function ResizableColumnTitle() {
				var onResizeMouseDown = function (e) {
					if (e.button !== 0) return;
					e.preventDefault();
					e.stopPropagation();
					var startX = e.clientX;
					var startWidth = columnWidthsRef.current[key] || DEFAULT_MAIN_COLUMN_WIDTHS[key] || 100;
					var onMouseMove = function (ev) {
						handleColumnResize(key, startWidth + ev.clientX - startX);
					};
					var onMouseUp = function () {
						document.removeEventListener('mousemove', onMouseMove);
						document.removeEventListener('mouseup', onMouseUp);
						document.body.style.cursor = '';
						document.body.style.userSelect = '';
					};
					document.body.style.cursor = 'col-resize';
					document.body.style.userSelect = 'none';
					document.addEventListener('mousemove', onMouseMove);
					document.addEventListener('mouseup', onMouseUp);
				};
				return React.createElement(
					'div',
					{ className: 'h2-col-header' },
					React.createElement('span', { className: 'h2-col-header__text' }, title),
					React.createElement('span', {
						className: 'h2-col-header__resizer',
						onMouseDown: onResizeMouseDown,
						onClick: function (ev) {
							ev.stopPropagation();
						}
					})
				);
			};
		},
		[handleColumnResize]
	);

	var allRows = useMemo(function () {
		return buildMockSummaryRows();
	}, []);

	var dataSource = useMemo(function () {
		var list = allRows.filter(function (r) {
			if (regionApplied && r.region !== regionApplied) return false;
			if (stationApplied && r.stationCode !== stationApplied) return false;
			if (settlementApplied && r.settlement !== settlementApplied) return false;
			return true;
		});
		return list.map(function (r, idx) {
			var unpaid = Math.round((numOrZero(r.payableAmount) - numOrZero(r.paidAmount)) * 100) / 100;
			var uninvoiced = Math.round((numOrZero(r.payableAmount) - numOrZero(r.invoicedAmount)) * 100) / 100;
			return Object.assign({}, r, { seq: idx + 1, unpaidAmount: unpaid, uninvoicedAmount: uninvoiced });
		});
	}, [allRows, regionApplied, stationApplied, settlementApplied]);

	var totals = useMemo(function () {
		var acc = dataSource.reduce(
			function (sum, r) {
				sum.hydrogenKg += numOrZero(r.hydrogenKg);
				sum.payableAmount += numOrZero(r.payableAmount);
				sum.paidAmount += numOrZero(r.paidAmount);
				sum.invoicedAmount += numOrZero(r.invoicedAmount);
				sum.rechargeTotal += numOrZero(r.rechargeTotal);
				sum.prepaidBalance += numOrZero(r.prepaidBalance);
				return sum;
			},
			{ hydrogenKg: 0, payableAmount: 0, paidAmount: 0, invoicedAmount: 0, rechargeTotal: 0, prepaidBalance: 0 }
		);
		acc.unpaidAmount = Math.round((acc.payableAmount - acc.paidAmount) * 100) / 100;
		acc.uninvoicedAmount = Math.round((acc.payableAmount - acc.invoicedAmount) * 100) / 100;
		return acc;
	}, [dataSource]);

	var filterSummaryText = useMemo(function () {
		var parts = [];
		parts.push('地区：' + (regionApplied || '全部'));
		var st = findStation(stationApplied);
		parts.push('加氢站：' + (st ? st.name : '全部'));
		parts.push('结算方式：' + (settlementApplied || '全部'));
		return parts.join('　　');
	}, [regionApplied, stationApplied, settlementApplied]);

	var openDetailDrill = useCallback(function (record, drillType) {
		var rows = buildMockStationDetailRows(record, drillType);
		var title =
			drillType === 'payableAmount'
				? '应付总金额明细'
				: '加氢总量明细';
		setDetailDrillModal({
			open: true,
			type: drillType,
			stationName: record.stationName,
			summary: record,
			rows: rows
		});
	}, []);

	var closeDetailDrill = useCallback(function () {
		setDetailDrillModal({ open: false, type: '', stationName: '', summary: null, rows: [] });
	}, []);

	var openPrepaidBalanceDrill = useCallback(function (record) {
		setPrepaidBalanceDrillModal({
			open: true,
			stationName: record.stationName,
			endingBalance: numOrZero(record.prepaidBalance),
			rows: buildMockPrepaidBalanceRows(record)
		});
	}, []);

	var closePrepaidBalanceDrill = useCallback(function () {
		setPrepaidBalanceDrillModal({ open: false, stationName: '', endingBalance: 0, rows: [] });
	}, []);

	var openPaymentDrill = useCallback(function (record) {
		setPaymentDrillModal({
			open: true,
			stationName: record.stationName,
			rows: buildMockPaymentDrillRows(record)
		});
	}, []);

	var closePaymentDrill = useCallback(function () {
		setPaymentDrillModal({ open: false, stationName: '', rows: [] });
	}, []);

	var openInvoiceDrill = useCallback(function (record) {
		setInvoiceDrillModal({
			open: true,
			stationName: record.stationName,
			rows: buildMockInvoiceDrillRows(record)
		});
	}, []);

	var closeInvoiceDrill = useCallback(function () {
		setInvoiceDrillModal({ open: false, stationName: '', rows: [] });
	}, []);

	var openRechargeDrill = useCallback(function (record) {
		setRechargeDrillModal({
			open: true,
			stationName: record.stationName,
			rows: buildMockRechargeDrillRows(record)
		});
	}, []);

	var closeRechargeDrill = useCallback(function () {
		setRechargeDrillModal({ open: false, stationName: '', rows: [] });
	}, []);

	var openAttachmentPreview = useCallback(function (file) {
		if (!file || !file.url) {
			message.warning('暂无附件');
			return;
		}
		setAttachmentPreview({
			open: true,
			url: file.url,
			title: file.title || '预览',
			mime: file.mime || 'image'
		});
	}, []);

	var closeAttachmentPreview = useCallback(function () {
		setAttachmentPreview({ open: false, url: '', title: '', mime: 'image' });
	}, []);

	var downloadAttachment = useCallback(function (file) {
		if (!file || !file.url) {
			message.warning('暂无文件');
			return;
		}
		var a = document.createElement('a');
		a.href = file.url;
		a.download = file.fileName || 'download';
		a.target = '_blank';
		a.rel = 'noopener noreferrer';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		message.success('开始下载');
	}, []);

	var renderDrillLink = useCallback(function (display, record, drillType) {
		return React.createElement(
			'button',
			{
				type: 'button',
				style: drillLinkStyle,
				title: '点击查看明细',
				onClick: function (e) {
					if (e && e.stopPropagation) e.stopPropagation();
					openDetailDrill(record, drillType);
				}
			},
			display
		);
	}, [openDetailDrill]);

	var renderDrillLinkWithHandler = useCallback(function (display, record, onDrill) {
		return React.createElement(
			'button',
			{
				type: 'button',
				style: drillLinkStyle,
				title: '点击查看明细',
				onClick: function (e) {
					if (e && e.stopPropagation) e.stopPropagation();
					onDrill(record);
				}
			},
			display
		);
	}, []);

	var renderPrepaidBalanceCell = useCallback(function (v, record) {
		var n = numOrZero(v);
		var isArrears = n < 0;
		var amountStyle = isArrears
			? { color: '#cf1322', fontVariantNumeric: 'tabular-nums' }
			: { color: '#1677ff', fontVariantNumeric: 'tabular-nums' };
		return React.createElement(
			'div',
			{ className: 'h2-prepaid-balance-cell' },
			isArrears
				? React.createElement(Tag, { color: 'error' }, '已欠费')
				: null,
			React.createElement(
				'button',
				{
					type: 'button',
					className: 'h2-prepaid-balance-amount',
					style: amountStyle,
					title: '点击查看明细',
					onClick: function (e) {
						if (e && e.stopPropagation) e.stopPropagation();
						openPrepaidBalanceDrill(record);
					}
				},
				fmtMoney(v, 2)
			)
		);
	}, [openPrepaidBalanceDrill]);

	var renderUnpaidAmountCell = useCallback(function (v) {
		var n = numOrZero(v);
		var style = n > 0 ? { color: '#cf1322', fontWeight: 600, fontVariantNumeric: 'tabular-nums' } : { fontVariantNumeric: 'tabular-nums' };
		return React.createElement('span', { style: style }, fmtMoney(v, 2));
	}, []);

	var renderUninvoicedAmountCell = renderUnpaidAmountCell;

	var handleQuery = useCallback(function () {
		setRegionApplied(regionDraft);
		setStationApplied(stationDraft);
		setSettlementApplied(settlementDraft);
		message.success('查询成功');
	}, [regionDraft, stationDraft, settlementDraft]);

	var handleReset = useCallback(function () {
		setRegionDraft(undefined);
		setStationDraft(undefined);
		setSettlementDraft(undefined);
		setRegionApplied(undefined);
		setStationApplied(undefined);
		setSettlementApplied(undefined);
	}, []);

	var handleExport = useCallback(function () {
		var headers = [
			'序号',
			'地区',
			'加氢站全称',
			'结算方式',
			'加氢总量(kg)',
			'应付总金额(元)',
			'已付总金额(元)',
			'未付总金额(元)',
			'已开票金额(元)',
			'未开票金额(元)',
			'充值总额(元)',
			'当前余额(元)',
			'结算方式'
		];
		var body = dataSource.map(function (r) {
			return [
				r.seq,
				r.region,
				r.stationName,
				r.settlement,
				r.hydrogenKg,
				r.payableAmount,
				r.paidAmount,
				r.unpaidAmount,
				r.invoicedAmount,
				r.uninvoicedAmount,
				r.rechargeTotal,
				r.prepaidBalance
			];
		});
		body.push([
			'合计',
			'',
			'',
			'',
			'',
			Math.round(totals.hydrogenKg * 100) / 100,
			'',
			Math.round(totals.payableAmount * 100) / 100,
			Math.round(totals.paidAmount * 100) / 100,
			Math.round(totals.unpaidAmount * 100) / 100,
			Math.round(totals.invoicedAmount * 100) / 100,
			Math.round(totals.uninvoicedAmount * 100) / 100,
			Math.round(totals.rechargeTotal * 100) / 100,
			Math.round(totals.prepaidBalance * 100) / 100
		]);
		downloadCsv('氢费采购端汇总报表_' + new Date().getTime() + '.csv', [headers].concat(body));
		message.success('已导出 CSV');
	}, [dataSource, totals]);

	var columns = useMemo(function () {
		var w = columnWidths;
		return [
			{
				title: makeResizableTitle('序号', 'seq'),
				dataIndex: 'seq',
				key: 'seq',
				width: w.seq,
				align: 'center',
				fixed: 'left'
			},
			{
				title: makeResizableTitle('地区', 'region'),
				dataIndex: 'region',
				key: 'region',
				width: w.region,
				align: 'center',
				ellipsis: true
			},
			{
				title: makeResizableTitle('加氢站全称', 'stationName'),
				dataIndex: 'stationName',
				key: 'stationName',
				width: w.stationName,
				align: 'left',
				ellipsis: true
			},
			{
				title: makeResizableTitle('结算方式', 'settlement'),
				dataIndex: 'settlement',
				key: 'settlement',
				width: w.settlement,
				align: 'center'
			},
			{
				title: makeResizableTitle('加氢总量(kg)', 'hydrogenKg'),
				dataIndex: 'hydrogenKg',
				key: 'hydrogenKg',
				width: w.hydrogenKg,
				align: 'right',
				render: function (v, record) {
					return renderDrillLink(fmtQty(v), record, 'hydrogenKg');
				}
			},
			{
				title: makeResizableTitle('应付总金额(元)', 'payableAmount'),
				dataIndex: 'payableAmount',
				key: 'payableAmount',
				width: w.payableAmount,
				align: 'right',
				render: function (v, record) {
					return renderDrillLink(fmtMoney(v, 2), record, 'payableAmount');
				}
			},
			{
				title: makeResizableTitle('已付总金额(元)', 'paidAmount'),
				dataIndex: 'paidAmount',
				key: 'paidAmount',
				width: w.paidAmount,
				align: 'right',
				render: function (v, record) {
					return renderDrillLinkWithHandler(fmtMoney(v, 2), record, openPaymentDrill);
				}
			},
			{
				title: makeResizableTitle('未付总金额(元)', 'unpaidAmount'),
				dataIndex: 'unpaidAmount',
				key: 'unpaidAmount',
				width: w.unpaidAmount,
				align: 'right',
				render: renderUnpaidAmountCell
			},
			{
				title: makeResizableTitle('已开票金额(元)', 'invoicedAmount'),
				dataIndex: 'invoicedAmount',
				key: 'invoicedAmount',
				width: w.invoicedAmount,
				align: 'right',
				render: function (v, record) {
					return renderDrillLinkWithHandler(fmtMoney(v, 2), record, openInvoiceDrill);
				}
			},
			{
				title: makeResizableTitle('未开票金额(元)', 'uninvoicedAmount'),
				dataIndex: 'uninvoicedAmount',
				key: 'uninvoicedAmount',
				width: w.uninvoicedAmount,
				align: 'right',
				render: renderUninvoicedAmountCell
			},
			{
				title: makeResizableTitle('充值总额(元)', 'rechargeTotal'),
				dataIndex: 'rechargeTotal',
				key: 'rechargeTotal',
				width: w.rechargeTotal,
				align: 'right',
				render: function (v, record) {
					return renderDrillLinkWithHandler(fmtMoney(v, 2), record, openRechargeDrill);
				}
			},
			{
				title: makeResizableTitle('当前余额(元)', 'prepaidBalance'),
				dataIndex: 'prepaidBalance',
				key: 'prepaidBalance',
				width: w.prepaidBalance,
				align: 'right',
				className: 'h2-col-prepaid-balance',
				onCell: function () {
					return { className: 'h2-cell-prepaid-balance' };
				},
				render: renderPrepaidBalanceCell
			}
		];
	}, [
		columnWidths,
		makeResizableTitle,
		renderDrillLink,
		renderDrillLinkWithHandler,
		openPaymentDrill,
		openInvoiceDrill,
		openRechargeDrill,
		renderUnpaidAmountCell,
		renderUninvoicedAmountCell,
		renderPrepaidBalanceCell
	]);

	var detailDrillBaseColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 56, align: 'center' },
			{
				title: '加氢时间',
				dataIndex: 'hydrogenTime',
				key: 'hydrogenTime',
				width: 168,
				align: 'center',
				render: function (v) { return formatDateTime(v); }
			},
			{
				title: '订单编号',
				dataIndex: 'orderNo',
				key: 'orderNo',
				width: 168,
				align: 'center',
				render: function (v) {
					return React.createElement('span', { style: { fontFamily: 'monospace', fontSize: 12 } }, v || '—');
				}
			},
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 108, align: 'center' }
		];
	}, []);

	var detailDrillQtyColumn = useMemo(function () {
		return {
			title: '加氢量(kg)',
			dataIndex: 'hydrogenKg',
			key: 'hydrogenKg',
			width: 100,
			align: 'right',
			render: function (v) { return fmtQty(v); }
		};
	}, []);

	var detailDrillCostColumns = useMemo(function () {
		return [
			{
				title: '成本单价(元/kg)',
				dataIndex: 'costUnitPrice',
				key: 'costUnitPrice',
				width: 120,
				align: 'right',
				render: function (v) { return fmtMoney(v, 2); }
			},
			{
				title: '成本总价(元)',
				dataIndex: 'costTotal',
				key: 'costTotal',
				width: 110,
				align: 'right',
				render: function (v) { return fmtMoney(v, 2); }
			}
		];
	}, []);

	var detailDrillColumns = useMemo(
		function () {
			if (detailDrillModal.type === 'payableAmount') {
				return detailDrillBaseColumns.concat([detailDrillQtyColumn], detailDrillCostColumns);
			}
			return detailDrillBaseColumns.concat([detailDrillQtyColumn]);
		},
		[detailDrillModal.type, detailDrillBaseColumns, detailDrillQtyColumn, detailDrillCostColumns]
	);

	var detailDrillSummary = useMemo(function () {
		if (!detailDrillModal.rows || !detailDrillModal.rows.length) {
			return { hydrogenKg: 0, costTotal: 0 };
		}
		return detailDrillModal.rows.reduce(
			function (acc, r) {
				acc.hydrogenKg += numOrZero(r.hydrogenKg);
				acc.costTotal += numOrZero(r.costTotal);
				return acc;
			},
			{ hydrogenKg: 0, costTotal: 0 }
		);
	}, [detailDrillModal.rows]);

	var detailDrillTableSummary = useCallback(function () {
		if (detailDrillModal.type === 'payableAmount') {
			return React.createElement(
				Table.Summary,
				null,
				React.createElement(
					Table.Summary.Row,
					null,
					React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
					React.createElement(Table.Summary.Cell, { index: 1, colSpan: 3 }),
					React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtQty(detailDrillSummary.hydrogenKg)),
					React.createElement(Table.Summary.Cell, { index: 5 }),
					React.createElement(Table.Summary.Cell, { index: 6, align: 'right' }, fmtMoney(detailDrillSummary.costTotal, 2))
				)
			);
		}
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1, colSpan: 3 }),
				React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtQty(detailDrillSummary.hydrogenKg))
			)
		);
	}, [detailDrillModal.type, detailDrillSummary]);

	var detailDrillTitle = useMemo(function () {
		if (!detailDrillModal.open) return '';
		var name = detailDrillModal.stationName ? ' · ' + detailDrillModal.stationName : '';
		return (detailDrillModal.type === 'payableAmount' ? '应付总金额明细' : '加氢量明细') + name;
	}, [detailDrillModal]);

	var renderTotalsBar = useCallback(function () {
		var items = [
			{ key: 'hydrogenKg', label: '加氢总量(kg)', value: fmtQty(totals.hydrogenKg) },
			{ key: 'payableAmount', label: '应付总金额(元)', value: fmtMoney(totals.payableAmount, 2) },
			{ key: 'paidAmount', label: '已付总金额(元)', value: fmtMoney(totals.paidAmount, 2) },
			{
				key: 'unpaidAmount',
				label: '未付总金额(元)',
				value: fmtMoney(totals.unpaidAmount, 2),
				warn: numOrZero(totals.unpaidAmount) > 0
			},
			{
				key: 'uninvoicedAmount',
				label: '未开票总金额(元)',
				value: fmtMoney(totals.uninvoicedAmount, 2),
				warn: numOrZero(totals.uninvoicedAmount) > 0
			},
			{ key: 'rechargeTotal', label: '充值总额(元)', value: fmtMoney(totals.rechargeTotal, 2) },
			{
				key: 'prepaidBalance',
				label: '当前总余额(元)',
				value: fmtMoney(totals.prepaidBalance, 2),
				warn: numOrZero(totals.prepaidBalance) < 0
			}
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
						React.createElement(
							'div',
							{
								className:
									'h2-ledger-totals-bar__value' + (item.warn ? ' is-warn' : '')
							},
							item.value
						)
					);
				})
			)
		);
	}, [totals]);

	var prepaidBalanceDrillColumns = useMemo(function () {
		return [
			{
				title: '加氢站全称',
				dataIndex: 'stationName',
				key: 'stationName',
				width: 220,
				ellipsis: true
			},
			{
				title: '收入金额(元)',
				dataIndex: 'incomeAmount',
				key: 'incomeAmount',
				width: 120,
				align: 'right',
				render: function (v) { return fmtLedgerMoney(v); }
			},
			{
				title: '支出金额(元)',
				dataIndex: 'expenseAmount',
				key: 'expenseAmount',
				width: 120,
				align: 'right',
				render: function (v) { return fmtLedgerMoney(v); }
			},
			{
				title: '余额(元)',
				dataIndex: 'balance',
				key: 'balance',
				width: 120,
				align: 'right',
				render: function (v) {
					var n = numOrZero(v);
					var style = n < 0 ? { color: '#cf1322', fontWeight: 600 } : undefined;
					return React.createElement('span', { style: style }, fmtMoney(v, 2));
				}
			},
			{
				title: '订单编号',
				dataIndex: 'orderNo',
				key: 'orderNo',
				width: 168,
				align: 'center',
				render: function (v) {
					return React.createElement('span', { style: { fontFamily: 'monospace', fontSize: 12 } }, v || '—');
				}
			}
		];
	}, []);

	var prepaidBalanceDrillSummary = useMemo(function () {
		if (!prepaidBalanceDrillModal.rows || !prepaidBalanceDrillModal.rows.length) {
			return { incomeTotal: 0, expenseTotal: 0, endingBalance: 0 };
		}
		var last = prepaidBalanceDrillModal.rows[prepaidBalanceDrillModal.rows.length - 1];
		return prepaidBalanceDrillModal.rows.reduce(
			function (acc, r) {
				acc.incomeTotal += numOrZero(r.incomeAmount);
				acc.expenseTotal += numOrZero(r.expenseAmount);
				return acc;
			},
			{ incomeTotal: 0, expenseTotal: 0, endingBalance: numOrZero(last.balance) }
		);
	}, [prepaidBalanceDrillModal.rows]);

	var prepaidBalanceDrillTableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(
					Table.Summary.Cell,
					{ index: 1, align: 'right' },
					fmtMoney(prepaidBalanceDrillSummary.incomeTotal, 2)
				),
				React.createElement(
					Table.Summary.Cell,
					{ index: 2, align: 'right' },
					fmtMoney(prepaidBalanceDrillSummary.expenseTotal, 2)
				),
				React.createElement(
					Table.Summary.Cell,
					{ index: 3, align: 'right' },
					fmtMoney(prepaidBalanceDrillSummary.endingBalance, 2)
				),
				React.createElement(Table.Summary.Cell, { index: 4 })
			)
		);
	}, [prepaidBalanceDrillSummary]);

	var rechargeDrillColumns = useMemo(
		function () {
			return [
				{
					title: '加氢站全称',
					dataIndex: 'stationName',
					key: 'stationName',
					width: 220,
					ellipsis: true
				},
				{
					title: '支付时间',
					dataIndex: 'payTime',
					key: 'payTime',
					width: 120,
					align: 'center',
					render: function (v) { return formatDate(v); }
				},
				{
					title: '预充金额(元)',
					dataIndex: 'prepayAmount',
					key: 'prepayAmount',
					width: 120,
					align: 'right',
					render: function (v) { return fmtMoney(v, 2); }
				},
				{
					title: '付款凭证',
					key: 'voucher',
					width: 160,
					align: 'center',
					render: function (_, row) {
						if (!row.voucherUrl) return '—';
						var file = {
							url: row.voucherUrl,
							fileName: row.voucherFileName,
							mime: row.voucherMime || 'image',
							title: row.voucherFileName || '付款凭证'
						};
						return React.createElement(
							Space,
							{ size: 4, wrap: true, style: { justifyContent: 'center' } },
							React.createElement(
								Button,
								{
									type: 'link',
									size: 'small',
									style: { padding: 0 },
									onClick: function () {
										openAttachmentPreview({
											url: file.url,
											title: file.title,
											mime: file.mime
										});
									}
								},
								'预览'
							),
							React.createElement(
								Button,
								{
									type: 'link',
									size: 'small',
									style: { padding: 0 },
									onClick: function () {
										downloadAttachment(file);
									}
								},
								'下载'
							)
						);
					}
				}
			];
		},
		[openAttachmentPreview, downloadAttachment]
	);

	var rechargeDrillSummary = useMemo(function () {
		if (!rechargeDrillModal.rows || !rechargeDrillModal.rows.length) {
			return { prepayAmount: 0 };
		}
		return rechargeDrillModal.rows.reduce(
			function (acc, r) {
				acc.prepayAmount += numOrZero(r.prepayAmount);
				return acc;
			},
			{ prepayAmount: 0 }
		);
	}, [rechargeDrillModal.rows]);

	var rechargeDrillTableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1 }),
				React.createElement(
					Table.Summary.Cell,
					{ index: 2, align: 'right' },
					fmtMoney(rechargeDrillSummary.prepayAmount, 2)
				),
				React.createElement(Table.Summary.Cell, { index: 3 })
			)
		);
	}, [rechargeDrillSummary]);

	var paymentDrillColumns = useMemo(
		function () {
			return [
				{
					title: '加氢站全称',
					dataIndex: 'stationName',
					key: 'stationName',
					width: 220,
					ellipsis: true
				},
				{
					title: '账单开始时间',
					dataIndex: 'billStartDate',
					key: 'billStartDate',
					width: 120,
					align: 'center',
					render: function (v) { return formatDate(v); }
				},
				{
					title: '账单结束时间',
					dataIndex: 'billEndDate',
					key: 'billEndDate',
					width: 120,
					align: 'center',
					render: function (v) { return formatDate(v); }
				},
				{
					title: '应付总金额(元)',
					dataIndex: 'payableAmount',
					key: 'payableAmount',
					width: 120,
					align: 'right',
					render: function (v) { return fmtMoney(v, 2); }
				},
				{
					title: '已付总金额(元)',
					dataIndex: 'paidAmount',
					key: 'paidAmount',
					width: 140,
					align: 'right',
					render: function (v) { return fmtMoney(v, 2); }
				},
				{
					title: '银行付款证明',
					key: 'voucher',
					width: 130,
					align: 'center',
					render: function (_, row) {
						if (!row.voucherUrl) return '—';
						return React.createElement(
							Button,
							{
								type: 'link',
								size: 'small',
								style: { padding: 0 },
								onClick: function () {
									openAttachmentPreview({
										url: row.voucherUrl,
										title: row.voucherName || '付款凭据',
										mime: row.voucherMime || 'image'
									});
								}
							},
							'查看付款凭据'
						);
					}
				}
			];
		},
		[openAttachmentPreview]
	);

	var paymentDrillSummary = useMemo(function () {
		if (!paymentDrillModal.rows || !paymentDrillModal.rows.length) {
			return { payableAmount: 0, paidAmount: 0 };
		}
		return paymentDrillModal.rows.reduce(
			function (acc, r) {
				acc.payableAmount += numOrZero(r.payableAmount);
				acc.paidAmount += numOrZero(r.paidAmount);
				return acc;
			},
			{ payableAmount: 0, paidAmount: 0 }
		);
	}, [paymentDrillModal.rows]);

	var paymentDrillTableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1, colSpan: 2 }),
				React.createElement(
					Table.Summary.Cell,
					{ index: 3, align: 'right' },
					fmtMoney(paymentDrillSummary.payableAmount, 2)
				),
				React.createElement(
					Table.Summary.Cell,
					{ index: 4, align: 'right' },
					fmtMoney(paymentDrillSummary.paidAmount, 2)
				),
				React.createElement(Table.Summary.Cell, { index: 5 })
			)
		);
	}, [paymentDrillSummary]);

	var invoiceDrillColumns = useMemo(
		function () {
			return [
				{
					title: '加氢站全称',
					dataIndex: 'stationName',
					key: 'stationName',
					width: 220,
					ellipsis: true
				},
				{
					title: '开票时间',
					dataIndex: 'invoiceTime',
					key: 'invoiceTime',
					width: 168,
					align: 'center',
					render: function (v) { return formatDateTime(v); }
				},
				{
					title: '开票金额(元)',
					dataIndex: 'invoiceAmount',
					key: 'invoiceAmount',
					width: 120,
					align: 'right',
					render: function (v) { return fmtMoney(v, 2); }
				},
				{
					title: '发票',
					key: 'invoiceFile',
					width: 200,
					align: 'center',
					render: function (_, row) {
						if (!row.invoiceUrl) return '—';
						var file = {
							url: row.invoiceUrl,
							fileName: row.invoiceFileName,
							mime: row.invoiceMime || 'image',
							title: row.invoiceFileName || '发票'
						};
						return React.createElement(
							Space,
							{ size: 4, wrap: true, style: { justifyContent: 'center' } },
							React.createElement(
								Button,
								{
									type: 'link',
									size: 'small',
									style: { padding: 0 },
									onClick: function () {
										openAttachmentPreview({
											url: file.url,
											title: file.title,
											mime: file.mime
										});
									}
								},
								'查看发票'
							),
							React.createElement(
								Button,
								{
									type: 'link',
									size: 'small',
									style: { padding: 0 },
									onClick: function () {
										downloadAttachment(file);
									}
								},
								'下载发票'
							)
						);
					}
				}
			];
		},
		[openAttachmentPreview, downloadAttachment]
	);

	var invoiceDrillSummary = useMemo(function () {
		if (!invoiceDrillModal.rows || !invoiceDrillModal.rows.length) {
			return { invoiceAmount: 0 };
		}
		return invoiceDrillModal.rows.reduce(
			function (acc, r) {
				acc.invoiceAmount += numOrZero(r.invoiceAmount);
				return acc;
			},
			{ invoiceAmount: 0 }
		);
	}, [invoiceDrillModal.rows]);

	var invoiceDrillTableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1 }),
				React.createElement(
					Table.Summary.Cell,
					{ index: 2, align: 'right' },
					fmtMoney(invoiceDrillSummary.invoiceAmount, 2)
				),
				React.createElement(Table.Summary.Cell, { index: 3 })
			)
		);
	}, [invoiceDrillSummary]);

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
					items: [{ title: '台账数据' }, { title: '氢费（采购端）汇总报表' }]
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
					'查看需求说明'
				)
			),
			React.createElement(
				Card,
				{ style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(
					Row,
					{ gutter: [16, 0], align: 'bottom' },
					React.createElement(
						Col,
						{ xs: 24, sm: 12, lg: 8 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '地区'),
							React.createElement(Select, {
								allowClear: true,
								showSearch: true,
								placeholder: '全部',
								style: filterControlStyle,
								value: regionDraft,
								onChange: function (v) { setRegionDraft(v); },
								options: REGION_OPTIONS,
								filterOption: filterOption
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, lg: 8 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '加氢站全称'),
							React.createElement(Select, {
								allowClear: true,
								showSearch: true,
								placeholder: '全部',
								style: filterControlStyle,
								value: stationDraft,
								onChange: function (v) { setStationDraft(v); },
								options: STATION_OPTIONS,
								filterOption: filterOption
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, lg: 8 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '结算方式'),
							React.createElement(Select, {
								allowClear: true,
								placeholder: '全部',
								style: filterControlStyle,
								value: settlementDraft,
								onChange: function (v) { setSettlementDraft(v); },
								options: SETTLEMENT_OPTIONS
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 24, lg: 24, style: Object.assign({}, filterActionsColStyle, { textAlign: 'right' }) },
						React.createElement(
							'div',
							{ style: Object.assign({}, filterItemStyle, { marginBottom: 4 }) },
							React.createElement(
								Space,
								{ wrap: true, style: { justifyContent: 'flex-end', width: '100%' } },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(
				Card,
				{ style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement(
					'div',
					{ style: { position: 'relative', marginBottom: 8, minHeight: 36 } },
					React.createElement(
						'div',
						{
							style: {
								textAlign: 'center',
								fontSize: 18,
								fontWeight: 700,
								color: 'rgba(15,23,42,0.92)',
								letterSpacing: '0.02em',
								padding: '0 88px'
							}
						},
						'氢费（采购端）汇总报表'
					),
					React.createElement(
						'div',
						{ style: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' } },
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				React.createElement(
					'div',
					{
						style: {
							textAlign: 'center',
							marginBottom: 16,
							fontSize: 13,
							color: 'rgba(15,23,42,0.55)',
							fontWeight: 500
						}
					},
					filterSummaryText
				),
				renderTotalsBar(),
				React.createElement(
					'div',
					{ className: 'h2-purchase-summary-wrap' },
					React.createElement(Table, {
						className: 'h2-purchase-summary-table h2-purchase-summary-table--resizable',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: columns,
						dataSource: dataSource,
						pagination: false,
						rowClassName: function () { return 'h2-purchase-row'; },
						scroll: { y: 'calc(100vh - 430px)' },
						sticky: true,
						tableLayout: 'fixed',
						locale: { emptyText: '暂无数据，请调整筛选条件后查询' }
					})
				)
			),
			React.createElement(
				Modal,
				{
					title: detailDrillTitle,
					open: detailDrillModal.open,
					onCancel: closeDetailDrill,
					footer: React.createElement(Button, { onClick: closeDetailDrill }, '关闭'),
					width: 960,
					destroyOnClose: true,
					styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 } }
				},
				React.createElement(Table, {
					className: 'h2-purchase-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					pagination: detailDrillModal.rows.length > 10 ? { pageSize: 10, showSizeChanger: false } : false,
					columns: detailDrillColumns,
					dataSource: detailDrillModal.rows,
					summary: detailDrillTableSummary,
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无明细数据' }
				})
			),
			React.createElement(
				Modal,
				{
					title:
						'充值总额明细' +
						(rechargeDrillModal.stationName ? ' · ' + rechargeDrillModal.stationName : ''),
					open: rechargeDrillModal.open,
					onCancel: closeRechargeDrill,
					footer: React.createElement(Button, { onClick: closeRechargeDrill }, '关闭'),
					width: 880,
					destroyOnClose: true,
					styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 } }
				},
				React.createElement(Table, {
					className: 'h2-purchase-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					pagination:
						rechargeDrillModal.rows.length > 10
							? { pageSize: 10, showSizeChanger: false }
							: false,
					columns: rechargeDrillColumns,
					dataSource: rechargeDrillModal.rows,
					summary: rechargeDrillTableSummary,
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无充值记录' }
				})
			),
			React.createElement(
				Modal,
				{
					title:
						'余额变更明细' +
						(prepaidBalanceDrillModal.stationName ? ' · ' + prepaidBalanceDrillModal.stationName : ''),
					open: prepaidBalanceDrillModal.open,
					onCancel: closePrepaidBalanceDrill,
					footer: React.createElement(Button, { onClick: closePrepaidBalanceDrill }, '关闭'),
					width: 880,
					destroyOnClose: true,
					styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 } }
				},
				React.createElement(Table, {
					className: 'h2-purchase-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					pagination:
						prepaidBalanceDrillModal.rows.length > 10
							? { pageSize: 10, showSizeChanger: false }
							: false,
					columns: prepaidBalanceDrillColumns,
					dataSource: prepaidBalanceDrillModal.rows,
					summary: prepaidBalanceDrillTableSummary,
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无余额变更记录' }
				})
			),
			React.createElement(
				Modal,
				{
					title:
						'已付总金额明细' +
						(paymentDrillModal.stationName ? ' · ' + paymentDrillModal.stationName : ''),
					open: paymentDrillModal.open,
					onCancel: closePaymentDrill,
					footer: React.createElement(Button, { onClick: closePaymentDrill }, '关闭'),
					width: 1020,
					destroyOnClose: true,
					styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 } }
				},
				React.createElement(Table, {
					className: 'h2-purchase-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					pagination:
						paymentDrillModal.rows.length > 10
							? { pageSize: 10, showSizeChanger: false }
							: false,
					columns: paymentDrillColumns,
					dataSource: paymentDrillModal.rows,
					summary: paymentDrillTableSummary,
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无支付明细' }
				})
			),
			React.createElement(
				Modal,
				{
					title:
						'已开票明细' + (invoiceDrillModal.stationName ? ' · ' + invoiceDrillModal.stationName : ''),
					open: invoiceDrillModal.open,
					onCancel: closeInvoiceDrill,
					footer: React.createElement(Button, { onClick: closeInvoiceDrill }, '关闭'),
					width: 920,
					destroyOnClose: true,
					styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 } }
				},
				React.createElement(Table, {
					className: 'h2-purchase-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					pagination:
						invoiceDrillModal.rows.length > 10
							? { pageSize: 10, showSizeChanger: false }
							: false,
					columns: invoiceDrillColumns,
					dataSource: invoiceDrillModal.rows,
					summary: invoiceDrillTableSummary,
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无开票记录' }
				})
			),
			React.createElement(
				Modal,
				{
					title: attachmentPreview.title || '附件预览',
					open: attachmentPreview.open,
					onCancel: closeAttachmentPreview,
					footer: React.createElement(Button, { onClick: closeAttachmentPreview }, '关闭'),
					width: attachmentPreview.mime === 'pdf' ? 920 : 720,
					destroyOnClose: true,
					centered: true,
					styles: { body: { paddingTop: 12, textAlign: 'center' } }
				},
				attachmentPreview.mime === 'pdf'
					? React.createElement('iframe', {
						src: attachmentPreview.url,
						title: attachmentPreview.title,
						style: { width: '100%', height: '70vh', border: 'none' }
					})
					: React.createElement('img', {
						src: attachmentPreview.url,
						alt: attachmentPreview.title,
						style: { maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }
					})
			),
			React.createElement(
				Modal,
				{
					title: '氢费（采购端）汇总报表 — 需求说明',
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
				renderPurchaseRequirementDocPanel()
			)
		)
	);
};
