import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'antd';
import { StatusTag } from '../vehicle-management/components/StatusTag';
import {
	getCustomerAttachmentPreviewUrl,
} from '../contract-template-management/contract-template-vars.js';
import {
	summarizeCustomerCredentials,
} from './lease-customer-credentials.js';
import {
	buildContractAttachments,
	buildContractOperationLogs,
	buildContractChangeRecords,
	previewContractAttachment,
	downloadContractAttachmentFile,
	CHANGE_RECORD_TYPES,
} from './lease-contract-view-data.js';
import {
	buildContractViewSummary,
	buildContractViewTemplateFields,
	buildContractViewSigningFields,
	buildContractViewLessorProfileFields,
	buildContractViewCustomerProfileFields,
	buildContractViewMileageFields,
	buildContractViewFeeFields,
	buildContractViewLeaseOrderMetaFields,
	buildContractViewVehicleCards,
	buildContractViewAuditFields,
	buildContractViewSealTypes,
	getViewSectionNavItems,
	resolveViewFormContext,
} from './lease-contract-view-sections.js';
import { getAuthorizedDelegates } from './lease-contract-list-data.js';

var SEAL_TYPE_OPTIONS = [
	{ value: 'contract', label: '合同章' },
	{ value: 'official', label: '公章' },
	{ value: 'legal_person', label: '法人章' },
];

function formatChangeTypeLabel(type) {
	var found = CHANGE_RECORD_TYPES.find(function (item) { return item.key === type; });
	return found ? found.label : type || '-';
}

function contractStatusTone(status) {
	if (status === '合同进行中') return 'green';
	if (status === '已提交审批') return 'blue';
	if (status === '已终止') return 'red';
	return 'gray';
}

function approvalStatusTone(status) {
	if (status === '审批通过') return 'green';
	if (status === '审批中' || status === '待审批') return 'amber';
	if (status === '审批驳回' || status === '审批终止') return 'red';
	return 'gray';
}

var VIEW_TAB_SCROLL_OFFSET = 12;

function formatViewDisplayValue(value) {
	return value != null && value !== '' && value !== '-' ? value : null;
}

function getParamSpanClass(props) {
	if (props.wide || props.span === 3) return ' vm-model-param-item--wide';
	if (props.span === 2) return ' vm-model-param-item--span-2';
	return '';
}

function ViewParamField(props) {
	var display = formatViewDisplayValue(props.value);
	var empty = !display && props.children == null;
	var valueNode = props.children != null
		? props.children
		: (display || '—');
	return React.createElement('div', {
		className: 'vm-model-param-item' + getParamSpanClass(props) + (props.className ? ' ' + props.className : ''),
	},
		React.createElement('span', { className: 'vm-model-param-label' }, props.label),
		React.createElement('div', {
			className: 'vm-model-param-value'
				+ (empty ? ' is-empty' : '')
				+ (props.numeric ? ' tabular-nums' : ''),
		}, valueNode),
	);
}

function ViewParamSection(props) {
	return React.createElement('section', {
		className: 'vm-model-param-section',
		'data-annotation-id': props.annotationId,
	},
		React.createElement('h3', { className: 'vm-model-param-section-title' }, props.title),
		props.children,
	);
}

function renderFieldsGrid(fields, cols) {
	var gridClass = 'vm-model-param-grid';
	if (cols === 2) gridClass += ' vm-model-param-grid--2';
	if (cols === 1) gridClass += ' vm-model-param-grid--1';
	return React.createElement('div', { className: gridClass },
		(fields || []).map(function (field) {
			return React.createElement(ViewParamField, {
				key: field.label,
				label: field.label,
				value: field.value,
				numeric: field.mono,
				wide: field.wide,
				span: field.span,
			});
		}),
	);
}

