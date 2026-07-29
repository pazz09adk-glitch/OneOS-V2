// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 替换车管理 - 编辑

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useRef = React.useRef;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Modal = antd.Modal;
	var message = antd.message;
	var Tag = antd.Tag;
	var Empty = antd.Empty;

	var pairIdRef = useRef(2);

	function createMockPairs() {
		return [
			{
				id: 'pair_1',
				replaceType: '永久替换',
				replaceReason: '车辆原因',
				replaceReasonDesc: '原车故障需维修，临时用替换车保障客户用车。',
				originalPlate: '浙A12345',
				originalVin: 'LGHXCAE28M1234567',
				originalBrand: '东风',
				originalModel: 'DFH1180',
				contractId: 'c1',
				replacePlate: '浙A67890',
				replaceVin: 'LGHXCAE28M6789012',
				replaceBrand: '福田',
				replaceModel: 'BJ1180'
			},
			{
				id: 'pair_2',
				replaceType: '临时替换',
				replaceReason: '客户原因',
				replaceFee: '500.00',
				replaceReasonDesc: '',
				originalPlate: '浙A55555',
				originalVin: 'LGHXCAE28M5555555',
				originalBrand: '重汽',
				originalModel: 'ZZ1160',
				contractId: 'c1',
				replacePlate: '浙A66666',
				replaceVin: 'LGHXCAE28M6666666',
				replaceBrand: '江淮',
				replaceModel: 'HFC1190'
			}
		];
	}

	function createEmptyPair() {
		pairIdRef.current += 1;
		return {
			id: 'pair_' + pairIdRef.current,
			replaceType: undefined,
			replaceReason: undefined,
			replaceFee: '',
			replaceReasonDesc: '',
			originalPlate: undefined,
			originalVin: '',
			originalBrand: '',
			originalModel: '',
			contractId: '',
			replacePlate: undefined,
			replaceVin: '',
			replaceBrand: '',
			replaceModel: ''
		};
	}

	var EMPTY_PROJECT = {
		contractId: '',
		projectId: '',
		projectName: '',
		projectType: '',
		customerName: '',
		contractCode: '',
		deliveryRegion: ''
	};

	// 模拟：合同状态为「合同进行中」的租赁合同
	var activeContracts = [
		{
			contractId: 'c1',
			contractStatus: '合同进行中',
			projectId: 'p1',
			projectName: '嘉兴氢能示范项目',
			projectType: '租赁',
			contractCode: 'HT-ZL-2025-001',
			customerName: '嘉兴某某物流有限公司',
			deliveryRegion: '浙江省-嘉兴市'
		},
		{
			contractId: 'c2',
			contractStatus: '合同进行中',
			projectId: 'p2',
			projectName: '上海物流租赁项目',
			projectType: '租赁',
			contractCode: 'HT-ZL-2025-002',
			customerName: '上海某某运输公司',
			deliveryRegion: '上海市-上海市'
		},
		{
			contractId: 'c3',
			contractStatus: '合同进行中',
			projectId: 'p3',
			projectName: '杭州城配自营项目',
			projectType: '自营',
			contractCode: 'HT-ZY-2025-003',
			customerName: '杭州某某租赁有限公司',
			deliveryRegion: '浙江省-杭州市'
		}
	];

	var deliveredVehicles = [
		{ plateNo: '浙A12345', vin: 'LGHXCAE28M1234567', brand: '东风', model: 'DFH1180', contractId: 'c1', vehicleStatus: '已交车' },
		{ plateNo: '浙A55555', vin: 'LGHXCAE28M5555555', brand: '重汽', model: 'ZZ1160', contractId: 'c1', vehicleStatus: '已交车' },
		{ plateNo: '沪B11111', vin: 'LGHXCAE28M7654321', brand: '江淮', model: 'HFC1180', contractId: 'c2', vehicleStatus: '已交车' },
		{ plateNo: '浙C33333', vin: 'LGHXCAE28M8888888', brand: '东风', model: 'DFH1190', contractId: 'c3', vehicleStatus: '已交车' }
	];

	var preparedVehiclesByRegion = {
		'浙江省-嘉兴市': [
			{ plateNo: '浙A67890', vin: 'LGHXCAE28M6789012', brand: '福田', model: 'BJ1180', vehicleStatus: '已备车' },
			{ plateNo: '浙A66666', vin: 'LGHXCAE28M6666666', brand: '江淮', model: 'HFC1190', vehicleStatus: '已备车' },
			{ plateNo: '浙F88888', vin: 'LGHXCAE28M8888888', brand: '东风', model: 'DFH1180', vehicleStatus: '已备车' }
		],
		'上海市-上海市': [
			{ plateNo: '沪B22222', vin: 'LGHXCAE28M2222222', brand: '重汽', model: 'ZZ1180', vehicleStatus: '已备车' },
			{ plateNo: '沪B33333', vin: 'LGHXCAE28M3333333', brand: '福田', model: 'BJ1190', vehicleStatus: '已备车' }
		],
		'浙江省-杭州市': [
			{ plateNo: '浙C44444', vin: 'LGHXCAE28M4444444', brand: '东风', model: 'DFH1180', vehicleStatus: '已备车' }
		]
	};

	var contractById = useMemo(function () {
		var map = {};
		activeContracts.forEach(function (c) {
			if (c.contractStatus === '合同进行中') map[c.contractId] = c;
		});
		return map;
	}, []);

	var pairsState = useState(function () { return createMockPairs(); });
	var pairs = pairsState[0];
	var setPairs = pairsState[1];
	var editedState = useState(false);
	var setEdited = editedState[1];
	var cancelModalVisible = useState(false);
	var setCancelModalVisible = cancelModalVisible[1];
	var requirementModalVisible = useState(false);
	var setRequirementModalVisible = requirementModalVisible[1];

	var projectInfo = useMemo(function () {
		var anchor = pairs.find(function (p) { return p.originalPlate && p.contractId; });
		if (!anchor || !anchor.contractId) return EMPTY_PROJECT;
		var c = contractById[anchor.contractId];
		if (!c) return EMPTY_PROJECT;
		return {
			contractId: c.contractId,
			projectId: c.projectId,
			projectName: c.projectName,
			projectType: c.projectType,
			customerName: c.customerName,
			contractCode: c.contractCode,
			deliveryRegion: c.deliveryRegion
		};
	}, [pairs, contractById]);

	var plateFilterOption = useCallback(function (input, opt) {
		return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
	}, []);

	var getDeliveredVehicle = useCallback(function (plateNo) {
		return deliveredVehicles.find(function (v) { return v.plateNo === plateNo; }) || null;
	}, []);

	var getUsedPlates = useCallback(function (pairsList, field, exceptPairId) {
		var set = {};
		pairsList.forEach(function (p) {
			if (p.id === exceptPairId) return;
			if (p[field]) set[p[field]] = true;
		});
		return set;
	}, []);

	var selectedOriginalPlates = useMemo(function () {
		return pairs.map(function (p) { return p.originalPlate; }).filter(Boolean);
	}, [pairs]);

	var multiOldPlateOptions = useMemo(function () {
		var lockedContractId = projectInfo.contractId;
		return deliveredVehicles
			.filter(function (v) {
				if (v.vehicleStatus !== '已交车' || !contractById[v.contractId]) return false;
				if (lockedContractId && v.contractId !== lockedContractId) return false;
				return true;
			})
			.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, [projectInfo.contractId, contractById]);

	var getNewOptionsForPair = useCallback(function (pair) {
		if (!projectInfo.deliveryRegion) return [];
		var used = getUsedPlates(pairs, 'replacePlate', pair.id);
		var list = preparedVehiclesByRegion[projectInfo.deliveryRegion] || [];
		return list
			.filter(function (v) {
				return v.vehicleStatus === '已备车' && !used[v.plateNo];
			})
			.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, [pairs, projectInfo.deliveryRegion, getUsedPlates]);

	var updatePair = useCallback(function (pairId, patch) {
		setEdited(true);
		setPairs(function (prev) {
			return prev.map(function (p) {
				if (p.id !== pairId) return p;
				var next = {};
				for (var k in p) next[k] = p[k];
				for (var pk in patch) next[pk] = patch[pk];
				return next;
			});
		});
	}, []);

	var buildPairForPlate = useCallback(function (plateNo, existing) {
		var vehicle = getDeliveredVehicle(plateNo);
		if (!vehicle) return null;
		var row = existing ? Object.assign({}, existing) : createEmptyPair();
		row.originalPlate = plateNo;
		row.originalVin = vehicle.vin;
		row.originalBrand = vehicle.brand;
		row.originalModel = vehicle.model;
		row.contractId = vehicle.contractId;
		if (!existing) {
			row.replacePlate = undefined;
			row.replaceVin = '';
			row.replaceBrand = '';
			row.replaceModel = '';
		}
		return row;
	}, [getDeliveredVehicle]);

	var onMultiOriginalPlateChange = useCallback(function (plateNos) {
		var list = Array.isArray(plateNos) ? plateNos : [];
		if (list.length === 0) {
			setEdited(true);
			setPairs([]);
			return;
		}
		var anchorContractId = null;
		var validPlates = [];
		var rejected = false;
		list.forEach(function (plate) {
			var vehicle = getDeliveredVehicle(plate);
			if (!vehicle || !contractById[vehicle.contractId]) return;
			if (!anchorContractId) anchorContractId = vehicle.contractId;
			if (vehicle.contractId !== anchorContractId) {
				rejected = true;
				return;
			}
			validPlates.push(plate);
		});
		if (rejected) {
			message.warning('多台替换须为同一客户、同一项目，已忽略不同项目的车辆');
		}
		if (validPlates.length === 0) {
			setPairs([]);
			return;
		}
		setEdited(true);
		setPairs(function (prev) {
			var prevByPlate = {};
			prev.forEach(function (p) {
				if (p.originalPlate) prevByPlate[p.originalPlate] = p;
			});
			return validPlates.map(function (plate) {
				return buildPairForPlate(plate, prevByPlate[plate]);
			});
		});
	}, [getDeliveredVehicle, contractById, buildPairForPlate]);

	var onReplacePlateChange = useCallback(function (pairId, plateNo) {
		if (!plateNo) {
			updatePair(pairId, {
				replacePlate: undefined,
				replaceVin: '',
				replaceBrand: '',
				replaceModel: ''
			});
			return;
		}
		var pair = pairs.find(function (p) { return p.id === pairId; });
		if (!pair || !pair.originalPlate) {
			message.info('请先选择被替换车辆');
			return;
		}
		var list = preparedVehiclesByRegion[projectInfo.deliveryRegion] || [];
		var vehicle = list.find(function (v) { return v.plateNo === plateNo; });
		if (!vehicle) return;
		var used = getUsedPlates(pairs, 'replacePlate', pairId);
		if (used[plateNo]) {
			message.warning('该新车已在其他替换项中选择');
			return;
		}
		updatePair(pairId, {
			replacePlate: plateNo,
			replaceVin: vehicle.vin,
			replaceBrand: vehicle.brand,
			replaceModel: vehicle.model
		});
	}, [updatePair, pairs, projectInfo.deliveryRegion, getUsedPlates]);

	var handleSubmit = useCallback(function () {
		if (!pairs.length || !projectInfo.contractId) {
			message.warning('请选择被替换车辆并完善替换信息');
			return;
		}
		var incomplete = pairs.find(function (p) {
			if (!p.originalPlate || !p.replacePlate || !p.replaceType || !p.replaceReason) return true;
			if (p.replaceReason === '客户原因' && !(p.replaceFee || '').toString().trim()) return true;
			return false;
		});
		if (incomplete) {
			message.warning('请完善每条替换的新车、替换类型、替换原因及客户原因下的替换费用');
			return;
		}
		message.success('已提交 ' + pairs.length + ' 条替换车申请（原型）');
	}, [pairs, projectInfo.contractId]);

	var handleSave = useCallback(function () {
		message.success('已保存，该条数据仅您可查看并编辑（原型）');
	}, []);

	var handleCancel = useCallback(function () {
		if (editedState[0]) setCancelModalVisible(true);
		else message.info('返回替换车管理列表（原型）');
	}, [editedState[0]]);

	var confirmCancel = useCallback(function () {
		setCancelModalVisible(false);
		message.info('已取消，返回替换车管理列表（原型）');
	}, []);

	var pageCss =
		'.vr-add-page{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}' +
		'.vr-add-page .vr-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}' +
		'.vr-add-page .vr-main-card{border-radius:16px;border:none;box-shadow:0 4px 24px -6px rgba(15,23,42,0.08),0 0 0 1px rgba(15,23,42,0.05)}' +
		'.vr-add-page .vr-main-card>.ant-card-head{border-bottom:1px solid #f1f5f9;padding:16px 24px;min-height:auto}' +
		'.vr-add-page .vr-main-card>.ant-card-head .ant-card-head-title{font-size:16px;font-weight:600;color:#0f172a;padding:0}' +
		'.vr-add-page .vr-main-card>.ant-card-body{padding:20px 24px 24px}' +
		'.vr-add-page .vr-pair-list{display:flex;flex-direction:column;gap:16px}' +
		'.vr-add-page .vr-pair-card{border-radius:12px;border:1px solid #e2e8f0;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);overflow:hidden;transition:border-color .2s ease,box-shadow .2s ease}' +
		'.vr-add-page .vr-pair-card:hover{border-color:#93c5fd;box-shadow:0 4px 16px -4px rgba(22,119,255,0.12)}' +
		'.vr-add-page .vr-pair-card__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#f0f9ff;border-bottom:1px solid #e0f2fe}' +
		'.vr-add-page .vr-pair-card__title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#0f172a}' +
		'.vr-add-page .vr-pair-card__index{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 8px;border-radius:6px;background:#1677ff;color:#fff;font-size:12px;font-weight:700}' +
		'.vr-add-page .vr-pair-card__body{padding:16px}' +
		'.vr-add-page .vr-block{margin-bottom:14px}' +
		'.vr-add-page .vr-block:last-child{margin-bottom:0}' +
		'.vr-add-page .vr-block-label{font-size:12px;font-weight:600;color:#475569;margin-bottom:10px;letter-spacing:.02em}' +
		'.vr-add-page .vr-block-label--old{color:#b45309}' +
		'.vr-add-page .vr-block-label--new{color:#047857}' +
		'.vr-add-page .vr-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px}' +
		'.vr-add-page .vr-form-grid--reason .vr-field:last-child{grid-column:1/-1}' +
		'@media(max-width:900px){.vr-add-page .vr-form-grid{grid-template-columns:1fr}}' +
		'.vr-add-page .vr-field{display:flex;flex-direction:column;gap:6px;min-width:0}' +
		'.vr-add-page .vr-field__label{font-size:13px;font-weight:500;color:#334155;line-height:1.4}' +
		'.vr-add-page .vr-field__label .vr-req{color:#ef4444;margin-right:2px}' +
		'.vr-add-page .vr-swap-divider{display:flex;align-items:center;gap:12px;margin:14px 0;color:#94a3b8;font-size:12px;font-weight:500}' +
		'.vr-add-page .vr-swap-divider::before,.vr-add-page .vr-swap-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,#cbd5e1,transparent)}' +
		'.vr-add-page .vr-swap-divider__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#eff6ff;color:#1677ff;font-size:14px;flex-shrink:0}' +
		'.vr-add-page .vr-multi-pick{margin-bottom:20px;padding:16px 18px;border-radius:12px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(15,23,42,0.04)}' +
		'.vr-add-page .vr-multi-pick__title{font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px}' +
		'.vr-add-page .vr-multi-pick__hint{font-size:12px;color:#64748b;margin-bottom:12px;line-height:1.5}' +
		'.vr-add-page .vr-vehicle-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px;padding:12px 14px;margin-bottom:14px;border-radius:8px;background:#fffbeb;border:1px solid #fde68a}' +
		'@media(max-width:900px){.vr-add-page .vr-vehicle-summary{grid-template-columns:1fr}}' +
		'.vr-add-page .vr-pair-list-empty{padding:32px 16px;text-align:center;color:#94a3b8;font-size:13px}' +
		'.vr-add-page .vr-project-panel{margin-top:20px;padding:16px 18px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}' +
		'.vr-add-page .vr-project-panel__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}' +
		'.vr-add-page .vr-project-panel__title{font-size:14px;font-weight:600;color:#0f172a}' +
		'.vr-add-page .vr-project-panel__hint{font-size:12px;color:#64748b}' +
		'.vr-add-page .vr-project-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 20px}' +
		'@media(max-width:900px){.vr-add-page .vr-project-grid{grid-template-columns:1fr}}' +
		'.vr-add-page .vr-readonly{display:flex;flex-direction:column;gap:4px;min-width:0}' +
		'.vr-add-page .vr-readonly__label{font-size:12px;color:#64748b;font-weight:500}' +
		'.vr-add-page .vr-readonly__value{font-size:14px;color:#0f172a;font-weight:500;word-break:break-all}' +
		'.vr-add-page .vr-readonly__value--muted{color:#94a3b8;font-weight:400}' +
		'.vr-add-page .vr-footer{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9}' +
		'.vr-add-page .vr-remove-btn{color:#64748b!important}' +
		'.vr-add-page .vr-remove-btn:hover{color:#ef4444!important}' +
		'@media(prefers-reduced-motion:reduce){.vr-add-page .vr-pair-card{transition:none}}' +
		'.vr-req-doc{padding:4px 2px 8px}' +
		'.vr-req-doc__meta{font-size:12px;color:#64748b;line-height:1.6;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9}' +
		'.vr-req-doc__section{margin-bottom:20px}' +
		'.vr-req-doc__section:last-child{margin-bottom:0}' +
		'.vr-req-doc__title{font-size:15px;font-weight:600;color:#0f172a;margin:0 0 10px;line-height:1.4}' +
		'.vr-req-doc__line{font-size:13px;color:#475569;line-height:1.75;margin:0 0 6px;padding-left:0}' +
		'.vr-req-doc__line--sub{padding-left:14px;color:#64748b}' +
		'.vr-req-doc__line:last-child{margin-bottom:0}' +
		'.vr-req-doc__tag{display:inline-block;margin:0 4px 4px 0;padding:0 6px;font-size:12px;line-height:20px;border-radius:4px;background:#f1f5f9;color:#334155}';

	function specSection(title, lines) {
		return React.createElement(
			'section',
			{ className: 'vr-req-doc__section' },
			React.createElement('h3', { className: 'vr-req-doc__title' }, title),
			(lines || []).map(function (text, i) {
				var isSub = typeof text === 'string' && (text.indexOf('　') === 0 || /^\d+\.\d+/.test(text));
				return React.createElement(
					'p',
					{
						key: i,
						className: 'vr-req-doc__line' + (isSub ? ' vr-req-doc__line--sub' : '')
					},
					text
				);
			})
		);
	}

	function renderRequirementDoc() {
		return React.createElement(
			'div',
			{ className: 'vr-req-doc' },
			React.createElement(
				'div',
				{ className: 'vr-req-doc__meta' },
				'数字化资产 ONEOS 运管平台 · 运维管理 · 车辆业务 · 替换车管理 · 编辑'
			),
			specSection('1. 页面定位', [
				'用于编辑未提交、审批驳回或撤回状态的替换车申请，交互与新增页一致。',
				'支持多辆车替换明细编辑，须为同一客户、同一项目；项目信息在页面底部统一展示一份。'
			]),
			specSection('2. 导航与入口', [
				'面包屑：运维管理 / 车辆业务 / 替换车管理 / 编辑。',
				'右上角「查看需求说明」：打开本文档。',
				'主卡片标题：编辑替换车；已选被替换车时展示「N 辆车」数量标签。'
			]),
			specSection('3. 被替换车辆（多选）', [
				'3.1 车牌号：必填，多选下拉，支持输入关键词模糊搜索；占位「请输入或选择车牌号，可多选」。',
				'3.2 可选范围：合同状态为「合同进行中」的合同下，车辆状态为「已交车」的全部车辆。',
				'3.3 交互：每选中一辆自动生成一条「车辆替换」明细卡片；取消勾选则移除对应卡片。',
				'3.4 约束：多选车辆须属于同一合同（同一客户、同一项目）；若混入其他项目车辆，提示「多台替换须为同一客户、同一项目，已忽略不同项目的车辆」，且仅保留同项目车辆。',
				'3.5 锁定：首辆车选定后，后续多选仅展示同一合同下的已交车车辆。',
				'3.6 未选车时，下方展示空状态：「请在上方选择被替换车辆车牌号，将自动生成替换明细」。'
			]),
			specSection('4. 车辆替换明细（每条被替换车一张卡片）', [
				'4.1 卡片标题：序号 +「车辆替换」+ 被替换车牌号；若已选替换车，展示「→ 替换车牌号」。',
				'4.2 被替换车辆信息（只读）：车牌号、品牌、型号；品牌/型号占位「选择车辆后自动显示」。',
				'4.3 替换说明',
				'　4.3.1 替换类型：必填，单选——永久替换、临时替换。',
				'　4.3.2 替换原因：必填，单选——客户原因、车辆原因；选「客户原因」时右侧展示「替换费用」必填输入框（￥ 前缀，仅数字与小数点）。',
				'　4.3.3 替换原因说明：选填，多行文本，最多 500 字，占位「请说明替换原因」，显示字数统计。',
				'4.4 替换车辆',
				'　4.4.1 新车：必填，单选下拉，支持搜索；未选被替换车时禁用，占位「请先选择被替换车辆」。',
				'　4.4.2 已选被替换车后，占位展示交车区域，如「交车区域：浙江省-嘉兴市」。',
				'　4.4.3 可选范围：与被替换车所属合同「交车区域」停车场内，车辆状态为「已备车」的车辆。',
				'　4.4.4 同一申请内，各明细的替换车车牌号不可重复；重复时提示「该新车已在其他替换项中选择」。',
				'　4.4.5 品牌、型号：选择新车后自动反显，禁用编辑，占位「选择车辆后自动显示」。',
				'4.5 保留策略：取消多选某车牌时移除卡片；再次选中同一车牌时，若此前已填写替换说明/新车，尽量保留原填写内容。'
			]),
			specSection('5. 项目信息（全单共用一份）', [
				'5.1 展示时机：至少选择一辆被替换车后，根据所属合同自动反显。',
				'5.2 未选车时展示空状态：「选择被替换车辆后自动显示」。',
				'5.3 字段（均不可编辑）：客户名称、项目名称、项目类型（租赁 / 自营，标签展示）。'
			]),
			specSection('6. 替换类型业务规则', [
				'6.1 永久替换：审批通过后替换车交车（交车时间为流程结束当天），运维手动将被替换车还车。',
				'6.2 临时替换：审批通过后替换车交车；被替换车无需还车；被替换车重新交付客户后，运维手动将替换车还车。',
				'6.3 交车任务继承合同交车地点，由对应区域运维人员操作。',
				'6.4 交车完成后，租赁账单、提车应收等涉及被替换车的展示信息切换为替换车；临时替换在替换车还车后恢复原被替换车数据，永久替换由运维自主还车。'
			]),
			specSection('7. 底部操作', [
				'7.1 提交审核：校验规则同新增页；通过后 Toast「已提交 N 条替换车申请」。',
				'7.2 保存：不做必填校验，保存草稿，仅保存人可见可编辑（原型提示）。',
				'7.3 取消：有编辑内容时二次确认后返回列表；无编辑内容直接返回。'
			]),
			specSection('8. 与新增页差异', [
				'进入页面时反写已保存的申请数据（含多条替换明细）。',
				'被替换车辆多选、项目信息、卡片结构及校验规则与新增页保持一致。'
			]),
			specSection('9. 校验与提示汇总', [
				'请选择被替换车辆并完善替换信息',
				'请完善每条替换的新车、替换类型、替换原因及客户原因下的替换费用',
				'多台替换须为同一客户、同一项目，已忽略不同项目的车辆',
				'该新车已在其他替换项中选择',
				'请先选择被替换车辆'
			])
		);
	}

	function renderField(label, required, node) {
		return React.createElement(
			'div',
			{ className: 'vr-field' },
			React.createElement(
				'div',
				{ className: 'vr-field__label' },
				required ? React.createElement('span', { className: 'vr-req' }, '*') : null,
				label
			),
			node
		);
	}

	function renderMultiPickSection() {
		return React.createElement(
			'section',
			{ className: 'vr-multi-pick', 'aria-label': '选择被替换车辆' },
			React.createElement('div', { className: 'vr-multi-pick__title' }, '被替换车辆'),
			React.createElement(
				'div',
				{ className: 'vr-multi-pick__hint' },
				'车牌号支持多选，每选中一辆将生成一条替换明细；须为同一客户、同一项目。'
			),
			renderField(
				'车牌号',
				true,
				React.createElement(Select, {
					mode: 'multiple',
					placeholder: '请输入或选择车牌号，可多选',
					style: { width: '100%' },
					value: selectedOriginalPlates,
					onChange: onMultiOriginalPlateChange,
					allowClear: true,
					showSearch: true,
					options: multiOldPlateOptions,
					filterOption: plateFilterOption,
					optionFilterProp: 'label',
					maxTagCount: 'responsive'
				})
			)
		);
	}

	function renderPairCard(pair, index) {
		var newOptions = getNewOptionsForPair(pair);

		return React.createElement(
			'article',
			{ key: pair.id, className: 'vr-pair-card', 'aria-label': '替换车辆第' + (index + 1) + '项' },
			React.createElement(
				'div',
				{ className: 'vr-pair-card__head' },
				React.createElement(
					'div',
					{ className: 'vr-pair-card__title' },
					React.createElement('span', { className: 'vr-pair-card__index' }, index + 1),
					React.createElement('span', null, '车辆替换'),
					pair.originalPlate
						? React.createElement(Tag, { style: { margin: 0 } }, pair.originalPlate)
						: null,
					pair.originalPlate && pair.replacePlate
						? React.createElement(Tag, { color: 'processing', style: { margin: 0 } }, '→ ' + pair.replacePlate)
						: null
				)
			),
			React.createElement(
				'div',
				{ className: 'vr-pair-card__body' },
				React.createElement(
					'div',
					{ className: 'vr-vehicle-summary' },
					renderField(
						'车牌号',
						false,
						React.createElement(Input, {
							value: pair.originalPlate || '',
							disabled: true
						})
					),
					renderField(
						'品牌',
						false,
						React.createElement(Input, {
							value: pair.originalBrand || '',
							disabled: true,
							placeholder: '选择车辆后自动显示'
						})
					),
					renderField(
						'型号',
						false,
						React.createElement(Input, {
							value: pair.originalModel || '',
							disabled: true,
							placeholder: '选择车辆后自动显示'
						})
					)
				),
				React.createElement(
					'div',
					{ className: 'vr-block' },
					React.createElement('div', { className: 'vr-block-label' }, '替换说明'),
					React.createElement(
						'div',
						{ className: 'vr-form-grid vr-form-grid--reason' },
						renderField(
							'替换类型',
							true,
							React.createElement(Select, {
								placeholder: '请选择',
								style: { width: '100%' },
								value: pair.replaceType,
								onChange: function (v) { updatePair(pair.id, { replaceType: v }); },
								allowClear: true,
								options: [
									{ value: '永久替换', label: '永久替换' },
									{ value: '临时替换', label: '临时替换' }
								]
							})
						),
						renderField(
							'替换原因',
							true,
							React.createElement(Select, {
								placeholder: '请选择',
								style: { width: '100%' },
								value: pair.replaceReason,
								onChange: function (v) {
									updatePair(pair.id, {
										replaceReason: v,
										replaceFee: v === '客户原因' ? pair.replaceFee : ''
									});
								},
								allowClear: true,
								options: [
									{ value: '客户原因', label: '客户原因' },
									{ value: '车辆原因', label: '车辆原因' }
								]
							})
						),
						pair.replaceReason === '客户原因'
							? renderField(
								'替换费用',
								true,
								React.createElement(Input, {
									placeholder: '请输入替换费用',
									style: { width: '100%' },
									value: pair.replaceFee || '',
									addonBefore: '￥',
									onChange: function (e) {
										var val = e.target.value.replace(/[^\d.]/g, '');
										var parts = val.split('.');
										if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
										updatePair(pair.id, { replaceFee: val });
									}
								})
							)
							: null,
						renderField(
							'替换原因说明',
							false,
							React.createElement(Input.TextArea, {
								placeholder: '请说明替换原因',
								value: pair.replaceReasonDesc || '',
								onChange: function (e) { updatePair(pair.id, { replaceReasonDesc: e.target.value }); },
								rows: 2,
								style: { width: '100%' },
								maxLength: 500,
								showCount: true
							})
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'vr-swap-divider', role: 'presentation' },
					React.createElement('span', { className: 'vr-swap-divider__icon', 'aria-hidden': true }, '↓'),
					React.createElement('span', null, '替换为')
				),
				React.createElement(
					'div',
					{ className: 'vr-block' },
					React.createElement('div', { className: 'vr-block-label vr-block-label--new' }, '替换车辆'),
					React.createElement(
						'div',
						{ className: 'vr-form-grid' },
						renderField(
							'新车',
							true,
							React.createElement(Select, {
								placeholder: projectInfo.deliveryRegion
									? '交车区域：' + projectInfo.deliveryRegion
									: '请先选择被替换车辆',
								style: { width: '100%' },
								value: pair.replacePlate,
								onChange: function (v) { onReplacePlateChange(pair.id, v); },
								allowClear: true,
								showSearch: true,
								options: newOptions,
								filterOption: plateFilterOption,
								disabled: !pair.originalPlate,
								optionFilterProp: 'label'
							})
						),
						renderField(
							'品牌',
							false,
							React.createElement(Input, {
								value: pair.replaceBrand || '',
								disabled: true,
								placeholder: '选择车辆后自动显示'
							})
						),
						renderField(
							'型号',
							false,
							React.createElement(Input, {
								value: pair.replaceModel || '',
								disabled: true,
								placeholder: '选择车辆后自动显示'
							})
						)
					)
				)
			)
		);
	}

	function renderProjectPanel() {
		var hasProject = !!projectInfo.contractId;
		return React.createElement(
			'section',
			{ className: 'vr-project-panel', 'aria-label': '项目信息' },
			React.createElement(
				'div',
				{ className: 'vr-project-panel__head' },
				React.createElement('div', { className: 'vr-project-panel__title' }, '项目信息')
			),
			hasProject
				? React.createElement(
					'div',
					{ className: 'vr-project-grid' },
					React.createElement(
						'div',
						{ className: 'vr-readonly' },
						React.createElement('span', { className: 'vr-readonly__label' }, '客户名称'),
						React.createElement('span', { className: 'vr-readonly__value' }, projectInfo.customerName)
					),
					React.createElement(
						'div',
						{ className: 'vr-readonly' },
						React.createElement('span', { className: 'vr-readonly__label' }, '项目名称'),
						React.createElement('span', { className: 'vr-readonly__value' }, projectInfo.projectName)
					),
					React.createElement(
						'div',
						{ className: 'vr-readonly' },
						React.createElement('span', { className: 'vr-readonly__label' }, '项目类型'),
						React.createElement(
							'span',
							{ className: 'vr-readonly__value' },
							React.createElement(
								Tag,
								{ color: projectInfo.projectType === '自营' ? 'purple' : 'blue', style: { margin: 0 } },
								projectInfo.projectType
							)
						)
					)
				)
				: React.createElement(Empty, {
					image: Empty.PRESENTED_IMAGE_SIMPLE,
					description: '选择被替换车辆后自动显示'
				})
		);
	}

	return React.createElement(
		'div',
		{ className: 'vr-add-page', style: { padding: '20px 24px 32px', minHeight: '100vh', background: 'linear-gradient(165deg,#eef4ff 0%,#f5f7fa 42%,#f0f2f5 100%)' } },
		React.createElement('style', null, pageCss),
		React.createElement(
			'header',
			{ className: 'vr-page-header' },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '运维管理' },
					{ title: '车辆业务' },
					{ title: '替换车管理' },
					{ title: '编辑' }
				]
			}),
			React.createElement(
				Button,
				{ type: 'link', style: { padding: 0, flexShrink: 0 }, onClick: function () { setRequirementModalVisible(true); } },
				'查看需求说明'
			)
		),
		React.createElement(
			Card,
			{
				className: 'vr-main-card',
				title: React.createElement(
					'span',
					null,
					'编辑替换车 ',
					pairs.length > 0
						? React.createElement(Tag, { style: { marginLeft: 8, fontWeight: 400 } }, pairs.length + ' 辆车')
						: null
				)
			},
			renderMultiPickSection(),
			pairs.length > 0
				? React.createElement(
					'div',
					{ className: 'vr-pair-list' },
					pairs.map(function (pair, index) { return renderPairCard(pair, index); })
				)
				: React.createElement(
					'div',
					{ className: 'vr-pair-list-empty' },
					'请在上方选择被替换车辆车牌号，将自动生成替换明细'
				),
			renderProjectPanel(),
			React.createElement(
				'div',
				{ className: 'vr-footer' },
				React.createElement(Button, { type: 'primary', size: 'large', onClick: handleSubmit }, '提交审核'),
				React.createElement(Button, { size: 'large', onClick: handleSave }, '保存'),
				React.createElement(Button, { size: 'large', onClick: handleCancel }, '取消')
			)
		),
		React.createElement(Modal, {
			title: '替换车管理 - 编辑 · 需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { setRequirementModalVisible(false); },
			width: 760,
			footer: React.createElement(Button, { type: 'primary', onClick: function () { setRequirementModalVisible(false); } }, '关闭'),
			bodyStyle: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 }
		}, renderRequirementDoc()),
		React.createElement(Modal, {
			title: '取消将会丢失所有已填写内容，是否确认？',
			open: cancelModalVisible[0],
			onCancel: function () { setCancelModalVisible(false); },
			onOk: confirmCancel,
			okText: '确认',
			cancelText: '返回'
		})
	);
};
