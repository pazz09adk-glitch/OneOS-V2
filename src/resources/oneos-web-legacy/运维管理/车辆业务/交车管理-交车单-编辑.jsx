// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 交车管理 - 交车单 - 编辑

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Switch = antd.Switch;
	var Modal = antd.Modal;
	var Drawer = antd.Drawer;
	var message = antd.message;

	var TextArea = Input.TextArea;

	// ---------- utils ----------
	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#f5222d', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
	}

	function toFixed2(v) {
		if (v === null || v === undefined || v === '') return '';
		var n = typeof v === 'number' ? v : parseFloat(v);
		return isNaN(n) ? '' : n.toFixed(2);
	}

	function isEmpty(v) {
		return v === null || v === undefined || String(v).trim() === '';
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fileToDataUrl(file, cb) {
		try {
			var reader = new FileReader();
			reader.onload = function (e) { cb(null, (e && e.target && e.target.result) || ''); };
			reader.onerror = function () { cb(new Error('read error')); };
			reader.readAsDataURL(file);
		} catch (e) {
			cb(e);
		}
	}

	function makeThumb(url, onPreview, onRemove, disabled) {
		return React.createElement('div', {
			style: {
				width: 64,
				height: 64,
				borderRadius: 4,
				border: '1px solid #f0f0f0',
				background: '#fafafa',
				position: 'relative',
				overflow: 'hidden'
			}
		},
			React.createElement('img', {
				src: url,
				style: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' },
				onClick: disabled ? undefined : onPreview
			}),
			(disabled || !onRemove) ? null : React.createElement('div', {
				style: {
					position: 'absolute',
					right: 6,
					top: 6,
					width: 20,
					height: 20,
					borderRadius: 999,
					background: 'rgba(0,0,0,0.55)',
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					fontSize: 12,
					userSelect: 'none'
				},
				onClick: function (e) { e.stopPropagation(); onRemove && onRemove(); }
			}, '×')
		);
	}

	function UploadBox(props) {
		var label = props.label;
		var value = props.value; // array of {name,url}
		var max = props.max || 1;
		var onChange = props.onChange;
		var disabled = !!props.disabled;
		var tip = props.tip;

		function handlePick(e) {
			var f = e && e.target && e.target.files && e.target.files[0];
			if (!f) return;
			fileToDataUrl(f, function (err, url) {
				if (err) { message.error('上传失败（原型）'); return; }
				var next = (value || []).slice();
				next.push({ uid: String(Date.now()), name: f.name || 'image', url: url });
				if (next.length > max) next = next.slice(next.length - max);
				onChange && onChange(next);
			});
			e.target.value = '';
		}

		return React.createElement('div', null,
			React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, label),
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
				(value || []).map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(
							f.url,
							function () { previewState[1]({ open: true, url: f.url, title: f.name || '预览' }); },
							function () { onChange && onChange((value || []).filter(function (x) { return x.uid !== f.uid; })); },
							disabled
						)
					);
				}),
				disabled ? null : ((value || []).length >= max ? null : React.createElement('label', {
					style: {
						width: 64,
						height: 64,
						borderRadius: 4,
						border: '1px dashed #d9d9d9',
						background: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#999',
						cursor: 'pointer'
					}
				},
					React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePick }),
					'上传'
				))
			),
			tip ? React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#999' } }, tip) : null
		);
	}

	// ---------- styles ----------
	var layoutStyle = { padding: '16px 24px 88px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
var footerStyle = { position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '12px 24px', display: 'flex', justifyContent: 'flex-start', gap: 12, zIndex: 10 };

var styles = {
	formRow: { display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-start' },
	formItem: { flex: 1, minWidth: 0 },
	label: { fontSize: 12, color: '#666', marginBottom: 6 }
};

function FormItem(props) {
	var label = props.label;
	var required = !!props.required;
	var fullWidth = !!props.fullWidth;
	return React.createElement('div', { style: fullWidth ? Object.assign({}, styles.formItem, { flex: '0 0 100%' }) : styles.formItem },
		React.createElement('div', { style: styles.label }, required ? RequiredLabel(label) : label),
		props.children
	);
}

	// ---------- mock reserve vehicles ----------
	var reserveVehicles = useMemo(function () {
		return [
			{
				plateNo: '京A12345',
				vehicleType: '牵引车',
				brand: '东风',
				model: 'DFH1180',
				vin: 'LJNAU1A2XK1234567',
				hasAd: true,
				adPhoto: [{ uid: 'ad1', name: '广告照片.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=Ad' }],
				bigWordPhoto: [{ uid: 'bw1', name: '放大字照片.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=BigWord' }],
				hasTailboard: true
			},
			{
				plateNo: '浙F80088',
				vehicleType: '厢式车',
				brand: '福田',
				model: 'BJ1180',
				vin: 'LJNAU1A2XK7654321',
				hasAd: false,
				adPhoto: [],
				bigWordPhoto: [],
				hasTailboard: false
			},
			{
				plateNo: '沪A30003',
				vehicleType: '厢式车',
				brand: '重汽',
				model: 'HOWO-T5G',
				vin: 'LJNAU1A2XK9999000',
				hasAd: true,
				adPhoto: [{ uid: 'ad2', name: '广告照片2.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=Ad2' }],
				bigWordPhoto: [{ uid: 'bw2', name: '放大字照片2.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=BigWord2' }],
				hasTailboard: true
			}
		];
	}, []);

	var plateOptions = useMemo(function () {
		return reserveVehicles.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, [reserveVehicles]);
	var vehicleByPlate = useMemo(function () {
		var map = {};
		reserveVehicles.forEach(function (v) { map[v.plateNo] = v; });
		return map;
	}, [reserveVehicles]);

	// ---------- states ----------
	var previewState = useState({ open: false, url: '', title: '' });

	var formState = useState({
		plateNo: undefined,
		vehicleType: '',
		brand: '',
		model: '',
		vin: '',

		hasAd: false,
		adPhoto: [],
		bigWordPhoto: [],

		hasTailboard: false,

		spareTirePhoto: [],
		spareTireDepth: '',

		trainingFile: null, // {name}
		trainingRecognized: false,

		driverLicenses: [], // 4 photos {uid,name,url}

		mileageKm: '',
		batteryKwh: '',
		hydrogenAmount: '',
		serviceFee: ''
	});
	var form = formState[0];
	var setForm = formState[1];

	var ocrModalState = useState({ open: false, photoUrl: '', depth: '6.50' });

	var inspectionDrawerOpenState = useState(false);

	var requirementModalOpenState = useState(false);
	var requirementDocContent =
		'交车管理-交车单-编辑\n'
		+ '一个「数字化资产ONEOS运管平台」中的「交车管理-交车单-编辑」模块\n'
		+ '1.面包屑：\n'
		+ '1.1.运维管理-车辆业务-交车管理-交车单-编辑\n'
		+ '每个模块为一个单独卡片：\n\n'
		+ '2.交车明细：列表结构；\n'
		+ '2.1.车辆类型：输入框（禁用），根据车牌号反写车辆类型；\n'
		+ '2.2.品牌：输入框（禁用），根据车牌号反写品牌；\n'
		+ '2.2.型号：输入框（禁用），根据车牌号反写型号；\n'
		+ '2.3.车牌号：选择器，输入框，支持输入内容下拉模糊匹配选项，选择车辆有3个判断条件，1.仅能选择备车库中该型号车辆 2.选择时判断商业险是否到期，到期则报错不让选；\n'
		+ '2.4.车辆识别代码：输入框（禁用），根据车牌号反写车辆识别代码；\n'
		+ '2.5.车身广告及放大字：必选项，开关，选择车辆后拉取该车辆「后装设备」「车身广告」，如果该车辆有「车身广告」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「车身广告」中，    安装时间以该条备车记录提交成功为准，不够选择广告照片和放大字照片字段隐藏不显示；\n'
		+ '2.6.广告照片：必填项，图片上传，最多支持上传1张图片，支持主流照片格式。上传后，上传按钮切换为显示已上传图片缩略图，支持点击预览和删除，删除后，切换为上传按钮，从备车记录自动反写；\n'
		+ '2.7.放大字照片：必填项，图片上传，最多支持上传1张图片，支持主流照片格式。上传后，上传按钮切换为显示已上传图片缩略图，支持点击预览和删除，删除后，切换为上传按钮，从备车记录自动反写；\n'
		+ '2.8.尾板：必填项，开关，选择车辆后拉取该车辆「后装设备」「尾板」，如果该车辆有「尾板」则勾选为开，如果无则勾选为无。同时如果手动进行操作，会同步到「后装设备」「尾板」中，安装时间以该条备车记录提交成功为准；\n'
		+ '2.9.备胎照片：必填项，图片上传，最多支持上传1张图片，支持主流照片格式。上传时弹出卡片，提示正在识别中，请勿关闭页面，之后卡片左侧显示备胎照片，右侧输入框显示识别出的胎纹深度，后缀单位为mm，点击卡片中确认按钮，反写至备胎胎纹深度字段下；\n'
		+ '2.10.备胎胎纹深度：必填项，输入框，反写备胎照片OCR识别胎纹深度结果，支持修改；\n'
		+ '2.11.驾驶培训：必填项，附件上传按钮，后方为提示信息：请上传司机现场培训二维码图片。识别成功后隐藏驾驶培训按钮和提示，显示：已完成视频培训；\n'
		+ '2.12.司机证照：显示4张照片、身份证（正面）、身份证（反面）、驾驶证、从业资格证，根据驾驶培训上传二维码识别后自动反写；\n'
		+ '2.13.交车里程：必填项，输入框，单位为公里；\n'
		+ '2.14.交车电量：必填项，输入框，单位为kWh；\n'
		+ '2.15.交车氢量：必填项，输入框，单位为%或MPa，根据型号参数中该车型实际仪表盘单位显示；\n'
		+ '2.16.送车服务费：选填项，输入框，精确至2位小数，格式为xx.xx元；\n'
		+ '2.17.车辆检查：按钮，文字为交车检查单，点击右侧展开抽屉，抽屉内显示列表，字段为类别、检查项目、检查情况、备注；\n'
		+ '     2.11.1.类别：分为车灯、仪表盘、驾驶室、轮胎、液位检查、外观检查、车辆外观、其他、随车工具、随车证件、整车、燃料电池系统、冷机、制动系统；\n'
		+ '     2.11.2.检查项目：车灯类别对应（大灯、转向灯、小灯、示廓灯、刹车灯、倒车灯、牌照灯、防雾灯、室内灯）、仪表盘对应（氢系统指示、电控系统指示、数值清晰准确、故障报警灯）、驾驶室对应（点烟器、车窗升降、按键开关、雨刮器、内后视镜是否正常、内/外门把手、安全带、空调冷暖风、仪表盘、门锁功能、手刹、车钥匙功能是否正常、喇叭、音响功能、遮阳板、主副驾座椅、方向盘、内饰干净整洁）\n'
		+ '     2.11.3.检查情况：其他项为开关，在检查项目每项后方显示，从备车记录反写，可手动进行关闭，轮胎为输入框，提示请输入胎纹深度；\n'
		+ '     2.11.4.备注：输入框；\n\n'
		+ '3.交车照片：多个模块分3列显示，由照片标题和照片上传按钮组成，照片点击上传，从本地文件上传单张图片，上传成功后可通过图片右上角删除按钮删除，点击图片可放大预览；；\n'
		+ '3.1.车辆：必填项，包括仪表盘、车辆正面、车辆左前方、车辆左后方、车辆右后方、车辆右前方；\n'
		+ '3.2.底盘：必填项，包括正前方底部、左侧前方底部、左侧后方底部、正后方底部、右侧后方底部、右侧前方底部；\n'
		+ '3.3.轮胎：必填项，包括左前轮、左后轮（内）、左后轮（外）、右前轮、右后轮（内）、右后轮（外）、备胎；\n'
		+ '3.4.瑕疵：必填项，包括照片上传按钮，最多支持4张照片；\n'
		+ '3.5.其他：必填项，包括照片上传按钮，最多支持4张照片；\n'
		+ '照片点击上传，从本地文件上传单张图片，上传成功后可通过图片右上角删除按钮删除，点击图片可放大预览；\n\n'
		+ '4.底部为提交、取消按钮；\n'
		+ '  4.1.提交：点击进行二次确认，点击确认完成该车辆交车；\n'
		+ '  4.2.保存：点击暂存交车单（不做校验）；\n'
		+ '  4.2.取消：点击返回交车单页；\n';

	var trainingInputRef = useRef(null);

	// photo sections
	var photoState = useState({
		vehicle: {
			'仪表盘': [],
			'车辆正面': [],
			'车辆左前方': [],
			'车辆左后方': [],
			'车辆右后方': [],
			'车辆右前方': []
		},
		chassis: {
			'正前方底部': [],
			'左侧前方底部': [],
			'左侧后方底部': [],
			'正后方底部': [],
			'右侧后方底部': [],
			'右侧前方底部': []
		},
		tire: {
			'左前轮': [],
			'左后轮（内）': [],
			'左后轮（外）': [],
			'右前轮': [],
			'右后轮（内）': [],
			'右后轮（外）': [],
			'备胎': []
		},
		defect: [],
		other: []
	});
	var photos = photoState[0];
	var setPhotos = photoState[1];

	function updateForm(patch) {
		setForm(function (p) { return Object.assign({}, p, patch); });
	}

	function handlePlateChange(v) {
		var veh = vehicleByPlate[v];
		updateForm({
			plateNo: v,
			vehicleType: (veh && veh.vehicleType) || '',
			brand: (veh && veh.brand) || '',
			model: (veh && veh.model) || '',
			vin: (veh && veh.vin) || '',
			hasAd: !!(veh && veh.hasAd),
			adPhoto: (veh && (veh.adPhoto || [])) || [],
			bigWordPhoto: (veh && (veh.bigWordPhoto || [])) || [],
			hasTailboard: !!(veh && veh.hasTailboard),
			spareTirePhoto: [],
			spareTireDepth: '',
			trainingFile: null,
			trainingRecognized: false,
			driverLicenses: []
		});
	}

	function handleSparePhotoChange(list) {
		updateForm({ spareTirePhoto: list || [] });
		if ((list || []).length > 0) {
			ocrModalState[1]({ open: true, photoUrl: list[0].url, depth: '6.50' });
		}
	}

	function confirmOcr() {
		updateForm({ spareTireDepth: ocrModalState[0].depth });
		ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false }));
		message.success('已反写备胎胎纹深度');
	}

	function handleTrainingPick(e) {
		var f = e && e.target && e.target.files && e.target.files[0];
		if (!f) return;
		// 原型：上传即识别成功
		setTimeout(function () {
			updateForm({ trainingFile: { name: f.name || '二维码图片' }, trainingRecognized: true });
			// 自动反写司机证照（示例）
			updateForm({
				driverLicenses: [
					{ uid: 'id1', name: '身份证正面.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=ID-Front' },
					{ uid: 'id2', name: '身份证反面.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=ID-Back' },
					{ uid: 'dl', name: '驾驶证.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=DriverLicense' },
					{ uid: 'qc', name: '从业资格证.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=Qualification' }
				]
			});
			message.success('识别成功：已完成视频培训（原型）');
		}, 600);
		e.target.value = '';
	}

	function validateSubmit() {
		if (isEmpty(form.plateNo)) return '请选择车牌号';
		// 车身广告及放大字：必选项（hasAd 视为必选，允许开/关，但若开则必须有两张图）
		if (form.hasAd) {
			if (!form.adPhoto || form.adPhoto.length === 0) return '请上传广告照片';
			if (!form.bigWordPhoto || form.bigWordPhoto.length === 0) return '请上传放大字照片';
		}
		if (form.hasTailboard !== true && form.hasTailboard !== false) return '请填写尾板';
		// 尾板必填：但开关值本身必选，这里只要求已选；若未选 plateChange 已赋默认 false
		// 备胎照片/胎纹深度必填
		if (!form.spareTirePhoto || form.spareTirePhoto.length === 0) return '请上传备胎照片';
		if (isEmpty(form.spareTireDepth)) return '请填写备胎胎纹深度';
		// 驾驶培训必填：识别成功才算完成
		if (!form.trainingRecognized) return '请上传验车码并完成识别';
		if (isEmpty(form.mileageKm)) return '请填写交车里程';
		if (isEmpty(form.batteryKwh)) return '请填写交车电量';
		if (isEmpty(form.hydrogenAmount)) return '请填写交车氢量';
		// 交车照片必填：车辆/底盘/轮胎（瑕疵、其他非必填）
		var requiredGroups = [
			{ key: 'vehicle', label: '车辆' },
			{ key: 'chassis', label: '底盘' },
			{ key: 'tire', label: '轮胎' }
		];
		for (var gi = 0; gi < requiredGroups.length; gi++) {
			var g = requiredGroups[gi];
			var groupMap = photos && photos[g.key];
			var keys = groupMap ? Object.keys(groupMap) : [];
			for (var ki = 0; ki < keys.length; ki++) {
				var k = keys[ki];
				var arr = groupMap[k] || [];
				if (!arr || arr.length === 0) return '请上传' + g.label + '照片：' + k;
			}
		}
		// 尾板为必填项：如果业务上要求必须开/关都可以，这里不做强制为开，仅保证已选择
		return '';
	}

	function handleSubmit() {
		var err = validateSubmit();
		if (err) { message.error(err); return; }
	Modal.confirm({
		title: '确认交车',
		content: '请确认信息填写无误，点击确认完成该车辆交车。',
		okText: '确认',
		cancelText: '取消',
		onOk: function () {
			message.success('交车成功（原型）');
		}
	});
	}

