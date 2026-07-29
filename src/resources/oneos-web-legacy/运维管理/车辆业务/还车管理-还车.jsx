// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 还车管理 - 还车

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Select = antd.Select;
	var Switch = antd.Switch;
	var DatePicker = antd.DatePicker;
	var Table = antd.Table;
	var Button = antd.Button;
	var Drawer = antd.Drawer;
	var Modal = antd.Modal;
	var message = antd.message;

	var TextArea = Input.TextArea;

	// ---------- utils ----------
	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#f5222d', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
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
				style: { width: '100%', height: '100%', objectFit: 'cover', cursor: disabled ? 'default' : 'pointer' },
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

	function sanitize2(v) {
		if (v === null || v === undefined) return '';
		var s = String(v);
		if (s === '') return '';
		// 只保留数字和一个小数点
		if (!/^\d*\.?\d*$/.test(s)) return '';
		var parts = s.split('.');
		if (parts.length === 1) return parts[0];
		return parts[0] + '.' + (parts[1].slice(0, 2));
	}

	function UploadBox(props) {
		var label = props.label;
		var value = props.value || []; // array of {uid,name,url}
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
				next.push({ uid: String(Date.now()) + '_' + Math.random(), name: f.name || 'image', url: url });
				if (next.length > max) next = next.slice(next.length - max);
				onChange && onChange(next);
			});
			e.target.value = '';
		}

		return React.createElement('div', null,
			label ? React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, label) : null,
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

	var layoutStyle = { padding: '16px 24px 88px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var footerStyle = {
		position: 'fixed',
		left: 0,
		right: 0,
		bottom: 0,
		background: '#fff',
		borderTop: '1px solid #f0f0f0',
		padding: '12px 24px',
		display: 'flex',
		justifyContent: 'flex-start',
		gap: 12,
		zIndex: 10
	};

	var styles = {
		formRow: { display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-start' },
		formItem: { flex: 1, minWidth: 0 },
		label: { fontSize: 12, color: '#666', marginBottom: 6 }
	};

	function FormItem(props) {
		var label = props.label;
		var required = !!props.required;
		var fullWidth = !!props.fullWidth;
		return React.createElement(
			'div',
			{ style: fullWidth ? Object.assign({}, styles.formItem, { flex: '0 0 100%' }) : styles.formItem },
			React.createElement('div', { style: styles.label }, required ? RequiredLabel(label) : label),
			props.children
		);
	}

	// ---------- mock data ----------
	var vehicleInfo = useMemo(function () {
		return {
			contractCode: 'HT-ZL-2025-001',
			projectName: '嘉兴氢能示范项目',
			customerName: '嘉兴某某物流有限公司',
			businessDept: '华东业务部',
			businessOwner: '李经理',
			plateNo: '京A12345',
			vehicleType: '重型厢式货车',
			brand: '东风',
			model: 'DFH1180',
			deliveryTime: '2025-02-28 14:30',
			deliveryRegion: '浙江省-嘉兴市',
			deliveryAddress: '嘉兴市南湖区科技大道1号',
			deliverySpareTireDepth: '6.50',
			deliveryMileageKm: '15230.12',
			deliveryBatteryKwh: '68.40',
			deliveryHydrogenAmount: '28.30',
			hydrogenUnit: 'MPa',
			deliverySpareTirePhotoUrl: 'https://dummyimage.com/600x400/eee/666&text=交车备胎照片'
		};
	}, []);

	var returnLocationOptions = useMemo(function () {
		return {
			parking: [
				{ value: '停车场A', label: '停车场A' },
				{ value: '停车场B', label: '停车场B' }
			],
			repair: [
				{ value: '维修站A', label: '维修站A' },
				{ value: '维修站B', label: '维修站B' }
			]
		};
	}, []);

	var deliveryDriver = useMemo(function () {
		return {
			name: '张三',
			phone: '13800138001',
			idCard: '320101199001018888'
		};
	}, []);

	// 交车时照片（用于展示，仅查看）
	var deliveryPhotos = useMemo(function () {
		function u(txt) { return 'https://dummyimage.com/600x400/eee/666&text=' + encodeURIComponent(txt); }
		return {
			vehicle: {
				'仪表盘': [{ uid: 'dv1', name: '仪表盘.jpg', url: u('交车-仪表盘') }],
				'车辆正面': [{ uid: 'dv2', name: '车辆正面.jpg', url: u('交车-车辆正面') }],
				'车辆左前方': [{ uid: 'dv3', name: '车辆左前方.jpg', url: u('交车-车辆左前方') }],
				'车辆左后方': [{ uid: 'dv4', name: '车辆左后方.jpg', url: u('交车-车辆左后方') }],
				'车辆右后方': [{ uid: 'dv5', name: '车辆右后方.jpg', url: u('交车-车辆右后方') }],
				'车辆右前方': [{ uid: 'dv6', name: '车辆右前方.jpg', url: u('交车-车辆右前方') }]
			},
			chassis: {
				'正前方底部': [{ uid: 'dc1', name: '正前方底部.jpg', url: u('交车-正前方底部') }],
				'左侧前方底部': [{ uid: 'dc2', name: '左侧前方底部.jpg', url: u('交车-左侧前方底部') }],
				'左侧后方底部': [{ uid: 'dc3', name: '左侧后方底部.jpg', url: u('交车-左侧后方底部') }],
				'正后方底部': [{ uid: 'dc4', name: '正后方底部.jpg', url: u('交车-正后方底部') }],
				'右侧后方底部': [{ uid: 'dc5', name: '右侧后方底部.jpg', url: u('交车-右侧后方底部') }],
				'右侧前方底部': [{ uid: 'dc6', name: '右侧前方底部.jpg', url: u('交车-右侧前方底部') }]
			},
			tire: {
				'左前轮': [{ uid: 'dt1', name: '左前轮.jpg', url: u('交车-左前轮') }],
				'左后轮（内）': [{ uid: 'dt2', name: '左后轮（内）.jpg', url: u('交车-左后轮（内）') }],
				'左后轮（外）': [{ uid: 'dt3', name: '左后轮（外）.jpg', url: u('交车-左后轮（外）') }],
				'右前轮': [{ uid: 'dt4', name: '右前轮.jpg', url: u('交车-右前轮') }],
				'右后轮（内）': [{ uid: 'dt5', name: '右后轮（内）.jpg', url: u('交车-右后轮（内）') }],
				'右后轮（外）': [{ uid: 'dt6', name: '右后轮（外）.jpg', url: u('交车-右后轮（外）') }],
				'备胎': [{ uid: 'dt7', name: '备胎.jpg', url: u('交车-备胎') }]
			},
			defect: [
				{ uid: 'dd1', name: '交车瑕疵1.jpg', url: u('交车-瑕疵1') },
				{ uid: 'dd2', name: '交车瑕疵2.jpg', url: u('交车-瑕疵2') }
			],
			other: [
				{ uid: 'do1', name: '交车其他1.jpg', url: u('交车-其他1') },
				{ uid: 'do2', name: '交车其他2.jpg', url: u('交车-其他2') }
			]
		};
	}, []);

	// ---------- states ----------
	var previewState = useState({ open: false, url: '', title: '' });
	var ocrModalState = useState({ open: false, photoUrl: '', depth: '' });

	var requirementModalOpenState = useState(false);

	var inspectionDrawerOpenState = useState(false);

	var [returnPhotos, setReturnPhotos] = useState(function () {
		return {
			vehicle: {},
			chassis: {},
			tire: {},
			defect: [],
			other: []
		};
	});

	// 初始化 returnPhotos 的各 slot
	useEffect(function () {
		setReturnPhotos(function (prev) {
			var next = Object.assign({}, prev || {});
			['vehicle', 'chassis', 'tire'].forEach(function (k) {
				next[k] = Object.assign({}, next[k] || {});
			});
			Object.keys(deliveryPhotos.vehicle || {}).forEach(function (slot) { if (!next.vehicle[slot]) next.vehicle[slot] = []; });
			Object.keys(deliveryPhotos.chassis || {}).forEach(function (slot) { if (!next.chassis[slot]) next.chassis[slot] = []; });
			Object.keys(deliveryPhotos.tire || {}).forEach(function (slot) { if (!next.tire[slot]) next.tire[slot] = []; });
			return next;
		});
	}, []);

	var [form, setForm] = useState(function () {
		return {
			// 还车人信息（默认来自交车司机）
			returnPerson: deliveryDriver.name,
			returnPhone: deliveryDriver.phone,
			returnIdCard: deliveryDriver.idCard,

			// 还车地点
			returnPlaceType: undefined, // 'parking' | 'repair'
			returnPlaceName: undefined,
			arriveTime: '',

			// 备胎照片与胎纹深度
			spareTirePhoto: [], // 上传
			spareTireDepth: '', // OCR/手填

			// 里程/电量/氢量
			returnMileageKm: '',
			returnBatteryKwh: '',
			returnHydrogenAmount: '',
			hydrogenUnit: vehicleInfo.hydrogenUnit,

			// 接车服务费（可选）
			serviceFee: ''
		};
	});

	function updateForm(patch) {
		setForm(function (prev) { return Object.assign({}, prev, patch); });
	}

	function handleSpareTirePhotoChange(list) {
		updateForm({ spareTirePhoto: list || [] });
		if ((list || []).length > 0) {
			ocrModalState[1]({ open: true, photoUrl: list[0].url, depth: '6.50' });
		}
	}

	function confirmOcr() {
		updateForm({ spareTireDepth: ocrModalState[0].depth });
		ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false }));
		message.success('已反写还车备胎胎纹深度（原型）');
	}

	// ---------- inspection checklist ----------
	// 参照交车检查单生成“还车检查项”（原型：默认全开/正常）
	var inspectionCategoryItems = useMemo(function () {
		return {
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
	}, []);

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
					key: 'r-ins-' + i + '-' + j,
					category: cat,
					item: it,
					checked: true,
					treadDepth: isTire ? '6.50' : '',
					remark: ''
				});
			}
		}
		return list;
	}

	var inspectionListState = useState(function () { return buildInspectionList(); });
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

	// ---------- validation & actions ----------
	function validateSubmit() {
		if (isEmpty(form.returnPerson)) return '请填写还车人';
		if (isEmpty(form.returnPhone)) return '请填写还车人电话';
		if (isEmpty(form.returnIdCard)) return '请填写还车人身份证';
		if (!form.returnPlaceType) return '请选择还车地点';
		if (isEmpty(form.returnPlaceName)) return '请选择' + (form.returnPlaceType === 'parking' ? '停车场' : '维修站');
		if (isEmpty(form.arriveTime)) return '请选择到达时间';
		if (!form.spareTirePhoto || form.spareTirePhoto.length === 0) return '请上传备胎照片';
		if (isEmpty(form.spareTireDepth)) return '请填写还车时备胎胎纹深度';
		if (isEmpty(form.returnMileageKm)) return '请填写还车里程';
		if (isEmpty(form.returnBatteryKwh)) return '请填写还车电量';
		if (isEmpty(form.returnHydrogenAmount)) return '请填写还车氢量';
		return '';
	}

	function handleSubmit() {
		var err = validateSubmit();
		if (err) { message.error(err); return; }
		Modal.confirm({
			title: '确认还车',
			content: '请确认信息填写无误，点击确认完成该车辆还车，并将该记录加入历史记录。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				message.success('还车成功（原型）');
				message.success('已加入历史记录（原型）');
			}
		});
	}

	function handleSave() {
		message.success('已暂存还车单（原型）');
	}

	function handleCancel() {
		message.info('返回还车管理页（原型）');
	}

	// ---------- photo render helpers ----------
	function PreviewDeliveryThumb(props) {
		var url = props.url;
		if (!url) return React.createElement('div', { style: { width: 64, height: 64, borderRadius: 4, border: '1px solid #f0f0f0', background: '#fafafa' } });
		return makeThumb(url,
			function () { previewState[1]({ open: true, url: url, title: props.title || '交车照片预览' }); },
			null,
			false
		);
	}

	function ReturnPhotoGridColumn(title, slots, required, deliveryMap, returnMap, onReturnMapChange) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, required ? RequiredLabel(title) : title),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				(slots || []).map(function (slot) {
					var deliveryArr = (deliveryMap && deliveryMap[slot]) || [];
					var deliveryUrl = deliveryArr && deliveryArr[0] ? deliveryArr[0].url : '';
					return React.createElement('div', { key: slot },
						React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, required ? RequiredLabel(slot) : slot),
						React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
								PreviewDeliveryThumb({ url: deliveryUrl, title: slot }),
								React.createElement('div', { style: { fontSize: 11, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { flex: '1 1 120px', minWidth: 120 } },
								UploadBox({
									label: null,
									value: (returnMap && returnMap[slot]) || [],
									max: 1,
									onChange: function (l) {
										onReturnMapChange(slot, l || []);
									}
								})
							)
						)
					);
				})
			)
		);
	}

	// ---------- render ----------
	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '还车管理' }] }),
			React.createElement(Button, { type: 'link', onClick: function () { requirementModalOpenState[1](true); } }, '查看需求说明')
		),

		React.createElement(Card, { title: '合同信息', style: cardStyle },
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '合同编码' },
					React.createElement(Input, { value: vehicleInfo.contractCode, disabled: true })
				),
				React.createElement(FormItem, { label: '项目名称' },
					React.createElement(Input, { value: vehicleInfo.projectName, disabled: true })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '客户名称' },
					React.createElement(Input, { value: vehicleInfo.customerName, disabled: true })
				),
				React.createElement(FormItem, { label: '业务部门' },
					React.createElement(Input, { value: vehicleInfo.businessDept, disabled: true })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '业务负责人', fullWidth: true },
					React.createElement(Input, { value: vehicleInfo.businessOwner, disabled: true })
				)
			)
		),

		React.createElement(Card, { title: '车辆信息', style: cardStyle },
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '车牌号' },
					React.createElement(Input, { value: vehicleInfo.plateNo, disabled: true })
				),
				React.createElement(FormItem, { label: '车辆型号' },
					React.createElement(Input, { value: vehicleInfo.vehicleType, disabled: true })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '品牌' },
					React.createElement(Input, { value: vehicleInfo.brand, disabled: true })
				),
				React.createElement(FormItem, { label: '型号' },
					React.createElement(Input, { value: vehicleInfo.model, disabled: true })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车时间' },
					React.createElement(Input, { value: vehicleInfo.deliveryTime, disabled: true, placeholder: '' })
				),
				React.createElement(FormItem, { label: '交车地点（省-市）' },
					React.createElement(Input, { value: vehicleInfo.deliveryRegion, disabled: true })
				)
			)
		),

		React.createElement(Card, { title: '还车明细', style: cardStyle },
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车人', required: true },
					React.createElement(Input, { value: form.returnPerson, placeholder: '请输入还车人', onChange: function (e) { updateForm({ returnPerson: e.target.value }); } })
				),
				React.createElement(FormItem, { label: '还车人电话', required: true },
					React.createElement(Input, { value: form.returnPhone, placeholder: '请输入还车人电话', onChange: function (e) { updateForm({ returnPhone: e.target.value }); } })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车人身份证', required: true },
					React.createElement(Input, { value: form.returnIdCard, placeholder: '请输入还车人身份证', onChange: function (e) { updateForm({ returnIdCard: e.target.value }); } })
				),
				React.createElement(FormItem, { label: '还车地点', required: true },
					React.createElement(Select, {
						placeholder: '请选择还车地点',
						value: form.returnPlaceType,
						allowClear: true,
						options: [
							{ value: 'parking', label: '停车场' },
							{ value: 'repair', label: '维修站' }
						],
						onChange: function (v) { updateForm({ returnPlaceType: v, returnPlaceName: undefined }); }
					})
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, {
					label: form.returnPlaceType === 'parking' ? '停车场' : form.returnPlaceType === 'repair' ? '维修站' : '停车场/维修站',
					required: true
				},
					React.createElement(Select, {
						placeholder: '请选择' + (form.returnPlaceType === 'parking' ? '停车场' : form.returnPlaceType === 'repair' ? '维修站' : '停车场或维修站'),
						value: form.returnPlaceName,
						allowClear: true,
						showSearch: true,
						filterOption: filterOption,
						options: form.returnPlaceType === 'parking' ? returnLocationOptions.parking : (form.returnPlaceType === 'repair' ? returnLocationOptions.repair : []),
						onChange: function (v) { updateForm({ returnPlaceName: v }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '到达时间', required: true, fullWidth: true },
					React.createElement(DatePicker, {
						showTime: { format: 'HH:mm' },
						format: 'YYYY-MM-DD HH:mm',
						placeholder: '请选择到达时间',
						style: { width: '100%' },
						value: (function () {
							var dayjs = window.dayjs;
							return form.arriveTime && dayjs ? dayjs(form.arriveTime) : null;
						})(),
						onChange: function (date, dateString) {
							updateForm({ arriveTime: dateString || '' });
						}
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '备胎照片', required: true, fullWidth: true },
					React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
						React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
							makeThumb(
								vehicleInfo.deliverySpareTirePhotoUrl,
								function () { previewState[1]({ open: true, url: vehicleInfo.deliverySpareTirePhotoUrl, title: '交车时备胎照片' }); },
								null,
								false
							),
							React.createElement('div', { style: { fontSize: 11, color: '#999', marginTop: 6 } }, '交车时照片')
						),
						React.createElement('div', { style: { flex: '1 1 240px', minWidth: 240 } },
							UploadBox({
								label: null,
								value: form.spareTirePhoto,
								max: 1,
								onChange: function (l) { handleSpareTirePhotoChange(l); },
								tip: '上传后将自动识别胎纹深度（原型）'
							})
						)
					)
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车时备胎胎纹深度', fullWidth: false },
					React.createElement(Input, { value: vehicleInfo.deliverySpareTireDepth, disabled: true, addonAfter: 'mm' })
				),
				React.createElement(FormItem, { label: '还车时备胎胎纹深度', required: true },
					React.createElement(Input, {
						value: form.spareTireDepth,
						placeholder: '请输入备胎胎纹深度',
						addonAfter: 'mm',
						onChange: function (e) { updateForm({ spareTireDepth: e.target.value }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车里程（km）' },
					React.createElement(Input, { value: vehicleInfo.deliveryMileageKm, disabled: true, addonAfter: 'km' })
				),
				React.createElement(FormItem, { label: '还车里程（km）', required: true },
					React.createElement(Input, {
						value: form.returnMileageKm,
						placeholder: '请输入还车里程',
						addonAfter: 'km',
						onChange: function (e) { updateForm({ returnMileageKm: sanitize2(e.target.value) }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车电量（kWh）' },
					React.createElement(Input, { value: vehicleInfo.deliveryBatteryKwh, disabled: true, addonAfter: 'kWh' })
				),
				React.createElement(FormItem, { label: '还车电量（kWh）', required: true },
					React.createElement(Input, {
						value: form.returnBatteryKwh,
						placeholder: '请输入还车电量',
						addonAfter: 'kWh',
						onChange: function (e) { updateForm({ returnBatteryKwh: sanitize2(e.target.value) }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车氢量（' + form.hydrogenUnit + '）' },
					React.createElement(Input, { value: vehicleInfo.deliveryHydrogenAmount, disabled: true, addonAfter: form.hydrogenUnit })
				),
				React.createElement(FormItem, { label: '还车氢量（' + form.hydrogenUnit + '）', required: true },
					React.createElement(Input, {
						value: form.returnHydrogenAmount,
						placeholder: '请输入还车氢量',
						addonAfter: form.hydrogenUnit,
						onChange: function (e) { updateForm({ returnHydrogenAmount: sanitize2(e.target.value) }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '接车服务费' },
					React.createElement(Input, {
						value: form.serviceFee,
						placeholder: '请输入接车服务费金额',
						addonAfter: '元',
						onChange: function (e) { updateForm({ serviceFee: sanitize2(e.target.value) }); }
					})
				)
			),

			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车检查单', fullWidth: true },
					React.createElement(Button, { onClick: function () { inspectionDrawerOpenState[1](true); } }, '还车检查单')
				)
			)
		),

		React.createElement(Card, { title: '还车照片', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				ReturnPhotoGridColumn(
					'车辆',
					Object.keys(deliveryPhotos.vehicle || {}),
					true,
					deliveryPhotos.vehicle,
					returnPhotos.vehicle,
					function (slot, list) {
						setReturnPhotos(function (prev) {
							var next = Object.assign({}, prev);
							next.vehicle = Object.assign({}, prev.vehicle);
							next.vehicle[slot] = list;
							return next;
						});
					}
				),
				ReturnPhotoGridColumn(
					'底盘',
					Object.keys(deliveryPhotos.chassis || {}),
					true,
					deliveryPhotos.chassis,
					returnPhotos.chassis,
					function (slot, list) {
						setReturnPhotos(function (prev) {
							var next = Object.assign({}, prev);
							next.chassis = Object.assign({}, prev.chassis);
							next.chassis[slot] = list;
							return next;
						});
					}
				),
				React.createElement('div', { style: { gridColumn: 'span 2' } },
					ReturnPhotoGridColumn(
						'轮胎',
						Object.keys(deliveryPhotos.tire || {}),
						true,
						deliveryPhotos.tire,
						returnPhotos.tire,
						function (slot, list) {
							setReturnPhotos(function (prev) {
								var next = Object.assign({}, prev);
								next.tire = Object.assign({}, prev.tire);
								next.tire[slot] = list;
								return next;
							});
						}
					)
				)
			),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 } },
				(function () {
					// 瑕疵：左侧展示交车时照片（仅查看），右侧上传还车照片（最多4张）
					var left = (deliveryPhotos.defect || []).slice(0, 4);
					return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, '瑕疵'),
						React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { width: 260 } },
								React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } }, left.map(function (f) {
									return React.createElement('div', { key: f.uid },
										PreviewDeliveryThumb({ url: f.url, title: '交车瑕疵' }),
										null
									);
								})),
								React.createElement('div', { style: { fontSize: 12, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { flex: '1 1 220px', minWidth: 220 } },
								React.createElement(UploadBox, {
									label: null,
									value: returnPhotos.defect,
									max: 4,
									onChange: function (l) { setReturnPhotos(function (prev) { return Object.assign({}, prev, { defect: l || [] }); }); },
									tip: '最多支持上传4张'
								})
							)
						)
					);
				})(),
				(function () {
					// 其他：同瑕疵结构
					var left = (deliveryPhotos.other || []).slice(0, 4);
					return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, '其他'),
						React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { width: 260 } },
								React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } }, left.map(function (f) {
									return React.createElement('div', { key: f.uid },
										PreviewDeliveryThumb({ url: f.url, title: '交车其他' })
									);
								})),
								React.createElement('div', { style: { fontSize: 12, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { flex: '1 1 220px', minWidth: 220 } },
								React.createElement(UploadBox, {
									label: null,
									value: returnPhotos.other,
									max: 4,
									onChange: function (l) { setReturnPhotos(function (prev) { return Object.assign({}, prev, { other: l || [] }); }); },
									tip: '最多支持上传4张'
								})
							)
						)
					);
				})()
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleSave }, '保存'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),

		// 预览 Modal
		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: function () { previewState[1]({ open: false, url: '', title: '' }); },
			width: 860
		},
			previewState[0].url ? React.createElement('img', { src: previewState[0].url, style: { width: '100%', maxHeight: '70vh', objectFit: 'contain' } }) : null
		),

		// OCR Modal（备胎胎纹深度识别）
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
					React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#999', lineHeight: 1.7 } },
						'提示：识别中请勿关闭页面；点击确认后将反写至“还车时备胎胎纹深度”。'
					)
				)
			)
		),

		// 还车检查抽屉
		React.createElement(Drawer, {
			open: inspectionDrawerOpenState[0],
			title: '还车检查单',
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
			width: 860,
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		},
			React.createElement('div', { style: { whiteSpace: 'pre-wrap', lineHeight: 1.7 } },
				'一个「数字化资产ONEOS运管平台」中的「还车管理」「还车」模块\\n'
				+ '1.面包屑：\\n'
				+ '1.1.运维管理-车辆业务-还车管理-还车\\n\\n'
				+ '2.合同信息：\\n'
				+ '2.1.合同编码：显示该车辆对应合同编码；\\n'
				+ '2.2.项目名称：显示该车辆对应项目名称；\\n'
				+ '2.3.客户名称：显示该车辆对应客户名称；\\n'
				+ '2.4.业务部门：显示该车辆合同对应业务部门；\\n'
				+ '2.5.业务负责人：显示该车辆合同对应业务负责人；\\n\\n'
				+ '3.车辆信息：\\n'
				+ '3.1.车牌号：显示该车辆车牌号；\\n'
				+ '3.2.车辆型号：显示该车辆型号；\\n'
				+ '3.3.品牌：显示该车辆品牌；\\n'
				+ '3.4.型号：显示该车辆型号；\\n'
				+ '3.5.交车时间：显示该车辆交车时间，格式为：YYYY-MM-DD HH:MM；\\n'
				+ '3.6.交车地点：显示该车辆交车地点，格式为：省-市；\\n\\n'
				+ '4.还车明细：\\n'
				+ '4.1.还车人：必填项，输入框，默认显示交车时司机姓名（从OCR自动识别身份证）；\\n'
				+ '4.2.还车人电话：必填项，输入框，默认显示交车时司机手机号（从司机扫码培训时验证的手机号）；\\n'
				+ '4.3.还车人身份证：必填项，输入框，默认显示还车时司机身份证号（从OCR自动识别身份证）；\\n'
				+ '4.4.还车地点：必填项，选择器，选项为停车场、维修站，默认提示：请选择还车地点；\\n'
				+ '4.5.停车场/维修站：必填项，选择器，选择停车场或维修站；当还车地点为停车场时，字段名称为停车场，当还车地点为维修站时，字段名称为维修站；\\n'
				+ '4.6.到达时间：必填项，日期选择器，输入框单日历，支持选择年月日，精确到分钟，格式为：YYYY-MM-DD HH:MM；\\n'
				+ '4.7.备胎照片：左侧为交车时备胎照片（仅查看，支持点击预览），右侧为图片上传按钮，支持单张照片上传，上传后按钮变为图片，支持点击图片预览和右上角删除，图片上传后提示识别中，然后弹出卡片，左侧为图片，右侧为胎纹深度：输入框(自动反写胎纹深度)，后缀为mm；\\n'
				+ '4.8.交车时备胎胎纹深度：输入框（禁用），显示交车时胎纹深度，后缀为mm；\\n'
				+ '4.9.还车时备胎胎纹深度：输入框，默认提示为请输入备胎胎纹深度，如上传备胎照片并确认后则自动反写OCR识别结果；\\n'
				+ '4.10.交车里程：输入框（禁用），显示交车时交车里程，后缀为km；\\n'
				+ '4.11.还车里程：必填项，输入框，支持2位小数输入，后缀为km；\\n'
				+ '4.12.交车电量：输入框（禁用），显示交车时交车电量，后缀为kWh；\\n'
				+ '4.13.还车电量：必填项，输入框，支持2位小数输入，后缀为kWh；\\n'
				+ '4.14.交车氢量：输入框（禁用），显示交车时交车氢量，后缀为MPa或%（根据车辆型号参数列表中仪表盘显示单位显示）；\\n'
				+ '4.15.还车氢量：必填项，输入框，支持2位小数输入，后缀为MPa或%（根据车辆型号参数列表中仪表盘显示单位显示）；\\n'
				+ '4.16.接车服务费：输入框，支持2位小数输入，后缀为元；\\n'
				+ '4.17.还车检查单：点击弹出抽屉，抽屉显示还车检查项（默认为交车时状态），下方为提交和返回按钮，参照交车管理-交车单-编辑中交车检查单；\\n\\n'
				+ '5.还车照片：参照交车管理-交车单-编辑中交车照片，只是所有上传按钮左侧增加交车照片显示（仅查看，支持点击预览）；\\n\\n'
				+ '所有交车时照片下方增加文字提示：交车时照片\\n\\n'
				+ '4.底部为提交、取消按钮；\\n'
				+ '  4.1.提交：点击进行二次确认，点击确认完成该车辆还车，并将该记录加入历史记录；\\n'
				+ '  4.2.保存：点击暂存还车单（不做校验）；\\n'
				+ '  4.2.取消：点击返回还车管理页；'
			)
		)
	);
};

