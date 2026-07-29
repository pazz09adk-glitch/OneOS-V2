// ONE-OS 租赁合同管理（列表页）
// 设计规范 v2：vm-page / lc-page · DateRangeFilterField · TablePagination · OperationActions

import LeaseContractCreate from './LeaseContractCreate.jsx';
import LeaseContractView from './LeaseContractView.jsx';
import { LeaseOrderServiceContentField } from './LeaseContractEditorForm.jsx';
import {
	getExtraFeeLockedServiceValues,
	getExtraFeeNewServiceValues,
	formatExtraFeeExistingServiceLabel,
} from './lease-order-vars.js';
import {
	FLOW_MODE_CREATE,
	FLOW_MODE_EDIT,
	FLOW_MODE_RENEW,
	FLOW_MODE_TRIAL_TO_FORMAL,
	FLOW_MODE_ADD_VEHICLE,
	FLOW_MODE_ADD_POA,
	FLOW_MODE_TRIPARTITE,
	buildRenewContractFormState,
	buildTrialToFormalFormState,
	buildAddVehicleFormState,
	buildAddPowerOfAttorneyFormState,
	buildTripartiteContractFormState,
} from './lease-contract-flow-bridge.js';
import { syncPickupReceivableContractStatus, syncPickupReceivableDeliveryPlan } from '../vehicle-pickup-receivable/pickup-receivable-bridge.js';
import { StatusTag } from '../vehicle-management/components/StatusTag';
import { DateRangeFilterField } from '../vehicle-management/components/DateRangeFilterField';
import { TablePagination } from '../../common/TablePagination';
import { OperationActions } from '../../common/OperationActions';
import {
	LEASE_CONTRACT_LIST_RECORDS,
	enrichLeaseContractListRecords,
	formatDeliveryRegion,
	formatContractDeliveryRegionLabel,
	formatPaymentPeriodLabel,
	formatPaymentMethodLabel,
	formatHydrogenPaymentLabel,
	formatContractApprovalTypeLabel,
	getContractApprovalFlowKindLabel,
	getAuthorizedDelegates,
	needsContractDelegateSupplement,
	formatContractHandoverMileage,
	formatContractHandoverDateTimeMinute,
	isContractVehicleDelivered,
	isContractVehicleReturned,
	canContractVehicleReturn,
	formatContractMileageTargetKm,
	getContractMileagePeriodTag,
	formatContractVehicleCurrentMileage,
	resolveContractVehicleMileageSource,
	getContractVehicleMileageSourceTagClass,
	formatContractVehicleRemainingMileage,
	formatContractPeriodStartDate,
	computeCurrentMileagePeriodEnd,
	computeVehiclePeriodTargetMileage,
	computeVehicleMileageForecastStatus,
	computeContractOverallMileageProgress,
	computeContractMileageForecastStatus,
	getContractMileageForecastStatusTone,
	resolveReturnSettlementDisplayLabel,
	resolveReturnSettlementCellMode,
	getReturnSettlementDisplayTone,
	resolveLeaseBillStatus,
	getLeaseBillStatusTone,
	getCurrentApproverLabel,
	shouldHideCurrentApprover,
	DELIVERY_DATE_TBD_LABEL,
	isDeliveryDateTbd,
	formatContractDeliveryDateLabel,
	formatVehicleDeliveryPlanDateLabel,
	resolveVehicleDeliveryDateTbd,
	resolveVehiclePlannedDeliveryDate,
	canEditContractDeliveryArrangement,
	isContractDeliveryRegionTbd,
	isContractDeliveryDateUnconfirmed,
	DELIVERY_REGION_TBD_LABEL,
	LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL,
	resolveContractDisplayStatus,
	resolveProjectInfoStatusTags,
	projectInfoStatusTone,
	inferContractTemplateId,
	resolveRecordContractTemplateCategory,
} from './lease-contract-list-data.js';
import {
	getPublishedContractTemplateOptions,
	getPublishedContractTypeChoices,
} from '../contract-template-management/contract-template-catalog.js';
import {
	isOfflineContractSigning,
	formatContractSigningMethodLabel,
	resolveContractSigningMethod,
	getContractSigningSubLabel,
	getOnlineEsignContractFiles,
	hasOnlineEsignCompleted,
	openOnlineEsignPreviewInNewTab,
	openContractAttachmentPreviewInNewTab,
	downloadContractAttachment,
	resolvePartyBEmailForStamp,
	isPartyBEmailValid,
	downloadPartyASignedContract,
} from './lease-contract-signing.js';
import { PROVINCE_CITY_CASCADER_OPTIONS } from './lease-order-vars.js';
import { getLessorCompanies } from '../contract-template-management/contract-template-vars.js';

