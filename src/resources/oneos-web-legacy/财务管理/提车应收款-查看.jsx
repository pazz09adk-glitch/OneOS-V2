// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 提车应收款-查看（2026年3月10日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Popover = antd.Popover;
	var Steps = antd.Steps;
	var Tooltip = antd.Tooltip;
	var message = antd.message;

	var servicePopoverOpen = useState(null);

	// 模拟：项目信息
	var projectInfo = useMemo(function () {
		return {
			collectCode: 'HT-ZL-2025-001TC0001',
			contractCode: 'HT-ZL-2025-001',
			contractType: '正式合同',
			projectName: '嘉兴氢能示范项目',
			customerName: '嘉兴某某物流有限公司',
			paymentMethod: '预付',
			paymentCycle: '6个月',
			contractStart: '2025-01-15',
			contractEnd: '2026-01-14',
			businessDept: '业务1部',
			businessPerson: '张经理'
		};
	}, []);

	// 模拟：本单提车收款单已选车辆及填写内容（只读展示）
	var vehicles = useMemo(function () {
		return [
			{ key: 'v1', index: 1, brand: '东风', model: 'DFH1180', plateNo: '浙A12345', receivableRent: 30000, actualRent: '29800.00', rentRemark: '首期六期一次性付清', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 500, actual: '480.00', discount: '20.00', remark: '客户协商' }], receivableService: 700, actualService: '680.00', discountAmount: '200.00', discountRemark: '首月优惠', discountProof: [{ name: '优惠审批单.pdf' }] },
			{ key: 'v2', index: 2, brand: '福田', model: 'BJ1180', plateNo: '浙A23456', receivableRent: 27000, actualRent: '27000.00', rentRemark: '', receivableDeposit: 8000, serviceItems: [{ name: '保养费用', receivable: 300, actual: '300.00', discount: '0.00', remark: '含首保' }], receivableService: 300, actualService: '300.00', discountAmount: '0.00', discountRemark: '', discountProof: [] },
			{ key: 'v3', index: 3, brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', receivableRent: 31200, actualRent: '31200.00', rentRemark: '按合同约定', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 180, actual: '180.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 400, actual: '400.00', discount: '0.00', remark: '已含上牌' }], receivableService: 580, actualService: '580.00', discountAmount: '0.00', discountRemark: '', discountProof: [] },
			{ key: 'v4', index: 4, brand: '陕汽', model: 'SX1313', plateNo: '', receivableRent: 28800, actualRent: '28500.00', rentRemark: '待交车后补全', receivableDeposit: 9000, serviceItems: [{ name: '保险上浮', receivable: 350, actual: '350.00', discount: '0.00', remark: '' }], receivableService: 350, actualService: '350.00', discountAmount: '300.00', discountRemark: '客户协商减免', discountProof: [] }
		];
	}, []);

	// 与提车收款单一致：存在氢费预付款时参与总额；应收/实收金额取值与编辑页 hydrogen 字段一致
	var hasHydrogenPrepay = true;
	var hydrogen = useMemo(function () {
		return { receivable: '3580.00', actual: '3500.00', discount: '80.00', discountRemark: '预付款批量减免' };
	}, []);

	var totals = useMemo(function () {
		var receivableRent = 0, actualRent = 0, receivableDeposit = 0, receivableService = 0, actualService = 0, discountTotal = 0;
		vehicles.forEach(function (v) {
			receivableRent += Number(v.receivableRent) || 0;
			actualRent += parseFloat(v.actualRent) || 0;
			receivableDeposit += Number(v.receivableDeposit) || 0;
			receivableService += Number(v.receivableService) || 0;
			actualService += parseFloat(v.actualService) || 0;
			discountTotal += parseFloat(v.discountAmount) || 0;
		});
		return {
			receivableRent: receivableRent.toFixed(2),
			actualRent: actualRent.toFixed(2),
			receivableDeposit: receivableDeposit.toFixed(2),
			receivableService: receivableService.toFixed(2),
			actualService: actualService.toFixed(2),
			discountTotal: discountTotal.toFixed(2)
		};
	}, [vehicles]);

	var hydrogenReceivable = hasHydrogenPrepay ? (parseFloat(hydrogen.receivable) || 0) : 0;
	var hydrogenActual = hasHydrogenPrepay ? (parseFloat(hydrogen.actual) || 0) : 0;

	var receivableTotal = useMemo(function () {
		var base = parseFloat(totals.receivableRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.receivableService);
		return (base + hydrogenReceivable).toFixed(2);
	}, [totals, hydrogenReceivable]);

	var actualTotal = useMemo(function () {
		var base = parseFloat(totals.actualRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal);
		return (base + hydrogenActual).toFixed(2);
	}, [totals, hydrogenActual]);

	var receivablePopoverContent = useMemo(function () {
		var rows = [
			React.createElement('tr', { key: 'rent' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableRent + ' 元')),
			React.createElement('tr', { key: 'deposit' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
			React.createElement('tr', { key: 'service' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableService + ' 元'))
		];
		if (hasHydrogenPrepay) {
			rows.push(React.createElement('tr', { key: 'hydrogen' }, React.createElement('td', { style: { padding: '6px 8px' } }, '氢费预充值应收金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (hydrogen.receivable || '0.00') + ' 元')));
		}
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null, rows)
			)
		);
	}, [totals, hasHydrogenPrepay, hydrogen.receivable]);

	var actualPopoverContent = useMemo(function () {
		var rows = [
			React.createElement('tr', { key: 'rent' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualRent + ' 元')),
			React.createElement('tr', { key: 'deposit' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
			React.createElement('tr', { key: 'service' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualService + ' 元')),
			React.createElement('tr', { key: 'discount' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计减免金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.discountTotal + ' 元'))
		];
		if (hasHydrogenPrepay) {
			rows.push(React.createElement('tr', { key: 'hydrogen' }, React.createElement('td', { style: { padding: '6px 8px' } }, '氢费预充值实收金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (hydrogen.actual || '0.00') + ' 元')));
		}
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null, rows)
			)
		);
	}, [totals, hasHydrogenPrepay, hydrogen.actual]);

	// 审批情况：竖向步骤条
	var approvalSteps = useMemo(function () {
		return [
			{ title: '业务部主管', department: '业务1部', status: '已通过', person: '张经理', approveTime: '2026-02-28 09:30' },
			{ title: '财务部', department: '财务部', status: '已通过', person: '李财务', approveTime: '2026-02-28 10:15' },
			{ title: '事业部主管', department: '事业部', status: '待审批', person: '-', approveTime: '-' }
		];
	}, []);

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };
	var highlightStyle = { color: '#1890ff', fontWeight: 600, cursor: 'pointer' };
	var valueStyle = { color: 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: '22px', minHeight: 22 };
	var thBase = { padding: '10px 12px', border: '1px solid #f0f0f0', whiteSpace: 'nowrap', backgroundColor: '#fafafa' };
	var tdBase = { padding: '8px 12px', border: '1px solid #f0f0f0', fontSize: 13 };

	function handleBack() {
		if (window.__receivableBack) window.__receivableBack();
		else message.info('返回提车应收款列表（原型）');
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '财务管理' },
					{ title: '提车应收款' },
					{ title: '提车收款单' }
				]
			})
		),
		React.createElement(Card, { title: '项目信息', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '提车收款单编码'), React.createElement('div', { style: valueStyle }, projectInfo.collectCode || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同编码'), React.createElement('div', { style: valueStyle }, projectInfo.contractCode || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同类型'), React.createElement('div', { style: valueStyle }, projectInfo.contractType || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '项目名称'), React.createElement('div', { style: valueStyle }, projectInfo.projectName || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '客户名称'), React.createElement('div', { style: valueStyle }, projectInfo.customerName || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款方式'), React.createElement('div', { style: valueStyle }, projectInfo.paymentMethod || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款周期'), React.createElement('div', { style: valueStyle }, projectInfo.paymentCycle || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同生效时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractStart || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同结束时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractEnd || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务部门'), React.createElement('div', { style: valueStyle }, projectInfo.businessDept || '—')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务负责人'), React.createElement('div', { style: valueStyle }, projectInfo.businessPerson || '—'))
			)
		),
		React.createElement(Card, { title: '提车应收款信息', style: cardStyle },
			React.createElement(React.Fragment, null,
				React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' } },
					React.createElement(Popover, { content: receivablePopoverContent, title: '应收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '应收款总额：', React.createElement('span', { style: highlightStyle }, receivableTotal, ' 元'))
					),
					React.createElement(Popover, { content: actualPopoverContent, title: '实收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '实收款总额：', React.createElement('span', { style: highlightStyle }, actualTotal, ' 元'))
					)
				),
				React.createElement('div', { style: { overflowX: 'auto', marginBottom: 0 } },
					React.createElement('table', { style: { width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' } },
						React.createElement('thead', null,
							React.createElement('tr', null,
								React.createElement('th', { style: Object.assign({}, thBase, { width: 50 }) }, '序号'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 80 }) }, '品牌'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '型号'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '车牌号'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 120 }) }, '应收车辆月租金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 120 }) }, '实收车辆月租金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 130 }) }, '车辆租金备注'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '减免金额'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 120 }) }, '减免金额备注'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '减免证明'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '应收车辆保证金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '服务费项目'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '应收服务费'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 100 }) }, '实收服务费')
							)
						),
						React.createElement('tbody', null,
							vehicles.map(function (row) {
								var servicePopover = React.createElement('div', { style: { padding: 8, minWidth: 320 } },
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
								var proofNames = (row.discountProof || []).map(function (p) { return p.name; }).join('、') || '—';
								return React.createElement('tr', { key: row.key },
									React.createElement('td', { style: tdBase }, row.index),
									React.createElement('td', { style: tdBase }, row.brand),
									React.createElement('td', { style: tdBase }, row.model),
									React.createElement('td', { style: tdBase }, row.plateNo || '—'),
									React.createElement('td', { style: Object.assign({}, tdBase, { textAlign: 'right' }) }, (row.receivableRent || 0) + ' 元'),
									React.createElement('td', { style: tdBase }, (row.actualRent || '0.00') + ' 元'),
									React.createElement('td', { style: tdBase }, row.rentRemark || '—'),
									React.createElement('td', { style: tdBase }, (row.discountAmount || '0.00') + ' 元'),
									React.createElement('td', { style: tdBase }, row.discountRemark || '—'),
									React.createElement('td', { style: tdBase }, proofNames),
									React.createElement('td', { style: Object.assign({}, tdBase, { textAlign: 'right' }) }, (row.receivableDeposit || 0) + ' 元'),
									React.createElement('td', { style: tdBase },
										React.createElement(Popover, { content: servicePopover, title: null, trigger: 'click', open: servicePopoverOpen[0] === row.key, onOpenChange: function (open) { servicePopoverOpen[1](open ? row.key : null); } },
											React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, '管理')
										)
									),
									React.createElement('td', { style: Object.assign({}, tdBase, { textAlign: 'right' }) }, (row.receivableService || 0) + ' 元'),
									React.createElement('td', { style: Object.assign({}, tdBase, { textAlign: 'right' }) }, (row.actualService || '0.00') + ' 元')
								);
							})
						)
					)
				),
				React.createElement('div', { style: { marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 800 } },
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '氢费预付款应收金额'), React.createElement('div', { style: valueStyle }, (hydrogen.receivable || '0.00') + ' 元')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '氢费预付款实收金额'), React.createElement('div', { style: valueStyle }, (hydrogen.actual || '0.00') + ' 元')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '减免金额'), React.createElement('div', { style: valueStyle }, (hydrogen.discount || '0.00') + ' 元')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '减免金额备注'), React.createElement('div', { style: valueStyle }, hydrogen.discountRemark || '—'))
				),
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 16 } },
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '开票方式'), React.createElement('div', { style: valueStyle }, '先开票后付款')),
					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: '1 / -1' }) }, React.createElement('div', { style: labelStyle }, '开票备注'), React.createElement('div', { style: valueStyle }, '增值税专用发票，税率13%，开票项目：*现代服务*车辆租赁费；备注：嘉兴氢能示范项目-提车首付款'))
				)
			)
		),
		React.createElement(Card, { title: '审批情况', style: cardStyle },
			React.createElement(Steps, {
				direction: 'vertical',
				current: approvalSteps.findIndex(function (s) { return s.status === '待审批'; }) >= 0 ? approvalSteps.findIndex(function (s) { return s.status === '待审批'; }) : approvalSteps.length,
				style: { paddingLeft: 8 },
				items: approvalSteps.map(function (step, idx) {
					return {
						title: step.department || step.title,
						description: React.createElement('div', { style: { marginTop: 4, fontSize: 13, color: 'rgba(0,0,0,0.65)' } },
							React.createElement('div', null, '审批状态：', step.status),
							React.createElement('div', null, '审批人：', step.person),
							React.createElement('div', null, '审批时间：', step.approveTime)
						),
						status: step.status === '已通过' ? 'finish' : step.status === '待审批' ? 'wait' : 'process'
					};
				})
			})
		),
		React.createElement('div', { style: { marginTop: 24 } },
			React.createElement(Button, { onClick: handleBack }, '返回')
		)
	);
};
