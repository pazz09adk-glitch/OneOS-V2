// 【重要】必须使用 const Component 作为组件变量名
// 租赁账单-查看（2026年3月11日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Popover = antd.Popover;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;

	var requirementModalVisible = useState(false);
	var servicePopoverRowIndex = useState(null);

	// 模拟：当前账单信息（由路由/接口传入）
	var billInfo = useMemo(function () {
		return {
			contractCode: 'HT-ZL-2025-001',
			contractType: '正式合同',
			projectName: '嘉兴氢能示范项目',
			customerName: '嘉兴某某物流有限公司',
			deliveryTaskCode: 'JT-2025-001-A',
			billCode: 'HT-ZL-2025-0010001',
			period: 1,
			billStartDate: '2025-01-01',
			billEndDate: '2025-01-31'
		};
	}, []);

	var isFirstPeriod = billInfo.period === 1;

	// 车辆明细（只读展示）
	var vehicles = useMemo(function () {
		return [
			{ key: 'v1', index: 1, brand: '东风', model: 'DFH1180', plateNo: '浙A12345', receivableRent: 30000, actualRent: '29800.00', rentRemark: '首期六期一次性付清', discountAmount: '200.00', discountRemark: '首月优惠', discountProof: [{ name: '优惠审批单.pdf' }], receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 500, actual: '480.00', discount: '20.00', remark: '客户协商' }], receivableService: 700, actualService: '680.00' },
			{ key: 'v2', index: 2, brand: '福田', model: 'BJ1180', plateNo: '浙A23456', receivableRent: 27000, actualRent: '27000.00', rentRemark: '', discountAmount: '0.00', discountRemark: '', discountProof: [], receivableDeposit: 8000, serviceItems: [{ name: '保养费用', receivable: 300, actual: '300.00', discount: '0.00', remark: '含首保' }], receivableService: 300, actualService: '300.00' },
			{ key: 'v3', index: 3, brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', receivableRent: 31200, actualRent: '31200.00', rentRemark: '', discountAmount: '0.00', discountRemark: '', discountProof: [], receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 180, actual: '180.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 400, actual: '400.00', discount: '0.00', remark: '' }], receivableService: 580, actualService: '580.00' }
		];
	}, []);

	var hydrogen = useMemo(function () {
		return { receivable: '3580.00', actual: '3500.00', discount: '80.00', discountRemark: '预付款批量减免' };
	}, []);

	var totals = useMemo(function () {
		var receivableRent = 0, actualRent = 0, receivableDeposit = 0, receivableService = 0, actualService = 0, discountTotal = 0, serviceDiscountTotal = 0;
		vehicles.forEach(function (v) {
			receivableRent += Number(v.receivableRent) || 0;
			actualRent += parseFloat(v.actualRent) || 0;
			receivableDeposit += Number(v.receivableDeposit) || 0;
			receivableService += Number(v.receivableService) || 0;
			actualService += parseFloat(v.actualService) || 0;
			discountTotal += parseFloat(v.discountAmount) || 0;
			(v.serviceItems || []).forEach(function (s) { serviceDiscountTotal += parseFloat(s.discount) || 0; });
		});
		var hydrogenReceivable = parseFloat(hydrogen.receivable) || 0;
		var hydrogenActual = parseFloat(hydrogen.actual) || 0;
		var hydrogenDiscount = parseFloat(hydrogen.discount) || 0;
		return {
			receivableRent: receivableRent.toFixed(2),
			actualRent: actualRent.toFixed(2),
			receivableDeposit: receivableDeposit.toFixed(2),
			receivableService: receivableService.toFixed(2),
			actualService: actualService.toFixed(2),
			discountTotal: discountTotal.toFixed(2),
			serviceDiscountTotal: serviceDiscountTotal.toFixed(2),
			hydrogenReceivable: hydrogenReceivable.toFixed(2),
			hydrogenActual: hydrogenActual.toFixed(2),
			hydrogenDiscount: hydrogenDiscount.toFixed(2)
		};
	}, [vehicles, hydrogen]);

	var receivableTotal = useMemo(function () {
		return (parseFloat(totals.receivableRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.receivableService) + (isFirstPeriod ? parseFloat(totals.hydrogenReceivable) : 0)).toFixed(2);
	}, [totals, isFirstPeriod]);

	var actualTotal = useMemo(function () {
		var base = parseFloat(totals.actualRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal) - parseFloat(totals.serviceDiscountTotal);
		if (isFirstPeriod) base += parseFloat(totals.hydrogenActual) - parseFloat(totals.hydrogenDiscount);
		return base.toFixed(2);
	}, [totals, isFirstPeriod]);

	var invoiceTotal = useMemo(function () {
		// 开票总额：同“实收款总额”展示格式，但不包含应收车辆保证金
		var base = parseFloat(totals.actualRent) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal) - parseFloat(totals.serviceDiscountTotal);
		if (isFirstPeriod) base += parseFloat(totals.hydrogenActual) - parseFloat(totals.hydrogenDiscount);
		return base.toFixed(2);
	}, [totals, isFirstPeriod]);

	var receivablePopoverContent = useMemo(function () {
		var rows = [
			['总计应收车辆月租金', totals.receivableRent + ' 元'],
			['总计应收车辆保证金', totals.receivableDeposit + ' 元'],
			['总计应收服务费', totals.receivableService + ' 元']
		];
		if (isFirstPeriod) rows.push(['氢费预付款应收金额', totals.hydrogenReceivable + ' 元']);
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					rows.map(function (r, i) { return React.createElement('tr', { key: i }, React.createElement('td', { style: { padding: '6px 8px' } }, r[0]), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, r[1])); })
				)
			)
		);
	}, [totals, isFirstPeriod]);

	var actualPopoverContent = useMemo(function () {
		var rows = [
			['总计实收车辆月租金', totals.actualRent + ' 元'],
			['总计应收车辆保证金', totals.receivableDeposit + ' 元'],
			['总计实收服务费', totals.actualService + ' 元'],
			['总计减免金额', totals.discountTotal + ' 元'],
			['服务费各项减免费用总和', totals.serviceDiscountTotal + ' 元']
		];
		if (isFirstPeriod) {
			rows.push(['氢费预付款实收金额', totals.hydrogenActual + ' 元']);
			rows.push(['氢费预付款减免金额', totals.hydrogenDiscount + ' 元']);
		}
		return React.createElement('div', { style: { padding: 8, minWidth: 240 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					rows.map(function (r, i) { return React.createElement('tr', { key: i }, React.createElement('td', { style: { padding: '6px 8px' } }, r[0]), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, r[1])); })
				)
			)
		);
	}, [totals, isFirstPeriod]);

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };
	var valueStyle = { color: 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: '22px', minHeight: 22 };
	var thBase = { padding: '10px 12px', border: '1px solid #f0f0f0', whiteSpace: 'nowrap' };
	var highlightStyle = { color: '#1890ff', fontWeight: 600, cursor: 'pointer' };

	var activeServiceIndex = servicePopoverRowIndex[0];
	var setServicePopoverRowIndex = servicePopoverRowIndex[1];

	function handleBack() {
		if (window.__billViewBack) window.__billViewBack();
		else message.info('返回租赁账单列表（原型）');
	}

	var requirementContent = '租赁账单-查看（2026年3月11日版本）\n一个「数字化资产ONEOS运管平台」中的「租赁账单」「查看」模块\n#面包屑：业务管理-租赁账单-收费明细；\n1.账单信息：\n#显示该账单对应合同及账单信息，显示以下字段：\n  1.1.合同编码：显示该账单对应合同编码；\n  1.2.合同类型：显示该账单对应合同类型，包括正式合同、试用合同；\n  1.3.项目名称：显示该账单对应合同中项目名称；\n  1.4.客户名称：显示该账单对应合同中客户名称；\n  1.5.交车任务编码：显示交车任务对应编码；\n  1.6.账单编码：显示该账单编码，账单编码规则为：[合同编码][账单编号]组成，主要用于后期与用友YS系统打通时获取财务收款及发票相关数据；\n          前缀为合同编码，后缀为账单编号，规则为：ZD+4位编号，为该合同下第x份账单，例如：ZD0001为该合同下第1份账单，依次类推；\n          例如：JXZL20260216YW101235AZD0001即为JXZL20260216YW101235A合同下第1份账单；\n  1.7.账单期数：显示该账单期数；\n  1.8.账单开始日期：显示账单开始日期，根据租赁合同及交车任务开始计费日期按规则生成，格式为:YYYY-MM-DD；\n  1.9.账单结束日期：显示账单结束日期，根据租赁合同及交车任务开始计费日期按规则生成，格式为:YYYY-MM-DD；\n2.账单明细：\n#顶部显示应收款总额、实收款总额；\n  2.1.应收款总额：「应收车辆月租金总和」+「应收车辆保证金总和」+「应收服务费总和」+「氢费预付款应收金额」\n  2.2.实收款总额：「实收车辆月租金总和」+「应收车辆保证金总和」+「实收服务费总和」+「氢费预付款实收金额」-「减免费用总和」「服务费各项减免费用总和」\n\n#显示该账单对应车辆列表及相关费用信息，显示以下字段；\n  2.3.序号：与租赁合同及交车任务中该车辆序号一致；\n  2.4.品牌：与租赁合同及交车任务中该车辆品牌一致；\n  2.5.型号：与租赁合同及交车任务中该车辆型号一致；\n  2.6.车牌号：与租赁合同及交车任务中该车辆车牌号一致；\n  2.7.应收车辆月租金：与租赁合同中该车辆车辆月租金一致，格式为：xx.xx元；\n  2.8.实收车辆月租金：与收费明细中实收车辆月租金一致，格式为：xx.xx元；\n  2.9.车辆租金备注：显示收费明细中已填写备注信息；\n  2.10.减免金额：显示收费明细中已填写减免金额；\n  2.11.减免金额备注：显示收费明细中减免金额备注信息；\n  2.12.减免证明：显示已上传减免证明文件，已上传文件一行显示一条，支持点击预览，格式支持各类图片、doc、docx、pdf等格式；\n  2.13.应收车辆保证金：首期与合同中车辆保证金一致，第二期开始为0.00，格式为：xx.xx元；\n  2.14.服务费项目：点击管理，弹出气泡卡片，气泡卡片标题为服务费项目，下方为列表，显示服务项目、应收费用、实收费用、备注；\n     2.14.1.服务项目：显示租赁合同中所有服务项目名称；\n     2.14.2.应收费用：显示租赁合同中所有服务项目对应费用，格式为：xx.xx元；\n     2.14.3.实收费用：显示收费明细中填写的实收费用金额，精确至2位小数，后缀为元，默认与应收费用一致；\n     2.14.4.减免费用：显示收费明细中填写的减免费用金额，精确至2位小数，后缀为元；\n     2.14.4.备注：显示收费明细中填写的备注信息；\n  2.15.应收服务费：显示当前车辆所有服务费应收费用总和，格式为：xx.xx元；\n  2.16.实收服务费：显示当前车辆所有服务费实收费用总和，格式为：xx.xx元；\n#列表下方为氢费预付款情况，首期账单显示，第二期账单开始无此区域内容显示；\n  2.17.氢费预付款应收金额：显示合同中氢费预付款金额；\n  2.18.氢费预付款实收金额：显示收费明细中填写的氢费预付款实收金额，格式为：xx.xx元；\n  2.19.减免金额：显示收费明细中填写的减免金额，格式为：xx.xx元；\n  2.20.减免金额备注：显示收费明细中填写的减免金额备注信息；\n\n3.下方为返回按钮\n  3.1.返回：点击返回按钮，返回租赁账单列表页面；\n';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '租赁账单' },
					{ title: '查看' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '账单信息', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同编码'),
					React.createElement('div', { style: valueStyle }, billInfo.contractCode || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同类型'),
					React.createElement('div', { style: valueStyle }, billInfo.contractType || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '项目名称'),
					React.createElement('div', { style: valueStyle }, billInfo.projectName || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '客户名称'),
					React.createElement('div', { style: valueStyle }, billInfo.customerName || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '交车任务编码'),
					React.createElement('div', { style: valueStyle }, billInfo.deliveryTaskCode || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '账单编码'),
					React.createElement('div', { style: valueStyle }, billInfo.billCode || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '账单期数'),
					React.createElement('div', { style: valueStyle }, billInfo.period != null ? billInfo.period : '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '账单开始日期'),
					React.createElement('div', { style: valueStyle }, billInfo.billStartDate || '—')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '账单结束日期'),
					React.createElement('div', { style: valueStyle }, billInfo.billEndDate || '—')
				)
			)
		),
		React.createElement(Card, { title: '账单明细', style: cardStyle },
			React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' } },
				React.createElement(Popover, { content: receivablePopoverContent, title: '应收款明细', trigger: 'click' },
					React.createElement('span', { style: { cursor: 'pointer' } }, '应收款总额：', React.createElement('span', { style: highlightStyle }, receivableTotal, ' 元'))
				),
				React.createElement(Popover, { content: actualPopoverContent, title: '实收款明细', trigger: 'click' },
					React.createElement('span', { style: { cursor: 'pointer' } }, '实收款总额：', React.createElement('span', { style: highlightStyle }, actualTotal, ' 元'))
				),
				React.createElement('span', { style: { cursor: 'default' } }, '开票总额：', React.createElement('span', { style: highlightStyle }, invoiceTotal, ' 元'))
			),
			React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } },
				React.createElement('table', { style: { width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' } },
					React.createElement('thead', null,
						React.createElement('tr', { style: { backgroundColor: '#fafafa' } },
							React.createElement('th', { style: Object.assign({}, thBase, { width: 50 }) }, '序号'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 80 }) }, '品牌'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '型号'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '车牌号'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '应收车辆月租金'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '实收车辆月租金'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 110 }) }, '车辆租金备注'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '减免金额'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '减免金额备注'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 120 }) }, '减免证明'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '应收车辆保证金'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '服务费项目'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '应收服务费'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '实收服务费')
						)
					),
					React.createElement('tbody', null,
						vehicles.map(function (row) {
							var servicePopover = React.createElement('div', { style: { padding: 8, minWidth: 340 } },
								React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '服务费项目'),
								React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
									React.createElement('thead', null,
										React.createElement('tr', null,
											React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '服务项目'),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '应收费用'),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '实收费用'),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '减免费用'),
											React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '备注')
										)
									),
									React.createElement('tbody', null,
										(row.serviceItems || []).map(function (s, si) {
											return React.createElement('tr', { key: si },
												React.createElement('td', { style: { padding: '6px 8px' } }, s.name),
												React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.receivable != null ? s.receivable : '') + ' 元'),
												React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.actual != null ? s.actual : '') + ' 元'),
												React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.discount != null ? s.discount : '0.00') + ' 元'),
												React.createElement('td', { style: { padding: '6px 8px' } }, s.remark || '—')
											);
										})
									)
								)
							);
							var proofList = row.discountProof || [];
							var depositDisplay = isFirstPeriod ? (row.receivableDeposit || 0) : '0.00';
							return React.createElement('tr', { key: row.key },
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.index),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.brand),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.model),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.plateNo || '—'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableRent != null ? row.receivableRent : 0) + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.actualRent || '0.00') + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.rentRemark || '—'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.discountAmount || '0.00') + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.discountRemark || '—'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									proofList.length === 0 ? '—' : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 } },
										proofList.map(function (p, pidx) {
											return React.createElement(Button, { key: pidx, type: 'link', size: 'small', style: { padding: 0, height: 'auto', textAlign: 'left' }, onClick: function () { message.info('预览：' + (p.name || '附件')); } }, p.name || '附件');
										})
									)
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (depositDisplay !== undefined && depositDisplay !== null ? depositDisplay : '0.00') + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									React.createElement(Popover, {
										content: servicePopover,
										title: null,
										trigger: 'click',
										open: activeServiceIndex === row.key,
										onOpenChange: function (open) { setServicePopoverRowIndex(open ? row.key : null); }
									},
										React.createElement(Button, { type: 'link', size: 'small' }, '管理')
									)
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableService != null ? row.receivableService : '0.00') + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.actualService || '0.00') + ' 元')
							);
						})
					)
				)
			),
			isFirstPeriod ? React.createElement('div', { style: { marginTop: 16 } },
				React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 8 } }, '氢费预付款情况'),
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 800 } },
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '氢费预付款应收金额'),
						React.createElement('div', { style: valueStyle }, hydrogen.receivable + ' 元')
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '氢费预付款实收金额'),
						React.createElement('div', { style: valueStyle }, hydrogen.actual + ' 元')
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '减免金额'),
						React.createElement('div', { style: valueStyle }, hydrogen.discount + ' 元')
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '减免金额备注'),
						React.createElement('div', { style: valueStyle }, hydrogen.discountRemark || '—')
					)
				)
			) : null
		),
		React.createElement('div', { style: { marginTop: 24 } },
			React.createElement(Button, { onClick: handleBack }, '返回')
		),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0' } },
			React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
		)
	);
};
