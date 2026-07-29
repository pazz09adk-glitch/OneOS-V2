import React from 'react';
import { Select, InputNumber, Input, Image, Button, DatePicker, Popover, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { ChevronDown, Plus, Trash2, Info, X, Search, Check, MapPin, ChevronRight } from 'lucide-react';
import {
	getLessorCompanies,
	getLessorCompanyById,
	getLeaseCustomerById,
	getCustomerInvoicePreview,
	getLessorAccountPreview,
	getLessorContactPreview,
	getCustomerContactPreview,
	getCustomerAttachmentPreviewUrl,
	MOCK_LEASE_CUSTOMERS,
	DEFAULT_MILEAGE_STANDARD,
	MILEAGE_PERIOD_OPTIONS,
	DEFAULT_FEE_INFO,
	PAYMENT_PERIOD_OPTIONS,
	PAYMENT_METHOD_OPTIONS,
	HYDROGEN_PAYMENT_METHOD_OPTIONS,
	CONTRACT_CODE_PREFIX,
	LEASE_CUSTOMER_RISK_FILTER_OPTIONS,
	getLeaseCustomerRiskLevelLabel,
	isLeaseCustomerSelectable,
} from '../contract-template-management/contract-template-vars.js';
import {
	summarizeCustomerCredentials,
	CREDENTIAL_EXPIRY_WARN_MONTHS,
} from './lease-customer-credentials.js';
import {
	createEmptyLeaseOrderRow,
	createDefaultLeaseOrderState,
	createEmptyDelegateRow,
	createDefaultPowerOfAttorneyState,
	PROVINCE_CITY_CASCADER_OPTIONS,
	flattenProvinceCityOptions,
	matchProvinceCityOption,
	formatDeliveryRegionDisplay,
	LEASE_VEHICLE_BRAND_MODEL_CATALOG,
	LEASE_EXTRA_SERVICE_TREE,
	flattenExtraServiceOptions,
	matchExtraServiceOption,
	getExtraServiceCategoryByValue,
	getExtraServiceByValue,
	formatExtraServiceUnitPrice,
	LEASE_SERVICE_FEE_TYPE,
	PLATE_ACTUAL_DELIVERY,
	PLATE_MODE_ACTUAL,
	PLATE_MODE_SPECIFIC,
	PLATE_SPECIFIC_LABEL,
	POA_MAX_DELEGATES,
	normalizeBrandModels,
	normalizePlateNos,
	formatBrandModelsDisplay,
	formatBrandModelPair,
	parsePlateSearchText,
	getPlateMode,
	matchPlatesAgainstAssets,
	validatePlatesForLeaseOrder,
	syncRowPlateFields,
	calcInsuredVehicleCount,
	getRowVehicleCountForPricing,
	isDelegateRowStarted,
	isDelegateRowComplete,
	calcRentServiceSubtotal,
	normalizeExtraServices,
	getReadyVehiclePlateOptions,
	calcLeaseOrderKpis,
	formatKpiAmount,
	countNationalInStockByBrandModel,
	getInStockBreakdownByBrandModel,
	getLeaseMinRentForBrandModel,
	isLeaseRentBelowMinimum,
	sumFixedExtraServiceFees,
	calcRowServiceFee,
	formatServiceFeeAmount,
	syncRowPricingFields,
	normalizeLeaseOrderState,
	DELIVERY_REGION_TBD_LABEL,
	DELIVERY_REGION_TBD_DISPLAY,
	LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL,
	LEASE_DELIVERY_DATE_UNCONFIRMED_DISPLAY,
} from './lease-order-vars.js';
import {
	LEASE_BUSINESS_ORG_TREE,
	flattenBusinessOwnerOptions,
	matchBusinessOwnerOption,
	formatBusinessAssignmentLabel,
	getBusinessOwnersByDept,
} from './lease-business-org-data.js';
import { getMatchedPrototypeClauses } from './lease-contract-vehicle-clause.js';
function FieldHint(props) {
	if (!props.children) return null;
	return React.createElement('p', {
		className: 'lc-form-hint',
		'data-annotation-id': props.annotationId || undefined,
	}, props.children);
}

function aggregateOrderBrandModels(rows) {
	var seen = {};
	var result = [];
	(rows || []).forEach(function (row) {
		normalizeBrandModels(row).forEach(function (pair) {
			var key = pair[0] + '\0' + pair[1];
			if (seen[key]) return;
			seen[key] = true;
			result.push(pair);
		});
	});
	return result;
}

function BrandModelsClauseHint(props) {
	var brandModels = normalizeBrandModels({ brandModels: props.brandModels });
	if (!brandModels.length) return null;
	var matched = [];
	brandModels.forEach(function (pair) {
		getMatchedPrototypeClauses(pair[0], pair[1]).forEach(function (clause) {
			if (!matched.some(function (item) { return item.id === clause.id; })) {
				matched.push(clause);
			}
		});
	});
	if (!matched.length) {
		return React.createElement('p', {
			className: 'lc-brand-model-clause-hint lc-brand-model-clause-hint--empty',
			role: 'note',
		},
			React.createElement(Info, { size: 12, className: 'lc-brand-model-clause-hint__icon', 'aria-hidden': true }),
			'当前车型未命中标准合同条件条款，右侧预览中相关段落将不展示。',
		);
	}
	return React.createElement('div', {
		className: 'lc-brand-model-clause-hint lc-brand-model-clause-hint--matched',
		role: 'note',
	},
		React.createElement('p', { className: 'lc-brand-model-clause-hint__lead' },
			React.createElement(Info, { size: 12, className: 'lc-brand-model-clause-hint__icon', 'aria-hidden': true }),
			'已命中条件条款，右侧预览将显示对应正文：',
		),
		matched.map(function (clause) {
			return React.createElement('p', {
				key: clause.id,
				className: 'lc-brand-model-clause-hint__item',
			},
				React.createElement('span', { className: 'lc-brand-model-clause-hint__label' }, clause.label),
				React.createElement('span', { className: 'lc-brand-model-clause-hint__summary' }, clause.summary),
			);
		}),
	);
}

function LeaseCustomerPickerField(props) {
	var value = props.value;
	var onChange = props.onChange;
	var partyLabel = props.partyLabel || '乙方';
	var modalTitle = props.modalTitle || ('选择' + partyLabel + '客户');
	var triggerAriaLabel = props.triggerAriaLabel || (partyLabel + '客户');
	var clearAriaLabel = props.clearAriaLabel || ('清除' + partyLabel + '客户');
	var excludeCustomerId = props.excludeCustomerId || '';
	var selectedCustomer = getLeaseCustomerById(value);
	var modalOpenState = React.useState(false);
	var pendingIdState = React.useState('');
	var keywordState = React.useState('');
	var riskFilterState = React.useState(undefined);
	var modalOpen = modalOpenState[0];
	var setModalOpen = modalOpenState[1];
	var pendingId = pendingIdState[0];
	var setPendingId = pendingIdState[1];
	var keyword = keywordState[0];
	var setKeyword = keywordState[1];
	var riskFilter = riskFilterState[0];
	var setRiskFilter = riskFilterState[1];

	function openModal() {
		setPendingId(value || '');
		setKeyword('');
		setRiskFilter(undefined);
		setModalOpen(true);
	}

	function handleCancel() {
		setModalOpen(false);
	}

	function handleConfirm() {
		var picked = getLeaseCustomerById(pendingId);
		if (!picked || !isLeaseCustomerSelectable(picked)) {
			message.warning('请选择风控等级符合要求的客户');
			return;
		}
		if (excludeCustomerId && picked.id === excludeCustomerId) {
			message.warning(partyLabel + '不能与乙方为同一客户');
			return;
		}
		onChange(picked.id);
		setModalOpen(false);
	}

	function handleRowClick(customer) {
		if (!isLeaseCustomerSelectable(customer)) {
			message.warning('该客户风控等级不符合签约要求，无法选择');
			return;
		}
		setPendingId(customer.id);
	}

	function handleClear(event) {
		event.stopPropagation();
		onChange('');
	}

	var filteredCustomers = MOCK_LEASE_CUSTOMERS.filter(function (customer) {
		if (excludeCustomerId && customer.id === excludeCustomerId) return false;
		if (riskFilter && customer.riskLevel !== riskFilter) return false;
		if (keyword && customer.name.indexOf(keyword.trim()) < 0) return false;
		return true;
	});

	var pendingCustomer = getLeaseCustomerById(pendingId);
	var confirmDisabled = !pendingCustomer || !isLeaseCustomerSelectable(pendingCustomer);

	return React.createElement('div', { className: 'lc-customer-picker' },
		React.createElement('div', {
			className: 'lc-customer-picker__trigger vm-focus-border',
			role: 'button',
			tabIndex: 0,
			onClick: openModal,
			onKeyDown: function (event) {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					openModal();
				}
			},
			'aria-label': triggerAriaLabel,
		},
			React.createElement('span', {
				className: selectedCustomer ? 'lc-customer-picker__value' : 'lc-customer-picker__placeholder',
			}, selectedCustomer ? selectedCustomer.name : '请选择客户'),
			React.createElement('span', { className: 'lc-customer-picker__actions' },
				value ? React.createElement('button', {
					type: 'button',
					className: 'lc-customer-picker__clear',
					onClick: handleClear,
					'aria-label': clearAriaLabel,
				}, '×') : null,
				React.createElement(ChevronDown, { size: 16, 'aria-hidden': true }),
			),
		),
		React.createElement(Modal, {
			title: modalTitle,
			open: modalOpen,
			onCancel: handleCancel,
			onOk: handleConfirm,
			okText: '确认',
			cancelText: '取消',
			okButtonProps: { disabled: confirmDisabled },
			mask: true,
			centered: true,
			width: 720,
			rootClassName: 'lc-customer-picker-modal',
			destroyOnClose: true,
		},
			React.createElement('div', { className: 'lc-customer-picker-modal__filters' },
				React.createElement(Input, {
					className: 'lc-customer-picker-modal__search vm-focus-border',
					placeholder: '搜索客户名称',
					value: keyword,
					allowClear: true,
					onChange: function (e) { setKeyword(e.target.value); },
					'aria-label': '搜索客户名称',
				}),
				React.createElement(Select, {
					className: 'lc-customer-picker-modal__risk-filter vm-focus-border',
					placeholder: '风控等级',
					value: riskFilter,
					allowClear: true,
					onChange: function (v) { setRiskFilter(v); },
					options: LEASE_CUSTOMER_RISK_FILTER_OPTIONS,
					style: { width: '100%' },
					'aria-label': '按风控等级筛选',
				}),
			),
			React.createElement('div', { className: 'lc-customer-picker-modal__table-wrap', role: 'region', 'aria-label': '客户列表' },
				React.createElement('table', { className: 'lc-customer-picker-modal__table' },
					React.createElement('thead', null,
						React.createElement('tr', null,
							React.createElement('th', { scope: 'col' }, '客户名称'),
							React.createElement('th', { scope: 'col', className: 'lc-customer-picker-modal__col-time' }, '上次评级时间'),
							React.createElement('th', { scope: 'col', className: 'lc-customer-picker-modal__col-risk' }, '风控等级'),
						),
					),
					React.createElement('tbody', null,
						filteredCustomers.length
							? filteredCustomers.map(function (customer) {
								var selectable = isLeaseCustomerSelectable(customer);
								var isSelected = pendingId === customer.id;
								return React.createElement('tr', {
									key: customer.id,
									className: 'lc-customer-picker-modal__row'
										+ (isSelected ? ' is-selected' : '')
										+ (selectable ? ' is-selectable' : ' is-disabled'),
									onClick: function () { handleRowClick(customer); },
									'aria-selected': isSelected,
									'aria-disabled': !selectable,
								},
									React.createElement('td', null, customer.name),
									React.createElement('td', { className: 'tabular-nums' }, customer.lastRatingTime || '—'),
									React.createElement('td', null,
										React.createElement('div', { className: 'lc-customer-picker-modal__risk-cell' },
											React.createElement('span', {
												className: 'lc-customer-picker-modal__risk'
													+ (selectable ? ' lc-customer-picker-modal__risk--ok' : ' lc-customer-picker-modal__risk--blocked'),
											}, getLeaseCustomerRiskLevelLabel(customer.riskLevel)),
											!selectable
												? React.createElement('span', { className: 'lc-customer-picker-modal__blocked-hint' }, '不可选')
												: null,
										),
									),
								);
							})
							: React.createElement('tr', null,
								React.createElement('td', { colSpan: 3, className: 'lc-customer-picker-modal__empty' }, '暂无匹配客户'),
							),
					),
				),
			),
			React.createElement('p', { className: 'lc-customer-picker-modal__hint' }, '仅 A/B 级客户可选；C/D 级客户风控等级不符合签约要求。'),
		),
	);
}

