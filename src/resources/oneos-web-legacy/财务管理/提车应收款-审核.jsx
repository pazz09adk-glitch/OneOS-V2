// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 提车应收款 - 审批（2026年3月4日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Modal = antd.Modal;
	var Input = antd.Input;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;
	var Steps = antd.Steps;
	var message = antd.message;

	var projectCardExpanded = useState(true);
	var receivableCardExpanded = useState(true);
	var approveCardExpanded = useState(true);
	var rejectModalVisible = useState(false);
	var setRejectModalVisible = rejectModalVisible[1];
	var rejectRemark = useState('');
	var setRejectRemark = rejectRemark[1];
	var approveRemark = useState('');
	var setApproveRemark = approveRemark[1];
	var requirementModalVisible = useState(false);
	var setRequirementModalVisible = requirementModalVisible[1];
	var proofPreviewVisible = useState(false);
	var setProofPreviewVisible = proofPreviewVisible[1];
	var proofPreviewFile = useState(null);
	var setProofPreviewFile = proofPreviewFile[1];

	var requirementContent = '提车应收款-审批（2026年3月4日版本）\n一个「数字化资产ONEOS运管平台」中的「财务管理」「提车应收款」「审批」模块\n#面包屑：财务管理-提车应收款-审批；\n\n页面分为4个卡片，业务流程请参考流程图；\n1.项目信息：\n#显示项目详细信息，包括：\n1.1.合同编码：显示该租赁合同对应合同编码；\n1.2.合同类型：显示该租赁合同对应合同编码；\n1.3.项目名称：显示该租赁合同对应项目名称；\n1.4.客户名称：显示该租赁合同对应客户名称；\n1.5.付款方式：显示该租赁合同对应付款方式，分为：预付、后付两种，根据实际合同反写；\n1.6.付款周期：显示该租赁合同对应付款周期，格式为：x个月；\n1.7.合同生效时间：显示该租赁合同对应合同生效时间；\n1.8.合同结束时间：显示该租赁合同对应合同结束时间；\n1.9.业务部门：显示该租赁合同对应业务部门名称；\n1.10.业务负责人：显示该租赁合同对应业务负责人；\n\n2.提车应收款信息：\n#上方显示应收款总额、实收款总额；\n2.1.应收款总额：显示提交审核时的应收款总额，格式为：xx.xx元，点击金额弹出气泡卡片，卡片中显示列表，字段为：\n    2.1.1.项目：包括总计应收车辆月租金、总计应收车辆保证金、总计应收服务费三项；\n    2.1.2.金额：显示该项目对应应收金额；\n2.2.实收款总额：显示提交审核时的实收款总额，格式为：xx.xx元，点击金额弹出气泡卡片，卡片中显示列表，字段为：\n    2.2.1.项目：包括总计实收车辆月租金、总计应收车辆保证金、总计实收服务费、总计减免金额四项；\n    2.2.2.金额：显示该项目对应实收金额；\n#中间为车辆应收款明细，以列表展示提车应收款已选中所有车辆明细，包括以下字段：\n2.1.序号：根据租赁合同中车辆对应序号顺序展示；\n2.2.品牌：显示租赁合同中车辆对应品牌；\n2.3.型号：显示租赁合同中车辆对应型号；\n2.4.车牌号：显示租赁合同中车辆对应车牌号，如果车牌号为空则显示为-（后续如果交车成功，则车牌号会反显在该处）；\n2.5.应收车辆月租金：根据租赁合同付款周期自动计算，例如：付款周期为6个月，则这里显示金额为：车辆月租金*6；\n2.6.实收车辆月租金：显示提交审核时的实收车辆月租金，格式为：xx.xx元；\n2.7.车辆租金备注：显示提交审核时的车辆租金备注，超长则显示...，悬浮时显示全部详细内容；\n2.8.减免金额：显示提交审核时的减免金额，格式为：xx.xx元；\n2.9.减免金额备注：显示提交审核时的减免金额备注，超长则显示...，悬浮时显示全部详细内容；\n2.10.减免证明：显示所有附件，可点击预览；\n2.11.应收车辆保证金：显示租赁合同中当前车辆保证金金额，格式为：xx.xx元；\n2.12.服务费项目：点击管理，弹出气泡卡片，气泡卡片标题为服务费项目，下方为列表，显示服务项目、应收费用、实收费用、备注；\n     2.12.1.服务项目：显示租赁合同中所有服务项目名称；\n     2.12.2.应收费用：显示租赁合同中所有服务项目对应费用；\n     2.12.3.实收费用：显示提交审核时的实收费用金额，格式为：xx.xx元；\n     2.12.4.减免费用：显示提交审核时的减免费用金额，格式为：xx.xx元；\n     2.12.4.备注：显示提交审核时的服务费减免备注，超长则显示...，悬浮时显示全部详细内容；\n2.13.应收服务费：显示当前车辆所有服务费应收费用总和，格式为：xx.xx元；\n2.14.实收服务费：显示当前车辆所有服务费实收费用总和，格式为：xx.xx元；\n2.15.列表下方对应字段下方显示总计数据，包括：总计应收车辆月租金、总计实收车辆月租金、总计应收车辆保证金、总计应收服务费、总计实收服务费、总计减免金额；\n列表不支持分页功能；\n#下方为氢费预付款情况，以列表展示租赁合同中所有氢费预付款明细，包括以下字段，如租赁合同氢费非预付款模式，则不显示该部分内容：\n2.19.氢费预付款应收金额：显示租赁合同中氢费预付款金额，格式为：xx.xx元，支持2位小数；\n2.20.氢费预付款实收金额：显示提交审核时的氢费预付款实收金额，格式为：xx.xx元；\n2.21.减免金额：显示提交审核时的减免金额，格式为：xx.xx元；\n2.22.减免金额备注：显示提交审核时的氢费预付款减免备注，超长则显示...，悬浮时显示全部详细内容；\n#最底部为开票方式、开票备注；\n2.23.开票方式：显示提交审核时的开票方式；\n2.24.开票备注：显示提交审核时的开票备注；\n\n3.审核情况：\n#上方为纵向步骤条，显示所有审批步骤\n3.1.步骤中显示部门名称，部门名称后方显示审批状态、审批人、审批时间；\n    3.1.1.部门名称：当前节点部门名称；\n    3.1.2.审批状态：分为待审批、审批通过、审批驳回；\n    3.1.3.审批人：步骤节点对应审批人姓名；\n    3.1.4.审批时间：显示审批通过/驳回时间，格式为：YYYY-MM-DD HH:MM；\n3.2.当前步骤的审批人下方为审批说明：非必填，文本域，支持自定义输入；\n3.3.底部为审批通过、驳回、取消；\n    3.3.1.审批通过：点击提示：审批完成，同时下个流程节点审批人工作台待办任务中收到审批任务和消息提示；如当前已是最后节点，则完成审批，同时进入财务开票环节；\n    3.3.2.驳回：点击进行二次确认，二次确认后提示：驳回成功，同时该任务在列表中显示为审核驳回，发起人可重新编辑；\n    3.3.3.取消：点击返回提车应收款列表页；';

	var projectInfo = useMemo(function () {
		return {
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

	var vehicles = useMemo(function () {
		return [
			{ key: 'v1', index: 1, brand: '东风', model: 'DFH1180', plateNo: '浙A12345', receivableRent: 30000, actualRent: '30000.00', rentRemark: '首月全额', receivableDeposit: 10000, receivableService: 700, actualService: '700.00', discountAmount: '0.00', discountRemark: '', discountProof: [{ name: '证明1.pdf' }], serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 500, actual: '500.00', discount: '0.00', remark: '' }] },
			{ key: 'v2', index: 2, brand: '福田', model: 'BJ1180', plateNo: '浙A23456', receivableRent: 27000, actualRent: '27000.00', rentRemark: '', receivableDeposit: 8000, receivableService: 300, actualService: '300.00', discountAmount: '0.00', discountRemark: '', discountProof: [], serviceItems: [{ name: '保养费用', receivable: 300, actual: '300.00', discount: '0.00', remark: '' }] },
			{ key: 'v3', index: 3, brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', receivableRent: 31200, actualRent: '31200.00', rentRemark: '客户协商延期支付部分', receivableDeposit: 10000, receivableService: 580, actualService: '580.00', discountAmount: '0.00', discountRemark: '无', discountProof: [{ name: '减免说明.jpg' }], serviceItems: [{ name: '代处理费用', receivable: 180, actual: '180.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 400, actual: '400.00', discount: '0.00', remark: '' }] }
		];
	}, []);

	var hasHydrogenPrepay = true;
	var hydrogen = useMemo(function () { return { receivable: '3580.00', actual: '3580.00', discount: '0.00', discountRemark: '氢费预付款减免说明，与客户签订补充协议' }; }, []);
	var invoiceMethod = '先开票后付款';
	var invoiceRemark = '开票项目：租赁费，税率 13%。请开具增值税专用发票。';

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

	var receivableTotal = (parseFloat(totals.receivableRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.receivableService)).toFixed(2);
	var actualTotal = (parseFloat(totals.actualRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal)).toFixed(2);

	var receivablePopoverContent = useMemo(function () {
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableRent + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableService + ' 元'))
				)
			)
		);
	}, [totals]);

	var actualPopoverContent = useMemo(function () {
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualRent + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualService + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计减免金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.discountTotal + ' 元'))
				)
			)
		);
	}, [totals]);

	var approvalSteps = useMemo(function () {
		return [
			{ title: '业务部门', status: 'finish', person: '张经理', time: '2026-03-01 10:00' },
			{ title: '财务部门', status: 'process', person: '李四', time: '' },
			{ title: '财务负责人', status: 'wait', person: '王五', time: '' }
		];
	}, []);

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };
	var valueStyle = { color: 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: '22px', minHeight: 22 };
	var thBase = { padding: '10px 12px', border: '1px solid #f0f0f0', whiteSpace: 'nowrap' };
	var highlightStyle = { color: '#1890ff', fontWeight: 600, cursor: 'pointer' };

	function ellipsisCell(text, maxLen) {
		var str = (text == null || text === '') ? '-' : String(text);
		var show = str.length <= (maxLen || 8) ? str : str.slice(0, maxLen || 8) + '...';
		return React.createElement(Tooltip, { title: str === '-' ? '' : str }, React.createElement('span', { style: { display: 'inline-block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, show));
	}

	var handlePass = function () {
		message.success('审批完成，同时下个流程节点审批人工作台待办任务中收到审批任务和消息提示');
		if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表（原型）');
	};

	var handleRejectClick = function () {
		setRejectModalVisible(true);
	};

	var handleRejectConfirm = function () {
		setRejectModalVisible(false);
		setRejectRemark('');
		message.success('驳回成功，同时该任务在列表中显示为审核驳回，发起人可重新编辑');
		if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表（原型）');
	};

	var handleCancel = function () {
		if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表（原型）');
	};

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '财务管理' },
					{ title: '提车应收款' },
					{ title: '审批' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalVisible(true); } }, '查看需求说明')
		),
		React.createElement(Card, {
			title: '项目信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { projectCardExpanded[1](!projectCardExpanded[0]); } }, projectCardExpanded[0] ? '收起' : '展开')
		},
			projectCardExpanded[0] ? React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同编码'), React.createElement('div', { style: valueStyle }, projectInfo.contractCode || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同类型'), React.createElement('div', { style: valueStyle }, projectInfo.contractType || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '项目名称'), React.createElement('div', { style: valueStyle }, projectInfo.projectName || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '客户名称'), React.createElement('div', { style: valueStyle }, projectInfo.customerName || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款方式'), React.createElement('div', { style: valueStyle }, projectInfo.paymentMethod || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款周期'), React.createElement('div', { style: valueStyle }, projectInfo.paymentCycle || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同生效时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractStart || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同结束时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractEnd || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务部门'), React.createElement('div', { style: valueStyle }, projectInfo.businessDept || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务负责人'), React.createElement('div', { style: valueStyle }, projectInfo.businessPerson || '-'))
			) : null
		),
		React.createElement(Card, {
			title: '提车应收款信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { receivableCardExpanded[1](!receivableCardExpanded[0]); } }, receivableCardExpanded[0] ? '收起' : '展开')
		},
			receivableCardExpanded[0] ? React.createElement(React.Fragment, null,
				React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' } },
					React.createElement(Popover, { content: receivablePopoverContent, title: '应收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '应收款总额：', React.createElement('span', { style: highlightStyle }, receivableTotal, ' 元'))
					),
					React.createElement(Popover, { content: actualPopoverContent, title: '实收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '实收款总额：', React.createElement('span', { style: highlightStyle }, actualTotal, ' 元'))
					)
				),
				React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } },
					React.createElement('table', { style: { width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13 } },
						React.createElement('thead', null,
							React.createElement('tr', { style: { backgroundColor: '#fafafa' } },
								React.createElement('th', { style: Object.assign({}, thBase, { width: 50 }) }, '序号'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 80 }) }, '品牌'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '型号'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '车牌号'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 120 }) }, '应收车辆月租金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 130 }) }, '实收车辆月租金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 130 }) }, '车辆租金备注'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 100 }) }, '减免金额'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 130 }) }, '减免金额备注'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 130 }) }, '减免证明'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '应收车辆保证金'),
								React.createElement('th', { style: Object.assign({}, thBase, { width: 90 }) }, '服务费项目'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '应收服务费'),
								React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '实收服务费')
							)
						),
						React.createElement('tbody', null,
							vehicles.map(function (row) {
								var servicePopover = React.createElement('div', { style: { padding: 8, minWidth: 360 } },
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
													React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.discount != null ? s.discount : '') + ' 元'),
													React.createElement('td', { style: { padding: '6px 8px' } }, s.remark || '-')
												);
											})
										)
									)
								);
								return React.createElement('tr', { key: row.key },
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.index),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.brand),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.model),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.plateNo || '-'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableRent || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, (row.actualRent || '') + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', maxWidth: 130 } }, ellipsisCell(row.rentRemark, 10)),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, (row.discountAmount || '0.00') + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', maxWidth: 130 } }, ellipsisCell(row.discountRemark, 10)),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, (row.discountProof && row.discountProof.length) ? row.discountProof.map(function (p, i) {
										return React.createElement('div', { key: i, style: { fontSize: 12, marginBottom: 2 } },
											React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0, height: 'auto', fontSize: 12 }, onClick: function () { setProofPreviewFile(p); setProofPreviewVisible(true); } }, p.name || '附件')
										);
									}) : '-'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableDeposit || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
										React.createElement(Popover, { content: servicePopover, title: null, trigger: 'click' },
											React.createElement(Button, { type: 'link', size: 'small' }, '管理')
										)
									),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableService || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.actualService || '0.00') + ' 元')
								);
							})
						),
						React.createElement('tfoot', null,
							React.createElement('tr', { style: { backgroundColor: '#fafafa', fontWeight: 500 } },
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' }, colSpan: 4 }, '总计'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableRent + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.actualRent + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.discountTotal + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableDeposit + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableService + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.actualService + ' 元')
							)
						)
					)
				),
				hasHydrogenPrepay ? React.createElement('div', { style: { marginBottom: 16 } },
					React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 8 } }, '氢费预付款情况'),
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 800 } },
						React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '氢费预付款应收金额'), React.createElement('div', { style: valueStyle }, hydrogen.receivable + ' 元')),
						React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '氢费预付款实收金额'), React.createElement('div', { style: valueStyle }, hydrogen.actual + ' 元')),
						React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '减免金额'), React.createElement('div', { style: valueStyle }, hydrogen.discount + ' 元')),
						React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '减免金额备注'), React.createElement('div', { style: valueStyle }, ellipsisCell(hydrogen.discountRemark, 12)))
					)
				) : null,
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 16 } },
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '开票方式'), React.createElement('div', { style: valueStyle }, invoiceMethod)),
					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: '1 / -1' }) }, React.createElement('div', { style: labelStyle }, '开票备注'), React.createElement('div', { style: valueStyle }, invoiceRemark || '-'))
				)
			) : null
		),
		React.createElement(Card, {
			title: '审核情况',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { approveCardExpanded[1](!approveCardExpanded[0]); } }, approveCardExpanded[0] ? '收起' : '展开')
		},
			approveCardExpanded[0] ? React.createElement(React.Fragment, null,
				React.createElement(Steps, {
					direction: 'vertical',
					current: 1,
					items: approvalSteps.map(function (s, i) {
						var statusText = s.status === 'finish' ? '审批通过' : s.status === 'process' ? '待审批' : '待审批';
						var desc = React.createElement('div', { style: { fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 4 } },
							React.createElement('div', null, '审批状态：', statusText),
							React.createElement('div', null, '审批人：', s.person || '-'),
							s.time ? React.createElement('div', null, '审批时间：', s.time) : null
						);
						return {
							title: s.title,
							description: desc,
							status: s.status === 'finish' ? 'finish' : s.status === 'process' ? 'process' : 'wait'
						};
					})
				}),
				React.createElement('div', { style: { marginTop: 24, marginBottom: 16 } },
					React.createElement('div', { style: labelStyle }, '审批说明'),
					React.createElement(Input.TextArea, {
						value: approveRemark[0],
						onChange: function (e) { setApproveRemark(e.target.value); },
						placeholder: '非必填，可输入审批说明',
						rows: 3,
						style: { width: '100%', maxWidth: 560 } })
				),
				React.createElement('div', { style: { display: 'flex', gap: 8 } },
					React.createElement(Button, { type: 'primary', onClick: handlePass }, '审批通过'),
					React.createElement(Button, { danger: true, onClick: handleRejectClick }, '驳回'),
					React.createElement(Button, { onClick: handleCancel }, '取消')
				)
			) : null
		),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { setRequirementModalVisible(false); },
			footer: React.createElement(Button, { onClick: function () { setRequirementModalVisible(false); } }, '关闭'),
			width: 720
		},
			React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, maxHeight: '70vh', overflow: 'auto' } }, requirementContent)
		),
		React.createElement(Modal, {
			title: '附件预览',
			open: proofPreviewVisible[0],
			onCancel: function () { setProofPreviewVisible(false); setProofPreviewFile(null); },
			footer: React.createElement(Button, { onClick: function () { setProofPreviewVisible(false); setProofPreviewFile(null); } }, '关闭'),
			width: 640
		},
			React.createElement('div', { style: { padding: '16px 0' } },
				React.createElement('div', { style: { marginBottom: 12, fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '文件：', proofPreviewFile[0] ? (proofPreviewFile[0].name || '附件') : ''),
				React.createElement('div', { style: { minHeight: 360, background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)', fontSize: 14 } }, '此处可预览附件内容，支持 jpg、png、pdf 等格式')
			)
		),
		React.createElement(Modal, {
			title: '确认驳回',
			open: rejectModalVisible[0],
			onCancel: function () { setRejectModalVisible(false); setRejectRemark(''); },
			onOk: handleRejectConfirm,
			okText: '确认驳回'
		},
			React.createElement(React.Fragment, null,
				React.createElement('p', { style: { marginBottom: 12 } }, '驳回后进行二次确认，驳回成功后该任务在列表中显示为审核驳回，发起人可重新编辑。'),
				React.createElement('div', { style: { marginBottom: 8 } }, '驳回原因：'),
				React.createElement(Input.TextArea, {
					value: rejectRemark[0],
					onChange: function (e) { setRejectRemark(e.target.value); },
					placeholder: '请填写驳回原因',
					rows: 4,
					style: { width: '100%' } })
			)
		)
	);
};

if (typeof module !== 'undefined' && module.exports) module.exports = Component;
