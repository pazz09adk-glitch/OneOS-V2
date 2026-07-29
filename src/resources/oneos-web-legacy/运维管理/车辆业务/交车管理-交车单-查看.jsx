// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 交车管理 - 交车单 - 查看（只读）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
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

	function makeThumb(url, onPreview) {
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
				onClick: onPreview
			})
		);
	}

	function ReadonlyUploadBox(props) {
		var label = props.label;
		var value = props.value; // array of {name,url}
		var tip = props.tip;
		var onPreview = props.onPreview;

		return React.createElement('div', null,
			React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, label),
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
				(value || []).length > 0
					? (value || []).map(function (f) {
						return React.createElement('div', { key: f.uid },
							makeThumb(f.url, function () { onPreview && onPreview(f); })
						);
					})
					: React.createElement('div', { style: { fontSize: 12, color: '#999' } }, '暂无')
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
		var fullWidth = !!props.fullWidth;
		return React.createElement('div', { style: fullWidth ? Object.assign({}, styles.formItem, { flex: '0 0 100%' }) : styles.formItem },
			React.createElement('div', { style: styles.label }, label),
			props.children
		);
	}

	// ---------- mock data (只读样例) ----------
	var reserveVehicles = useMemo(function () {
		return [
			{ plateNo: '京A12345', vehicleType: '牵引车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', hasAd: true, hasTailboard: true },
			{ plateNo: '京C11111', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', hasAd: false, hasTailboard: false }
		];
	}, []);

	var plateOptions = useMemo(function () {
		return reserveVehicles.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, [reserveVehicles]);

	var initialForm = useMemo(function () {
		return {
			plateNo: '京A12345',
			vehicleType: '牵引车',
			brand: '东风',
			model: 'DFH1180',
			vin: 'LGHXCAE28M1234567',

			hasAd: true,
			adPhoto: [{ uid: 'ad1', name: '广告照片.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=Ad' }],
			bigWordPhoto: [{ uid: 'bw1', name: '放大字照片.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=BigWord' }],

			hasTailboard: true,

			spareTirePhoto: [{ uid: 'sp1', name: '备胎照片.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=SpareTire' }],
			spareTireDepth: '6.50',

			trainingRecognized: true,
			driverLicenses: [
				{ uid: 'id1', name: '身份证正面.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=ID-Front' },
				{ uid: 'id2', name: '身份证反面.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=ID-Back' },
				{ uid: 'dl', name: '驾驶证.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=DriverLicense' },
				{ uid: 'qc', name: '从业资格证.jpg', url: 'https://dummyimage.com/600x400/eee/666&text=Qualification' }
			],

			mileageKm: '120',
			batteryKwh: '86',
			hydrogenAmount: '35.60',
			serviceFee: '200.00'
		};
	}, []);

	var photos = useMemo(function () {
		function one(uid, name) {
			return [{ uid: uid, name: name + '.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=' + encodeURIComponent(name) }];
		}
		return {
			vehicle: {
				'仪表盘': one('v1', '车辆-仪表盘'),
				'车辆正面': one('v2', '车辆-正面'),
				'车辆左前方': one('v3', '车辆-左前方'),
				'车辆左后方': one('v4', '车辆-左后方'),
				'车辆右后方': one('v5', '车辆-右后方'),
				'车辆右前方': one('v6', '车辆-右前方')
			},
			chassis: {
				'正前方底部': one('c1', '底盘-正前方'),
				'左侧前方底部': one('c2', '底盘-左前'),
				'左侧后方底部': one('c3', '底盘-左后'),
				'正后方底部': one('c4', '底盘-正后方'),
				'右侧后方底部': one('c5', '底盘-右后'),
				'右侧前方底部': one('c6', '底盘-右前')
			},
			tire: {
				'左前轮': one('t1', '轮胎-左前'),
				'左后轮（内）': one('t2', '轮胎-左后内'),
				'左后轮（外）': one('t3', '轮胎-左后外'),
				'右前轮': one('t4', '轮胎-右前'),
				'右后轮（内）': one('t5', '轮胎-右后内'),
				'右后轮（外）': one('t6', '轮胎-右后外'),
				'备胎': one('t7', '轮胎-备胎')
			},
			defect: [{ uid: 'd1', name: '瑕疵1.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=Defect-1' }],
			other: [{ uid: 'o1', name: '其他1.jpg', url: 'https://dummyimage.com/640x360/eee/666&text=Other-1' }]
		};
	}, []);

	// ---------- inspection checklist (只读样例) ----------
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

	var inspectionList = useMemo(function () {
		var list = [];
		var cats = Object.keys(inspectionCategoryItems);
		for (var i = 0; i < cats.length; i++) {
			var cat = cats[i];
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
	}, [inspectionCategoryItems]);

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
					var isTire = record && record.category === '轮胎';
					return isTire
						? React.createElement(Input, { value: record.treadDepth, disabled: true, placeholder: '请输入胎纹深度', addonAfter: 'mm' })
						: React.createElement(Switch, { checked: !!record.checked, disabled: true });
				}
			},
			{
				title: '备注',
				dataIndex: 'remark',
				key: 'remark',
				render: function (_, record) {
					return React.createElement(Input, { value: record.remark, disabled: true, placeholder: '请输入' });
				}
			}
		];
	}, []);

	// ---------- states ----------
	var previewState = useState({ open: false, url: '', title: '' });
	var inspectionDrawerOpenState = useState(false);

	function openPreview(file) {
		if (!file) return;
		previewState[1]({ open: true, url: file.url, title: file.name || '预览' });
	}

	function goBack() {
		try {
			if (window.history && window.history.length > 1) window.history.back();
			else message.info('返回上一页（原型）');
		} catch (e) {
			message.info('返回上一页（原型）');
		}
	}

	// ---------- render helpers ----------
	function PhotoGridColumn(title, items, required) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, required ? RequiredLabel(title) : title),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
				items.map(function (it) {
					return React.createElement('div', { key: it.key },
						ReadonlyUploadBox({ label: required ? RequiredLabel(it.label) : it.label, value: it.value, onPreview: openPreview })
					);
				})
			)
		);
	}

	function PhotoGridSimple(title, value) {
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 } },
			React.createElement('div', { style: { fontWeight: 600, marginBottom: 12 } }, title),
			ReadonlyUploadBox({ label: '照片', value: value, onPreview: openPreview })
		);
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '交车管理' }, { title: '交车单-查看' }] })
		),

		React.createElement(Card, { title: '交车明细', style: cardStyle },
			React.createElement('div', null,
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车牌号' },
						React.createElement(Select, {
							value: initialForm.plateNo,
							options: plateOptions,
							showSearch: true,
							filterOption: filterOption,
							placeholder: '请输入或选择车牌号',
							allowClear: true,
							disabled: true,
							style: { width: '100%' }
						})
					),
					React.createElement(FormItem, { label: '车辆类型' },
						React.createElement(Input, { value: initialForm.vehicleType, disabled: true })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '品牌' },
						React.createElement(Input, { value: initialForm.brand, disabled: true })
					),
					React.createElement(FormItem, { label: '型号' },
						React.createElement(Input, { value: initialForm.model, disabled: true })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车辆识别代码' },
						React.createElement(Input, { value: initialForm.vin, disabled: true })
					),
					React.createElement('div', { style: styles.formItem })
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '车身广告及放大字', fullWidth: true },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
							React.createElement(Switch, { checked: !!initialForm.hasAd, disabled: true }),
							React.createElement('span', { style: { color: '#666', fontSize: 12 } }, initialForm.hasAd ? '有车身广告' : '无车身广告')
						)
					)
				),
				initialForm.hasAd ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } },
					React.createElement('div', null,
						ReadonlyUploadBox({ label: '广告照片', value: initialForm.adPhoto, max: 1, onPreview: openPreview })
					),
					React.createElement('div', null,
						ReadonlyUploadBox({ label: '放大字照片', value: initialForm.bigWordPhoto, max: 1, onPreview: openPreview })
					)
				) : null,

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '尾板', fullWidth: true },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
							React.createElement(Switch, { checked: !!initialForm.hasTailboard, disabled: true }),
							React.createElement('span', { style: { color: '#666', fontSize: 12 } }, initialForm.hasTailboard ? '有尾板' : '无尾板')
						)
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '备胎照片' },
						ReadonlyUploadBox({ label: '', value: initialForm.spareTirePhoto, onPreview: openPreview })
					),
					React.createElement(FormItem, { label: '备胎胎纹深度' },
						React.createElement(Input, { value: initialForm.spareTireDepth, placeholder: '请输入备胎胎纹深度', addonAfter: 'mm', disabled: true })
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '驾驶培训', fullWidth: true },
						React.createElement('span', { style: { color: '#52c41a', fontWeight: 600 } }, '已完成视频培训')
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '司机证照', fullWidth: true },
						React.createElement('div', null,
							(initialForm.driverLicenses && initialForm.driverLicenses.length > 0)
								? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 } },
									initialForm.driverLicenses.map(function (f) {
										return React.createElement('div', { key: f.uid },
											makeThumb(f.url, function () { previewState[1]({ open: true, url: f.url, title: f.name || '预览' }); }),
											React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#666' } }, f.name)
										);
									})
								)
								: React.createElement('div', { style: { fontSize: 12, color: '#999' } }, '上传验车码后显示')
						)
					)
				),

				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '交车里程' },
						React.createElement(Input, { value: initialForm.mileageKm, addonAfter: '公里', disabled: true })
					),
					React.createElement(FormItem, { label: '交车电量' },
						React.createElement(Input, { value: initialForm.batteryKwh, addonAfter: 'kWh', disabled: true })
					)
				),
				React.createElement('div', { style: styles.formRow },
					React.createElement(FormItem, { label: '交车氢量' },
						React.createElement(Input, { value: initialForm.hydrogenAmount, addonAfter: 'MPa', disabled: true })
					),
					React.createElement(FormItem, { label: '送车服务费' },
						React.createElement(Input, { value: isEmpty(initialForm.serviceFee) ? '' : toFixed2(initialForm.serviceFee), placeholder: '请输入送车服务费金额', addonAfter: '元', disabled: true })
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
					return { key: 'v-' + k, label: k, value: photos.vehicle[k] };
				}), true),
				PhotoGridColumn('底盘', Object.keys(photos.chassis).map(function (k) {
					return { key: 'c-' + k, label: k, value: photos.chassis[k] };
				}), true),
				PhotoGridColumn('轮胎', Object.keys(photos.tire).map(function (k) {
					return { key: 't-' + k, label: k, value: photos.tire[k] };
				}), true)
			),
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 12 } },
				PhotoGridSimple('瑕疵', photos.defect),
				PhotoGridSimple('其他', photos.other),
				React.createElement('div', { style: { background: 'transparent' } })
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { onClick: goBack }, '返回')
		),

		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: function () { previewState[1]({ open: false, url: '', title: '' }); },
			width: 860
		},
			React.createElement('div', { style: { textAlign: 'center' } },
				previewState[0].url ? React.createElement('img', { src: previewState[0].url, style: { maxWidth: '100%', maxHeight: '70vh' } }) : null
			)
		),

		React.createElement(Drawer, {
			open: inspectionDrawerOpenState[0],
			title: '交车检查单',
			width: 920,
			placement: 'right',
			onClose: function () { inspectionDrawerOpenState[1](false); },
			styles: { body: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start', gap: 8 } },
				React.createElement(Button, { onClick: function () { inspectionDrawerOpenState[1](false); } }, '返回')
			)
		},
			React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto' } },
				React.createElement(Table, { rowKey: 'key', columns: inspectionColumns, dataSource: inspectionList, pagination: false, bordered: true, size: 'small' })
			)
		)
	);
};