export function LeaseOrderServiceContentField(props) {
	var selected = props.value || [];
	var onChange = props.onChange;
	var lockedValues = props.lockedValues || [];
	var variant = props.variant || 'form';
	var triggerLabel = props.triggerLabel || '选择服务项';
	var openState = React.useState(false);
	var categoryState = React.useState('');
	var queryState = React.useState('');
	var open = openState[0];
	var setOpen = openState[1];
	var activeCategory = categoryState[0];
	var setActiveCategory = categoryState[1];
	var query = queryState[0];
	var setQuery = queryState[1];
	var searchText = query.trim();
	var isSearchMode = searchText.length > 0;
	var resolvedCategory = activeCategory || LEASE_EXTRA_SERVICE_TREE[0].category;
	var activeRoot = LEASE_EXTRA_SERVICE_TREE.find(function (node) {
		return node.category === resolvedCategory;
	}) || LEASE_EXTRA_SERVICE_TREE[0];
	var displayOptions = isSearchMode
		? flattenExtraServiceOptions().filter(function (item) {
			return matchExtraServiceOption(item, searchText);
		})
		: [];
	var fixedSelectedTotal = sumFixedExtraServiceFees(selected);
	var removableSelected = selected.filter(function (value) {
		return lockedValues.indexOf(value) < 0;
	});
	var lockedSelectedCount = selected.filter(function (value) {
		return lockedValues.indexOf(value) >= 0;
	}).length;

	function isLockedValue(value) {
		return lockedValues.indexOf(value) >= 0;
	}

	function mergeWithLockedValues(nextSelected) {
		var merged = lockedValues.slice();
		(nextSelected || []).forEach(function (value) {
			if (merged.indexOf(value) < 0) merged.push(value);
		});
		return merged;
	}

	function resolveInitialCategory() {
		if (selected.length > 0) {
			var fromSelected = getExtraServiceCategoryByValue(selected[0]);
			if (fromSelected) return fromSelected;
		}
		return LEASE_EXTRA_SERVICE_TREE[0].category;
	}

	function resolveServiceOptionItem(rawItem) {
		var catalogItem = getExtraServiceByValue(rawItem && rawItem.value);
		if (catalogItem) return catalogItem;
		return Object.assign({}, rawItem, {
			feeType: activeRoot.feeType,
			category: activeRoot.category,
		});
	}

	function handleOpenChange(nextOpen) {
		setOpen(nextOpen);
		if (nextOpen) {
			setActiveCategory(resolveInitialCategory());
		} else {
			setQuery('');
		}
	}

	function toggleValue(value) {
		if (isLockedValue(value)) return;
		var category = getExtraServiceCategoryByValue(value);
		if (category) setActiveCategory(category);
		if (selected.indexOf(value) >= 0) {
			onChange(mergeWithLockedValues(selected.filter(function (item) { return item !== value; })));
			return;
		}
		onChange(mergeWithLockedValues(selected.concat([value])));
	}

	function clearSearch(event) {
		event.preventDefault();
		event.stopPropagation();
		setQuery('');
	}

	function clearAllSelected(event) {
		event.preventDefault();
		event.stopPropagation();
		onChange(mergeWithLockedValues([]));
	}

	function handleCategoryChange(nextCategory) {
		setActiveCategory(nextCategory);
		setQuery('');
	}

	function renderServiceOption(rawItem) {
		var item = resolveServiceOptionItem(rawItem);
		var checked = selected.indexOf(item.value) >= 0;
		var isLocked = isLockedValue(item.value);
		var isFixed = item.feeType === LEASE_SERVICE_FEE_TYPE.FIXED;
		return React.createElement('button', {
			key: item.value,
			type: 'button',
			role: 'option',
			'aria-selected': checked,
			'aria-disabled': isLocked,
			disabled: isLocked,
			className: 'lc-lease-order-service-option'
				+ (checked ? ' is-selected' : '')
				+ (isLocked ? ' is-locked' : '')
				+ (isFixed ? ' is-fixed' : ' is-floating'),
			onClick: function () { toggleValue(item.value); },
		},
			React.createElement('span', {
				className: 'lc-lease-order-service-option__check',
				'aria-hidden': true,
			}, isLocked
				? React.createElement('span', { className: 'lc-lease-order-service-option__lock' }, '已购')
				: (checked ? React.createElement(Check, { size: 14, strokeWidth: 2.5 }) : null)),
			React.createElement('span', { className: 'lc-lease-order-service-option__body' },
				React.createElement('span', { className: 'lc-lease-order-service-option__name' }, item.name),
				isSearchMode && item.subCategory
					? React.createElement('span', { className: 'lc-lease-order-service-option__context' },
						(item.category || '') + (item.subCategory ? ' · ' + item.subCategory : ''),
					)
					: null,
			),
			isFixed
				? React.createElement('span', { className: 'lc-lease-order-service-option__price-pill' },
					formatExtraServiceUnitPrice(item),
				)
				: React.createElement('span', { className: 'lc-lease-order-service-option__meta lc-lease-order-service-option__meta--rule' },
					item.billingRule || '按实际用量计入账单',
				),
		);
	}

	function renderSelectedChip(value) {
		var item = getExtraServiceByValue(value);
		if (!item) return null;
		var isFixed = item.feeType === LEASE_SERVICE_FEE_TYPE.FIXED;
		var isLocked = isLockedValue(value);
		return React.createElement('span', {
			key: value,
			className: 'lc-lease-order-service-popover__selected-tag'
				+ (isFixed ? ' is-fixed' : ' is-floating')
				+ (isLocked ? ' is-locked' : ''),
		},
			React.createElement('span', { className: 'lc-lease-order-service-popover__selected-tag-name' }, item.name),
			React.createElement('span', {
				className: 'lc-lease-order-service-popover__selected-tag-meta',
			}, isLocked
				? '已购'
				: (isFixed ? formatExtraServiceUnitPrice(item) : (item.billingRule || '浮动计费'))),
			isLocked
				? null
				: React.createElement('button', {
					type: 'button',
					'aria-label': '移除' + item.name,
					onMouseDown: function (e) { e.preventDefault(); },
					onClick: function () { toggleValue(value); },
				}, React.createElement(X, { size: 12, 'aria-hidden': true })),
		);
	}

	function renderSelectedSummaryItem(value) {
		var item = getExtraServiceByValue(value);
		if (!item) return null;
		var isFixed = item.feeType === LEASE_SERVICE_FEE_TYPE.FIXED;
		var isLocked = isLockedValue(value);
		return React.createElement('div', {
			key: value,
			className: 'lc-lease-order-service-selected__item'
				+ (isFixed ? ' is-fixed' : ' is-floating')
				+ (isLocked ? ' is-locked' : ''),
		},
			React.createElement('span', { className: 'lc-lease-order-service-selected__badge' },
				isLocked ? '已购' : (isFixed ? '固定' : '浮动'),
			),
			React.createElement('span', { className: 'lc-lease-order-service-selected__name' }, item.name),
			React.createElement('span', { className: 'lc-lease-order-service-selected__meta' },
				isFixed ? formatExtraServiceUnitPrice(item) : (item.billingRule || '浮动计费'),
			),
		);
	}

	var popoverContent = React.createElement('div', {
		className: 'lc-lease-order-service-popover__panel',
	},
		React.createElement('div', { className: 'lc-lease-order-service-popover__head' },
			React.createElement('h4', { className: 'lc-lease-order-service-popover__title' }, '选择服务项'),
			removableSelected.length > 0
				? React.createElement('button', {
					type: 'button',
					className: 'lc-lease-order-service-popover__clear-all',
					onClick: clearAllSelected,
				}, lockedValues.length ? '清空新增' : '清空已选')
				: null,
		),
		React.createElement('label', { className: 'lc-lease-order-service-popover__search' },
			React.createElement(Search, { size: 16, 'aria-hidden': true, className: 'lc-lease-order-service-popover__search-icon' }),
			React.createElement('input', {
				type: 'text',
				className: 'lc-lease-order-service-popover__search-input',
				value: query,
				placeholder: '搜索服务名称、类目或计费规则',
				'aria-label': '筛选服务内容',
				autoComplete: 'off',
				onChange: function (e) { setQuery(e.target.value); },
			}),
			query
				? React.createElement('button', {
					type: 'button',
					className: 'lc-lease-order-service-popover__search-clear',
					onClick: clearSearch,
					'aria-label': '清空搜索',
				}, React.createElement(X, { size: 14, 'aria-hidden': true }))
				: null,
		),
		selected.length > 0
			? React.createElement('div', { className: 'lc-lease-order-service-popover__selected', 'aria-live': 'polite' },
				React.createElement('span', { className: 'lc-lease-order-service-popover__selected-label' },
					'已选 ' + selected.length + ' 项',
				),
				React.createElement('div', { className: 'lc-lease-order-service-popover__selected-tags' },
					selected.map(renderSelectedChip),
				),
			)
			: null,
		!isSearchMode
			? React.createElement('div', { className: 'lc-lease-order-service-popover__tabs', role: 'tablist', 'aria-label': '服务费用类型' },
				LEASE_EXTRA_SERVICE_TREE.map(function (group) {
					var active = resolvedCategory === group.category;
					return React.createElement('button', {
						key: group.category,
						type: 'button',
						role: 'tab',
						'aria-selected': active,
						className: 'lc-lease-order-service-popover__tab' + (active ? ' is-active' : ''),
						onClick: function () { handleCategoryChange(group.category); },
					}, group.category);
				}),
			)
			: null,
		!isSearchMode
			? React.createElement('p', { className: 'lc-lease-order-service-popover__hint' },
				activeRoot.feeType === LEASE_SERVICE_FEE_TYPE.FIXED
					? '固定费用按单价 × 车辆数计入「租金及服务费含税总价」'
					: '浮动费用仅约定计费规则，后续按实际用量计入租赁账单',
			)
			: null,
		React.createElement('div', {
			className: 'lc-lease-order-service-popover__scroll' + (isSearchMode ? ' is-search' : ''),
		},
			isSearchMode
				? React.createElement('div', {
					className: 'lc-lease-order-service-option-list',
					role: 'listbox',
					'aria-label': '服务内容列表',
					'aria-multiselectable': true,
				},
					React.createElement('p', { className: 'lc-lease-order-service-popover__section-label' },
						'搜索结果（' + displayOptions.length + '）',
					),
					displayOptions.length === 0
						? React.createElement('p', { className: 'lc-lease-order-service-popover__empty' }, '未找到匹配的服务项，请换个关键词')
						: displayOptions.map(renderServiceOption),
				)
				: React.createElement('div', { className: 'lc-lease-order-service-subgroups' },
					(activeRoot.subCategories || []).map(function (sub) {
						return React.createElement('section', {
							key: sub.name,
							className: 'lc-lease-order-service-subgroup',
						},
							React.createElement('h4', { className: 'lc-lease-order-service-subgroup__title' }, sub.name),
							React.createElement('div', {
								className: 'lc-lease-order-service-option-list',
								role: 'listbox',
								'aria-label': sub.name + '服务项',
								'aria-multiselectable': true,
							},
								(sub.items || []).map(renderServiceOption),
							),
						);
					}),
				),
		),
		React.createElement('div', { className: 'lc-lease-order-service-popover__footer' },
			React.createElement('span', { className: 'lc-lease-order-service-popover__footer-count' },
				lockedValues.length
					? ('已购 ' + lockedSelectedCount + ' 项 · 新增 ' + removableSelected.length + ' 项')
					: ('已选 ' + selected.length + ' 项'),
			),
			fixedSelectedTotal > 0
				? React.createElement('span', { className: 'lc-lease-order-service-popover__footer-total tabular-nums' },
					'固定费用合计 ' + fixedSelectedTotal.toLocaleString('zh-CN') + ' 元/车/月',
				)
				: null,
		),
	);

	var pickerTrigger = React.createElement(Popover, {
		trigger: 'click',
		placement: 'bottomLeft',
		open: open,
		onOpenChange: handleOpenChange,
		overlayClassName: 'lc-lease-order-service-popover',
		getPopupContainer: function () { return document.body; },
		content: popoverContent,
	},
		React.createElement('button', {
			type: 'button',
			className: 'lc-lease-order-service-picker__btn'
				+ (variant === 'inline' ? ' lc-lease-order-service-picker__btn--inline' : ' lc-lease-order-service-picker__btn--label'),
			'aria-label': triggerLabel,
			'aria-expanded': open,
			'data-annotation-id': variant === 'inline' ? 'lc-extra-fee-service-picker' : 'lc-lease-order-service-content',
		},
			React.createElement(Plus, { size: 14, 'aria-hidden': true }),
			triggerLabel,
		),
	);

	if (variant === 'inline') {
		return React.createElement('div', { className: 'lc-lease-order-service-picker lc-lease-order-service-picker--inline' },
			pickerTrigger,
			removableSelected.length > 0
				? React.createElement('div', {
					className: 'lc-lease-order-service-field lc-lease-order-service-field--inline',
				},
					React.createElement('div', {
						className: 'lc-lease-order-service-selected',
						'aria-live': 'polite',
					}, removableSelected.map(renderSelectedSummaryItem)),
				)
				: null,
		);
	}

	return React.createElement('label', { className: 'lc-form-field lc-lease-order-service-form-field' },
		React.createElement('span', { className: 'lc-form-field__label-row' },
			React.createElement('span', { className: 'lc-form-field__label' }, '服务内容'),
			pickerTrigger,
		),
		selected.length > 0
			? React.createElement('div', {
				className: 'lc-lease-order-service-field',
			},
				React.createElement('div', {
					className: 'lc-lease-order-service-selected',
					'aria-live': 'polite',
				}, selected.map(renderSelectedSummaryItem)),
			)
			: null,
	);
}


function BusinessDeptOwnerPickerField(props) {
	var businessDept = props.businessDept || '';
	var businessOwner = props.businessOwner || '';
	var onChange = props.onChange;
	var openState = React.useState(false);
	var deptState = React.useState('');
	var queryState = React.useState('');
	var open = openState[0];
	var setOpen = openState[1];
	var activeDept = deptState[0];
	var setActiveDept = deptState[1];
	var query = queryState[0];
	var setQuery = queryState[1];
	var searchText = query.trim();
	var isSearchMode = searchText.length > 0;
	var resolvedDept = activeDept || businessDept || LEASE_BUSINESS_ORG_TREE[0].dept;
	var displayOptions = isSearchMode
		? flattenBusinessOwnerOptions().filter(function (item) {
			return matchBusinessOwnerOption(item, searchText);
		})
		: getBusinessOwnersByDept(resolvedDept).map(function (owner) {
			return { dept: resolvedDept, owner: owner };
		});

	function resolveInitialDept() {
		if (businessDept) return businessDept;
		return LEASE_BUSINESS_ORG_TREE[0].dept;
	}

	function handleOpenChange(nextOpen) {
		setOpen(nextOpen);
		if (nextOpen) {
			setActiveDept(resolveInitialDept());
		} else {
			setQuery('');
		}
	}

	function selectOwner(dept, owner) {
		onChange(dept, owner);
		setActiveDept(dept);
		setOpen(false);
		setQuery('');
	}

	function clearSelection(event) {
		event.preventDefault();
		event.stopPropagation();
		onChange('', '');
		setQuery('');
	}

	function clearSearch(event) {
		event.preventDefault();
		event.stopPropagation();
		setQuery('');
	}

	var summary = formatBusinessAssignmentLabel(businessDept, businessOwner);

	var popoverContent = React.createElement('div', {
		className: 'vm-operate-city-edit-body vm-operate-city-picker-panel lc-lease-order-service-popover__panel',
	},
		React.createElement('label', { className: 'vm-operate-city-edit-search' },
			React.createElement(Search, { size: 16, 'aria-hidden': true, className: 'vm-operate-city-edit-search-icon' }),
			React.createElement('input', {
				type: 'text',
				className: 'vm-operate-city-edit-search-input',
				value: query,
				placeholder: '输入业务员姓名快速筛选',
				'aria-label': '搜索业务员姓名',
				autoComplete: 'off',
				onChange: function (e) { setQuery(e.target.value); },
			}),
			query
				? React.createElement('button', {
					type: 'button',
					className: 'vm-operate-city-edit-search-clear',
					onClick: clearSearch,
					'aria-label': '清空搜索',
				}, React.createElement(X, { size: 14, 'aria-hidden': true }))
				: null,
		),
		summary
			? React.createElement('div', { className: 'vm-operate-city-edit-selected', 'aria-live': 'polite' },
				React.createElement('span', { className: 'vm-operate-city-edit-selected-label' }, '已选'),
				React.createElement('div', { className: 'lc-lease-order-service-popover__selected-tags' },
					React.createElement('span', { className: 'lc-lease-order-service-popover__selected-tag' },
						summary,
						React.createElement('button', {
							type: 'button',
							'aria-label': '清除业务部门及业务人员',
							onMouseDown: function (e) { e.preventDefault(); },
							onClick: clearSelection,
						}, React.createElement(X, { size: 12, 'aria-hidden': true })),
					),
				),
			)
			: null,
		React.createElement('div', {
			className: 'vm-operate-city-edit-main' + (isSearchMode ? ' is-search' : ''),
		},
			!isSearchMode
				? React.createElement('div', {
					className: 'vm-operate-city-edit-step vm-operate-city-edit-step--province',
				},
					React.createElement('span', { className: 'vm-operate-city-step-label' }, '业务部门'),
					React.createElement('div', {
						className: 'vm-operate-city-edit-chips',
						role: 'tablist',
						'aria-label': '业务部门',
					},
						LEASE_BUSINESS_ORG_TREE.map(function (group) {
							var active = resolvedDept === group.dept;
							return React.createElement('button', {
								key: group.dept,
								type: 'button',
								role: 'tab',
								'aria-selected': active,
								className: 'vm-operate-city-chip' + (active ? ' active' : ''),
								onClick: function () {
									setActiveDept(group.dept);
									setQuery('');
								},
							}, group.dept);
						}),
					),
				)
				: null,
			React.createElement('div', {
				className: 'vm-operate-city-edit-step vm-operate-city-edit-step--city',
			},
				React.createElement('span', { className: 'vm-operate-city-step-label' },
					isSearchMode ? ('搜索结果（' + displayOptions.length + '）') : '业务人员',
				),
				React.createElement('div', {
					className: 'vm-operate-city-edit-chips',
					role: 'listbox',
					'aria-label': '业务人员列表',
				},
					displayOptions.length === 0
						? React.createElement('p', { className: 'vm-operate-city-empty' },
							isSearchMode ? '未找到匹配的业务人员，请换个关键词' : '该部门暂无可选业务人员',
						)
						: displayOptions.map(function (item) {
							var checked = businessDept === item.dept && businessOwner === item.owner;
							return React.createElement('button', {
								key: item.dept + '::' + item.owner,
								type: 'button',
								role: 'option',
								'aria-selected': checked,
								className: 'vm-operate-city-chip' + (checked ? ' active' : ''),
								onClick: function () { selectOwner(item.dept, item.owner); },
							}, item.owner);
						}),
				),
			),
		),
	);

	return React.createElement('div', { className: 'lc-business-dept-picker' },
		React.createElement(Popover, {
			trigger: 'click',
			placement: 'bottomLeft',
			open: open,
			onOpenChange: handleOpenChange,
			overlayClassName: 'lc-lease-order-service-popover lc-business-dept-picker-popover',
			getPopupContainer: function () { return document.body; },
			content: popoverContent,
		},
			React.createElement('button', {
				type: 'button',
				className: 'vm-filter-picker-control lc-business-dept-picker__trigger' + (open ? ' open' : ''),
				'aria-label': '业务部门及业务人员',
				'aria-expanded': open,
				'data-annotation-id': 'lc-signing-business-assignment',
			},
				summary
					? React.createElement('span', { className: 'vm-filter-picker-input lc-business-dept-picker__summary' }, summary)
					: React.createElement('span', {
						className: 'vm-filter-picker-input lc-business-dept-picker__summary is-placeholder',
					}, '请选择业务部门及业务人员'),
				React.createElement(ChevronDown, { size: 16, className: 'vm-filter-picker-chevron', 'aria-hidden': true }),
			),
		),
	);
}

