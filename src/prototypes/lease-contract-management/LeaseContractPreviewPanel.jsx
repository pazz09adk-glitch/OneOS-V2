import React, { useEffect, useRef, useState } from 'react';
import { Select, Popover } from 'antd';
import { Info, FileDiff } from 'lucide-react';
import { paginateWordHtml } from './contract-word-preview.js';
import { collectClauseChangeRecords } from './lease-contract-risk-detect.js';

var PREVIEW_ZOOM_STEPS = [50, 75, 90, 100, 110, 125, 150, 175, 200];

function EditablePreviewPageBody(props) {
	var pageIndex = props.pageIndex;
	var initialHtml = props.initialHtml;
	var onInput = props.onInput;
	var bodyRef = useRef(null);
	var seededHtmlRef = useRef('');

	useEffect(function () {
		if (!bodyRef.current) return;
		if (seededHtmlRef.current === initialHtml) return;
		bodyRef.current.innerHTML = initialHtml || '';
		seededHtmlRef.current = initialHtml || '';
	}, [initialHtml]);

	return React.createElement('div', {
		ref: bodyRef,
		className: 'ct-preview-page__body ct-word-doc lc-preview-page__body--editable',
		contentEditable: true,
		suppressContentEditableWarning: true,
		role: 'textbox',
		'aria-multiline': true,
		'aria-label': '合同预览正文，第 ' + (pageIndex + 1) + ' 页',
		onInput: function (event) {
			if (onInput) onInput(pageIndex, event.currentTarget.innerHTML);
		},
	});
}

export function PreviewEditableHint() {
	return React.createElement('span', {
		className: 'lc-form-card__hint lc-preview-editable-hint lc-preview-editable-hint--inline',
		role: 'note',
		'data-annotation-id': 'lc-preview-editable-hint',
		id: 'lc-preview-editable-hint',
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text lc-preview-editable-hint__text' },
			'正文可编辑；改动',
			React.createElement('span', { className: 'lc-preview-editable-hint__risk' }, '风控红线条款'),
			'或新增条款走非标准审批，未改则标准审批。',
		),
	);
}

export function PreviewAttachment1ReadonlyHint() {
	return React.createElement('span', {
		className: 'lc-form-card__hint lc-preview-editable-hint lc-preview-editable-hint--inline lc-preview-attachment1-hint',
		role: 'note',
		'data-annotation-id': 'lc-preview-attachment1-hint',
		id: 'lc-preview-attachment1-hint',
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text lc-preview-editable-hint__text' },
			'仅展示附件1条款，主合同及其他附件不可编辑、无需重签；请在左侧填写新增车辆订单。',
		),
	);
}

export function PreviewPowerOfAttorneyReadonlyHint() {
	return React.createElement('span', {
		className: 'lc-form-card__hint lc-preview-editable-hint lc-preview-editable-hint--inline lc-preview-poa-hint',
		role: 'note',
		'data-annotation-id': 'lc-preview-poa-hint',
		id: 'lc-preview-poa-hint',
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text lc-preview-editable-hint__text' },
			'仅展示授权委托书，主合同及其他附件不可编辑、无需重签；请在左侧填写受托人信息。',
		),
	);
}

export function PreviewApprovalHint() {
	return React.createElement('span', {
		className: 'lc-form-card__hint lc-preview-approval-hint',
		role: 'note',
		'data-annotation-id': 'lc-preview-approval-hint',
		id: 'lc-preview-approval-hint',
		title: '非标准合同触发条件：1.实时预览新增条款；2.改动风控红线条款；3.付款方式为先用后付；4.付款周期为季付/半年付/年付；5.车辆租金或保证金低于车型最低标准价；6.用章类型额外选择公章或法人章',
	},
		React.createElement(Info, {
			size: 13,
			className: 'lc-form-card__hint-icon',
			'aria-hidden': true,
		}),
		React.createElement('span', { className: 'lc-form-card__hint-text' }, '非标准触发条件'),
	);
}