function ViewPartyFields(props) {
	var fields = props.fields || [];
	var contactName = (fields.find(function (f) { return f.label === '联系人姓名'; }) || {}).value;
	var contactPhone = (fields.find(function (f) { return f.label === '联系人电话'; }) || {}).value;
	function resolveSpan(field) {
		if (field.span != null) return field.span;
		if (field.label === '邮箱') return 1;
		if (field.wide) return 3;
		return 1;
	}
	var contactDisplay = [contactName, contactPhone]
		.map(formatViewDisplayValue)
		.filter(Boolean)
		.join(' / ') || null;
	return React.createElement('div', { className: 'vm-model-param-grid' },
		fields.map(function (field) {
			if (field.label === '联系人姓名' || field.label === '联系人电话') return null;
			return React.createElement(ViewParamField, {
				key: props.prefix + '-' + field.label,
				label: field.label,
				value: field.value,
				numeric: field.mono,
				span: resolveSpan(field),
			});
		}),
		React.createElement(ViewParamField, {
			key: props.prefix + '-contact-pair',
			label: '联系人姓名及电话',
			value: contactDisplay,
			numeric: true,
			span: 2,
		}),
	);
}

function ViewDetailStat(props) {
	return React.createElement('div', { className: 'vm-detail-stat' },
		React.createElement('div', { className: 'vm-detail-stat-main' },
			React.createElement('span', { className: 'vm-detail-stat-label' }, props.label),
			React.createElement('span', {
				className: 'vm-detail-stat-value' + (props.numeric ? ' tabular-nums' : ''),
			}, props.value),
		),
	);
}