function brandModelPairKey(pair) {
	return pair[0] + '::' + pair[1];
}

function LeaseOrderBrandModelField(props) {
	var single = props.single === true;
	var selected = normalizeBrandModels({ brandModels: props.value });
	if (single && selected.length > 1) {
		selected = [selected[0]];
	}
	var onChange = props.onChange;
	var openState = React.useState(false);
	var brandState = React.useState('');
	var queryState = React.useState('');
	var stockPopoverKeyState = React.useState(null);
	var open = openState[0];
	var setOpen = openState[1];
	var activeBrand = brandState[0];
	var setActiveBrand = brandState[1];
	var query = queryState[0];
	var setQuery = queryState[1];
	var stockPopoverKey = stockPopoverKeyState[0];
	var setStockPopoverKey = stockPopoverKeyState[1];
	var labels = formatBrandModelsDisplay(selected);
	var summary = labels.length <= 2
		? labels.join('、')
		: (labels.length > 0 ? '已选 ' + labels.length + ' 个型号' : '');
	var searchText = query.trim();
	var isSearchMode = searchText.length > 0;
	var resolvedBrand = activeBrand || LEASE_VEHICLE_BRAND_MODEL_CATALOG[0].brand;
	var displayModels = isSearchMode
		? LEASE_VEHICLE_BRAND_MODEL_CATALOG.reduce(function (list, item) {
			return list.concat(item.models.map(function (model) {
				return { brand: item.brand, model: model };
			}));
		}, []).filter(function (item) {
			var label = formatBrandModelPair(item.brand, item.model);
			return label.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
				|| item.brand.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
		})
		: (function () {
			var group = LEASE_VEHICLE_BRAND_MODEL_CATALOG.find(function (node) {
				return node.brand === resolvedBrand;
			});
			if (!group) return [];
			return group.models.map(function (model) {
				return { brand: group.brand, model: model };
			});
		})();

	function handleOpenChange(nextOpen) {
		setOpen(nextOpen);
		if (nextOpen) {
			setActiveBrand(selected.length > 0 ? selected[0][0] : LEASE_VEHICLE_BRAND_MODEL_CATALOG[0].brand);
		} else {
			setQuery('');
			setStockPopoverKey(null);
		}
	}

	function renderStockBreakdownContent(brand, model) {
		var breakdown = getInStockBreakdownByBrandModel(brand, model);
		if (!breakdown.regions.length) {
			return React.createElement('div', { className: 'lc-brand-model-stock-popover' },
				React.createElement('p', { className: 'lc-brand-model-stock-popover__empty' }, '暂无在库车辆'),
			);
		}
		return React.createElement('div', { className: 'lc-brand-model-stock-popover' },
			React.createElement('p', { className: 'lc-brand-model-stock-popover__title' },
				'停车场省市在库 · 共 ',
				React.createElement('span', { className: 'tabular-nums' }, breakdown.total),
				' 台',
			),
			React.createElement('div', { className: 'lc-brand-model-stock-popover__list', role: 'list' },
				breakdown.regions.map(function (region) {
					return React.createElement('section', {
						key: region.province,
						className: 'lc-brand-model-stock-popover__region',
						role: 'listitem',
					},
						React.createElement('header', { className: 'lc-brand-model-stock-popover__region-head' },
							React.createElement('span', { className: 'lc-brand-model-stock-popover__region-name' }, region.province),
							React.createElement('span', { className: 'lc-brand-model-stock-popover__region-total tabular-nums' }, region.total + ' 台'),
						),
						React.createElement('ul', { className: 'lc-brand-model-stock-popover__cities' },
							region.cities.map(function (cityItem) {
								return React.createElement('li', {
									key: region.province + '::' + cityItem.city,
									className: 'lc-brand-model-stock-popover__city',
								},
									React.createElement('span', { className: 'lc-brand-model-stock-popover__city-name' }, cityItem.city),
									React.createElement('span', { className: 'lc-brand-model-stock-popover__city-count tabular-nums' }, cityItem.count + ' 台'),
								);
							}),
						),
					);
				}),
			),
		);
	}

	function togglePair(brand, model) {
		var key = brandModelPairKey([brand, model]);
		setStockPopoverKey(null);
		if (single) {
			var isSame = selected.length === 1 && brandModelPairKey(selected[0]) === key;
			onChange(isSame ? [] : [[brand, model]]);
			setOpen(false);
			setQuery('');
			return;
		}
		var exists = selected.some(function (pair) {
			return brandModelPairKey(pair) === key;
		});
		if (exists) {
			onChange(selected.filter(function (pair) {
				return brandModelPairKey(pair) !== key;
			}));
			return;
		}
		onChange(selected.concat([[brand, model]]));
		setActiveBrand(brand);
	}

	function clearAll(event) {
		event.preventDefault();
		event.stopPropagation();
		onChange([]);
		setQuery('');
	}

	function renderModelOptionChip(item) {
		var pairKey = brandModelPairKey([item.brand, item.model]);
		var checked = selected.some(function (pair) {
			return pair[0] === item.brand && pair[1] === item.model;
		});
		var stockCount = countNationalInStockByBrandModel(item.brand, item.model);
		var modelLabel = isSearchMode
			? formatBrandModelPair(item.brand, item.model)
			: item.model;
		var stockOpen = stockPopoverKey === pairKey;
		return React.createElement('div', {
			key: pairKey,
			className: 'lc-brand-model-option-row',
			role: 'presentation',
		},
			React.createElement('button', {
				type: 'button',
				role: 'option',
				'aria-selected': checked,
				className: 'vm-operate-city-chip lc-brand-model-option-chip' + (checked ? ' active' : ''),
				onClick: function () { togglePair(item.brand, item.model); },
			},
				React.createElement('span', { className: 'lc-brand-model-option-chip__model' }, modelLabel),
			),
			stockCount > 0
				? React.createElement('span', { className: 'lc-brand-model-option-stock-meta' },
					'全国在库 ',
					React.createElement(Popover, {
						trigger: 'click',
						open: stockOpen,
						onOpenChange: function (nextOpen) {
							setStockPopoverKey(nextOpen ? pairKey : null);
						},
						placement: 'rightTop',
						overlayClassName: 'lc-brand-model-stock-popover-overlay',
						getPopupContainer: function () { return document.body; },
						content: renderStockBreakdownContent(item.brand, item.model),
					},
						React.createElement('button', {
							type: 'button',
							className: 'lc-brand-model-option-stock-count tabular-nums',
							'aria-label': '查看' + modelLabel + '各省市在库数量',
							onClick: function (event) {
								event.preventDefault();
								event.stopPropagation();
							},
						}, String(stockCount)),
					),
					' 台',
				)
				: React.createElement('span', { className: 'lc-brand-model-option-stock-meta is-empty' }, '全国在库 0 台'),
		);
	}

	var popoverContent = React.createElement('div', {
		className: 'vm-operate-city-edit-body vm-operate-city-picker-panel lc-lease-order-service-popover__panel',
	},
		React.createElement('label', { className: 'vm-operate-city-edit-search' },
			React.createElement(Search, { size: 16, 'aria-hidden': true, className: 'vm-operate-city-edit-search-icon' }),
			React.createElement('input', {
				type: 'text',
				className: 'vm-operate-city-edit-search-input',
				value: query,
				placeholder: '输入品牌或型号快速筛选',
				'aria-label': '筛选品牌型号',
				autoComplete: 'off',
				onChange: function (e) { setQuery(e.target.value); },
			}),
			query ? React.createElement('button', {
				type: 'button',
				className: 'vm-operate-city-edit-search-clear',
				onClick: function (e) { e.preventDefault(); e.stopPropagation(); setQuery(''); },
				'aria-label': '清空搜索',
			}, React.createElement(X, { size: 14, 'aria-hidden': true })) : null,
		),
		selected.length > 0 ? React.createElement('div', { className: 'vm-operate-city-edit-selected', 'aria-live': 'polite' },
			React.createElement('span', { className: 'vm-operate-city-edit-selected-label' }, '已选'),
			React.createElement('div', { className: 'lc-lease-order-brand-model-picker__selected-list' },
				labels.map(function (label, index) {
					var pair = selected[index];
					return React.createElement('div', {
						key: brandModelPairKey(pair),
						className: 'lc-lease-order-brand-model-picker__selected-line',
					},
						label,
						React.createElement('button', {
							type: 'button',
							'aria-label': '移除' + label,
							onClick: function () { togglePair(pair[0], pair[1]); },
						}, React.createElement(X, { size: 12, 'aria-hidden': true })),
					);
				}),
			),
		) : null,
		React.createElement('div', { className: 'vm-operate-city-edit-main' + (isSearchMode ? ' is-search' : '') },
			!isSearchMode ? React.createElement('div', { className: 'vm-operate-city-edit-step vm-operate-city-edit-step--province' },
				React.createElement('span', { className: 'vm-operate-city-step-label' }, '品牌'),
				React.createElement('div', { className: 'vm-operate-city-edit-chips', role: 'tablist', 'aria-label': '品牌列表' },
					LEASE_VEHICLE_BRAND_MODEL_CATALOG.map(function (item) {
						var active = resolvedBrand === item.brand;
						return React.createElement('button', {
							key: item.brand,
							type: 'button',
							role: 'tab',
							'aria-selected': active,
							className: 'vm-operate-city-chip' + (active ? ' active' : ''),
							onClick: function () { setActiveBrand(item.brand); setQuery(''); },
						}, item.brand);
					}),
				),
			) : null,
			React.createElement('div', { className: 'vm-operate-city-edit-step vm-operate-city-edit-step--city' },
				React.createElement('span', { className: 'vm-operate-city-step-label' },
					isSearchMode ? ('搜索结果（' + displayModels.length + '）') : '型号',
				),
				React.createElement('div', {
					className: 'vm-operate-city-edit-chips lc-brand-model-option-chips',
					role: 'listbox',
					'aria-label': '型号列表',
					'aria-multiselectable': single ? false : true,
					'data-annotation-id': 'lc-lease-order-brand-model-stock',
				},
					displayModels.length === 0
						? React.createElement('p', { className: 'vm-operate-city-empty' }, '暂无匹配型号')
						: displayModels.map(renderModelOptionChip),
				),
			),
		),
	);

	return React.createElement('div', { className: 'vm-operate-city-field lc-lease-order-brand-model-picker' },
		React.createElement(Popover, {
			trigger: 'click',
			placement: 'bottomLeft',
			open: open,
			onOpenChange: handleOpenChange,
			overlayClassName: 'lc-lease-order-service-popover',
			getPopupContainer: function () { return document.body; },
			content: popoverContent,
		},
			React.createElement('div', {
				className: 'vm-filter-picker-control lc-lease-order-brand-model-picker__trigger' + (open ? ' open' : ''),
				role: 'combobox',
				'aria-label': '品牌车型',
				'aria-expanded': open,
				tabIndex: 0,
				'data-annotation-id': 'lc-lease-order-brand-model',
			},
				selected.length > 0
					? React.createElement('div', { className: 'lc-lease-order-brand-model-picker__summary-list' },
						labels.map(function (label) {
							return React.createElement('span', {
								key: label,
								className: 'lc-lease-order-brand-model-picker__summary-line',
							}, label);
						}),
					)
					: React.createElement('span', {
						className: 'vm-filter-picker-input lc-lease-order-brand-model-picker__summary is-placeholder',
					}, '请选择品牌 / 型号'),
				selected.length > 0 ? React.createElement('button', {
					type: 'button',
					className: 'vm-filter-picker-clear',
					onClick: clearAll,
					'aria-label': '清空品牌车型',
					tabIndex: -1,
				}, React.createElement(X, { size: 14, 'aria-hidden': true })) : null,
				React.createElement(ChevronDown, { size: 14, className: 'vm-filter-picker-chevron', 'aria-hidden': true }),
			),
		),
	);
}