function PreviewClauseChangeRecordPanel(props) {
	var records = props.records || [];

	return React.createElement('div', {
		className: 'lc-preview-clause-record-panel',
		role: 'region',
		'aria-label': '条款修改记录',
		'data-annotation-id': 'lc-preview-clause-record',
	},
		React.createElement('div', { className: 'lc-preview-clause-record-panel__head' },
			React.createElement('span', { className: 'lc-preview-clause-record-panel__title' }, '条款修改记录'),
			records.length
				? React.createElement('span', { className: 'lc-preview-clause-record-panel__count tabular-nums' }, records.length + ' 处')
				: null,
		),
		records.length
			? React.createElement('ul', { className: 'lc-preview-clause-record-panel__list' },
				records.map(function (item) {
					return React.createElement('li', {
						key: item.id,
						className: 'lc-preview-clause-record-panel__item lc-preview-clause-record-panel__item--' + item.kind,
					},
						React.createElement('span', { className: 'lc-preview-clause-record-panel__kind' }, item.kindLabel),
						React.createElement('div', { className: 'lc-preview-clause-record-panel__diff' },
							React.createElement('div', { className: 'lc-preview-clause-record-panel__col' },
								React.createElement('span', { className: 'lc-preview-clause-record-panel__label' }, '标准条款'),
								React.createElement('p', { className: 'lc-preview-clause-record-panel__text' }, item.standardText),
							),
							React.createElement('div', { className: 'lc-preview-clause-record-panel__col' },
								React.createElement('span', { className: 'lc-preview-clause-record-panel__label' }, '修改后'),
								React.createElement('p', { className: 'lc-preview-clause-record-panel__text' }, item.modifiedText),
							),
						),
					);
				}),
			)
			: React.createElement('p', { className: 'lc-preview-clause-record-panel__empty', role: 'status' },
				'暂无条款修改，编辑预览正文后将在此对比标准条款与修改后内容。',
			),
	);
}

function PreviewClauseChangeRecordTrigger(props) {
	var records = props.records || [];
	var openState = useState(false);
	var open = openState[0];
	var setOpen = openState[1];
	var count = records.length;

	return React.createElement('div', {
		className: 'ct-preview-pager__group ct-preview-pager__group--clause-record',
		role: 'group',
		'aria-label': '条款修改记录',
	},
		React.createElement(Popover, {
			trigger: 'click',
			placement: 'bottomRight',
			open: open,
			onOpenChange: setOpen,
			overlayClassName: 'lc-preview-clause-record-popover',
			getPopupContainer: function () { return document.body; },
			content: React.createElement(PreviewClauseChangeRecordPanel, { records: records }),
		},
			React.createElement('button', {
				type: 'button',
				className: 'vm-btn vm-btn-secondary lc-preview-clause-record-btn'
					+ (open ? ' is-active' : '')
					+ (count ? ' has-changes' : ''),
				'aria-expanded': open,
				'aria-haspopup': 'dialog',
				'data-annotation-id': 'lc-preview-clause-record-btn',
			},
				React.createElement(FileDiff, { size: 14, 'aria-hidden': true }),
				React.createElement('span', { className: 'lc-preview-clause-record-btn__label' }, '条款修改记录'),
				count
					? React.createElement('span', {
						className: 'lc-preview-clause-record-btn__badge tabular-nums',
						'aria-label': count + ' 处修改',
					}, count)
					: null,
			),
		),
	);
}

function previewPagerIcon(name) {
	var common = {
		xmlns: 'http://www.w3.org/2000/svg',
		width: 16,
		height: 16,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		'aria-hidden': true,
	};
	if (name === 'zoomOut') {
		return React.createElement('svg', common, React.createElement('path', { d: 'M5 12h14' }));
	}
	if (name === 'zoomIn') {
		return React.createElement('svg', common,
			React.createElement('path', { d: 'M5 12h14' }),
			React.createElement('path', { d: 'M12 5v14' }),
		);
	}
	return null;
}

