// 在租车辆概览 — 按品牌型号统计（KPI 卡片 + 下方车型面板 / 隐藏后弹层）
import React from 'react';
import { buildOnLeaseFleetByBrandModel } from './lease-contract-list-data.js';

function FleetDetailModal(props) {
	var Modal = props.Modal;
	var item = props.item;
	var open = props.open;
	var onClose = props.onClose;
	var renderVehicleNativeTableHeader = props.renderVehicleNativeTableHeader;
	var renderVehicleNativeTableRow = props.renderVehicleNativeTableRow;
	if (!Modal) return null;

	var titleNode = item
		? React.createElement('div', { className: 'lc-fleet-detail-modal__title' },
			React.createElement('span', { className: 'lc-fleet-detail-modal__title-main' }, item.brand + ' · ' + item.model),
			React.createElement('span', { className: 'lc-fleet-detail-modal__title-badge tabular-nums' }, item.count + ' 辆在租'),
			React.createElement('span', { className: 'lc-fleet-detail-modal__title-type' }, item.vehicleType || '-'),
		)
		: null;

	var canRenderTable = Boolean(
		item
		&& item.entries
		&& item.entries.length
		&& renderVehicleNativeTableHeader
		&& renderVehicleNativeTableRow,
	);

	return React.createElement(Modal, {
		className: 'lc-fleet-detail-modal',
		rootClassName: 'lc-fleet-detail-modal-root',
		title: titleNode,
		open: open,
		onCancel: onClose,
		footer: React.createElement('button', { 'data-vm-icon': 'x', 
			type: 'button',
			className: 'vm-btn vm-btn-ghost lc-fleet-detail-modal__close',
			onClick: onClose,
		 }, '关闭'),
		width: 960,
		centered: true,
		destroyOnClose: true,
	},
		canRenderTable
			? React.createElement('div', { className: 'lc-fleet-detail-modal__body' },
				React.createElement('div', { className: 'lc-fleet-detail-modal__table-host vm-page lc-page' },
					React.createElement('div', { className: 'lc-contract-vehicle-table-wrap' },
						React.createElement('table', { className: 'lc-contract-vehicle-native-table lc-fleet-detail-modal__vehicle-table' },
							renderVehicleNativeTableHeader(),
							React.createElement('tbody', null,
								item.entries.map(function (entry, index) {
									var record = entry.record;
									var vehicle = entry.vehicle;
									var vehicleIndex = (record && record.vehicles)
										? record.vehicles.indexOf(vehicle)
										: -1;
									if (vehicleIndex < 0) vehicleIndex = index;
									return renderVehicleNativeTableRow(
										record,
										vehicle,
										vehicleIndex,
										(record && record.id ? record.id : 'rec') + '-fleet-' + index,
									);
								}),
							),
						),
					),
				),
			)
			: React.createElement('div', { className: 'lc-fleet-detail-modal__empty' }, '暂无车辆明细'),
	);
}

function FleetModelCard(props) {
	var item = props.item;
	var totalOnLease = props.totalOnLease;
	var maxCount = props.maxCount;
	var variant = props.variant || 'default';
	var onOpenDetail = props.onOpenDetail;

	var share = totalOnLease ? Math.round((item.count / totalOnLease) * 100) : 0;
	var barWidth = maxCount ? Math.max(8, Math.round((item.count / maxCount) * 100)) : 8;

	return React.createElement('article', {
		className: 'lc-fleet-summary__card' + (variant === 'compact' ? ' lc-fleet-summary__card--compact' : ''),
		role: 'listitem',
		tabIndex: 0,
		onClick: function () { onOpenDetail(item); },
		onKeyDown: function (e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onOpenDetail(item);
			}
		},
		'aria-label': item.brand + ' ' + item.model + '，' + item.count + ' 辆在租，点击查看明细',
	},
		React.createElement('div', { className: 'lc-fleet-summary__card-top' },
			React.createElement('span', { className: 'lc-fleet-summary__card-brand' }, item.brand),
			React.createElement('span', { className: 'lc-fleet-summary__card-type' }, item.vehicleType),
		),
		React.createElement('h3', { className: 'lc-fleet-summary__card-model', title: item.model }, item.model),
		React.createElement('div', { className: 'lc-fleet-summary__card-metrics' },
			React.createElement('span', { className: 'lc-fleet-summary__card-count tabular-nums' }, item.count),
			React.createElement('span', { className: 'lc-fleet-summary__card-unit' }, '辆'),
			variant !== 'compact'
				? React.createElement('span', { className: 'lc-fleet-summary__card-share tabular-nums' }, '占 ' + share + '%')
				: null,
		),
		variant !== 'compact'
			? React.createElement('div', { className: 'lc-fleet-summary__card-bar', 'aria-hidden': true },
				React.createElement('span', {
					className: 'lc-fleet-summary__card-bar-fill',
					style: { width: barWidth + '%' },
				}),
			)
			: null,
		React.createElement('span', { className: 'lc-fleet-summary__card-hint' }, '点击查看车辆明细'),
	);
}