function LeaseOrderPlateField(props) {
	var row = props.row || {};
	var brandModels = props.brandModels || [];
	var onChange = props.onChange;
	var plateMode = getPlateMode(row);
	var matchedPlates = plateMode === PLATE_MODE_SPECIFIC
		? matchPlatesAgainstAssets(normalizePlateNos(row), brandModels)
		: [];
	var openState = React.useState(false);
	var bulkState = React.useState('');
	var validationState = React.useState(null);
	var open = openState[0];
	var setOpen = openState[1];
	var bulkText = bulkState[0];
	var setBulkText = bulkState[1];
	var validationResults = validationState[0];
	var setValidationResults = validationState[1];
	var assetCount = getReadyVehiclePlateOptions(brandModels).length;
	var hasBrandModel = brandModels.length > 0;

	React.useEffect(function () {
		if (plateMode !== PLATE_MODE_SPECIFIC) {
			setBulkText('');
			setValidationResults(null);
			return;
		}
		setBulkText(matchedPlates.join('\n'));
	}, [plateMode, matchedPlates.join('\0'), brandModels.map(function (pair) { return pair.join('\0'); }).join('|')]);

	function emitPlatePatch(patch) {
		onChange(syncRowPlateFields(Object.assign({}, row, patch)));
	}

	function handleOpenChange(nextOpen) {
		setOpen(nextOpen);
		if (!nextOpen && plateMode === PLATE_MODE_SPECIFIC) {
			setBulkText(matchedPlates.join('\n'));
			setValidationResults(null);
		}
	}

	function handleModeChange(mode) {
		if (mode === PLATE_MODE_SPECIFIC) {
			if (plateMode === PLATE_MODE_SPECIFIC) {
				setOpen(true);
				return;
			}
			emitPlatePatch({
				plateMode: PLATE_MODE_SPECIFIC,
				plateNos: [],
			});
			setBulkText('');
			setValidationResults(null);
			setOpen(true);
			return;
		}
		emitPlatePatch({
			plateMode: PLATE_MODE_ACTUAL,
			plateNos: [PLATE_ACTUAL_DELIVERY],
		});
		setBulkText('');
		setValidationResults(null);
		setOpen(false);
	}

	function handleBulkDraft(text) {
		setBulkText(text);
		setValidationResults(null);
	}

	function handleConfirmPlates() {
		if (!hasBrandModel) {
			message.warning('请先选择品牌 / 型号');
			return;
		}
		var parsed = parsePlateSearchText(bulkText);
		if (!parsed.length) {
			message.warning('请输入至少一条车牌号');
			return;
		}
		var validation = validatePlatesForLeaseOrder(parsed, brandModels);
		setValidationResults(validation.results);
		emitPlatePatch({
			plateMode: PLATE_MODE_SPECIFIC,
			plateNos: validation.matched,
		});
		setBulkText(validation.matched.join('\n'));
		var passCount = validation.matched.length;
		var failCount = validation.results.length - passCount;
		if (passCount > 0 && failCount === 0) {
			message.success('已确认 ' + passCount + ' 辆已备车');
		} else if (passCount > 0) {
			message.warning('已确认 ' + passCount + ' 辆，' + failCount + ' 条未通过校验');
		} else {
			message.error('未通过校验，请检查车牌、品牌 / 型号或车辆状态');
		}
	}

	function removePlate(plate) {
		var next = matchedPlates.filter(function (item) { return item !== plate; });
		setBulkText(next.join('\n'));
		setValidationResults(null);
		emitPlatePatch({
			plateMode: PLATE_MODE_SPECIFIC,
			plateNos: next,
		});
	}

	function clearSpecific() {
		emitPlatePatch({
			plateMode: PLATE_MODE_SPECIFIC,
			plateNos: [],
		});
		setBulkText('');
		setValidationResults(null);
	}

	var passedValidationResults = (validationResults || []).filter(function (item) { return item.ok; });

	var popoverContent = React.createElement('div', {
		className: 'vm-operate-city-edit-body lc-lease-order-plate-popover__panel',
	},
		React.createElement('div', { className: 'lc-lease-order-plate-popover__head' },
			React.createElement('span', { className: 'lc-lease-order-plate-popover__title' }, PLATE_SPECIFIC_LABEL),
			matchedPlates.length
				? React.createElement('button', {
					type: 'button',
					className: 'lc-lease-order-plate-popover__clear',
					onClick: clearSpecific,
				}, '清空')
				: null,
		),
		React.createElement('p', { className: 'lc-lease-order-plate-popover__hint', role: 'note' },
			'请输入已备车的车牌号，每行一条',
		),
		!hasBrandModel
			? React.createElement('p', { className: 'lc-lease-order-plate-popover__hint lc-lease-order-plate-popover__hint--warn', role: 'note' },
				'请先选择品牌 / 型号，再录入车牌',
			)
			: null,
		React.createElement('div', { className: 'lc-lease-order-plate-popover__bulk' },
			React.createElement('textarea', {
				className: 'lc-lease-order-plate-popover__bulk-input vm-focus-border',
				value: bulkText,
				rows: 4,
				disabled: !hasBrandModel,
				placeholder: '粤AGR8556\n粤BHY6688',
				'aria-label': '批量输入车牌号',
				onChange: function (e) { handleBulkDraft(e.target.value); },
			}),
		),
		hasBrandModel && assetCount === 0
			? React.createElement('p', { className: 'lc-lease-order-plate-popover__hint lc-lease-order-plate-popover__hint--warn', role: 'note' },
				'当前品牌 / 型号暂无已备车资产',
			)
			: null,
		validationResults
			? React.createElement('div', {
				className: 'lc-lease-order-plate-popover__results',
				role: 'status',
				'aria-live': 'polite',
			},
				React.createElement('div', { className: 'lc-lease-order-plate-popover__results-head' },
					React.createElement('span', { className: 'lc-lease-order-plate-popover__results-title' }, '校验结果'),
					React.createElement('span', {
						className: 'lc-lease-order-plate-popover__results-summary tabular-nums',
					}, '通过 ' + passedValidationResults.length + ' / 共 ' + validationResults.length),
				),
				React.createElement('ul', { className: 'lc-lease-order-plate-popover__result-list' },
					validationResults.map(function (item) {
						return React.createElement('li', {
							key: item.plate + '-' + item.reason,
							className: 'lc-lease-order-plate-popover__result-item'
								+ (item.ok ? ' is-ok' : ' is-fail'),
						},
							React.createElement('span', { className: 'lc-lease-order-plate-popover__result-plate' }, item.plate),
							React.createElement('span', { className: 'lc-lease-order-plate-popover__result-message' }, item.message),
						);
					}),
				),
			)
			: null,
		matchedPlates.length > 0
			? React.createElement('div', { className: 'lc-lease-order-plate-popover__matched' },
				React.createElement('div', { className: 'lc-lease-order-plate-popover__matched-head' },
					React.createElement('span', { className: 'lc-lease-order-plate-popover__matched-title' }, '已选车辆'),
					React.createElement('span', {
						className: 'lc-lease-order-plate-popover__matched-count tabular-nums',
					}, matchedPlates.length + ' 辆'),
				),
				React.createElement('div', {
					className: 'lc-lease-order-plate-popover__chip-list',
					role: 'list',
					'aria-label': '已选车辆列表',
				},
					matchedPlates.map(function (plate) {
						return React.createElement('span', {
							key: plate,
							className: 'lc-lease-order-plate-popover__chip',
							role: 'listitem',
						},
							React.createElement('span', { className: 'lc-lease-order-plate-popover__chip-text' }, plate),
							React.createElement('button', {
								type: 'button',
								className: 'lc-lease-order-plate-popover__chip-remove',
								onClick: function () { removePlate(plate); },
								'aria-label': '移除车牌 ' + plate,
							}, React.createElement(X, { size: 12, 'aria-hidden': true })),
						);
					}),
				),
			)
			: null,
		React.createElement('div', { className: 'lc-lease-order-plate-popover__actions' },
			React.createElement(Button, {
				size: 'small',
				onClick: function () { handleOpenChange(false); },
			}, '取消'),
			React.createElement(Button, {
				type: 'primary',
				size: 'small',
				disabled: !hasBrandModel || !bulkText.trim(),
				onClick: handleConfirmPlates,
			}, '确认'),
		),
	);

	var specificOptionLabel = plateMode === PLATE_MODE_SPECIFIC && matchedPlates.length
		? ('已选 ' + matchedPlates.length + ' 辆')
		: PLATE_SPECIFIC_LABEL;

	var toggleSurface = React.createElement('div', { className: 'lc-lease-order-plate-control__surface' },
		React.createElement(LeaseOrderModeToggle, {
			layout: 'segmented',
			'aria-label': '车牌号模式',
			value: plateMode,
			onChange: handleModeChange,
			options: [
				{ value: PLATE_MODE_ACTUAL, label: PLATE_ACTUAL_DELIVERY },
				{ value: PLATE_MODE_SPECIFIC, label: specificOptionLabel },
			],
		}),
	);

	return React.createElement('div', {
		className: 'lc-lease-order-plate-control',
		'data-annotation-id': 'lc-lease-order-plate-no',
	},
		plateMode === PLATE_MODE_SPECIFIC
			? React.createElement(Popover, {
				trigger: [],
				placement: 'bottom',
				open: open,
				onOpenChange: handleOpenChange,
				overlayClassName: 'lc-lease-order-plate-popover',
				getPopupContainer: function () { return document.body; },
				content: popoverContent,
			}, toggleSurface)
			: toggleSurface,
	);
}

function LeaseOrderAmountField(props) {
	return React.createElement('div', { className: 'lc-form-inline-sentence lc-lease-order-table__amount' },
		React.createElement('div', { className: 'lc-lease-order-table__amount-field' }, props.children),
		props.suffix !== false
			? React.createElement('span', { className: 'lc-form-inline-sentence__text' }, props.suffixText || '元')
			: null,
	);
}

var LeaseOrderRangePicker = DatePicker.RangePicker;

function LeaseOrderModeToggle(props) {
	var layout = props.layout || 'default';
	var optionCount = (props.options || []).length;
	return React.createElement('div', {
		className: 'lc-lease-order-mode-toggle'
			+ (layout === 'segmented' ? ' lc-lease-order-mode-toggle--segmented' : ''),
		role: 'radiogroup',
		'aria-label': props['aria-label'] || '模式切换',
		style: layout === 'segmented' ? { '--mode-count': optionCount } : undefined,
	},
		(props.options || []).map(function (option) {
			var active = props.value === option.value;
			return React.createElement('button', {
				key: option.value,
				type: 'button',
				role: 'radio',
				'aria-checked': active,
				className: 'lc-lease-order-mode-toggle__btn' + (active ? ' active' : ''),
				onClick: function () { props.onChange(option.value); },
			}, option.label);
		}),
	);
}

function LeaseOrderDeliveryRegionField(props) {
	var value = props.value || [];
	var onChange = props.onChange;
	var openState = React.useState(false);
	var provinceState = React.useState('');
	var queryState = React.useState('');
	var open = openState[0];
	var setOpen = openState[1];
	var activeProvince = provinceState[0];
	var setActiveProvince = provinceState[1];
	var query = queryState[0];
	var setQuery = queryState[1];
	var searchText = query.trim();
	var isSearchMode = searchText.length > 0;
	var resolvedProvince = activeProvince || value[0] || PROVINCE_CITY_CASCADER_OPTIONS[0].value;
	var activeProvinceNode = PROVINCE_CITY_CASCADER_OPTIONS.find(function (node) {
		return node.value === resolvedProvince;
	}) || PROVINCE_CITY_CASCADER_OPTIONS[0];
	var displayOptions = isSearchMode
		? flattenProvinceCityOptions().filter(function (item) {
			return matchProvinceCityOption(item, searchText);
		})
		: [];
	var summary = formatDeliveryRegionDisplay(value);

	function handleOpenChange(nextOpen) {
		setOpen(nextOpen);
		if (nextOpen) {
			setActiveProvince(value[0] || PROVINCE_CITY_CASCADER_OPTIONS[0].value);
		} else {
			setQuery('');
		}
	}

	function selectRegion(province, city) {
		onChange([province, city]);
		setActiveProvince(province);
		setOpen(false);
		setQuery('');
	}

	function clearSelection(event) {
		event.preventDefault();
		event.stopPropagation();
		onChange([]);
		setQuery('');
	}

	function clearSearch(event) {
		event.preventDefault();
		event.stopPropagation();
		setQuery('');
	}

	var popoverContent = React.createElement('div', {
		className: 'vm-operate-city-edit-body vm-operate-city-picker-panel lc-lease-order-delivery-region-popover__panel',
	},
		React.createElement('label', { className: 'vm-operate-city-edit-search lc-lease-order-delivery-region-popover__search' },
			React.createElement(Search, { size: 16, 'aria-hidden': true, className: 'vm-operate-city-edit-search-icon' }),
			React.createElement('input', {
				type: 'text',
				className: 'vm-operate-city-edit-search-input',
				value: query,
				placeholder: '搜索省份或城市，如「浙江」「嘉兴」',
				'aria-label': '搜索交付地点',
				autoComplete: 'off',
				onChange: function (e) { setQuery(e.target.value); },
			}),
			query
				? React.createElement('button', {
					type: 'button',
					className: 'vm-operate-city-edit-search-clear',
					onClick: clearSearch,
					'aria-label': '清空搜索',
				}, React.createElement(X, { size: 14, 'aria-hidden': true }))
				: null,
		),
		value.length >= 2
			? React.createElement('div', { className: 'vm-operate-city-edit-selected lc-lease-order-delivery-region-popover__selected', 'aria-live': 'polite' },
				React.createElement('span', { className: 'vm-operate-city-edit-selected-label' }, '当前'),
				React.createElement('span', { className: 'lc-lease-order-delivery-region-popover__selected-value' }, summary),
			)
			: null,
		React.createElement('div', {
			className: 'vm-operate-city-edit-main lc-lease-order-delivery-region-popover__main' + (isSearchMode ? ' is-search' : ''),
		},
			!isSearchMode
				? React.createElement('div', { className: 'vm-operate-city-edit-step vm-operate-city-edit-step--province' },
					React.createElement('span', { className: 'vm-operate-city-step-label' }, '省份'),
					React.createElement('div', {
						className: 'vm-operate-city-edit-chips',
						role: 'tablist',
						'aria-label': '省份列表',
					},
						PROVINCE_CITY_CASCADER_OPTIONS.map(function (prov) {
							var active = resolvedProvince === prov.value;
							var selectedProvince = value[0] === prov.value;
							return React.createElement('button', {
								key: prov.value,
								type: 'button',
								role: 'tab',
								'aria-selected': active,
								className: 'vm-operate-city-chip lc-lease-order-delivery-region-popover__province-chip'
									+ (active ? ' active' : '')
									+ (selectedProvince ? ' is-current' : ''),
								onClick: function () {
									setActiveProvince(prov.value);
									setQuery('');
								},
							},
								React.createElement('span', { className: 'lc-lease-order-delivery-region-popover__chip-label' }, prov.label),
								active ? React.createElement(ChevronRight, { size: 14, 'aria-hidden': true, className: 'lc-lease-order-delivery-region-popover__chip-arrow' }) : null,
							);
						}),
					),
				)
				: null,
			React.createElement('div', { className: 'vm-operate-city-edit-step vm-operate-city-edit-step--city' },
				React.createElement('span', { className: 'vm-operate-city-step-label' },
					isSearchMode ? ('搜索结果（' + displayOptions.length + '）') : '城市',
				),
				React.createElement('div', {
					className: 'vm-operate-city-edit-chips lc-lease-order-delivery-region-popover__city-chips',
					role: 'listbox',
					'aria-label': '城市列表',
				},
					isSearchMode
						? (displayOptions.length === 0
							? React.createElement('p', { className: 'vm-operate-city-empty' }, '未找到匹配的省市，请换个关键词')
							: displayOptions.map(function (item) {
								var checked = value[0] === item.province && value[1] === item.city;
								return React.createElement('button', {
									key: item.province + '::' + item.city,
									type: 'button',
									role: 'option',
									'aria-selected': checked,
									className: 'vm-operate-city-chip lc-lease-order-delivery-region-popover__city-chip' + (checked ? ' active' : ''),
									onClick: function () { selectRegion(item.province, item.city); },
								},
									React.createElement('span', { className: 'lc-lease-order-delivery-region-popover__city-name' }, item.city),
									React.createElement('span', { className: 'lc-lease-order-delivery-region-popover__city-province' }, item.province),
								);
							}))
						: ((activeProvinceNode.children || []).map(function (city) {
							var checked = value[0] === activeProvinceNode.value && value[1] === city.value;
							return React.createElement('button', {
								key: city.value,
								type: 'button',
								role: 'option',
								'aria-selected': checked,
								className: 'vm-operate-city-chip lc-lease-order-delivery-region-popover__city-chip' + (checked ? ' active' : ''),
								onClick: function () { selectRegion(activeProvinceNode.value, city.value); },
							},
								React.createElement('span', { className: 'lc-lease-order-delivery-region-popover__city-name' }, city.label),
								checked ? React.createElement(Check, { size: 14, 'aria-hidden': true, className: 'lc-lease-order-delivery-region-popover__city-check' }) : null,
							);
						})),
				),
			),
		),
	);

	return React.createElement('div', { className: 'vm-operate-city-field lc-lease-order-delivery-region-picker' },
		React.createElement(Popover, {
			trigger: 'click',
			placement: 'bottomLeft',
			open: open,
			onOpenChange: handleOpenChange,
			overlayClassName: 'lc-lease-order-delivery-region-popover',
			getPopupContainer: function () { return document.body; },
			content: popoverContent,
		},
			React.createElement('div', {
				className: 'vm-filter-picker-control lc-lease-order-delivery-region-picker__trigger' + (open ? ' open' : '') + (summary ? ' has-value' : ''),
				role: 'combobox',
				'aria-label': '车辆交付交还地点',
				'aria-expanded': open,
				tabIndex: 0,
				'data-annotation-id': 'lc-lease-order-delivery-region',
			},
				React.createElement(MapPin, { size: 16, 'aria-hidden': true, className: 'lc-lease-order-delivery-region-picker__icon' }),
				summary
					? React.createElement('span', { className: 'vm-filter-picker-input lc-lease-order-delivery-region-picker__summary' }, summary)
					: React.createElement('span', {
						className: 'vm-filter-picker-input lc-lease-order-delivery-region-picker__summary is-placeholder',
					}, '请选择省 / 市'),
				summary
					? React.createElement('button', {
						type: 'button',
						className: 'vm-filter-picker-clear',
						onClick: clearSelection,
						'aria-label': '清空交付地点',
						tabIndex: -1,
					}, React.createElement(X, { size: 14, 'aria-hidden': true }))
					: null,
				React.createElement(ChevronDown, { size: 16, className: 'vm-filter-picker-chevron', 'aria-hidden': true }),
			),
		),
	);
}