export default function LeaseContractPreviewPanel({
	html,
	zoom,
	onZoomChange,
	editable,
	onContentChange,
}) {
	var baselinePagesState = useState([]);
	var pageIdxState = useState(0);
	var viewModeState = useState('scroll');
	var internalZoomState = useState(100);
	var clauseRecordsState = useState([]);
	var baselinePages = baselinePagesState[0];
	var setBaselinePages = baselinePagesState[1];
	var draftPagesRef = useRef([]);
	var pageIdx = pageIdxState[0];
	var setPageIdx = pageIdxState[1];
	var viewMode = viewModeState[0];
	var setViewMode = viewModeState[1];
	var clauseRecords = clauseRecordsState[0];
	var setClauseRecords = clauseRecordsState[1];
	var previewZoom = zoom != null ? zoom : internalZoomState[0];
	var setPreviewZoom = onZoomChange || internalZoomState[1];

	useEffect(function () {
		if (!html) {
			setBaselinePages([]);
			draftPagesRef.current = [];
			setClauseRecords([]);
			return;
		}
		var timer = window.setTimeout(function () {
			var nextPages = paginateWordHtml(html);
			setBaselinePages(nextPages);
			draftPagesRef.current = nextPages.slice();
			pageIdxState[1](0);
			setClauseRecords([]);
			notifyContentChange(nextPages);
		}, 0);
		return function () { window.clearTimeout(timer); };
	}, [html]);

	function notifyContentChange(nextPages) {
		var merged = (nextPages || []).join('');
		setClauseRecords(collectClauseChangeRecords(html, merged));
		if (!onContentChange) return;
		onContentChange(merged);
	}

	function handlePageInput(pageIndex, nextHtml) {
		var draft = draftPagesRef.current ? draftPagesRef.current.slice() : [];
		draft[pageIndex] = nextHtml;
		draftPagesRef.current = draft;
		notifyContentChange(draft);
	}

	function stepPreviewZoom(direction) {
		setPreviewZoom(function (current) {
			var idx = PREVIEW_ZOOM_STEPS.indexOf(current);
			if (idx < 0) {
				if (direction > 0) {
					return PREVIEW_ZOOM_STEPS.find(function (value) { return value > current; })
						|| PREVIEW_ZOOM_STEPS[PREVIEW_ZOOM_STEPS.length - 1];
				}
				var reversed = PREVIEW_ZOOM_STEPS.slice().reverse();
				return reversed.find(function (value) { return value < current; }) || PREVIEW_ZOOM_STEPS[0];
			}
			var nextIdx = idx + direction;
			if (nextIdx < 0) return PREVIEW_ZOOM_STEPS[0];
			if (nextIdx >= PREVIEW_ZOOM_STEPS.length) return PREVIEW_ZOOM_STEPS[PREVIEW_ZOOM_STEPS.length - 1];
			return PREVIEW_ZOOM_STEPS[nextIdx];
		});
	}

	if (!html || !String(html).trim()) {
		return React.createElement('div', { className: 'ct-preview-empty', role: 'status' },
			React.createElement('p', { className: 'ct-preview-empty__text' }, '暂无合同内容可预览'),
		);
	}

	if (!baselinePages.length) {
		return React.createElement('div', { className: 'ct-preview-doc ct-word-doc ct-word-paginated' },
			React.createElement('div', { className: 'ct-preview-body-shell' },
				React.createElement('div', { className: 'ct-preview-pages-wrap' },
					React.createElement('div', { className: 'ct-preview-pages' },
						React.createElement('div', { className: 'ct-preview-page is-loading' }, '合同分页排版计算中…'),
					),
				),
			),
		);
	}

	var previewToolbar = React.createElement('div', { className: 'ct-preview-toolbar' },
		React.createElement('div', { className: 'ct-preview-toolbar__row ct-preview-toolbar__row--primary', role: 'toolbar', 'aria-label': '预览缩放' },
			React.createElement('div', { className: 'ct-preview-pager__group', role: 'group', 'aria-label': '缩放' },
				React.createElement('div', { className: 'ct-preview-pager__group-body' },
					React.createElement('button', {
						type: 'button',
						className: 'ct-preview-pager__icon-btn',
						'aria-label': '缩小',
						disabled: previewZoom <= PREVIEW_ZOOM_STEPS[0],
						onClick: function () { stepPreviewZoom(-1); },
					}, previewPagerIcon('zoomOut')),
					React.createElement(Select, {
						className: 'ct-preview-zoom-select vm-focus-border',
						size: 'small',
						value: previewZoom,
						onChange: setPreviewZoom,
						'aria-label': '预览缩放比例',
						options: PREVIEW_ZOOM_STEPS.map(function (value) {
							return { value: value, label: value + '%' };
						}),
					}),
					React.createElement('button', {
						type: 'button',
						className: 'ct-preview-pager__icon-btn',
						'aria-label': '放大',
						disabled: previewZoom >= PREVIEW_ZOOM_STEPS[PREVIEW_ZOOM_STEPS.length - 1],
						onClick: function () { stepPreviewZoom(1); },
					}, previewPagerIcon('zoomIn')),
				),
			),
		),
		React.createElement('div', {
			className: 'ct-preview-toolbar__row ct-preview-toolbar__row--secondary ct-preview-pager',
			role: 'toolbar',
			'aria-label': '合同预览工具栏',
		},
			React.createElement('div', { className: 'ct-preview-pager__group', role: 'group', 'aria-label': '翻页' },
				React.createElement('span', { className: 'ct-preview-pager__group-label' }, '翻页'),
				React.createElement('div', { className: 'ct-preview-pager__group-body' },
					React.createElement('button', {
						type: 'button',
						className: 'vm-btn vm-btn-secondary ct-preview-pager__btn',
						'data-vm-icon': 'chevron-left',
						disabled: pageIdx <= 0,
						onClick: function () { setPageIdx(Math.max(0, pageIdx - 1)); },
					}, '上一页'),
					React.createElement('span', { className: 'ct-preview-pager__page', 'aria-live': 'polite' },
						React.createElement('span', { className: 'ct-preview-pager__page-current' }, pageIdx + 1),
						' / ',
						React.createElement('span', { className: 'ct-preview-pager__page-total' }, baselinePages.length),
					),
					React.createElement('button', {
						type: 'button',
						className: 'vm-btn vm-btn-secondary ct-preview-pager__btn',
						'data-vm-icon': 'chevron-right',
						disabled: pageIdx >= baselinePages.length - 1,
						onClick: function () { setPageIdx(Math.min(baselinePages.length - 1, pageIdx + 1)); },
					}, '下一页'),
				),
			),
			React.createElement('div', { className: 'ct-preview-pager__group ct-preview-pager__group--view', role: 'group', 'aria-label': '视图' },
				React.createElement('span', { className: 'ct-preview-pager__group-label' }, '视图'),
				React.createElement('div', { className: 'ct-preview-pager__segmented', role: 'group', 'aria-label': '预览视图模式' },
					React.createElement('button', {
						type: 'button',
						className: 'ct-preview-pager__segment' + (viewMode === 'scroll' ? ' is-active' : ''),
						'aria-pressed': viewMode === 'scroll',
						onClick: function () { setViewMode('scroll'); },
					}, '连续预览'),
					React.createElement('button', {
						type: 'button',
						className: 'ct-preview-pager__segment' + (viewMode === 'single' ? ' is-active' : ''),
						'aria-pressed': viewMode === 'single',
						onClick: function () { setViewMode('single'); },
					}, '单页预览'),
				),
			),
			editable
				? React.createElement(PreviewClauseChangeRecordTrigger, { records: clauseRecords })
				: null,
		),
	);

	function renderPageBody(pageHtml, i) {
		if (editable) {
			return React.createElement(EditablePreviewPageBody, {
				key: 'body-' + i + '-' + String(html || '').length,
				pageIndex: i,
				initialHtml: baselinePages[i],
				onInput: handlePageInput,
			});
		}
		return React.createElement('div', {
			key: 'body-' + i,
			className: 'ct-preview-page__body ct-word-doc',
			dangerouslySetInnerHTML: { __html: pageHtml },
		});
	}

	var pagesContent = viewMode === 'single'
		? React.createElement('div', { className: 'ct-preview-page', key: pageIdx },
			renderPageBody(baselinePages[pageIdx], pageIdx),
			React.createElement('div', { className: 'ct-preview-page__footer' }, '— ', pageIdx + 1, ' —'),
		)
		: baselinePages.map(function (pageHtml, i) {
			return React.createElement('div', { className: 'ct-preview-page', key: 'p-' + i },
				renderPageBody(pageHtml, i),
				React.createElement('div', { className: 'ct-preview-page__footer' }, '— ', i + 1, ' —'),
			);
		});

	return React.createElement('div', { className: 'ct-preview-doc ct-word-doc ct-word-paginated' + (editable ? ' lc-preview-doc--editable' : '') },
		previewToolbar,
		React.createElement('div', { className: 'ct-preview-body-shell' },
			React.createElement('div', { className: 'ct-preview-pages-wrap' },
				React.createElement('div', {
					className: 'ct-preview-pages',
					style: { zoom: previewZoom / 100 },
				}, pagesContent),
			),
		),
	);
}