function handleSave() {
	message.success('已保存（原型）');
}

	function handleCancel() {
		message.info('返回交车单页（原型）');
	}

	// ---------- inspection checklist ----------
	// 按需求 2.11.1~2.11.4 生成完整检查清单（原型：默认从备车记录反写为“开/正常”）
	var inspectionCategoryItems = {
		'车灯': ['大灯', '转向灯', '小灯', '示廓灯', '刹车灯', '倒车灯', '牌照灯', '防雾灯', '室内灯'],
		'仪表盘': ['氢系统指示', '电控系统指示', '数值清晰准确', '故障报警灯'],
		'驾驶室': ['点烟器', '车窗升降', '按键开关', '雨刮器', '内后视镜是否正常', '内/外门把手', '安全带', '空调冷暖风', '仪表盘', '门锁功能', '手刹', '车钥匙功能是否正常', '喇叭', '音响功能', '遮阳板', '主副驾座椅', '方向盘', '内饰干净整洁'],
		'轮胎': ['前左胎', '前右胎', '后左胎', '后右胎', '备胎'],
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
			var items = inspectionCategoryItems[cat] || [];
			for (var j = 0; j < items.length; j++) {
				var it = items[j];
				var isTire = cat === '轮胎';
				list.push({
					key: 'ins-' + i + '-' + j,
					category: cat,
					item: it,
					checked: true,
					treadDepth: isTire ? '6.5' : '',
					remark: ''
				});
			}
		}
		return list;
	}

	var inspectionListState = useState(function () {
		return buildInspectionList();
	});
	var inspectionList = inspectionListState[0];
	var setInspectionList = inspectionListState[1];
	var inspectionListRef = useRef(null);
	inspectionListRef.current = inspectionList;

	function updateInspectionRow(key, patch) {
		setInspectionList(function (prev) {
			return (prev || []).map(function (r) {
				if (r.key !== key) return r;
				return Object.assign({}, r, patch);
			});
		});
	}

	var inspectionColumns = useMemo(function () {
		return [
			{
				title: '类别',
				dataIndex: 'category',
				key: 'category',
				width: 140,
				render: function (text, record, index) {
					var rows = inspectionListRef.current || [];
					var cat = record && record.category;
					if (!cat) return { children: text, props: { rowSpan: 1 } };

					// 仅合并同类别的连续行
					var isFirst = true;
					for (var i = index - 1; i >= 0; i--) {
						if (!rows[i] || rows[i].category !== cat) break;
						isFirst = false;
						break;
					}
					if (!isFirst) return { children: null, props: { rowSpan: 0 } };

					var span = 1;
					for (var j = index + 1; j < rows.length; j++) {
						if (!rows[j] || rows[j].category !== cat) break;
						span++;
					}
					return { children: text, props: { rowSpan: span } };
				}
			},
			{ title: '检查项目', dataIndex: 'item', key: 'item', width: 220 },
			{
				title: '检查情况',
				dataIndex: 'checked',
				key: 'checked',
				width: 220,
				render: function (_, record) {
					var isTire = record && (record.category === '轮胎' || String(record.item || '').indexOf('胎纹') >= 0);
					return isTire
						? React.createElement(Input, {
							value: record.treadDepth,
							placeholder: '请输入胎纹深度',
							addonAfter: 'mm',
							onChange: function (e) { updateInspectionRow(record.key, { treadDepth: e.target.value }); }
						})
						: React.createElement(Switch, {
							checked: !!record.checked,
							onChange: function (v) { updateInspectionRow(record.key, { checked: !!v }); }
						});
				}
			},
			{
				title: '备注',
				dataIndex: 'remark',
				key: 'remark',
				render: function (_, record) {
					return React.createElement(Input, {
						value: record.remark,
						placeholder: '请输入',
						onChange: function (e) { updateInspectionRow(record.key, { remark: e.target.value }); }
					});
				}
			}
		];
	}, []);

	// ---------- render helpers ----------
	// 交车明细布局对齐「备车-新增」：使用 FormItem + styles.formRow

	function PhotoGridColumn(title, items, required) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, required ? RequiredLabel(title) : title),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				items.map(function (it) {
					return React.createElement('div', { key: it.key },
						UploadBox({
							label: required ? RequiredLabel(it.label) : it.label,
							value: it.value,
							max: 1,
							onChange: it.onChange
						})
					);
				})
			)
		);
	}

	function PhotoGridSimple(title, value, max, onChange) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, title),
			UploadBox({ label: '照片', value: value, max: max, onChange: onChange, tip: '最多支持上传' + max + '张' })
		);
	}

