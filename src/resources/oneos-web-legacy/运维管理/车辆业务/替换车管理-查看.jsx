// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 替换车管理 - 查看

const Component = function () {
	var useState = React.useState;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Button = antd.Button;
	var Modal = antd.Modal;
	var Tag = antd.Tag;
	var Steps = antd.Steps;

	var EMPTY_PROJECT = {
		contractId: '',
		projectId: '',
		projectName: '',
		projectType: '',
		customerName: '',
		contractCode: '',
		deliveryRegion: ''
	};

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
		}
	];

	var MOCK_PAIRS = [
		{
			id: 'pair_1',
			replaceType: '永久替换',
			replaceReason: '车辆原因',
			replaceReasonDesc: '原车故障需维修，临时用替换车保障客户用车。',
			originalPlate: '浙A12345',
			originalBrand: '东风',
			originalModel: 'DFH1180',
			contractId: 'c1',
			replacePlate: '浙A67890',
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
			originalBrand: '重汽',
			originalModel: 'ZZ1160',
			contractId: 'c1',
			replacePlate: '浙A66666',
			replaceBrand: '江淮',
			replaceModel: 'HFC1190'
		}
	];

	var contractById = (function () {
		var map = {};
		activeContracts.forEach(function (c) { map[c.contractId] = c; });
		return map;
	})();

	var pairs = MOCK_PAIRS;
	var requirementModalVisible = useState(false);
	var setRequirementModalVisible = requirementModalVisible[1];

	var projectInfo = (function () {
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
	})();

	var approvalSteps = [
		{ title: '业务部主管', person: '姚守涛', status: 'finish', approveTime: '2026-02-20 09:30' },
		{ title: '事业部主管', person: '尚建华', status: 'finish', approveTime: '2026-02-20 10:15' },
		{ title: '运维主管', person: '王运维', status: 'finish', approveTime: '2026-02-20 11:00' }
	];

	var handleBack = function () {
		if (window.__replaceCarBack) window.__replaceCarBack();
		else antd.message.info('返回替换车管理列表（原型）');
	};

	var pageCss =
		'.vr-add-page{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}' +
		'.vr-add-page .vr-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}' +
		'.vr-add-page .vr-main-card{border-radius:16px;border:none;box-shadow:0 4px 24px -6px rgba(15,23,42,0.08),0 0 0 1px rgba(15,23,42,0.05)}' +
		'.vr-add-page .vr-main-card>.ant-card-head{border-bottom:1px solid #f1f5f9;padding:16px 24px;min-height:auto}' +
		'.vr-add-page .vr-main-card>.ant-card-head .ant-card-head-title{font-size:16px;font-weight:600;color:#0f172a;padding:0}' +
		'.vr-add-page .vr-main-card>.ant-card-body{padding:20px 24px 24px}' +
		'.vr-add-page .vr-approval-card{border-radius:16px;border:none;box-shadow:0 4px 24px -6px rgba(15,23,42,0.08),0 0 0 1px rgba(15,23,42,0.05);margin-top:16px}' +
		'.vr-add-page .vr-pair-list{display:flex;flex-direction:column;gap:16px}' +
		'.vr-add-page .vr-pair-card{border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;overflow:hidden}' +
		'.vr-add-page .vr-pair-card__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#f0f9ff;border-bottom:1px solid #e0f2fe}' +
		'.vr-add-page .vr-pair-card__title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#0f172a;flex-wrap:wrap}' +
		'.vr-add-page .vr-pair-card__arrow{display:inline-flex;align-items:center;justify-content:center;color:#1677ff;font-size:16px;font-weight:600;line-height:1;padding:0 2px;flex-shrink:0}' +
		'.vr-add-page .vr-pair-card__index{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 8px;border-radius:6px;background:#1677ff;color:#fff;font-size:12px;font-weight:700}' +
		'.vr-add-page .vr-pair-card__body{padding:16px}' +
		'.vr-add-page .vr-block{margin-bottom:14px}' +
		'.vr-add-page .vr-block:last-child{margin-bottom:0}' +
		'.vr-add-page .vr-block-label{font-size:12px;font-weight:600;color:#475569;margin-bottom:10px}' +
		'.vr-add-page .vr-block-label--new{color:#047857}' +
		'.vr-add-page .vr-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px}' +
		'.vr-add-page .vr-form-grid--reason .vr-field:last-child{grid-column:1/-1}' +
		'@media(max-width:900px){.vr-add-page .vr-form-grid{grid-template-columns:1fr}}' +
		'.vr-add-page .vr-field{display:flex;flex-direction:column;gap:6px;min-width:0}' +
		'.vr-add-page .vr-field__label{font-size:13px;font-weight:500;color:#334155}' +
		'.vr-add-page .vr-swap-divider{display:flex;align-items:center;gap:12px;margin:14px 0;color:#94a3b8;font-size:12px;font-weight:500}' +
		'.vr-add-page .vr-swap-divider::before,.vr-add-page .vr-swap-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,#cbd5e1,transparent)}' +
		'.vr-add-page .vr-swap-divider__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#eff6ff;color:#1677ff;font-size:14px}' +
		'.vr-add-page .vr-vehicle-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px;padding:12px 14px;margin-bottom:14px;border-radius:8px;background:#fffbeb;border:1px solid #fde68a}' +
		'.vr-add-page .vr-project-panel{margin-top:20px;padding:16px 18px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}' +
		'.vr-add-page .vr-project-panel__title{font-size:14px;font-weight:600;color:#0f172a;margin-bottom:14px}' +
		'.vr-add-page .vr-project-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 20px}' +
		'.vr-add-page .vr-readonly{display:flex;flex-direction:column;gap:4px}' +
		'.vr-add-page .vr-readonly__label{font-size:12px;color:#64748b;font-weight:500}' +
		'.vr-add-page .vr-readonly__value{font-size:14px;color:#0f172a;font-weight:500}' +
		'.vr-add-page .vr-footer{display:flex;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9}' +
		'.vr-req-doc{padding:4px 2px 8px}' +
		'.vr-req-doc__meta{font-size:12px;color:#64748b;line-height:1.6;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9}' +
		'.vr-req-doc__section{margin-bottom:20px}' +
		'.vr-req-doc__title{font-size:15px;font-weight:600;color:#0f172a;margin:0 0 10px}' +
		'.vr-req-doc__line{font-size:13px;color:#475569;line-height:1.75;margin:0 0 6px}' +
		'.vr-req-doc__line--sub{padding-left:14px;color:#64748b}';

	function specSection(title, lines) {
		return React.createElement(
			'section',
			{ className: 'vr-req-doc__section' },
			React.createElement('h3', { className: 'vr-req-doc__title' }, title),
			(lines || []).map(function (text, i) {
				var isSub = text.indexOf('　') === 0;
				return React.createElement('p', { key: i, className: 'vr-req-doc__line' + (isSub ? ' vr-req-doc__line--sub' : '') }, text);
			})
		);
	}

	function renderRequirementDoc() {
		return React.createElement(
			'div',
			{ className: 'vr-req-doc' },
			React.createElement('div', { className: 'vr-req-doc__meta' }, '数字化资产 ONEOS 运管平台 · 运维管理 · 车辆业务 · 替换车管理 · 查看'),
			specSection('1. 页面定位', ['只读查看替换车申请详情，布局与新增/编辑一致，不可修改任何字段。']),
			specSection('2. 展示内容', [
				'2.1 车辆替换明细：每条被替换车一张卡片，含被替换车信息、替换说明、替换车辆；卡片标题展示被替换与替换车牌；替换原因为「客户原因」时展示替换费用（只读）。',
				'2.2 项目信息：客户名称、项目名称、项目类型（全单一份）。',
				'2.3 审批情况：竖向步骤条展示审批节点、审批人、审批时间。'
			]),
			specSection('3. 操作', ['底部仅「返回」按钮，返回替换车管理列表。'])
		);
	}

	function renderField(label, node) {
		return React.createElement(
			'div',
			{ className: 'vr-field' },
			React.createElement('div', { className: 'vr-field__label' }, label),
			node
		);
	}

	function renderPairCard(pair, index) {
		return React.createElement(
			'article',
			{ key: pair.id, className: 'vr-pair-card' },
			React.createElement(
				'div',
				{ className: 'vr-pair-card__head' },
				React.createElement(
					'div',
					{ className: 'vr-pair-card__title' },
					React.createElement('span', { className: 'vr-pair-card__index' }, index + 1),
					React.createElement('span', null, '车辆替换'),
					React.createElement(Tag, { style: { margin: 0 } }, pair.originalPlate),
					pair.replacePlate
						? React.createElement('span', { className: 'vr-pair-card__arrow', 'aria-hidden': true }, '→')
						: null,
					pair.replacePlate
						? React.createElement(Tag, { color: 'processing', style: { margin: 0 } }, pair.replacePlate)
						: null
				)
			),
			React.createElement(
				'div',
				{ className: 'vr-pair-card__body' },
				React.createElement(
					'div',
					{ className: 'vr-vehicle-summary' },
					renderField('车牌号', React.createElement(Input, { value: pair.originalPlate, disabled: true })),
					renderField('品牌', React.createElement(Input, { value: pair.originalBrand, disabled: true })),
					renderField('型号', React.createElement(Input, { value: pair.originalModel, disabled: true }))
				),
				React.createElement(
					'div',
					{ className: 'vr-block' },
					React.createElement('div', { className: 'vr-block-label' }, '替换说明'),
					React.createElement(
						'div',
						{ className: 'vr-form-grid vr-form-grid--reason' },
						renderField('替换类型', React.createElement(Input, { value: pair.replaceType, disabled: true })),
						renderField('替换原因', React.createElement(Input, { value: pair.replaceReason, disabled: true })),
						pair.replaceReason === '客户原因'
							? renderField(
								'替换费用',
								React.createElement(Input, {
									value: pair.replaceFee ? '￥' + pair.replaceFee : '—',
									disabled: true
								})
							)
							: null,
						renderField(
							'替换原因说明',
							React.createElement(Input.TextArea, {
								value: pair.replaceReasonDesc || '—',
								disabled: true,
								rows: 2,
								style: { width: '100%' }
							})
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'vr-swap-divider' },
					React.createElement('span', { className: 'vr-swap-divider__icon' }, '↓'),
					React.createElement('span', null, '替换为')
				),
				React.createElement(
					'div',
					{ className: 'vr-block' },
					React.createElement('div', { className: 'vr-block-label vr-block-label--new' }, '替换车辆'),
					React.createElement(
						'div',
						{ className: 'vr-form-grid' },
						renderField('新车', React.createElement(Input, { value: pair.replacePlate, disabled: true })),
						renderField('品牌', React.createElement(Input, { value: pair.replaceBrand, disabled: true })),
						renderField('型号', React.createElement(Input, { value: pair.replaceModel, disabled: true }))
					)
				)
			)
		);
	}

	function renderProjectPanel() {
		return React.createElement(
			'section',
			{ className: 'vr-project-panel' },
			React.createElement('div', { className: 'vr-project-panel__title' }, '项目信息'),
			React.createElement(
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
						React.createElement(Tag, { color: projectInfo.projectType === '自营' ? 'purple' : 'blue', style: { margin: 0 } }, projectInfo.projectType)
					)
				)
			)
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
					{ title: '查看' }
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
					'查看替换车 ',
					React.createElement(Tag, { style: { marginLeft: 8, fontWeight: 400 } }, pairs.length + ' 辆车')
				)
			},
			React.createElement('div', { className: 'vr-pair-list' }, pairs.map(function (pair, index) { return renderPairCard(pair, index); })),
			renderProjectPanel(),
			React.createElement('div', { className: 'vr-footer' }, React.createElement(Button, { size: 'large', onClick: handleBack }, '返回'))
		),
		React.createElement(
			Card,
			{ className: 'vr-approval-card', title: '审批情况' },
			React.createElement(Steps, {
				direction: 'vertical',
				current: approvalSteps.length,
				items: approvalSteps.map(function (s) {
					return {
						title: s.title,
						status: s.status === 'finish' ? 'finish' : 'wait',
						description: React.createElement(
							'div',
							{ style: { fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 4 } },
							React.createElement('div', null, '审批状态：', s.status === 'finish' ? '审批通过' : '待审批'),
							React.createElement('div', null, '审批人：', s.person || '—'),
							s.approveTime ? React.createElement('div', null, '审批时间：', s.approveTime) : null
						)
					};
				})
			})
		),
		React.createElement(Modal, {
			title: '替换车管理 - 查看 · 需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { setRequirementModalVisible(false); },
			width: 760,
			footer: React.createElement(Button, { type: 'primary', onClick: function () { setRequirementModalVisible(false); } }, '关闭'),
			bodyStyle: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 }
		}, renderRequirementDoc())
	);
};