function LeaseOrderLeasePeriodField(props) {
	var row = props.row;
	var mode = row.leasePeriodMode || 'months';
	var periodMonths = row.leasePeriodMonths != null && row.leasePeriodMonths !== ''
		? row.leasePeriodMonths
		: 1;
	var periodRangeValue = row.leasePeriodStart && row.leasePeriodEnd
		? [dayjs(row.leasePeriodStart), dayjs(row.leasePeriodEnd)]
		: null;

	return React.createElement('div', { className: 'lc-lease-order-mode-field lc-lease-order-period-field lc-lease-order-period-field--inline' },
		React.createElement(LeaseOrderModeToggle, {
			layout: 'segmented',
			'aria-label': '租赁期限模式',
			value: mode,
			onChange: function (nextMode) {
				if (nextMode === 'months') {
					props.onChange({
						leasePeriodMode: 'months',
						leasePeriodStart: null,
						leasePeriodEnd: null,
						leasePeriodMonths: row.leasePeriodMonths != null && row.leasePeriodMonths !== ''
							? row.leasePeriodMonths
							: 1,
					});
					return;
				}
				props.onChange({
					leasePeriodMode: 'fixed',
					leasePeriodMonths: null,
				});
			},
			options: [
				{ value: 'months', label: '提车起算' },
				{ value: 'fixed', label: '固定期限' },
			],
		}),
		React.createElement('div', { className: 'lc-lease-order-period-field__input' },
			mode === 'fixed'
				? React.createElement(LeaseOrderRangePicker, {
					className: 'lc-form-datepicker vm-focus-border',
					style: { width: '100%' },
					placeholder: ['开始日期', '结束日期'],
					value: periodRangeValue,
					onChange: function (_dates, dateStrings) {
						props.onChange({
							leasePeriodMode: 'fixed',
							leasePeriodStart: dateStrings && dateStrings[0] ? dateStrings[0] : null,
							leasePeriodEnd: dateStrings && dateStrings[1] ? dateStrings[1] : null,
							leasePeriodMonths: null,
						});
					},
					'aria-label': '租赁期限固定日期',
				})
				: React.createElement('div', { className: 'lc-lease-order-period-field__months' },
					React.createElement(InputNumber, {
						className: 'lc-form-number lc-lease-order-period-input vm-focus-border',
						controls: false,
						min: 1,
						step: 1,
						precision: 0,
						value: periodMonths,
						onChange: function (v) {
							props.onChange({
								leasePeriodMode: 'months',
								leasePeriodMonths: v != null ? v : 1,
								leasePeriodStart: null,
								leasePeriodEnd: null,
							});
						},
						addonAfter: '个月',
						placeholder: '月数',
						'aria-label': '提车起算月数',
					}),
					React.createElement('span', { className: 'lc-lease-order-period-field__hint', role: 'note' },
						'从实际提车之日起「',
						React.createElement('span', {
							className: 'lc-lease-order-period-field__hint-value tabular-nums',
						}, String(periodMonths)),
						'个月」后到期',
					),
				),
		),
	);
}

function LeaseOrderVehicleCard(props) {
	var row = props.row;
	var index = props.index;
	var canDelete = props.canDelete;
	var isFlowLocked = Boolean(row._flowLocked);
	var lockedFields = row._flowLockedFields || [];
	var lockBrand = isFlowLocked && lockedFields.indexOf('brandModels') >= 0;
	var lockPlate = isFlowLocked && lockedFields.indexOf('plateNos') >= 0;
	var lockQty = isFlowLocked && lockedFields.indexOf('vehicleQty') >= 0;
	var extraServices = normalizeExtraServices(row);
	var brandModels = normalizeBrandModels(row);
	var plateMode = getPlateMode(row);
	var vehicleCount = getRowVehicleCountForPricing(row);
	var serviceFee = calcRowServiceFee(row);
	var rentBelowMin = brandModels.some(function (pair) {
		return isLeaseRentBelowMinimum(row.rent, pair[0], pair[1]);
	});
	var minRentHint = brandModels.map(function (pair) {
		var minRent = getLeaseMinRentForBrandModel(pair[0], pair[1]);
		if (minRent == null) return null;
		return formatBrandModelPair(pair[0], pair[1]) + ' 最低 ' + minRent.toLocaleString('zh-CN') + ' 元/月';
	}).filter(Boolean).join('；');
	var qtyEditable = plateMode === PLATE_MODE_ACTUAL;
	var cardTitle = brandModels.length
		? formatBrandModelsDisplay(brandModels)[0]
		: ('车型 ' + (index + 1));

	return React.createElement('article', {
		className: 'lc-lease-order-card',
		'data-annotation-id': index === 0 ? 'lc-lease-order-vehicle-card' : undefined,
	},
		React.createElement('header', { className: 'lc-lease-order-card__head' },
			React.createElement('h3', { className: 'lc-lease-order-card__title' }, cardTitle),
			isFlowLocked
				? React.createElement('span', { className: 'lc-lease-order-card__lock-tag', role: 'status' }, '已交车锁定')
				: null,
			canDelete
				? React.createElement('button', {
					type: 'button',
					className: 'lc-lease-order-card__remove',
					onClick: function () { props.onRemove(row.id); },
					'aria-label': '删除' + cardTitle,
				}, React.createElement(Trash2, { size: 14, 'aria-hidden': true }), '删除')
				: null,
		),
		React.createElement('div', { className: 'lc-lease-order-card__row lc-lease-order-card__row--primary' },
			React.createElement(FormField, { label: '品牌 / 型号' },
				lockBrand
					? React.createElement(ReadonlyValue, {
						value: formatBrandModelsDisplay(brandModels).join('、') || '-',
						label: '品牌型号',
					})
					: React.createElement(LeaseOrderBrandModelField, {
						single: true,
						value: brandModels,
						onChange: function (values) {
							props.onChange(row.id, { brandModels: values || [] });
						},
					}),
			),
			React.createElement(FormField, { label: '数量' },
				lockQty
					? React.createElement(ReadonlyValue, {
						value: vehicleCount > 0 ? String(vehicleCount) : '',
						label: '车辆数量',
					})
					: (qtyEditable
					? React.createElement(LeaseOrderAmountField, { suffixText: '辆' },
						React.createElement(InputNumber, {
							className: 'lc-form-number vm-focus-border',
							controls: false,
							min: 1,
							step: 1,
							precision: 0,
							value: row.vehicleQty != null ? row.vehicleQty : 1,
							onChange: function (v) { props.onChange(row.id, { vehicleQty: v }); },
							style: { width: '100%' },
							'aria-label': '车辆数量',
							'data-annotation-id': index === 0 ? 'lc-lease-order-row-qty' : undefined,
						}),
					)
					: React.createElement(ReadonlyValue, {
						value: vehicleCount > 0 ? String(vehicleCount) : '',
						label: '车辆数量',
						computed: plateMode === PLATE_MODE_SPECIFIC,
					})),
			),
			React.createElement(FormField, { label: '车牌号' },
				lockPlate
					? React.createElement(ReadonlyValue, {
						value: (row.plateNos || []).join('、') || '-',
						label: '车牌号',
					})
					: React.createElement(LeaseOrderPlateField, {
						row: row,
						brandModels: brandModels,
						onChange: function (patch) {
							props.onChange(row.id, patch);
						},
					}),
			),
		),
		React.createElement('div', { className: 'lc-lease-order-card__row lc-lease-order-card__row--pricing' },
			React.createElement(FormField, { label: '车辆租金（元/月/辆，含税）' },
				React.createElement(LeaseOrderAmountField, null,
					React.createElement(InputNumber, {
						className: 'lc-form-number vm-focus-border' + (rentBelowMin ? ' lc-form-number--warn' : ''),
						controls: false,
						min: 0,
						step: 0.01,
						precision: 2,
						value: row.rent,
						onChange: function (v) { props.onChange(row.id, { rent: v }); },
						placeholder: '车辆租金',
						style: { width: '100%' },
						'aria-label': '车辆租金',
						'data-annotation-id': index === 0 ? 'lc-lease-order-rent' : undefined,
					}),
				),
				rentBelowMin ? React.createElement('p', {
					className: 'lc-rent-min-warn',
					'data-annotation-id': index === 0 ? 'lc-lease-order-rent-min-warn' : undefined,
					role: 'alert',
				}, '低于系统最低租金，将触发非标准合同审批' + (minRentHint ? '（' + minRentHint + '）' : '')) : null,
			),
			React.createElement(FormField, { label: '保证金（元/辆）' },
				React.createElement(LeaseOrderAmountField, null,
					React.createElement(InputNumber, {
						className: 'lc-form-number vm-focus-border',
						controls: false,
						min: 0,
						step: 0.01,
						precision: 2,
						value: row.deposit,
						onChange: function (v) { props.onChange(row.id, { deposit: v }); },
						style: { width: '100%' },
						'aria-label': '保证金',
					}),
				),
			),
			React.createElement(FormField, {
				label: '服务费（自动计算）',
				labelHint: React.createElement('span', {
					className: 'lc-lease-order-service-fee-label-hint',
					role: 'note',
				}, '仅固定费用计入总价'),
			},
				React.createElement(LeaseOrderAmountField, null,
					React.createElement(ReadonlyValue, {
						value: formatServiceFeeAmount(serviceFee),
						label: '服务费',
						numeric: true,
						computed: true,
					}),
				),
			),
		),
		React.createElement('div', { className: 'lc-lease-order-card__row lc-lease-order-card__row--service-content' },
			React.createElement(LeaseOrderServiceContentField, {
				value: extraServices,
				onChange: function (values) {
					props.onChange(row.id, { extraServices: values || [] });
				},
			}),
		),
		React.createElement('div', { className: 'lc-lease-order-card__row lc-lease-order-card__row--lease-period' },
			React.createElement(FormField, { label: '租赁期限' },
				React.createElement('div', {
					'data-annotation-id': index === 0 ? 'lc-lease-order-lease-period' : undefined,
				},
					React.createElement(LeaseOrderLeasePeriodField, {
						row: row,
						onChange: function (patch) { props.onChange(row.id, patch); },
					}),
				),
			),
		),
	);
}