// 在线打印已按最新需求移除

	// ---------- render ----------
	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '交车管理' }, { title: '交车单-编辑' }] }),
			React.createElement(Button, { type: 'link', onClick: function () { requirementModalOpenState[1](true); } }, '查看需求说明')
		),

		React.createElement(Card, { title: '交车明细', style: cardStyle },
			React.createElement('div', null,
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车牌号', required: true },
						React.createElement(Select, {
							value: form.plateNo,
							options: plateOptions,
							showSearch: true,
							filterOption: filterOption,
							placeholder: '请输入或选择车牌号',
							allowClear: true,
							style: { width: '100%' },
							onChange: handlePlateChange
						})
					),
					React.createElement(FormItem, { label: '车辆类型' },
						React.createElement(Input, { value: form.vehicleType, disabled: true })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '品牌' },
						React.createElement(Input, { value: form.brand, disabled: true })
					),
					React.createElement(FormItem, { label: '型号' },
						React.createElement(Input, { value: form.model, disabled: true })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车辆识别代码' },
						React.createElement(Input, { value: form.vin, disabled: true })
					),
					React.createElement('div', { style: styles.formItem })
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车身广告及放大字', required: true, fullWidth: true },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
							React.createElement(Switch, { checked: !!form.hasAd, onChange: function (v) { updateForm({ hasAd: !!v }); } }),
							React.createElement('span', { style: { color: '#666', fontSize: 12 } }, form.hasAd ? '有车身广告' : '无车身广告')
						)
					)
				),
				form.hasAd ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } },
					React.createElement('div', null,
						UploadBox({ label: RequiredLabel('广告照片'), value: form.adPhoto, max: 1, onChange: function (l) { updateForm({ adPhoto: l }); } })
					),
					React.createElement('div', null,
						UploadBox({ label: RequiredLabel('放大字照片'), value: form.bigWordPhoto, max: 1, onChange: function (l) { updateForm({ bigWordPhoto: l }); } })
					)
				) : null,

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '尾板', required: true, fullWidth: true },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
							React.createElement(Switch, { checked: !!form.hasTailboard, onChange: function (v) { updateForm({ hasTailboard: !!v }); } }),
							React.createElement('span', { style: { color: '#666', fontSize: 12 } }, form.hasTailboard ? '有尾板' : '无尾板')
						)
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '备胎照片', required: true },
						UploadBox({ label: '', value: form.spareTirePhoto, max: 1, onChange: handleSparePhotoChange })
					),
					React.createElement(FormItem, { label: '备胎胎纹深度', required: true },
						React.createElement(Input, { value: form.spareTireDepth, placeholder: '请输入备胎胎纹深度', addonAfter: 'mm', onChange: function (e) { updateForm({ spareTireDepth: e.target.value }); } })
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '驾驶培训', required: true, fullWidth: true },
						React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
							form.trainingRecognized
								? React.createElement('span', { style: { color: '#52c41a', fontWeight: 600 } }, '已完成视频培训')
								: React.createElement(React.Fragment, null,
									React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
										React.createElement('input', { type: 'file', ref: trainingInputRef, accept: 'image/*', style: { display: 'none' }, onChange: handleTrainingPick }),
										React.createElement(Button, { onClick: function () { trainingInputRef.current && trainingInputRef.current.click(); } }, '上传验车码')
									)
								)
						)
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '司机证照', fullWidth: true },
						React.createElement('div', null,
							(form.driverLicenses && form.driverLicenses.length > 0)
								? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 } },
									form.driverLicenses.map(function (f) {
										return React.createElement('div', { key: f.uid },
											makeThumb(
												f.url,
												function () { previewState[1]({ open: true, url: f.url, title: f.name || '预览' }); },
												null,
												false
											),
											React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#666' } }, f.name)
										);
									})
								)
								: React.createElement('div', { style: { fontSize: 12, color: '#999' } }, '上传验车码后显示')
						)
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '交车里程', required: true },
						React.createElement(Input, { value: form.mileageKm, placeholder: '请输入', addonAfter: '公里', onChange: function (e) { updateForm({ mileageKm: e.target.value }); } })
					),
					React.createElement(FormItem, { label: '交车电量', required: true },
						React.createElement(Input, { value: form.batteryKwh, placeholder: '请输入', addonAfter: 'kWh', onChange: function (e) { updateForm({ batteryKwh: e.target.value }); } })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '交车氢量', required: true },
						React.createElement(Input, { value: form.hydrogenAmount, placeholder: '请输入交车氢量', addonAfter: 'MPa', onChange: function (e) { updateForm({ hydrogenAmount: e.target.value }); } })
					),
					React.createElement(FormItem, { label: '送车服务费' },
						React.createElement(Input, { value: form.serviceFee, placeholder: '请输入送车服务费金额', addonAfter: '元', onChange: function (e) { updateForm({ serviceFee: e.target.value }); } })
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车辆检查', fullWidth: true },
						React.createElement(Button, { onClick: function () { inspectionDrawerOpenState[1](true); } }, '交车检查单')
					)
				)
			)
		),

		React.createElement(Card, { title: '交车照片', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 } },
				PhotoGridColumn('车辆', Object.keys(photos.vehicle).map(function (k) {
					return {
						key: 'v-' + k,
						label: k,
						value: photos.vehicle[k],
						onChange: function (l) { setPhotos(function (p) { var n = Object.assign({}, p); n.vehicle = Object.assign({}, p.vehicle); n.vehicle[k] = l; return n; }); }
					};
					}), true),
				PhotoGridColumn('底盘', Object.keys(photos.chassis).map(function (k) {
					return {
						key: 'c-' + k,
						label: k,
						value: photos.chassis[k],
						onChange: function (l) { setPhotos(function (p) { var n = Object.assign({}, p); n.chassis = Object.assign({}, p.chassis); n.chassis[k] = l; return n; }); }
					};
					}), true),
				PhotoGridColumn('轮胎', Object.keys(photos.tire).map(function (k) {
					return {
						key: 't-' + k,
						label: k,
						value: photos.tire[k],
						onChange: function (l) { setPhotos(function (p) { var n = Object.assign({}, p); n.tire = Object.assign({}, p.tire); n.tire[k] = l; return n; }); }
					};
					}), true)
			),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 12 } },
				PhotoGridSimple('瑕疵', photos.defect, 4, function (l) { setPhotos(function (p) { return Object.assign({}, p, { defect: l }); }); }),
				PhotoGridSimple('其他', photos.other, 4, function (l) { setPhotos(function (p) { return Object.assign({}, p, { other: l }); }); })
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleSave }, '保存'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),

		// preview modal
		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: function () { previewState[1]({ open: false, url: '', title: '' }); },
			width: 860
		},
			previewState[0].url ? React.createElement('img', { src: previewState[0].url, style: { width: '100%', maxHeight: '70vh', objectFit: 'contain' } }) : null
		),

		// OCR modal
		React.createElement(Modal, {
			open: !!ocrModalState[0].open,
			title: '正在识别中（原型）',
			onCancel: function () { ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false })); },
			onOk: confirmOcr,
			okText: '确认',
			cancelText: '取消',
			width: 860
		},
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' } },
				React.createElement('div', { style: { border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', background: '#fafafa' } },
					ocrModalState[0].photoUrl ? React.createElement('img', { src: ocrModalState[0].photoUrl, style: { width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' } }) : null
				),
				React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '识别出的胎纹深度'),
					React.createElement(Input, {
						value: ocrModalState[0].depth,
						addonAfter: 'mm',
						onChange: function (e) { ocrModalState[1](Object.assign({}, ocrModalState[0], { depth: e.target.value })); }
					}),
					React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#999', lineHeight: 1.7 } }, '提示：识别中请勿关闭页面；点击确认后将反写至“备胎胎纹深度”。')
				)
			)
		),

		// inspection drawer
		React.createElement(Drawer, {
			open: inspectionDrawerOpenState[0],
			title: '交车检查单',
			width: 920,
			placement: 'right',
			onClose: function () { inspectionDrawerOpenState[1](false); },
			styles: { body: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start', gap: 8 } },
				React.createElement(Button, {
					type: 'primary',
					onClick: function () {
						message.success('提交成功（原型）');
						inspectionDrawerOpenState[1](false);
					}
				}, '提交'),
				React.createElement(Button, { onClick: function () { inspectionDrawerOpenState[1](false); } }, '返回')
			)
		},
			React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto' } },
				React.createElement(Table, { rowKey: 'key', columns: inspectionColumns, dataSource: inspectionList, pagination: false, bordered: true, size: 'small' })
			)
		),
		React.createElement(Modal, {
			open: requirementModalOpenState[0],
			onCancel: function () { requirementModalOpenState[1](false); },
			onOk: function () { requirementModalOpenState[1](false); },
			title: '需求说明',
			width: 860
		},
			React.createElement('div', { style: { maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#333' } }, requirementDocContent)
		),

		// 在线打印已按最新需求移除
	);
};