function FleetQuickViewModal(props) {
	var Modal = props.Modal;
	var open = props.open;
	var onClose = props.onClose;
	var onPinPanel = props.onPinPanel;
	var summary = props.summary;
	var onOpenDetail = props.onOpenDetail;

	if (!Modal || !open) return null;

	var totalOnLease = summary.reduce(function (sum, item) { return sum + item.count; }, 0);
	var maxCount = summary.length ? Math.max.apply(null, summary.map(function (item) { return item.count; })) : 1;

	return React.createElement(Modal, {
		className: 'lc-fleet-quick-modal',
		rootClassName: 'lc-fleet-quick-modal-root',
		title: React.createElement('div', { className: 'lc-fleet-quick-modal__title' },
			React.createElement('span', null, '在租车辆 · 各车型分布'),
			React.createElement('span', { className: 'lc-fleet-quick-modal__badge tabular-nums' }, totalOnLease + ' 辆'),
		),
		open: open,
		onCancel: onClose,
		footer: React.createElement('div', { className: 'lc-fleet-quick-modal__footer' },
			React.createElement('button', { 'data-vm-icon': 'x', 
				type: 'button',
				className: 'vm-btn vm-btn-ghost',
				onClick: onClose,
			 }, '关闭'),
			React.createElement('button', {
				'data-vm-icon': 'plus',
				type: 'button',
				className: 'vm-btn vm-btn-primary',
				onClick: function () {
					onPinPanel();
					onClose();
				},
			}, '展开固定面板'),
		),
		width: 720,
		centered: true,
		destroyOnClose: true,
	},
		summary.length
			? React.createElement('div', { className: 'lc-fleet-summary__grid lc-fleet-summary__grid--quick', role: 'list' },
				summary.map(function (item) {
					return React.createElement(FleetModelCard, {
						key: item.key,
						item: item,
						totalOnLease: totalOnLease,
						maxCount: maxCount,
						variant: 'compact',
						onOpenDetail: onOpenDetail,
					});
				}),
			)
			: React.createElement('div', { className: 'lc-fleet-summary__empty' }, '暂无在租车辆'),
	);
}

