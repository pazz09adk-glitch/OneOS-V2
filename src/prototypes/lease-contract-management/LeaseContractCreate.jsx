import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Select, message } from 'antd';
import { Info, Check } from 'lucide-react';
import {
	DEFAULT_MILEAGE_STANDARD,
	DEFAULT_FEE_INFO,
	generateAutoContractCodeSuffix,
	getLeaseCustomerById,
} from '../contract-template-management/contract-template-vars.js';
import {
	hasBlockingCustomerCredentials,
	summarizeCustomerCredentials,
	formatCredentialSubmitBlockMessage,
} from './lease-customer-credentials.js';
import {
	getPublishedContractTemplateOptions,
	subscribePublishedContractTemplateOptions,
	getContractTypeLabel,
} from '../contract-template-management/contract-template-catalog.js';
import { buildLeaseContractEditFormState } from './lease-contract-edit-bridge.js';
import {
	FLOW_MODE_CREATE,
	FLOW_MODE_EDIT,
	FLOW_MODE_ADD_VEHICLE,
	FLOW_MODE_ADD_POA,
	FLOW_MODE_TRIPARTITE,
	getFlowPageTitle,
	countNewPickupVehicles,
} from './lease-contract-flow-bridge.js';
import { createDefaultLeaseOrderState, createDefaultPowerOfAttorneyState, normalizeLeaseOrderState } from './lease-order-vars.js';
import {
	buildLeaseContractPreviewHtml,
	extractLeaseOrderAttachment1PreviewHtml,
	extractPowerOfAttorneyPreviewHtml,
} from './lease-contract-preview-build.js';
import {
	resolveLeaseContractApprovalType,
	STANDARD_CONTRACT_APPROVAL,
	NONSTANDARD_CONTRACT_APPROVAL,
} from './lease-contract-approval-rules.js';
import {
	isMainContractFormComplete,
	isLeaseOrderFormComplete,
	isPowerOfAttorneyFormComplete,
	isPowerOfAttorneySubmitReady,
	isPowerOfAttorneyOptionalEmpty,
	isSealTypeSelected,
	isLeaseContractFormComplete,
	isTripartitePartyComplete,
} from './lease-contract-form-validation.js';
import LeaseContractPreviewPanel, {
	PreviewEditableHint,
	PreviewApprovalHint,
	PreviewAttachment1ReadonlyHint,
	PreviewPowerOfAttorneyReadonlyHint,
} from './LeaseContractPreviewPanel.jsx';
import LeaseContractEditorForm, {
	LeaseContractLeaseOrderSection,
	LeaseContractPowerOfAttorneySection,
	LeaseContractRemarkSection,
} from './LeaseContractEditorForm.jsx';
import {
	CONTRACT_SIGNING_METHOD_ONLINE,
	CONTRACT_SIGNING_METHOD_OPTIONS,
} from './lease-contract-signing.js';
import {
	createPickupReceivableFromLeaseSubmit,
	formatLeaseContractCode,
} from '../vehicle-pickup-receivable/pickup-receivable-bridge.js';

var SEAL_TYPE_OPTIONS = [
	{ value: 'contract', label: '合同章' },
	{ value: 'official', label: '公章' },
	{ value: 'legal_person', label: '法人章' },
];

function normalizeSealTypes(types) {
	var allowed = SEAL_TYPE_OPTIONS.map(function (item) { return item.value; });
	var next = (types || ['contract']).filter(function (value) {
		return allowed.indexOf(value) >= 0;
	});
	return next.length ? next : ['contract'];
}

function renderCreateStepNumberIcon(step, options) {
	var opts = options || {};
	var size = opts.size || 22;
	var className = 'lc-create-step-icon' + (opts.className ? ' ' + opts.className : '');
	var hideLabel = opts.hideLabel === true;
	return React.createElement('svg', {
		className: className,
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		focusable: 'false',
		'aria-hidden': hideLabel ? true : undefined,
		role: hideLabel ? undefined : 'img',
		'aria-label': hideLabel ? undefined : ('步骤 ' + step),
	},
		React.createElement('circle', {
			cx: 12,
			cy: 12,
			r: 9.25,
			className: 'lc-create-step-icon__ring',
		}),
		React.createElement('text', {
			x: 12,
			y: 12,
			className: 'lc-create-step-icon__digit',
		}, String(step)),
	);
}

function renderCreateStepTitle(step, title) {
	return React.createElement('div', { className: 'ct-panel-head__title lc-create-step-title' },
		renderCreateStepNumberIcon(step, { className: 'lc-create-step-title__badge', hideLabel: true }),
		React.createElement('span', { className: 'lc-create-step-title__text' }, title),
	);
}

