// 【重要】必须使用 const Component 作为组件变量名
// 车辆业务 - 新增备车（ONEOS运管平台，布局参照新增租赁合同）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Switch = antd.Switch;
	var Drawer = antd.Drawer;
	var Table = antd.Table;
	var message = antd.message;
	var Modal = antd.Modal;
	var Space = antd.Space;

	// 车牌管理 mock：车牌号及对应车辆信息、后装设备（车身广告、尾板）
	var plateManageList = [
		{ plateNo: '京A12345', vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', bodyAd: true, tailboard: true },
		{ plateNo: '京C11111', vehicleType: '平板货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', bodyAd: false, tailboard: false },
		{ plateNo: '京D22222', vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M8888888', bodyAd: true, tailboard: false },
		{ plateNo: '京E33333', vehicleType: '栏板货车', brand: '重汽', model: 'ZZ1180', vin: 'LGHXCAE28M7777777', bodyAd: false, tailboard: true },
		{ plateNo: '京F10001', vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M9990001', bodyAd: true, tailboard: true }
	];

	// 备车检查单：类别 -> 检查项目列表（与需求 2.11.1、2.11.2 一致）
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

	var formState = useState({
		plateNo: '',
		vehicleType: '',
		brand: '',
		model: '',
		vin: '',
		bodyAd: true,
		adPhotos: [],           // 广告照片，最多1张
		enlargePhotos: [],       // 放大字照片，最多1张
		tailboard: false,
		spareTirePhotos: [],     // 备胎照片，最多1张
		spareTireTreadDepth: '', // 备胎胎纹深度，OCR反写可改
		flawPhotos: [],          // 瑕疵，最多4张
		inspectionList: buildInspectionList()
	});
	var form = formState[0];
	var setForm = formState[1];

	var drawerOpenState = useState(false);
	var photoPreviewState = useState({ open: false, url: null });
	var reqDocOpenState = useState(false);
	var adPhotoInputRef = useRef(null);
	var enlargePhotoInputRef = useRef(null);
	var spareTirePhotoInputRef = useRef(null);
	var flawPhotoInputRef = useRef(null);
	// 备胎照片 OCR 弹窗：识别中 -> 左侧照片、右侧胎纹深度输入、确认反写
	var spareTireOcrModalState = useState({ open: false, tempUrl: null, tempDepth: '', phase: 'recognizing' });
	var spareTireOcrPhaseRef = useRef(null);
	var plateOptions = useMemo(function () {
		return plateManageList.map(function (p) { return { value: p.plateNo, label: p.plateNo }; });
	}, []);

	var onPlateSelect = useCallback(function (plateNo) {
		var vehicle = plateManageList.find(function (p) { return p.plateNo === plateNo; });
		if (!vehicle) return;
		setForm(function (prev) {
			var next = {};
			for (var k in prev) next[k] = prev[k];
			next.plateNo = vehicle.plateNo;
			next.vehicleType = vehicle.vehicleType || '';
			next.brand = vehicle.brand || '';
			next.model = vehicle.model || '';
			next.vin = vehicle.vin || '';
			next.bodyAd = !!vehicle.bodyAd;
			next.tailboard = !!vehicle.tailboard;
			return next;
		});
	}, []);

	var updateInspection = useCallback(function (index, field, value) {
		setForm(function (prev) {
			var n = {};
			for (var k in prev) n[k] = prev[k];
			var list = (prev.inspectionList || []).slice();
			var row = list[index] || {};
			list[index] = Object.assign({}, row, { [field]: value });
			n.inspectionList = list;
			return n;
		});
	}, []);

	// 广告照片：最多1张
	var addAdPhoto = useCallback(function () {
		if ((form.adPhotos || []).length >= 1) { message.warning('最多上传1张'); return; }
		if (adPhotoInputRef.current) adPhotoInputRef.current.click();
	}, [form.adPhotos]);
	var onAdPhotoFileChange = useCallback(function (e) {
		var files = e.target.files;
		if (!files || files.length === 0) return;
		var file = files[0];
		if (!file || file.type.indexOf('image') === -1) { e.target.value = ''; return; }
		var url = URL.createObjectURL(file);
		setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.adPhotos = [url]; return n; });
		e.target.value = '';
	}, []);
	var removeAdPhoto = useCallback(function () {
		setForm(function (p) {
			var n = {}; for (var k in p) n[k] = p[k];
			var arr = (p.adPhotos || [])[0];
			if (arr && typeof arr === 'string' && arr.indexOf('blob:') === 0) URL.revokeObjectURL(arr);
			n.adPhotos = [];
			return n;
		});
	}, []);
	// 放大字照片：最多1张
	var addEnlargePhoto = useCallback(function () {
		if ((form.enlargePhotos || []).length >= 1) { message.warning('最多上传1张'); return; }
		if (enlargePhotoInputRef.current) enlargePhotoInputRef.current.click();
	}, [form.enlargePhotos]);
	var onEnlargePhotoFileChange = useCallback(function (e) {
		var files = e.target.files;
		if (!files || files.length === 0) return;
		var file = files[0];
		if (!file || file.type.indexOf('image') === -1) { e.target.value = ''; return; }
		var url = URL.createObjectURL(file);
		setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.enlargePhotos = [url]; return n; });
		e.target.value = '';
	}, []);
	var removeEnlargePhoto = useCallback(function () {
		setForm(function (p) {
			var n = {}; for (var k in p) n[k] = p[k];
			var u = (p.enlargePhotos || [])[0];
			if (u && typeof u === 'string' && u.indexOf('blob:') === 0) URL.revokeObjectURL(u);
			n.enlargePhotos = [];
			return n;
		});
	}, []);
	// 备胎照片：上传后弹窗识别，确认反写至备胎胎纹深度
	var addSpareTirePhoto = useCallback(function () {
		if ((form.spareTirePhotos || []).length >= 1) { message.warning('最多上传1张'); return; }
		if (spareTirePhotoInputRef.current) spareTirePhotoInputRef.current.click();
	}, [form.spareTirePhotos]);
	var onSpareTirePhotoFileChange = useCallback(function (e) {
		var files = e.target.files;
		if (!files || files.length === 0) return;
		var file = files[0];
		if (!file || file.type.indexOf('image') === -1) { e.target.value = ''; return; }
		var url = URL.createObjectURL(file);
		spareTireOcrModalState[1]({ open: true, tempUrl: url, tempDepth: '', phase: 'recognizing' });
		e.target.value = '';
	}, []);
	useEffect(function () {
		var s = spareTireOcrModalState[0];
		if (!s.open || s.phase !== 'recognizing') return;
		if (spareTireOcrPhaseRef.current) clearTimeout(spareTireOcrPhaseRef.current);
		spareTireOcrPhaseRef.current = setTimeout(function () {
			spareTireOcrModalState[1](function (prev) {
				return prev.open ? { open: true, tempUrl: prev.tempUrl, tempDepth: '5.2', phase: 'result' } : prev;
			});
		}, 1500);
		return function () {
			if (spareTireOcrPhaseRef.current) clearTimeout(spareTireOcrPhaseRef.current);
		};
	}, [spareTireOcrModalState[0].open, spareTireOcrModalState[0].phase]);
	var confirmSpareTireOcr = useCallback(function () {
		var s = spareTireOcrModalState[0];
		var depth = (s.tempDepth || '').trim();
		setForm(function (p) {
			var n = {}; for (var k in p) n[k] = p[k];
			n.spareTireTreadDepth = depth;
			n.spareTirePhotos = s.tempUrl ? [s.tempUrl] : [];
			return n;
		});
		spareTireOcrModalState[1]({ open: false, tempUrl: null, tempDepth: '', phase: 'recognizing' });
	}, []);
	var closeSpareTireOcrWithoutSave = useCallback(function () {
		var s = spareTireOcrModalState[0];
		if (s.tempUrl && s.tempUrl.indexOf('blob:') === 0) URL.revokeObjectURL(s.tempUrl);
		spareTireOcrModalState[1]({ open: false, tempUrl: null, tempDepth: '', phase: 'recognizing' });
	}, []);
	var setSpareTireOcrDepth = useCallback(function (v) {
		spareTireOcrModalState[1](function (prev) { return { open: prev.open, tempUrl: prev.tempUrl, tempDepth: v, phase: prev.phase }; });
	}, []);
	var removeSpareTirePhoto = useCallback(function () {
		setForm(function (p) {
			var n = {}; for (var k in p) n[k] = p[k];
			var u = (p.spareTirePhotos || [])[0];
			if (u && typeof u === 'string' && u.indexOf('blob:') === 0) URL.revokeObjectURL(u);
			n.spareTirePhotos = []; return n;
		});
	}, []);
	var addFlawPhoto = useCallback(function () {
		if ((form.flawPhotos || []).length >= 4) { message.warning('最多上传4张'); return; }
		if (flawPhotoInputRef.current) flawPhotoInputRef.current.click();
	}, [form.flawPhotos]);
	var onFlawPhotoFileChange = useCallback(function (e) {
		var files = e.target.files;
		if (!files || files.length === 0) return;
		setForm(function (p) {
			var current = p.flawPhotos || [];
			var remain = 4 - current.length;
			if (remain <= 0) return p;
			var urls = [];
			for (var i = 0; i < files.length && urls.length < remain; i++) {
				if (files[i].type.indexOf('image') !== -1) urls.push(URL.createObjectURL(files[i]));
			}
			if (urls.length === 0) return p;
			var n = {}; for (var k in p) n[k] = p[k]; n.flawPhotos = current.concat(urls); return n;
		});
		e.target.value = '';
	}, []);
	var removeFlawPhoto = useCallback(function (idx) {
		setForm(function (p) {
			var n = {};
			for (var k in p) n[k] = p[k];
			var arr = (p.flawPhotos || []).slice();
			var url = arr[idx];
			if (url && url.indexOf('blob:') === 0) URL.revokeObjectURL(url);
			arr.splice(idx, 1);
			n.flawPhotos = arr;
			return n;
		});
	}, []);

	function validateForm() {
		if (!form.plateNo) { message.warning('请选择车牌号'); return false; }
		if (form.bodyAd && (!form.adPhotos || form.adPhotos.length < 1)) { message.warning('请上传广告照片'); return false; }
		if (form.bodyAd && (!form.enlargePhotos || form.enlargePhotos.length < 1)) { message.warning('请上传放大字照片'); return false; }
		if (!form.spareTirePhotos || form.spareTirePhotos.length < 1) { message.warning('请上传备胎照片'); return false; }
		if (!String(form.spareTireTreadDepth || '').trim()) { message.warning('请填写备胎胎纹深度'); return false; }
		var list = form.inspectionList || [];
		for (var i = 0; i < list.length; i++) {
			if (list[i].category === '轮胎' && !String(list[i].treadDepth || '').trim()) {
				message.warning('请完善备车检查单：填写轮胎胎纹深度');
				return false;
			}
			if (!String(list[i].remark || '').trim()) {
				message.warning('请完善备车检查单：所有项备注为必填');
				return false;
			}
		}
		return true;
	}
	var handleSubmit = useCallback(function () {
		if (!validateForm()) return;
		message.success('备车成功');
		// 保存数据并跳转至备车管理-已完成（实际项目接路由）
		if (typeof window !== 'undefined' && window.history) window.history.back();
	}, [form.plateNo, form.spareTirePhotos, form.spareTireTreadDepth, form.inspectionList]);
	var handleSave = useCallback(function () {
		if (!validateForm()) return;
		message.success('暂存成功');
		// 保存数据并跳转至备车管理-待提交
		if (typeof window !== 'undefined' && window.history) window.history.back();
	}, [form.plateNo, form.spareTirePhotos, form.spareTireTreadDepth, form.inspectionList]);
	var handleCancel = useCallback(function () {
		if (typeof window !== 'undefined' && window.history) window.history.back();
		else message.info('取消');
	}, []);

	// 布局样式（参照新增租赁合同）
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
			render: function (_, record, index) {
				if (record.category === '轮胎') {
					return React.createElement(Input, {
						value: record.treadDepth,
						onChange: function (e) { updateInspection(index, 'treadDepth', e.target.value); },
						placeholder: '请输入胎纹深度',
						style: { width: '100%' }
					});
				}
				return React.createElement(Switch, {
					checked: record.checked !== false,
					checkedChildren: '正常',
					unCheckedChildren: '异常',
					onChange: function (checked) { updateInspection(index, 'checked', checked); }
				});
			}
		},
		{
			title: '备注',
			dataIndex: 'remark',
			key: 'remark',
			render: function (val, record, index) {
				return React.createElement(Input, {
					value: val,
					onChange: function (e) { updateInspection(index, 'remark', e.target.value); },
					placeholder: '必填'
				});
			}
		}
	];

	// 方形拍照图标（广告照片与瑕疵共用）
	var cameraIconBox = function (onClick) {
		return React.createElement('div', {
			role: 'button',
			tabIndex: 0,
			onClick: onClick,
			style: { width: 64, height: 64, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', boxSizing: 'border-box' }
		}, React.createElement('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: '#999', strokeWidth: 2 },
			React.createElement('path', { d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' }),
			React.createElement('circle', { cx: 12, cy: 13, r: 4 })
		));
	};

	var requirementDocContent = '新增备车\n一个「数字化资产ONEOS运管平台」中的「新增」模块\n1.面包屑：\n1.1.运维管理-车辆业务-备车管理-新增\n\n2.表单：\n2.1.车牌号：必选项，选择器，支持从输入框内输入内容进行模糊搜索，默认拉取「车牌管理」中所有「车牌号」；\n2.2.车辆类型：输入框禁用，选择车牌号后自动拉取该车牌号对应「车辆类型」；\n2.3.品牌：输入框禁用，选择车牌号后自动拉取该车牌号对应「品牌」；\n2.4.型号：输入框禁用，选择车牌号后自动拉取该车牌号对应「型号」\n2.5.车辆识别代码：输入框禁用，选择车牌号后自动拉取该车牌号「车辆识别代码」；\n2.6.车身广告及放大字：开关，选择车辆后拉取该车辆「后装设备」「车身广告」，如果该车辆有「车身广告」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「车身广告」中，安装时间以该条备车记录提交成功为准；\n2.7.广告照片：图片上传，最多支持上传1张图片，支持主流照片格式。上传后，上传按钮切换为显示已上传图片缩略图，支持点击预览和删除，删除后，切换为上传按钮；\n2.8.放大字照片：图片上传，最多支持上传1张图片，支持主流照片格式。上传后，上传按钮切换为显示已上传图片缩略图，支持点击预览和删除，删除后，切换为上传按钮；\n2.8.尾板：开关，选择车辆后拉取该车辆「后装设备」「尾板」，如果该车辆有「尾板」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「尾板」中，安装时间以该条备车记录提交成功为准；\n2.9.备胎照片：图片上传，最多支持上传1张图片，支持主流照片格式。上传时弹出卡片，提示正在识别中，请勿关闭页面，之后卡片左侧显示备胎照片，右侧输入框显示识别出的胎纹深度，后缀单位为mm，点击卡片中确认按钮，反写至备胎胎纹深度字段下；\n2.10.备胎胎纹深度：输入框，反写备胎照片OCR识别胎纹深度结果，支持修改；\n2.11.瑕疵：图片上传，最多支持上传4张图片，支持主流照片格式。上传后，上传按钮后方横排显示已上传图片缩略图，支持点击预览和删除；\n2.12.车辆检查：按钮，文字为备车检查单，点击右侧展开抽屉，抽屉内显示列表，字段为类别、检查项目、选择、备注；\n     2.11.1.类别：分为车灯、仪表盘、驾驶室、轮胎、液位检查、外观检查、车辆外观、其他、随车工具、随车证件、整车、燃料电池系统、冷机、制动系统；\n     2.11.2.检查项目：车灯类别对应（大灯、转向灯、小灯、示廓灯、刹车灯、倒车灯、牌照灯、防雾灯、室内灯）、仪表盘对应（氢系统指示、电控系统指示、数值清晰准确、故障报警灯）、驾驶室对应（点烟器、车窗升降、按键开关、雨刮器、内后视镜是否正常、内/外门把手、安全带、空调冷暖风、仪表盘、门锁功能、手刹、车钥匙功能是否正常、喇叭、音响功能、遮阳板、主副驾座椅、方向盘、内饰干净整洁）\n     2.11.3.检查情况：其他项为开关，在检查项目每项后方显示，默认为开，可手动进行关闭，轮胎为输入框，提示请输入胎纹深度；\n     2.11.4.备注：输入框；\n2.12.下方为提交和保存；\n     2.12.1.提交：点击提交，toast提示：备车成功，同时保存该条数据并跳转至「备车管理」「已完成」；\n     2.12.2.保存：点击保存，toast提示：暂存成功，同时保存该条数据并跳转至「备车管理」「待提交」；';

	var breadcrumbNodes = [
		React.createElement('span', { key: '1' }, '运维管理'),
		React.createElement('span', { key: '2', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '3' }, '车辆业务'),
		React.createElement('span', { key: '4', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '5' }, '备车管理'),
		React.createElement('span', { key: '6', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '7', style: { color: '#1890ff' } }, '新增')
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
						React.createElement(Select, {
							placeholder: '请选择或输入车牌号',
							style: { width: '100%' },
							value: form.plateNo || undefined,
							onChange: onPlateSelect,
							showSearch: true,
							allowClear: true,
							optionFilterProp: 'label',
							filterOption: function (input, opt) {
								return (opt && opt.label && String(opt.label).toLowerCase().indexOf((input || '').toLowerCase()) >= 0);
							},
							options: plateOptions
						})
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
					React.createElement(FormItem, { label: '车身广告及放大字', required: true },
						React.createElement(Switch, {
							checked: form.bodyAd,
							checkedChildren: '有',
							unCheckedChildren: '无',
							onChange: function (checked) {
								setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.bodyAd = checked; return n; });
							}
						})
					),
					form.bodyAd ? React.createElement(FormItem, { label: '广告照片', required: true },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							React.createElement('input', { type: 'file', ref: adPhotoInputRef, accept: 'image/*', style: { display: 'none' }, onChange: onAdPhotoFileChange }),
							(form.adPhotos || []).length < 1 ? cameraIconBox(addAdPhoto) : null,
							(form.adPhotos || []).map(function (url, i) {
								return React.createElement('span', { key: i, style: { position: 'relative', display: 'inline-block' } },
									React.createElement('img', {
										src: url,
										alt: '',
										style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
										onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
									}),
									React.createElement('span', {
										style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
										onClick: function () { removeAdPhoto(); }
									}, '×')
								);
							})
						)
					) : null,
					form.bodyAd ? React.createElement(FormItem, { label: '放大字照片', required: true },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							React.createElement('input', { type: 'file', ref: enlargePhotoInputRef, accept: 'image/*', style: { display: 'none' }, onChange: onEnlargePhotoFileChange }),
							(form.enlargePhotos || []).length < 1 ? cameraIconBox(addEnlargePhoto) : null,
							(form.enlargePhotos || []).map(function (url, i) {
								return React.createElement('span', { key: i, style: { position: 'relative', display: 'inline-block' } },
									React.createElement('img', {
										src: url,
										alt: '',
										style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
										onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
									}),
									React.createElement('span', {
										style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
										onClick: function () { removeEnlargePhoto(); }
									}, '×')
								);
							})
						)
					) : null
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '尾板', required: true },
						React.createElement(Switch, {
							checked: form.tailboard,
							checkedChildren: '有',
							unCheckedChildren: '无',
							onChange: function (checked) {
								setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.tailboard = checked; return n; });
							}
						})
					),
					React.createElement(FormItem, { label: '备胎照片', required: true },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							React.createElement('input', { type: 'file', ref: spareTirePhotoInputRef, accept: 'image/*', style: { display: 'none' }, onChange: onSpareTirePhotoFileChange }),
							(form.spareTirePhotos || []).length < 1 ? cameraIconBox(addSpareTirePhoto) : null,
							(form.spareTirePhotos || []).map(function (url, i) {
								return React.createElement('span', { key: i, style: { position: 'relative', display: 'inline-block' } },
									React.createElement('img', {
										src: url,
										alt: '',
										style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
										onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
									}),
									React.createElement('span', {
										style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
										onClick: function () { removeSpareTirePhoto(); }
									}, '×')
								);
							})
						)
					),
					React.createElement(FormItem, { label: '备胎胎纹深度', required: true },
						React.createElement(Input, {
							value: form.spareTireTreadDepth,
							onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.spareTireTreadDepth = e.target.value; return n; }); },
							placeholder: 'OCR识别结果可修改',
							style: { width: '100%' },
							addonAfter: 'mm'
						})
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '瑕疵', fullWidth: true },
						React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 } },
							React.createElement('input', { type: 'file', ref: flawPhotoInputRef, accept: 'image/*', multiple: true, style: { display: 'none' }, onChange: onFlawPhotoFileChange }),
							(form.flawPhotos || []).length < 4 ? cameraIconBox(addFlawPhoto) : null,
							(form.flawPhotos || []).map(function (url, i) {
								return React.createElement('span', { key: i, style: { position: 'relative', display: 'inline-block' } },
									React.createElement('img', {
										src: url,
										alt: '',
										style: { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
										onClick: function () { photoPreviewState[1]({ open: true, url: url }); }
									}),
									React.createElement('span', {
										style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
										onClick: function () { removeFlawPhoto(i); }
									}, '×')
								);
							})
						)
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车辆检查', fullWidth: true, required: true },
						React.createElement(Button, { type: 'default', onClick: function () { drawerOpenState[1](true); } }, '备车检查单')
					)
				)
			)
		),
		React.createElement('div', { style: styles.footer },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleSave }, '保存'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),
		React.createElement(Drawer, {
			title: '备车检查单',
			placement: 'right',
			width: 640,
			open: drawerOpenState[0],
			onClose: function () { drawerOpenState[1](false); },
			styles: { body: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
				React.createElement(Button, { onClick: function () { drawerOpenState[1](false); } }, '返回'),
				React.createElement(Button, { type: 'primary', onClick: function () { drawerOpenState[1](false); message.success('检查单已保存'); } }, '提交')
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
		spareTireOcrModalState[0].open
			? React.createElement(Modal, {
				title: '备胎照片识别',
				open: true,
				onCancel: spareTireOcrModalState[0].phase === 'result' ? closeSpareTireOcrWithoutSave : undefined,
				width: 560,
				maskClosable: spareTireOcrModalState[0].phase === 'result',
				footer: spareTireOcrModalState[0].phase === 'result'
					? React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: closeSpareTireOcrWithoutSave }, '取消'),
						React.createElement(Button, { type: 'primary', onClick: confirmSpareTireOcr }, '确认')
					)
					: null,
				closable: spareTireOcrModalState[0].phase === 'result'
			}, spareTireOcrModalState[0].phase === 'recognizing'
				? React.createElement('div', { style: { padding: '24px 0', textAlign: 'center', fontSize: 15, color: '#666' } }, '正在识别中，请勿关闭页面')
				: React.createElement('div', { style: { display: 'flex', gap: 24, alignItems: 'flex-start' } },
					React.createElement('div', { style: { flex: '0 0 200px' } },
						React.createElement('img', { src: spareTireOcrModalState[0].tempUrl, alt: '', style: { width: '100%', display: 'block', borderRadius: 4 } })
					),
					React.createElement('div', { style: { flex: 1 } },
						React.createElement('div', { style: { marginBottom: 8, color: '#333' } }, '识别胎纹深度（mm）'),
						React.createElement(Input, {
							value: spareTireOcrModalState[0].tempDepth,
							onChange: function (e) { setSpareTireOcrDepth(e.target.value); },
							placeholder: '请输入',
							addonAfter: 'mm',
							style: { width: '100%', maxWidth: 160 }
						})
					)
				)
			)
			: null,
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