function ViewCredentialThumb(props) {
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

function ViewCredentialsBlock(props) {
	var customer = props.customer;
	if (!customer) return null;
	var credentialSummary = summarizeCustomerCredentials(customer);
	var embedded = props.embedded;
	return React.createElement('div', {
		className: 'lc-credentials-block lc-view-credentials-block'
			+ (embedded ? ' lc-view-credentials-block--embedded' : ''),
		'data-annotation-id': 'lc-view-credentials-ocr',
	},
		React.createElement('div', { className: 'lc-credentials-block__head' },
			React.createElement('h4', { className: 'lc-credentials-block__title' }, '客户资质证照'),
		),
		React.createElement('div', {
			className: 'lc-attach-gallery',
			'aria-label': '客户资质证照预览',
		},
			credentialSummary.items.map(function (item) {
				var previewUrl = getCustomerAttachmentPreviewUrl(customer, item.key, item.label);
				return React.createElement(ViewCredentialThumb, {
					key: item.key,
					label: item.label,
					previewUrl: previewUrl,
					meta: item,
				});
			}),
		),
	);
}

function ViewSealChips(props) {
	var selected = props.sealTypes || ['contract'];
	var activeOptions = SEAL_TYPE_OPTIONS.filter(function (option) {
		return selected.indexOf(option.value) >= 0;
	});
	if (!activeOptions.length) {
		return React.createElement('p', { className: 'lc-view-section__empty' }, '未选择用章类型');
	}
	return React.createElement('div', {
		className: 'lc-seal-type-chips lc-view-seal-type-chips',
		role: 'group',
		'aria-label': '用章类型',
		'data-annotation-id': 'lc-view-seal-type',
	},
		activeOptions.map(function (option) {
			return React.createElement('span', {
				key: option.value,
				className: 'lc-seal-type-chip lc-view-seal-type-chip is-active',
			}, option.label);
		}),
	);
}

function ViewAttachmentCapsules(props) {
	var attachments = props.attachments || [];
	var record = props.record;
	var onPreview = props.onPreview;
	var onDownload = props.onDownload;
	var Button = props.Button;
	if (!attachments.length) {
		return React.createElement('p', { className: 'lc-view-section__empty' }, '暂无合同附件');
	}
	return React.createElement('div', {
		className: 'lc-view-attachment-capsules',
		'aria-label': '合同附件列表',
	},
		attachments.map(function (file) {
			var fileName = file.name || '未命名附件';
			return React.createElement('div', {
				key: file.uid || fileName,
				className: 'lc-view-attachment-capsule',
			},
				React.createElement('span', {
					className: 'lc-view-attachment-capsule__name',
					title: fileName,
				}, fileName),
				React.createElement('div', { className: 'lc-view-attachment-capsule__actions' },
					React.createElement(Button, {
						type: 'link',
						size: 'small',
						onClick: function () { onPreview(file, record); },
					}, '预览'),
					React.createElement(Button, {
						type: 'link',
						size: 'small',
						onClick: function () { onDownload(file, record); },
					}, '下载'),
				),
			);
		}),
	);
}

function ViewRecordTimeline(props) {
	var items = props.items || [];
	if (!items.length) {
		return React.createElement('p', { className: 'lc-view-section__empty' }, props.emptyText || '暂无记录');
	}
	return React.createElement('ol', { className: 'lc-view-timeline' },
		items.map(function (item) {
			return React.createElement('li', { key: item.id, className: 'lc-view-timeline__item' },
				React.createElement('div', { className: 'lc-view-timeline__dot', 'aria-hidden': true }),
				React.createElement('div', { className: 'lc-view-timeline__content' },
					React.createElement('div', { className: 'lc-view-timeline__head' },
						React.createElement('span', { className: 'lc-view-timeline__title' }, item.title),
						item.badge
							? React.createElement('span', { className: 'lc-view-timeline__badge' }, item.badge)
							: null,
					),
					item.summary
						? React.createElement('p', { className: 'lc-view-timeline__summary' }, item.summary)
						: null,
					React.createElement('div', { className: 'lc-view-timeline__meta' },
						React.createElement('span', null, item.operatorName || '-'),
						React.createElement('span', { className: 'tabular-nums' }, item.operateTime || '-'),
					),
				),
			);
		}),
	);
}

export default function LeaseContractView({ record, onBack, stampedFilesOverride }) {
	var antd = (typeof window !== 'undefined' && window.antd) || {};
	var Table = antd.Table;
	var Button = antd.Button;
	var message = antd.message;

	var activeSectionState = useState('main');
	var activeSection = activeSectionState[0];
	var setActiveSection = activeSectionState[1];

	var scrollRef = useRef(null);
	var sectionRefs = useRef({});

	var formContext = useMemo(function () { return resolveViewFormContext(record); }, [record]);
	var attachments = useMemo(function () {
		if (!record) return [];
		if (stampedFilesOverride && stampedFilesOverride.length) {
			return stampedFilesOverride.map(function (file) {
				return { uid: file.uid, name: file.name, type: file.type || '' };
			});
		}
		return buildContractAttachments(record);
	}, [record, stampedFilesOverride]);
	var operationLogs = useMemo(function () { return buildContractOperationLogs(record); }, [record]);
	var changeRecords = useMemo(function () { return buildContractChangeRecords(record); }, [record]);
	var summary = useMemo(function () { return buildContractViewSummary(record); }, [record]);
	var navItems = useMemo(function () { return getViewSectionNavItems(); }, []);
	var templateFields = useMemo(function () { return buildContractViewTemplateFields(record); }, [record]);
	var signingFields = useMemo(function () { return buildContractViewSigningFields(record, formContext); }, [record, formContext]);
	var lessorFields = useMemo(function () { return buildContractViewLessorProfileFields(formContext); }, [formContext]);
	var customerFields = useMemo(function () { return buildContractViewCustomerProfileFields(formContext); }, [formContext]);
	var mileageFields = useMemo(function () { return buildContractViewMileageFields(record, formContext); }, [record, formContext]);
	var feeFields = useMemo(function () { return buildContractViewFeeFields(record, formContext); }, [record, formContext]);
	var leaseOrderMetaFields = useMemo(function () { return buildContractViewLeaseOrderMetaFields(record); }, [record]);
	var vehicleCards = useMemo(function () { return buildContractViewVehicleCards(record); }, [record]);
	var auditFields = useMemo(function () { return buildContractViewAuditFields(record); }, [record]);
	var sealTypes = useMemo(function () { return buildContractViewSealTypes(record, formContext); }, [record, formContext]);
	var delegates = useMemo(function () { return getAuthorizedDelegates(record); }, [record]);

	var contractRemark = useMemo(function () {
		if (!record) return '';
		return record.remark && record.remark !== '-' ? record.remark : '';
	}, [record]);

	var changeTimelineItems = useMemo(function () {
		return changeRecords.map(function (item) {
			return {
				id: item.id,
				title: item.typeLabel || formatChangeTypeLabel(item.type),
				summary: item.summary,
				operatorName: item.operatorName,
				operateTime: item.operateTime,
				badge: item.approvalStatus,
			};
		});
	}, [changeRecords]);

	var scrollToSection = useCallback(function (sectionKey) {
		setActiveSection(sectionKey);
		var target = sectionRefs.current[sectionKey];
		var container = scrollRef.current;
		if (!target || !container) return;
		var containerTop = container.getBoundingClientRect().top;
		var targetTop = target.getBoundingClientRect().top;
		container.scrollTo({
			top: container.scrollTop + (targetTop - containerTop) - VIEW_TAB_SCROLL_OFFSET,
			behavior: 'smooth',
		});
	}, []);

	useEffect(function () {
		var container = scrollRef.current;
		if (!container) return undefined;
		function onScroll() {
			var keys = navItems.map(function (item) { return item.key; });
			var current = keys[0];
			keys.forEach(function (key) {
				var el = sectionRefs.current[key];
				if (!el) return;
				var top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
				if (top <= VIEW_TAB_SCROLL_OFFSET + 4) current = key;
			});
			setActiveSection(current);
		}
		container.addEventListener('scroll', onScroll, { passive: true });
		return function () { container.removeEventListener('scroll', onScroll); };
	}, [navItems]);

	function bindSectionRef(key) {
		return function (node) {
			sectionRefs.current[key] = node;
		};
	}

	function renderAnchorSection(key, annotationId, children) {
		return React.createElement('section', {
			key: key,
			id: 'lc-view-section-' + key,
			className: 'lc-view-detail-anchor',
			ref: bindSectionRef(key),
			'data-annotation-id': annotationId,
		}, children);
	}

	function renderScrollSections() {
		return React.createElement(React.Fragment, null,
			renderAnchorSection('template', 'lc-view-template',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '模板与签署', annotationId: 'lc-view-template-fields' },
						renderFieldsGrid(templateFields, 2),
					),
				),
			),
			renderAnchorSection('main', 'lc-view-main-contract',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '签约信息', annotationId: 'lc-view-card-signing' },
						renderFieldsGrid(signingFields, 3),
					),
					lessorFields.length
						? React.createElement(ViewParamSection, { title: '甲方信息', annotationId: 'lc-view-lessor-account' },
							React.createElement(ViewPartyFields, { fields: lessorFields, prefix: 'lessor' }),
						)
						: null,
					customerFields.length
						? React.createElement(ViewParamSection, { title: '乙方信息', annotationId: 'lc-view-invoice-info' },
							React.createElement(ViewPartyFields, { fields: customerFields, prefix: 'customer' }),
							formContext && formContext.customer
								? React.createElement(ViewCredentialsBlock, { customer: formContext.customer, embedded: true })
								: null,
						)
						: null,
					React.createElement(ViewParamSection, { title: '里程标准', annotationId: 'lc-view-card-mileage' },
						renderFieldsGrid(mileageFields, 3),
					),
					React.createElement(ViewParamSection, { title: '费用信息', annotationId: 'lc-view-card-fee' },
						renderFieldsGrid(feeFields, 3),
					),
				),
			),
			renderAnchorSection('leaseOrder', 'lc-view-lease-order',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '订单概要', annotationId: 'lc-view-lease-order-summary' },
						renderFieldsGrid(leaseOrderMetaFields, 3),
					),
					vehicleCards.length
						? vehicleCards.map(function (card, index) {
							return React.createElement(ViewParamSection, {
								key: card.id,
								title: '车辆 ' + String(index + 1).padStart(2, '0') + ' · ' + card.title,
								annotationId: 'lc-view-vehicle-' + card.id,
							},
								React.createElement('div', { className: 'lc-view-vehicle-card__status' },
									React.createElement(StatusTag, { label: card.status.label, tone: card.status.tone }),
								),
								renderFieldsGrid(card.fields, 3),
							);
						})
						: React.createElement('p', { className: 'lc-view-section__empty' }, '暂无车辆订单'),
				),
			),
			renderAnchorSection('poa', 'lc-view-poa',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '授权委托', annotationId: 'lc-view-poa-table' },
						delegates.length
							? React.createElement(Table, {
								rowKey: function (_, index) { return 'poa-' + index; },
								size: 'small',
								className: 'lc-view-table',
								columns: [
									{ title: '受托人', dataIndex: 'name', key: 'name', width: 100 },
									{ title: '联系方式', dataIndex: 'contact', key: 'contact', width: 130, className: 'tabular-nums', render: function (v, row) { return v || row.phone || '-'; } },
									{ title: '身份证号', key: 'idNumber', width: 180, className: 'tabular-nums', render: function (_, row) { return row.idNumber || row.idCard || '-'; } },
								],
								dataSource: delegates,
								pagination: false,
							})
							: React.createElement('p', { className: 'lc-view-section__empty' }, '未添加受托人'),
						record.poaRemark
							? React.createElement('p', { className: 'lc-view-remark-text lc-view-poa-remark' }, record.poaRemark)
							: null,
					),
				),
			),
			renderAnchorSection('remark', 'lc-view-remark',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '合同备注', annotationId: 'lc-view-remark-body' },
						contractRemark
							? React.createElement('p', { className: 'lc-view-remark-text' }, contractRemark)
							: React.createElement('p', { className: 'lc-view-section__empty' }, '未填写备注'),
					),
				),
			),
			renderAnchorSection('seal', 'lc-view-seal',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '用章类型', annotationId: 'lc-view-seal-chips' },
						React.createElement(ViewSealChips, { sealTypes: sealTypes }),
					),
				),
			),
			renderAnchorSection('attachments', 'lc-view-attachments',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '合同附件', annotationId: 'lc-view-attachment-list' },
						React.createElement(ViewAttachmentCapsules, {
							attachments: attachments,
							record: record,
							Button: Button,
							onPreview: function (file, contractRecord) {
								var ok = previewContractAttachment(file, contractRecord);
								if (!ok) message.info('预览：' + (file.name || '附件') + '（原型）');
							},
							onDownload: function (file, contractRecord) {
								var ok = downloadContractAttachmentFile(file, contractRecord);
								if (!ok) message.success('已开始下载：' + (file.name || '附件') + '（原型）');
							},
						}),
					),
				),
			),
			renderAnchorSection('audit', 'lc-view-audit',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '建档信息', annotationId: 'lc-view-audit-fields' },
						renderFieldsGrid(auditFields, 3),
					),
				),
			),
			renderAnchorSection('operations', 'lc-view-operation-logs',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '操作记录', annotationId: 'lc-view-operation-table' },
						React.createElement(Table, {
							rowKey: 'id',
							size: 'small',
							className: 'lc-view-table lc-view-table--compact',
							columns: [
								{ title: '操作', dataIndex: 'action', key: 'action', width: 96 },
								{ title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 88 },
								{ title: '操作时间', dataIndex: 'operateTime', key: 'operateTime', width: 132, className: 'tabular-nums' },
								{ title: '修改人', dataIndex: 'modifierName', key: 'modifierName', width: 88 },
								{ title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 132, className: 'tabular-nums' },
							],
							dataSource: operationLogs,
							pagination: false,
							locale: { emptyText: '暂无操作记录' },
							scroll: { x: 580 },
						}),
					),
				),
			),
			renderAnchorSection('changes', 'lc-view-change-records',
				React.createElement('div', { className: 'vm-model-param-tab vm-model-param-tab--readonly' },
					React.createElement(ViewParamSection, { title: '变更记录', annotationId: 'lc-view-change-body' },
						changeTimelineItems.length <= 6
							? React.createElement(ViewRecordTimeline, {
								items: changeTimelineItems,
								emptyText: '暂无变更记录',
							})
							: React.createElement(Table, {
								rowKey: 'id',
								size: 'small',
								className: 'lc-view-table',
								columns: [
									{ title: '变更类型', key: 'typeLabel', width: 120, render: function (_, row) { return row.typeLabel || formatChangeTypeLabel(row.type); } },
									{ title: '摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
									{ title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 88 },
									{ title: '操作时间', dataIndex: 'operateTime', key: 'operateTime', width: 132, className: 'tabular-nums' },
									{ title: '审批状态', dataIndex: 'approvalStatus', key: 'approvalStatus', width: 96 },
								],
								dataSource: changeRecords,
								pagination: false,
								scroll: { x: 640 },
							}),
					),
				),
			),
		);
	}

	if (!record || !summary) {
		return React.createElement('div', { className: 'vm-page lc-page lc-view-page vm-detail' },
			React.createElement('div', { className: 'vm-detail-topbar' },
				React.createElement('button', { type: 'button', className: 'vm-btn vm-btn-back', onClick: onBack }, '返回列表'),
			),
			React.createElement('p', { className: 'lc-view-page__empty' }, '未找到合同记录'),
		);
	}

	return React.createElement('div', { className: 'vm-page lc-page lc-view-page vm-detail lc-view-detail-page' },
		React.createElement('div', { className: 'vm-detail-topbar lc-view-detail-topbar', 'data-annotation-id': 'lc-view-topbar' },
			React.createElement('button', { type: 'button', className: 'vm-btn vm-btn-back', onClick: onBack }, '返回列表'),
		),
		React.createElement('div', { className: 'lc-view-detail-shell' },
			React.createElement('section', { className: 'vm-detail-card lc-view-detail-header-card' },
					React.createElement('div', { className: 'vm-detail-hero', 'data-annotation-id': 'lc-view-hero' },
						React.createElement('div', null,
							React.createElement('div', { className: 'vm-detail-plate lc-view-hero__title' }, summary.projectName),
							React.createElement('p', { className: 'vm-detail-meta' }, summary.customerName),
							React.createElement('p', { className: 'vm-detail-meta mono tabular-nums' }, summary.contractCode),
						),
						React.createElement('div', { className: 'vm-detail-aside lc-view-hero__aside' },
							React.createElement('div', { className: 'lc-view-hero-tags' },
								React.createElement(StatusTag, { label: summary.displayStatus, tone: contractStatusTone(summary.displayStatus) }),
								summary.showApprovalBadge
									? React.createElement(StatusTag, { label: summary.approvalStatus, tone: approvalStatusTone(summary.approvalStatus) })
									: null,
							),
							React.createElement('p', { className: 'vm-detail-meta' }, summary.contractType + ' · ' + summary.contractApprovalType),
							React.createElement('p', { className: 'vm-detail-gps-time' }, '签署状态：' + summary.signingSubLabel),
						),
					),
					React.createElement('div', { className: 'vm-detail-stats', 'data-annotation-id': 'lc-view-stats' },
						React.createElement(ViewDetailStat, { label: '签署方式', value: summary.signingMethodLabel }),
						React.createElement(ViewDetailStat, { label: '业务部门', value: record.businessDept || '—' }),
						React.createElement(ViewDetailStat, { label: '业务负责人', value: summary.businessOwner }),
						React.createElement(ViewDetailStat, {
							label: '租赁车辆',
							value: String(summary.vehicleCount || 0) + ' 辆',
							numeric: true,
						}),
					),
					React.createElement('div', {
						className: 'vm-tabs lc-view-detail-tabs',
						role: 'tablist',
						'aria-label': '合同详情章节',
						'data-annotation-id': 'lc-view-section-nav',
					},
						navItems.map(function (item) {
							var isActive = activeSection === item.key;
							return React.createElement('button', {
								key: item.key,
								type: 'button',
								role: 'tab',
								className: 'vm-tab' + (isActive ? ' active' : ''),
								'aria-selected': isActive ? 'true' : 'false',
								onClick: function () { scrollToSection(item.key); },
							}, item.label);
						}),
					),
				),
			React.createElement('div', {
				className: 'lc-view-detail-body',
				ref: scrollRef,
				'aria-label': '合同详情内容',
			},
				renderScrollSections(),
			),
		),
	);
}
