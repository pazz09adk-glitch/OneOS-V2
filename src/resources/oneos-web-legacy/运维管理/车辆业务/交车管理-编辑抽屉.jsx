// 交车管理 - 列表内编辑抽屉（参照 交车管理-交车单-编辑.jsx）
// 使用方式：window.DeliveryEditDrawer(props)

function DeliveryEditDrawer(props) {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var open = props.open;
	var record = props.record;
	var onClose = props.onClose;
	var onSave = props.onSave;
	var onSubmit = props.onSubmit;

	var antd = window.antd;
	var Drawer = antd.Drawer;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Switch = antd.Switch;
	var Modal = antd.Modal;
	var Table = antd.Table;
	var Tag = antd.Tag;
	var message = antd.message;

	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#ef4444', fontWeight: 600 } }, '*'),
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
		} catch (e) { cb(e); }
	}

	var reserveVehicles = useMemo(function () {
		return [
			{ plateNo: '京A12345', vehicleType: '牵引车', brand: '东风', model: 'DFH1180', vin: 'LJNAU1A2XK1234567', hasAd: true, adPhoto: [{ uid: 'ad1', name: '广告照片.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Ad' }], bigWordPhoto: [{ uid: 'bw1', name: '放大字.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=BigWord' }], hasTailboard: true },
			{ plateNo: '浙F80088', vehicleType: '厢式车', brand: '福田', model: 'BJ1180', vin: 'LJNAU1A2XK7654321', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false },
			{ plateNo: '沪A30003', vehicleType: '厢式车', brand: '重汽', model: 'HOWO-T5G', vin: 'LJNAU1A2XK9999000', hasAd: true, adPhoto: [{ uid: 'ad2', name: '广告2.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Ad2' }], bigWordPhoto: [{ uid: 'bw2', name: '放大字2.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=BW2' }], hasTailboard: true },
			{ plateNo: '粤AGP4598', vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB9RR223402', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false }
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

	function buildInitialForm(rec) {
		var plate = (rec && rec.plateNo && String(rec.plateNo).trim()) || undefined;
		var veh = plate ? vehicleByPlate[plate] : null;
		if (!veh && rec && rec.brand) {
			veh = { plateNo: plate, vehicleType: rec.vehicleType || '', brand: rec.brand || '', model: rec.model || '', vin: rec.vin || '', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false };
		}
		return {
			plateNo: plate,
			vehicleType: (veh && veh.vehicleType) || (rec && rec.vehicleType) || '',
			brand: (veh && veh.brand) || (rec && rec.brand) || '',
			model: (veh && veh.model) || (rec && rec.model) || '',
			vin: (veh && veh.vin) || (rec && rec.vin) || '',
			hasAd: !!(veh && veh.hasAd),
			adPhoto: (veh && veh.adPhoto) || [],
			bigWordPhoto: (veh && veh.bigWordPhoto) || [],
			hasTailboard: !!(veh && veh.hasTailboard),
			spareTirePhoto: [],
			spareTireDepth: '',
			trainingRecognized: false,
			driverLicenses: [],
			mileageKm: rec && rec.deliveryMileage != null ? String(rec.deliveryMileage) : '',
			batteryPct: rec && rec.deliveryElec != null ? String(rec.deliveryElec) : '',
			hydrogenAmount: rec && rec.deliveryH2 != null ? String(rec.deliveryH2) : '',
			hydrogenUnit: (rec && rec.deliveryH2Unit === 'MPa') ? 'MPa' : '%',
			serviceFee: ''
		};
	}

	var formState = useState(buildInitialForm(null));
	var form = formState[0];
	var setForm = formState[1];
	var activeSectionState = useState('basic');
	var activeSection = activeSectionState[0];
	var setActiveSection = activeSectionState[1];
	var submittingState = useState(false);
	var submitting = submittingState[0];
	var setSubmitting = submittingState[1];
	var previewState = useState({ open: false, url: '', title: '' });
	var ocrModalState = useState({ open: false, photoUrl: '', depth: '6.50' });
	var inspectionOpenState = useState(false);
	var trainingInputRef = useRef(null);

	useEffect(function () {
		if (open && record) {
			setForm(buildInitialForm(record));
			setActiveSection('basic');
			setSubmitting(false);
		}
	}, [open, record && record.id]);

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
			trainingRecognized: false,
			driverLicenses: []
		});
	}

	function makeThumb(url, onPreview, onRemove) {
		return React.createElement('div', { style: { width: 72, height: 72, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', background: '#f8fafc' } },
			React.createElement('img', { src: url, style: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }, onClick: onPreview }),
			onRemove ? React.createElement('button', {
				type: 'button',
				'aria-label': '删除图片',
				style: { position: 'absolute', right: 4, top: 4, width: 22, height: 22, borderRadius: 999, border: 'none', background: 'rgba(15,23,42,.65)', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: '22px', padding: 0 },
				onClick: function (e) { e.stopPropagation(); onRemove(); }
			}, '×') : null
		);
	}

	function UploadBox(uploadProps) {
		var label = uploadProps.label;
		var value = uploadProps.value || [];
		var max = uploadProps.max || 1;
		var onChange = uploadProps.onChange;
		function handlePick(e) {
			var f = e && e.target && e.target.files && e.target.files[0];
			if (!f) return;
			fileToDataUrl(f, function (err, url) {
				if (err) { message.error('上传失败'); return; }
				var next = value.slice();
				next.push({ uid: String(Date.now()), name: f.name || 'image', url: url });
				if (next.length > max) next = next.slice(next.length - max);
				onChange && onChange(next);
			});
			e.target.value = '';
		}
		return React.createElement('div', null,
			label ? React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 8, fontWeight: 500 } }, label) : null,
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
				value.map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(f.url, function () { previewState[1]({ open: true, url: f.url, title: f.name }); }, function () { onChange && onChange(value.filter(function (x) { return x.uid !== f.uid; })); })
					);
				}),
				value.length >= max ? null : React.createElement('label', { style: { width: 72, height: 72, borderRadius: 8, border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', fontSize: 13, background: '#fff', transition: 'border-color .2s' } },
					React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePick }),
					'上传'
				)
			)
		);
	}

	function FormItem(itemProps) {
		return React.createElement('div', { style: { marginBottom: 16, minWidth: 0 } },
			React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 } },
				itemProps.required ? RequiredLabel(itemProps.label) : itemProps.label
			),
			itemProps.children
		);
	}

	var inspectionListState = useState([{ key: 'ins-1', category: '车灯', item: '大灯', checked: true, treadDepth: '', remark: '' }]);
	var inspectionList = inspectionListState[0];

	var sectionNav = [
		{ key: 'basic', label: '车辆信息' },
		{ key: 'equip', label: '设备证照' },
		{ key: 'metrics', label: '交车数据' },
		{ key: 'photos', label: '交车照片' }
	];

	function scrollToSection(key) {
		setActiveSection(key);
		var el = document.getElementById('dv-edit-section-' + key);
		if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function validateSubmit() {
		if (isEmpty(form.plateNo)) return '请选择车牌号';
		if (form.hasAd) {
			if (!form.adPhoto.length) return '请上传广告照片';
			if (!form.bigWordPhoto.length) return '请上传放大字照片';
		}
		if (!form.spareTirePhoto.length) return '请上传备胎照片';
		if (isEmpty(form.spareTireDepth)) return '请填写备胎胎纹深度';
		if (!form.trainingRecognized) return '请上传验车码并完成识别';
		if (isEmpty(form.mileageKm)) return '请填写交车里程';
		if (isEmpty(form.batteryPct)) return '请填写交车电量';
		if (isEmpty(form.hydrogenAmount)) return '请填写交车氢量';
		return '';
	}

	function buildPatchFromForm() {
		return {
			plateNo: form.plateNo || '',
			vehicleType: form.vehicleType,
			brand: form.brand,
			model: form.model,
			vin: form.vin,
			deliveryMileage: form.mileageKm === '' ? null : Number(form.mileageKm),
			deliveryElec: form.batteryPct === '' ? null : Number(form.batteryPct),
			deliveryH2: form.hydrogenAmount === '' ? null : Number(form.hydrogenAmount),
			deliveryH2Unit: form.hydrogenUnit,
			deliveryStatus: '已保存'
		};
	}

	function handleSaveClick() {
		onSave && onSave(buildPatchFromForm());
		message.success('已保存');
	}

	function handleSubmitClick() {
		var err = validateSubmit();
		if (err) { message.error(err); return; }
		Modal.confirm({
			title: '确认交车',
			content: '请确认信息填写无误，点击确认完成该车辆交车。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setSubmitting(true);
				setTimeout(function () {
					setSubmitting(false);
					onSubmit && onSubmit(buildPatchFromForm());
					message.success('交车成功');
					onClose && onClose();
				}, 400);
			}
		});
	}

	function handleTrainingPick(e) {
		var f = e && e.target && e.target.files && e.target.files[0];
		if (!f) return;
		setTimeout(function () {
			updateForm({
				trainingRecognized: true,
				driverLicenses: [
					{ uid: 'id1', name: '身份证正面', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=ID-F' },
					{ uid: 'id2', name: '身份证反面', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=ID-B' },
					{ uid: 'dl', name: '驾驶证', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=DL' },
					{ uid: 'qc', name: '从业资格证', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=QC' }
				]
			});
			message.success('验车码识别成功');
		}, 500);
		e.target.value = '';
	}

	if (!open) return null;

	var drawerTitle = React.createElement('div', { style: { paddingRight: 24 } },
		React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 } }, '编辑交车单'),
		record ? React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' } },
			React.createElement(Tag, { style: { margin: 0, border: 'none', background: '#eff6ff', color: '#2563eb', fontWeight: 600 } }, record.customerName || '-'),
			React.createElement('span', null, record.contractCode || '-'),
			React.createElement(Tag, { style: { margin: 0, border: 'none', background: '#f1f5f9', color: '#475569' } }, record.deliveryStatus || '未开始')
		) : null
	);

	var summaryCard = record ? React.createElement('div', { style: { marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#f8fafc 0%,#fff 100%)', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px 16px', fontSize: 13 } },
		React.createElement('div', null, React.createElement('span', { style: { color: '#94a3b8' } }, '项目：'), record.projectName || '-'),
		React.createElement('div', null, React.createElement('span', { style: { color: '#94a3b8' } }, '交车地点：'), record.deliveryAddress || '-'),
		React.createElement('div', null, React.createElement('span', { style: { color: '#94a3b8' } }, '品牌型号：'), (record.brand || '-') + ' / ' + (record.model || '-')),
		React.createElement('div', null, React.createElement('span', { style: { color: '#94a3b8' } }, '任务来源：'), record.taskSource || '-')
	) : null;

	var sectionNavEl = React.createElement('div', { style: { position: 'sticky', top: 0, zIndex: 3, background: '#fff', padding: '8px 0 12px', marginBottom: 8, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap' } },
		sectionNav.map(function (s) {
			var active = activeSection === s.key;
			return React.createElement('button', {
				key: s.key,
				type: 'button',
				onClick: function () { scrollToSection(s.key); },
				style: {
					border: 'none',
					cursor: 'pointer',
					padding: '6px 14px',
					borderRadius: 999,
					fontSize: 13,
					fontWeight: active ? 600 : 500,
					background: active ? '#2563eb' : '#f1f5f9',
					color: active ? '#fff' : '#475569',
					transition: 'background .2s,color .2s'
				}
			}, s.label);
		})
	);

	var sectionBasic = React.createElement('div', { id: 'dv-edit-section-basic', style: { scrollMarginTop: 56 } },
		React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #2563eb' } }, '车辆信息'),
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0 16px' } },
			React.createElement(FormItem, { label: '车牌号', required: true },
				React.createElement(Select, { value: form.plateNo, options: plateOptions, showSearch: true, filterOption: filterOption, placeholder: '请输入或选择车牌号', allowClear: true, style: { width: '100%' }, onChange: handlePlateChange })
			),
			React.createElement(FormItem, { label: '车辆类型' }, React.createElement(Input, { value: form.vehicleType, disabled: true })),
			React.createElement(FormItem, { label: '品牌' }, React.createElement(Input, { value: form.brand, disabled: true })),
			React.createElement(FormItem, { label: '型号' }, React.createElement(Input, { value: form.model, disabled: true })),
			React.createElement(FormItem, { label: '车辆识别代码' }, React.createElement(Input, { value: form.vin, disabled: true }))
		)
	);

	var sectionEquip = React.createElement('div', { id: 'dv-edit-section-equip', style: { scrollMarginTop: 56, marginTop: 24 } },
		React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #2563eb' } }, '设备与证照'),
		React.createElement(FormItem, { label: '车身广告及放大字', required: true },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
				React.createElement(Switch, { checked: !!form.hasAd, onChange: function (v) { updateForm({ hasAd: !!v }); } }),
				React.createElement('span', { style: { fontSize: 13, color: '#64748b' } }, form.hasAd ? '有车身广告' : '无车身广告')
			)
		),
		form.hasAd ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 } },
			React.createElement(UploadBox, { label: RequiredLabel('广告照片'), value: form.adPhoto, max: 1, onChange: function (l) { updateForm({ adPhoto: l }); } }),
			React.createElement(UploadBox, { label: RequiredLabel('放大字照片'), value: form.bigWordPhoto, max: 1, onChange: function (l) { updateForm({ bigWordPhoto: l }); } })
		) : null,
		React.createElement(FormItem, { label: '尾板', required: true },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
				React.createElement(Switch, { checked: !!form.hasTailboard, onChange: function (v) { updateForm({ hasTailboard: !!v }); } }),
				React.createElement('span', { style: { fontSize: 13, color: '#64748b' } }, form.hasTailboard ? '有尾板' : '无尾板')
			)
		),
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
			React.createElement(UploadBox, { label: RequiredLabel('备胎照片'), value: form.spareTirePhoto, max: 1, onChange: function (l) { updateForm({ spareTirePhoto: l }); if (l && l.length) ocrModalState[1]({ open: true, photoUrl: l[0].url, depth: '6.50' }); } }),
			React.createElement(FormItem, { label: '备胎胎纹深度', required: true },
				React.createElement(Input, { value: form.spareTireDepth, placeholder: '请输入', addonAfter: 'mm', onChange: function (e) { updateForm({ spareTireDepth: e.target.value }); } })
			)
		),
		React.createElement(FormItem, { label: '驾驶培训', required: true },
			form.trainingRecognized
				? React.createElement('span', { style: { color: '#16a34a', fontWeight: 600, fontSize: 13 } }, '已完成视频培训')
				: React.createElement(React.Fragment, null,
					React.createElement('input', { type: 'file', ref: trainingInputRef, accept: 'image/*', style: { display: 'none' }, onChange: handleTrainingPick }),
					React.createElement(Button, { onClick: function () { trainingInputRef.current && trainingInputRef.current.click(); } }, '上传验车码')
				)
		),
		form.driverLicenses && form.driverLicenses.length ? React.createElement(FormItem, { label: '司机证照' },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 } },
				form.driverLicenses.map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(f.url, function () { previewState[1]({ open: true, url: f.url, title: f.name }); }),
						React.createElement('div', { style: { marginTop: 4, fontSize: 12, color: '#64748b', textAlign: 'center' } }, f.name)
					);
				})
			)
		) : null,
		React.createElement(FormItem, { label: '车辆检查' },
			React.createElement(Button, { onClick: function () { inspectionOpenState[1](true); } }, '交车检查单')
		)
	);

	var sectionMetrics = React.createElement('div', { id: 'dv-edit-section-metrics', style: { scrollMarginTop: 56, marginTop: 24 } },
		React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #2563eb' } }, '交车数据'),
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0 16px' } },
			React.createElement(FormItem, { label: '交车里程', required: true },
				React.createElement(Input, { value: form.mileageKm, placeholder: '请输入', addonAfter: 'km', onChange: function (e) { updateForm({ mileageKm: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '交车电量', required: true },
				React.createElement(Input, { value: form.batteryPct, placeholder: '请输入', addonAfter: '%', onChange: function (e) { updateForm({ batteryPct: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '交车氢量', required: true },
				React.createElement(Input, { value: form.hydrogenAmount, placeholder: '请输入', addonAfter: form.hydrogenUnit, onChange: function (e) { updateForm({ hydrogenAmount: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '送车服务费' },
				React.createElement(Input, { value: form.serviceFee, placeholder: '选填', addonAfter: '元', onChange: function (e) { updateForm({ serviceFee: e.target.value }); } })
			)
		)
	);

	var photoKeys = ['仪表盘', '车辆正面', '车辆左前方'];
	var photoState = useState({ vehicle: { '仪表盘': [], '车辆正面': [], '车辆左前方': [] } });
	var photos = photoState[0];
	var setPhotos = photoState[1];

	var sectionPhotos = React.createElement('div', { id: 'dv-edit-section-photos', style: { scrollMarginTop: 56, marginTop: 24, marginBottom: 24 } },
		React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #2563eb' } }, '交车照片'),
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 } },
			photoKeys.map(function (k) {
				return React.createElement(UploadBox, {
					key: k,
					label: RequiredLabel(k),
					value: photos.vehicle[k] || [],
					max: 1,
					onChange: function (l) {
						setPhotos(function (p) {
							var n = Object.assign({}, p);
							n.vehicle = Object.assign({}, p.vehicle);
							n.vehicle[k] = l;
							return n;
						});
					}
				});
			})
		),
		React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#94a3b8' } }, '原型：完整照片清单见交车单编辑页需求说明')
	);

	return React.createElement(React.Fragment, null,
		React.createElement(Drawer, {
			open: open,
			onClose: onClose,
			width: Math.min(960, typeof window !== 'undefined' ? window.innerWidth - 24 : 960),
			title: drawerTitle,
			destroyOnClose: true,
			styles: {
				body: { padding: '16px 20px 88px', background: '#f8fafc' },
				footer: { borderTop: '1px solid #e2e8f0', padding: '12px 20px' }
			},
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 10 } },
				React.createElement(Button, { onClick: onClose, disabled: submitting }, '取消'),
				React.createElement(Button, { onClick: handleSaveClick, disabled: submitting }, '保存'),
				React.createElement(Button, { type: 'primary', loading: submitting, onClick: handleSubmitClick }, '提交')
			)
		},
			summaryCard,
			sectionNavEl,
			React.createElement('div', { style: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 16px 8px' } },
				sectionBasic,
				sectionEquip,
				sectionMetrics,
				sectionPhotos
			)
		),
		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: function () { previewState[1]({ open: false, url: '', title: '' }); },
			width: 860
		}, previewState[0].url ? React.createElement('img', { src: previewState[0].url, alt: previewState[0].title, style: { width: '100%', maxHeight: '70vh', objectFit: 'contain' } }) : null),
		React.createElement(Modal, {
			open: !!ocrModalState[0].open,
			title: '备胎识别',
			onCancel: function () { ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false })); },
			onOk: function () { updateForm({ spareTireDepth: ocrModalState[0].depth }); ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false })); message.success('已反写胎纹深度'); },
			okText: '确认',
			cancelText: '取消'
		},
			React.createElement(Input, { value: ocrModalState[0].depth, addonAfter: 'mm', onChange: function (e) { ocrModalState[1](Object.assign({}, ocrModalState[0], { depth: e.target.value })); } })
		),
		React.createElement(Drawer, {
			open: inspectionOpenState[0],
			title: '交车检查单',
			width: 720,
			onClose: function () { inspectionOpenState[1](false); },
			footer: React.createElement(Button, { type: 'primary', onClick: function () { message.success('检查单已保存'); inspectionOpenState[1](false); } }, '确定')
		},
			React.createElement(Table, {
				rowKey: 'key',
				size: 'small',
				pagination: false,
				bordered: true,
				dataSource: inspectionList,
				columns: [
					{ title: '类别', dataIndex: 'category', width: 100 },
					{ title: '检查项目', dataIndex: 'item', width: 140 },
					{ title: '检查情况', dataIndex: 'checked', width: 100, render: function (v) { return React.createElement(Switch, { checked: !!v, disabled: true }); } },
					{ title: '备注', dataIndex: 'remark' }
				]
			})
		)
	);
}

if (typeof window !== 'undefined') {
	window.DeliveryEditDrawer = DeliveryEditDrawer;
}
