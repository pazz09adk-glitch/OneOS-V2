// 【重要】必须使用 const Component 作为组件变量名
// 车辆业务 - 查看备车（与新增备车相同布局，全部只读）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Button = antd.Button;
	var Drawer = antd.Drawer;
	var Table = antd.Table;
	var Modal = antd.Modal;

	var plateManageList = [
		{ plateNo: '京A12345', vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', bodyAd: true, tailboard: true },
		{ plateNo: '京C11111', vehicleType: '平板货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', bodyAd: false, tailboard: false },
		{ plateNo: '京D22222', vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M8888888', bodyAd: true, tailboard: false },
		{ plateNo: '京E33333', vehicleType: '栏板货车', brand: '重汽', model: 'ZZ1180', vin: 'LGHXCAE28M7777777', bodyAd: false, tailboard: true },
		{ plateNo: '京F10001', vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M9990001', bodyAd: true, tailboard: true }
	];

	var inspectionCategoryItems = {
		'车灯': ['大灯', '转向灯', '小灯', '示廓灯', '刹车灯', '倒车灯', '牌照灯', '防雾灯', '室内灯'],
		'仪表盘': ['氢系统指示', '电控系统指示', '数值清晰准确', '故障报警灯'],
		'驾驶室': ['点烟器', '车窗升降', '按键开关', '雨刮器', '内后视镜是否正常', '内/外门把手', '安全带', '空调冷暖风', '仪表盘', '门锁功能', '手刹', '车钥匙功能是否正常', '喇叭', '音响功能', '遮阳板', '主副驾座椅', '方向盘', '内饰干净整洁'],
		'轮胎': ['前左胎', '前右胎', '后左胎', '后右胎'],
		'液位检查': ['冷却液', '制动液', '玻璃水'],
		'外观检查': ['车身外观', '漆面', '玻璃'],
		'车辆外观': ['整车外观'],
		'其他': ['其他检查项'],
		'随车工具': ['三角牌', '灭火器', '反光背心'],
		'随车证件': ['行驶证', '营运证', '保险单'],
		'整车': ['整车状态'],
		'燃料电池系统': ['氢系统', '储氢瓶'],
		'冷机': ['冷机运行'],
		'制动系统': ['制动踏板', '驻车制动']
	};

	function buildInspectionList() {
		var list = [];
		var categories = Object.keys(inspectionCategoryItems);
		for (var i = 0; i < categories.length; i++) {
			var cat = categories[i];
			var items = inspectionCategoryItems[cat];
			for (var j = 0; j < items.length; j++) {
				list.push({ category: cat, checkItem: items[j], checked: true, remark: '', treadDepth: '' });
			}
		}
		return list;
	}

	// 只读：一条已填写的备车记录（与新增备车字段一致，全部不可编辑）
	var form = useMemo(function () {
		return {
			plateNo: '京A12345',
			vehicleType: '厢式货车',
			brand: '东风',
			model: 'DFH1180',
			vin: 'LGHXCAE28M1234567',
			bodyAd: true,
			adPhotos: ['https://picsum.photos/200/150?r=1'],
			enlargePhotos: ['https://picsum.photos/200/150?r=2'],
			tailboard: true,
			spareTirePhotos: ['https://picsum.photos/200/150?r=3'],
			spareTireTreadDepth: '5.2',
			flawPhotos: ['https://picsum.photos/200/150?f=1'],
			inspectionList: buildInspectionList()
		};
	}, []);

	var drawerOpenState = useState(false);
	var photoPreviewState = useState({ open: false, url: null });
	var reqDocOpenState = useState(false);

	var styles = {
		page: { padding: '16px 24px 80px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontSize: 14 },
		breadcrumb: { marginBottom: 16, color: '#666' },
		breadcrumbSep: { margin: '0 8px', color: '#999' },
		card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
		cardBody: { padding: '20px 24px' },
		formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
		formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8, boxSizing: 'border-box' },
		formColFull: { flex: '0 0 100%', marginBottom: 8, boxSizing: 'border-box' },
		label: { display: 'block', marginBottom: 6, color: '#333' },
		labelRequired: { color: '#ff4d4f', marginRight: 4 },
		footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, zIndex: 99 }
	};

	var FormItem = function (props) {
		var colStyle = props.fullWidth ? styles.formColFull : styles.formCol;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: styles.label },
				props.required ? React.createElement('span', { style: styles.labelRequired }, '*') : null,
				props.label
			),
			props.children
		);
	};

	var inspectionList = form.inspectionList || [];
	var categoryRowSpans = useMemo(function () {
		var list = inspectionList;
		var spans = [];
		var i = 0;
		while (i < list.length) {
			var cat = list[i].category;
			var start = i;
			while (i < list.length && list[i].category === cat) i++;
			spans[start] = i - start;
			for (var j = start + 1; j < i; j++) spans[j] = 0;
		}
		return spans;
	}, [form.inspectionList]);

	var inspectionColumns = [
		{
			title: '类别',
			dataIndex: 'category',
			key: 'category',
			width: 120,
			onCell: function (_, index) { return { rowSpan: categoryRowSpans[index] !== undefined ? categoryRowSpans[index] : 1 }; }
		},
		{ title: '检查项目', dataIndex: 'checkItem', key: 'checkItem', width: 180 },
		{
			title: '检查情况',
			key: 'checked',
			width: 140,
			render: function (_, record) {
				if (record.category === '轮胎') return record.treadDepth ? record.treadDepth + ' mm' : '-';
				return record.checked !== false ? '正常' : '异常';
			}
		},
		{ title: '备注', dataIndex: 'remark', key: 'remark', render: function (val) { return val || '-'; } }
	];

	var requirementDocContent = '新增备车\n\n1.面包屑：\n1.1.运维管理-车辆业务-备车管理-新增备车\n\n2.表单：\n2.1.车牌号：必选项，选择器，支持从输入框内输入内容进行模糊搜索，默认拉取「车牌管理」中所有「车牌号」；\n2.2.车辆类型：输入框禁用，选择车牌号后自动拉取该车牌号对应「车辆类型」；\n2.3.品牌：输入框禁用，选择车牌号后自动拉取该车牌号对应「品牌」；\n2.4.型号：输入框禁用，选择车牌号后自动拉取该车牌号对应「型号」\n2.5.车辆识别代码：输入框禁用，选择车牌号后自动拉取该车牌号「车辆识别代码」；\n2.6.车身广告：开关，选择车辆后拉取该车辆「后装设备」「车身广告」，如果该车辆有「车身广告」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「车身广告」中，安装时间以该条备车记录提交成功为准；\n2.7.广告照片：图片上传，最多支持上传4张图片，支持主流照片格式。上传后，上传按钮后方横排显示已上传图片缩略图，支持点击预览和删除；\n2.8.尾板：开关，选择车辆后拉取该车辆「后装设备」「尾板」，如果该车辆有「尾板」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「尾板」中，安装时间以该条备车记录提交成功为准；\n2.9.是否有挂：输入框，提示信息为：请输入挂车牌号，不输入为无挂；\n2.10.瑕疵：图片上传，最多支持上传4张图片，支持主流照片格式。上传后，上传按钮后方横排显示已上传图片缩略图，支持点击预览和删除；\n2.11.车辆检查：按钮，文字为备车检查单，点击右侧展开抽屉，抽屉内显示列表，字段为类别、检查项目、选择、备注；\n     2.11.1.类别：分为车灯、仪表盘、驾驶室、轮胎、液位检查、外观检查、车辆外观、其他、随车工具、随车证件、整车、燃料电池系统、冷机、制动系统；\n     2.11.2.检查项目：车灯类别对应（大灯、转向灯、小灯、示廓灯、刹车灯、倒车灯、牌照灯、防雾灯、室内灯）、仪表盘对应（氢系统指示、电控系统指示、数值清晰准确、故障报警灯）、驾驶室对应（点烟器、车窗升降、按键开关、雨刮器、内后视镜是否正常、内/外门把手、安全带、空调冷暖风、仪表盘、门锁功能、手刹、车钥匙功能是否正常、喇叭、音响功能、遮阳板、主副驾座椅、方向盘、内饰干净整洁）\n     2.11.3.检查情况：开关，在检查项目每项后方显示，默认为开，可手动进行关闭；\n     2.11.4.备注：输入框；\n2.12.下方为提交和保存；\n     2.12.1.提交：点击提交，toast提示：备车成功，同时保存该条数据并跳转至「备车管理」「已完成」；\n     2.12.2.保存：点击保存，toast提示：暂存成功，同时保存该条数据并跳转至「备车管理」「待提交」；';

	var breadcrumbNodes = [
		React.createElement('span', { key: '1' }, '运维管理'),
		React.createElement('span', { key: '2', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '3' }, '车辆业务'),
		React.createElement('span', { key: '4', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '5' }, '备车管理'),
		React.createElement('span', { key: '6', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '7', style: { color: '#1890ff' } }, '查看备车')
	];

	return React.createElement('div', { style: styles.page },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement('div', { style: styles.breadcrumb }, breadcrumbNodes),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { reqDocOpenState[1](true); } }, '查看需求说明')
		),
		React.createElement('div', { style: styles.card },
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车牌号', required: true },
						React.createElement(Input, { value: form.plateNo, disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					React.createElement(FormItem, { label: '车辆类型' },
						React.createElement(Input, { value: form.vehicleType, disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					React.createElement(FormItem, { label: '品牌' },
						React.createElement(Input, { value: form.brand, disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					React.createElement(FormItem, { label: '型号' },
						React.createElement(Input, { value: form.model, disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					React.createElement(FormItem, { label: '车辆识别代码' },
						React.createElement(Input, { value: form.vin, disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车身广告及放大字' },
						React.createElement(Input, { value: form.bodyAd ? '有' : '无', disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					form.bodyAd ? React.createElement(FormItem, { label: '广告照片' },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							(form.adPhotos || []).map(function (url, i) {
								return React.createElement('img', {
									key: i,
									src: url,
									alt: '',
									style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
									onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
								});
							}),
							(form.adPhotos || []).length === 0 ? React.createElement('span', { style: { color: '#999' } }, '无') : null
						)
					) : null,
					form.bodyAd ? React.createElement(FormItem, { label: '放大字照片' },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							(form.enlargePhotos || []).map(function (url, i) {
								return React.createElement('img', {
									key: i,
									src: url,
									alt: '',
									style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
									onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
								});
							}),
							(form.enlargePhotos || []).length === 0 ? React.createElement('span', { style: { color: '#999' } }, '无') : null
						)
					) : null
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '尾板' },
						React.createElement(Input, { value: form.tailboard ? '有' : '无', disabled: true, style: { width: '100%', background: '#f5f5f5' } })
					),
					React.createElement(FormItem, { label: '备胎照片' },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							(form.spareTirePhotos || []).map(function (url, i) {
								return React.createElement('img', {
									key: i,
									src: url,
									alt: '',
									style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
									onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
								});
							}),
							(form.spareTirePhotos || []).length === 0 ? React.createElement('span', { style: { color: '#999' } }, '无') : null
						)
					),
					React.createElement(FormItem, { label: '备胎胎纹深度' },
						React.createElement(Input, { value: form.spareTireTreadDepth || '', disabled: true, style: { width: '100%', background: '#f5f5f5' }, addonAfter: 'mm' })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '瑕疵', fullWidth: true },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							(form.flawPhotos || []).map(function (url, i) {
								return React.createElement('img', {
									key: i,
									src: url,
									alt: '',
									style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
									onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
								});
							}),
							(form.flawPhotos || []).length === 0 ? React.createElement('span', { style: { color: '#999' } }, '无') : null
						)
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车辆检查', fullWidth: true },
						React.createElement(Button, { type: 'default', onClick: function () { drawerOpenState[1](true); } }, '备车检查单')
					)
				)
			)
		),
		React.createElement('div', { style: styles.footer },
			React.createElement(Button, { onClick: function () { if (typeof window !== 'undefined' && window.history) window.history.back(); } }, '返回')
		),
		React.createElement(Drawer, {
			title: '备车检查单',
			placement: 'right',
			width: 640,
			open: drawerOpenState[0],
			onClose: function () { drawerOpenState[1](false); },
			styles: { body: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
				React.createElement(Button, { onClick: function () { drawerOpenState[1](false); } }, '返回')
			)
		},
			React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto' } },
				React.createElement(Table, {
					columns: inspectionColumns,
					dataSource: form.inspectionList || [],
					rowKey: function (_, i) { return i; },
					pagination: false,
					size: 'small'
				})
			)
		),
		React.createElement(Modal, {
			title: '需求说明',
			open: reqDocOpenState[0],
			onCancel: function () { reqDocOpenState[1](false); },
			footer: null,
			width: 720,
			styles: { body: { maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8 } }
		}, requirementDocContent),
		photoPreviewState[0].open && photoPreviewState[0].url
			? React.createElement(Modal, {
				title: '预览',
				open: true,
				footer: null,
				onCancel: function () { photoPreviewState[1]({ open: false, url: null }); }
			}, React.createElement('img', { src: photoPreviewState[0].url, alt: '', style: { width: '100%' } }))
			: null
	);
};

if (typeof window !== 'undefined') {
	window.Component = Component;
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			var rootEl = document.getElementById('root');
			if (rootEl && window.ReactDOM && window.React) {
				var root = ReactDOM.createRoot(rootEl);
				root.render(React.createElement(Component));
			}
		});
	} else {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
}