function LeaseOrderEditor(props) {
	var onChange = props.onChange;
	var order = normalizeLeaseOrderState(props.order || createDefaultLeaseOrderState());
	var rows = order.rows || [];
	var deliveryRegionMode = order.deliveryRegionMode || 'tbd';
	var deliveryDateMode = order.deliveryDateMode || 'unconfirmed';
	var deliveryDateRangeValue = order.deliveryDateStart && order.deliveryDateEnd
		? [dayjs(order.deliveryDateStart), dayjs(order.deliveryDateEnd)]
		: null;

	function emitOrder(next) {
		onChange(normalizeLeaseOrderState(next));
	}

	function patchOrder(patch) {
		emitOrder(Object.assign({}, order, patch));
	}

	function updateRows(nextRows) {
		patchOrder({ rows: nextRows });
	}

	function updateRow(id, patch) {
		updateRows(rows.map(function (row) {
			if (row.id !== id) return syncRowPricingFields(syncRowPlateFields(row));
			return syncRowPricingFields(syncRowPlateFields(Object.assign({}, row, patch)));
		}));
	}

	function addRow() {
		updateRows(rows.concat([createEmptyLeaseOrderRow()]));
	}

	function removeRow(id) {
		if (rows.length <= 1) return;
		updateRows(rows.filter(function (row) { return row.id !== id; }));
	}

	var insuredVehicleCount = calcInsuredVehicleCount(order);
	var orderKpis = calcLeaseOrderKpis(rows, order);

	return React.createElement('div', { className: 'lc-lease-order-editor' },
		React.createElement('div', { className: 'lc-lease-order-kpi-row vm-kpi-row', role: 'group', 'aria-label': '订单费用汇总' },
			React.createElement('div', { className: 'vm-kpi-card lc-lease-order-kpi-card lc-lease-order-kpi-card--count' },
				React.createElement('span', { className: 'lc-lease-order-kpi-card__icon', 'aria-hidden': true }, '辆'),
				React.createElement('span', { className: 'vm-kpi-main' },
					React.createElement('span', { className: 'vm-kpi-eyebrow' }, '租赁车辆数'),
					React.createElement('span', {
						className: 'vm-kpi-val tabular-nums',
						'data-annotation-id': 'lc-lease-order-insured-count',
					}, insuredVehicleCount + ' 辆'),
				),
			),
			React.createElement('div', { className: 'vm-kpi-card lc-lease-order-kpi-card lc-lease-order-kpi-card--rent' },
				React.createElement('span', { className: 'lc-lease-order-kpi-card__icon', 'aria-hidden': true }, '¥'),
				React.createElement('span', { className: 'vm-kpi-main' },
					React.createElement('span', { className: 'vm-kpi-eyebrow' }, '租金及服务费含税总价'),
					React.createElement('span', { className: 'vm-kpi-val tabular-nums' }, formatKpiAmount(orderKpis.rentServiceTaxTotal)),
				),
			),
			React.createElement('div', { className: 'vm-kpi-card lc-lease-order-kpi-card lc-lease-order-kpi-card--deposit' },
				React.createElement('span', { className: 'lc-lease-order-kpi-card__icon', 'aria-hidden': true }, '保'),
				React.createElement('span', { className: 'vm-kpi-main' },
					React.createElement('span', { className: 'vm-kpi-eyebrow' }, '保证金总计'),
					React.createElement('span', { className: 'vm-kpi-val tabular-nums' }, formatKpiAmount(orderKpis.depositTotal)),
				),
			),
			React.createElement('div', { className: 'vm-kpi-card lc-lease-order-kpi-card lc-lease-order-kpi-card--first' },
				React.createElement('span', { className: 'lc-lease-order-kpi-card__icon', 'aria-hidden': true }, '首'),
				React.createElement('span', { className: 'vm-kpi-main' },
					React.createElement('span', { className: 'vm-kpi-eyebrow' }, '首期租金及服务费含税'),
					React.createElement('span', { className: 'vm-kpi-val tabular-nums' }, formatKpiAmount(orderKpis.firstPeriodRentService)),
				),
			),
		),
		React.createElement('div', { className: 'lc-lease-order-editor__summary lc-form-grid' },
			React.createElement(FormField, {
				label: '保险金额',
				labelHint: React.createElement(FormFieldLabelHint, {
					annotationId: 'lc-lease-order-third-party-hint',
					text: '此处仅记录保额，不计入费用计算',
				}),
			},
				React.createElement(InputNumber, {
					className: 'lc-form-number vm-focus-border',
					controls: false,
					min: 0,
					step: 0.01,
					precision: 2,
					value: order.thirdPartyLiabilityMillion,
					onChange: function (v) { patchOrder({ thirdPartyLiabilityMillion: v }); },
					placeholder: '请输入保险金额，单位为「万元」',
					addonAfter: '万元',
					style: { width: '100%' },
					'aria-label': '保险金额',
					'data-annotation-id': 'lc-lease-order-third-party',
				}),
			),
		),
		React.createElement('div', {
			className: 'lc-lease-order-editor__clause-hint',
			id: 'lc-brand-clause-hint-order',
			'data-annotation-id': 'lc-brand-clause-hint-order',
		},
			React.createElement(BrandModelsClauseHint, { brandModels: aggregateOrderBrandModels(rows) }),
		),
		React.createElement('div', {
			className: 'lc-lease-order-editor__cards',
			role: 'region',
			'aria-label': '租赁订单车型卡片',
		},
			rows.map(function (row, index) {
				return React.createElement(LeaseOrderVehicleCard, {
					key: row.id,
					row: row,
					index: index,
					canDelete: rows.length > 1 && !row._flowLocked,
					onChange: updateRow,
					onRemove: removeRow,
				});
			}),
		),
		React.createElement('div', { className: 'lc-lease-order-editor__toolbar' },
			React.createElement(Button, {
				type: 'dashed',
				className: 'lc-lease-order-editor__add-btn',
				onClick: addRow,
				icon: React.createElement(Plus, { size: 14, 'aria-hidden': true }),
				'data-annotation-id': 'lc-lease-order-add-row',
			}, '新增车型'),
		),
		React.createElement('div', { className: 'lc-lease-order-editor__delivery' },
			React.createElement('div', { className: 'lc-lease-order-delivery-grid' },
				React.createElement('section', { className: 'lc-lease-order-delivery-panel' },
					React.createElement('div', { className: 'lc-lease-order-delivery-panel__header' },
						React.createElement('span', { className: 'lc-lease-order-delivery-panel__title' }, '车辆交付（交还）地点'),
						React.createElement(FormFieldLabelHint, {
							annotationId: 'lc-lease-order-delivery-region-hint',
							text: '由对应区域运维负责交/还车',
						}),
					),
					React.createElement('div', { className: 'lc-lease-order-delivery-field' },
						React.createElement(LeaseOrderModeToggle, {
							layout: 'segmented',
							'aria-label': '交付地点模式',
							value: deliveryRegionMode,
							onChange: function (mode) {
								if (mode === 'tbd') {
									patchOrder({
										deliveryRegionMode: 'tbd',
										deliveryRegionTbd: true,
										deliveryRegion: [],
									});
									return;
								}
								patchOrder({
									deliveryRegionMode: 'region',
									deliveryRegionTbd: false,
								});
							},
							options: [
								{ value: 'region', label: '选择省市' },
								{ value: 'tbd', label: DELIVERY_REGION_TBD_LABEL },
							],
						}),
						React.createElement('div', { className: 'lc-lease-order-delivery-field__control' },
							deliveryRegionMode === 'region'
								? React.createElement(LeaseOrderDeliveryRegionField, {
									value: order.deliveryRegion && order.deliveryRegion.length ? order.deliveryRegion : [],
									onChange: function (value) {
										patchOrder({
											deliveryRegionMode: 'region',
											deliveryRegionTbd: false,
											deliveryRegion: value || [],
										});
									},
								})
								: React.createElement(ReadonlyValue, {
									value: DELIVERY_REGION_TBD_DISPLAY,
									label: '车辆交付交还地点',
									computed: true,
								}),
						),
					),
				),
				React.createElement('section', { className: 'lc-lease-order-delivery-panel' },
					React.createElement('div', { className: 'lc-lease-order-delivery-panel__header' },
						React.createElement('span', { className: 'lc-lease-order-delivery-panel__title' }, '车辆交付时间'),
					),
					React.createElement('div', { className: 'lc-lease-order-delivery-field' },
						React.createElement(LeaseOrderModeToggle, {
							layout: 'segmented',
							'aria-label': '交付时间模式',
							value: deliveryDateMode,
							onChange: function (mode) {
								if (mode === 'unconfirmed') {
									patchOrder({
										deliveryDateMode: 'unconfirmed',
										deliveryDateTbd: true,
										deliveryDate: null,
										deliveryDateStart: null,
										deliveryDateEnd: null,
									});
									return;
								}
								patchOrder({
									deliveryDateMode: 'range',
									deliveryDateTbd: false,
								});
							},
							options: [
								{ value: 'range', label: '选择日期' },
								{ value: 'unconfirmed', label: LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL },
							],
						}),
						React.createElement('div', { className: 'lc-lease-order-delivery-field__control' },
							deliveryDateMode === 'range'
								? React.createElement(LeaseOrderRangePicker, {
									className: 'lc-form-datepicker vm-focus-border',
									style: { width: '100%' },
									placeholder: ['开始日期', '结束日期'],
									value: deliveryDateRangeValue,
									onChange: function (_dates, dateStrings) {
										patchOrder({
											deliveryDateMode: 'range',
											deliveryDateTbd: false,
											deliveryDateStart: dateStrings && dateStrings[0] ? dateStrings[0] : null,
											deliveryDateEnd: dateStrings && dateStrings[1] ? dateStrings[1] : null,
											deliveryDate: dateStrings && dateStrings[0] ? dateStrings[0] : null,
										});
									},
									'aria-label': '车辆交付时间范围',
									'data-annotation-id': 'lc-lease-order-delivery-date',
								})
								: React.createElement(ReadonlyValue, {
									value: LEASE_DELIVERY_DATE_UNCONFIRMED_DISPLAY,
									label: '车辆交付时间',
									computed: true,
								}),
						),
					),
				),
			),
		),
	);
}

function PowerOfAttorneyEditor(props) {
	var poa = props.poa || createDefaultPowerOfAttorneyState();
	var onChange = props.onChange;
	var delegates = poa.delegates || [];

	function patchPoa(patch) {
		onChange(Object.assign({}, poa, patch));
	}

	function updateDelegates(nextDelegates) {
		patchPoa({ delegates: nextDelegates });
	}

	function updateDelegate(id, patch) {
		updateDelegates(delegates.map(function (row) {
			if (row.id !== id) return row;
			return Object.assign({}, row, patch);
		}));
	}

	function addDelegate() {
		if (delegates.length >= POA_MAX_DELEGATES) {
			message.warning('一份授权委托书最多添加 ' + POA_MAX_DELEGATES + ' 个受托人');
			return;
		}
		updateDelegates(delegates.concat([createEmptyDelegateRow()]));
	}

	function removeDelegate(id) {
		if (delegates.length <= 1) {
			updateDelegates([createEmptyDelegateRow()]);
			return;
		}
		updateDelegates(delegates.filter(function (row) { return row.id !== id; }));
	}

	var hasStartedDelegate = delegates.some(isDelegateRowStarted);

	return React.createElement('div', { className: 'lc-poa-editor' },
		delegates.map(function (row, index) {
			var started = isDelegateRowStarted(row);
			return React.createElement('div', {
				key: row.id,
				className: 'lc-poa-editor__row',
				role: 'group',
				'aria-label': '受托人 ' + (index + 1),
			},
				delegates.length > 1 ? React.createElement('div', { className: 'lc-poa-editor__row-head' },
					React.createElement('span', { className: 'lc-poa-editor__row-index' }, '受托人 ' + (index + 1)),
				) : null,
				React.createElement('div', { className: 'lc-poa-editor__fields lc-poa-editor__fields--inline' },
					React.createElement(FormField, { label: '姓名', required: started },
						React.createElement(Input, {
							className: 'lc-form-input vm-focus-border',
							value: row.name,
							onChange: function (e) { updateDelegate(row.id, { name: e.target.value }); },
							placeholder: '请输入姓名',
							allowClear: true,
							'aria-label': '受托人姓名',
						}),
					),
					React.createElement(FormField, { label: '联系方式', required: started },
						React.createElement(Input, {
							className: 'lc-form-input vm-focus-border',
							value: row.contact,
							onChange: function (e) { updateDelegate(row.id, { contact: e.target.value }); },
							placeholder: '请输入联系方式',
							allowClear: true,
							'aria-label': '受托人联系方式',
						}),
					),
					React.createElement(FormField, { label: '证件号码', required: started },
						React.createElement(Input, {
							className: 'lc-form-input vm-focus-border',
							value: row.idNumber,
							onChange: function (e) { updateDelegate(row.id, { idNumber: e.target.value }); },
							placeholder: '请输入证件号码',
							allowClear: true,
							'aria-label': '受托人证件号码',
						}),
					),
					React.createElement('div', { className: 'lc-poa-editor__row-action lc-poa-editor__row-action--ops' },
						React.createElement('span', { className: 'lc-poa-editor__ops-label' }, '操作'),
						React.createElement('button', {
							type: 'button',
							className: 'lc-poa-editor__remove-btn',
							onClick: function () { removeDelegate(row.id); },
							'aria-label': '删除受托人 ' + (index + 1),
							title: '删除',
						}, React.createElement(Trash2, { size: 14, 'aria-hidden': true })),
					),
				),
			);
		}),
		React.createElement('div', { className: 'lc-poa-editor__toolbar' },
			React.createElement(Button, {
				type: 'dashed',
				className: 'lc-poa-editor__add-btn',
				onClick: addDelegate,
				disabled: delegates.length >= POA_MAX_DELEGATES,
				icon: React.createElement(Plus, { size: 14, 'aria-hidden': true }),
			}, hasStartedDelegate && delegates.length < POA_MAX_DELEGATES ? '新增受托人' : '新增受托人（' + delegates.length + '/' + POA_MAX_DELEGATES + '）'),
		),
	);
}

function CustomerCredentialThumb(props) {
	var label = props.label;
	var previewUrl = props.previewUrl;
	var meta = props.meta || {};
	var status = meta.status || 'unknown';
	var thumbClass = 'lc-attach-thumb'
		+ (status === 'expired' ? ' is-expired' : '')
		+ (status === 'expiring' ? ' is-expiring' : '');
	return React.createElement('div', {
		className: thumbClass,
		'aria-label': label,
	},
		React.createElement(Image, {
			className: 'lc-attach-thumb__img',
			src: previewUrl,
			alt: label,
			preview: { src: previewUrl },
			fallback: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="100%" height="100%" fill="#f1f5f9"/></svg>'),
		}),
		React.createElement('div', { className: 'lc-attach-thumb__meta' },
			React.createElement('span', { className: 'lc-attach-thumb__label' }, label),
			meta.ocrVerified
				? React.createElement('span', { className: 'lc-attach-thumb__ocr', title: '已通过 OCR 识别证照信息' }, 'OCR 已识别')
				: React.createElement('span', { className: 'lc-attach-thumb__ocr is-pending' }, '待 OCR'),
			meta.expiryDate
				? React.createElement('span', { className: 'lc-attach-thumb__expiry' }, '有效期至 ' + meta.expiryDate)
				: null,
			React.createElement('span', {
				className: 'lc-attach-thumb__status lc-attach-thumb__status--' + status,
				role: 'status',
			}, meta.statusLabel || '待识别'),
		),
	);
}

function CustomerCredentialsAlerts(props) {
	var summary = props.summary;
	if (!summary || (!summary.hasExpired && !summary.hasExpiring)) return null;

	return React.createElement('div', { className: 'lc-credentials-alerts', role: 'status' },
		summary.hasExpiring
			? React.createElement('p', { className: 'lc-credentials-alert lc-credentials-alert--warn' },
				'证照「'
					+ summary.expiringItems.map(function (item) { return item.label; }).join('、')
					+ '」将在 '
					+ CREDENTIAL_EXPIRY_WARN_MONTHS
					+ ' 个月内到期，系统已提前在工作台生成待办，请业管人员及时更新客户档案。',
			)
			: null,
		summary.hasExpired
			? React.createElement('p', { className: 'lc-credentials-alert lc-credentials-alert--danger' },
				'证照「'
					+ summary.expiredItems.map(function (item) { return item.label; }).join('、')
					+ '」已超过有效期。业管未更新前，禁止提交新合同。',
			)
			: null,
	);
}