export default function LeaseContractFleetSummary(props) {
	var records = props.records || [];
	var Modal = props.Modal;
	var renderVehicleNativeTableHeader = props.renderVehicleNativeTableHeader;
	var renderVehicleNativeTableRow = props.renderVehicleNativeTableRow;
	var expanded = Boolean(props.expanded);
	var panelHidden = Boolean(props.panelHidden);
	var quickViewOpen = Boolean(props.quickViewOpen);
	var onExpandedChange = props.onExpandedChange;
	var onPanelHiddenChange = props.onPanelHiddenChange;
	var onQuickViewOpenChange = props.onQuickViewOpenChange;

	var useState = React.useState;
	var useMemo = React.useMemo;

	var _brand = useState('全部');
	var brandFilter = _brand[0];
	var setBrandFilter = _brand[1];
	var _detailItem = useState(null);
	var detailItem = _detailItem[0];
	var setDetailItem = _detailItem[1];
	var _detailOpen = useState(false);
	var detailOpen = _detailOpen[0];
	var setDetailOpen = _detailOpen[1];

	function openDetail(item) {
		setDetailItem(item);
		setDetailOpen(true);
	}

	function closeDetail() {
		setDetailOpen(false);
		setDetailItem(null);
	}

	function handleHidePanel() {
		if (onPanelHiddenChange) onPanelHiddenChange(true);
		if (onExpandedChange) onExpandedChange(false);
	}

	function handlePinPanel() {
		if (onPanelHiddenChange) onPanelHiddenChange(false);
		if (onExpandedChange) onExpandedChange(true);
		if (onQuickViewOpenChange) onQuickViewOpenChange(false);
	}

	var summary = useMemo(function () {
		return buildOnLeaseFleetByBrandModel(records);
	}, [records]);

	var brandOptions = useMemo(function () {
		var set = {};
		summary.forEach(function (item) { set[item.brand] = true; });
		return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
	}, [summary]);

	var filtered = useMemo(function () {
		return summary.filter(function (item) {
			return brandFilter === '全部' || item.brand === brandFilter;
		});
	}, [summary, brandFilter]);

	var totalOnLease = useMemo(function () {
		return summary.reduce(function (sum, item) { return sum + item.count; }, 0);
	}, [summary]);

	var maxCount = filtered.length ? Math.max.apply(null, filtered.map(function (item) { return item.count; })) : 1;

	if (!totalOnLease) return null;

	var showBody = expanded && !panelHidden;

	return React.createElement(React.Fragment, null,
		showBody
			? React.createElement('section', {
				className: 'lc-fleet-summary is-expanded is-embedded',
				'aria-label': '在租车辆概览',
			},
				React.createElement('div', { className: 'lc-fleet-summary__body' },
					React.createElement('div', { className: 'lc-fleet-summary__body-toolbar' },
						React.createElement('div', { className: 'lc-fleet-summary__brands', role: 'group', 'aria-label': '按品牌筛选' },
							React.createElement('button', {
								type: 'button',
								className: 'lc-fleet-summary__brand-chip' + (brandFilter === '全部' ? ' is-active' : ''),
								onClick: function () { setBrandFilter('全部'); },
								'aria-pressed': brandFilter === '全部',
							}, '全部'),
							brandOptions.map(function (brand) {
								return React.createElement('button', {
									key: brand,
									type: 'button',
									className: 'lc-fleet-summary__brand-chip' + (brandFilter === brand ? ' is-active' : ''),
									onClick: function () { setBrandFilter(brandFilter === brand ? '全部' : brand); },
									'aria-pressed': brandFilter === brand,
								}, brand);
							}),
						),
						React.createElement('button', {
							type: 'button',
							className: 'lc-fleet-summary__hide-btn',
							onClick: handleHidePanel,
							'aria-label': '隐藏在租车辆面板',
						},
							React.createElement('svg', {
								xmlns: 'http://www.w3.org/2000/svg', width: 14, height: 14, viewBox: '0 0 24 24',
								fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
								'aria-hidden': true,
							},
								React.createElement('path', { d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24' }),
								React.createElement('path', { d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
								React.createElement('path', { d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
								React.createElement('line', { x1: 2, y1: 2, x2: 22, y2: 22 }),
							),
							'隐藏',
						),
					),
					filtered.length
						? React.createElement('div', { className: 'lc-fleet-summary__grid', role: 'list' },
							filtered.map(function (item) {
								return React.createElement(FleetModelCard, {
									key: item.key,
									item: item,
									totalOnLease: totalOnLease,
									maxCount: maxCount,
									onOpenDetail: openDetail,
								});
							}),
						)
						: React.createElement('div', { className: 'lc-fleet-summary__empty' },
							React.createElement('p', null, '该品牌暂无在租车型'),
							React.createElement('button', {
								type: 'button',
								className: 'lc-fleet-summary__empty-reset',
								onClick: function () { setBrandFilter('全部'); },
							}, '查看全部'),
						),
				),
			)
			: null,
		React.createElement(FleetQuickViewModal, {
			Modal: Modal,
			open: panelHidden && quickViewOpen,
			onClose: function () {
				if (onQuickViewOpenChange) onQuickViewOpenChange(false);
			},
			onPinPanel: handlePinPanel,
			summary: summary,
			onOpenDetail: openDetail,
		}),
		React.createElement(FleetDetailModal, {
			Modal: Modal,
			item: detailItem,
			open: detailOpen,
			onClose: closeDetail,
			renderVehicleNativeTableHeader: renderVehicleNativeTableHeader,
			renderVehicleNativeTableRow: renderVehicleNativeTableRow,
		}),
	);
}

export { buildOnLeaseFleetByBrandModel };
