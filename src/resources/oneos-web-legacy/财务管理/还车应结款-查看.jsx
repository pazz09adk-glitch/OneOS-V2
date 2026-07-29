// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 还车应结款 - 查看（只读）

const Component = function () {
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Input = antd.Input;
	var Tooltip = antd.Tooltip;
	var Popover = antd.Popover;
	var message = antd.message;

	var TextArea = Input.TextArea;

	function toFixed2(v) {
		if (v === null || v === undefined || v === '') return '';
		var n = typeof v === 'number' ? v : parseFloat(v);
		return isNaN(n) ? '' : n.toFixed(2);
	}

	function fmtMoney(v) {
		var n = typeof v === 'number' ? v : parseFloat(v);
		if (isNaN(n)) n = 0;
		return n.toFixed(2);
	}

	function fmtYMDHM(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s) return '-';
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + ' 00:00';
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
			return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
		} catch (e) {
			return s;
		}
	}

	// 页面样式
	var layoutStyle = { padding: '16px 24px 72px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var footerStyle = { position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '12px 24px', display: 'flex', justifyContent: 'flex-start', gap: 12, zIndex: 10 };

	// 还车车辆明细（单车示例）
	var vehicleDetail = useMemo(function () {
		return [{
			key: 'v1',
			plateNo: '粤AGP5621',
			contractCode: 'LNZLHT20251106001',
			projectName: '嘉兴腾4.5T租赁',
			customerName: '嘉兴某某物流有限公司',
			deliveryTime: '2026-02-01 09:30',
			returnTime: '2026-02-27 16:20',
			fragileInsurance: '是',
			tireInsurance: '否',
			maintenanceInsurance: '是'
		}];
	}, []);

	// 业务服务组明细（只读样例）
	var businessServiceRows = useMemo(function () {
		var items = ['租金', 'ETC-客户未缴费用', 'ETC卡缺损费', 'ETC设备缺损费'];
		return items.map(function (name, i) {
			return {
				key: 'bs-' + i,
				seq: i + 1,
				feeItem: name,
				amount: i === 1 ? '100.00' : '0.00',
				remark: '',
				lastUpdateTime: '2026-02-27 10:20',
				photos: [],
				attachments: []
			};
		});
	}, []);

	var billInfo = useMemo(function () {
		return {
			receivedRent: '0.00',
			actualRent: '0.00',
			shouldRefundRent: '0.00'
		};
	}, []);

	var energy = useMemo(function () {
		return {
			deliveryHydrogen: '85.00',
			returnHydrogen: '72.00',
			hydrogenUnitPrice: '35.00',
			hydrogenSupplement: '455.00',
			hydrogenFee: '0.00',
			electricFee: '0.00',
			prepayRefund: '0.00',
			userBalance: '1200.00'
		};
	}, []);

	// 运维部明细（只读样例）
	var tireTreadList = useMemo(function () {
		var unit = 25; // 元/mm
		var rows = [
			{ key: 't1', name: '左前轮', deliveryDepth: '6.80', returnDepth: '6.20' },
			{ key: 't2', name: '左后轮（内）', deliveryDepth: '6.70', returnDepth: '6.00' },
			{ key: 't3', name: '左后轮（外）', deliveryDepth: '6.60', returnDepth: '6.10' },
			{ key: 't4', name: '右前轮', deliveryDepth: '6.90', returnDepth: '6.40' },
			{ key: 't5', name: '右后轮（内）', deliveryDepth: '6.50', returnDepth: '6.00' },
			{ key: 't6', name: '右后轮（外）', deliveryDepth: '6.80', returnDepth: '6.30' },
			{ key: 't7', name: '左中轮', deliveryDepth: '6.70', returnDepth: '6.20' },
			{ key: 't8', name: '右中轮', deliveryDepth: '6.60', returnDepth: '6.10' },
			{ key: 't9', name: '左后备位轮', deliveryDepth: '6.90', returnDepth: '6.50' },
			{ key: 't10', name: '右后备位轮', deliveryDepth: '6.40', returnDepth: '6.00' },
			{ key: 'spare', name: '备胎', deliveryDepth: '7.00', returnDepth: '7.00' }
		];
		return rows.map(function (r) {
			var d = parseFloat(r.deliveryDepth) || 0;
			var rr = parseFloat(r.returnDepth) || 0;
			var diff = Math.max(0, d - rr);
			var total = diff * unit;
			return {
				key: r.key,
				name: r.name,
				deliveryDepth: d.toFixed(2),
				returnDepth: rr.toFixed(2),
				diff: diff.toFixed(2),
				unitPrice: unit.toFixed(2),
				totalAmount: total.toFixed(2)
			};
		});
	}, []);

	var operationRows = useMemo(function () {
		var fixed = [
			{ name: '清洗费', amount: '0.00' },
			{ name: '未结算保养', amount: '372.50' },
			{ name: '未结算维修', amount: '0.00' },
			{ name: '车损费用', amount: '0.00' },
			{ name: '工具损坏丢失费用', amount: '0.00' },
			{ name: '证件丢失费用', amount: '0.00' },
			{ name: '广告损坏丢失费用', amount: '0.00' },
			{ name: '送车服务费', amount: '0.00' },
			{ name: '接车服务费', amount: '0.00' },
			{ name: '轮胎磨损费用', amount: '0.00' }
		];
		return fixed.map(function (x, i) {
			return { key: 'op-' + i, seq: i + 1, feeItem: x.name, amount: x.amount, worryFreeDiscount: '0.00', remark: '', lastUpdateTime: '2026-02-27 10:20' };
		});
	}, []);

	// 安全组费用项（只读样例）
	var safetyFeeRows = useMemo(function () {
		var items = ['违章处理违约金', '保险上浮', '其他违规费用'];
		return items.map(function (name, i) {
			return {
				key: 'sf-' + i,
				seq: i + 1,
				feeItem: name,
				amount: i === 0 ? '200.00' : '0.00',
				remark: '',
				lastUpdateTime: '2026-02-27 10:20',
				photos: [],
				attachments: []
			};
		});
	}, []);

	// 安全组（只读示例）
	var violationList = useMemo(function () {
		return [{
			key: 'w1',
			code: 'WZ202602010001',
			plateNo: '浙F03218F',
			violationBehavior: '闯红灯',
			violationTime: '2026-02-01',
			penaltyAmount: '100.00',
			paymentStatus: '未缴费',
			score: '6',
			handleStatus: '未处理',
			violationCustomer: '上海馨想事成物流有限公司',
			violationPhoto: '',
			remark: ''
		}];
	}, []);
	var accidentList = useMemo(function () {
		return [{
			key: 'a1',
			accidentCode: 'SG202508250001',
			plateNo: '京A29256F',
			accidentTime: '2025-08-25',
			accidentPlace: '北京市大兴区某路段',
			accidentType: '撞固定物',
			customerName: '北京海龙运输有限公司',
			ourClaimAmount: '',
			theirClaimAmount: '',
			responsibility: '全责',
			accidentStatus: '未结案',
			closeTime: '',
			otherFee: '',
			remark: ''
		}];
	}, []);

	// 合计/统计（只读）
	var businessServiceTotal = useMemo(function () {
		var sum = 0;
		(businessServiceRows || []).forEach(function (r) { sum += (parseFloat(r.amount) || 0); });
		return sum.toFixed(2);
	}, [businessServiceRows]);
	var operationTotal = useMemo(function () {
		var sum = 0;
		(operationRows || []).forEach(function (r) { sum += (parseFloat(r.amount) || 0); });
		return sum.toFixed(2);
	}, [operationRows]);
	var safetyTotal = useMemo(function () {
		var sum = 0;
		(safetyFeeRows || []).forEach(function (r) { sum += (parseFloat(r.amount) || 0); });
		return sum.toFixed(2);
	}, [safetyFeeRows]);
	var energyTotal = useMemo(function () {
		var a = parseFloat(energy.hydrogenSupplement) || 0;
		var b = parseFloat(energy.hydrogenFee) || 0;
		var c = parseFloat(energy.electricFee) || 0;
		return (a + b + c).toFixed(2);
	}, [energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee]);

	var pendingSettle = useMemo(function () {
		var bs = parseFloat(businessServiceTotal) || 0;
		var rentRefund = parseFloat(billInfo.shouldRefundRent) || 0;
		var op = parseFloat(operationTotal) || 0;
		var en = (parseFloat(energy.hydrogenSupplement) || 0) + (parseFloat(energy.hydrogenFee) || 0) + (parseFloat(energy.electricFee) || 0) - (parseFloat(energy.prepayRefund) || 0);
		var sf = parseFloat(safetyTotal) || 0;
		return (bs + rentRefund + en + op + sf).toFixed(2);
	}, [businessServiceTotal, billInfo.shouldRefundRent, operationTotal, energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee, energy.prepayRefund, safetyTotal]);

	var depositAmount = '5000.00';
	var refundTotal = useMemo(function () {
		var diff = (parseFloat(depositAmount) || 0) - (parseFloat(pendingSettle) || 0);
		return diff > 0 ? diff.toFixed(2) : '0.00';
	}, [depositAmount, pendingSettle]);
	var payTotal = useMemo(function () {
		var diff = (parseFloat(depositAmount) || 0) - (parseFloat(pendingSettle) || 0);
		return diff < 0 ? Math.abs(diff).toFixed(2) : '0.00';
	}, [depositAmount, pendingSettle]);

	function buildBreakdownContent(list) {
		var headStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#fafafa', fontWeight: 600, fontSize: 12 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0', fontSize: 12 };
		return React.createElement('div', { style: { padding: 0, minWidth: 320 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: headStyle }, '费用项'),
						React.createElement('th', { style: Object.assign({}, headStyle, { textAlign: 'right' }) }, '金额(元)')
					)
				),
				React.createElement('tbody', null,
					(list || []).map(function (r) {
						return React.createElement('tr', { key: r.key },
							React.createElement('td', { style: tdStyle }, r.item),
							React.createElement('td', { style: Object.assign({}, tdStyle, { fontWeight: r.strong ? 600 : 400, textAlign: 'right' }) }, r.amount)
						);
					})
				)
			)
		);
	}

	var settleBreakdown = useMemo(function () {
		return [
			{ key: 'bs', item: '业务服务组费用项金额总和', amount: businessServiceTotal || '0.00' },
			{ key: 'rent', item: '业务服务组-车辆应退租金', amount: (toFixed2(billInfo.shouldRefundRent) || '0.00') },
			{ key: 'hDiff', item: '能源采购组-氢量差补缴金额', amount: (toFixed2(energy.hydrogenSupplement) || '0.00') },
			{ key: 'hFee', item: '能源采购组-氢费补缴金额', amount: (toFixed2(energy.hydrogenFee) || '0.00') },
			{ key: 'eFee', item: '能源采购组-电费补缴金额', amount: (toFixed2(energy.electricFee) || '0.00') },
			{ key: 'prepay', item: '能源采购组-预付款退费金额（减）', amount: '-' + (toFixed2(energy.prepayRefund) || '0.00') },
			{ key: 'op', item: '运维部费用项金额总额', amount: operationTotal || '0.00' },
			{ key: 'sf', item: '安全组费用项金额总和', amount: safetyTotal || '0.00' },
			{ key: 'total', item: '待结算总额', amount: pendingSettle || '0.00', strong: true }
		];
	}, [businessServiceTotal, billInfo.shouldRefundRent, energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee, energy.prepayRefund, operationTotal, safetyTotal, pendingSettle]);

	var refundBreakdown = useMemo(function () {
		return [
			{ key: 'd', item: '保证金总额', amount: (toFixed2(depositAmount) || '0.00') },
			{ key: 's', item: '待结算总额', amount: (pendingSettle || '0.00') },
			{ key: 'r', item: '应退还总额', amount: (refundTotal || '0.00'), strong: true }
		];
	}, [depositAmount, pendingSettle, refundTotal]);

	var payBreakdown = useMemo(function () {
		return [
			{ key: 'd', item: '保证金总额', amount: (toFixed2(depositAmount) || '0.00') },
			{ key: 's', item: '待结算总额', amount: (pendingSettle || '0.00') },
			{ key: 'p', item: '应补缴总额', amount: (payTotal || '0.00'), strong: true }
		];
	}, [depositAmount, pendingSettle, payTotal]);

	var vehicleColumns = useMemo(function () {
		return [
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 160, ellipsis: true },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140, ellipsis: true },
			{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '还车时间', dataIndex: 'returnTime', key: 'returnTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{
				title: '易损保', dataIndex: 'fragileInsurance', key: 'fragileInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '提供刹车片、灯泡、蓄电池、雨刮等易损件租期内免费更换服务（不含轮胎，只限自行到服务站更换）' },
							React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #d9d9d9', color: '#999', fontSize: 12, lineHeight: '16px', cursor: 'help', userSelect: 'none' } }, 'i')
						)
					);
				}
			},
			{
				title: '轮胎保', dataIndex: 'tireInsurance', key: 'tireInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '每个租赁年度内提供1次车辆轮胎因自然磨损产生的替换服务' },
							React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #d9d9d9', color: '#999', fontSize: 12, lineHeight: '16px', cursor: 'help', userSelect: 'none' } }, 'i')
						)
					);
				}
			},
			{
				title: '养护保', dataIndex: 'maintenanceInsurance', key: 'maintenanceInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '按厂家保养要求提供定期保养服务' },
							React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #d9d9d9', color: '#999', fontSize: 12, lineHeight: '16px', cursor: 'help', userSelect: 'none' } }, 'i')
						)
					);
				}
			}
		];
	}, []);

	var businessServiceColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 60 },
			{ title: '费用项', dataIndex: 'feeItem', key: 'feeItem', width: 200, ellipsis: true },
			{ title: '金额', dataIndex: 'amount', key: 'amount', width: 140, render: function (v) { return React.createElement(Input, { value: v, addonAfter: '元', disabled: true }); } },
			{ title: '备注', dataIndex: 'remark', key: 'remark', render: function (v) { return React.createElement(TextArea, { value: v, rows: 1, disabled: true }); } },
			{ title: '最后更新时间', dataIndex: 'lastUpdateTime', key: 'lastUpdateTime', width: 150, render: function (v) { return React.createElement('span', { style: { fontSize: 12, color: '#666' } }, v || '-'); } },
			{ title: '照片', key: 'photo', width: 100, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传'); } },
			{ title: '附件', key: 'attachment', width: 110, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传附件'); } }
		];
	}, []);

	var safetyFeeColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 60 },
			{ title: '费用项', dataIndex: 'feeItem', key: 'feeItem', width: 200, ellipsis: true },
			{ title: '金额', dataIndex: 'amount', key: 'amount', width: 140, render: function (v) { return React.createElement(Input, { value: v, addonAfter: '元', disabled: true }); } },
			{ title: '备注', dataIndex: 'remark', key: 'remark', render: function (v) { return React.createElement(TextArea, { value: v, rows: 1, disabled: true }); } },
			{ title: '最后更新时间', dataIndex: 'lastUpdateTime', key: 'lastUpdateTime', width: 150, render: function (v) { return React.createElement('span', { style: { fontSize: 12, color: '#666' } }, v || '-'); } },
			{ title: '照片', key: 'photo', width: 100, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传'); } },
			{ title: '附件', key: 'attachment', width: 110, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传附件'); } }
		];
	}, []);

	var operationColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 60 },
			{
				title: '费用项', dataIndex: 'feeItem', key: 'feeItem', width: 200,
				render: function (v) {
					if (v === '轮胎磨损费用') {
						var popContent = React.createElement('div', { style: { width: 760, maxWidth: '80vw' } },
							React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '轮胎磨损费用明细'),
							React.createElement(Table, {
								rowKey: 'key',
								size: 'small',
								bordered: true,
								pagination: false,
								dataSource: tireTreadList,
								columns: [
									{ title: '轮胎名称', dataIndex: 'name', key: 'name', width: 120, ellipsis: true },
									{ title: '交车胎纹深度', dataIndex: 'deliveryDepth', key: 'deliveryDepth', width: 110, render: function (vv) { return (vv || '0.00') + 'mm'; } },
									{ title: '还车胎纹深度', dataIndex: 'returnDepth', key: 'returnDepth', width: 110, render: function (vv) { return (vv || '0.00') + 'mm'; } },
									{ title: '胎纹差', dataIndex: 'diff', key: 'diff', width: 80, render: function (vv) { return (vv || '0.00') + 'mm'; } },
									{ title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 90, render: function (vv) { return (vv || '0.00') + '元/mm'; } },
									{ title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 90, render: function (vv) { return (vv || '0.00') + '元'; } }
								]
							})
						);
						return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
							(v || '-'),
							React.createElement(Popover, { content: popContent, trigger: 'hover', placement: 'topLeft' },
								React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #d9d9d9', color: '#999', fontSize: 12, lineHeight: '16px', cursor: 'help', userSelect: 'none' } }, 'i')
							)
						);
					}
					return v || '-';
				}
			},
			{ title: '金额', dataIndex: 'amount', key: 'amount', width: 140, render: function (v) { return React.createElement(Input, { value: v, addonAfter: '元', disabled: true }); } },
			{
				title: React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
					'无忧包减免',
					React.createElement(Tooltip, { title: '无忧包减免不会列入运维成本，而是计入业务成本' },
						React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #d9d9d9', color: '#999', fontSize: 12, lineHeight: '16px', cursor: 'help', userSelect: 'none' } }, 'i')
					)
				),
				dataIndex: 'worryFreeDiscount',
				key: 'worryFreeDiscount',
				width: 140,
				render: function (v) { return React.createElement(Input, { value: v, addonAfter: '元', disabled: true }); }
			},
			{ title: '备注', dataIndex: 'remark', key: 'remark', render: function (v) { return React.createElement(TextArea, { value: v, rows: 1, disabled: true }); } },
			{ title: '最后更新时间', dataIndex: 'lastUpdateTime', key: 'lastUpdateTime', width: 150, render: function (v) { return React.createElement('span', { style: { fontSize: 12, color: '#666' } }, v || '-'); } },
			{ title: '照片', key: 'photo', width: 100, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传'); } },
			{ title: '附件', key: 'attachment', width: 110, render: function () { return React.createElement(Button, { size: 'small', disabled: true }, '上传附件'); } }
		];
	}, [tireTreadList]);

	function goBack() {
		message.info('返回还车应结款列表页（原型）');
		try { if (window.history && window.history.length > 1) window.history.back(); } catch (e) {}
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '财务管理' }, { title: '还车应结款' }, { title: '查看' }] })
		),

		React.createElement(Card, { title: '还车车辆明细', style: cardStyle },
			React.createElement(Table, { rowKey: 'key', columns: vehicleColumns, dataSource: vehicleDetail, pagination: false, bordered: true, size: 'middle', scroll: { x: 980 } })
		),

		React.createElement(Card, { title: '还车费用明细', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 } },
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '保证金总额'),
					React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#333' } }, (depositAmount || '0.00'), React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4 } }, '元'))
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '待结算总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(settleBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#fa8c16', cursor: 'pointer' } },
							(pendingSettle || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '应退还总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(refundBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#52c41a', cursor: 'pointer' } },
							(refundTotal || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '应补缴总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(payBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#f5222d', cursor: 'pointer' } },
							(payTotal || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				)
			),

			React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 } },
				React.createElement('div', { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
					React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '业务服务组'),
					React.createElement('div', { style: { flex: 1 } }),
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 } },
						React.createElement('span', null, '总金额：', businessServiceTotal, ' 元'),
						React.createElement('span', null, '提交人：业务服务组-张三'),
						React.createElement('span', null, '状态：已提交')
					)
				),
				React.createElement('div', { style: { padding: '12px 16px', borderTop: '1px solid #f0f0f0' } },
					React.createElement(Table, { rowKey: 'key', columns: businessServiceColumns, dataSource: businessServiceRows, pagination: false, bordered: true, size: 'small' }),
					React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 10 } }, '车辆租金'),
						React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 } },
							React.createElement('div', null,
								React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '本期账单已收租金'),
								React.createElement(Input, { value: billInfo.receivedRent, addonAfter: '元', disabled: true })
							),
							React.createElement('div', null,
								React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '车辆实际租金'),
								React.createElement(Input, { value: billInfo.actualRent, addonAfter: '元', disabled: true })
							),
							React.createElement('div', null,
								React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '车辆应退租金'),
								React.createElement(Input, { value: billInfo.shouldRefundRent, addonAfter: '元', disabled: true })
							)
						)
					)
				)
			),

			React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 } },
				React.createElement('div', { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
					React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '能源采购组'),
					React.createElement('div', { style: { flex: 1 } }),
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 } },
						React.createElement('span', null, '总金额：', energyTotal, ' 元'),
						React.createElement('span', null, '提交人：能源采购组-李四'),
						React.createElement('span', null, '状态：已提交')
					)
				),
				React.createElement('div', { style: { padding: '12px 16px', borderTop: '1px solid #f0f0f0' } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 } },
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '氢量差补缴金额'),
							React.createElement(Input, { value: energy.hydrogenSupplement, addonAfter: '元', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '交车氢量'),
							React.createElement(Input, { value: (toFixed2(energy.deliveryHydrogen) || '0.00'), addonAfter: 'MPa', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '还车氢量'),
							React.createElement(Input, { value: (toFixed2(energy.returnHydrogen) || '0.00'), addonAfter: 'MPa', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '退还车氢气单价'),
							React.createElement(Input, { value: (toFixed2(energy.hydrogenUnitPrice) || '0.00'), addonAfter: '元', disabled: true })
						)
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '能源费补缴金额'),
						React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 12 } },
							React.createElement('div', null, React.createElement(Input, { value: energy.hydrogenFee, placeholder: '氢费补缴金额', addonAfter: '元', style: { width: '100%' }, disabled: true })),
							React.createElement('div', null, React.createElement(Input, { value: energy.electricFee, placeholder: '电费补缴金额', addonAfter: '元', style: { width: '100%' }, disabled: true })),
							React.createElement('div', null),
							React.createElement('div', null)
						)
					),
					React.createElement('div', { style: { gridColumn: '1 / -1', borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 } },
						React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '预付款退费金额'),
						React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 } },
							React.createElement('div', null,
								React.createElement(Input, { value: energy.prepayRefund, placeholder: '0.00', addonAfter: '元', style: { width: '100%' }, disabled: true })
							),
							React.createElement('div', null),
							React.createElement('div', null),
							React.createElement('div', null)
						),
						React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#666' } }, '项目预充值余额：', energy.userBalance, ' 元')
					)
				)
			),

			React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 } },
				React.createElement('div', { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
					React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '运维部'),
					React.createElement('div', { style: { flex: 1 } }),
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 } },
						React.createElement('span', null, '总金额：', operationTotal, ' 元'),
						React.createElement('span', null, '提交人：运维部-王五'),
						React.createElement('span', null, '状态：已提交')
					)
				),
				React.createElement('div', { style: { padding: '12px 16px', borderTop: '1px solid #f0f0f0' } },
					React.createElement(Table, { rowKey: 'key', columns: operationColumns, dataSource: operationRows, pagination: false, bordered: true, size: 'small' })
				)
			),

			React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 } },
				React.createElement('div', { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 } },
					React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '安全组'),
					React.createElement('div', { style: { flex: 1 } }),
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 } },
						React.createElement('span', null, '总金额：', safetyTotal, ' 元'),
						React.createElement('span', null, '提交人：安全组-赵六'),
						React.createElement('span', null, '状态：已提交')
					)
				),
				React.createElement('div', { style: { padding: '12px 16px', borderTop: '1px solid #f0f0f0' } },
					React.createElement(Table, { rowKey: 'key', columns: safetyFeeColumns, dataSource: safetyFeeRows, pagination: false, bordered: true, size: 'small' }),
					React.createElement('div', { style: { margin: '16px 0 12px', fontWeight: 600 } }, '违章清单'),
					React.createElement(Table, {
						rowKey: 'key',
						size: 'small',
						bordered: true,
						pagination: false,
						dataSource: violationList,
						columns: [
							{ title: '违章编码', dataIndex: 'code', key: 'code', width: 130, ellipsis: true },
							{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
							{ title: '违法行为', dataIndex: 'violationBehavior', key: 'violationBehavior', width: 110, ellipsis: true },
							{ title: '违法时间', dataIndex: 'violationTime', key: 'violationTime', width: 110 },
							{ title: '罚款金额', dataIndex: 'penaltyAmount', key: 'penaltyAmount', width: 90, render: function (v) { return (v || '0.00'); } },
							{ title: '缴费状态', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 90 },
							{ title: '计分值', dataIndex: 'score', key: 'score', width: 70 },
							{ title: '是否处理', dataIndex: 'handleStatus', key: 'handleStatus', width: 90 },
							{ title: '违章客户', dataIndex: 'violationCustomer', key: 'violationCustomer', width: 160, ellipsis: true },
							{ title: '违章照片', dataIndex: 'violationPhoto', key: 'violationPhoto', width: 90, render: function (v) { return v ? v : ''; } },
							{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true }
						]
					}),
					React.createElement('div', { style: { margin: '16px 0 12px', fontWeight: 600 } }, '事故清单'),
					React.createElement(Table, {
						rowKey: 'key',
						size: 'small',
						bordered: true,
						pagination: false,
						dataSource: accidentList,
						locale: { emptyText: '暂无事故记录' },
						columns: [
							{ title: '事故编码', dataIndex: 'accidentCode', key: 'accidentCode', width: 130, ellipsis: true },
							{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
							{ title: '事故时间', dataIndex: 'accidentTime', key: 'accidentTime', width: 110 },
							{ title: '事故地点', dataIndex: 'accidentPlace', key: 'accidentPlace', width: 140, ellipsis: true },
							{ title: '事故类型', dataIndex: 'accidentType', key: 'accidentType', width: 110, ellipsis: true },
							{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140, ellipsis: true },
							{ title: '我方定损金额', dataIndex: 'ourClaimAmount', key: 'ourClaimAmount', width: 110, render: function (v) { return v || ''; } },
							{ title: '对方定损金额', dataIndex: 'theirClaimAmount', key: 'theirClaimAmount', width: 110, render: function (v) { return v || ''; } },
							{ title: '责任划分', dataIndex: 'responsibility', key: 'responsibility', width: 90 },
							{ title: '事故状态', dataIndex: 'accidentStatus', key: 'accidentStatus', width: 90 },
							{ title: '结案时间', dataIndex: 'closeTime', key: 'closeTime', width: 110 },
							{ title: '其他费用', dataIndex: 'otherFee', key: 'otherFee', width: 90, render: function (v) { return v || ''; } },
							{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true }
						]
					})
				)
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { onClick: goBack }, '返回')
		)
	);
};

