// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 还车管理 - 查看（只读）

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

	// ---------- utils ----------
	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#f5222d', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
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
			url ? React.createElement('img', {
				src: url,
				style: { width: '100%', height: '100%', objectFit: 'cover', cursor: disabled ? 'default' : 'pointer' },
				onClick: disabled ? undefined : onPreview
			}) : null,
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
		var value = props.value || []; // array of {uid,name,url}
		var max = props.max || 1;
		var disabled = !!props.disabled;
		var tip = props.tip;

		return React.createElement('div', null,
			label ? React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, label) : null,
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
				(value || []).map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(
							f.url,
							function () { previewState[1]({ open: true, url: f.url, title: f.name || '预览' }); },
							null,
							false
						)
					);
				}),
				disabled ? null : ((value || []).length >= max ? null : React.createElement('div', {
					style: {
						width: 64,
						height: 64,
						borderRadius: 4,
						border: '1px dashed #d9d9d9',
						background: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#999'
					}
				}, '上传'))
			),
			tip ? React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#999' } }, tip) : null
		);
	}

	// ---------- styles ----------
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

	// ---------- mock data（与还车页一致） ----------
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
	var requirementModalOpenState = useState(false);
	var inspectionDrawerOpenState = useState(false);

	var [returnPhotos, setReturnPhotos] = useState(function () {
		function u(txt) { return 'https://dummyimage.com/600x400/eee/666&text=' + encodeURIComponent(txt); }
		return {
			vehicle: {},
			chassis: {},
			tire: {},
			defect: [
				{ uid: 'rd1', name: '还车瑕疵1.jpg', url: u('还车-瑕疵1') }
			],
			other: [
				{ uid: 'ro1', name: '还车其他1.jpg', url: u('还车-其他1') }
			]
		};
	});

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

	var [form] = useState(function () {
		return {
			returnPerson: '张三',
			returnPhone: '13800138001',
			returnIdCard: '320101199001018888',
			returnPlaceType: 'parking',
			returnPlaceName: '停车场A',
			arriveTime: '2025-03-12 10:20',
			spareTirePhoto: [{ uid: 'sp1', name: '还车备胎照片.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=还车备胎照片' }],
			spareTireDepth: '6.10',
			returnMileageKm: '16280.50',
			returnBatteryKwh: '60.20',
			returnHydrogenAmount: '20.10',
			hydrogenUnit: vehicleInfo.hydrogenUnit,
			serviceFee: '120.00'
		};
	});

	// ---------- inspection checklist（只读） ----------
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
					key: 'v-ins-' + i + '-' + j,
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

	var inspectionList = useMemo(function () { return buildInspectionList(); }, []);
	var inspectionListRef = useRef(null);
	inspectionListRef.current = inspectionList;

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
						? React.createElement(Input, { value: record.treadDepth, disabled: true, addonAfter: 'mm' })
						: React.createElement(Switch, { checked: !!record.checked, disabled: true });
				}
			},
			{
				title: '备注',
				dataIndex: 'remark',
				key: 'remark',
				render: function (_, record) {
					return React.createElement(Input, { value: record.remark, disabled: true });
				}
			}
		];
	}, []);

	// ---------- helpers ----------
	function PreviewDeliveryThumb(props) {
		var url = props.url;
		if (!url) return React.createElement('div', { style: { width: 64, height: 64, borderRadius: 4, border: '1px solid #f0f0f0', background: '#fafafa' } });
		return makeThumb(url,
			function () { previewState[1]({ open: true, url: url, title: props.title || '交车照片预览' }); },
			null,
			false
		);
	}

	function ReturnPhotoGridColumn(title, slots, required, deliveryMap, returnMap) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, required ? RequiredLabel(title) : title),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				(slots || []).map(function (slot) {
					var deliveryArr = (deliveryMap && deliveryMap[slot]) || [];
					var deliveryUrl = deliveryArr && deliveryArr[0] ? deliveryArr[0].url : '';
					var retArr = (returnMap && returnMap[slot]) || [];
					return React.createElement('div', { key: slot },
						React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, required ? RequiredLabel(slot) : slot),
						React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
								PreviewDeliveryThumb({ url: deliveryUrl, title: slot }),
								React.createElement('div', { style: { fontSize: 11, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
								retArr && retArr[0]
									? makeThumb(retArr[0].url, function () { previewState[1]({ open: true, url: retArr[0].url, title: retArr[0].name || '还车照片' }); }, null, false)
									: React.createElement('div', { style: { width: 64, height: 64, borderRadius: 4, border: '1px dashed #d9d9d9', background: '#fff' } }),
								React.createElement('div', { style: { fontSize: 11, color: '#999', marginTop: 6 } }, '还车照片')
							)
						)
					);
				})
			)
		);
	}

	var handleBack = useCallback(function () {
		message.info('返回还车管理页（原型）');
	}, []);

	// ---------- render ----------
	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '还车管理' }, { title: '查看' }] }),
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
					React.createElement(Input, { value: vehicleInfo.deliveryTime, disabled: true })
				),
				React.createElement(FormItem, { label: '交车地点（省-市）' },
					React.createElement(Input, { value: vehicleInfo.deliveryRegion, disabled: true })
				)
			)
		),

		React.createElement(Card, { title: '还车明细', style: cardStyle },
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车人', required: true },
					React.createElement(Input, { value: form.returnPerson, disabled: true })
				),
				React.createElement(FormItem, { label: '还车人电话', required: true },
					React.createElement(Input, { value: form.returnPhone, disabled: true })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车人身份证', required: true },
					React.createElement(Input, { value: form.returnIdCard, disabled: true })
				),
				React.createElement(FormItem, { label: '还车地点', required: true },
					React.createElement(Select, {
						placeholder: '请选择还车地点',
						value: form.returnPlaceType,
						disabled: true,
						options: [
							{ value: 'parking', label: '停车场' },
							{ value: 'repair', label: '维修站' }
						]
					})
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: form.returnPlaceType === 'parking' ? '停车场' : '维修站', required: true },
					React.createElement(Select, {
						placeholder: '请选择',
						value: form.returnPlaceName,
						disabled: true,
						showSearch: true,
						filterOption: filterOption,
						options: [{ value: form.returnPlaceName, label: form.returnPlaceName }]
					})
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '到达时间', required: true, fullWidth: true },
					React.createElement(DatePicker, {
						showTime: { format: 'HH:mm' },
						format: 'YYYY-MM-DD HH:mm',
						style: { width: '100%' },
						disabled: true,
						value: (function () {
							var dayjs = window.dayjs;
							return form.arriveTime && dayjs ? dayjs(form.arriveTime) : null;
						})()
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
							UploadBox({ label: null, value: form.spareTirePhoto, max: 1, disabled: true })
						)
					)
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车时备胎胎纹深度' },
					React.createElement(Input, { value: vehicleInfo.deliverySpareTireDepth, disabled: true, addonAfter: 'mm' })
				),
				React.createElement(FormItem, { label: '还车时备胎胎纹深度', required: true },
					React.createElement(Input, { value: form.spareTireDepth, disabled: true, addonAfter: 'mm' })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车里程（km）' },
					React.createElement(Input, { value: vehicleInfo.deliveryMileageKm, disabled: true, addonAfter: 'km' })
				),
				React.createElement(FormItem, { label: '还车里程（km）', required: true },
					React.createElement(Input, { value: form.returnMileageKm, disabled: true, addonAfter: 'km' })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车电量（kWh）' },
					React.createElement(Input, { value: vehicleInfo.deliveryBatteryKwh, disabled: true, addonAfter: 'kWh' })
				),
				React.createElement(FormItem, { label: '还车电量（kWh）', required: true },
					React.createElement(Input, { value: form.returnBatteryKwh, disabled: true, addonAfter: 'kWh' })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '交车氢量（' + form.hydrogenUnit + '）' },
					React.createElement(Input, { value: vehicleInfo.deliveryHydrogenAmount, disabled: true, addonAfter: form.hydrogenUnit })
				),
				React.createElement(FormItem, { label: '还车氢量（' + form.hydrogenUnit + '）', required: true },
					React.createElement(Input, { value: form.returnHydrogenAmount, disabled: true, addonAfter: form.hydrogenUnit })
				)
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '接车服务费' },
					React.createElement(Input, { value: form.serviceFee, disabled: true, addonAfter: '元' })
				),
				React.createElement('div', { style: styles.formItem })
			),
			React.createElement('div', { style: styles.formRow },
				React.createElement(FormItem, { label: '还车检查单', fullWidth: true },
					React.createElement(Button, { onClick: function () { inspectionDrawerOpenState[1](true); } }, '还车检查单')
				)
			)
		),

		React.createElement(Card, { title: '还车照片', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				ReturnPhotoGridColumn('车辆', Object.keys(deliveryPhotos.vehicle || {}), true, deliveryPhotos.vehicle, returnPhotos.vehicle),
				ReturnPhotoGridColumn('底盘', Object.keys(deliveryPhotos.chassis || {}), true, deliveryPhotos.chassis, returnPhotos.chassis),
				React.createElement('div', { style: { gridColumn: 'span 2' } },
					ReturnPhotoGridColumn('轮胎', Object.keys(deliveryPhotos.tire || {}), true, deliveryPhotos.tire, returnPhotos.tire)
				)
			),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 } },
				(function () {
					var left = (deliveryPhotos.defect || []).slice(0, 4);
					return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, '瑕疵'),
						React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { width: 260 } },
								React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } }, left.map(function (f) {
									return React.createElement('div', { key: f.uid }, PreviewDeliveryThumb({ url: f.url, title: '交车瑕疵' }));
								})),
								React.createElement('div', { style: { fontSize: 12, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { flex: '1 1 220px', minWidth: 220 } },
								UploadBox({ label: null, value: returnPhotos.defect, max: 4, disabled: true, tip: '还车照片' })
							)
						)
					);
				})(),
				(function () {
					var left = (deliveryPhotos.other || []).slice(0, 4);
					return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, '其他'),
						React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
							React.createElement('div', { style: { width: 260 } },
								React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } }, left.map(function (f) {
									return React.createElement('div', { key: f.uid }, PreviewDeliveryThumb({ url: f.url, title: '交车其他' }));
								})),
								React.createElement('div', { style: { fontSize: 12, color: '#999', marginTop: 6 } }, '交车时照片')
							),
							React.createElement('div', { style: { flex: '1 1 220px', minWidth: 220 } },
								UploadBox({ label: null, value: returnPhotos.other, max: 4, disabled: true, tip: '还车照片' })
							)
						)
					);
				})()
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { onClick: handleBack }, '返回')
		),

		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: function () { previewState[1]({ open: false, url: '', title: '' }); },
			width: 860
		},
			previewState[0].url ? React.createElement('img', { src: previewState[0].url, style: { width: '100%', maxHeight: '70vh', objectFit: 'contain' } }) : null
		),

		React.createElement(Drawer, {
			open: inspectionDrawerOpenState[0],
			title: '还车检查单',
			width: 920,
			placement: 'right',
			onClose: function () { inspectionDrawerOpenState[1](false); },
			styles: { body: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start', gap: 8 } },
				React.createElement(Button, { type: 'primary', disabled: true }, '提交'),
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
				'还车管理-查看\\n一个「数字化资产ONEOS运管平台」中的「还车管理」「查看」模块\\n\\n说明：本页为只读查看态，所有控件禁用，仅用于查看还车单信息与照片。\\n\\n1.面包屑：\\n1.1.运维管理-车辆业务-还车管理-查看\\n\\n2.合同信息：合同编码、项目名称、客户名称、业务部门、业务负责人\\n3.车辆信息：车牌号、车辆型号、品牌、型号、交车时间、交车地点（省-市）\\n4.还车明细：展示还车人/电话/身份证、还车地点、停车场/维修站、到达时间、备胎照片与胎纹深度、里程/电量/氢量、接车服务费、还车检查单（可展开查看）\\n5.还车照片：左侧展示交车时照片（含“交车时照片”提示），右侧展示还车照片（只读可预览）\\n6.底部：返回按钮，返回还车管理页'
			)
		)
	);
};