function FormFieldLabelHint(props) {
	if (!props.text) return null;

	return React.createElement('span', {
		className: 'lc-form-card__hint lc-form-field__inline-hint',
		role: 'note',
		id: props.id,
		'data-annotation-id': props.annotationId || undefined,
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text' }, props.text),
	);
}

function FormFieldHint(props) {
	if (!props.text) return null;
	return React.createElement('span', {
		className: 'lc-form-field__hint',
		role: 'note',
		id: props.id,
		'data-annotation-id': props.annotationId || undefined,
	}, props.text);
}

function FormField(props) {
	var labelContent = [
		props.required ? React.createElement('span', { className: 'lc-form-field__required', 'aria-hidden': 'true' }, '*') : null,
		props.label,
	];
	var labelEl = props.labelHint
		? React.createElement('span', { className: 'lc-form-field__label-row' },
			React.createElement('span', { className: 'lc-form-field__label' }, labelContent),
			props.labelHint,
		)
		: React.createElement('span', { className: 'lc-form-field__label' }, labelContent);

	return React.createElement('label', { className: 'lc-form-field' },
		labelEl,
		props.children,
		props.hint ? React.createElement(FormFieldHint, {
			text: props.hint,
			id: props.hintId,
			annotationId: props.hintAnnotationId,
		}) : null,
	);
}

function getPaymentMethodFieldHint(paymentMethod) {
	if (paymentMethod === 'advance') return '当月25日生成下个周期租赁账单';
	if (paymentMethod === 'postpay') return '次月1日生成上个周期租赁账单';
	return '';
}

function getPaymentPeriodFieldHint(period) {
	var months = period != null ? period : 1;
	return '账单周期为' + months + '个月';
}

function getHydrogenPaymentFieldHint(method) {
	if (method === 'self') return '车辆氢费明细承担方式：客户自行结算';
	if (method === 'prepay') return '车辆氢费明细承担方式：客户承担；无能源账户时自动创建并从账户扣除';
	if (method === 'month') return '车辆氢费明细承担方式：客户承担；每月5日生成上月氢费对账任务（工作台待办）';
	return '';
}

function ReadonlyValue(props) {
	var hasValue = props.value != null && String(props.value).trim() !== '';
	var className = 'lc-form-readonly lc-form-readonly--synced'
		+ (props.numeric ? ' tabular-nums' : '')
		+ (props.computed ? ' lc-form-readonly--computed' : '');
	return React.createElement('div', {
		className: className,
		'aria-readonly': 'true',
		'aria-label': props.label,
	},
		hasValue
			? props.value
			: React.createElement('span', { className: 'lc-form-readonly__empty' }, props.emptyHint || '—'),
	);
}

function ReadonlyPanel(props) {
	return React.createElement('div', {
		className: 'lc-readonly-panel',
		role: 'region',
		'aria-labelledby': props.titleId,
		'aria-readonly': 'true',
	},
		React.createElement('div', { className: 'lc-readonly-panel__head' },
			React.createElement('h3', { id: props.titleId, className: 'lc-readonly-panel__title' }, props.title),
			React.createElement('span', { className: 'lc-readonly-panel__badge' }, props.badge || '只读 · 档案同步'),
		),
		React.createElement('div', { className: 'lc-readonly-panel__body' }, props.children),
	);
}

function FormCardHint(props) {
	if (!props.text) return null;

	return React.createElement('span', {
		className: 'lc-form-card__hint',
		role: 'note',
		id: props.id,
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text' }, props.text),
	);
}

function EditorCard(props) {
	var collapsible = props.collapsible;
	var expanded = collapsible ? props.expanded !== false : true;
	var hintId = props.titleId + '-hint';
	var hintEl = props.desc && expanded
		? React.createElement(FormCardHint, { text: props.desc, id: hintId })
		: null;
	var titleRowEl = React.createElement('div', { className: 'lc-form-card__title-row' },
		React.createElement('h3', { id: props.titleId, className: 'vm-section-title' }, props.title),
		hintEl,
	);
	var toggleEl = collapsible ? React.createElement('button', {
		type: 'button',
		className: 'lc-form-card__toggle',
		onClick: props.onToggle,
		'aria-expanded': expanded,
		'aria-controls': props.bodyId,
	},
		React.createElement('span', null, expanded ? '收起' : '展开'),
		React.createElement(ChevronDown, {
			size: 14,
			className: 'lc-form-card__toggle-icon' + (expanded ? ' is-expanded' : ''),
			'aria-hidden': true,
		}),
	) : null;

	return React.createElement('section', {
		className: 'vm-detail-card lc-form-card' + (collapsible && !expanded ? ' is-collapsed' : ''),
		'aria-labelledby': props.titleId,
		'aria-describedby': hintEl ? hintId : undefined,
		'data-annotation-id': props.annotationId || undefined,
	},
		collapsible
			? React.createElement('div', { className: 'lc-form-card__header' }, titleRowEl, toggleEl)
			: titleRowEl,
		expanded ? React.createElement('div', {
			id: props.bodyId,
			className: collapsible ? 'lc-form-card__body' : 'lc-form-card__body lc-form-card__body--static',
		}, props.children) : null,
	);
}

export default function LeaseContractEditorForm(props) {
	var lessorId = props.lessorId;
	var customerId = props.customerId;
	var thirdPartyCustomerId = props.thirdPartyCustomerId || '';
	var showThirdPartyParty = props.showThirdPartyParty === true;
	var contractCode = props.contractCode || '';
	var projectName = props.projectName || '';
	var businessDept = props.businessDept || '';
	var businessOwner = props.businessOwner || '';
	var mileage = props.mileage || DEFAULT_MILEAGE_STANDARD;
	var feeInfo = props.feeInfo || DEFAULT_FEE_INFO;
	var onLessorChange = props.onLessorChange;
	var onCustomerChange = props.onCustomerChange;
	var onThirdPartyCustomerChange = props.onThirdPartyCustomerChange;
	var onContractCodeChange = props.onContractCodeChange;
	var onProjectNameChange = props.onProjectNameChange;
	var onBusinessAssignmentChange = props.onBusinessAssignmentChange;
	var onMileageChange = props.onMileageChange;
	var onFeeInfoChange = props.onFeeInfoChange;
	var customerPrincipalName = props.customerPrincipalName || '';
	var customerPrincipalPhone = props.customerPrincipalPhone || '';
	var onCustomerPrincipalChange = props.onCustomerPrincipalChange;
	var thirdPartyPrincipalName = props.thirdPartyPrincipalName || '';
	var thirdPartyPrincipalPhone = props.thirdPartyPrincipalPhone || '';
	var onThirdPartyPrincipalChange = props.onThirdPartyPrincipalChange;
	var contractCodeReadonly = props.contractCodeReadonly !== false;

	var lessorCompanies = getLessorCompanies();
	var selectedLessor = getLessorCompanyById(lessorId);
	var selectedCustomer = getLeaseCustomerById(customerId);
	var selectedThirdPartyCustomer = getLeaseCustomerById(thirdPartyCustomerId);
	var invoice = getCustomerInvoicePreview(selectedCustomer);
	var thirdPartyInvoice = getCustomerInvoicePreview(selectedThirdPartyCustomer);
	var lessorAccount = getLessorAccountPreview(selectedLessor);
	var lessorContact = getLessorContactPreview(selectedLessor);
	var customerContact = getCustomerContactPreview(selectedCustomer);
	var thirdPartyContact = getCustomerContactPreview(selectedThirdPartyCustomer);
	var lessorEmptyHint = lessorId ? undefined : '请先选择甲方签约主体';
	var customerEmptyHint = customerId ? undefined : '请先选择乙方客户';
	var thirdPartyEmptyHint = thirdPartyCustomerId ? undefined : '请先选择丙方客户';
	var showPrepayAmount = feeInfo.hydrogenPaymentMethod === 'prepay';

	function renderCustomerPrincipalFields(partyPrefix, principalName, principalPhone, onPrincipalChange, annotationId) {
		return React.createElement('div', {
			className: 'lc-form-grid lc-form-grid--pair lc-signing-customer-principal',
			'data-annotation-id': annotationId,
		},
			React.createElement(FormField, { label: partyPrefix + '负责人姓名' },
				React.createElement(Input, {
					className: 'lc-form-input vm-focus-border',
					value: principalName,
					maxLength: 32,
					placeholder: '请输入' + partyPrefix + '负责人姓名',
					onChange: function (e) {
						if (onPrincipalChange) onPrincipalChange(e.target.value, principalPhone);
					},
					'aria-label': partyPrefix + '负责人姓名',
				}),
			),
			React.createElement(FormField, {
				label: partyPrefix + '负责人手机号',
				labelHint: React.createElement(FormFieldLabelHint, {
					annotationId: annotationId + '-phone-hint',
					text: 'E签宝电子合同签章时' + partyPrefix + '经办人',
				}),
				hint: '提交审核且审批通过后：选择「线上电子签章」时，系统将向该手机号发送 E签宝电子签章文件；选择「线下人工上传」时不发送电子签，需在列表通过「盖章合同补传」上传 PDF/图片附件，查看时可预览与下载。',
			},
				React.createElement(Input, {
					className: 'lc-form-input vm-focus-border tabular-nums',
					value: principalPhone,
					maxLength: 11,
					placeholder: '请输入手机号',
					onChange: function (e) {
						if (onPrincipalChange) onPrincipalChange(principalName, e.target.value);
					},
					'aria-label': partyPrefix + '负责人手机号',
				}),
			),
		);
	}

	function renderCustomerReadonlyPanel(customer, partyLabel, emptyHint, titleId, panelId, annotationId) {
		if (!customer) return null;
		var partyInvoice = getCustomerInvoicePreview(customer);
		var partyContact = getCustomerContactPreview(customer);
		return React.createElement(ReadonlyPanel, {
			titleId: titleId,
			title: partyLabel + '信息',
			badge: '只读 · 客户档案',
		},
			React.createElement('div', {
				id: panelId,
				className: 'lc-form-grid lc-form-grid--cols-2 lc-form-grid--readonly lc-invoice-readonly-panel',
				'aria-label': partyLabel + '信息，来自客户表只读',
				'data-annotation-id': annotationId,
			},
				React.createElement(FormField, { label: '企业名称' }, React.createElement(ReadonlyValue, { value: partyInvoice.companyName, emptyHint: emptyHint })),
				React.createElement(FormField, { label: '开户银行' }, React.createElement(ReadonlyValue, { value: partyInvoice.bank, emptyHint: emptyHint })),
				React.createElement(FormField, { label: '银行账号' }, React.createElement(ReadonlyValue, { value: partyInvoice.bankAccount, emptyHint: emptyHint, numeric: true })),
				React.createElement(FormField, { label: '纳税人识别号' }, React.createElement(ReadonlyValue, { value: partyInvoice.taxId, emptyHint: emptyHint })),
				React.createElement(FormField, { label: '企业地址' }, React.createElement(ReadonlyValue, { value: partyInvoice.mailingAddress, emptyHint: emptyHint })),
				React.createElement(FormField, { label: '企业电话' }, React.createElement(ReadonlyValue, { value: partyInvoice.companyPhone, emptyHint: emptyHint, numeric: true })),
				React.createElement(FormField, { label: '通讯地址' }, React.createElement(ReadonlyValue, { value: partyContact.mailAddress, emptyHint: emptyHint })),
				React.createElement(FormField, { label: '联系人姓名及电话' },
					React.createElement('div', { className: 'lc-form-contact-pair' },
						React.createElement(ReadonlyValue, { value: partyContact.contactName, emptyHint: emptyHint }),
						React.createElement(ReadonlyValue, { value: partyContact.contactPhone, emptyHint: emptyHint, numeric: true }),
					),
				),
				React.createElement(FormField, { label: '邮箱' }, React.createElement(ReadonlyValue, { value: partyContact.email, emptyHint: emptyHint })),
			),
		);
	}

	function renderCustomerCredentialsBlock(customer, annotationSuffix) {
		if (!customer) return null;
		var credentialSummary = summarizeCustomerCredentials(customer);
		return React.createElement('div', {
			className: 'lc-credentials-block',
			'data-annotation-id': 'lc-credentials-ocr' + (annotationSuffix || ''),
		},
			React.createElement('div', { className: 'lc-credentials-block__head' },
				React.createElement('h4', { className: 'lc-credentials-block__title' }, '客户资质证照'),
				React.createElement('span', { className: 'lc-credentials-block__hint' }, 'OCR 识别有效期 · 点击缩略图放大'),
			),
			React.createElement('p', { className: 'lc-credentials-block__policy' },
				'营业执照、法人身份证正反面及道路运输许可证上传后自动 OCR 识别并校验有效期；'
				+ '距到期 '
				+ CREDENTIAL_EXPIRY_WARN_MONTHS
				+ ' 个月内将在工作台生成待办推送给业管；存在已过期证照时禁止提交新合同。',
			),
			React.createElement(CustomerCredentialsAlerts, { summary: credentialSummary }),
			React.createElement('div', {
				className: 'lc-attach-gallery',
				'aria-label': '客户资质证照预览',
			},
				credentialSummary.items.map(function (item) {
					var previewUrl = getCustomerAttachmentPreviewUrl(customer, item.key, item.label);
					return React.createElement(CustomerCredentialThumb, {
						key: item.key,
						label: item.label,
						previewUrl: previewUrl,
						meta: item,
					});
				}),
			),
		);
	}

	function patchMileage(patch) {
		onMileageChange(Object.assign({}, mileage, patch));
	}

	function patchFeeInfo(patch) {
		onFeeInfoChange(Object.assign({}, feeInfo, patch));
	}

	var signingExpandedState = React.useState(true);
	var signingExpanded = signingExpandedState[0];
	var setSigningExpanded = signingExpandedState[1];
	var mileageExpandedState = React.useState(true);
	var mileageExpanded = mileageExpandedState[0];
	var setMileageExpanded = mileageExpandedState[1];
	var feeExpandedState = React.useState(true);
	var feeExpanded = feeExpandedState[0];
	var setFeeExpanded = feeExpandedState[1];

	return React.createElement('div', { className: 'lc-main-contract-form' },
		React.createElement(EditorCard, {
			titleId: 'lc-card-signing',
			title: '签约信息',
			desc: '请选择合同签订各方信息',
			collapsible: true,
			expanded: signingExpanded,
			onToggle: function () { setSigningExpanded(!signingExpanded); },
			bodyId: 'lc-card-signing-body',
			annotationId: 'lc-card-signing',
		},
			React.createElement('div', { className: 'lc-signing-core' },
				React.createElement('div', { className: 'lc-signing-core-fields' },
					React.createElement('div', { className: 'lc-signing-meta-row' },
						React.createElement(FormField, {
							label: '合同编码',
							required: true,
							labelHint: contractCodeReadonly
								? React.createElement('span', {
									className: 'lc-contract-code-auto__tag',
									'data-annotation-id': 'lc-contract-code-auto-tag',
								}, '系统自动生成')
								: null,
						},
							React.createElement('div', {
								'data-annotation-id': 'lc-contract-code-auto',
							},
								React.createElement(ReadonlyValue, {
									value: CONTRACT_CODE_PREFIX + (contractCode || ''),
									numeric: true,
									computed: true,
									label: '合同编码',
									emptyHint: '系统生成中…',
								}),
							),
						),
						React.createElement(FormField, {
							label: '业务部门 / 业务人员',
							required: true,
						},
							React.createElement(BusinessDeptOwnerPickerField, {
								businessDept: businessDept,
								businessOwner: businessOwner,
								onChange: function (dept, owner) {
									if (onBusinessAssignmentChange) onBusinessAssignmentChange(dept, owner);
								},
							}),
						),
					),
					React.createElement('div', { className: 'lc-signing-project-row' },
						React.createElement(FormField, {
							label: '项目名称',
							required: true,
						},
							React.createElement('div', { className: 'lc-form-field__control' },
								React.createElement(Input, {
									className: 'lc-form-input vm-focus-border',
									placeholder: '请输入项目名称',
									value: projectName,
									allowClear: true,
									maxLength: 64,
									onChange: function (e) {
										if (onProjectNameChange) onProjectNameChange(e.target.value);
									},
									'aria-label': '项目名称',
								}),
							),
						),
					),
					showThirdPartyParty
						? React.createElement('div', {
							className: 'lc-form-grid lc-form-grid--cols-3 lc-form-grid--tripartite-parties',
							'data-annotation-id': 'lc-tripartite-parties',
						},
							React.createElement(FormField, {
								label: '甲方',
								required: true,
								labelHint: lessorId
									? React.createElement(FormFieldLabelHint, {
										annotationId: 'lc-lessor-select-hint',
										text: '将使用该公司用章进行电子签章',
									})
									: null,
							},
								React.createElement(Select, {
									className: 'lc-form-select vm-focus-border',
									placeholder: '请选择甲方签约主体',
									value: lessorId || undefined,
									allowClear: true,
									onChange: function (value) { onLessorChange(value || ''); },
									options: lessorCompanies.map(function (c) {
										return { value: c.id, label: c.legalName };
									}),
									'aria-label': '甲方签约主体',
								}),
							),
							React.createElement(FormField, {
								label: '乙方',
								required: true,
							},
								React.createElement(LeaseCustomerPickerField, {
									value: customerId,
									onChange: function (value) { onCustomerChange(value || ''); },
									partyLabel: '乙方',
								}),
							),
							React.createElement(FormField, {
								label: '丙方',
								required: true,
							},
								React.createElement('div', { 'data-annotation-id': 'lc-tripartite-third-party-picker' },
									React.createElement(LeaseCustomerPickerField, {
										value: thirdPartyCustomerId,
										onChange: function (value) {
											if (onThirdPartyCustomerChange) onThirdPartyCustomerChange(value || '');
										},
										partyLabel: '丙方',
										excludeCustomerId: customerId,
									}),
								),
							),
						)
						: React.createElement('div', { className: 'lc-form-grid lc-form-grid--pair' },
							React.createElement(FormField, {
								label: '甲方',
								required: true,
								labelHint: lessorId
									? React.createElement(FormFieldLabelHint, {
										annotationId: 'lc-lessor-select-hint',
										text: '将使用该公司用章进行电子签章',
									})
									: null,
							},
								React.createElement(Select, {
									className: 'lc-form-select vm-focus-border',
									placeholder: '请选择甲方签约主体',
									value: lessorId || undefined,
									allowClear: true,
									onChange: function (value) { onLessorChange(value || ''); },
									options: lessorCompanies.map(function (c) {
										return { value: c.id, label: c.legalName };
									}),
									'aria-label': '甲方签约主体',
								}),
							),
							React.createElement(FormField, {
								label: '乙方',
								required: true,
							},
								React.createElement(LeaseCustomerPickerField, {
									value: customerId,
									onChange: function (value) { onCustomerChange(value || ''); },
									partyLabel: '乙方',
								}),
							),
						),
				),
			),
			customerId ? renderCustomerPrincipalFields('乙方', customerPrincipalName, customerPrincipalPhone, onCustomerPrincipalChange, 'lc-signing-customer-principal') : null,
			showThirdPartyParty && thirdPartyCustomerId
				? renderCustomerPrincipalFields(
					'丙方',
					thirdPartyPrincipalName,
					thirdPartyPrincipalPhone,
					onThirdPartyPrincipalChange,
					'lc-signing-third-party-principal',
				)
				: null,
			lessorId || customerId || thirdPartyCustomerId
				? React.createElement('div', { className: 'lc-party-profiles' },
					lessorId ? React.createElement(ReadonlyPanel, {
						titleId: 'lc-lessor-account-title',
						title: '甲方信息',
						badge: '只读 · 甲方档案',
					},
						React.createElement('div', {
							id: 'lc-lessor-account-panel',
							className: 'lc-form-grid lc-form-grid--cols-2 lc-form-grid--readonly lc-invoice-readonly-panel lc-lessor-account-readonly-panel',
							'aria-label': '甲方信息，来自甲方档案只读',
						},
							React.createElement(FormField, { label: '户名' }, React.createElement(ReadonlyValue, { value: lessorAccount.accountName, emptyHint: lessorEmptyHint })),
							React.createElement(FormField, { label: '开户行' }, React.createElement(ReadonlyValue, { value: lessorAccount.bankName, emptyHint: lessorEmptyHint })),
							React.createElement(FormField, { label: '账号' }, React.createElement(ReadonlyValue, { value: lessorAccount.bankAccount, emptyHint: lessorEmptyHint, numeric: true })),
							React.createElement(FormField, { label: '通讯地址' }, React.createElement(ReadonlyValue, { value: lessorContact.mailAddress, emptyHint: lessorEmptyHint })),
							React.createElement(FormField, { label: '联系人姓名及电话' },
								React.createElement('div', { className: 'lc-form-contact-pair' },
									React.createElement(ReadonlyValue, { value: lessorContact.contactName, emptyHint: lessorEmptyHint }),
									React.createElement(ReadonlyValue, { value: lessorContact.contactPhone, emptyHint: lessorEmptyHint, numeric: true }),
								),
							),
							React.createElement(FormField, { label: '邮箱' }, React.createElement(ReadonlyValue, { value: lessorContact.email, emptyHint: lessorEmptyHint })),
						),
					) : null,
					customerId ? renderCustomerReadonlyPanel(
						selectedCustomer,
						'乙方',
						customerEmptyHint,
						'lc-invoice-info-title',
						'lc-invoice-info-panel',
						'lc-invoice-info',
					) : null,
					thirdPartyCustomerId ? renderCustomerReadonlyPanel(
						selectedThirdPartyCustomer,
						'丙方',
						thirdPartyEmptyHint,
						'lc-third-party-info-title',
						'lc-third-party-info-panel',
						'lc-third-party-info',
					) : null,
					customerId ? renderCustomerCredentialsBlock(selectedCustomer, '') : null,
					thirdPartyCustomerId ? renderCustomerCredentialsBlock(selectedThirdPartyCustomer, '-third-party') : null,
				)
				: React.createElement('div', { className: 'lc-party-profiles-empty', role: 'status' },
					React.createElement('p', { className: 'lc-party-profiles-empty__title' }, '选择签约各方后展示档案'),
					React.createElement('p', { className: 'lc-party-profiles-empty__desc' },
						showThirdPartyParty
							? '甲方、乙方、丙方的账户、联系人与资质证照将从档案自动同步，无需重复填写。'
							: '甲方、乙方的账户、联系人与资质证照将从档案自动同步，无需重复填写。',
					),
				),
		),
		React.createElement(EditorCard, {
			titleId: 'lc-card-mileage',
			title: '里程标准',
			desc: '设置租赁合同里程要求规则和金额',
			collapsible: true,
			expanded: mileageExpanded,
			onToggle: function () { setMileageExpanded(!mileageExpanded); },
			bodyId: 'lc-card-mileage-body',
		},
			React.createElement('div', { className: 'lc-form-grid' },
				React.createElement(FormField, { label: '是否有里程要求', required: true },
					React.createElement(Select, {
						className: 'lc-form-select vm-focus-border',
						value: mileage.hasRequirement ? 'yes' : 'no',
						onChange: function (value) {
							patchMileage({ hasRequirement: value === 'yes' });
						},
						options: [
							{ value: 'yes', label: '是' },
							{ value: 'no', label: '否' },
						],
						'aria-label': '是否有里程要求',
					}),
				),
				mileage.hasRequirement ? React.createElement('div', { className: 'lc-mileage-types-wrap' },
					React.createElement('span', { className: 'lc-mileage-types-wrap__label' },
						React.createElement('span', { className: 'lc-form-field__required', 'aria-hidden': 'true' }, '*'),
						'里程要求类型',
					),
					React.createElement('div', {
						className: 'lc-mileage-types',
						role: 'radiogroup',
						'aria-label': '里程要求类型',
						'aria-required': 'true',
					},
					MILEAGE_PERIOD_OPTIONS.map(function (option) {
						var checked = mileage.period === option.value;
						return React.createElement('label', {
							key: option.value,
							className: 'lc-mileage-type' + (checked ? ' is-active' : ''),
						},
							React.createElement('input', {
								type: 'radio',
								name: 'lc-mileage-period',
								className: 'lc-mileage-type__radio',
								checked: checked,
								onChange: function () { patchMileage({ period: option.value }); },
							}),
							React.createElement('span', { className: 'lc-mileage-type__text' }, option.labelBefore),
							React.createElement(InputNumber, {
								className: 'lc-form-number lc-mileage-type__input vm-focus-border',
								min: 0,
								step: 100,
								disabled: !checked,
								value: checked ? mileage.targetKm : null,
								onChange: function (v) {
									if (checked) {
										patchMileage({ targetKm: v != null ? v : DEFAULT_MILEAGE_STANDARD.targetKm });
									}
								},
								'aria-label': option.labelBefore + '里程',
							}),
							React.createElement('span', { className: 'lc-mileage-type__text' }, option.labelAfter),
						);
					}),
					),
					React.createElement('div', {
						className: 'lc-mileage-reduction',
						'data-annotation-id': 'lc-card-mileage-reduction',
					},
						React.createElement(FormField, { label: '次月租金减免金额', required: true },
							React.createElement(InputNumber, {
								className: 'lc-form-number vm-focus-border',
								controls: false,
								min: 0,
								step: 100,
								precision: 0,
								value: mileage.reductionYuan,
								onChange: function (v) {
									patchMileage({ reductionYuan: v != null ? v : DEFAULT_MILEAGE_STANDARD.reductionYuan });
								},
								addonAfter: '元/辆',
								style: { width: '100%' },
								'aria-label': '次月租金减免金额',
							}),
						),
						React.createElement(FormField, { label: '减免有效期至', required: true },
							React.createElement(DatePicker, {
								className: 'lc-form-datepicker vm-focus-border',
								style: { width: '100%' },
								value: mileage.validUntil ? dayjs(mileage.validUntil) : null,
								onChange: function (value) {
									patchMileage({ validUntil: value ? value.format('YYYY-MM-DD') : null });
								},
								'aria-label': '租金减免有效期',
							}),
						),
					),
				) : null,
			),
		),
		React.createElement(EditorCard, {
			titleId: 'lc-card-fee',
			title: '费用信息',
			desc: '付款周期、氢费支付方式与还车结算单价。',
			collapsible: true,
			expanded: feeExpanded,
			onToggle: function () { setFeeExpanded(!feeExpanded); },
			bodyId: 'lc-card-fee-body',
		},
			React.createElement('div', { className: 'lc-form-grid lc-form-grid--pair' },
				React.createElement(FormField, {
					label: '付款方式',
					required: true,
					labelHint: React.createElement(FormFieldLabelHint, {
						annotationId: 'lc-payment-method-hint',
						text: '决定租赁账单什么时候生成',
					}),
					hint: getPaymentMethodFieldHint(feeInfo.paymentMethod),
					hintId: 'lc-payment-method-detail-hint',
					hintAnnotationId: 'lc-payment-method-detail-hint',
				},
					React.createElement(Select, {
						className: 'lc-form-select vm-focus-border',
						value: feeInfo.paymentMethod,
						onChange: function (value) {
							patchFeeInfo({
								paymentMethod: value || DEFAULT_FEE_INFO.paymentMethod,
							});
						},
						options: PAYMENT_METHOD_OPTIONS,
						'aria-label': '付款方式',
						'data-annotation-id': 'lc-payment-method',
					}),
				),
				React.createElement(FormField, {
					label: '付款周期',
					required: true,
					hint: getPaymentPeriodFieldHint(feeInfo.paymentPeriod),
					hintId: 'lc-payment-period-hint',
					hintAnnotationId: 'lc-payment-period-hint',
				},
					React.createElement(Select, {
						className: 'lc-form-select vm-focus-border',
						value: feeInfo.paymentPeriod,
						onChange: function (value) {
							patchFeeInfo({ paymentPeriod: value != null ? value : DEFAULT_FEE_INFO.paymentPeriod });
						},
						options: PAYMENT_PERIOD_OPTIONS,
						'aria-label': '付款周期',
						'data-annotation-id': 'lc-payment-period',
					}),
				),
				React.createElement(FormField, {
					label: '氢费支付方式',
					required: true,
					hint: getHydrogenPaymentFieldHint(feeInfo.hydrogenPaymentMethod),
					hintId: 'lc-hydrogen-payment-hint',
					hintAnnotationId: 'lc-hydrogen-payment-hint',
				},
					React.createElement(Select, {
						className: 'lc-form-select vm-focus-border',
						value: feeInfo.hydrogenPaymentMethod,
						onChange: function (value) {
							var next = value || DEFAULT_FEE_INFO.hydrogenPaymentMethod;
							patchFeeInfo({
								hydrogenPaymentMethod: next,
								prepayAmount: next === 'prepay' ? feeInfo.prepayAmount : null,
								payAheadWorkdays: next === 'prepay' ? null : feeInfo.payAheadWorkdays,
							});
						},
						options: HYDROGEN_PAYMENT_METHOD_OPTIONS,
						'aria-label': '氢费支付方式',
						'data-annotation-id': 'lc-hydrogen-payment-method',
					}),
				),
				showPrepayAmount ? React.createElement(FormField, { label: '预付款金额', required: true },
					React.createElement(InputNumber, {
						className: 'lc-form-number vm-focus-border',
						controls: false,
						min: 0,
						step: 0.01,
						precision: 2,
						value: feeInfo.prepayAmount,
						onChange: function (v) { patchFeeInfo({ prepayAmount: v }); },
						addonAfter: '元',
						style: { width: '100%' },
						'aria-label': '预付款金额',
					}),
				) : null,
				React.createElement(FormField, { label: '还车氢量差单价', required: true },
					React.createElement(InputNumber, {
						className: 'lc-form-number vm-focus-border',
						controls: false,
						min: 0,
						step: 0.01,
						precision: 2,
						value: feeInfo.returnHydrogenDiffUnitPrice,
						onChange: function (v) { patchFeeInfo({ returnHydrogenDiffUnitPrice: v }); },
						placeholder: '请输入金额，从而计算还车应结款「氢量差补缴金额」',
						addonAfter: '元',
						style: { width: '100%' },
						'aria-label': '还车氢量差单价',
					}),
				),
			),
		),
	);
}

export function LeaseContractLeaseOrderSection(props) {
	var leaseOrder = props.leaseOrder;
	var onLeaseOrderChange = props.onLeaseOrderChange;

	return React.createElement('div', { className: 'lc-create-editor-scroll lc-create-editor-scroll--section' },
		React.createElement(LeaseOrderEditor, {
			order: leaseOrder || createDefaultLeaseOrderState(),
			onChange: onLeaseOrderChange,
		}),
	);
}

export function LeaseContractPowerOfAttorneySection(props) {
	var powerOfAttorney = props.powerOfAttorney;
	var onPowerOfAttorneyChange = props.onPowerOfAttorneyChange;

	return React.createElement('div', { className: 'lc-create-editor-scroll lc-create-editor-scroll--section' },
		React.createElement(PowerOfAttorneyEditor, {
			poa: powerOfAttorney || createDefaultPowerOfAttorneyState(),
			onChange: onPowerOfAttorneyChange,
		}),
	);
}

export function LeaseContractRemarkSection(props) {
	var contractRemark = props.contractRemark;
	var onContractRemarkChange = props.onContractRemarkChange;

	return React.createElement('div', {
		className: 'lc-create-editor-scroll lc-create-editor-scroll--section lc-contract-remark-section',
	},
		React.createElement(FormField, {
			label: '合同备注',
			labelHint: React.createElement(FormFieldLabelHint, {
				annotationId: 'lc-contract-remark-hint',
				text: '用于记录本合同相关说明，仅内部留档，不写入合同正文',
			}),
		},
			React.createElement(Input.TextArea, {
				className: 'lc-contract-remark__textarea vm-focus-border',
				rows: 10,
				maxLength: 500,
				showCount: true,
				value: contractRemark || '',
				onChange: function (e) {
					if (onContractRemarkChange) onContractRemarkChange(e.target.value);
				},
				placeholder: '请输入合同备注，用于内部记录（选填）',
				'aria-label': '合同备注',
				'data-annotation-id': 'lc-contract-remark-input',
			}),
		),
	);
}
