// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 替换车管理（2026年3月3日版本）

var VR_KPI_STYLE = ''
	+ '.vr-kpi-stats-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px;}'
	+ '@media (max-width:768px){.vr-kpi-stats-row{grid-template-columns:repeat(1,minmax(0,1fr));}}'
	+ '.lc-alert-card{display:flex;align-items:flex-start;gap:12px;padding:14px 30px 14px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;position:relative;overflow:hidden;min-width:0;}'
	+ '.lc-alert-card-main{flex:1;min-width:0;}'
	+ '.lc-alert-card-icon{flex-shrink:0;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;}'
	+ '.lc-alert-card-val{font-size:26px;font-weight:800;line-height:1.1;color:#0f172a;font-variant-numeric:tabular-nums;}'
	+ '.lc-alert-card-title{font-size:13px;font-weight:600;color:#334155;margin-top:2px;}'
	+ '.lc-alert-card-tip-anchor{position:absolute;top:8px;right:8px;z-index:2;line-height:0;}'
	+ '.lc-alert-card-tip{width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#94a3b8;background:rgba(255,255,255,.92);border:1px solid #e2e8f0;cursor:help;line-height:0;}'
	+ '.lc-alert-card-tip:hover{color:#64748b;border-color:#cbd5e1;background:#fff;}'
	+ '.lc-alert-card--total{background:linear-gradient(135deg,#f8fafc 0%,#fff 100%);}'
	+ '.lc-alert-card--total .lc-alert-card-icon{background:#e2e8f0;color:#475569;}'
	+ '.lc-alert-card--progress{background:linear-gradient(135deg,#fff7ed 0%,#fff 55%);border-color:#fed7aa;}'
	+ '.lc-alert-card--progress .lc-alert-card-icon{background:#ffedd5;color:#ea580c;}'
	+ '.lc-alert-card--progress .lc-alert-card-val{color:#c2410c;}'
	+ '.lc-alert-card--completed{background:linear-gradient(135deg,#ecfdf5 0%,#fff 55%);border-color:#bbf7d0;}'
	+ '.lc-alert-card--completed .lc-alert-card-icon{background:#d1fae5;color:#059669;}'
	+ '.lc-alert-card--completed .lc-alert-card-val{color:#047857;}'
	+ '.lc-alert-card-clickable{cursor:pointer;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease;}'
	+ '.lc-alert-card-clickable:hover{box-shadow:0 4px 14px rgba(15,23,42,.08);}'
	+ '.lc-alert-card-active{box-shadow:0 0 0 2px rgba(22,93,255,.2)!important;border-color:#165dff!important;}';

var VR_KPI_ICONS = {
	total: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }),
		React.createElement('rect', { x: 14, y: 14, width: 7, height: 7 }), React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 })),
	progress: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('polyline', { points: '12 6 12 12 16 14' })),
	completed: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' }))
};