const Component = function(props) {
	var useEffect = React.useEffect;
	var ONEOS_ANT_TABLE_GLOBAL_FIX = [
		'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
		'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
		'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
		'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }',
		'.vm-list-table .ant-table-thead th,.vm-list-table .ant-table-tbody td{white-space:nowrap;}'
	];

	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var antd = (typeof window !== 'undefined' && window.antd) || {};
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Table = antd.Table;
	var Space = antd.Space;
	var DatePicker = antd.DatePicker;
	var Popover = antd.Popover;
	var Cascader = antd.Cascader;
	var Tag = antd.Tag;
	var Avatar = antd.Avatar;
	var Dropdown = antd.Dropdown;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var Upload = antd.Upload;
	var message = antd.message;
	var App = antd.App;
	var Checkbox = antd.Checkbox;

	var RangePicker = DatePicker.RangePicker;

	// 筛选展开（默认收起，只显示第一行 4 列，与车辆管理一致）
	var _filterExpanded = useState(false);
	var _kpiTab = useState('all');
	var _page = useState(1);
	var _pageSize = useState(10);
	var _view = useState('list');
	var _createInitialSection = useState(null);
	var _editContractRecord = useState(null);
	var _viewContractRecord = useState(null);
	var _flowMode = useState(FLOW_MODE_CREATE);
	var _flowInitialFormState = useState(null);
	var _contractCode = useState(undefined);
	var _projectName = useState(undefined);
	var _customerName = useState(undefined);
	var _signingCompany = useState(undefined);
	var _approvalStatus = useState(['全部']);
	var _contractStatus = useState(['全部']);
	var _businessDept = useState([]);
	var _businessOwner = useState([]);
	var _contractTemplateCategory = useState(undefined);
	var _contractTemplateId = useState(undefined);
	var _contractApprovalType = useState(['全部']);
	var _creator = useState([]);
	var _endDateRange = useState({ startDate: '', endDate: '' });

	var _appliedFilter = useState({
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		signingCompany: undefined,
		approvalStatus: ['全部'],
		contractStatus: ['全部'],
		businessDept: [],
		businessOwner: [],
		contractTemplateCategory: undefined,
		contractTemplateId: undefined,
		contractApprovalType: ['全部'],
		creator: [],
		endDateRange: { startDate: '', endDate: '' }
	});

	var _vehiclePopoverRecord = useState(null);
	var _expandedRowVehicleFilter = useState({});
	var _deliveryChangePopoverRecord = useState(null);
	var _deliveryChangeDraftRegionMode = useState('region');
	var _deliveryChangeDraftRegion = useState([]);
	var _deliveryChangeDraftDateMode = useState('range');
	var _deliveryChangeDraftDateRange = useState(null);
	var _deliveryChangeDraftDate = useState(null);
	var _deliveryChangeDraftTbd = useState(false);
	var _vehicleDeliveryChangeTarget = useState(null);
	var _vehicleDeliveryChangeDraftDate = useState(null);
	var _vehicleDeliveryChangeDraftTbd = useState(false);
	var _delegatePopoverRecord = useState(null);
	var _authorizedModalVisible = useState(false);
	var _authorizedModalRecord = useState(null);
	var _authorizedList = useState([{ name: '', phone: '', idCard: '' }]);
	var _extraFeeModalVisible = useState(false);
	var _extraFeeModalRecord = useState(null);
	var _extraFeeExistingList = useState([]);
	var _extraFeeNewList = useState([]);
	var _deleteModalVisible = useState(false);
	var _deleteModalRecord = useState(null);
	var _withdrawModalVisible = useState(false);
	var _withdrawModalRecord = useState(null);
	var _terminateModalVisible = useState(false);
	var _terminateModalRecord = useState(null);
	var _terminateForm = useState({ terminateAt: null, reason: undefined, remark: '' });
	var _stampModalVisible = useState(false);
	var _stampModalRecord = useState(null);
	var _stampModalMode = useState('legal');
	var _stampPartyBEmail = useState('');
	var _stampFileList = useState([]);
	var _stampEmailSending = useState(false);
	var _stampEmailSent = useState(false);
	var _stampedFilesOverride = useState({});
	var _contractViewModalVisible = useState(false);
	var _contractViewRecord = useState(null);
	var _tripartiteModalVisible = useState(false);
	var _tripartiteModalRecord = useState(null);
	var _tripartiteAgreements = useState([]);
	var _trialToFormalModalVisible = useState(false);
	var _trialToFormalRecord = useState(null);
	var _trialToFormalDelegates = useState([]);
	var _trialToFormalVehicles = useState([]);
	var _trialToFormalTripartite = useState(false);
	var _trialToFormalAgreements = useState([]);
	// 上传盖章合同完成后，按合同 id 记录已上传（原型：与列表 legalStampedContractUploaded 合并判断）
	var _stampedUploadedOverride = useState({});
	var _stampedCompletedAtOverride = useState({});
	// 撤回等列表行状态覆盖（原型）
	var _recordOverrides = useState({});
	var _signingMethodPopoverRecord = useState(null);
	var _expandedRowKeys = useState([]);

	useEffect(function() {
		if (props && props.onPageViewChange) {
			var viewKey = _view[0] === 'create' ? 'create' : (_view[0] === 'view' ? 'view' : 'list');
			props.onPageViewChange(viewKey);
		}
	}, [_view[0]]);

	useEffect(function() {
		if (props && props.navigationRef) {
			props.navigationRef.current = {
				openCreate: function() { openContractFlow(FLOW_MODE_CREATE, null); },
				backToList: function() { backToContractList(); },
			};
		}
	}, [props]);

	// 联调时：当前登录用户所属部门为法务部时为 true（原型默认 true 便于演示「上传盖章合同」）
	var isLegalDeptUser = true;

	// 模拟选项（与新增租赁合同保持一致）
	var contractCodeOptions = [
		{ value: 'HT-ZL-2025-001', label: 'HT-ZL-2025-001' },
		{ value: 'HT-ZL-2025-002', label: 'HT-ZL-2025-002' },
		{ value: 'HT-ZL-2025-003', label: 'HT-ZL-2025-003' },
		{ value: 'HT-ZL-2025-004', label: 'HT-ZL-2025-004' },
		{ value: 'HT-ZL-2025-005', label: 'HT-ZL-2025-005' },
		{ value: 'HT-ZL-2025-006', label: 'HT-ZL-2025-006' },
		{ value: 'HT-ZL-2025-007', label: 'HT-ZL-2025-007' },
		{ value: 'HT-ZL-2025-008', label: 'HT-ZL-2025-008' },
		{ value: 'HT-ZL-2024-009', label: 'HT-ZL-2024-009' },
		{ value: 'HT-ZL-2024-010', label: 'HT-ZL-2024-010' }
	];
	var projectNameOptions = [
		{ value: 'p1', label: '嘉兴氢能示范项目' },
		{ value: 'p2', label: '上海物流租赁项目' },
		{ value: 'p3', label: '杭州城配租赁项目' }
	];
	var customerNameOptions = [
		{ value: 'c1', label: '嘉兴某某物流有限公司' },
		{ value: 'c2', label: '上海某某运输公司' },
		{ value: 'c3', label: '杭州某某租赁有限公司' }
	];
	var signingCompanyOptions = getLessorCompanies().map(function (c) {
		return { value: c.shortName, label: c.legalName };
	});
	// 审批状态：未提交、待审批、审批中、审批通过、审批驳回、撤回
	var approvalStatusOptions = [
		{ value: '全部', label: '全部' },
		{ value: '未提交', label: '未提交' },
		{ value: '待审批', label: '待审批' },
		{ value: '审批中', label: '审批中' },
		{ value: '审批通过', label: '审批通过' },
		{ value: '审批驳回', label: '审批驳回' },
		{ value: '审批终止', label: '审批终止' },
		{ value: '撤回', label: '撤回' },
	];
	// 合同状态：草稿、已提交审批、合同进行中、已终止
	var contractStatusOptions = [
		{ value: '全部', label: '全部' },
		{ value: '草稿', label: '草稿' },
		{ value: '已提交审批', label: '已提交审批' },
		{ value: '合同进行中', label: '合同进行中' },
		{ value: '已终止', label: '已终止' }
	];
	var contractTemplateCategoryOptions = useMemo(function() {
		return getPublishedContractTypeChoices().map(function(o) {
			return { value: o.value, label: o.label };
		});
	}, []);
	var contractTemplateStandardOptions = useMemo(function() {
		var category = _contractTemplateCategory[0];
		var all = getPublishedContractTemplateOptions();
		var list = category
			? all.filter(function(o) { return o.contractType === category; })
			: all;
		return list.map(function(o) {
			return { value: o.id, label: o.title || o.fileName || o.id };
		});
	}, [_contractTemplateCategory[0]]);
	var contractApprovalTypeOptions = [
		{ value: '全部', label: '全部' },
		{ value: '标准合同', label: '标准合同' },
		{ value: '非标准合同', label: '非标准合同' }
	];
	var deptOptions = [
		{ value: '业务1部', label: '业务1部' },
		{ value: '业务2部', label: '业务2部' },
		{ value: '业务3部', label: '业务3部' }
	];
	var userOptions = [
		{ value: '张经理', label: '张经理' },
		{ value: '李专员', label: '李专员' },
		{ value: '王专员', label: '王专员' },
		{ value: '赵经理', label: '赵经理' },
		{ value: '钱专员', label: '钱专员' }
	];

	// 列表样例：字段与新增页主体合同 / 租赁订单 / 授权委托书对齐
	var rawList = enrichLeaseContractListRecords(LEASE_CONTRACT_LIST_RECORDS);

	var KPI_CARDS = [
		{ key: 'all', title: '全部合同', desc: '显示全部合同' },
		{ key: 'draft', title: '草稿', desc: '显示所有状态为草稿的合同' },
		{ key: 'inProgress', title: '进行中', desc: '显示审批已通过、合同进行中的合同' },
		{ key: 'inApproval', title: '审批中', desc: '显示已提交审批的合同' },
		{ key: 'terminated', title: '已终止', desc: '显示已终止的合同' }
	];

	function matchContractKpi(record, key) {
		var status = record.contractStatus;
		switch (key) {
			case 'all':
				return true;
			case 'draft':
				return status === '草稿';
			case 'inProgress':
				return status === '合同进行中';
			case 'inApproval':
				return status === '已提交审批';
			case 'terminated':
				return status === '已终止';
			default:
				return true;
		}
	}

	var KPI_ICONS = {
		all: React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
		},
			React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
			React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' })
		),
		draft: React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
		},
			React.createElement('path', { d: 'M12 20h9' }),
			React.createElement('path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' })
		),
		inProgress: React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
		},
			React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
			React.createElement('polygon', { points: '10 8 16 12 10 16 10 8' })
		),
		inApproval: React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
		},
			React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
			React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
			React.createElement('path', { d: 'm9 15 2 2 4-4' })
		),
		terminated: React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
		},
			React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
			React.createElement('path', { d: 'm15 9-6 6' }),
			React.createElement('path', { d: 'm9 9 6 6' })
		)
	};

	var kpiHelpIcon = React.createElement('svg', {
		xmlns: 'http://www.w3.org/2000/svg', width: 14, height: 14, viewBox: '0 0 24 24',
		fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
	},
		React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
		React.createElement('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
		React.createElement('path', { d: 'M12 17h.01' })
	);

	var appliedFilter = _appliedFilter[0];
	var kpiCounts = useMemo(function() {
		var counts = {};
		KPI_CARDS.forEach(function(card) {
			counts[card.key] = rawList.filter(function(r) { return matchContractKpi(r, card.key); }).length;
		});
		return counts;
	}, [rawList]);

	var listChromeOffsetPx = 434;

	var filteredList = useMemo(function() {
		var overrides = _recordOverrides[0] || {};
		var list = rawList.map(function (r) {
			var merged = overrides[r.id] ? Object.assign({}, r, overrides[r.id]) : r;
			return Object.assign({}, merged, {
				contractStatus: resolveContractDisplayStatus(merged),
			});
		});
		var f = appliedFilter;
		if (f.contractCode) {
			list = list.filter(function(r) {
				return (r.contractCode || '').indexOf(f.contractCode) !== -1;
			});
		}
		if (f.projectName) {
			list = list.filter(function(r) { return r.projectName === f.projectName; });
		}
		if (f.customerName) {
			list = list.filter(function(r) { return r.customerName === f.customerName; });
		}
		if (f.signingCompany) {
			list = list.filter(function(r) { return r.signingCompany === f.signingCompany; });
		}
		var approval = f.approvalStatus;
		if (approval && approval.length > 0 && approval.indexOf('全部') === -1) {
			list = list.filter(function(r) { return approval.indexOf(r.approvalStatus) !== -1; });
		}
		var status = f.contractStatus;
		if (status && status.length > 0 && status.indexOf('全部') === -1) {
			list = list.filter(function(r) { return status.indexOf(r.contractStatus) !== -1; });
		}
		if (f.businessDept && f.businessDept.length > 0) {
			list = list.filter(function(r) { return f.businessDept.indexOf(r.businessDept) !== -1; });
		}
		if (f.businessOwner && f.businessOwner.length > 0) {
			list = list.filter(function(r) { return f.businessOwner.indexOf(r.businessOwner) !== -1; });
		}
		if (f.contractTemplateCategory) {
			list = list.filter(function(r) {
				return resolveRecordContractTemplateCategory(r) === f.contractTemplateCategory;
			});
		}
		if (f.contractTemplateId) {
			list = list.filter(function(r) {
				var tid = r.contractTemplateId || inferContractTemplateId(r);
				return tid === f.contractTemplateId;
			});
		}
		var capType = f.contractApprovalType;
		if (capType && capType.length > 0 && capType.indexOf('全部') === -1) {
			list = list.filter(function(r) {
				return capType.indexOf(formatContractApprovalTypeLabel(r.contractApprovalType)) !== -1;
			});
		}
		if (f.creator && f.creator.length > 0) {
			list = list.filter(function(r) { return f.creator.indexOf(r.creator) !== -1; });
		}
		if (f.endDateRange && (f.endDateRange.startDate || f.endDateRange.endDate)) {
			var start = f.endDateRange.startDate || '';
			var end = f.endDateRange.endDate || '';
			if (start || end) {
				list = list.filter(function(r) {
					var d = r.contractEndDate || '';
					if (start && d < start) return false;
					if (end && d > end) return false;
					return true;
				});
			}
		}
		if (_kpiTab[0] && _kpiTab[0] !== 'all') {
			list = list.filter(function(r) { return matchContractKpi(r, _kpiTab[0]); });
		}
		return list;
	}, [rawList, appliedFilter, _kpiTab[0], _recordOverrides[0]]);

	var totalCount = filteredList.length;
	var totalPages = Math.max(1, Math.ceil(totalCount / _pageSize[0]));
	var safePage = Math.min(_page[0], totalPages);
	var pagedList = useMemo(function() {
		var start = (safePage - 1) * _pageSize[0];
		return filteredList.slice(start, start + _pageSize[0]);
	}, [filteredList, safePage, _pageSize[0]]);

	var handleQuery = useCallback(function() {
		_appliedFilter[1]({
			contractCode: _contractCode[0],
			projectName: _projectName[0],
			customerName: _customerName[0],
			signingCompany: _signingCompany[0],
			approvalStatus: _approvalStatus[0] ? _approvalStatus[0].slice() : ['全部'],
			contractStatus: _contractStatus[0] ? _contractStatus[0].slice() : ['全部'],
			businessDept: _businessDept[0] ? _businessDept[0].slice() : [],
			businessOwner: _businessOwner[0] ? _businessOwner[0].slice() : [],
			contractTemplateCategory: _contractTemplateCategory[0],
			contractTemplateId: _contractTemplateId[0],
			contractApprovalType: _contractApprovalType[0] ? _contractApprovalType[0].slice() : ['全部'],
			creator: _creator[0] ? _creator[0].slice() : [],
			endDateRange: {
				startDate: (_endDateRange[0] && _endDateRange[0].startDate) || '',
				endDate: (_endDateRange[0] && _endDateRange[0].endDate) || '',
			},
		});
		_page[1](1);
	}, []);

	var handleReset = useCallback(function() {
		_contractCode[1](undefined);
		_projectName[1](undefined);
		_customerName[1](undefined);
		_signingCompany[1](undefined);
		_approvalStatus[1](['全部']);
		_contractStatus[1](['全部']);
		_businessDept[1]([]);
		_businessOwner[1]([]);
		_contractTemplateCategory[1](undefined);
		_contractTemplateId[1](undefined);
		_contractApprovalType[1](['全部']);
		_creator[1]([]);
		_endDateRange[1]({ startDate: '', endDate: '' });
		_appliedFilter[1]({
			contractCode: undefined,
			projectName: undefined,
			customerName: undefined,
			signingCompany: undefined,
			approvalStatus: ['全部'],
			contractStatus: ['全部'],
			businessDept: [],
			businessOwner: [],
			contractTemplateCategory: undefined,
			contractTemplateId: undefined,
			contractApprovalType: ['全部'],
			creator: [],
			endDateRange: { startDate: '', endDate: '' }
		});
		_page[1](1);
	}, []);

	// 审批状态/合同状态/审批类型：「全部」与其它选项互斥，不能同时多选
	var handleApprovalStatusChange = useCallback(function(v) {
		if (!v || v.length === 0) { _approvalStatus[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _approvalStatus[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			if (hadAllOnly) {
				var next = [];
				for (var i = 0; i < v.length; i++) { if (v[i] !== '全部') next.push(v[i]); }
				_approvalStatus[1](next);
			} else {
				_approvalStatus[1](['全部']);
			}
			return;
		}
		_approvalStatus[1](v);
	}, []);
	var handleContractStatusChange = useCallback(function(v) {
		if (!v || v.length === 0) { _contractStatus[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _contractStatus[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			if (hadAllOnly) {
				var next = [];
				for (var j = 0; j < v.length; j++) { if (v[j] !== '全部') next.push(v[j]); }
				_contractStatus[1](next);
			} else {
				_contractStatus[1](['全部']);
			}
			return;
		}
		_contractStatus[1](v);
	}, []);
	var handleContractTemplateCategoryChange = useCallback(function(v) {
		_contractTemplateCategory[1](v);
		_contractTemplateId[1](undefined);
	}, []);
	var handleContractTemplateIdChange = useCallback(function(v) {
		_contractTemplateId[1](v);
	}, []);
	var handleContractApprovalTypeChange = useCallback(function(v) {
		if (!v || v.length === 0) { _contractApprovalType[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prevA = _contractApprovalType[0] || [];
			var hadAllOnlyA = prevA.length === 1 && prevA.indexOf('全部') !== -1;
			if (hadAllOnlyA) {
				var nextA = [];
				for (var ia = 0; ia < v.length; ia++) { if (v[ia] !== '全部') nextA.push(v[ia]); }
				_contractApprovalType[1](nextA);
			} else {
				_contractApprovalType[1](['全部']);
			}
			return;
		}
		_contractApprovalType[1](v);
	}, []);

	var addAuthorizedRow = useCallback(function() {
		_authorizedList[1](function(prev) { return prev.concat([{ name: '', phone: '', idCard: '' }]); });
	}, []);
	var removeAuthorizedRow = useCallback(function(index) {
		_authorizedList[1](function(prev) {
			var list = prev.slice();
			list.splice(index, 1);
			if (list.length === 0) list = [{ name: '', phone: '', idCard: '' }];
			return list;
		});
	}, []);
	var updateAuthorizedRow = useCallback(function(index, field, value) {
		_authorizedList[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || { name: '', phone: '', idCard: '' };
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	// 附加费用：新增行服务项选择（与租赁订单「选择服务项」共用弹层）
	var updateExtraFeeNewRow = useCallback(function(index, field, value) {
		_extraFeeNewList[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || {};
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	var addExtraFeeNewRow = useCallback(function() {
		_extraFeeNewList[1](function(prev) {
			var lockedValues = getExtraFeeLockedServiceValues(_extraFeeExistingList[0]);
			return prev.concat([{
				key: 'new-' + Date.now(),
				readonly: false,
				serviceValues: lockedValues.slice(),
				fee: '',
				effectiveDate: null,
				billingMode: '先付后用',
			}]);
		});
	}, []);

	function mockUploadRequest(opts) {
		setTimeout(function() {
			if (opts.onSuccess) opts.onSuccess('ok');
		}, 200);
	}

	function createEmptyTripartiteAgreement() {
		return {
			id: 'tp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
			name: '',
			agreementFiles: [],
			letterFiles: [],
		};
	}

	function mapDelegatesForConversionModal(record) {
		var delegates = getAuthorizedDelegates(record);
		if (!delegates.length) {
			return [{ name: '', phone: '', idCard: '' }];
		}
		return delegates.map(function(d) {
			return {
				name: d.name || '',
				phone: d.contact || d.phone || '',
				idCard: d.idNumber || d.idCard || '',
			};
		});
	}

	function mapVehiclesForFormalModal(record) {
		return (record.vehicles || []).map(function(v, index) {
			return {
				key: String(index),
				vehicleType: v.vehicleType || '-',
				brand: v.brand || '',
				model: v.model || '',
				plateNo: v.plateNo || '-',
				rent: v.rent != null ? v.rent : '',
				leasePeriodMonths: v.leasePeriodMonths != null ? v.leasePeriodMonths : '',
			};
		});
	}

	function openTripartiteModal(record) {
		openContractFlow(FLOW_MODE_TRIPARTITE, record);
	}

	function openTrialToFormalModal(record) {
		openContractFlow(FLOW_MODE_TRIAL_TO_FORMAL, record);
	}

	function updateTripartiteAgreementList(setter, index, field, value) {
		setter(function(prev) {
			var list = prev.slice();
			var row = list[index] || createEmptyTripartiteAgreement();
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}

	function addTripartiteAgreementRow(setter) {
		setter(function(prev) { return prev.concat([createEmptyTripartiteAgreement()]); });
	}

	function removeTripartiteAgreementRow(setter, index) {
		setter(function(prev) {
			var list = prev.slice();
			list.splice(index, 1);
			return list.length ? list : [createEmptyTripartiteAgreement()];
		});
	}

	var updateTrialToFormalDelegate = useCallback(function(index, field, value) {
		_trialToFormalDelegates[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || { name: '', phone: '', idCard: '' };
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	var updateTrialToFormalVehicle = useCallback(function(index, field, value) {
		_trialToFormalVehicles[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || {};
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	function renderTripartiteAgreementEditor(agreements, setAgreements, annotationId) {
		return React.createElement('div', {
			className: 'lc-tripartite-agreements',
			'data-annotation-id': annotationId || undefined,
		},
			agreements.map(function(row, index) {
				return React.createElement('div', { key: row.id || index, className: 'lc-tripartite-agreement-card' },
					React.createElement('div', { className: 'lc-tripartite-agreement-card__head' },
						React.createElement('span', { className: 'lc-tripartite-agreement-card__title' }, '三方协议 ' + (index + 1)),
						agreements.length > 1
							? React.createElement(Button, {
								type: 'link',
								size: 'small',
								danger: true,
								onClick: function() { removeTripartiteAgreementRow(setAgreements, index); },
							}, '删除')
							: null,
					),
					React.createElement('div', { className: 'lc-tripartite-agreement-card__field' },
						React.createElement('label', { className: 'lc-tripartite-agreement-card__label' }, '协议名称'),
						React.createElement(Input, {
							value: row.name,
							placeholder: '请输入三方协议名称',
							onChange: function(e) {
								updateTripartiteAgreementList(setAgreements, index, 'name', e.target.value);
							},
						}),
					),
					React.createElement('div', { className: 'lc-tripartite-agreement-card__field' },
						React.createElement('label', { className: 'lc-tripartite-agreement-card__label' }, '三方协议附件'),
						React.createElement(Upload, {
							fileList: row.agreementFiles || [],
							onChange: function(info) {
								updateTripartiteAgreementList(setAgreements, index, 'agreementFiles', info.fileList);
							},
							customRequest: mockUploadRequest,
							accept: '.pdf,.doc,.docx,image/*',
						},
							React.createElement(Button, null, '上传协议'),
						),
					),
					React.createElement('div', { className: 'lc-tripartite-agreement-card__field' },
						React.createElement('label', { className: 'lc-tripartite-agreement-card__label' }, '对方公函'),
						React.createElement(Upload, {
							fileList: row.letterFiles || [],
							onChange: function(info) {
								updateTripartiteAgreementList(setAgreements, index, 'letterFiles', info.fileList);
							},
							customRequest: mockUploadRequest,
							accept: '.pdf,.doc,.docx,image/*',
						},
							React.createElement(Button, null, '上传公函'),
						),
					),
				);
			}),
			React.createElement(Button, {
				type: 'dashed',
				className: 'lc-tripartite-agreements__add',
				onClick: function() { addTripartiteAgreementRow(setAgreements); },
			}, '新增三方协议'),
		);
	}

	function renderModalContractCode(record) {
		return React.createElement('div', { className: 'lc-flow-modal__meta' },
			'合同编码：',
			React.createElement('span', { className: 'lc-flow-modal__meta-value' }, record ? record.contractCode : '-'),
		);
	}


	// 租赁/已交车 Popover：卡片式车辆明细
	function renderVehiclePopoverIcon(type) {
		if (type === 'delivered') {
			return React.createElement('svg', {
				xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
				fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
			},
				React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
				React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' }),
			);
		}
		return React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24',
			fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
		},
			React.createElement('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }),
			React.createElement('path', { d: 'M15 18H9' }),
			React.createElement('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }),
			React.createElement('circle', { cx: '17', cy: '18', r: '2' }),
			React.createElement('circle', { cx: '7', cy: '18', r: '2' }),
		);
	}

	function formatVehiclePlateLabel(plateNo) {
		var plate = plateNo && String(plateNo).trim();
		if (!plate || plate === '-') return null;
		return plate;
	}

	var VEHICLE_PLATE_UNSELECTED_LABEL = '车辆待选';

	function getVehiclePlateDisplayLabel(plateNo) {
		return formatVehiclePlateLabel(plateNo) || VEHICLE_PLATE_UNSELECTED_LABEL;
	}

	function groupLeaseVehiclesByBrandModel(vehicles) {
		var groups = [];
		var indexByKey = {};
		(vehicles || []).forEach(function (vehicle) {
			var brand = vehicle.brand && String(vehicle.brand).trim() ? vehicle.brand : '-';
			var model = vehicle.model && String(vehicle.model).trim() ? vehicle.model : '-';
			var key = brand + '::' + model;
			if (indexByKey[key] != null) {
				groups[indexByKey[key]].count += 1;
			} else {
				indexByKey[key] = groups.length;
				groups.push({ brand: brand, model: model, count: 1 });
			}
		});
		return groups;
	}

	function renderRentalSummaryPopoverPanel(config) {
		var vehicles = config.vehicles || [];
		var groups = groupLeaseVehiclesByBrandModel(vehicles);
		var totalCount = vehicles.length;
		return React.createElement('div', { className: 'lc-vehicle-popover__panel', role: 'region', 'aria-label': config.title },
			React.createElement('div', { className: 'lc-vehicle-popover__header' },
				React.createElement('div', {
					className: 'lc-vehicle-popover__header-icon',
					'aria-hidden': true,
				}, renderVehiclePopoverIcon('rental')),
				React.createElement('div', { className: 'lc-vehicle-popover__header-text' },
					React.createElement('div', { className: 'lc-vehicle-popover__header-title' }, config.title),
					React.createElement('div', { className: 'lc-vehicle-popover__header-sub' },
						config.subtitle,
						React.createElement('span', { className: 'lc-vehicle-popover__count tabular-nums' }, totalCount + ' 辆'),
					),
				),
			),
			groups.length === 0
				? React.createElement('div', { className: 'lc-vehicle-popover__empty' }, config.emptyText || '暂无车辆')
				: React.createElement('div', { className: 'lc-vehicle-popover__summary-wrap' },
					React.createElement('table', { className: 'lc-vehicle-popover__summary-table' },
						React.createElement('thead', null,
							React.createElement('tr', null,
								React.createElement('th', { scope: 'col' }, '品牌'),
								React.createElement('th', { scope: 'col' }, '型号'),
								React.createElement('th', { scope: 'col', className: 'is-count' }, '车辆数'),
							),
						),
						React.createElement('tbody', null,
							groups.map(function (group, index) {
								return React.createElement('tr', { key: 'rental-group-' + index },
									React.createElement('td', { title: group.brand }, group.brand),
									React.createElement('td', { title: group.model }, group.model),
									React.createElement('td', { className: 'is-count tabular-nums' }, group.count),
								);
							}),
						),
					),
				),
		);
	}

	function renderVehiclePopoverCard(vehicle, index, variant) {
		var plate = formatVehiclePlateLabel(vehicle.plateNo);
		var brandModel = [vehicle.brand, vehicle.model].filter(function (part) {
			return part && String(part).trim() && part !== '-';
		}).join(' · ') || '-';

		return React.createElement('article', {
			key: 'vehicle-card-' + index,
			className: 'lc-vehicle-popover-card' + (variant === 'delivered' ? ' lc-vehicle-popover-card--delivered' : ''),
		},
			React.createElement('div', { className: 'lc-vehicle-popover-card__head' },
				React.createElement('span', { className: 'lc-vehicle-popover-card__type', title: vehicle.vehicleType || '' }, vehicle.vehicleType || '-'),
				plate
					? React.createElement('span', { className: 'lc-vehicle-popover-card__plate tabular-nums' }, plate)
					: React.createElement('span', { className: 'lc-vehicle-popover-card__plate lc-vehicle-popover-card__plate--pending' }, VEHICLE_PLATE_UNSELECTED_LABEL),
			),
			React.createElement('div', { className: 'lc-vehicle-popover-card__body' },
				React.createElement('div', { className: 'lc-vehicle-popover-card__field' },
					React.createElement('span', { className: 'lc-vehicle-popover-card__label' }, '品牌型号'),
					React.createElement('span', { className: 'lc-vehicle-popover-card__value', title: brandModel }, brandModel),
				),
				variant === 'delivered'
					? React.createElement('div', { className: 'lc-vehicle-popover-card__delivery' },
						React.createElement('span', { className: 'lc-vehicle-popover-card__delivery-item tabular-nums' },
							React.createElement('svg', {
								xmlns: 'http://www.w3.org/2000/svg', width: 14, height: 14, viewBox: '0 0 24 24',
								fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
							},
								React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
								React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
								React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
								React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
							),
							vehicle.actualDelivery || '-',
						),
						React.createElement('span', { className: 'lc-vehicle-popover-card__delivery-item' },
							React.createElement('svg', {
								xmlns: 'http://www.w3.org/2000/svg', width: 14, height: 14, viewBox: '0 0 24 24',
								fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
							},
								React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
								React.createElement('circle', { cx: '12', cy: '7', r: '4' }),
							),
							vehicle.deliveryPerson && vehicle.deliveryPerson !== '-' ? vehicle.deliveryPerson : '-',
						),
					)
					: null,
			),
		);
	}

	function renderVehiclePopoverPanel(config) {
		var vehicles = config.vehicles || [];
		var count = vehicles.length;
		return React.createElement('div', { className: 'lc-vehicle-popover__panel', role: 'region', 'aria-label': config.title },
			React.createElement('div', { className: 'lc-vehicle-popover__header' },
				React.createElement('div', {
					className: 'lc-vehicle-popover__header-icon' + (config.variant === 'delivered' ? ' is-delivered' : ''),
					'aria-hidden': true,
				}, renderVehiclePopoverIcon(config.variant)),
				React.createElement('div', { className: 'lc-vehicle-popover__header-text' },
					React.createElement('div', { className: 'lc-vehicle-popover__header-title' }, config.title),
					React.createElement('div', { className: 'lc-vehicle-popover__header-sub' },
						config.subtitle,
						React.createElement('span', { className: 'lc-vehicle-popover__count tabular-nums' }, count + ' 辆'),
					),
				),
			),
			count === 0
				? React.createElement('div', { className: 'lc-vehicle-popover__empty' }, config.emptyText || '暂无车辆')
				: React.createElement('div', { className: 'lc-vehicle-popover__list' },
					vehicles.map(function (vehicle, index) {
						return renderVehiclePopoverCard(vehicle, index, config.variant);
					}),
				),
		);
	}

	function approvalAvatarText(name) {
		if (!name) return '?';
		var s = String(name);
		return s.length <= 2 ? s : s.slice(-2);
	}

	function parseApproverNames(label) {
		if (!label) return [];
		return String(label).split(/[、,，]/).map(function (part) {
			return part.trim();
		}).filter(Boolean);
	}

	function renderApproversInline(approverLabel) {
		var names = parseApproverNames(approverLabel);
		if (!names.length) return null;

		var firstName = names[0];
		var content = React.createElement('span', {
			className: 'lc-approval-status-cell__inline-approver'
				+ (names.length > 1 ? ' lc-approval-status-cell__inline-approver--multi' : ''),
		},
			React.createElement('span', {
				className: 'lc-approval-status-cell__inline-name',
				title: names.length === 1 ? firstName : undefined,
			}, firstName),
			names.length > 1
				? React.createElement('span', {
					className: 'lc-approval-status-cell__count-badge',
					'aria-label': '共 ' + names.length + ' 位审批人',
				}, String(names.length))
				: null,
		);

		if (names.length > 1) {
			return React.createElement(Tooltip, {
				title: names.join('、'),
				placement: 'top',
				mouseEnterDelay: 0.12,
			}, content);
		}
		return content;
	}

	function canShowApprovalFlowPopover(status, nodes) {
		if (!nodes || !nodes.length) return false;
		return status === '待审批'
			|| status === '审批中'
			|| status === '审批通过'
			|| status === '审批驳回';
	}

	function renderApprovalFlowContent(nodes, record) {
		var list = nodes && nodes.length ? nodes : [];
		if (!list.length) {
			return React.createElement('div', { className: 'lc-approval-flow__empty' }, '暂无审批节点明细');
		}
		var flowKind = getContractApprovalFlowKindLabel(record);
		var isNonStandardFlow = flowKind === '非标准合同流程';
		return React.createElement(
			'div',
			{ className: 'lc-approval-flow' },
			React.createElement('div', { className: 'lc-approval-flow__head' },
				React.createElement('span', { className: 'lc-approval-flow__head-label' }, '审批流程'),
				React.createElement('span', {
					className: 'lc-approval-flow__kind'
						+ (isNonStandardFlow ? ' lc-approval-flow__kind--nonstandard' : ' lc-approval-flow__kind--standard'),
				}, flowKind),
			),
			list.map(function(node, index) {
				var isLast = index === list.length - 1;
				var isPending = node.result === 'pending';
				var isRejected = node.result === 'rejected';
				var comment = node.comment && String(node.comment).trim();
				var dot = React.createElement(
					Avatar,
					{
						size: 28,
						style: {
							backgroundColor: isPending ? 'var(--oneos-color-primary, #32a06e)' : '#f0f0f0',
							color: isPending ? '#fff' : 'rgba(0,0,0,0.45)',
							fontSize: 11,
							lineHeight: '28px',
							flexShrink: 0
						},
						children: isPending
							? React.createElement(
									'svg',
									{ viewBox: '0 0 24 24', width: 14, height: 14, fill: 'currentColor', style: { verticalAlign: 'middle' } },
									React.createElement('path', {
										d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm5-9h2v2h-2V5zm0 4h2v2h-2V9z'
									})
								)
							: approvalAvatarText(node.operatorName)
					}
				);
				var body = React.createElement(
					'div',
					{ style: { flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 14, minWidth: 0 } },
					React.createElement(
						'div',
						{ style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 } },
						React.createElement('span', { style: { fontSize: 14, color: 'rgba(0,0,0,0.88)', fontWeight: 500 } }, node.nodeTitle || '-'),
						React.createElement(Tag, {
							color: isPending ? 'processing' : (isRejected ? 'error' : 'success'),
							style: { margin: 0 },
						}, isPending ? '待审核' : (isRejected ? '驳回' : '通过'))
					),
					isPending && node.pendingApprovers && node.pendingApprovers.length
						? React.createElement(
								Space,
								{ size: [8, 8], wrap: true },
								node.pendingApprovers.map(function(apName, i) {
									return React.createElement(
										Tag,
										{
											key: i,
											className: 'lc-approval-tag'
										},
										React.createElement(
											'span',
											null,
											React.createElement(
												'svg',
												{
													viewBox: '0 0 24 24',
													width: 12,
													height: 12,
													fill: 'var(--oneos-color-primary, #32a06e)',
													style: { marginRight: 4, verticalAlign: '-2px' }
												},
												React.createElement('path', {
													d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
												})
											),
											apName
										)
									);
								})
							)
						: React.createElement(
								'div',
								{ className: 'lc-approval-flow__meta' },
								React.createElement('span', { className: 'lc-approval-flow__operator' },
									(node.operatorName || '') + (node.operatorTime ? '  ' + node.operatorTime : ''),
								),
								comment
									? React.createElement('div', {
										className: 'lc-approval-flow__comment' + (isRejected ? ' is-rejected' : ''),
									},
										React.createElement('span', { className: 'lc-approval-flow__comment-label' }, '审批意见'),
										React.createElement('p', { className: 'lc-approval-flow__comment-text' }, comment),
									)
									: null,
							)
				);
				return React.createElement(
					'div',
					{ key: index, className: 'lc-approval-flow__item' },
					React.createElement(
						'div',
						{
							style: {
								width: 36,
								flexShrink: 0,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center'
							}
						},
						React.createElement('div', { style: { lineHeight: 0 } }, dot),
						isLast
							? null
							: React.createElement('div', {
									style: {
										flex: 1,
										width: 2,
										minHeight: 12,
										marginTop: 4,
										background: '#f0f0f0',
										borderRadius: 1
									}
								})
					),
					body
				);
			})
		);
	}

	function getEditAction(record) {
		var status = record.contractStatus;
		var approval = record.approvalStatus;
		if (status === '草稿' || approval === '审批驳回') {
			return {
				onClick: function () { openContractFlow(FLOW_MODE_EDIT, record); },
			};
		}
		return null;
	}

	function getMoreMenuItems(record) {
		var status = record.contractStatus;
		var type = record.contractType;
		var approval = record.approvalStatus;
		var items = [];
		var editAction = getEditAction(record);
		if (editAction) {
			items.push({ key: 'edit', label: '编辑', onClick: editAction.onClick });
		}
		if (status === '草稿') {
			items.push({ key: 'del', label: '删除合同', danger: true, onClick: function() { _deleteModalRecord[1](record); _deleteModalVisible[1](true); } });
		}
		if (status === '合同进行中') {
			items.push({ key: 'addVehicle', label: '新增车辆', onClick: function() { openContractFlow(FLOW_MODE_ADD_VEHICLE, record); } });
			items.push({ key: 'renew', label: '续签合同', onClick: function() { openContractFlow(FLOW_MODE_RENEW, record); } });
			items.push({ key: 'authorized', label: '添加授权委托书', onClick: function() { openContractFlow(FLOW_MODE_ADD_POA, record); } });
			items.push({ key: 'extraFee', label: '附加费用', onClick: function() {
				_extraFeeModalRecord[1](record);
				var vehicles = record.vehicles || [];
				var existingRows = vehicles.map(function(v, index) {
					var serviceValues = Array.isArray(v.extraServiceValues) && v.extraServiceValues.length
						? v.extraServiceValues.slice()
						: (v.extraServiceValue ? [v.extraServiceValue] : []);
					return {
						key: 'existing-' + index,
						readonly: true,
						vehicleType: v.vehicleType || '-',
						brand: v.brand || '-',
						model: v.model || '-',
						plateNo: v.plateNo || '-',
						serviceValues: serviceValues,
						serviceItem: formatExtraFeeExistingServiceLabel(serviceValues),
						fee: v.extraFee != null ? v.extraFee : '—',
						effectiveDate: v.extraFeeEffectiveDate || '—',
						billingMode: v.extraFeeBillingMode || '先付后用',
					};
				});
				var lockedValues = getExtraFeeLockedServiceValues(existingRows);
				_extraFeeExistingList[1](existingRows);
				_extraFeeNewList[1]([{
					key: 'new-0',
					readonly: false,
					serviceValues: lockedValues.slice(),
					fee: '',
					effectiveDate: null,
					billingMode: '先付后用',
				}]);
				_extraFeeModalVisible[1](true);
			} });
			items.push({ key: 'toTripartite', label: '转三方合同', onClick: function() { openTripartiteModal(record); } });
			items.push({ key: 'terminate', label: '主动终止合同', danger: true, onClick: function() {
				_terminateModalRecord[1](record);
				_terminateForm[1]({ terminateAt: null, reason: undefined, remark: '' });
				_terminateModalVisible[1](true);
			} });
		}
		if (approval === '待审批' || approval === '审批中') {
			items.push({ key: 'withdraw', label: '撤回合同', onClick: function() { _withdrawModalRecord[1](record); _withdrawModalVisible[1](true); } });
		}
		if (type === '试用合同') {
			items.push({ key: 'toFormal', label: '试用转正式', onClick: function() { openTrialToFormalModal(record); } });
		}
		if (approval === '审批通过' && isOfflineContractSigning(record.contractSigningMethod)) {
			var needStampSupplement = (record.legalStampedContractUploaded !== true)
				&& !(_stampedUploadedOverride[0][record.id] === true);
			if (needStampSupplement) {
				items.push({
					key: 'stampSupplement',
					label: '盖章合同补传',
					onClick: function() { openStampUploadModal(record, 'supplement'); },
				});
			}
		}
		// 审批通过且法务审核环节尚未上传盖章合同附件时，法务部员工可在「更多」中上传（上传完成后入口关闭）
		if (approval === '审批通过' && isLegalDeptUser && !isOfflineContractSigning(record.contractSigningMethod)) {
			var needStampUpload = (record.legalStampedContractUploaded === false) && !(_stampedUploadedOverride[0][record.id] === true);
			if (needStampUpload) {
				items.push({
					key: 'uploadStamped',
					label: '上传盖章合同',
					onClick: function() { openStampUploadModal(record, 'legal'); },
				});
			}
		}
		return items;
	}

	function openStampUploadModal(record, mode) {
		_stampModalMode[1](mode || 'legal');
		_stampModalRecord[1](record);
		_stampFileList[1]([]);
		_stampPartyBEmail[1](mode === 'supplement' ? resolvePartyBEmailForStamp(record) : '');
		_stampModalVisible[1](true);
	}

	function closeStampUploadModal() {
		_stampModalVisible[1](false);
		_stampModalRecord[1](null);
		_stampFileList[1]([]);
		_stampPartyBEmail[1]('');
		_stampEmailSending[1](false);
		_stampEmailSent[1](false);
		_stampModalMode[1]('legal');
	}

	function renderStampModalIcon(type) {
		var paths = {
			download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
			mail: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
			upload: 'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z',
			check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
			file: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
		};
		return React.createElement('svg', {
			className: 'lc-stamp-modal__icon',
			viewBox: '0 0 24 24',
			width: 18,
			height: 18,
			fill: 'currentColor',
			'aria-hidden': true,
		}, React.createElement('path', { d: paths[type] || paths.file }));
	}

	function handleSendPartyASignedContractEmail() {
		var rec = _stampModalRecord[0];
		var email = (_stampPartyBEmail[0] || '').trim();
		if (!isPartyBEmailValid(email)) {
			message.warning('请输入有效的乙方邮箱地址');
			return;
		}
		_stampEmailSending[1](true);
		setTimeout(function () {
			_stampEmailSending[1](false);
			_stampEmailSent[1](true);
			message.success('已将甲方已签章合同发送至 ' + email + '（原型）');
		}, 600);
	}

	function confirmStampUpload() {
		var rec = _stampModalRecord[0];
		var list = _stampFileList[0] || [];
		if (!list.length) {
			message.warning('请先选择要上传的文件');
			return;
		}
		var pending = list.some(function (f) { return f.status === 'uploading'; });
		if (pending) {
			message.warning('请等待文件上传完成');
			return;
		}
		_stampedUploadedOverride[1](function (prev) {
			var n = Object.assign({}, prev);
			if (rec) n[rec.id] = true;
			return n;
		});
		_stampedFilesOverride[1](function (prev) {
			var n = Object.assign({}, prev);
			if (rec) {
				n[rec.id] = list.map(function (file) {
					return {
						uid: file.uid,
						name: file.name,
						type: file.type || '',
					};
				});
			}
			return n;
		});
		_stampedCompletedAtOverride[1](function (prev) {
			var n = Object.assign({}, prev);
			if (rec) n[rec.id] = formatStampUploadCompletedMinute();
			return n;
		});
		message.success(_stampModalMode[0] === 'supplement'
			? '盖章合同已补传（原型），查看时可预览与下载全部附件'
			: '盖章合同已上传（原型）');
		closeStampUploadModal();
	}

	function renderStampUploadModal() {
		var rec = _stampModalRecord[0];
		var mode = _stampModalMode[0];
		var isSupplement = mode === 'supplement';
		var fileList = _stampFileList[0] || [];
		var fileCount = fileList.length;
		var email = (_stampPartyBEmail[0] || '').trim();
		var emailReady = isPartyBEmailValid(email);

		return React.createElement(Modal, {
			title: isSupplement ? '盖章合同补传' : '上传盖章合同',
			open: _stampModalVisible[0],
			onCancel: closeStampUploadModal,
			width: isSupplement ? 680 : 560,
			className: 'lc-stamp-upload-modal',
			destroyOnClose: true,
			footer: [
				React.createElement(Button, { key: 'cancel', onClick: closeStampUploadModal }, '取消'),
				React.createElement(Button, {
					key: 'ok',
					type: 'primary',
					disabled: !fileCount,
					onClick: confirmStampUpload,
				}, fileCount ? ('确认上传（' + fileCount + '）') : '确认上传'),
			],
		},
			React.createElement('div', {
				className: 'lc-stamp-modal' + (isSupplement ? ' lc-stamp-modal--supplement' : ''),
				'data-annotation-id': 'lc-stamp-supplement-modal',
			},
				isSupplement
					? React.createElement('div', { className: 'lc-stamp-modal__hero' },
						React.createElement('div', { className: 'lc-stamp-modal__hero-main' },
							React.createElement('span', { className: 'lc-stamp-modal__hero-label' }, '合同编码'),
							React.createElement('span', { className: 'lc-stamp-modal__hero-code' }, rec ? rec.contractCode : '-'),
						),
						rec && (rec.customerName || rec.projectName)
							? React.createElement('p', { className: 'lc-stamp-modal__hero-sub' },
								[rec.customerName, rec.projectName].filter(Boolean).join(' · '),
							)
							: null,
					)
					: React.createElement('div', { className: 'lc-stamp-modal__meta' },
						'合同编码：',
						React.createElement('span', { className: 'lc-stamp-modal__meta-value' }, rec ? rec.contractCode : '-'),
					),
				isSupplement
					? React.createElement('div', { className: 'lc-stamp-modal__steps', role: 'list', 'aria-label': '补传流程' },
						React.createElement('div', { className: 'lc-stamp-modal__step is-active', role: 'listitem' },
							React.createElement('span', { className: 'lc-stamp-modal__step-num' }, '1'),
							React.createElement('span', { className: 'lc-stamp-modal__step-text' }, '发送甲方合同给乙方'),
						),
						React.createElement('span', { className: 'lc-stamp-modal__step-line', 'aria-hidden': true }),
						React.createElement('div', { className: 'lc-stamp-modal__step' + (fileCount ? ' is-active' : ''), role: 'listitem' },
							React.createElement('span', { className: 'lc-stamp-modal__step-num' }, '2'),
							React.createElement('span', { className: 'lc-stamp-modal__step-text' }, '上传乙方盖章合同'),
						),
					)
					: null,
				isSupplement
					? React.createElement('section', {
						className: 'lc-stamp-modal__section',
						'data-annotation-id': 'lc-stamp-send-to-party-b',
					},
						React.createElement('header', { className: 'lc-stamp-modal__section-head' },
							React.createElement('h4', { className: 'lc-stamp-modal__section-title' }, '发送甲方已签章合同给乙方'),
							React.createElement('p', { className: 'lc-stamp-modal__section-desc' }, '任选一种方式将甲方已签章合同交付乙方，便于乙方盖章后回传。'),
						),
						React.createElement('div', { className: 'lc-stamp-modal__method-grid' },
							React.createElement('article', { className: 'lc-stamp-modal__method-card' },
								React.createElement('div', { className: 'lc-stamp-modal__method-head' },
									React.createElement('span', { className: 'lc-stamp-modal__method-badge' }, '方式 1'),
									React.createElement('span', { className: 'lc-stamp-modal__method-icon', 'aria-hidden': true },
										renderStampModalIcon('download'),
									),
								),
								React.createElement('p', { className: 'lc-stamp-modal__method-title' }, '手动下载并发送'),
								React.createElement('p', { className: 'lc-stamp-modal__method-desc' },
									'下载甲方已签章合同 PDF，通过线下渠道发送给乙方负责人。',
								),
								React.createElement(Button, {
									type: 'default',
									className: 'lc-stamp-modal__method-btn',
									onClick: function () {
										if (!rec) return;
										downloadPartyASignedContract(rec);
										message.success('已开始下载甲方已签章合同（原型）');
									},
								},
									renderStampModalIcon('download'),
									'下载合同（甲方已签章）',
								),
							),
							React.createElement('article', { className: 'lc-stamp-modal__method-card' },
								React.createElement('div', { className: 'lc-stamp-modal__method-head' },
									React.createElement('span', { className: 'lc-stamp-modal__method-badge' }, '方式 2'),
									React.createElement('span', { className: 'lc-stamp-modal__method-icon', 'aria-hidden': true },
										renderStampModalIcon('mail'),
									),
								),
								React.createElement('p', { className: 'lc-stamp-modal__method-title' }, '发送至乙方邮箱'),
								React.createElement('p', { className: 'lc-stamp-modal__method-desc' },
									'系统将甲方已签章合同以邮件附件形式发送至乙方邮箱。',
								),
								React.createElement('div', { className: 'lc-stamp-modal__email-field' },
									React.createElement('label', { className: 'lc-stamp-modal__email-label', htmlFor: 'lc-stamp-party-b-email' }, '乙方邮箱'),
									React.createElement('div', { className: 'lc-stamp-modal__email-row' },
										React.createElement(Input, {
											id: 'lc-stamp-party-b-email',
											className: 'lc-stamp-modal__email-input vm-focus-border',
											placeholder: '请输入乙方邮箱地址',
											value: _stampPartyBEmail[0],
											allowClear: true,
											status: email && !emailReady ? 'error' : undefined,
											onChange: function (e) {
												_stampPartyBEmail[1](e.target.value);
												_stampEmailSent[1](false);
											},
											onPressEnter: handleSendPartyASignedContractEmail,
										}),
										React.createElement(Button, {
											type: 'primary',
											className: 'lc-stamp-modal__email-send-btn',
											loading: _stampEmailSending[0],
											disabled: !emailReady || _stampEmailSending[0],
											onClick: handleSendPartyASignedContractEmail,
										}, '发送'),
									),
									email && !emailReady
										? React.createElement('p', { className: 'lc-stamp-modal__email-error' }, '请输入有效的邮箱地址')
										: null,
								),
							),
						),
						_stampEmailSent[0]
							? React.createElement('div', { className: 'lc-stamp-modal__sent-banner', role: 'status' },
								renderStampModalIcon('check'),
								React.createElement('span', null, '已发送至 ', React.createElement('strong', null, email)),
							)
							: null,
					)
					: null,
				React.createElement('section', { className: 'lc-stamp-modal__section lc-stamp-modal__section--upload' },
					isSupplement
						? React.createElement('header', { className: 'lc-stamp-modal__section-head' },
							React.createElement('h4', { className: 'lc-stamp-modal__section-title' }, '上传乙方盖章合同'),
							React.createElement('p', { className: 'lc-stamp-modal__section-desc' },
								'支持 PDF、PNG、JPG 等格式；可一次选择多个附件，补传后可在「查看」中预览与下载。',
							),
						)
						: React.createElement('p', { className: 'lc-stamp-modal__hint' }, '支持上传多个 PDF 或图片文件。'),
					React.createElement('div', { className: 'lc-stamp-modal__upload-panel' },
						React.createElement(Upload.Dragger, {
							multiple: true,
							accept: isSupplement ? '.pdf,.png,.jpg,.jpeg,.webp' : '.pdf,.doc,.docx,image/*',
							fileList: fileList,
							onChange: function (info) { _stampFileList[1](info.fileList); },
							customRequest: function (opts) {
								setTimeout(function () {
									if (opts.onSuccess) opts.onSuccess('ok');
								}, 200);
							},
							showUploadList: { showRemoveIcon: true, showPreviewIcon: false },
						},
							React.createElement('div', { className: 'lc-stamp-modal__dropzone' },
								React.createElement('span', { className: 'lc-stamp-modal__dropzone-icon', 'aria-hidden': true },
									renderStampModalIcon('upload'),
								),
								React.createElement('p', { className: 'lc-stamp-modal__dropzone-title' }, '点击或拖拽文件到此处上传'),
								React.createElement('p', { className: 'lc-stamp-modal__dropzone-hint' }, '支持多文件、可分批添加'),
							),
						),
					),
					fileCount
						? React.createElement('div', { className: 'lc-stamp-modal__file-summary', role: 'status' },
							renderStampModalIcon('file'),
							React.createElement('span', null, '已选择 ', React.createElement('strong', null, fileCount), ' 个附件，确认后将归档至合同档案'),
						)
						: null,
				),
			),
		);
	}

	function renderMileageProgressBarRow(percent, ariaLabel) {
		percent = Math.min(100, Math.max(0, Number(percent) || 0));
		return React.createElement('div', { className: 'lc-contract-mileage-completion__bar-row' },
			React.createElement('div', {
				className: 'lc-vehicle-mileage-progress__track',
				role: 'progressbar',
				'aria-valuenow': percent,
				'aria-valuemin': 0,
				'aria-valuemax': 100,
				'aria-label': ariaLabel,
			},
				React.createElement('div', {
					className: 'lc-vehicle-mileage-progress__bar',
					style: { width: percent + '%' },
				}),
			),
			React.createElement('span', { className: 'lc-vehicle-mileage-progress__label tabular-nums' }, percent + '%'),
		);
	}

	function renderOverallMileageProgressCell(_, record) {
		if (!record || !record.hasMinimumMileage) {
			return React.createElement('div', { className: 'lc-overall-mileage-progress lc-overall-mileage-progress--empty' }, '无里程要求');
		}
		var percent = record.overallMileageProgress;
		if (percent == null) percent = computeContractOverallMileageProgress(record);
		percent = Math.min(100, Math.max(0, Number(percent) || 0));
		var forecastStatus = record.overallMileageForecastStatus || computeContractMileageForecastStatus(record);
		var forecastTone = getContractMileageForecastStatusTone(forecastStatus);
		return React.createElement('div', { className: 'lc-overall-mileage-progress' },
			React.createElement('div', { className: 'lc-overall-mileage-progress__bar-row' },
				React.createElement('div', {
					className: 'lc-vehicle-mileage-progress__track',
					role: 'progressbar',
					'aria-valuenow': percent,
					'aria-valuemin': 0,
					'aria-valuemax': 100,
					'aria-label': '整体里程完成 ' + percent + '%',
				},
					React.createElement('div', {
						className: 'lc-vehicle-mileage-progress__bar',
						style: { width: percent + '%' },
					}),
				),
				React.createElement('span', { className: 'lc-vehicle-mileage-progress__label tabular-nums' }, percent + '%'),
			),
			forecastStatus
				? React.createElement('div', { className: 'lc-overall-mileage-progress__forecast' },
					React.createElement(StatusTag, {
						label: forecastStatus,
						tone: forecastTone,
						title: '基于近7天日均里程与本期剩余天数推算的合同整体完成预判',
					}),
				)
				: null,
		);
	}

	function renderPickupReceivableCell(vehicle) {
		if (!isContractVehicleDelivered(vehicle)) {
			return React.createElement('div', { className: 'lc-contract-pickup-payment lc-contract-pickup-payment--empty' }, '—');
		}
		var paid = Boolean(vehicle.pickupPaymentPaid);
		var plate = getVehiclePlateDisplayLabel(vehicle.plateNo);
		var tag = React.createElement(StatusTag, {
			label: paid ? '已支付' : '未支付',
			tone: paid ? 'green' : 'red',
		});
		if (!paid) {
			return React.createElement('div', { className: 'lc-contract-pickup-payment' }, tag);
		}
		return React.createElement('div', { className: 'lc-contract-pickup-payment' },
			React.createElement('button', {
				type: 'button',
				className: 'lc-contract-status-tag-btn',
				title: '点击查看提车应收款详情：' + plate,
				onClick: function () {
					if (typeof window !== 'undefined') {
						window.location.href = '/prototypes/vehicle-pickup-receivable';
					} else {
						message.info('即将跳转至提车应收款详情（原型演示）：' + plate);
					}
				},
			}, tag),
		);
	}

	function renderLeaseBillCell(vehicle) {
		var status = resolveLeaseBillStatus(vehicle);
		if (!status) {
			return React.createElement('div', { className: 'lc-contract-lease-bill lc-contract-lease-bill--empty' });
		}
		return React.createElement('div', { className: 'lc-contract-lease-bill' },
			React.createElement(StatusTag, {
				label: status,
				tone: getLeaseBillStatusTone(status),
				title: status === '欠费' ? '存在未结清租赁账单' : '租赁账单状态正常',
			}),
		);
	}

	function renderReturnSettlementCell(vehicle) {
		if (!isContractVehicleReturned(vehicle)) {
			return React.createElement('div', { className: 'lc-contract-return-settlement lc-contract-return-settlement--empty' });
		}
		var status = vehicle.returnSettlementStatus || '待提交';
		var displayLabel = resolveReturnSettlementDisplayLabel(status);
		var tone = getReturnSettlementDisplayTone(displayLabel);
		var mode = resolveReturnSettlementCellMode(status);
		var plate = getVehiclePlateDisplayLabel(vehicle.plateNo);
		var tag = React.createElement(StatusTag, {
			label: displayLabel,
			tone: tone,
			title: displayLabel,
		});
		var tagNode = mode
			? React.createElement('button', {
				type: 'button',
				className: 'lc-contract-status-tag-btn',
				title: mode === 'edit'
					? ('点击处理还车应结款：' + plate)
					: ('点击查看还车应结款：' + plate),
				onClick: function () {
					if (mode === 'edit') {
						message.info('即将跳转至还车应结款编辑页（原型演示）：' + plate);
					} else {
						message.info('即将跳转至还车应结款查看页（原型演示）：' + plate);
					}
				},
			}, tag)
			: tag;
		var approver = vehicle.returnSettlementApprover;
		var showApprover = displayLabel === '审批中' && approver;
		if (showApprover) {
			return React.createElement('div', { className: 'lc-approval-status-cell lc-approval-status-cell--inline' },
				React.createElement('span', { className: 'lc-approval-status-cell__tag-wrap' }, tagNode),
				renderApproversInline(approver),
			);
		}
		return React.createElement('div', { className: 'lc-contract-return-settlement' }, tagNode);
	}

	function renderMileageRequirementCell(contractRecord, vehicle) {
		var hasRequirement = contractRecord && contractRecord.hasMinimumMileage;
		var requirementNode;
		if (!hasRequirement) {
			requirementNode = React.createElement('div', {
				className: 'lc-contract-mileage-req-row__requirement lc-contract-mileage-req-row__requirement--empty',
			}, '无里程要求');
		} else {
			var kmText = formatContractMileageTargetKm(contractRecord.mileageTargetKm);
			var periodTag = getContractMileagePeriodTag(contractRecord.mileagePeriod);
			requirementNode = React.createElement('div', { className: 'lc-contract-mileage-req-row__requirement' },
				React.createElement('span', { className: 'lc-contract-mileage-req-row__section-label' }, '里程要求'),
				React.createElement('div', { className: 'vm-cell-tags lc-contract-mileage-req-row__km-line' },
					React.createElement('span', { className: 'vm-mileage tabular-nums', title: kmText }, kmText),
					periodTag
						? React.createElement('span', { className: 'vm-tag vm-tag-manual lc-contract-mileage-period-tag' }, periodTag)
						: null,
				),
			);
		}
		var mileText = formatContractVehicleCurrentMileage(vehicle.currentMileage, vehicle, '—');
		var hasMileageReading = mileText !== '—';
		var mileageSource = resolveContractVehicleMileageSource(vehicle);
		var sourceTagClass = getContractVehicleMileageSourceTagClass(mileageSource);
		var currentNode;
		if (!hasRequirement || !isContractVehicleDelivered(vehicle)) {
			currentNode = React.createElement('div', {
				className: 'lc-contract-mileage-req-row__current lc-contract-mileage-req-row__current--empty',
			}, '—');
		} else {
			currentNode = React.createElement('div', { className: 'lc-contract-mileage-req-row__current' },
				React.createElement('span', { className: 'lc-contract-mileage-req-row__section-label' }, '当前里程'),
				React.createElement('div', { className: 'vm-cell-tags lc-contract-mileage-req-row__current-line' },
					React.createElement('span', { className: 'vm-mileage tabular-nums', title: mileText }, mileText),
					hasMileageReading
						? React.createElement('span', { className: sourceTagClass }, mileageSource)
						: null,
				),
			);
		}
		return React.createElement('div', { className: 'lc-contract-mileage-req-row lc-contract-mileage-req-row--dual' },
			requirementNode,
			currentNode,
		);
	}

	function getMileageCompletionRangeData(vehicle, contractRecord) {
		if (!contractRecord || !contractRecord.hasMinimumMileage || !isContractVehicleDelivered(vehicle)) {
			return null;
		}
		var startDate = vehicle.periodStartDate;
		var periodEndDate = startDate && contractRecord.mileagePeriod
			? computeCurrentMileagePeriodEnd(startDate, contractRecord.mileagePeriod)
			: null;
		var startDateText = formatContractPeriodStartDate(startDate);
		var endDateText = formatContractPeriodStartDate(periodEndDate);
		var startMileText = formatContractHandoverMileage(vehicle.periodStartMileage);
		var targetMileage = computeVehiclePeriodTargetMileage(contractRecord, vehicle);
		var endMileText = targetMileage != null ? formatContractHandoverMileage(targetMileage) : '—';
		if (startDateText === '—' && startMileText === '—' && endDateText === '—' && endMileText === '—') {
			return null;
		}
		return {
			startDateText: startDateText,
			startMileText: startMileText,
			endDateText: endDateText,
			endMileText: endMileText,
		};
	}

	function renderMileageCompletionRangeEnd(rangeData) {
		if (!rangeData) return null;
		return React.createElement('div', {
			className: 'lc-contract-mileage-completion__range-side lc-contract-mileage-completion__range-side--end',
		},
			React.createElement('span', {
				className: 'lc-contract-mileage-completion__range-date tabular-nums',
				title: '到达时间 ' + rangeData.endDateText,
			}, rangeData.endDateText),
			React.createElement('span', {
				className: 'lc-contract-mileage-completion__range-mile tabular-nums',
				title: '到达里程 ' + rangeData.endMileText,
			}, rangeData.endMileText),
		);
	}

	function renderMileageCompletionRangeStart(rangeData) {
		if (!rangeData) return null;
		return React.createElement('div', {
			className: 'lc-contract-mileage-completion__range-side lc-contract-mileage-completion__range-side--start',
			'aria-label': '行程起点',
		},
			React.createElement('span', {
				className: 'lc-contract-mileage-completion__range-date tabular-nums',
				title: '开始时间 ' + rangeData.startDateText,
			}, rangeData.startDateText),
			React.createElement('span', {
				className: 'lc-contract-mileage-completion__range-mile tabular-nums',
				title: '开始里程 ' + rangeData.startMileText,
			}, rangeData.startMileText || '—'),
		);
	}

	function renderMileageCompletionCell(vehicle, contractRecord) {
		if (!contractRecord || !contractRecord.hasMinimumMileage) {
			return React.createElement('div', { className: 'lc-contract-mileage-completion lc-contract-mileage-completion--empty' }, '—');
		}
		var delivered = isContractVehicleDelivered(vehicle);
		var remainingNode = null;
		if (delivered) {
			var remainingText = formatContractVehicleRemainingMileage(vehicle.remainingMileage);
			var forecastStatus = vehicle.mileageForecastStatus || computeVehicleMileageForecastStatus(contractRecord, vehicle);
			var forecastTone = getContractMileageForecastStatusTone(forecastStatus);
			remainingNode = React.createElement('div', { className: 'lc-contract-mileage-completion__remaining-row' },
				React.createElement('div', {
					className: 'lc-contract-mileage-completion__remaining tabular-nums',
					title: remainingText,
				}, remainingText),
				forecastStatus
					? React.createElement(StatusTag, {
						label: forecastStatus,
						tone: forecastTone,
						title: '基于近7天日均里程与本期剩余天数推算的单车完成预判',
					})
					: null,
			);
		}
		var rangeData = getMileageCompletionRangeData(vehicle, contractRecord);
		var percent = Math.min(100, Math.max(0, Number(vehicle.mileageProgress) || 0));
		var rangeRow = rangeData
			? React.createElement('div', { className: 'lc-contract-mileage-completion__range-row' },
				renderMileageCompletionRangeStart(rangeData),
				renderMileageCompletionRangeEnd(rangeData),
			)
			: null;
		return React.createElement('div', { className: 'lc-contract-mileage-completion' },
			remainingNode,
			renderMileageProgressBarRow(percent, '里程完成 ' + percent + '%'),
			rangeRow,
		);
	}

	function renderContractVehicleActionCell(vehicle, record) {
		if (!canContractVehicleReturn(vehicle, record)) {
			return React.createElement('span', { className: 'lc-contract-vehicle-action-empty' }, '—');
		}
		var plate = getVehiclePlateDisplayLabel(vehicle.plateNo);
		return React.createElement(Button, {
			type: 'link',
			size: 'small',
			className: 'lc-contract-vehicle-action-btn',
			onClick: function () {
				message.info('即将跳转至还车管理（原型演示）：' + plate);
			},
		}, '还车');
	}

	function formatVehicleBrandModelLabel(vehicle) {
		var brand = vehicle.brand || '';
		var model = vehicle.model || '';
		if (brand && model) return brand + ' · ' + model;
		return brand || model || '-';
	}

	function renderVehicleInfoCell(vehicle) {
		var plateLabel = getVehiclePlateDisplayLabel(vehicle.plateNo);
		var vinLabel = vehicle.vin && String(vehicle.vin).trim() ? vehicle.vin : '-';
		var brandModelLabel = formatVehicleBrandModelLabel(vehicle);
		return React.createElement('div', { className: 'lc-contract-vehicle-info' },
			React.createElement('div', {
				className: 'lc-contract-vehicle-info__line lc-contract-vehicle-info__line--primary tabular-nums',
				title: plateLabel,
			}, plateLabel),
			React.createElement('div', {
				className: 'lc-contract-vehicle-info__line lc-contract-vehicle-info__line--primary lc-contract-vehicle-info__line--vin tabular-nums',
				title: vinLabel,
			}, vinLabel),
			React.createElement('div', {
				className: 'lc-contract-vehicle-info__line lc-contract-vehicle-info__line--secondary',
				title: brandModelLabel,
			}, brandModelLabel),
		);
	}

	function formatContractHandoverDateTimeCompact(raw) {
		var full = formatContractHandoverDateTimeMinute(raw);
		if (!full) return '';
		var match = full.match(/^(\d{4})-(\d{2}-\d{2})[ T](\d{2}:\d{2})$/);
		if (match) return match[2] + ' ' + match[3];
		if (/^\d{4}-(\d{2}-\d{2})$/.test(full)) return full.replace(/^\d{4}-/, '');
		return full;
	}

	function renderHandoverSituationCell(vehicle, kind, options) {
		options = options || {};
		var compact = Boolean(options.compact);
		var emptyLabel = kind === 'delivery' ? '未交车' : '未还车';
		var hasData = kind === 'delivery'
			? isContractVehicleDelivered(vehicle)
			: isContractVehicleReturned(vehicle);
		if (!hasData) {
			return React.createElement('div', {
				className: 'lc-contract-handover-situation lc-contract-handover-situation--empty',
			}, emptyLabel);
		}
		var mile = kind === 'delivery' ? vehicle.deliveryMileage : vehicle.returnMileage;
		var person = kind === 'delivery' ? vehicle.deliveryPerson : vehicle.returnPerson;
		var time = kind === 'delivery' ? vehicle.deliveryTime : vehicle.returnTime;
		var mileText = formatContractHandoverMileage(mile);
		var personText = person && String(person).trim() && person !== '-' ? String(person).trim() : '-';
		var timeTextFull = formatContractHandoverDateTimeMinute(time);
		var timeText = compact
			? formatContractHandoverDateTimeCompact(time)
			: timeTextFull;
		var plate = getVehiclePlateDisplayLabel(vehicle.plateNo);
		var jumpTitle = kind === 'delivery'
			? '点击查看交车管理：' + plate
			: '点击查看还车管理：' + plate;
		return React.createElement('button', {
			type: 'button',
			className: 'lc-contract-handover-situation lc-contract-handover-situation--clickable',
			title: jumpTitle,
			onClick: function () {
				if (kind === 'delivery') {
					message.info('即将跳转至交车管理（原型演示）：' + plate);
				} else {
					message.info('即将跳转至还车管理（原型演示）：' + plate);
				}
			},
		},
			React.createElement('div', {
				className: 'lc-contract-handover-situation__line lc-contract-handover-situation__line--mile tabular-nums',
				title: mileText,
			}, mileText || '-'),
			React.createElement('div', {
				className: 'lc-contract-handover-situation__line lc-contract-handover-situation__line--person',
				title: personText,
			}, personText),
			React.createElement('div', {
				className: 'lc-contract-handover-situation__line lc-contract-handover-situation__line--time tabular-nums',
				title: timeTextFull || timeText,
			}, timeText || '-'),
		);
	}

	function renderVehicleDeliveryPlanCell(record, vehicle, vehicleIndex) {
		var regionLabel = formatContractDeliveryRegionLabel(record);
		var dateLabel = formatVehicleDeliveryPlanDateLabel(vehicle, record);
		var delivered = isContractVehicleDelivered(vehicle);
		var isTbd = !delivered && resolveVehicleDeliveryDateTbd(vehicle, record);
		var target = _vehicleDeliveryChangeTarget[0];
		var popoverOpen = Boolean(
			target
			&& target.recordId === record.id
			&& target.vehicleIndex === vehicleIndex,
		);
		return React.createElement('div', { className: 'lc-delivery-cell lc-delivery-cell--vehicle' },
			React.createElement('span', {
				className: 'lc-delivery-cell__region',
				title: regionLabel,
			}, regionLabel),
			React.createElement('div', { className: 'lc-delivery-cell__date-row' },
				React.createElement('span', {
					className: 'lc-delivery-cell__date tabular-nums' + (isTbd ? ' lc-delivery-cell__date--tbd' : ''),
					title: delivered ? '实际交车 ' + dateLabel : '计划交车 ' + dateLabel,
				}, dateLabel),
				delivered
					? null
					: React.createElement(Popover, {
						overlayClassName: 'lc-delivery-change-popover',
						placement: 'bottom',
						trigger: 'click',
						arrow: { pointAtCenter: true },
						destroyTooltipOnHide: true,
						open: popoverOpen,
						title: null,
						content: renderVehicleDeliveryChangePanel(record, vehicle, vehicleIndex),
						onOpenChange: function (visible) {
							if (!visible) {
								closeVehicleDeliveryChangePopover();
								return;
							}
							closeDeliveryChangePopover();
							_vehiclePopoverRecord[1](null);
							closeDelegatePopover();
							var vehicleTbd = resolveVehicleDeliveryDateTbd(vehicle, record);
							_vehicleDeliveryChangeTarget[1]({
								recordId: record.id,
								vehicleIndex: vehicleIndex,
							});
							_vehicleDeliveryChangeDraftTbd[1](!!vehicleTbd);
							_vehicleDeliveryChangeDraftDate[1](vehicleTbd
								? null
								: (resolveVehiclePlannedDeliveryDate(vehicle, record) || null));
						},
					},
						React.createElement('button', {
							type: 'button',
							className: 'lc-delivery-cell__edit-btn',
							'aria-label': '编辑本车交车时间',
						}, renderDeliveryEditIcon()),
					),
			),
		);
	}

	function renderContractVehicleNativeTableHeader() {
		return React.createElement('thead', null,
			React.createElement('tr', null,
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__info' }, '车辆信息'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__pickup' }, '提车应收款'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__handover', title: '交车情况' }, '交车'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__lease-bill', title: '租赁账单状态' }, '租赁账单'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__handover', title: '还车情况' }, '还车'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__return-settlement' }, '还车应结款'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__delivery-plan', title: '交车安排' }, '交车安排'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__mileage-req', title: '里程要求' }, '里程要求'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__mileage-completion', title: '里程完成情况' }, '里程完成情况'),
				React.createElement('th', { scope: 'col', className: 'lc-contract-vehicle-native-table__action' }, '操作'),
			),
		);
	}

	function renderContractVehicleNativeTableRow(record, vehicle, index, rowKey) {
		return React.createElement('tr', { key: rowKey || (record.id + '-vehicle-' + index) },
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__info' }, renderVehicleInfoCell(vehicle)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__pickup' }, renderPickupReceivableCell(vehicle)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__handover' }, renderHandoverSituationCell(vehicle, 'delivery', { compact: true })),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__lease-bill' }, renderLeaseBillCell(vehicle)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__handover' }, renderHandoverSituationCell(vehicle, 'return', { compact: true })),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__return-settlement' }, renderReturnSettlementCell(vehicle)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__delivery-plan' }, renderVehicleDeliveryPlanCell(record, vehicle, index)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__mileage-req' }, renderMileageRequirementCell(record, vehicle)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__mileage-completion' }, renderMileageCompletionCell(vehicle, record)),
			React.createElement('td', { className: 'lc-contract-vehicle-native-table__action' }, renderContractVehicleActionCell(vehicle, record)),
		);
	}

	function getContractVehiclesForExpandedRow(record) {
		var vehicles = record.vehicles || [];
		if (_expandedRowVehicleFilter[0][record.id] === 'delivered') {
			return vehicles.filter(function (vehicle) {
				return isContractVehicleDelivered(vehicle);
			});
		}
		return vehicles;
	}

	function renderExpandedVehicleTable(record) {
		var vehicles = getContractVehiclesForExpandedRow(record);
		var isDeliveredOnly = _expandedRowVehicleFilter[0][record.id] === 'delivered';
		if (!vehicles.length) {
			return React.createElement('div', { className: 'lc-contract-vehicle-expand__empty' },
				isDeliveredOnly ? '暂无已交车记录' : '暂无车辆明细',
			);
		}
		return React.createElement('div', { className: 'lc-contract-vehicle-table-wrap' },
			React.createElement('table', { className: 'lc-contract-vehicle-native-table' },
				renderContractVehicleNativeTableHeader(),
				React.createElement('tbody', null,
					vehicles.map(function (vehicle, index) {
						return renderContractVehicleNativeTableRow(record, vehicle, index);
					}),
				),
			),
		);
	}

	function approvalStatusTone(status) {
		switch (status) {
			case '审批通过': return 'green';
			case '审批中': return 'amber';
			case '待审批': return 'blue';
			case '审批驳回': return 'red';
			case '审批终止': return 'red';
			case '撤回': return 'gray';
			case '未提交': return 'gray';
			default: return 'gray';
		}
	}

	function contractStatusTone(status) {
		switch (status) {
			case '合同进行中': return 'green';
			case '已提交审批': return 'blue';
			case '已终止': return 'red';
			case '草稿': return 'gray';
			default: return 'gray';
		}
	}

	function renderApprovalStatusCell(_, record) {
		var status = record.approvalStatus || '-';
		var approver = getCurrentApproverLabel(record);
		var showApprover = !shouldHideCurrentApprover(status) && approver;
		var nodes = record.approvalFlowNodes;
		var hasFlowPopover = canShowApprovalFlowPopover(status, nodes);
		var tone = approvalStatusTone(status);
		var statusTag = React.createElement(StatusTag, {
			label: status,
			tone: tone,
			title: hasFlowPopover ? '悬停查看审批流' : status,
		});

		var statusContent = hasFlowPopover
			? React.createElement(Popover, {
				content: renderApprovalFlowContent(nodes, record),
				trigger: 'hover',
				placement: 'rightTop',
				overlayClassName: 'lc-approval-flow-popover',
				overlayInnerStyle: { maxWidth: 400 },
				mouseEnterDelay: 0.15,
			},
				React.createElement('span', {
					className: 'lc-approval-status-cell__tag-wrap lc-approval-status-cell__tag-wrap--interactive',
				}, statusTag),
			)
			: statusTag;

		return React.createElement('div', {
			className: 'lc-approval-status-cell'
				+ (showApprover ? ' lc-approval-status-cell--inline' : ''),
		},
			statusContent,
			showApprover ? renderApproversInline(approver) : null,
		);
	}

	function renderSigningCompanyCell(_, record) {
		var fullName = record.signingCompanyFullName || record.signingCompany || '-';
		return React.createElement('span', {
			className: 'lc-signing-company-cell',
			title: fullName,
		}, fullName);
	}

	function setContractRowExpanded(recordId, expanded, filterMode) {
		_expandedRowKeys[1](function (prev) {
			var has = prev.indexOf(recordId) >= 0;
			if (expanded && !has) return prev.concat([recordId]);
			if (!expanded && has) return prev.filter(function (key) { return key !== recordId; });
			return prev;
		});
		_expandedRowVehicleFilter[1](function (prev) {
			var next = Object.assign({}, prev);
			if (expanded && filterMode) next[recordId] = filterMode;
			else delete next[recordId];
			return next;
		});
	}

	function toggleContractRowExpand(recordId, filterMode) {
		var expanded = _expandedRowKeys[0].indexOf(recordId) >= 0;
		var currentFilter = _expandedRowVehicleFilter[0][recordId] || 'all';
		var nextFilter = filterMode || 'all';
		if (expanded && currentFilter === nextFilter) {
			setContractRowExpanded(recordId, false);
			return;
		}
		setContractRowExpanded(recordId, true, nextFilter);
	}

	function renderContractRowExpandIcon(record) {
		var vehicles = record.vehicles || [];
		var expandable = vehicles.length > 0;
		var expanded = _expandedRowKeys[0].indexOf(record.id) >= 0;
		if (!expandable) {
			return React.createElement('span', {
				className: 'ant-table-row-expand-icon ant-table-row-expand-icon-spaced',
				'aria-hidden': true,
			});
		}
		return React.createElement('span', {
			className: 'ant-table-row-expand-icon ' + (expanded ? 'ant-table-row-expand-icon-expanded' : 'ant-table-row-expand-icon-collapsed'),
			role: 'button',
			tabIndex: 0,
			'aria-label': expanded ? '收起车辆明细' : '展开车辆明细',
			'aria-expanded': expanded,
			onClick: function (e) {
				e.stopPropagation();
				_vehiclePopoverRecord[1](null);
				toggleContractRowExpand(record.id, 'all');
			},
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					e.stopPropagation();
					_vehiclePopoverRecord[1](null);
					toggleContractRowExpand(record.id, 'all');
				}
			},
		});
	}

	function renderProjectInfoCell(_, record) {
		var statusTags = resolveProjectInfoStatusTags(record);
		return React.createElement('div', { className: 'lc-project-info-merged-cell' },
			renderContractRowExpandIcon(record),
			React.createElement('div', { className: 'lc-project-info-cell' },
				React.createElement(
					'button',
					{
						type: 'button',
						className: 'lc-project-info-btn',
						onClick: function() { openContractView(record); },
						title: '合同详情'
					},
					React.createElement(
						'div',
						{ className: 'vm-stack' },
						React.createElement('span', { className: 'primary', title: record.projectName || undefined }, record.projectName || '-'),
						React.createElement('span', { className: 'code', title: record.contractCode || undefined }, record.contractCode || '-'),
						React.createElement('span', { className: 'sub', title: record.customerName || undefined }, record.customerName || '-')
					)
				),
				React.createElement('div', { className: 'lc-project-info-cell__status' },
					statusTags.map(function (label) {
						return React.createElement(StatusTag, {
							key: label,
							label: label,
							tone: projectInfoStatusTone(label),
							title: label,
						});
					}),
				),
			),
		);
	}

	function renderBusinessDeptCell(_, record) {
		return React.createElement(
			'div',
			{ className: 'vm-stack' },
			React.createElement('span', { className: 'primary' }, record.businessDept || '-'),
			React.createElement('span', { className: 'sub' }, record.businessOwner || '-')
		);
	}

	function renderStackCell(primary, sub, subClassName) {
		return React.createElement(
			'div',
			{ className: 'vm-stack' },
			React.createElement('span', { className: 'primary' }, primary || '-'),
			React.createElement('span', { className: subClassName || 'sub' }, sub || '-')
		);
	}

	function renderFeeInfoCell(_, record) {
		var paymentLabel = formatPaymentMethodLabel(record.paymentMethod);
		var periodLabel = formatPaymentPeriodLabel(record.paymentPeriod);
		var hydrogenLabel = formatHydrogenPaymentLabel(record.hydrogenPaymentMethod);
		var isPrepay = record.hydrogenPaymentMethod === 'prepay';
		return React.createElement('div', { className: 'lc-fee-info-cell' },
			React.createElement('div', {
				className: 'lc-fee-info-cell__side lc-fee-info-cell__side--payment' + (record.paymentMethod === 'postpay' ? ' is-postpay' : ''),
			},
				React.createElement('span', { className: 'lc-fee-info-cell__caption' }, '付款方式'),
				React.createElement('span', {
					className: 'lc-fee-info-cell__value',
					title: paymentLabel,
				}, paymentLabel),
			),
			React.createElement('span', { className: 'lc-fee-info-cell__sep', 'aria-hidden': true }),
			React.createElement('div', { className: 'lc-fee-info-cell__side lc-fee-info-cell__side--period' },
				React.createElement('span', { className: 'lc-fee-info-cell__caption' }, '付款周期'),
				React.createElement('span', {
					className: 'lc-fee-info-cell__value',
					title: periodLabel,
				}, periodLabel),
			),
			React.createElement('span', { className: 'lc-fee-info-cell__sep', 'aria-hidden': true }),
			React.createElement('div', {
				className: 'lc-fee-info-cell__side lc-fee-info-cell__side--hydrogen' + (isPrepay ? ' is-prepay' : ''),
			},
				React.createElement('span', { className: 'lc-fee-info-cell__caption' }, '氢费支付'),
				React.createElement('span', {
					className: 'lc-fee-info-cell__value',
					title: hydrogenLabel,
				}, hydrogenLabel),
			),
		);
	}

	function formatPrototypeOperateTime() {
		var dayjs = window.dayjs;
		if (dayjs) return dayjs().format('YYYY-MM-DD HH:mm:ss');
		var now = new Date();
		var pad = function (n) { return n < 10 ? '0' + n : String(n); };
		return now.getFullYear() + '-'
			+ pad(now.getMonth() + 1) + '-'
			+ pad(now.getDate()) + ' '
			+ pad(now.getHours()) + ':'
			+ pad(now.getMinutes()) + ':'
			+ pad(now.getSeconds());
	}

	function closeDeliveryChangePopover() {
		_deliveryChangePopoverRecord[1](null);
		_deliveryChangeDraftRegionMode[1]('region');
		_deliveryChangeDraftRegion[1]([]);
		_deliveryChangeDraftDateMode[1]('range');
		_deliveryChangeDraftDateRange[1](null);
		_deliveryChangeDraftDate[1](null);
		_deliveryChangeDraftTbd[1](false);
		closeSigningMethodPopover();
	}

	function initDeliveryChangeDraft(record) {
		var regionTbd = isContractDeliveryRegionTbd(record);
		var dateUnconfirmed = isContractDeliveryDateUnconfirmed(record);
		_deliveryChangeDraftRegionMode[1](regionTbd ? 'tbd' : 'region');
		_deliveryChangeDraftRegion[1](regionTbd ? [] : ((record.deliveryRegion || []).slice()));
		_deliveryChangeDraftDateMode[1](dateUnconfirmed ? 'unconfirmed' : 'range');
		if (record.deliveryDateStart && record.deliveryDateEnd) {
			_deliveryChangeDraftDateRange[1]([record.deliveryDateStart, record.deliveryDateEnd]);
			_deliveryChangeDraftDate[1](record.deliveryDateStart);
		} else {
			_deliveryChangeDraftDateRange[1](null);
			_deliveryChangeDraftDate[1](dateUnconfirmed ? null : (record.deliveryDate || null));
		}
		_deliveryChangeDraftTbd[1](dateUnconfirmed);
	}

	function renderDeliveryModeToggle(props) {
		return React.createElement('div', {
			className: 'lc-delivery-change__mode-toggle',
			role: 'radiogroup',
			'aria-label': props['aria-label'],
		},
			(props.options || []).map(function (option) {
				var active = props.value === option.value;
				return React.createElement('button', {
					key: option.value,
					type: 'button',
					role: 'radio',
					'aria-checked': active,
					className: 'lc-delivery-change__mode-btn' + (active ? ' is-active' : ''),
					onClick: function () { props.onChange(option.value); },
				}, option.label);
			}),
		);
	}

	function closeVehicleDeliveryChangePopover() {
		_vehicleDeliveryChangeTarget[1](null);
		_vehicleDeliveryChangeDraftDate[1](null);
		_vehicleDeliveryChangeDraftTbd[1](false);
	}

	function confirmDeliveryArrangementChange(record) {
		var regionMode = _deliveryChangeDraftRegionMode[0];
		var regionTbd = regionMode === 'tbd';
		var region = regionTbd ? [] : (_deliveryChangeDraftRegion[0] || []).slice();
		var dateMode = _deliveryChangeDraftDateMode[0];
		var dateUnconfirmed = dateMode === 'unconfirmed';
		var dateRange = _deliveryChangeDraftDateRange[0] || [];
		var dateStart = dateUnconfirmed ? null : (dateRange[0] || _deliveryChangeDraftDate[0] || null);
		var dateEnd = dateUnconfirmed ? null : (dateRange[1] || null);
		if (!regionTbd && (!region || region.length < 2)) {
			message.warning('请选择车辆交付（交还）地点，或选择交还车时约定');
			return;
		}
		if (!dateUnconfirmed && (!dateStart || !dateEnd)) {
			message.warning('请选择车辆交付时间范围，或选择暂未确认');
			return;
		}

		var oldRegionLabel = formatContractDeliveryRegionLabel(record);
		var oldDateLabel = formatContractDeliveryDateLabel(record);
		var nextRegionLabel = regionTbd ? DELIVERY_REGION_TBD_LABEL : formatDeliveryRegion(region);
		var nextDateLabel = dateUnconfirmed
			? LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL
			: (dateStart + ' ~ ' + dateEnd);
		if (oldRegionLabel === nextRegionLabel && oldDateLabel === nextDateLabel) {
			closeDeliveryChangePopover();
			return;
		}

		var logEntry = {
			beforeDate: oldDateLabel,
			afterDate: nextDateLabel,
			beforeRegion: oldRegionLabel,
			afterRegion: nextRegionLabel,
			operatorName: record.businessOwner || record.creator || '当前用户',
			operateTime: formatPrototypeOperateTime(),
		};
		_recordOverrides[1](function (prev) {
			var prevRec = prev[record.id] || {};
			var baseVehicles = prevRec.vehicles || record.vehicles || [];
			var updatedVehicles = baseVehicles.map(function (vehicle) {
				if (isContractVehicleDelivered(vehicle)) return vehicle;
				return Object.assign({}, vehicle, {
					plannedDeliveryDate: dateUnconfirmed ? null : dateStart,
					deliveryDateTbd: dateUnconfirmed,
					deliveryTaskSuspended: dateUnconfirmed,
				});
			});
			var baseLogs = prevRec.deliveryDateChangeLogs != null
				? prevRec.deliveryDateChangeLogs
				: (record.deliveryDateChangeLogs || []);
			return Object.assign({}, prev, {
				[record.id]: Object.assign({}, prevRec, {
					deliveryRegion: region,
					deliveryRegionMode: regionMode,
					deliveryRegionTbd: regionTbd,
					deliveryDate: dateUnconfirmed ? null : dateStart,
					deliveryDateStart: dateStart,
					deliveryDateEnd: dateEnd,
					deliveryDateMode: dateMode,
					deliveryDateTbd: dateUnconfirmed,
					deliveryTaskSuspended: dateUnconfirmed,
					vehicles: updatedVehicles,
					deliveryDateChangeLogs: [logEntry].concat(baseLogs),
				}),
			});
		});

		var syncedPickup = syncPickupReceivableDeliveryPlan(record.contractCode, {
			deliveryRegion: region,
			deliveryRegionMode: regionMode,
			deliveryRegionTbd: regionTbd,
			deliveryDateStart: dateStart,
			deliveryDateEnd: dateEnd,
			deliveryDateMode: dateMode,
			deliveryDateTbd: dateUnconfirmed,
			deliveryPlanLabel: nextRegionLabel + ' · ' + nextDateLabel,
		});
		if (syncedPickup) {
			message.success('交车安排已更新，并同步至提车应收款（原型）');
		} else {
			message.success('交车安排已更新，已同步至未交车车辆（原型）');
		}
		if (!dateUnconfirmed || regionTbd) {
			message.info('工作台将根据最新交车安排重新评估「提车应收款」待办（原型）');
		}
		closeDeliveryChangePopover();
	}

	function confirmVehicleDeliveryDateChange(record, vehicleIndex) {
		var vehicles = record.vehicles || [];
		var vehicle = vehicles[vehicleIndex];
		if (!vehicle || isContractVehicleDelivered(vehicle)) {
			closeVehicleDeliveryChangePopover();
			return;
		}
		var draftTbd = _vehicleDeliveryChangeDraftTbd[0];
		var newDate = draftTbd ? DELIVERY_DATE_TBD_LABEL : _vehicleDeliveryChangeDraftDate[0];
		var oldTbd = resolveVehicleDeliveryDateTbd(vehicle, record);
		var oldDate = oldTbd
			? DELIVERY_DATE_TBD_LABEL
			: (resolveVehiclePlannedDeliveryDate(vehicle, record) || null);
		if (!draftTbd && !newDate) {
			message.warning('请选择交车日期，或标记为暂未确定');
			return;
		}
		if (draftTbd === oldTbd && (draftTbd || newDate === oldDate)) {
			closeVehicleDeliveryChangePopover();
			return;
		}
		_recordOverrides[1](function (prev) {
			var prevRec = prev[record.id] || {};
			var baseVehicles = prevRec.vehicles || record.vehicles || [];
			var updatedVehicles = baseVehicles.map(function (item, index) {
				if (index !== vehicleIndex || isContractVehicleDelivered(item)) return item;
				return Object.assign({}, item, {
					plannedDeliveryDate: draftTbd ? null : newDate,
					deliveryDateTbd: draftTbd,
					deliveryTaskSuspended: draftTbd,
				});
			});
			return Object.assign({}, prev, {
				[record.id]: Object.assign({}, prevRec, {
					vehicles: updatedVehicles,
				}),
			});
		});
		message.success(draftTbd ? '本车交车时间已标记为暂未确定（原型）' : '本车交车安排已更新（原型）');
		closeVehicleDeliveryChangePopover();
	}

	function renderDeliveryChangePanel(record) {
		var dayjs = window.dayjs;
		var logs = record.deliveryDateChangeLogs || [];
		var regionMode = _deliveryChangeDraftRegionMode[0];
		var regionValue = _deliveryChangeDraftRegion[0] || [];
		var dateMode = _deliveryChangeDraftDateMode[0];
		var dateRange = _deliveryChangeDraftDateRange[0] || [];
		var rangeValue = dateRange.length === 2 && dayjs
			? [dayjs(dateRange[0]), dayjs(dateRange[1])]
			: null;
		var canEdit = canEditContractDeliveryArrangement(record);
		return React.createElement('div', {
			className: 'lc-delivery-change__panel',
			role: 'dialog',
			'aria-label': '修改交车安排',
		},
			React.createElement('div', { className: 'lc-delivery-change__header' },
				React.createElement('div', { className: 'lc-delivery-change__title' }, '修改交车安排'),
			),
			React.createElement('div', { className: 'lc-delivery-change__form' },
				React.createElement('label', { className: 'lc-delivery-change__field' },
					React.createElement('span', { className: 'lc-delivery-change__label' }, '车辆交付（交还）地点'),
					renderDeliveryModeToggle({
						'aria-label': '交付地点模式',
						value: regionMode,
						onChange: function (mode) {
							_deliveryChangeDraftRegionMode[1](mode);
							if (mode === 'tbd') {
								_deliveryChangeDraftRegion[1]([]);
							}
						},
						options: [
							{ value: 'region', label: '选择省市' },
							{ value: 'tbd', label: DELIVERY_REGION_TBD_LABEL },
						],
					}),
					regionMode === 'region'
						? React.createElement(Cascader, {
							style: { width: '100%', marginTop: 8 },
							options: PROVINCE_CITY_CASCADER_OPTIONS,
							value: regionValue,
							placeholder: '请选择省市',
							allowClear: true,
							onChange: function (value) {
								_deliveryChangeDraftRegion[1](value || []);
							},
						})
						: React.createElement('p', { className: 'lc-delivery-change__readonly' },
							'后续可通过提车应收款或还车流程反写具体交还地点',
						),
				),
				React.createElement('label', { className: 'lc-delivery-change__field' },
					React.createElement('span', { className: 'lc-delivery-change__label' }, '车辆交付时间'),
					renderDeliveryModeToggle({
						'aria-label': '交付时间模式',
						value: dateMode,
						onChange: function (mode) {
							_deliveryChangeDraftDateMode[1](mode);
							if (mode === 'unconfirmed') {
								_deliveryChangeDraftDateRange[1](null);
								_deliveryChangeDraftDate[1](null);
								_deliveryChangeDraftTbd[1](true);
							} else {
								_deliveryChangeDraftTbd[1](false);
							}
						},
						options: [
							{ value: 'range', label: '选择日期' },
							{ value: 'unconfirmed', label: LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL },
						],
					}),
					dateMode === 'range'
						? React.createElement(RangePicker, {
							style: { width: '100%', marginTop: 8 },
							value: rangeValue,
							placeholder: ['开始日期', '结束日期'],
							'aria-label': '车辆交付时间范围',
							onChange: function (_dates, dateStrings) {
								_deliveryChangeDraftDateRange[1](dateStrings && dateStrings[0] && dateStrings[1]
									? [dateStrings[0], dateStrings[1]]
									: null);
								_deliveryChangeDraftDate[1](dateStrings && dateStrings[0] ? dateStrings[0] : null);
							},
						})
						: React.createElement('p', { className: 'lc-delivery-change__readonly' },
							'提车前通过提车应收款功能生成交车任务',
						),
				),
				React.createElement('p', { className: 'lc-delivery-change__hint' },
					canEdit
						? '修改后将同步至本合同所有未交车车辆，并回写提车应收款；工作台将据此重新评估提车应收款待办。'
						: '该合同交车安排已由提车应收款流程锁定，请在提车应收款中调整。',
				),
				React.createElement('div', { className: 'lc-delivery-change__actions' },
					React.createElement(Button, {
						size: 'small',
						onClick: closeDeliveryChangePopover,
					}, '取消'),
					React.createElement(Button, {
						size: 'small',
						type: 'primary',
						disabled: !canEdit,
						onClick: function () { confirmDeliveryArrangementChange(record); },
					}, '确定'),
				),
			),
			React.createElement('div', { className: 'lc-delivery-change__history' },
				React.createElement('div', { className: 'lc-delivery-change__history-title' }, '修改记录'),
				logs.length === 0
					? React.createElement('p', { className: 'lc-delivery-change__empty' }, '暂无修改记录')
					: React.createElement('div', { className: 'lc-delivery-change__history-list' },
						logs.map(function (log, index) {
							return React.createElement('div', {
								key: (log.operateTime || '') + '-' + index,
								className: 'lc-delivery-change__history-item',
							},
								log.beforeRegion || log.afterRegion
									? React.createElement('div', { className: 'lc-delivery-change__history-row' },
										React.createElement('span', { className: 'lc-delivery-change__history-field-label' }, '交还地点'),
										React.createElement('div', { className: 'lc-delivery-change__date-compare' },
											React.createElement('span', {
												className: 'lc-delivery-change__date-before',
												title: '修改前',
											}, log.beforeRegion || '-'),
											React.createElement('span', {
												className: 'lc-delivery-change__date-arrow',
												'aria-hidden': true,
											}, '→'),
											React.createElement('span', {
												className: 'lc-delivery-change__date-after',
												title: '修改后',
											}, log.afterRegion || '-'),
										),
									)
									: null,
								React.createElement('div', { className: 'lc-delivery-change__history-row' },
									React.createElement('span', { className: 'lc-delivery-change__history-field-label' }, '交付时间'),
									React.createElement('div', { className: 'lc-delivery-change__date-compare' },
										React.createElement('span', {
											className: 'lc-delivery-change__date-before tabular-nums',
											title: '修改前',
										}, log.beforeDate || '-'),
										React.createElement('span', {
											className: 'lc-delivery-change__date-arrow',
											'aria-hidden': true,
										}, '→'),
										React.createElement('span', {
											className: 'lc-delivery-change__date-after tabular-nums',
											title: '修改后',
										}, log.afterDate || '-'),
									),
								),
								React.createElement('div', { className: 'lc-delivery-change__history-row' },
									React.createElement('span', { className: 'lc-delivery-change__history-field-label' }, '操作人'),
									React.createElement('span', { className: 'lc-delivery-change__history-field-value' }, log.operatorName || '-'),
								),
								React.createElement('div', { className: 'lc-delivery-change__history-row' },
									React.createElement('span', { className: 'lc-delivery-change__history-field-label' }, '操作时间'),
									React.createElement('span', {
										className: 'lc-delivery-change__history-field-value tabular-nums',
									}, log.operateTime || '-'),
								),
							);
						}),
					),
			),
		);
	}

	function renderVehicleDeliveryChangePanel(record, vehicle, vehicleIndex) {
		var dayjs = window.dayjs;
		var draftDate = _vehicleDeliveryChangeDraftDate[0];
		var draftTbd = _vehicleDeliveryChangeDraftTbd[0];
		var draftValue = draftDate && dayjs && !draftTbd ? dayjs(draftDate) : null;
		var plate = getVehiclePlateDisplayLabel(vehicle.plateNo);
		return React.createElement('div', {
			className: 'lc-delivery-change__panel',
			role: 'dialog',
			'aria-label': '修改本车交车时间',
		},
			React.createElement('div', { className: 'lc-delivery-change__header' },
				React.createElement('div', { className: 'lc-delivery-change__title' }, '修改本车交车时间'),
				React.createElement('div', { className: 'lc-delivery-change__subtitle tabular-nums' }, plate),
			),
			React.createElement('div', { className: 'lc-delivery-change__form' },
				React.createElement('label', { className: 'lc-delivery-change__field' },
					React.createElement('span', { className: 'lc-delivery-change__label' }, '计划交车日期'),
					React.createElement(DatePicker, {
						style: { width: '100%' },
						value: draftValue,
						disabled: draftTbd,
						placeholder: draftTbd ? '暂未确定' : '请选择交车日期',
						'aria-label': '计划交车日期',
						onChange: function (_date, dateString) {
							_vehicleDeliveryChangeDraftDate[1](dateString || null);
						},
					}),
				),
				React.createElement('label', { className: 'lc-delivery-change__tbd' },
					React.createElement(Checkbox, {
						checked: draftTbd,
						onChange: function (event) {
							var checked = event.target.checked;
							_vehicleDeliveryChangeDraftTbd[1](checked);
							if (checked) {
								_vehicleDeliveryChangeDraftDate[1](null);
							} else {
								var vehicleTbd = resolveVehicleDeliveryDateTbd(vehicle, record);
								_vehicleDeliveryChangeDraftDate[1](vehicleTbd
									? null
									: (resolveVehiclePlannedDeliveryDate(vehicle, record) || null));
							}
						},
					}, '暂未确定'),
				),
				React.createElement('p', { className: 'lc-delivery-change__hint' },
					'仅修改当前车辆；在项目信息中调整交车安排后，仍会同步至所有未交车车辆。',
				),
				React.createElement('div', { className: 'lc-delivery-change__actions' },
					React.createElement(Button, {
						size: 'small',
						onClick: closeVehicleDeliveryChangePopover,
					}, '取消'),
					React.createElement(Button, {
						size: 'small',
						type: 'primary',
						onClick: function () { confirmVehicleDeliveryDateChange(record, vehicleIndex); },
					}, '确定'),
				),
			),
		);
	}

	function renderDeliveryEditIcon() {
		return React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg',
			width: 14,
			height: 14,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 2,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			'aria-hidden': true,
		},
			React.createElement('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }),
			React.createElement('path', { d: 'm15 5 4 4' }),
		);
	}

	function closeDelegatePopover() {
		_delegatePopoverRecord[1](null);
		closeSigningMethodPopover();
	}

	function openContractFlow(mode, record, options) {
		var opts = options || {};
		_flowMode[1](mode || FLOW_MODE_CREATE);
		_flowInitialFormState[1](null);
		_editContractRecord[1](null);
		_createInitialSection[1](opts.section || null);
		if (mode === FLOW_MODE_EDIT && record) {
			_editContractRecord[1](record);
		} else if (mode === FLOW_MODE_RENEW && record) {
			_flowInitialFormState[1](buildRenewContractFormState(record));
		} else if (mode === FLOW_MODE_TRIAL_TO_FORMAL && record) {
			_flowInitialFormState[1](buildTrialToFormalFormState(record));
		} else if (mode === FLOW_MODE_ADD_VEHICLE && record) {
			_flowInitialFormState[1](buildAddVehicleFormState(record));
			_createInitialSection[1]('leaseOrder');
		} else if (mode === FLOW_MODE_ADD_POA && record) {
			_flowInitialFormState[1](buildAddPowerOfAttorneyFormState(record));
			_createInitialSection[1]('poa');
		} else if (mode === FLOW_MODE_TRIPARTITE && record) {
			_flowInitialFormState[1](buildTripartiteContractFormState(record));
			_createInitialSection[1]('main');
		}
		_view[1]('create');
	}

	function openContractEditForPoa(record) {
		openContractFlow(FLOW_MODE_ADD_POA, record);
	}

	function backToContractList() {
		_createInitialSection[1](null);
		_editContractRecord[1](null);
		_viewContractRecord[1](null);
		_flowMode[1](FLOW_MODE_CREATE);
		_flowInitialFormState[1](null);
		_view[1]('list');
	}

	function openContractView(record) {
		_viewContractRecord[1](record || null);
		_view[1]('view');
	}

	function renderDelegatePopoverPanel(record) {
		var delegates = getAuthorizedDelegates(record);
		return React.createElement('div', {
			className: 'lc-delegate-popover__panel',
			role: 'region',
			'aria-label': '受托人明细',
		},
			React.createElement('div', { className: 'lc-delegate-popover__header' },
				React.createElement('div', { className: 'lc-delegate-popover__title' }, '受托人'),
				React.createElement('div', { className: 'lc-delegate-popover__sub' }, record.contractCode || ''),
			),
			delegates.length === 0
				? React.createElement('p', { className: 'lc-delegate-popover__empty' }, '暂无受托人')
				: React.createElement('div', { className: 'lc-delegate-popover__list' },
					delegates.map(function (person, index) {
						return React.createElement('div', {
							key: (person.idNumber || person.contact || person.name || '') + '-' + index,
							className: 'lc-delegate-popover__card',
						},
							React.createElement('div', { className: 'lc-delegate-popover__card-head' },
								React.createElement('span', { className: 'lc-delegate-popover__name' }, person.name || '-'),
								React.createElement('span', { className: 'lc-delegate-popover__index' }, '第 ' + (index + 1) + ' 人'),
							),
							React.createElement('div', { className: 'lc-delegate-popover__field' },
								React.createElement('span', { className: 'lc-delegate-popover__label' }, '联系方式'),
								React.createElement('span', { className: 'lc-delegate-popover__value tabular-nums' }, person.contact || person.phone || '-'),
							),
							React.createElement('div', { className: 'lc-delegate-popover__field' },
								React.createElement('span', { className: 'lc-delegate-popover__label' }, '身份证号'),
								React.createElement('span', { className: 'lc-delegate-popover__value tabular-nums' }, person.idNumber || person.idCard || '-'),
							),
						);
					}),
				),
		);
	}

	function renderDelegateCountCell(_, record) {
		if (needsContractDelegateSupplement(record)) {
			return React.createElement('button', {
				type: 'button',
				className: 'lc-delegate-supplement-btn',
				title: '补充授权委托书与受托人信息',
				'aria-label': '请补充授权委托书与受托人信息',
				onClick: function () { openContractEditForPoa(record); },
			}, '请补充');
		}
		var count = record.delegateCount != null ? record.delegateCount : 0;
		if (count <= 0) return '-';
		var popoverOpen = _delegatePopoverRecord[0] && _delegatePopoverRecord[0].id === record.id;
		return React.createElement(Popover, {
			overlayClassName: 'lc-delegate-popover',
			placement: 'bottom',
			trigger: 'click',
			arrow: { pointAtCenter: true },
			destroyTooltipOnHide: true,
			open: popoverOpen,
			title: null,
			content: renderDelegatePopoverPanel(record),
			onOpenChange: function (visible) {
				if (!visible) {
					closeDelegatePopover();
					return;
				}
				_vehiclePopoverRecord[1](null);
				closeDeliveryChangePopover();
				_delegatePopoverRecord[1](record);
			},
		},
			React.createElement('button', {
				type: 'button',
				className: 'lc-delegate-count-btn tabular-nums',
				'aria-label': '查看受托人 ' + count + ' 人',
			}, count + ' 人'),
		);
	}

	function hasContractStampedAttachments(record) {
		if (!record) return false;
		return getContractStampedFiles(record).length > 0
			&& (record.legalStampedContractUploaded === true || _stampedUploadedOverride[0][record.id] === true);
	}

	function getContractStampedFiles(record) {
		if (!record) return [];
		var override = _stampedFilesOverride[0][record.id];
		if (override && override.length) return override;
		if (record.stampedContractFiles && record.stampedContractFiles.length) return record.stampedContractFiles;
		return [];
	}

	function getContractSigningFiles(record) {
		if (!record) return [];
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		if (isOfflineContractSigning(method)) return getContractStampedFiles(record);
		return getOnlineEsignContractFiles(record);
	}

	function canExpandSigningMethodCard(record) {
		if (!record) return false;
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		if (isOfflineContractSigning(method)) return hasContractStampedAttachments(record);
		return hasOnlineEsignCompleted(record, _stampedCompletedAtOverride[0]);
	}

	function closeSigningMethodPopover() {
		_signingMethodPopoverRecord[1](null);
	}

	function formatStampUploadCompletedMinute() {
		var now = new Date();
		var pad = function (n) { return n < 10 ? '0' + n : String(n); };
		return now.getFullYear() + '-'
			+ pad(now.getMonth() + 1) + '-'
			+ pad(now.getDate()) + ' '
			+ pad(now.getHours()) + ':'
			+ pad(now.getMinutes());
	}

	function previewSigningMethodFile(file, record) {
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		var opened = isOfflineContractSigning(method)
			? openContractAttachmentPreviewInNewTab(file, record)
			: openOnlineEsignPreviewInNewTab(record);
		if (!opened) message.warning('请允许浏览器弹出新窗口后重试');
	}

	function renderSigningMethodCellContent(record, classSuffix) {
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		var label = formatContractSigningMethodLabel(method);
		var hasUploaded = hasContractStampedAttachments(record);
		var subLabel = getContractSigningSubLabel(record, {
			hasUploaded: hasUploaded,
			completedAtOverride: _stampedCompletedAtOverride[0],
		});
		var isPending = isOfflineContractSigning(method) && !hasUploaded;
		return React.createElement(React.Fragment, null,
			React.createElement('span', { className: 'lc-signing-method-cell__label' }, label),
			React.createElement('span', {
				className: 'lc-signing-method-cell__sub tabular-nums'
					+ (isPending ? ' is-pending' : ''),
				title: subLabel,
			}, subLabel),
		);
	}

	function renderSigningMethodAttachmentsPanel(record) {
		var files = getContractSigningFiles(record);
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		var isOffline = isOfflineContractSigning(method);
		return React.createElement('div', { className: 'lc-signing-method-popover', role: 'region', 'aria-label': '合同签署附件' },
			React.createElement('div', { className: 'lc-signing-method-popover__title' }, isOffline ? '盖章附件' : '电子签章合同'),
			React.createElement('div', { className: 'lc-signing-method-popover__sub' }, record.contractCode || '-'),
			files.length
				? React.createElement('ul', { className: 'lc-signing-method-popover__list' },
					files.map(function (file, index) {
						var fileName = file.name || ('附件 ' + (index + 1));
						return React.createElement('li', { key: file.uid || file.name || index, className: 'lc-signing-method-popover__row' },
							React.createElement('span', {
								className: 'lc-signing-method-popover__name',
								title: fileName,
							}, fileName),
							React.createElement('div', { className: 'lc-signing-method-popover__actions' },
								React.createElement('button', {
									type: 'button',
									className: 'lc-signing-method-popover__action',
									onClick: function () {
										previewSigningMethodFile(file, record);
									},
								}, '预览'),
								React.createElement('button', {
									type: 'button',
									className: 'lc-signing-method-popover__action',
									onClick: function () {
										downloadContractAttachment(file, record);
										message.success('已开始下载（原型）');
									},
								}, '下载'),
							),
						);
					}),
				)
				: React.createElement('div', { className: 'lc-signing-method-popover__empty' }, '暂无附件'),
		);
	}

	function renderSigningMethodPopoverCell(record, classSuffix, ariaLabel) {
		var popoverOpen = _signingMethodPopoverRecord[0] && _signingMethodPopoverRecord[0].id === record.id;
		return React.createElement(Popover, {
			overlayClassName: 'lc-signing-method-popover-wrap',
			placement: 'bottom',
			trigger: 'click',
			arrow: { pointAtCenter: true },
			destroyTooltipOnHide: true,
			open: popoverOpen,
			title: null,
			content: renderSigningMethodAttachmentsPanel(record),
			onOpenChange: function (visible) {
				if (!visible) closeSigningMethodPopover();
				else {
					closeDeliveryChangePopover();
					closeDelegatePopover();
					_vehiclePopoverRecord[1](null);
					_signingMethodPopoverRecord[1](record);
				}
			},
		},
			React.createElement('button', {
				type: 'button',
				className: 'lc-signing-method-cell__btn ' + classSuffix,
				'aria-label': ariaLabel,
				'aria-expanded': popoverOpen,
			}, renderSigningMethodCellContent(record, classSuffix)),
		);
	}

	function renderContractSigningMethodCell(_, record) {
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		var label = formatContractSigningMethodLabel(method);
		var isOffline = isOfflineContractSigning(method);
		var hasUploaded = hasContractStampedAttachments(record);
		var subLabel = getContractSigningSubLabel(record, {
			hasUploaded: hasUploaded,
			completedAtOverride: _stampedCompletedAtOverride[0],
		});

		if (isOffline && !hasUploaded) {
			return React.createElement('button', {
				type: 'button',
				className: 'lc-signing-method-cell__btn is-offline is-pending',
				'aria-label': label + '，' + subLabel + '，点击上传盖章附件',
				onClick: function (e) {
					e.stopPropagation();
					closeSigningMethodPopover();
					if (record.approvalStatus !== '审批通过') {
						message.info('审批通过后可补传盖章合同（原型）');
						return;
					}
					openStampUploadModal(record, 'supplement');
				},
			}, renderSigningMethodCellContent(record, 'is-offline is-pending'));
		}

		if (canExpandSigningMethodCard(record)) {
			var files = getContractSigningFiles(record);
			return renderSigningMethodPopoverCell(
				record,
				isOffline ? 'is-offline is-uploaded' : 'is-online is-completed',
				label + '，' + subLabel + '，已归档 ' + files.length + ' 个附件',
			);
		}

		return React.createElement('div', {
			className: 'lc-signing-method-cell__static' + (isOffline ? ' is-offline' : ' is-online'),
			title: label + '：' + subLabel,
		}, renderSigningMethodCellContent(record, 'is-static'));
	}

	function renderDeliveryCell(_, record) {
		var regionLabel = formatContractDeliveryRegionLabel(record);
		var dateLabel = formatContractDeliveryDateLabel(record);
		var isTbd = isContractDeliveryDateUnconfirmed(record);
		var canEdit = canEditContractDeliveryArrangement(record);
		var popoverOpen = _deliveryChangePopoverRecord[0] && _deliveryChangePopoverRecord[0].id === record.id;
		return React.createElement('div', { className: 'lc-delivery-cell' },
			React.createElement('span', {
				className: 'lc-delivery-cell__region' + (isContractDeliveryRegionTbd(record) ? ' lc-delivery-cell__region--tbd' : ''),
				title: regionLabel,
			}, regionLabel),
			React.createElement('div', { className: 'lc-delivery-cell__date-row' },
				React.createElement('span', {
					className: 'lc-delivery-cell__date tabular-nums' + (isTbd ? ' lc-delivery-cell__date--tbd' : ''),
					title: dateLabel,
				}, dateLabel),
				canEdit
					? React.createElement(Popover, {
						overlayClassName: 'lc-delivery-change-popover',
						placement: 'bottom',
						trigger: 'click',
						arrow: { pointAtCenter: true },
						destroyTooltipOnHide: true,
						open: popoverOpen,
						title: null,
						content: renderDeliveryChangePanel(record),
						onOpenChange: function (visible) {
							if (!visible) {
								closeDeliveryChangePopover();
								return;
							}
							closeVehicleDeliveryChangePopover();
							_vehiclePopoverRecord[1](null);
							closeDelegatePopover();
							_deliveryChangePopoverRecord[1](record);
							initDeliveryChangeDraft(record);
						},
					},
						React.createElement('button', {
							type: 'button',
							className: 'lc-delivery-cell__edit-btn',
							'aria-label': '编辑交车安排',
						}, renderDeliveryEditIcon()),
					)
					: null,
			),
		);
	}

	function renderLeaseOrderCountsCell(_, record) {
		var deliveredVehicles = (record.vehicles || []).filter(function (v) {
			return isContractVehicleDelivered(v);
		});
		var deliveredCount = deliveredVehicles.length;
		var rentalOpen = _vehiclePopoverRecord[0] && _vehiclePopoverRecord[0].id === record.id;
		var deliveredExpanded = _expandedRowKeys[0].indexOf(record.id) >= 0
			&& _expandedRowVehicleFilter[0][record.id] === 'delivered';
		var rentalContent = renderRentalSummaryPopoverPanel({
			title: '租赁车辆明细',
			subtitle: record.contractCode || '',
			vehicles: record.vehicles || [],
			emptyText: '该合同暂无租赁车辆',
		});
		var popoverCommonProps = {
			overlayClassName: 'lc-vehicle-popover',
			placement: 'bottom',
			trigger: 'click',
			arrow: { pointAtCenter: true },
			destroyTooltipOnHide: true,
		};

		return React.createElement('div', { className: 'lc-lease-order-counts' },
			React.createElement(Popover, Object.assign({}, popoverCommonProps, {
				content: rentalContent,
				title: null,
				open: rentalOpen,
				onOpenChange: function (visible) {
					if (!visible) _vehiclePopoverRecord[1](null);
					else {
						closeDeliveryChangePopover();
						closeDelegatePopover();
						closeSigningMethodPopover();
						_vehiclePopoverRecord[1](record);
					}
				},
			}),
				React.createElement('button', {
					type: 'button',
					className: 'lc-lease-order-counts__item',
					'aria-label': '租赁车辆数 ' + (record.vehicleCount != null ? record.vehicleCount : 0),
				},
					React.createElement('span', { className: 'lc-lease-order-counts__value tabular-nums' }, record.vehicleCount != null ? record.vehicleCount : 0),
					React.createElement('span', { className: 'lc-lease-order-counts__label' }, '租赁'),
				),
			),
			React.createElement('span', { className: 'lc-lease-order-counts__sep', 'aria-hidden': true }),
			React.createElement('button', {
				type: 'button',
				className: 'lc-lease-order-counts__item'
					+ (deliveredExpanded ? ' lc-lease-order-counts__item--active' : '')
					+ (deliveredCount > 0 ? '' : ' is-disabled'),
				disabled: deliveredCount === 0,
				'aria-label': '已交车辆数 ' + deliveredCount,
				'aria-expanded': deliveredExpanded,
				onClick: function (e) {
					e.stopPropagation();
					if (deliveredCount === 0) return;
					_vehiclePopoverRecord[1](null);
					closeDeliveryChangePopover();
					closeDelegatePopover();
					toggleContractRowExpand(record.id, 'delivered');
				},
			},
				React.createElement('span', { className: 'lc-lease-order-counts__value tabular-nums' }, deliveredCount),
				React.createElement('span', { className: 'lc-lease-order-counts__label' }, '已交'),
			),
		);
	}

	function renderContactCell(_, record) {
		return renderStackCell(record.contactName, record.contactPhone, 'sub tabular-nums');
	}

	function renderCreateAuditCell(_, record) {
		return renderStackCell(record.creator, record.createTime, 'code');
	}

	function renderUpdateAuditCell(_, record) {
		return renderStackCell(record.updater, record.updateTime, 'code');
	}

	function getOperationButtons(record) {
		return React.createElement(OperationActions, {
			view: { onClick: function () { openContractView(record); } },
			more: getMoreMenuItems(record),
			annotationId: 'lc-list-action-more',
		});
	}

	var columns = [
		{
			title: '项目信息',
			key: 'projectInfo',
			width: 320,
			fixed: 'left',
			className: 'lc-project-info-col',
			onHeaderCell: function () {
				return {
					className: 'lc-project-info-col',
					'data-annotation-id': 'lc-project-info-col',
				};
			},
			onCell: function () { return { className: 'lc-project-info-col' }; },
			render: renderProjectInfoCell
		},
		{
			title: '租赁订单',
			key: 'leaseOrder',
			width: 132,
			className: 'lc-lease-order-col',
			onCell: function () { return { className: 'lc-lease-order-col' }; },
			render: renderLeaseOrderCountsCell,
		},
		{
			title: '合同签署方式',
			key: 'contractSigningMethod',
			width: 156,
			className: 'lc-signing-method-col',
			onCell: function () { return { className: 'lc-signing-method-col' }; },
			render: renderContractSigningMethodCell,
		},
		{
			title: '审批状态',
			key: 'approvalStatus',
			width: 156,
			className: 'lc-approval-status-col',
			onCell: function () { return { className: 'lc-approval-status-col' }; },
			render: renderApprovalStatusCell,
		},
		{
			title: '签约公司',
			key: 'signingCompany',
			width: 220,
			className: 'lc-signing-company-col',
			onCell: function () { return { className: 'lc-signing-company-col' }; },
			render: renderSigningCompanyCell,
		},
		{
			title: '业务部门',
			key: 'businessDept',
			width: 110,
			render: renderBusinessDeptCell
		},
		{
			title: '费用信息',
			key: 'feeInfo',
			width: 248,
			className: 'lc-fee-info-col',
			onHeaderCell: function () {
				return { className: 'lc-fee-info-col' };
			},
			onCell: function () { return { className: 'lc-fee-info-col' }; },
			render: renderFeeInfoCell,
		},
		{
			title: '交车安排',
			key: 'deliveryPlan',
			width: 176,
			className: 'lc-delivery-col',
			onCell: function () { return { className: 'lc-delivery-col' }; },
			render: renderDeliveryCell,
		},
		{
			title: '整体里程完成情况',
			key: 'overallMileageProgress',
			width: 168,
			className: 'lc-overall-mileage-col',
			onHeaderCell: function () {
				return {
					className: 'lc-overall-mileage-col',
					'data-annotation-id': 'lc-overall-mileage-col',
				};
			},
			onCell: function () { return { className: 'lc-overall-mileage-col' }; },
			render: renderOverallMileageProgressCell,
		},
		{
			title: '客户联系人',
			key: 'contact',
			width: 118,
			render: renderContactCell
		},
		{
			title: '受托人',
			key: 'delegateCount',
			width: 88,
			className: 'tabular-nums lc-delegate-col',
			onHeaderCell: function () {
				return {
					className: 'lc-delegate-col tabular-nums',
					'data-annotation-id': 'lc-delegate-col',
				};
			},
			onCell: function () { return { className: 'lc-delegate-col tabular-nums' }; },
			render: renderDelegateCountCell,
		},
		{
			title: '创建信息',
			key: 'createAudit',
			width: 148,
			render: renderCreateAuditCell
		},
		{
			title: '最后更新',
			key: 'updateAudit',
			width: 148,
			render: renderUpdateAuditCell
		},
		{ title: '操作', key: 'action', width: 168, fixed: 'right', render: function(_, record) { return getOperationButtons(record); } }
	];

	var listTableScrollX = columns.reduce(function (sum, col) {
		return sum + (Number(col.width) || 0);
	}, 0);

	var filterItems = [
		React.createElement('label', { key: 'contractCode', className: 'vm-filter-field' },
			React.createElement('span', null, '合同编码'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				placeholder: '请选择或输入合同编码',
				style: { width: '100%' },
				value: _contractCode[0],
				onChange: function(v) { _contractCode[1](v); },
				allowClear: true,
				showSearch: true,
				options: contractCodeOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('label', { key: 'projectName', className: 'vm-filter-field' },
			React.createElement('span', null, '项目名称'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				placeholder: '请选择或输入项目名称',
				style: { width: '100%' },
				value: _projectName[0],
				onChange: function(v) { _projectName[1](v); },
				allowClear: true,
				showSearch: true,
				options: projectNameOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('label', { key: 'customerName', className: 'vm-filter-field' },
			React.createElement('span', null, '客户名称'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				placeholder: '请选择或输入客户名称',
				style: { width: '100%' },
				value: _customerName[0],
				onChange: function(v) { _customerName[1](v); },
				allowClear: true,
				showSearch: true,
				options: customerNameOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('label', { key: 'signingCompany', className: 'vm-filter-field' },
			React.createElement('span', null, '签约公司'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				placeholder: '请选择或输入签约公司名称',
				style: { width: '100%' },
				value: _signingCompany[0],
				onChange: function(v) { _signingCompany[1](v); },
				allowClear: true,
				options: signingCompanyOptions
			})),
		React.createElement('label', { key: 'approvalStatus', className: 'vm-filter-field' },
			React.createElement('span', null, '审批状态'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择',
				style: { width: '100%' },
				value: _approvalStatus[0],
				onChange: handleApprovalStatusChange,
				options: approvalStatusOptions
			})),
		React.createElement('label', { key: 'contractStatus', className: 'vm-filter-field' },
			React.createElement('span', null, '合同状态'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择',
				style: { width: '100%' },
				value: _contractStatus[0],
				onChange: handleContractStatusChange,
				options: contractStatusOptions
			})),
		React.createElement('label', { key: 'businessDept', className: 'vm-filter-field' },
			React.createElement('span', null, '业务部门'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择或输入业务部门名称',
				style: { width: '100%' },
				value: _businessDept[0],
				onChange: function(v) { _businessDept[1](v); },
				options: deptOptions
			})),
		React.createElement('label', { key: 'businessOwner', className: 'vm-filter-field' },
			React.createElement('span', null, '业务负责人'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择或输入业务负责人姓名',
				style: { width: '100%' },
				value: _businessOwner[0],
				onChange: function(v) { _businessOwner[1](v); },
				options: userOptions
			})),
		React.createElement('label', { key: 'contractTemplateCategory', className: 'vm-filter-field' },
			React.createElement('span', null, '合同模板'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				allowClear: true,
				placeholder: '请选择合同模板',
				style: { width: '100%' },
				value: _contractTemplateCategory[0],
				onChange: handleContractTemplateCategoryChange,
				options: contractTemplateCategoryOptions
			})),
		React.createElement('label', { key: 'contractTemplateId', className: 'vm-filter-field' },
			React.createElement('span', null, '标准合同名称'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				allowClear: true,
				showSearch: true,
				optionFilterProp: 'label',
				placeholder: _contractTemplateCategory[0] ? '请选择标准合同名称' : '请先选择合同模板',
				disabled: !_contractTemplateCategory[0],
				style: { width: '100%' },
				value: _contractTemplateId[0],
				onChange: handleContractTemplateIdChange,
				options: contractTemplateStandardOptions
			})),
		React.createElement('label', { key: 'contractApprovalType', className: 'vm-filter-field' },
			React.createElement('span', null, '审批类型'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择',
				style: { width: '100%' },
				value: _contractApprovalType[0],
				onChange: handleContractApprovalTypeChange,
				options: contractApprovalTypeOptions
			})),
		React.createElement('label', { key: 'creator', className: 'vm-filter-field' },
			React.createElement('span', null, '创建人'),
			React.createElement(Select, {
				className: 'lc-filter-select',
				mode: 'multiple',
				placeholder: '请选择或输入创建人姓名',
				style: { width: '100%' },
				value: _creator[0],
				onChange: function(v) { _creator[1](v); },
				options: userOptions
			})),
		React.createElement('label', { key: 'endDate', className: 'vm-filter-field' },
			React.createElement('span', null, '合同结束日期'),
			React.createElement(DateRangeFilterField, {
				startDate: (_endDateRange[0] && _endDateRange[0].startDate) || '',
				endDate: (_endDateRange[0] && _endDateRange[0].endDate) || '',
				ariaLabel: '合同结束日期',
				startPlaceholder: '开始日期',
				endPlaceholder: '结束日期',
				onChange: function(range) {
					_endDateRange[1]({
						startDate: (range && range.startDate) || '',
						endDate: (range && range.endDate) || '',
					});
				},
			})
		)
	];

	// 默认首行 4 项；展开后展示全部筛选项（含合同结束日期）
	var filterCount = _filterExpanded[0] ? filterItems.length : 4;
	var filterNodes = [];
	for (var i = 0; i < filterCount && i < filterItems.length; i++) {
		filterNodes.push(filterItems[i]);
	}

	if (_view[0] === 'view') {
		var viewRecord = _viewContractRecord[0];
		var stampedFiles = viewRecord ? (_stampedFilesOverride[0][viewRecord.id] || []) : [];
		return React.createElement(LeaseContractView, {
			record: viewRecord,
			onBack: backToContractList,
			stampedFilesOverride: stampedFiles,
		});
	}

	if (_view[0] === 'create') {
		return React.createElement(LeaseContractCreate, {
			onBack: backToContractList,
			initialScrollSection: _createInitialSection[0],
			editRecord: _editContractRecord[0],
			flowMode: _flowMode[0],
			flowInitialFormState: _flowInitialFormState[0],
		});
	}

	return React.createElement(App, null,
		React.createElement('div', {
			className: 'vm-page lc-page lc-page--list-dense',
			style: { '--lc-list-chrome-offset': listChromeOffsetPx + 'px' },
		},
			React.createElement('style', null, ONEOS_ANT_TABLE_GLOBAL_FIX.join('\n')),
			React.createElement('section', { className: 'vm-filter-card ldb-filter-card', 'data-annotation-id': 'lc-list-filter', 'aria-label': '筛选条件' },
				React.createElement('header', { className: 'vm-filter-header' },
					React.createElement('h2', { className: 'vm-filter-title' }, '筛选条件')
				),
				React.createElement('div', { className: 'ldb-filter-body' },
					React.createElement('div', { className: 'vm-filter-grid ldb-filter-grid ldb-filter-grid--primary' }, filterNodes)
				),
				React.createElement('div', { className: 'vm-filter-actions ldb-filter-actions' },
					filterItems.length > 4
						? React.createElement('button', {
							type: 'button',
							className: 'vm-btn vm-btn-link ldb-filter-toggle',
							'data-vm-icon': _filterExpanded[0] ? 'chevron-up' : 'filter',
							onClick: function() { _filterExpanded[1](!_filterExpanded[0]); }
						}, _filterExpanded[0] ? '收起' : '更多筛选')
						: null,
					React.createElement('button', {
						type: 'button',
						className: 'vm-btn vm-btn-ghost ldb-toolbar-btn',
						'data-vm-icon': 'rotate-ccw',
						onClick: handleReset,
					}, '重置'),
					React.createElement('button', {
						type: 'button',
						className: 'vm-btn vm-btn-primary ldb-toolbar-btn',
						'data-vm-icon': 'search',
						onClick: handleQuery,
					}, '查询')
				)
			),
			React.createElement('div', {
				className: 'vm-kpi-row',
				role: 'group',
				'aria-label': '合同统计',
				'data-annotation-id': 'lc-list-kpi',
			},
				KPI_CARDS.map(function(card) {
					return React.createElement('button', {
						key: card.key,
						type: 'button',
						className: 'vm-kpi-card' + (_kpiTab[0] === card.key ? ' active' : ''),
						onClick: function() {
							_kpiTab[1](card.key);
							_page[1](1);
						},
						'aria-pressed': _kpiTab[0] === card.key
					},
						React.createElement('span', {
							className: 'vm-kpi-tip',
							tabIndex: 0,
							role: 'note',
							'aria-label': card.title + '说明',
							onClick: function(e) { e.stopPropagation(); },
							onMouseDown: function(e) { e.stopPropagation(); }
						},
							kpiHelpIcon,
							React.createElement('span', { className: 'vm-kpi-tooltip', role: 'tooltip' }, card.desc)
						),
						React.createElement('span', { className: 'vm-kpi-icon', 'aria-hidden': true }, KPI_ICONS[card.key]),
						React.createElement('span', { className: 'vm-kpi-main' },
							React.createElement('span', { className: 'vm-kpi-eyebrow' }, card.title),
							React.createElement('span', { className: 'vm-kpi-val' }, kpiCounts[card.key] != null ? kpiCounts[card.key] : 0)
						)
					);
				})
			),
			React.createElement('section', { className: 'vm-table-section' },
				React.createElement('div', { className: 'vm-table-toolbar', 'data-annotation-id': 'lc-list-toolbar' },
					React.createElement('div', { className: 'vm-table-actions' },
						React.createElement('button', {
							type: 'button',
							className: 'vm-btn vm-btn-ghost ldb-toolbar-btn',
							'data-vm-icon': 'download',
							onClick: function() { message.info('根据筛选条件，导出相应记录'); }
						}, '导出'),
						React.createElement('button', {
							type: 'button',
							className: 'vm-btn vm-btn-primary ldb-toolbar-btn',
							'data-vm-icon': 'plus',
							onClick: function() { openContractFlow(FLOW_MODE_CREATE, null); }
						}, '新增')
					)
				),
				React.createElement('div', { className: 'vm-table-card', 'data-annotation-id': 'lc-list-table' },
					React.createElement('div', { className: 'vm-table-wrap' },
						React.createElement(Table, {
							className: 'vm-list-table lc-list-table--nested',
							rowKey: 'id',
							columns: columns,
							dataSource: pagedList,
							tableLayout: 'fixed',
							scroll: { x: listTableScrollX, y: 'max(calc(100vh - var(--lc-list-chrome-offset, 472px)), 240px)' },
							size: 'small',
							pagination: false,
							expandable: {
								showExpandColumn: false,
								expandIconColumnIndex: -1,
								expandedRowKeys: _expandedRowKeys[0],
								onExpandedRowsChange: function (keys) {
									_expandedRowKeys[1](keys);
									_expandedRowVehicleFilter[1](function (prev) {
										var next = {};
										keys.forEach(function (key) {
											if (prev[key]) next[key] = prev[key];
										});
										return next;
									});
								},
								expandedRowRender: renderExpandedVehicleTable,
								rowExpandable: function (record) {
									return (record.vehicles || []).length > 0;
								},
							},
						})
					),
					React.createElement('div', { className: 'vm-table-footer' },
						React.createElement(TablePagination, {
							page: safePage,
							pageSize: _pageSize[0],
							total: totalCount,
							onPageChange: function(nextPage) { _page[1](nextPage); },
							onPageSizeChange: function(size) {
								_pageSize[1](size);
								_page[1](1);
							}
						})
					)
				)
			),
			React.createElement(Modal, {
				title: '是否确认删除该合同草稿',
				open: _deleteModalVisible[0],
				onCancel: function() { _deleteModalVisible[1](false); _deleteModalRecord[1](null); },
				onOk: function() {
					message.success('已删除（原型）');
					_deleteModalVisible[1](false);
					_deleteModalRecord[1](null);
				},
				okText: '确定',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '是否确认撤回该合同',
				open: _withdrawModalVisible[0],
				onCancel: function() { _withdrawModalVisible[1](false); _withdrawModalRecord[1](null); },
				onOk: function() {
					var rec = _withdrawModalRecord[0];
					if (rec && rec.id) {
						_recordOverrides[1](function (prev) {
							var next = Object.assign({}, prev);
							next[rec.id] = {
								approvalStatus: '撤回',
								contractStatus: '草稿',
								approvalFlowNodes: [],
							};
							return next;
						});
					}
					message.success('已撤回（原型）');
					_withdrawModalVisible[1](false);
					_withdrawModalRecord[1](null);
				},
				okText: '确定',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '主动终止合同',
				open: _terminateModalVisible[0],
				onCancel: function() {
					_terminateModalVisible[1](false);
					_terminateModalRecord[1](null);
					_terminateForm[1]({ terminateAt: null, reason: undefined, remark: '' });
				},
				width: 520,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() {
						_terminateModalVisible[1](false);
						_terminateModalRecord[1](null);
						_terminateForm[1]({ terminateAt: null, reason: undefined, remark: '' });
					} }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						var rec = _terminateModalRecord[0];
						var form = _terminateForm[0] || {};
						if (!form.terminateAt) {
							message.warning('请选择主动终止时间');
							return;
						}
						if (!form.reason) {
							message.warning('请选择终止原因');
							return;
						}
						if (rec && rec.contractCode) {
							syncPickupReceivableContractStatus(rec.contractCode, {
								contractStatus: '已终止',
								contractApprovalStatus: '审批终止',
							});
							_recordOverrides[1](function (prev) {
								var next = Object.assign({}, prev);
								next[rec.id] = Object.assign({}, next[rec.id] || {}, {
									approvalStatus: '审批终止',
									terminatedBy: true,
									remark: form.remark || '',
									terminateReason: form.reason,
									terminateAt: form.terminateAt,
								});
								return next;
							});
						}
						message.success('已提交审核（原型）；审批通过后合同标记为「已终止」，沿用原签署方式完成签章或盖章补传');
						_terminateModalVisible[1](false);
						_terminateModalRecord[1](null);
						_terminateForm[1]({ terminateAt: null, reason: undefined, remark: '' });
					} }, '提交审核'),
				],
			}, React.createElement('div', { className: 'lc-flow-modal lc-flow-modal--terminate', 'data-annotation-id': 'lc-action-terminate' },
				renderModalContractCode(_terminateModalRecord[0]),
				React.createElement('p', { className: 'lc-flow-modal__hint' }, '审批通过后沿用原合同签署方式：线上向乙方负责人发送 E签宝链接，线下需完成盖章合同补传。'),
				React.createElement('div', { className: 'lc-flow-modal__field' },
					React.createElement('label', { className: 'lc-flow-modal__label' }, '主动终止时间'),
					React.createElement(DatePicker, {
						showTime: { format: 'HH:mm' },
						format: 'YYYY-MM-DD HH:mm',
						style: { width: '100%' },
						placeholder: '请选择终止时间',
						onChange: function (_, dateString) {
							_terminateForm[1](function (prev) {
								return Object.assign({}, prev, { terminateAt: dateString || null });
							});
						},
					}),
				),
				React.createElement('div', { className: 'lc-flow-modal__field' },
					React.createElement('label', { className: 'lc-flow-modal__label' }, '终止原因'),
					React.createElement(Select, {
						style: { width: '100%' },
						placeholder: '请选择',
						options: [
							{ value: '客户原因', label: '客户原因' },
							{ value: '我方原因', label: '我方原因' },
						],
						onChange: function (value) {
							_terminateForm[1](function (prev) {
								return Object.assign({}, prev, { reason: value });
							});
						},
					}),
				),
				React.createElement('div', { className: 'lc-flow-modal__field' },
					React.createElement('label', { className: 'lc-flow-modal__label' }, '备注'),
					React.createElement(Input.TextArea, {
						rows: 3,
						placeholder: '可填写补充说明',
						onChange: function (e) {
							_terminateForm[1](function (prev) {
								return Object.assign({}, prev, { remark: e.target.value });
							});
						},
					}),
				),
			)),
			React.createElement(Modal, {
				title: '添加授权委托书',
				open: _authorizedModalVisible[0],
				onCancel: function() { _authorizedModalVisible[1](false); _authorizedModalRecord[1](null); },
				width: 640,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() { _authorizedModalVisible[1](false); _authorizedModalRecord[1](null); } }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						var rec = _authorizedModalRecord[0];
						message.success('已提交审核（原型）');
						message.info('审批通过后沿用原签署方式：线上 E签宝 / 线下盖章补传，新受托人生效（' + (rec && rec.contractCode ? rec.contractCode : '') + '）');
						_authorizedModalVisible[1](false);
						_authorizedModalRecord[1](null);
					} }, '提交审核')
				]
			}, React.createElement('div', { className: 'lc-flow-modal', style: { padding: '8px 0' }, 'data-annotation-id': 'lc-action-add-poa' },
				renderModalContractCode(_authorizedModalRecord[0]),
				React.createElement('p', { className: 'lc-flow-modal__hint' }, '新增受托人信息，审批通过后沿用原合同签署方式完成闭环。'),
				React.createElement(Table, {
					rowKey: function(_, i) { return String(i); },
					size: 'small',
					columns: [
						{ title: '受托人', key: 'name', width: 140, render: function(_, row, index) { return React.createElement(Input, { value: row.name, onChange: function(e) { updateAuthorizedRow(index, 'name', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '受托人联系电话', key: 'phone', width: 160, render: function(_, row, index) { return React.createElement(Input, { value: row.phone, onChange: function(e) { updateAuthorizedRow(index, 'phone', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '受托人身份证', key: 'idCard', width: 200, render: function(_, row, index) { return React.createElement(Input, { value: row.idCard, onChange: function(e) { updateAuthorizedRow(index, 'idCard', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '操作', key: 'action', width: 80, render: function(_, row, index) { return React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeAuthorizedRow(index); } }, '删除'); } }
					],
					dataSource: _authorizedList[0],
					pagination: false
				}),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addAuthorizedRow }, '添加一行')
			)),
			React.createElement(Modal, {
				title: '附加费用',
				open: _extraFeeModalVisible[0],
				onCancel: function() {
					_extraFeeModalVisible[1](false);
					_extraFeeModalRecord[1](null);
					_extraFeeExistingList[1]([]);
					_extraFeeNewList[1]([]);
				},
				width: 960,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() {
						_extraFeeModalVisible[1](false);
						_extraFeeModalRecord[1](null);
						_extraFeeExistingList[1]([]);
						_extraFeeNewList[1]([]);
					} }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						var lockedValues = getExtraFeeLockedServiceValues(_extraFeeExistingList[0]);
						var hasNewService = (_extraFeeNewList[0] || []).some(function(row) {
							return getExtraFeeNewServiceValues(row.serviceValues, lockedValues).length > 0;
						});
						if (!hasNewService) {
							message.warning('请至少新增一项服务项');
							return;
						}
						message.success('已提交审核（原型）');
						message.info('审批通过后按计费规则入账：先付后用计入下期租赁账单，先用后付计入当月并于下月一并支付；需完成线上签章或线下盖章补传');
						_extraFeeModalVisible[1](false);
						_extraFeeModalRecord[1](null);
						_extraFeeExistingList[1]([]);
						_extraFeeNewList[1]([]);
					} }, '提交审核')
				]
			}, React.createElement('div', { className: 'lc-flow-modal lc-flow-modal--extra-fee', style: { padding: '8px 0' }, 'data-annotation-id': 'lc-action-extra-fee' },
				renderModalContractCode(_extraFeeModalRecord[0]),
				React.createElement('p', { className: 'lc-flow-modal__hint' }, '已有附加费用不可修改；可新增服务项。审批通过后形成附件1补充附件。'),
				React.createElement('h4', { className: 'lc-flow-modal__section-title' }, '已有附加费用（不可修改）'),
				React.createElement(Table, {
					rowKey: 'key',
					size: 'small',
					columns: [
						{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
						{ title: '服务项目', dataIndex: 'serviceItem', key: 'serviceItem', width: 160 },
						{ title: '费用（元）', dataIndex: 'fee', key: 'fee', width: 100, className: 'tabular-nums' },
						{ title: '计费方式', dataIndex: 'billingMode', key: 'billingMode', width: 100 },
						{ title: '生效时间', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 120 },
					],
					dataSource: _extraFeeExistingList[0],
					pagination: false,
					locale: { emptyText: '暂无历史附加费用' },
				}),
				React.createElement('h4', { className: 'lc-flow-modal__section-title', style: { marginTop: 16 } }, '新增附加费用'),
				React.createElement(Table, {
					rowKey: 'key',
					size: 'small',
					columns: (function() {
						var lockedValues = getExtraFeeLockedServiceValues(_extraFeeExistingList[0]);
						return [
							{ title: '服务项目', key: 'serviceItem', width: 280, render: function(_, row, index) {
								return React.createElement(LeaseOrderServiceContentField, {
									variant: 'inline',
									triggerLabel: '选择服务项',
									value: row.serviceValues || lockedValues.slice(),
									lockedValues: lockedValues,
									onChange: function(nextValues) {
										updateExtraFeeNewRow(index, 'serviceValues', nextValues);
									},
								});
							} },
							{ title: '费用（元/天）', key: 'fee', width: 140, render: function(_, row, index) { return React.createElement(Input, { value: row.fee, onChange: function(e) { updateExtraFeeNewRow(index, 'fee', e.target.value); }, placeholder: '请输入', addonAfter: '元' }); } },
							{ title: '计费方式', key: 'billingMode', width: 140, render: function(_, row, index) { return React.createElement(Select, { style: { width: '100%' }, value: row.billingMode, options: [{ value: '先付后用', label: '先付后用' }, { value: '先用后付', label: '先用后付' }], onChange: function(v) { updateExtraFeeNewRow(index, 'billingMode', v); } }); } },
							{ title: '生效时间', key: 'effectiveDate', width: 160, render: function(_, row, index) { var dayjs = window.dayjs; var val = row.effectiveDate && dayjs ? dayjs(row.effectiveDate) : null; return React.createElement(DatePicker, { style: { width: '100%' }, placeholder: '请选择日期', value: val, onChange: function(date, dateString) { updateExtraFeeNewRow(index, 'effectiveDate', dateString || null); } }); } },
						];
					})(),
					dataSource: _extraFeeNewList[0],
					pagination: false,
				}),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addExtraFeeNewRow }, '添加服务项')
			)),
			renderStampUploadModal(),
			React.createElement(Modal, {
				title: '合同查看 · 盖章附件',
				open: _contractViewModalVisible[0],
				onCancel: function() {
					_contractViewModalVisible[1](false);
					_contractViewRecord[1](null);
				},
				width: 640,
				footer: [
					React.createElement(Button, { key: 'close', type: 'primary', onClick: function() {
						_contractViewModalVisible[1](false);
						_contractViewRecord[1](null);
					} }, '关闭'),
				],
			}, function () {
				var rec = _contractViewRecord[0];
				var files = rec ? (_stampedFilesOverride[0][rec.id] || []) : [];
				return React.createElement('div', { className: 'lc-contract-view-attachments' },
					React.createElement('p', { className: 'lc-contract-view-attachments__meta' },
						'合同编码：',
						React.createElement('strong', null, rec ? rec.contractCode : '-'),
					),
					files.length
						? React.createElement('ul', { className: 'lc-contract-view-attachments__list' },
							files.map(function (file) {
								return React.createElement('li', { key: file.uid || file.name, className: 'lc-contract-view-attachments__item' },
									React.createElement('span', { className: 'lc-contract-view-attachments__name', title: file.name }, file.name),
									React.createElement('div', { className: 'lc-contract-view-attachments__actions' },
										React.createElement(Button, {
											type: 'link',
											size: 'small',
											onClick: function () { message.info('预览：' + file.name + '（原型）'); },
										}, '预览'),
										React.createElement(Button, {
											type: 'link',
											size: 'small',
											onClick: function () { message.success('已开始下载：' + file.name + '（原型）'); },
										}, '下载'),
									),
								);
							}),
						)
						: React.createElement('p', { className: 'lc-contract-view-attachments__empty' }, '暂无盖章附件'),
				);
			}()),
			React.createElement(Modal, {
				title: '转三方合同',
				open: _tripartiteModalVisible[0],
				className: 'lc-tripartite-modal',
				onCancel: function() {
					_tripartiteModalVisible[1](false);
					_tripartiteModalRecord[1](null);
					_tripartiteAgreements[1]([]);
				},
				width: 640,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() {
						_tripartiteModalVisible[1](false);
						_tripartiteModalRecord[1](null);
						_tripartiteAgreements[1]([]);
					} }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						message.success('转三方合同已提交审核（原型）');
						_tripartiteModalVisible[1](false);
						_tripartiteModalRecord[1](null);
						_tripartiteAgreements[1]([]);
					} }, '提交审核'),
				],
			}, React.createElement('div', {
				className: 'lc-flow-modal lc-flow-modal--tripartite',
				'data-annotation-id': 'lc-action-convert-tripartite',
			},
				renderModalContractCode(_tripartiteModalRecord[0]),
				React.createElement('p', { className: 'lc-flow-modal__hint' }, '支持新增多条三方协议，并分别上传协议附件与对方公函。'),
				renderTripartiteAgreementEditor(_tripartiteAgreements[0], _tripartiteAgreements[1], 'lc-tripartite-agreements-editor'),
			)),
			React.createElement(Modal, {
				title: '试用转正式',
				open: _trialToFormalModalVisible[0],
				className: 'lc-trial-to-formal-modal',
				onCancel: function() {
					_trialToFormalModalVisible[1](false);
					_trialToFormalRecord[1](null);
					_trialToFormalDelegates[1]([]);
					_trialToFormalVehicles[1]([]);
					_trialToFormalTripartite[1](false);
					_trialToFormalAgreements[1]([]);
				},
				width: 920,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() {
						_trialToFormalModalVisible[1](false);
						_trialToFormalRecord[1](null);
						_trialToFormalDelegates[1]([]);
						_trialToFormalVehicles[1]([]);
						_trialToFormalTripartite[1](false);
						_trialToFormalAgreements[1]([]);
					} }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						var withTripartite = _trialToFormalTripartite[0];
						message.success(withTripartite
							? '试用转正式（含三方协议）已提交审核（原型）'
							: '试用转正式已提交审核（原型）');
						_trialToFormalModalVisible[1](false);
						_trialToFormalRecord[1](null);
						_trialToFormalDelegates[1]([]);
						_trialToFormalVehicles[1]([]);
						_trialToFormalTripartite[1](false);
						_trialToFormalAgreements[1]([]);
					} }, '提交审核'),
				],
			}, React.createElement('div', {
				className: 'lc-flow-modal lc-flow-modal--trial-formal',
				'data-annotation-id': 'lc-action-trial-to-formal',
			},
				renderModalContractCode(_trialToFormalRecord[0]),
				React.createElement('p', { className: 'lc-flow-modal__hint' }, '自动拉取当前合同客户、授权人与车辆订单信息；车辆订单可编辑。转三方可与转正式在同一步完成。'),
				React.createElement('section', { className: 'lc-flow-modal__section' },
					React.createElement('h4', { className: 'lc-flow-modal__section-title' }, '客户信息'),
					React.createElement('div', { className: 'lc-flow-modal__readonly-grid' },
						React.createElement('div', null, React.createElement('span', { className: 'lc-flow-modal__readonly-label' }, '客户名称'), React.createElement('span', null, _trialToFormalRecord[0] ? _trialToFormalRecord[0].customerName : '-')),
						React.createElement('div', null, React.createElement('span', { className: 'lc-flow-modal__readonly-label' }, '联系人'), React.createElement('span', null, _trialToFormalRecord[0] ? _trialToFormalRecord[0].contactName : '-')),
						React.createElement('div', null, React.createElement('span', { className: 'lc-flow-modal__readonly-label' }, '联系电话'), React.createElement('span', { className: 'tabular-nums' }, _trialToFormalRecord[0] ? _trialToFormalRecord[0].contactPhone : '-')),
					),
				),
				React.createElement('section', { className: 'lc-flow-modal__section' },
					React.createElement('h4', { className: 'lc-flow-modal__section-title' }, '授权人（可编辑）'),
					React.createElement(Table, {
						rowKey: function(_, i) { return String(i); },
						size: 'small',
						columns: [
							{ title: '姓名', key: 'name', width: 120, render: function(_, row, index) { return React.createElement(Input, { value: row.name, onChange: function(e) { updateTrialToFormalDelegate(index, 'name', e.target.value); }, placeholder: '请输入' }); } },
							{ title: '联系方式', key: 'phone', width: 140, render: function(_, row, index) { return React.createElement(Input, { value: row.phone, onChange: function(e) { updateTrialToFormalDelegate(index, 'phone', e.target.value); }, placeholder: '请输入' }); } },
							{ title: '证件号码', key: 'idCard', width: 180, render: function(_, row, index) { return React.createElement(Input, { value: row.idCard, onChange: function(e) { updateTrialToFormalDelegate(index, 'idCard', e.target.value); }, placeholder: '请输入' }); } },
						],
						dataSource: _trialToFormalDelegates[0],
						pagination: false,
					}),
				),
				React.createElement('section', { className: 'lc-flow-modal__section' },
					React.createElement('h4', { className: 'lc-flow-modal__section-title' }, '车辆订单（可编辑）'),
					React.createElement(Table, {
						rowKey: 'key',
						size: 'small',
						columns: [
							{ title: '品牌', key: 'brand', width: 90, render: function(_, row, index) { return React.createElement(Input, { value: row.brand, onChange: function(e) { updateTrialToFormalVehicle(index, 'brand', e.target.value); } }); } },
							{ title: '型号', key: 'model', width: 120, render: function(_, row, index) { return React.createElement(Input, { value: row.model, onChange: function(e) { updateTrialToFormalVehicle(index, 'model', e.target.value); } }); } },
							{ title: '车牌号', key: 'plateNo', width: 100, render: function(_, row, index) { return React.createElement(Input, { value: row.plateNo, onChange: function(e) { updateTrialToFormalVehicle(index, 'plateNo', e.target.value); } }); } },
							{ title: '租金（元/月）', key: 'rent', width: 120, render: function(_, row, index) { return React.createElement(Input, { value: row.rent, onChange: function(e) { updateTrialToFormalVehicle(index, 'rent', e.target.value); }, placeholder: '请输入' }); } },
							{ title: '租期（月）', key: 'leasePeriodMonths', width: 100, render: function(_, row, index) { return React.createElement(Input, { value: row.leasePeriodMonths, onChange: function(e) { updateTrialToFormalVehicle(index, 'leasePeriodMonths', e.target.value); }, placeholder: '月数' }); } },
						],
						dataSource: _trialToFormalVehicles[0],
						pagination: false,
						scroll: { x: 640 },
					}),
				),
				React.createElement('section', { className: 'lc-flow-modal__section' },
					React.createElement(Checkbox, {
						checked: _trialToFormalTripartite[0],
						onChange: function(e) {
							_trialToFormalTripartite[1](e.target.checked);
							if (e.target.checked && !_trialToFormalAgreements[0].length) {
								_trialToFormalAgreements[1]([createEmptyTripartiteAgreement()]);
							}
						},
					}, '同时转三方合同（可在本步骤新增三方协议）'),
					_trialToFormalTripartite[0]
						? renderTripartiteAgreementEditor(_trialToFormalAgreements[0], _trialToFormalAgreements[1], 'lc-trial-formal-tripartite-editor')
						: null,
				),
			))
		)
	);
};

export default Component;