export default function LeaseContractCreate({ onBack, initialScrollSection, editRecord, flowMode, flowInitialFormState }) {
	var effectiveFlowMode = flowMode || (editRecord && editRecord.id ? FLOW_MODE_EDIT : FLOW_MODE_CREATE);
	var isAddVehicleFlow = effectiveFlowMode === FLOW_MODE_ADD_VEHICLE;
	var isAddPoaFlow = effectiveFlowMode === FLOW_MODE_ADD_POA;
	var isTripartiteFlow = effectiveFlowMode === FLOW_MODE_TRIPARTITE;
	var isScopedPreviewFlow = isAddVehicleFlow || isAddPoaFlow;
	var pageTitle = getFlowPageTitle(effectiveFlowMode);
	var contractTypeState = useState('');
	var contractType = contractTypeState[0];
	var setContractType = contractTypeState[1];
	var contractTemplateIdState = useState('');
	var contractTemplateId = contractTemplateIdState[0];
	var setContractTemplateId = contractTemplateIdState[1];
	var contractTemplateIdRef = useRef('');
	useEffect(function () {
		contractTemplateIdRef.current = contractTemplateId;
	}, [contractTemplateId]);
	var templateOptionsState = useState(function () { return getPublishedContractTemplateOptions(); });
	var templateOptions = templateOptionsState[0];
	var setTemplateOptions = templateOptionsState[1];
	var templateSelectOptions = useMemo(function () {
		return templateOptions.map(function (option) {
			return {
				value: option.id,
				label: option.contractTypeLabel || option.title || option.kind || option.id,
				contractType: option.contractType,
			};
		});
	}, [templateOptions]);
	function handleTemplateSelect(templateId) {
		if (!templateId) {
			setContractTemplateId('');
			setContractType('');
			return;
		}
		var match = templateOptions.find(function (item) { return item.id === templateId; });
		setContractTemplateId(templateId);
		setContractType(match ? match.contractType : '');
	}
	useEffect(function () {
		return subscribePublishedContractTemplateOptions(function () {
			var next = getPublishedContractTemplateOptions();
			setTemplateOptions(next);
			var currentId = contractTemplateIdRef.current;
			if (currentId && !next.some(function (item) { return item.id === currentId; })) {
				setContractTemplateId('');
				setContractType('');
				message.warning('所选模板已停用或不可用，请重新选择');
			}
		});
	}, []);
	var workspaceZoomState = useState(100);
	var workspaceZoom = workspaceZoomState[0];
	var setWorkspaceZoom = workspaceZoomState[1];
	var lessorIdState = useState('');
	var customerIdState = useState('');
	var mileageState = useState(Object.assign({}, DEFAULT_MILEAGE_STANDARD));
	var feeInfoState = useState(Object.assign({}, DEFAULT_FEE_INFO));
	var contractCodeState = useState(function () { return generateAutoContractCodeSuffix(); });
	var projectNameState = useState('');
	var businessDeptState = useState('');
	var businessOwnerState = useState('');
	var leaseOrderState = useState(function () {
		return normalizeLeaseOrderState(createDefaultLeaseOrderState());
	});
	var lessorId = lessorIdState[0];
	var setLessorId = lessorIdState[1];
	var customerId = customerIdState[0];
	var setCustomerId = customerIdState[1];
	var mileage = mileageState[0];
	var setMileage = mileageState[1];
	var feeInfo = feeInfoState[0];
	var setFeeInfo = feeInfoState[1];
	var contractCode = contractCodeState[0];
	var setContractCode = contractCodeState[1];
	var projectName = projectNameState[0];
	var setProjectName = projectNameState[1];
	var businessDept = businessDeptState[0];
	var setBusinessDept = businessDeptState[1];
	var businessOwner = businessOwnerState[0];
	var setBusinessOwner = businessOwnerState[1];
	var leaseOrder = leaseOrderState[0];
	var setLeaseOrder = leaseOrderState[1];
	var powerOfAttorneyState = useState(function () {
		var initial = createDefaultPowerOfAttorneyState();
		return {
			delegates: initial.delegates.map(function (row) {
				return Object.assign({}, row);
			}),
		};
	});
	var powerOfAttorney = powerOfAttorneyState[0];
	var setPowerOfAttorney = powerOfAttorneyState[1];
	var contractRemarkState = useState('');
	var contractRemark = contractRemarkState[0];
	var setContractRemark = contractRemarkState[1];
	var customerPrincipalNameState = useState('');
	var customerPrincipalName = customerPrincipalNameState[0];
	var setCustomerPrincipalName = customerPrincipalNameState[1];
	var customerPrincipalPhoneState = useState('');
	var customerPrincipalPhone = customerPrincipalPhoneState[0];
	var setCustomerPrincipalPhone = customerPrincipalPhoneState[1];
	var thirdPartyCustomerIdState = useState('');
	var thirdPartyCustomerId = thirdPartyCustomerIdState[0];
	var setThirdPartyCustomerId = thirdPartyCustomerIdState[1];
	var thirdPartyPrincipalNameState = useState('');
	var thirdPartyPrincipalName = thirdPartyPrincipalNameState[0];
	var setThirdPartyPrincipalName = thirdPartyPrincipalNameState[1];
	var thirdPartyPrincipalPhoneState = useState('');
	var thirdPartyPrincipalPhone = thirdPartyPrincipalPhoneState[0];
	var setThirdPartyPrincipalPhone = thirdPartyPrincipalPhoneState[1];
	var contractSigningMethodState = useState(CONTRACT_SIGNING_METHOD_ONLINE);
	var contractSigningMethod = contractSigningMethodState[0];
	var setContractSigningMethod = contractSigningMethodState[1];
	var sealTypesState = useState(['contract']);
	var sealTypes = sealTypesState[0];
	var setSealTypes = sealTypesState[1];
	var contractApprovalTypeState = useState(STANDARD_CONTRACT_APPROVAL);
	var contractApprovalType = contractApprovalTypeState[0];
	var setContractApprovalType = contractApprovalTypeState[1];
	var previewMergedHtmlState = useState('');
	var previewMergedHtml = previewMergedHtmlState[0];
	var setPreviewMergedHtml = previewMergedHtmlState[1];

	var previewHtml = useMemo(function () {
		if (!contractTemplateId) return '';
		var fullHtml = buildLeaseContractPreviewHtml({
			contractTemplateId: contractTemplateId,
			lessorId: lessorId,
			customerId: customerId,
			mileage: mileage,
			feeInfo: feeInfo,
			contractCode: contractCode,
			leaseOrder: leaseOrder,
			powerOfAttorney: powerOfAttorney,
		});
		if (isAddVehicleFlow) return extractLeaseOrderAttachment1PreviewHtml(fullHtml);
		if (isAddPoaFlow) return extractPowerOfAttorneyPreviewHtml(fullHtml);
		return fullHtml;
	}, [contractTemplateId, lessorId, customerId, mileage, feeInfo, contractCode, leaseOrder, powerOfAttorney, isAddVehicleFlow, isAddPoaFlow]);

	var isPreviewEditable = !isScopedPreviewFlow;

	var handlePreviewContentChange = useCallback(function (mergedHtml) {
		if (!isPreviewEditable) return;
		setPreviewMergedHtml(mergedHtml || '');
		setContractApprovalType(resolveLeaseContractApprovalType(previewHtml, mergedHtml, {
			leaseOrder: leaseOrder,
			feeInfo: feeInfo,
			sealTypes: sealTypes,
		}));
	}, [previewHtml, leaseOrder, feeInfo, sealTypes, isPreviewEditable]);

	useEffect(function () {
		setContractApprovalType(resolveLeaseContractApprovalType(
			previewHtml,
			previewMergedHtml || previewHtml,
			{
				leaseOrder: leaseOrder,
				feeInfo: feeInfo,
				sealTypes: sealTypes,
			},
		));
	}, [previewHtml, previewMergedHtml, leaseOrder, feeInfo, sealTypes]);

	var isNonStandardApproval = contractApprovalType === NONSTANDARD_CONTRACT_APPROVAL;
	var isTemplateSelected = Boolean(contractTemplateId);

	var isMainContractComplete = useMemo(function () {
		var baseComplete = isMainContractFormComplete({
			lessorId: lessorId,
			customerId: customerId,
			contractCode: contractCode,
			businessDept: businessDept,
			businessOwner: businessOwner,
			mileage: mileage,
			feeInfo: feeInfo,
		});
		if (!baseComplete) return false;
		if (isTripartiteFlow) {
			return isTripartitePartyComplete({
				customerId: customerId,
				thirdPartyCustomerId: thirdPartyCustomerId,
			});
		}
		return true;
	}, [lessorId, customerId, contractCode, businessDept, businessOwner, mileage, feeInfo, isTripartiteFlow, thirdPartyCustomerId]);

	var isLeaseOrderComplete = useMemo(function () {
		return isLeaseOrderFormComplete({ leaseOrder: leaseOrder });
	}, [leaseOrder]);

	var isPowerOfAttorneyComplete = useMemo(function () {
		return isPowerOfAttorneyFormComplete({ powerOfAttorney: powerOfAttorney });
	}, [powerOfAttorney]);

	var isPoaSubmitReady = useMemo(function () {
		return isPowerOfAttorneySubmitReady({ powerOfAttorney: powerOfAttorney });
	}, [powerOfAttorney]);

	var isPowerOfAttorneyEmpty = useMemo(function () {
		return isPowerOfAttorneyOptionalEmpty({ powerOfAttorney: powerOfAttorney });
	}, [powerOfAttorney]);

	var isSealTypeComplete = useMemo(function () {
		return isSealTypeSelected({ sealTypes: sealTypes });
	}, [sealTypes]);

	var isFormSubmitReady = useMemo(function () {
		return isLeaseContractFormComplete({
			lessorId: lessorId,
			customerId: customerId,
			contractCode: contractCode,
			mileage: mileage,
			feeInfo: feeInfo,
			leaseOrder: leaseOrder,
			powerOfAttorney: powerOfAttorney,
			sealTypes: sealTypes,
		});
	}, [lessorId, customerId, contractCode, mileage, feeInfo, leaseOrder, powerOfAttorney, sealTypes]);

	function toggleSealType(value) {
		setSealTypes(function (current) {
			var index = current.indexOf(value);
			if (index >= 0) {
				var next = current.filter(function (item) { return item !== value; });
				return next.length ? next : current;
			}
			return current.concat([value]);
		});
	}

	var columnRef = useRef(null);
	var sectionRefs = {
		template: useRef(null),
		main: useRef(null),
		leaseOrder: useRef(null),
		poa: useRef(null),
		remark: useRef(null),
		seal: useRef(null),
	};

	useEffect(function () {
		if (!initialScrollSection) return undefined;
		var timer = window.setTimeout(function () {
			scrollToCreateSection(initialScrollSection);
		}, 160);
		return function () { window.clearTimeout(timer); };
	}, [initialScrollSection, editRecord && editRecord.id]);

	useEffect(function () {
		if (!editRecord || !editRecord.id) return;
		var formState = buildLeaseContractEditFormState(editRecord);
		if (!formState) return;
		applyBridgeFormState(formState);
	}, [editRecord && editRecord.id]);

	useEffect(function () {
		if (!flowInitialFormState) return;
		applyBridgeFormState(flowInitialFormState);
	}, [flowInitialFormState && flowInitialFormState.contractCode]);

	function applyBridgeFormState(formState) {
		if (!formState) return;
		setContractTemplateId(formState.contractTemplateId || '');
		setLessorId(formState.lessorId || '');
		setCustomerId(formState.customerId || '');
		setContractCode(formState.contractCode || '');
		setProjectName(formState.projectName || '');
		setBusinessDept(formState.businessDept || '');
		setBusinessOwner(formState.businessOwner || '');
		setMileage(Object.assign({}, formState.mileage));
		setFeeInfo(Object.assign({}, formState.feeInfo));
		setLeaseOrder(normalizeLeaseOrderState(formState.leaseOrder));
		setPowerOfAttorney({
			delegates: ((formState.powerOfAttorney && formState.powerOfAttorney.delegates) || []).map(function (row) {
				return Object.assign({}, row);
			}),
		});
		setContractRemark(formState.contractRemark || '');
		setCustomerPrincipalName(formState.customerPrincipalName || '');
		setCustomerPrincipalPhone(formState.customerPrincipalPhone || '');
		setThirdPartyCustomerId(formState.thirdPartyCustomerId || '');
		setThirdPartyPrincipalName(formState.thirdPartyPrincipalName || '');
		setThirdPartyPrincipalPhone(formState.thirdPartyPrincipalPhone || '');
		setSealTypes(normalizeSealTypes(formState.sealTypes));
		if (formState.contractType) {
			setContractType(formState.contractType);
		} else if (formState.contractTemplateId) {
			var tplMatch = templateOptions.find(function (item) { return item.id === formState.contractTemplateId; });
			if (tplMatch) setContractType(tplMatch.contractType || '');
		}
	}

	var createSteps = useMemo(function () {
		return [
			{
				key: 'template',
				label: '选择模板',
				done: isTemplateSelected,
				optional: false,
				locked: false,
			},
			{
				key: 'main',
				label: '主体合同',
				done: isMainContractComplete,
				optional: false,
				locked: !isTemplateSelected,
			},
			{
				key: 'leaseOrder',
				label: '租赁订单',
				done: isLeaseOrderComplete,
				optional: false,
				locked: !isTemplateSelected,
			},
			{
				key: 'poa',
				label: '授权委托',
				done: !isPowerOfAttorneyEmpty && isPowerOfAttorneyComplete,
				optional: isPowerOfAttorneyEmpty,
				locked: !isTemplateSelected,
			},
			{
				key: 'remark',
				label: '合同备注',
				done: Boolean((contractRemark || '').trim()),
				optional: true,
				locked: !isTemplateSelected,
			},
			{
				key: 'seal',
				label: '用章类型',
				done: isSealTypeComplete,
				optional: false,
				locked: !isTemplateSelected,
			},
		];
	}, [
		isTemplateSelected,
		isMainContractComplete,
		isLeaseOrderComplete,
		isPowerOfAttorneyComplete,
		isPowerOfAttorneyEmpty,
		isSealTypeComplete,
		contractRemark,
	]);

	function scrollToCreateSection(stepKey) {
		var target = sectionRefs[stepKey] && sectionRefs[stepKey].current;
		var container = columnRef.current;
		if (!target || !container) return;
		var containerTop = container.getBoundingClientRect().top;
		var targetTop = target.getBoundingClientRect().top;
		container.scrollTo({
			top: container.scrollTop + (targetTop - containerTop),
			behavior: 'smooth',
		});
	}

	function handleStepNavClick(step) {
		if (step.locked && step.key !== 'template') {
			message.info('请先选择合同模板');
			scrollToCreateSection('template');
			return;
		}
		scrollToCreateSection(step.key);
	}

	function renderSectionLock(stepKey) {
		if (isTemplateSelected) return null;
		return React.createElement('div', {
			className: 'lc-create-section__lock',
			role: 'region',
			'aria-label': '需先选择合同模板',
		},
			React.createElement('p', { className: 'lc-create-section__lock-text' },
				'请先完成',
				renderCreateStepNumberIcon(1, { className: 'lc-create-section__lock-step-icon', size: 18, hideLabel: true }),
				'选择合同模板，再填写本节内容。',
			),
			React.createElement('button', {
				type: 'button',
				className: 'vm-btn vm-btn-secondary lc-create-section__lock-btn',
				'data-vm-icon': 'eye',
				onClick: function () { scrollToCreateSection('template'); },
			}, '前往选择模板'),
		);
	}

	function isSectionFlowFormLocked(stepKey) {
		return isAddPoaFlow && stepKey !== 'poa';
	}

	function renderFlowFormLock(stepKey) {
		if (!isSectionFlowFormLocked(stepKey)) return null;
		return React.createElement('div', {
			className: 'lc-create-section__lock lc-create-section__lock--flow',
			role: 'region',
			'aria-label': '本流程仅可编辑授权委托书',
		},
			React.createElement('p', { className: 'lc-create-section__lock-text' },
				'本流程仅可编辑受托人信息，其余内容沿用来源合同，无需修改。',
			),
		);
	}

	function getCreateSectionDisabledClass(stepKey) {
		if (!isTemplateSelected && stepKey !== 'template') return ' lc-create-section--disabled';
		if (isSectionFlowFormLocked(stepKey)) return ' lc-create-section--disabled';
		return '';
	}

	function getPreviewPanelTitle() {
		if (isAddVehicleFlow) return '附件1预览';
		if (isAddPoaFlow) return '授权委托书预览';
		return '实时预览';
	}

	function getPreviewPanelAriaLabel() {
		return getPreviewPanelTitle();
	}

	function renderPreviewReadonlyHint() {
		if (isAddVehicleFlow) return React.createElement(PreviewAttachment1ReadonlyHint);
		if (isAddPoaFlow) return React.createElement(PreviewPowerOfAttorneyReadonlyHint);
		return React.createElement(PreviewEditableHint);
	}

	function getPreviewHintId() {
		if (isAddVehicleFlow) return 'lc-preview-attachment1-hint';
		if (isAddPoaFlow) return 'lc-preview-poa-hint';
		return 'lc-preview-editable-hint';
	}

	function getPreviewPanelCardClass() {
		var cls = 'ct-editor-column-card ct-editor-column-card--preview';
		if (isAddVehicleFlow) cls += ' ct-editor-column-card--preview-attachment1';
		if (isAddPoaFlow) cls += ' ct-editor-column-card--preview-poa';
		return cls;
	}

	function renderStepNav() {
		return React.createElement('nav', {
			className: 'lc-create-step-nav',
			'aria-label': '填写步骤',
			'data-annotation-id': 'lc-create-step-nav',
		},
			React.createElement('ol', { className: 'lc-create-step-nav__list' },
				createSteps.map(function (step, index) {
					var statusClass = step.done
						? 'lc-create-step-nav__item--done'
						: (step.optional ? 'lc-create-step-nav__item--optional' : 'lc-create-step-nav__item--pending');
					if (step.locked) statusClass += ' lc-create-step-nav__item--locked';
					return React.createElement('li', { key: step.key, className: 'lc-create-step-nav__item ' + statusClass },
						React.createElement('button', {
							type: 'button',
							className: 'lc-create-step-nav__btn',
							onClick: function () { handleStepNavClick(step); },
							'aria-current': step.key === 'template' && !isTemplateSelected ? 'step' : undefined,
						},
							React.createElement('span', { className: 'lc-create-step-nav__index', 'aria-hidden': true },
								step.done
									? React.createElement(Check, { size: 14, strokeWidth: 2.5, 'aria-hidden': true })
									: renderCreateStepNumberIcon(index + 1, { className: 'lc-create-step-title__badge', hideLabel: true }),
							),
							React.createElement('span', { className: 'lc-create-step-nav__label' }, step.label),
							React.createElement('span', {
								className: 'lc-create-step-nav__tag' + (step.optional ? '' : ' lc-create-step-nav__tag--required'),
							}, step.optional ? '选填' : '必填'),
						),
						index < createSteps.length - 1
							? React.createElement('span', { className: 'lc-create-step-nav__sep', 'aria-hidden': true })
							: null,
					);
				}),
			),
		);
	}

	return React.createElement('div', { className: 'vm-page lc-page lc-create-page ct-page' },
		React.createElement('div', { className: 'lc-create-topbar' },
		React.createElement('button', {
			type: 'button',
			className: 'vm-btn vm-btn-back',
			onClick: onBack,
		}, '返回列表'),
		effectiveFlowMode !== FLOW_MODE_CREATE
			? React.createElement('span', { className: 'lc-create-topbar__title' }, pageTitle)
			: null,
		),
		flowInitialFormState && (flowInitialFormState._pickupReceivableHint || flowInitialFormState._signingHint || flowInitialFormState._sourceContractCode)
			? React.createElement('div', {
				className: 'lc-flow-banner',
				role: 'note',
				'data-annotation-id': 'lc-create-flow-hint',
			},
				flowInitialFormState._sourceContractCode
					? React.createElement('p', { className: 'lc-flow-banner__line' },
						'来源合同：',
						React.createElement('strong', null, flowInitialFormState._sourceContractCode),
					)
					: null,
				flowInitialFormState._pickupReceivableHint
					? React.createElement('p', { className: 'lc-flow-banner__line' }, flowInitialFormState._pickupReceivableHint)
					: null,
				flowInitialFormState._signingHint
					? React.createElement('p', { className: 'lc-flow-banner__line' }, flowInitialFormState._signingHint)
					: null,
			)
			: null,
		React.createElement('div', { className: 'ct-editor-page lc-create-editor-page' },
			React.createElement('div', { className: 'ct-editor-workspace' },
				React.createElement(Row, { gutter: [16, 16] },
					React.createElement(Col, { xs: 24, lg: 12 },
						React.createElement('div', { className: 'lc-create-editor-column-shell' },
							renderStepNav(),
							React.createElement('div', { className: 'lc-create-editor-column', ref: columnRef },
							React.createElement('section', {
								className: 'ct-editor-column-card lc-template-step-card lc-create-section'
									+ getCreateSectionDisabledClass('template'),
								'aria-label': '选择合同类型',
								'data-annotation-id': 'lc-create-template',
								id: 'lc-create-section-template',
								ref: sectionRefs.template,
							},
								React.createElement('div', {
									className: 'ct-panel-head lc-main-contract-card__head lc-template-step-card__head',
									'aria-describedby': 'lc-template-step-hint',
								},
									React.createElement('div', { className: 'lc-template-step-card__title-row' },
										renderCreateStepTitle(1, '选择合同类型'),
										React.createElement('span', {
											className: 'lc-form-card__hint',
											role: 'note',
											id: 'lc-template-step-hint',
										},
											React.createElement(Info, {
												size: 13,
												className: 'lc-form-card__hint-icon',
												'aria-hidden': true,
											}),
											React.createElement('span', { className: 'lc-form-card__hint-text' },
												'选择对应合同模板后，右侧自动生成该合同预览内容',
											),
										),
									),
									React.createElement('span', {
										className: 'lc-form-completion-badge ' + (isTemplateSelected ? 'lc-form-completion-badge--done' : 'lc-form-completion-badge--pending'),
										role: 'status',
										'aria-live': 'polite',
									}, isTemplateSelected ? '已选择' : '必选'),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel lc-template-step-panel' },
									React.createElement('div', { className: 'lc-template-step-fields', 'data-annotation-id': 'lc-create-template-fields' },
										React.createElement('div', { className: 'lc-form-field' },
											React.createElement('label', { className: 'lc-form-field__label' }, '合同模板'),
											React.createElement('div', { className: 'lc-form-field__control' },
												React.createElement(Select, {
													className: 'lc-form-select lc-template-select',
													value: contractTemplateId || undefined,
													placeholder: templateSelectOptions.length ? '请选择合同模板' : '暂无可用模板',
													allowClear: !isAddPoaFlow,
													showSearch: true,
													optionFilterProp: 'label',
													disabled: !templateSelectOptions.length || isAddPoaFlow,
													onChange: handleTemplateSelect,
													options: templateSelectOptions,
													'aria-label': '合同模板',
												}),
											),
										),
										React.createElement('div', {
											className: 'lc-form-field',
											'data-annotation-id': 'lc-create-signing-method',
										},
											React.createElement('label', { className: 'lc-form-field__label' }, '合同签署方式'),
											React.createElement('div', { className: 'lc-form-field__control' },
												React.createElement(Select, {
													className: 'lc-form-select lc-template-signing-row__select',
													value: contractSigningMethod,
													options: CONTRACT_SIGNING_METHOD_OPTIONS,
													onChange: function (value) { setContractSigningMethod(value || CONTRACT_SIGNING_METHOD_ONLINE); },
													'aria-label': '合同签署方式',
												}),
											),
										),
									),
									!templateSelectOptions.length
										? React.createElement('p', { className: 'lc-template-step-empty' }, '暂无已启用的合同模板，请先在合同模板管理中发布并启用。')
										: null,
								),
								renderFlowFormLock('template'),
							),
							React.createElement('section', {
								className: 'ct-editor-column-card lc-main-contract-card lc-create-section'
									+ getCreateSectionDisabledClass('main'),
								'aria-label': '主体合同信息',
								'data-annotation-id': 'lc-create-main-contract',
								id: 'lc-create-section-main',
								ref: sectionRefs.main,
							},
								React.createElement('div', { className: 'ct-panel-head lc-main-contract-card__head' },
									renderCreateStepTitle(2, '主体合同信息'),
									React.createElement('span', {
										className: 'lc-form-completion-badge ' + (isMainContractComplete ? 'lc-form-completion-badge--done' : 'lc-form-completion-badge--pending'),
										role: 'status',
										'aria-live': 'polite',
									}, isMainContractComplete ? '已完成' : '未完成'),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel lc-main-contract-panel' },
									React.createElement(LeaseContractEditorForm, {
										lessorId: lessorId,
										customerId: customerId,
										thirdPartyCustomerId: thirdPartyCustomerId,
										showThirdPartyParty: isTripartiteFlow,
										contractCode: contractCode,
										projectName: projectName,
										contractCodeReadonly: effectiveFlowMode !== FLOW_MODE_EDIT,
										businessDept: businessDept,
										businessOwner: businessOwner,
										mileage: mileage,
										feeInfo: feeInfo,
										onLessorChange: setLessorId,
										onCustomerChange: function (value) {
											setCustomerId(value);
											if (thirdPartyCustomerId && thirdPartyCustomerId === value) {
												setThirdPartyCustomerId('');
											}
										},
										onThirdPartyCustomerChange: setThirdPartyCustomerId,
										onContractCodeChange: setContractCode,
										onProjectNameChange: setProjectName,
										onBusinessAssignmentChange: function (dept, owner) {
											setBusinessDept(dept);
											setBusinessOwner(owner);
										},
										onMileageChange: setMileage,
										onFeeInfoChange: setFeeInfo,
										customerPrincipalName: customerPrincipalName,
										customerPrincipalPhone: customerPrincipalPhone,
										onCustomerPrincipalChange: function (name, phone) {
											setCustomerPrincipalName(name);
											setCustomerPrincipalPhone(phone);
										},
										thirdPartyPrincipalName: thirdPartyPrincipalName,
										thirdPartyPrincipalPhone: thirdPartyPrincipalPhone,
										onThirdPartyPrincipalChange: function (name, phone) {
											setThirdPartyPrincipalName(name);
											setThirdPartyPrincipalPhone(phone);
										},
									}),
								),
								renderSectionLock('main'),
								renderFlowFormLock('main'),
							),
							React.createElement('section', {
								className: 'ct-editor-column-card lc-create-section'
									+ getCreateSectionDisabledClass('leaseOrder'),
								'aria-label': '附件1：租赁订单',
								'data-annotation-id': 'lc-create-lease-order',
								id: 'lc-create-section-lease-order',
								ref: sectionRefs.leaseOrder,
							},
								React.createElement('div', { className: 'ct-panel-head' },
									renderCreateStepTitle(3, '附件1 · 租赁订单'),
									React.createElement('span', {
										className: 'lc-form-completion-badge ' + (isLeaseOrderComplete ? 'lc-form-completion-badge--done' : 'lc-form-completion-badge--pending'),
										role: 'status',
										'aria-live': 'polite',
									}, isLeaseOrderComplete ? '已完成' : '未完成'),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel' },
									React.createElement(LeaseContractLeaseOrderSection, {
										leaseOrder: leaseOrder,
										onLeaseOrderChange: setLeaseOrder,
									}),
								),
								renderSectionLock('leaseOrder'),
								renderFlowFormLock('leaseOrder'),
							),
							React.createElement('section', {
								className: 'ct-editor-column-card lc-create-section'
									+ getCreateSectionDisabledClass('poa'),
								'aria-label': '授权委托书',
								'data-annotation-id': 'lc-create-poa',
								id: 'lc-create-section-poa',
								ref: sectionRefs.poa,
							},
								React.createElement('div', {
									className: 'ct-panel-head lc-create-section__head lc-create-section-poa-head',
									'aria-describedby': 'lc-create-poa-hint',
								},
									React.createElement('div', { className: 'lc-template-step-card__title-row' },
										renderCreateStepTitle(4, '授权委托书'),
										React.createElement('span', {
											className: 'lc-form-card__hint lc-create-poa-hint',
											role: 'note',
											id: 'lc-create-poa-hint',
											'data-annotation-id': 'lc-create-poa-hint',
										},
											React.createElement(Info, {
												size: 13,
												className: 'lc-form-card__hint-icon',
												'aria-hidden': true,
											}),
											React.createElement('span', { className: 'lc-form-card__hint-text' },
												'添加受托人须同时上传授权委托书，受托人主要用于交还车时E签宝签章',
											),
										),
									),
									React.createElement('span', {
										className: 'lc-form-completion-badge '
											+ (isPowerOfAttorneyEmpty
												? 'lc-form-completion-badge--optional'
												: (isPowerOfAttorneyComplete
													? 'lc-form-completion-badge--done'
													: 'lc-form-completion-badge--pending')),
										role: 'status',
										'aria-live': 'polite',
									}, isPowerOfAttorneyEmpty ? '选填' : (isPowerOfAttorneyComplete ? '已完成' : '未完成')),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel' },
									React.createElement(LeaseContractPowerOfAttorneySection, {
										powerOfAttorney: powerOfAttorney,
										onPowerOfAttorneyChange: setPowerOfAttorney,
									}),
								),
								renderSectionLock('poa'),
							),
							React.createElement('section', {
								className: 'ct-editor-column-card lc-create-section'
									+ getCreateSectionDisabledClass('remark'),
								'aria-label': '合同备注',
								'data-annotation-id': 'lc-create-contract-remark',
								id: 'lc-create-section-remark',
								ref: sectionRefs.remark,
							},
								React.createElement('div', { className: 'ct-panel-head' },
									renderCreateStepTitle(5, '合同备注'),
									React.createElement('span', {
										className: 'lc-form-completion-badge '
											+ ((contractRemark || '').trim()
												? 'lc-form-completion-badge--done'
												: 'lc-form-completion-badge--optional'),
										role: 'status',
										'aria-live': 'polite',
									}, (contractRemark || '').trim() ? '已填写' : '选填'),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel' },
									React.createElement(LeaseContractRemarkSection, {
										contractRemark: contractRemark,
										onContractRemarkChange: setContractRemark,
									}),
								),
								renderSectionLock('remark'),
								renderFlowFormLock('remark'),
							),
							React.createElement('section', {
								className: 'ct-editor-column-card lc-create-section'
									+ getCreateSectionDisabledClass('seal'),
								'aria-label': '用章类型',
								'data-annotation-id': 'lc-create-seal',
								id: 'lc-create-section-seal',
								ref: sectionRefs.seal,
							},
								React.createElement('div', {
									className: 'ct-panel-head lc-create-section__head lc-create-section-seal-head',
									'aria-describedby': 'lc-create-seal-hint',
								},
									React.createElement('div', { className: 'lc-template-step-card__title-row' },
										renderCreateStepTitle(6, '用章类型'),
										React.createElement('span', {
											className: 'lc-form-card__hint lc-create-seal-hint',
											role: 'note',
											id: 'lc-create-seal-hint',
											'data-annotation-id': 'lc-create-seal-hint',
										},
											React.createElement(Info, {
												size: 13,
												className: 'lc-form-card__hint-icon',
												'aria-hidden': true,
											}),
											React.createElement('span', { className: 'lc-form-card__hint-text' },
												'额外勾选公章、法人章会进入非标审批流程',
											),
										),
									),
									React.createElement('span', {
										className: 'lc-form-completion-badge ' + (isSealTypeComplete ? 'lc-form-completion-badge--done' : 'lc-form-completion-badge--pending'),
										role: 'status',
										'aria-live': 'polite',
									}, isSealTypeComplete ? '已选择' : '必选'),
								),
								React.createElement('div', { className: 'ct-editor-panel lc-create-editor-panel' },
									React.createElement('div', {
										className: 'lc-seal-type-chips',
										role: 'group',
										'aria-label': '用章类型',
										'data-annotation-id': 'lc-create-seal-type',
									},
										SEAL_TYPE_OPTIONS.map(function (option) {
											var active = sealTypes.indexOf(option.value) >= 0;
											return React.createElement('button', {
												key: option.value,
												type: 'button',
												className: 'lc-seal-type-chip' + (active ? ' is-active' : ''),
												'aria-pressed': active,
												onClick: function () { toggleSealType(option.value); },
											}, option.label);
										}),
									),
								),
								renderSectionLock('seal'),
								renderFlowFormLock('seal'),
							),
							),
						),
					),
					React.createElement(Col, { xs: 24, lg: 12 },
						React.createElement('section', {
							className: getPreviewPanelCardClass(),
							'aria-label': getPreviewPanelAriaLabel(),
							'data-annotation-id': 'lc-create-preview',
						},
							React.createElement('div', {
								className: 'ct-panel-head lc-create-preview-head',
								'aria-describedby': isTemplateSelected ? getPreviewHintId() : undefined,
							},
								React.createElement('div', { className: 'lc-template-step-card__title-row' },
									React.createElement('div', { className: 'ct-panel-head__title' },
										getPreviewPanelTitle(),
									),
									isTemplateSelected ? renderPreviewReadonlyHint() : null,
								),
								React.createElement('div', { className: 'ct-panel-head__actions' },
									isScopedPreviewFlow ? null : React.createElement(PreviewApprovalHint),
									React.createElement('span', {
										className: 'lc-approval-type-badge'
											+ (isNonStandardApproval ? ' lc-approval-type-badge--nonstd' : ' lc-approval-type-badge--standard'),
										role: 'status',
										'aria-live': 'polite',
									}, '审批：' + contractApprovalType),
								),
							),
							React.createElement('div', { className: 'ct-preview-panel ct-preview-panel--word' },
								isTemplateSelected
									? React.createElement(LeaseContractPreviewPanel, {
										html: previewHtml,
										zoom: workspaceZoom,
										onZoomChange: setWorkspaceZoom,
										editable: isPreviewEditable,
										onContentChange: isPreviewEditable ? handlePreviewContentChange : undefined,
									})
									: React.createElement('div', { className: 'lc-template-preview-empty' }, '请先在左侧选择合同模板，右侧将自动生成对应预览。'),
							),
						),
					),
				),
			),
		),
		React.createElement('div', { className: 'lc-create-footer', 'data-annotation-id': 'lc-create-footer' },
			React.createElement('button', {
				type: 'button',
				className: 'vm-btn vm-btn-ghost',
				'data-vm-icon': 'x',
				onClick: onBack,
			}, '取消'),
			React.createElement('button', {
				type: 'button',
				className: 'vm-btn vm-btn-secondary',
				'data-vm-icon': 'save',
				onClick: function () {
					if (!contractTemplateId) {
						message.warning('请先选择合同模板');
						return;
					}
					message.success('已保存草稿（' + getContractTypeLabel(contractType) + ' · ' + contractApprovalType + '，原型）');
				},
			}, '保存草稿'),
			React.createElement('button', {
				type: 'button',
				className: 'vm-btn vm-btn-primary',
				'data-vm-icon': 'send',
				onClick: function () {
					if (!contractTemplateId) {
						message.warning('请先选择合同模板');
						return;
					}
					if (isAddPoaFlow) {
						if (!isPoaSubmitReady) {
							message.warning('提交审核前须完成授权委托书填写');
							scrollToCreateSection('poa');
							return;
						}
					} else if (isTripartiteFlow) {
						if (!isTripartitePartyComplete({
							customerId: customerId,
							thirdPartyCustomerId: thirdPartyCustomerId,
						})) {
							message.warning('转三方合同须选择丙方客户，且不能与乙方相同');
							scrollToCreateSection('main');
							return;
						}
						if (!isFormSubmitReady) {
							message.warning('请先完成左侧必填项');
							return;
						}
					} else if (!isFormSubmitReady) {
						if (!isPoaSubmitReady) {
							message.warning('提交审核前须完成授权委托书填写');
							scrollToCreateSection('poa');
							return;
						}
						message.warning('请先完成左侧必填项');
						return;
					}
					var submitCustomer = getLeaseCustomerById(customerId);
					if (!isAddPoaFlow && hasBlockingCustomerCredentials(submitCustomer)) {
						message.error(formatCredentialSubmitBlockMessage(summarizeCustomerCredentials(submitCustomer)));
						scrollToCreateSection('main');
						return;
					}
					var fullContractCode = formatLeaseContractCode(contractCode);
					var newVehicleCount = countNewPickupVehicles(leaseOrder);
					if (effectiveFlowMode === 'renew' && newVehicleCount > 0) {
						message.info('续签：新增 ' + newVehicleCount + ' 台车辆将生成提车应收款，已交未还车辆不生成（原型）');
					}
					if (effectiveFlowMode === 'trialToFormal') {
						message.info('转正式：已交未还车辆完成后不再生成交车任务；金额变更将重新记录提车应收款（原型）');
					}
					if (effectiveFlowMode === 'addVehicle') {
						message.info('新增车辆：审批通过后按新增合同规则生成提车应收款（原型）');
					}
					if (effectiveFlowMode === 'addPoa') {
						message.info('添加授权委托书：审批通过后仅对授权委托书发起签署，主合同无需重签（原型）');
						message.success('提交审核成功（' + fullContractCode + '）');
						message.info('提交审核：' + getContractTypeLabel(contractType) + ' · ' + contractApprovalType + '（原型）');
						return;
					}
					createPickupReceivableFromLeaseSubmit({
						contractCode: fullContractCode,
						contractType: getContractTypeLabel(contractType),
						projectName: projectName
							|| ((submitCustomer && submitCustomer.companyName)
								? submitCustomer.companyName + '租赁项目'
								: ''),
						customerName: submitCustomer ? submitCustomer.companyName : '',
						businessDept: businessDept,
						businessPerson: businessOwner,
						feeInfo: feeInfo,
						leaseOrder: leaseOrder,
						paymentMethod: feeInfo && feeInfo.paymentMethod === 'postpay' ? '后付' : '预付',
					});
					if (effectiveFlowMode === 'tripartite') {
						message.info('转三方：审批通过后沿用原合同签署方式，线上 E签宝 / 线下盖章补传（原型）');
					}
					message.success('提交审核成功，已同步创建提车应收款（' + fullContractCode + '）');
					message.info('提交审核：' + getContractTypeLabel(contractType) + ' · ' + contractApprovalType + '（原型）');
				},
			}, '提交审核'),
		),
	);
}