var VR_KPI_TIP_SVG = React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
	React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }));

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var Select = antd.Select;
	var Button = antd.Button;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;
	var Tag = antd.Tag;
	var Empty = antd.Empty;
	var App = antd.App;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;

	var RangePicker = DatePicker.RangePicker;

	// 筛选展开（默认一行 4 列，与交车管理一致）
	var _filterExpanded = useState(false);
	var _replaceDateRange = useState(null);
	var _replaceType = useState(undefined);
	var _projectName = useState(undefined);
	var _approvalStatus = useState(['全部']);
	var _originalPlate = useState(undefined);
	var _replacePlate = useState(undefined);
	var _replaceReason = useState(undefined);
	var _creator = useState(undefined);
	var _createTimeRange = useState(null);

	var _appliedFilter = useState({
		replaceDateRange: null,
		replaceType: undefined,
		projectName: undefined,
		approvalStatus: ['全部'],
		originalPlate: undefined,
		replacePlate: undefined,
		replaceReason: undefined,
		creator: undefined,
		createTimeRange: null
	});

	var _kpiFilter = useState('ongoing');
	var _listPlateQuick = useState(undefined);
	var _page = useState(1);
	var _pageSize = useState(10);
	var setPage = _page[1];
	var setPageSize = _pageSize[1];
	var _withdrawModalVisible = useState(false);
	var _withdrawModalRecord = useState(null);
	var _toPermanentModalVisible = useState(false);
	var _toPermanentModalRecord = useState(null);
	var _deleteModalVisible = useState(false);
	var _deleteModalRecord = useState(null);
	var _deletedIds = useState([]);
	var _requirementModalVisible = useState(false);

	function ensureReplaceDateTime(dateStr, fallbackTime) {
		if (!dateStr) return '';
		if (dateStr.length > 10) return dateStr;
		return dateStr + ' ' + (fallbackTime || '09:00:00');
	}

	function enrichListRow(row, timeSuffix) {
		var next = Object.assign({}, row);
		next.replaceDate = ensureReplaceDateTime(row.replaceDate, timeSuffix);
		if (!row.currentApprover) {
			if (row.approvalStatus === '审批中') next.currentApprover = '姚守涛';
			else if (row.approvalStatus === '待审批') next.currentApprover = '业务部主管';
			else if (row.approvalStatus === '审批驳回') next.currentApprover = '尚建华';
			else next.currentApprover = '—';
		}
		return next;
	}

	var replaceTypeOptions = [
		{ value: '永久替换', label: '永久替换' },
		{ value: '临时替换', label: '临时替换' }
	];
	var projectNameOptions = [
		{ value: '嘉兴氢能示范项目', label: '嘉兴氢能示范项目' },
		{ value: '上海物流租赁项目', label: '上海物流租赁项目' },
		{ value: '杭州城配租赁项目', label: '杭州城配租赁项目' }
	];
	var approvalStatusOptions = [
		{ value: '全部', label: '全部' },
		{ value: '待审批', label: '待审批' },
		{ value: '审批中', label: '审批中' },
		{ value: '审批驳回', label: '审批驳回' },
		{ value: '未提交', label: '未提交' },
		{ value: '撤回', label: '撤回' }
	];
	var plateOptions = [
		{ value: '浙A12345', label: '浙A12345' },
		{ value: '浙A67890', label: '浙A67890' },
		{ value: '浙B11111', label: '浙B11111' },
		{ value: '浙B22222', label: '浙B22222' },
		{ value: '浙C33333', label: '浙C33333' }
	];
	var replaceReasonOptions = [
		{ value: '全部', label: '全部' },
		{ value: '客户原因', label: '客户原因' },
		{ value: '车辆原因', label: '车辆原因' }
	];
	var creatorOptions = [
		{ value: '张三', label: '张三' },
		{ value: '李四', label: '李四' },
		{ value: '王五', label: '王五' },
		{ value: '赵六', label: '赵六' }
	];

	// 进行中：未结束、暂存，审批状态为 待审批、审批中、审批驳回、未提交、撤回
	var ongoingListRaw = [
		{ id: 'o1', replaceDate: '2025-03-05', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '待审批', currentApprover: '业务部主管', originalPlate: '浙A12345', originalBrand: '东风', originalModel: 'DFH1180', replacePlate: '浙A67890', replaceBrand: '福田', replaceModel: 'BJ1180', replaceReason: '车辆原因', replaceReasonDesc: '原车维修', creator: '张三', createTime: '2025-03-01 10:00:00' },
		{ id: 'o2', replaceDate: '2025-03-06', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '审批中', currentApprover: '姚守涛', originalPlate: '浙B11111', originalBrand: '江淮', originalModel: 'HFC1180', replacePlate: '浙B22222', replaceBrand: '重汽', replaceModel: 'ZZ1180', replaceReason: '客户原因', replaceReasonDesc: '客户要求换型', creator: '李四', createTime: '2025-03-01 14:30:00' },
		{ id: 'o3', replaceDate: '2025-03-07', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '审批驳回', currentApprover: '尚建华', originalPlate: '浙C33333', originalBrand: '东风', originalModel: 'DFH1190', replacePlate: '浙C44444', replaceBrand: '福田', replaceModel: 'BJ1190', replaceReason: '车辆原因', replaceReasonDesc: '事故替换', creator: '王五', createTime: '2025-03-02 09:15:00' },
		{ id: 'o4', replaceDate: '2025-03-08', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '未提交', currentApprover: '—', originalPlate: '浙A55555', originalBrand: '重汽', originalModel: 'ZZ1160', replacePlate: '浙A66666', replaceBrand: '江淮', replaceModel: 'HFC1190', replaceReason: '车辆原因', replaceReasonDesc: '保养替换', creator: '赵六', createTime: '2025-03-02 16:00:00' },
		{ id: 'o5', replaceDate: '2025-03-09', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '撤回', currentApprover: '—', originalPlate: '浙F77777', originalBrand: '福田', originalModel: 'BJ1180', replacePlate: '浙F88888', replaceBrand: '东风', replaceModel: 'DFH1180', replaceReason: '客户原因', replaceReasonDesc: '年检替换', creator: '张三', createTime: '2025-03-03 11:20:00' },
		{ id: 'o6', replaceDate: '2025-03-10', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '待审批', originalPlate: '浙A11201', originalBrand: '江淮', originalModel: 'HFC1160', replacePlate: '浙A11202', replaceBrand: '东风', replaceModel: 'DFH1160', replaceReason: '车辆原因', replaceReasonDesc: '发动机故障', creator: '李四', createTime: '2025-03-04 08:45' },
		{ id: 'o7', replaceDate: '2025-03-11', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批中', originalPlate: '浙B22301', originalBrand: '重汽', originalModel: 'ZZ1160', replacePlate: '浙B22302', replaceBrand: '福田', replaceModel: 'BJ1160', replaceReason: '客户原因', replaceReasonDesc: '临时增运力', creator: '王五', createTime: '2025-03-04 13:00' },
		{ id: 'o8', replaceDate: '2025-03-12', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '审批驳回', originalPlate: '浙C33401', originalBrand: '东风', originalModel: 'DFH1190', replacePlate: '浙C33402', replaceBrand: '江淮', replaceModel: 'HFC1190', replaceReason: '车辆原因', replaceReasonDesc: '底盘大修', creator: '赵六', createTime: '2025-03-05 10:20' },
		{ id: 'o9', replaceDate: '2025-03-13', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '未提交', originalPlate: '浙D44501', originalBrand: '福田', originalModel: 'BJ1180', replacePlate: '浙D44502', replaceBrand: '重汽', replaceModel: 'ZZ1180', replaceReason: '客户原因', replaceReasonDesc: '线路调整', creator: '张三', createTime: '2025-03-05 15:30' },
		{ id: 'o10', replaceDate: '2025-03-14', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '撤回', originalPlate: '浙E55601', originalBrand: '江淮', originalModel: 'HFC1180', replacePlate: '浙E55602', replaceBrand: '东风', replaceModel: 'DFH1180', replaceReason: '车辆原因', replaceReasonDesc: '轮胎更换', creator: '李四', createTime: '2025-03-06 09:00' },
		{ id: 'o11', replaceDate: '2025-03-15', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '待审批', originalPlate: '浙F66701', originalBrand: '重汽', originalModel: 'ZZ1190', replacePlate: '浙F66702', replaceBrand: '福田', replaceModel: 'BJ1190', replaceReason: '车辆原因', replaceReasonDesc: '电瓶更换', creator: '王五', createTime: '2025-03-06 14:15' },
		{ id: 'o12', replaceDate: '2025-03-16', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '审批中', originalPlate: '浙A77801', originalBrand: '东风', originalModel: 'DFH1160', replacePlate: '浙A77802', replaceBrand: '江淮', replaceModel: 'HFC1160', replaceReason: '客户原因', replaceReasonDesc: '合同到期换车', creator: '赵六', createTime: '2025-03-07 11:00' },
		{ id: 'o13', replaceDate: '2025-03-17', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批驳回', originalPlate: '浙B88901', originalBrand: '福田', originalModel: 'BJ1160', replacePlate: '浙B88902', replaceBrand: '重汽', replaceModel: 'ZZ1160', replaceReason: '车辆原因', replaceReasonDesc: '制动系统检修', creator: '张三', createTime: '2025-03-07 16:45' },
		{ id: 'o14', replaceDate: '2025-03-18', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '未提交', originalPlate: '浙C99001', originalBrand: '江淮', originalModel: 'HFC1190', replacePlate: '浙C99002', replaceBrand: '东风', replaceModel: 'DFH1190', replaceReason: '客户原因', replaceReasonDesc: '运量增加', creator: '李四', createTime: '2025-03-08 08:30' },
		{ id: 'o15', replaceDate: '2025-03-19', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '撤回', originalPlate: '浙D10101', originalBrand: '重汽', originalModel: 'ZZ1180', replacePlate: '浙D10102', replaceBrand: '福田', replaceModel: 'BJ1180', replaceReason: '车辆原因', replaceReasonDesc: '空调维修', creator: '王五', createTime: '2025-03-08 12:00' },
		{ id: 'o16', replaceDate: '2025-03-20', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '待审批', originalPlate: '浙E20201', originalBrand: '东风', originalModel: 'DFH1180', replacePlate: '浙E20202', replaceBrand: '江淮', replaceModel: 'HFC1180', replaceReason: '车辆原因', replaceReasonDesc: '变速箱故障', creator: '赵六', createTime: '2025-03-09 10:20' },
		{ id: 'o17', replaceDate: '2025-03-21', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '审批中', originalPlate: '浙F30301', originalBrand: '福田', originalModel: 'BJ1190', replacePlate: '浙F30302', replaceBrand: '重汽', replaceModel: 'ZZ1190', replaceReason: '客户原因', replaceReasonDesc: '区域调配', creator: '张三', createTime: '2025-03-09 15:00' },
		{ id: 'o18', replaceDate: '2025-03-22', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '审批驳回', originalPlate: '浙A40401', originalBrand: '江淮', originalModel: 'HFC1160', replacePlate: '浙A40402', replaceBrand: '东风', replaceModel: 'DFH1160', replaceReason: '车辆原因', replaceReasonDesc: '车身锈蚀', creator: '李四', createTime: '2025-03-10 09:45' },
		{ id: 'o19', replaceDate: '2025-03-23', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '未提交', originalPlate: '浙B50501', originalBrand: '重汽', originalModel: 'ZZ1160', replacePlate: '浙B50502', replaceBrand: '福田', replaceModel: 'BJ1160', replaceReason: '客户原因', replaceReasonDesc: '试运行换车', creator: '王五', createTime: '2025-03-10 14:30' },
		{ id: 'o20', replaceDate: '2025-03-24', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '撤回', currentApprover: '—', originalPlate: '浙C60601', originalBrand: '东风', originalModel: 'DFH1190', replacePlate: '浙C60602', replaceBrand: '江淮', replaceModel: 'HFC1190', replaceReason: '车辆原因', replaceReasonDesc: '排放升级', creator: '赵六', createTime: '2025-03-11 11:15:00' }
	];
	function pad2(n) { return n < 10 ? '0' + n : String(n); }
	var ongoingList = ongoingListRaw.map(function (r, i) {
		return enrichListRow(r, pad2(8 + (i % 12)) + ':' + pad2((i * 7) % 60) + ':00');
	});

	// 历史记录：审批完成，审批状态均为审批完成
	var historyListRaw = [
		{ id: 'h1', replaceDate: '2025-02-15', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', currentApprover: '—', originalPlate: '浙A10001', originalBrand: '东风', originalModel: 'DFH1180', replacePlate: '浙A10002', replaceBrand: '福田', replaceModel: 'BJ1180', replaceReason: '车辆原因', replaceReasonDesc: '原车报废', creator: '张三', createTime: '2025-02-10 09:00:00' },
		{ id: 'h2', replaceDate: '2025-02-14', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B20001', originalBrand: '江淮', originalModel: 'HFC1180', replacePlate: '浙B20002', replaceBrand: '重汽', replaceModel: 'ZZ1180', replaceReason: '客户原因', replaceReasonDesc: '客户临时需求', creator: '李四', createTime: '2025-02-09 14:00' },
		{ id: 'h3', replaceDate: '2025-02-13', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C30001', originalBrand: '重汽', originalModel: 'ZZ1160', replacePlate: '浙C30002', replaceBrand: '东风', replaceModel: 'DFH1160', replaceReason: '车辆原因', replaceReasonDesc: '使用年限到期', creator: '王五', createTime: '2025-02-08 10:30' },
		{ id: 'h4', replaceDate: '2025-02-12', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A40001', originalBrand: '福田', originalModel: 'BJ1180', replacePlate: '浙A40002', replaceBrand: '江淮', replaceModel: 'HFC1180', replaceReason: '客户原因', replaceReasonDesc: '旺季加车', creator: '赵六', createTime: '2025-02-07 15:20' },
		{ id: 'h5', replaceDate: '2025-02-11', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B50001', originalBrand: '东风', originalModel: 'DFH1190', replacePlate: '浙B50002', replaceBrand: '重汽', replaceModel: 'ZZ1190', replaceReason: '车辆原因', replaceReasonDesc: '事故车置换', creator: '张三', createTime: '2025-02-06 08:45' },
		{ id: 'h6', replaceDate: '2025-02-10', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C60001', originalBrand: '江淮', originalModel: 'HFC1160', replacePlate: '浙C60002', replaceBrand: '福田', replaceModel: 'BJ1160', replaceReason: '客户原因', replaceReasonDesc: '临时项目', creator: '李四', createTime: '2025-02-05 11:00' },
		{ id: 'h7', replaceDate: '2025-02-09', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A70001', originalBrand: '重汽', originalModel: 'ZZ1180', replacePlate: '浙A70002', replaceBrand: '东风', replaceModel: 'DFH1180', replaceReason: '车辆原因', replaceReasonDesc: '维修成本过高', creator: '王五', createTime: '2025-02-04 14:15' },
		{ id: 'h8', replaceDate: '2025-02-08', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B80001', originalBrand: '福田', originalModel: 'BJ1190', replacePlate: '浙B80002', replaceBrand: '江淮', replaceModel: 'HFC1190', replaceReason: '客户原因', replaceReasonDesc: '车型升级', creator: '赵六', createTime: '2025-02-03 09:30' },
		{ id: 'h9', replaceDate: '2025-02-07', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C90001', originalBrand: '东风', originalModel: 'DFH1160', replacePlate: '浙C90002', replaceBrand: '重汽', replaceModel: 'ZZ1160', replaceReason: '车辆原因', replaceReasonDesc: '年检未过', creator: '张三', createTime: '2025-02-02 16:00' },
		{ id: 'h10', replaceDate: '2025-02-06', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A01001', originalBrand: '江淮', originalModel: 'HFC1180', replacePlate: '浙A01002', replaceBrand: '福田', replaceModel: 'BJ1180', replaceReason: '客户原因', replaceReasonDesc: '运力不足', creator: '李四', createTime: '2025-02-01 10:45' },
		{ id: 'h11', replaceDate: '2025-02-05', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B02001', originalBrand: '重汽', originalModel: 'ZZ1190', replacePlate: '浙B02002', replaceBrand: '东风', replaceModel: 'DFH1190', replaceReason: '车辆原因', replaceReasonDesc: '尾气不达标', creator: '王五', createTime: '2025-01-31 13:20' },
		{ id: 'h12', replaceDate: '2025-02-04', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C03001', originalBrand: '福田', originalModel: 'BJ1160', replacePlate: '浙C03002', replaceBrand: '江淮', replaceModel: 'HFC1160', replaceReason: '客户原因', replaceReasonDesc: '线路拓展', creator: '赵六', createTime: '2025-01-30 08:00' },
		{ id: 'h13', replaceDate: '2025-02-03', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A04001', originalBrand: '东风', originalModel: 'DFH1180', replacePlate: '浙A04002', replaceBrand: '重汽', replaceModel: 'ZZ1180', replaceReason: '车辆原因', replaceReasonDesc: '核心部件损坏', creator: '张三', createTime: '2025-01-29 11:30' },
		{ id: 'h14', replaceDate: '2025-02-02', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B05001', originalBrand: '江淮', originalModel: 'HFC1190', replacePlate: '浙B05002', replaceBrand: '福田', replaceModel: 'BJ1190', replaceReason: '客户原因', replaceReasonDesc: '季节性需求', creator: '李四', createTime: '2025-01-28 15:45' },
		{ id: 'h15', replaceDate: '2025-02-01', replaceType: '永久替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C06001', originalBrand: '重汽', originalModel: 'ZZ1160', replacePlate: '浙C06002', replaceBrand: '东风', replaceModel: 'DFH1160', replaceReason: '车辆原因', replaceReasonDesc: '保险拒保', creator: '王五', createTime: '2025-01-27 09:15' },
		{ id: 'h16', replaceDate: '2025-01-31', replaceType: '临时替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A07001', originalBrand: '福田', originalModel: 'BJ1180', replacePlate: '浙A07002', replaceBrand: '江淮', replaceModel: 'HFC1180', replaceReason: '客户原因', replaceReasonDesc: '合作试运行', creator: '赵六', createTime: '2025-01-26 12:00' },
		{ id: 'h17', replaceDate: '2025-01-30', replaceType: '永久替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', originalPlate: '浙B08001', originalBrand: '东风', originalModel: 'DFH1190', replacePlate: '浙B08002', replaceBrand: '重汽', replaceModel: 'ZZ1190', replaceReason: '车辆原因', replaceReasonDesc: '油耗过高', creator: '张三', createTime: '2025-01-25 14:30' },
		{ id: 'h18', replaceDate: '2025-01-29', replaceType: '临时替换', projectName: '杭州城配租赁项目', approvalStatus: '审批完成', originalPlate: '浙C09001', originalBrand: '江淮', originalModel: 'HFC1160', replacePlate: '浙C09002', replaceBrand: '福田', replaceModel: 'BJ1160', replaceReason: '客户原因', replaceReasonDesc: '活动保障', creator: '李四', createTime: '2025-01-24 10:20' },
		{ id: 'h19', replaceDate: '2025-01-28', replaceType: '永久替换', projectName: '嘉兴氢能示范项目', approvalStatus: '审批完成', originalPlate: '浙A10003', originalBrand: '重汽', originalModel: 'ZZ1180', replacePlate: '浙A10004', replaceBrand: '东风', replaceModel: 'DFH1180', replaceReason: '车辆原因', replaceReasonDesc: '配件停产', creator: '王五', createTime: '2025-01-23 16:45' },
		{ id: 'h20', replaceDate: '2025-01-27', replaceType: '临时替换', projectName: '上海物流租赁项目', approvalStatus: '审批完成', currentApprover: '—', originalPlate: '浙B11001', originalBrand: '福田', originalModel: 'BJ1190', replacePlate: '浙B11002', replaceBrand: '江淮', replaceModel: 'HFC1190', replaceReason: '客户原因', replaceReasonDesc: '新业务启动', creator: '赵六', createTime: '2025-01-22 08:30:00' }
	];
	var historyList = historyListRaw.map(function (r, i) {
		return enrichListRow(r, pad2(10 + (i % 10)) + ':' + pad2((i * 5) % 60) + ':00');
	});

	var deletedIds = _deletedIds[0];
	var appliedFilter = _appliedFilter[0];
	var listPlateQuick = _listPlateQuick[0];
	var kpiFilter = _kpiFilter[0];

	function matchAppliedFilters(r, filter, quickPlate) {
		if (deletedIds.indexOf(r.id) !== -1) return false;
		if (filter.replaceDateRange && filter.replaceDateRange.length === 2) {
			var start = filter.replaceDateRange[0] && filter.replaceDateRange[0].format ? filter.replaceDateRange[0].format('YYYY-MM-DD') : '';
			var end = filter.replaceDateRange[1] && filter.replaceDateRange[1].format ? filter.replaceDateRange[1].format('YYYY-MM-DD') : '';
			var rd = (r.replaceDate || '').slice(0, 10);
			if (start && rd < start) return false;
			if (end && rd > end) return false;
		}
		if (filter.replaceType && r.replaceType !== filter.replaceType) return false;
		if (filter.projectName && r.projectName !== filter.projectName) return false;
		var approval = filter.approvalStatus;
		if (approval && approval.length > 0 && approval.indexOf('全部') === -1 && approval.indexOf(r.approvalStatus) === -1) return false;
		if (filter.originalPlate && (r.originalPlate || '').indexOf(filter.originalPlate) === -1) return false;
		if (filter.replacePlate && (r.replacePlate || '').indexOf(filter.replacePlate) === -1) return false;
		if (filter.replaceReason && filter.replaceReason !== '全部' && r.replaceReason !== filter.replaceReason) return false;
		if (filter.creator && r.creator !== filter.creator) return false;
		if (filter.createTimeRange && filter.createTimeRange.length === 2) {
			var cs = filter.createTimeRange[0] && filter.createTimeRange[0].format ? filter.createTimeRange[0].format('YYYY-MM-DD') : '';
			var ce = filter.createTimeRange[1] && filter.createTimeRange[1].format ? filter.createTimeRange[1].format('YYYY-MM-DD') : '';
			var ct = (r.createTime || '').slice(0, 10);
			if (cs && ct < cs) return false;
			if (ce && ct > ce) return false;
		}
		if (quickPlate && (r.originalPlate || '').indexOf(quickPlate) === -1 && (r.replacePlate || '').indexOf(quickPlate) === -1) return false;
		return true;
	}

	var filteredBuckets = useMemo(function () {
		var ongoing = ongoingList.filter(function (r) { return matchAppliedFilters(r, appliedFilter, listPlateQuick); });
		var history = historyList.filter(function (r) { return matchAppliedFilters(r, appliedFilter, listPlateQuick); });
		var all = ongoing.concat(history).sort(function (a, b) {
			return String(b.replaceDate || '').localeCompare(String(a.replaceDate || ''));
		});
		return { ongoing: ongoing, history: history, all: all };
	}, [appliedFilter, deletedIds, listPlateQuick]);

	var kpiStats = useMemo(function () {
		return {
			total: filteredBuckets.all.length,
			ongoing: filteredBuckets.ongoing.length,
			history: filteredBuckets.history.length
		};
	}, [filteredBuckets]);

	var currentList = useMemo(function () {
		if (kpiFilter === 'history') return filteredBuckets.history;
		if (kpiFilter === 'total') return filteredBuckets.all;
		return filteredBuckets.ongoing;
	}, [filteredBuckets, kpiFilter]);

	var handleQuery = useCallback(function () {
		_appliedFilter[1]({
			replaceDateRange: _replaceDateRange[0],
			replaceType: _replaceType[0],
			projectName: _projectName[0],
			approvalStatus: _approvalStatus[0] ? _approvalStatus[0].slice() : ['全部'],
			originalPlate: _originalPlate[0],
			replacePlate: _replacePlate[0],
			replaceReason: _replaceReason[0],
			creator: _creator[0],
			createTimeRange: _createTimeRange[0]
		});
		setPage(1);
	}, []);

	var handleReset = useCallback(function () {
		_replaceDateRange[1](null);
		_replaceType[1](undefined);
		_projectName[1](undefined);
		_approvalStatus[1](['全部']);
		_originalPlate[1](undefined);
		_replacePlate[1](undefined);
		_replaceReason[1](undefined);
		_creator[1](undefined);
		_createTimeRange[1](null);
		_appliedFilter[1]({
			replaceDateRange: null,
			replaceType: undefined,
			projectName: undefined,
			approvalStatus: ['全部'],
			originalPlate: undefined,
			replacePlate: undefined,
			replaceReason: undefined,
			creator: undefined,
			createTimeRange: null
		});
		setPage(1);
	}, []);

	var handleApprovalStatusChange = useCallback(function (v) {
		if (!v || v.length === 0) { _approvalStatus[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _approvalStatus[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			_approvalStatus[1](hadAllOnly ? v.filter(function (x) { return x !== '全部'; }) : ['全部']);
			return;
		}
		_approvalStatus[1](v);
	}, []);

	var filterLabelStyle = { display: 'block', marginBottom: 4, color: '#333', fontSize: 14 };
	var filterItemStyle = { minWidth: 0 };
	var filterControlStyle = { width: '100%' };

	var styles = {
		page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontSize: 14 },
		cardBody: { padding: '20px 24px' },
		filterGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' },
		filterActions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }
	};

	var pageStyles =
		'.vr-approval-flow-popover .ant-popover-inner{padding:14px 16px;border-radius:8px}' +
		'.vr-approval-flow{width:300px;max-width:min(340px,92vw)}' +
		'.vr-approval-flow__item{display:flex;gap:12px;position:relative;padding-bottom:22px}' +
		'.vr-approval-flow__item:last-child{padding-bottom:0}' +
		'.vr-approval-flow__item:not(:last-child) .vr-approval-flow__line{position:absolute;left:15px;top:34px;bottom:0;width:2px;background:#e5e7eb}' +
		'.vr-approval-flow__avatar-wrap{position:relative;flex-shrink:0;z-index:1}' +
		'.vr-approval-flow__avatar{width:32px;height:32px;border-radius:50%;background:#1677ff;color:#fff;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1}' +
		'.vr-approval-flow__body{flex:1;min-width:0;padding-top:2px}' +
		'.vr-approval-flow__head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px}' +
		'.vr-approval-flow__role{font-size:14px;font-weight:600;color:rgba(0,0,0,0.88);line-height:1.4}' +
		'.vr-approval-flow__meta{font-size:12px;color:rgba(0,0,0,0.45);line-height:1.5}' +
		'.vr-approval-status-trigger{display:inline-flex;cursor:pointer;border-radius:4px;transition:opacity .15s ease}' +
		'.vr-approval-status-trigger:hover{opacity:.88}' +
		'@media(max-width:900px){.vr-list-filter-grid{grid-template-columns:1fr 1fr!important}}' +
		'@media(max-width:640px){.vr-list-filter-grid{grid-template-columns:1fr!important}}';

	var cellLineMainStyle = { lineHeight: 1.45, color: '#333', wordBreak: 'break-all' };
	var cellLineSubStyle = { lineHeight: 1.4, fontSize: 12, color: '#8c8c8c', marginTop: 2, wordBreak: 'break-all' };
	var solidTagBaseStyle = { margin: 0, border: 'none', fontWeight: 600, color: '#fff', lineHeight: '20px', flexShrink: 0 };

	function renderCellLines(mainText, subLines) {
		var subs = subLines || [];
		return React.createElement('div', null,
			React.createElement('div', { style: cellLineMainStyle }, mainText || '—'),
			subs.map(function (line, i) {
				return React.createElement('div', { key: i, style: cellLineSubStyle }, line || '—');
			})
		);
	}

	function displayBrandModel(brand, model) {
		var b = brand && brand !== '—' ? String(brand).trim() : '';
		var m = model && model !== '—' ? String(model).trim() : '';
		if (b && m) return b + ' · ' + m;
		if (b) return b;
		if (m) return m;
		return '—';
	}

	function parseDateTimeParts(raw) {
		if (!raw) return { date: '—', time: '—' };
		var s = String(raw).trim();
		if (s.indexOf(' ') >= 0) {
			var parts = s.split(/\s+/);
			var timePart = parts[1] || '—';
			if (timePart.length >= 8) timePart = timePart.slice(0, 8);
			else if (timePart.length >= 5) timePart = timePart.slice(0, 5);
			return { date: parts[0] || '—', time: timePart };
		}
		return { date: s.slice(0, 10), time: '—' };
	}

	function formatFlowTime(timeStr) {
		if (!timeStr) return '—';
		var s = String(timeStr).trim();
		if (s.length >= 19) return s.slice(0, 19);
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(s)) return s + ':00';
		return s;
	}

	function offsetFlowTime(timeStr, minutes) {
		if (!timeStr) return '—';
		var s = String(timeStr).trim().replace(/-/g, '/');
		var d = new Date(s);
		if (isNaN(d.getTime())) return formatFlowTime(timeStr);
		d.setMinutes(d.getMinutes() + (minutes || 0));
		function p2(n) { return n < 10 ? '0' + n : '' + n; }
		return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
	}

	function getApproverRoleTitle(approverName) {
		if (approverName === '姚守涛') return '业务部主管';
		if (approverName === '尚建华') return '事业部主管';
		if (approverName === '业务部主管') return '业务部主管';
		return '运维主管';
	}

	function getApprovalFlowSteps(record) {
		var creator = record.creator || '张三';
		var createTime = formatFlowTime(record.createTime);
		var approver = record.currentApprover || '姚守涛';
		var approverPerson = approver === '业务部主管' ? '姚守涛' : approver;
		var roleTitle = getApproverRoleTitle(approver);
		var avatarFromName = function (name) {
			var n = String(name || '').trim();
			if (!n || n === '—') return '用户';
			return n.length >= 2 ? n.slice(-2) : n;
		};
		var steps = [
			{
				role: roleTitle,
				actionLabel: '审批中',
				tagColor: 'processing',
				person: approverPerson,
				time: '待处理',
				avatarText: avatarFromName(approverPerson)
			},
			{
				role: '发起审批',
				actionLabel: '通过',
				tagColor: 'success',
				person: creator,
				time: createTime,
				avatarText: avatarFromName(creator)
			}
		];
		if (roleTitle === '运维主管') {
			steps.splice(1, 0, {
				role: '业务部主管',
				actionLabel: '通过',
				tagColor: 'success',
				person: '尚建华',
				time: offsetFlowTime(record.createTime, 1),
				avatarText: '建华'
			});
		}
		return steps;
	}

	function renderApprovalFlowContent(record) {
		var steps = getApprovalFlowSteps(record);
		return React.createElement('div', { className: 'vr-approval-flow' },
			steps.map(function (step, idx) {
				return React.createElement('div', { key: idx, className: 'vr-approval-flow__item' },
					React.createElement('div', { className: 'vr-approval-flow__avatar-wrap' },
						React.createElement('span', { className: 'vr-approval-flow__avatar', title: step.person }, step.avatarText),
						idx < steps.length - 1 ? React.createElement('span', { className: 'vr-approval-flow__line' }) : null
					),
					React.createElement('div', { className: 'vr-approval-flow__body' },
						React.createElement('div', { className: 'vr-approval-flow__head' },
							React.createElement('span', { className: 'vr-approval-flow__role' }, step.role),
							React.createElement(Tag, { color: step.tagColor, style: { margin: 0, fontSize: 12, lineHeight: '20px' } }, step.actionLabel)
						),
						React.createElement('div', { className: 'vr-approval-flow__meta' },
							step.person + '　' + step.time
						)
					)
				);
			})
		);
	}

	function renderApprovalStatusCell(status, record) {
		var tag = renderApprovalTag(status);
		if (status !== '审批中' || !record) return tag;
		return React.createElement(Popover, {
			content: renderApprovalFlowContent(record),
			trigger: 'hover',
			placement: 'rightTop',
			overlayClassName: 'vr-approval-flow-popover',
			mouseEnterDelay: 0.15,
			mouseLeaveDelay: 0.12,
			destroyTooltipOnHide: true
		}, React.createElement('span', { className: 'vr-approval-status-trigger' }, tag));
	}

	function renderSolidTag(text, bgColor) {
		if (!text || text === '—') return '—';
		return React.createElement(Tag, {
			style: Object.assign({}, solidTagBaseStyle, { backgroundColor: bgColor || '#64748b' })
		}, text);
	}

	function renderApprovalTag(status) {
		var bg = '#8c8c8c';
		if (status === '待审批') bg = '#2563eb';
		else if (status === '审批中') bg = '#1677ff';
		else if (status === '审批驳回') bg = '#dc2626';
		else if (status === '未提交') bg = '#64748b';
		else if (status === '撤回') bg = '#d97706';
		else if (status === '审批完成') bg = '#16a34a';
		return renderSolidTag(status || '—', bg);
	}

	function renderReplaceTypeTag(type) {
		var bg = '#64748b';
		if (type === '永久替换') bg = '#4f46e5';
		else if (type === '临时替换') bg = '#ea580c';
		return renderSolidTag(type || '—', bg);
	}

	function renderReplaceVehicleCell(record) {
		return React.createElement('div', null,
			React.createElement('div', { style: Object.assign({}, cellLineMainStyle, { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }) },
				React.createElement('span', { style: { fontWeight: 600 } }, record.originalPlate || '—'),
				React.createElement('span', { style: { color: '#94a3b8', fontWeight: 600 } }, '→'),
				React.createElement('span', { style: { fontWeight: 600, color: '#165dff' } }, record.replacePlate || '—')
			),
			React.createElement('div', { style: cellLineSubStyle }, displayBrandModel(record.originalBrand, record.originalModel)),
			React.createElement('div', { style: cellLineSubStyle }, displayBrandModel(record.replaceBrand, record.replaceModel))
		);
	}

	function renderProjectInfoCell(record) {
		return React.createElement('div', { style: { minWidth: 0 } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 } },
				React.createElement('span', {
					style: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333', fontWeight: 600 }
				}, record.projectName || '—'),
				renderReplaceTypeTag(record.replaceType)
			),
			React.createElement('div', { style: cellLineSubStyle }, record.replaceReason || '—')
		);
	}

	function renderApprovalInfoCell(status, record) {
		var tag = renderApprovalStatusCell(status, record);
		var approver = record.currentApprover && record.currentApprover !== '—' ? record.currentApprover : '—';
		return React.createElement('div', null,
			React.createElement('div', null, tag),
			React.createElement('div', { style: cellLineSubStyle }, '当前审批人：' + approver)
		);
	}

	function renderReplaceDateCell(record) {
		var parsed = parseDateTimeParts(record.replaceDate);
		return renderCellLines(parsed.date, [parsed.time]);
	}

	function renderCreateInfoCell(record) {
		var parsed = parseDateTimeParts(record.createTime);
		return renderCellLines(record.creator || '—', [parsed.date + (parsed.time !== '—' ? ' ' + parsed.time : '')]);
	}

	function getOperationButtons(record, isHistory) {
		if (isHistory) {
			var viewBtn = React.createElement(Button, { key: 'view', type: 'link', size: 'small', onClick: function () { message.info('查看（跳转替换车管理-查看）'); } }, '查看');
			var toPermanentBtn = record.replaceType === '临时替换' ? React.createElement(Button, { key: 'toPermanent', type: 'link', size: 'small', onClick: function () { _toPermanentModalRecord[1](record); _toPermanentModalVisible[1](true); } }, '转永久替换') : null;
			return React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap' } }, viewBtn, toPermanentBtn);
		}
		var status = record.approvalStatus;
		var items = [];
		if (['待审批', '审批中', '审批驳回', '未提交', '撤回'].indexOf(status) !== -1) {
			items.push(React.createElement(Button, { key: 'view', type: 'link', size: 'small', onClick: function () { message.info('查看（跳转替换车管理-查看）'); } }, '查看'));
		}
		if (['未提交', '审批驳回', '撤回'].indexOf(status) !== -1) {
			items.push(React.createElement(Button, { key: 'edit', type: 'link', size: 'small', onClick: function () { message.info('编辑（跳转替换车管理-编辑）'); } }, '编辑'));
		}
		if (['撤回', '审批驳回'].indexOf(status) !== -1) {
			items.push(React.createElement(Button, {
				key: 'delete',
				type: 'link',
				size: 'small',
				danger: true,
				onClick: function () {
					_deleteModalRecord[1](record);
					_deleteModalVisible[1](true);
				}
			}, '删除'));
		}
		if (status === '审批中') {
			items.push(React.createElement(Button, { key: 'withdraw', type: 'link', size: 'small', danger: true, onClick: function () { _withdrawModalRecord[1](record); _withdrawModalVisible[1](true); } }, '撤回'));
		}
		return React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap' } }, items);
	}

	var tableColumns = [
		{
			title: '替换车辆',
			key: 'replaceVehicle',
			width: 196,
			fixed: 'left',
			render: function (_, record) { return renderReplaceVehicleCell(record); }
		},
		{
			title: '项目信息',
			key: 'projectInfo',
			width: 220,
			render: function (_, record) { return renderProjectInfoCell(record); }
		},
		{
			title: '替换日期',
			key: 'replaceDate',
			width: 118,
			render: function (_, record) { return renderReplaceDateCell(record); }
		},
		{
			title: '审批状态',
			dataIndex: 'approvalStatus',
			key: 'approvalStatus',
			width: 132,
			render: function (v, record) { return renderApprovalInfoCell(v, record); }
		},
		{
			title: '替换原因说明',
			dataIndex: 'replaceReasonDesc',
			key: 'replaceReasonDesc',
			width: 160,
			ellipsis: true,
			render: function (v) {
				return React.createElement('span', { title: v || '', style: { color: '#475569' } }, v || '—');
			}
		},
		{
			title: '创建信息',
			key: 'createInfo',
			width: 148,
			render: function (_, record) { return renderCreateInfoCell(record); }
		},
		{
			title: '操作',
			key: 'action',
			width: 168,
			fixed: 'right',
			render: function (_, record) { return getOperationButtons(record, kpiFilter === 'history'); }
		}
	];

	var filterItems = [
		React.createElement('div', { key: 'replaceDate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '替换日期'),
			React.createElement(RangePicker, { style: filterControlStyle, placeholder: ['请选择开始时间', '请选择结束时间'], value: _replaceDateRange[0], onChange: function (v) { _replaceDateRange[1](v); } })),
		React.createElement('div', { key: 'replaceType', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '替换类型'),
			React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, value: _replaceType[0], onChange: function (v) { _replaceType[1](v); }, allowClear: true, options: replaceTypeOptions })),
		React.createElement('div', { key: 'projectName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '项目名称'),
			React.createElement(Select, { placeholder: '请输入或选择项目名称', style: filterControlStyle, value: _projectName[0], onChange: function (v) { _projectName[1](v); }, allowClear: true, showSearch: true, options: projectNameOptions, filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; } })),
		React.createElement('div', { key: 'approvalStatus', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '审批状态'),
			React.createElement(Select, { mode: 'multiple', placeholder: '请选择', style: filterControlStyle, value: _approvalStatus[0], onChange: handleApprovalStatusChange, options: approvalStatusOptions })),
		React.createElement('div', { key: 'originalPlate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '被替换车（旧车）'),
			React.createElement(Select, { placeholder: '请输入或选择车牌号', style: filterControlStyle, value: _originalPlate[0], onChange: function (v) { _originalPlate[1](v); }, allowClear: true, showSearch: true, options: plateOptions, filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; } })),
		React.createElement('div', { key: 'replacePlate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '新车'),
			React.createElement(Select, { placeholder: '请输入或选择车牌号', style: filterControlStyle, value: _replacePlate[0], onChange: function (v) { _replacePlate[1](v); }, allowClear: true, showSearch: true, options: plateOptions, filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; } })),
		React.createElement('div', { key: 'replaceReason', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '替换原因'),
			React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, value: _replaceReason[0], onChange: function (v) { _replaceReason[1](v); }, allowClear: true, options: replaceReasonOptions })),
		React.createElement('div', { key: 'creator', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '创建人'),
			React.createElement(Select, { placeholder: '请选择创建人', style: filterControlStyle, value: _creator[0], onChange: function (v) { _creator[1](v); }, allowClear: true, options: creatorOptions })),
		React.createElement('div', { key: 'createTime', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '创建时间'),
			React.createElement(RangePicker, { style: filterControlStyle, placeholder: ['请选择开始时间', '请选择结束时间'], value: _createTimeRange[0], onChange: function (v) { _createTimeRange[1](v); } }))
	];

	var filterCount = _filterExpanded[0] ? 9 : 4;
	var filterNodes = [];
	for (var i = 0; i < filterCount && i < filterItems.length; i++) {
		filterNodes.push(filterItems[i]);
	}

	var page = _page[0];
	var pageSize = _pageSize[0];
	var displayList = useMemo(function () {
		var start = (page - 1) * pageSize;
		return currentList.slice(start, start + pageSize);
	}, [currentList, page, pageSize]);

	var kpiExportLabelMap = { total: '全部替换车', ongoing: '进行中的替换车', history: '历史替换车' };

	var handleKpiCardClick = useCallback(function (key) {
		_kpiFilter[1](key);
		setPage(1);
	}, []);

	var handleListPlateQuickChange = useCallback(function (v) {
		_listPlateQuick[1](v);
		setPage(1);
	}, []);

	var handleExport = useCallback(function () {
		if (!currentList.length) {
			message.warning('当前「' + (kpiExportLabelMap[kpiFilter] || '替换车') + '」无数据可导出');
			return;
		}
		message.success('已导出 ' + currentList.length + ' 条（' + (kpiExportLabelMap[kpiFilter] || '替换车') + '，原型）');
	}, [currentList.length, kpiFilter]);

	var kpiCards = useMemo(function () {
		return [
			{ key: 'total', type: 'total', title: '全部替换车', desc: '当前筛选条件下的全部替换车记录（含进行中与历史）', val: kpiStats.total, icon: VR_KPI_ICONS.total },
			{ key: 'ongoing', type: 'progress', title: '进行中的替换车', desc: '审批状态为待审批、审批中、审批驳回、未提交、撤回的记录', val: kpiStats.ongoing, icon: VR_KPI_ICONS.progress },
			{ key: 'history', type: 'completed', title: '历史替换车', desc: '审批流程已结束、状态为审批完成的记录', val: kpiStats.history, icon: VR_KPI_ICONS.completed }
		];
	}, [kpiStats]);

	function renderKpiCard(card) {
		var active = kpiFilter === card.key;
		return React.createElement('div', {
			key: card.key,
			role: 'button',
			tabIndex: 0,
			className: 'lc-alert-card lc-alert-card--' + card.type + ' lc-alert-card-clickable' + (active ? ' lc-alert-card-active' : ''),
			onClick: function () { handleKpiCardClick(card.key); },
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleKpiCardClick(card.key);
				}
			}
		},
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 360 } },
					React.createElement('span', {
						className: 'lc-alert-card-tip',
						role: 'img',
						'aria-label': card.title + '说明',
						onClick: function (e) { e.stopPropagation(); },
						onMouseDown: function (e) { e.stopPropagation(); }
					}, VR_KPI_TIP_SVG)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon' }, card.icon),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-val' }, card.val),
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title)
			)
		);
	}

	var tablePagination = {
		current: page,
		pageSize: pageSize,
		total: currentList.length,
		showSizeChanger: true,
		showTotal: function (t) { return '共 ' + t + ' 条'; },
		pageSizeOptions: ['10', '20', '50'],
		onChange: function (p, ps) { setPage(p); if (ps) setPageSize(ps); }
	};

	function renderTableBody() {
		if (displayList.length === 0) {
			return React.createElement(Empty, {
				image: Empty.PRESENTED_IMAGE_SIMPLE,
				description: '暂无符合条件的替换车记录，请调整筛选条件后重试'
			});
		}
		return React.createElement(Table, {
			rowKey: 'id',
			columns: tableColumns,
			dataSource: displayList,
			size: 'middle',
			tableLayout: 'fixed',
			scroll: { x: 1180 },
			pagination: tablePagination
		});
	}

	var requirementContent = `替换车管理（2026年3月3日版本）
一个「数字化资产ONEOS运管平台」中的「运维管理」「车辆业务」「替换车管理」模块

1.面包屑：
1.1.运维管理-车辆业务-替换车管理

筛选与列表分为2个卡片；

2.筛选：
支持通过替换日期、替换类型、项目名称、审批状态、被替换车车牌号、替换车车牌号、替换原因、创建人、创建时间进行筛选，右侧为重置、搜索、展开/收起（筛选条件以4列显示，默认显示一行，点击展开/收起对筛选栏进行展开/收起所有筛选条件），点击搜索后，筛选条件与列表及 KPI 统计联动。点击重置会回到默认筛选条件并在列表展示结果：

2.1.替换日期：日期选择器，支持单输入框内双日历选择开始-结束时间，默认提示文本为：请选择开始时间、请选择结束时间；
2.2.替换类型：选择器，分为永久替换、临时替换两种方式；
2.3.项目名称：选择器，支持输入框中输入关键内容进行搜索，下拉匹配相应项；
2.4.审批状态：选择器，分为全部、待审批、审批中、审批驳回、未提交、撤回；
2.5.被替换车（旧车）：选择器，支持输入框中输入关键内容进行搜索，下拉匹配相应项；
2.6.新车：选择器，支持输入框中输入关键内容进行搜索，下拉匹配相应项；
2.7.替换原因：选择器，分为全部、客户原因、车辆原因；
2.8.创建人：选择器，下拉选择所有创建人；
2.9.创建时间：日期选择器，支持单输入框内双日历选择开始-结束时间，默认提示文本为：请选择开始时间、请选择结束时间；

3.列表：顶部为 KPI 统计卡片（全部替换车 / 进行中的替换车 / 历史替换车），点击切换列表范围；工具栏左侧为车牌号快捷筛选，右侧为新增、导出（导出与当前 KPI 标签及筛选结果一致）；
列表字段合并展示：替换车辆、项目信息、替换日期、审批状态、替换原因说明、创建信息、操作；

3.1.进行中的替换车：显示替换车申请流程未结束、暂存的记录；
    3.1.1.替换日期：显示格式为：YYYY-MM-DD HH:MM:SS；
    3.1.2.审批状态：分为待审批、审批中、审批驳回、未提交、撤回；
    3.1.3.当前审批人：显示当前待审批节点审批人，未提交/撤回等为「—」；
    3.1.4.被替换车（旧车）、品牌、型号、新车、品牌、型号：展示申请表单车辆信息；
    3.1.5.替换类型：临时替换、永久替换；
    3.1.6.替换原因、替换原因说明、创建人、创建时间（YYYY-MM-DD HH:MM:SS）；
    3.1.7.操作：查看、编辑、撤回、删除（逻辑删除）；
           3.1.7.1.查看：审批状态为待审批/审批中/审批驳回/未提交/撤回时显示；
           3.1.7.2.编辑：审批状态为未提交/审批驳回/撤回时显示；
           3.1.7.3.撤回：审批状态为审批中时显示，二次确认；
           3.1.7.4.删除：审批状态为撤回/审批驳回时显示，逻辑删除，二次确认；

3.2.历史替换车：显示替换车申请流程已结束的记录；
    3.2.1.替换日期：显示格式为：YYYY-MM-DD，显示替换车申请表单中设置的替换日期；
    3.2.2.替换类型：分为：临时替换、永久替换两种，根据替换车申请表单中设置的替换类型显示；
    3.2.3.项目名称：显示替换车申请表单中设置的项目名称；
    3.2.4.审批状态：历史记录中所有审批状态为审批完成；
    3.2.5.被替换车车牌号：显示替换车申请表单中被替换车车牌号；
    3.2.6.被替换车品牌：显示替换车申请表单中被替换车品牌；
    3.2.7.被替换车型号：显示替换车申请表单中被替换车型号；
    3.2.8.替换车车牌号：显示替换车申请表单中替换车车牌号；
    3.2.9.替换车品牌：显示替换车申请表单中替换车品牌；
    3.2.10.替换车型号：显示替换车申请表单中替换车型号；
    3.2.11.替换原因：显示替换车申请表单中替换原因；
    3.2.12.替换原因说明：显示替换车申请表单中替换原因说明；
    3.2.13.创建人：显示替换车申请表单中创建人；
    3.2.14.创建时间：显示替换车申请表单中创建时间，显示格式为：YYYY-MM-DD HH:MM；
    3.2.15.操作：查看、转永久替换；
           3.2.15.1.查看：点击跳转替换车管理-查看页面；
           3.2.15.2.转永久替换：点击转永久替换，进行二次确认，提示语：是否确认转永久替换，点击提交直接转为永久替换；

列表右下方为分页符。`;

	return React.createElement(App, null,
		React.createElement('div', { style: styles.page },
			React.createElement('style', null, VR_KPI_STYLE + pageStyles),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
				React.createElement(Breadcrumb, {
					items: [
						{ title: '运维管理' },
						{ title: '车辆业务' },
						{ title: '替换车管理' }
					]
				}),
				React.createElement(Button, { type: 'link', onClick: function () { _requirementModalVisible[1](true); } }, '查看需求说明')
			),
			React.createElement(Card, { style: { marginBottom: 16 } },
				React.createElement('div', { style: styles.cardBody },
					React.createElement('div', { className: 'vr-list-filter-grid', style: styles.filterGrid }, filterNodes),
					React.createElement('div', { style: styles.filterActions },
						React.createElement(Button, { onClick: handleReset }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQuery }, '搜索'),
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							onClick: function () { _filterExpanded[1](!_filterExpanded[0]); },
							style: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 4px' }
						},
							_filterExpanded[0] ? '收起' : '展开',
							React.createElement('svg', {
								width: 12,
								height: 12,
								viewBox: '0 0 24 24',
								fill: 'none',
								stroke: 'currentColor',
								strokeWidth: 2,
								strokeLinecap: 'round',
								strokeLinejoin: 'round',
								style: { transform: _filterExpanded[0] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }
							}, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
						)
					)
				)
			),
			React.createElement(Card, null,
				React.createElement('div', { style: styles.cardBody },
					React.createElement('div', { className: 'vr-kpi-stats-row' }, kpiCards.map(renderKpiCard)),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 } },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' } },
							React.createElement('span', { style: { color: '#333', fontSize: 14, whiteSpace: 'nowrap' } }, '车牌号'),
							React.createElement(Select, {
								placeholder: '请输入或选择车牌号',
								allowClear: true,
								showSearch: true,
								style: { width: 220 },
								value: listPlateQuick,
								onChange: handleListPlateQuickChange,
								options: plateOptions,
								filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
							})
						),
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' } },
							React.createElement('span', { style: { fontSize: 13, color: '#64748b' } },
								'当前标签：',
								React.createElement('span', { style: { color: '#334155', fontWeight: 600 } }, kpiExportLabelMap[kpiFilter] || '—'),
								' · 导出与列表一致'
							),
							React.createElement(Button, { type: 'primary', onClick: function () { message.info('新增替换车申请（原型）'); } }, '新增'),
							React.createElement(Button, { onClick: handleExport }, '导出')
						)
					),
					renderTableBody()
				)
			),
			React.createElement(Modal, {
				title: '是否确认撤回该替换车申请',
				open: _withdrawModalVisible[0],
				onCancel: function () { _withdrawModalVisible[1](false); _withdrawModalRecord[1](null); },
				onOk: function () { message.success('已撤回（原型）'); _withdrawModalVisible[1](false); _withdrawModalRecord[1](null); },
				okText: '确定',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '是否确认转永久替换',
				open: _toPermanentModalVisible[0],
				onCancel: function () { _toPermanentModalVisible[1](false); _toPermanentModalRecord[1](null); },
				onOk: function () { message.success('已转为永久替换（原型）'); _toPermanentModalVisible[1](false); _toPermanentModalRecord[1](null); },
				okText: '提交',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '是否确认逻辑删除该替换车申请？',
				open: _deleteModalVisible[0],
				onCancel: function () { _deleteModalVisible[1](false); _deleteModalRecord[1](null); },
				onOk: function () {
					var rec = _deleteModalRecord[0];
					if (rec && rec.id) {
						_deletedIds[1](function (prev) {
							if (prev.indexOf(rec.id) !== -1) return prev;
							return prev.concat(rec.id);
						});
					}
					message.success('已逻辑删除（原型）');
					_deleteModalVisible[1](false);
					_deleteModalRecord[1](null);
				},
				okText: '确定',
				cancelText: '取消',
				okButtonProps: { danger: true }
			}),
			React.createElement(Modal, {
				title: '需求说明',
				open: _requirementModalVisible[0],
				onCancel: function () { _requirementModalVisible[1](false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { _requirementModalVisible[1](false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: '#334155' } }, requirementContent))
			)
		)
	);
};
