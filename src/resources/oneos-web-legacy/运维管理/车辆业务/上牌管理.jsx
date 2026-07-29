// 【重要】必须使用 const Component 作为组件变量名
// 车辆上牌管理 - 车辆资产管理后台模块
var ARCO_TOKEN = {
	primary: '#165DFF',
	primaryHover: '#4080FF',
	danger: '#F53F3F',
	success: '#00B42A',
	neutral1: '#FFFFFF',
	neutral2: '#F7F8FA',
	neutral3: '#F2F3F5',
	neutral4: '#E5E6EB',
	neutral5: '#C9CDD4',
	neutral6: '#86909C',
	neutral7: '#4E5969',
	neutral8: '#1D2129',
	border: '#E5E6EB',
	fill: '#F2F3F5',
	fillSecondary: '#F7F8FA',
	shadowLight: '0 1px 2px rgba(0,0,0,0.05)',
	shadowMedium: '0 2px 8px rgba(0,0,0,0.08)',
	radiusSmall: '2px',
	radiusMedium: '4px',
	radiusLarge: '8px',
	spacing8: '8px',
	spacing12: '12px',
	spacing16: '16px',
	spacing24: '24px', 
	fontSize14: '14px',
	fontSize16: '16px',
	fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif',
	link: '#165DFF'
};

const Component = function () {
	var antd = window.antd;
	var Input = antd.Input;
	var Select = antd.Select;
	var Button = antd.Button;
	var DatePicker = antd.DatePicker;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;
	var Option = Select.Option;
	var Spin = antd.Spin;

	var _useState = React.useState('');
	var filterDateStart = _useState[0];
	var setFilterDateStart = _useState[1];

	var _useState2 = React.useState('');
	var filterDateEnd = _useState2[0];
	var setFilterDateEnd = _useState2[1];

	var _useState3 = React.useState('');
	var filterOperator = _useState3[0];
	var setFilterOperator = _useState3[1];

	var _useState4 = React.useState('');
	var filterPlateNo = _useState4[0];
	var setFilterPlateNo = _useState4[1];

	var _useState5 = React.useState('');
	var filterVin = _useState5[0];
	var setFilterVin = _useState5[1];

	var _useState5h = React.useState('');
	var appliedDateStart = _useState5h[0];
	var setAppliedDateStart = _useState5h[1];
	var _useState5i = React.useState('');
	var appliedDateEnd = _useState5i[0];
	var setAppliedDateEnd = _useState5i[1];
	var _useState5j = React.useState('');
	var appliedOperator = _useState5j[0];
	var setAppliedOperator = _useState5j[1];
	var _useState5k = React.useState('');
	var appliedPlateNo = _useState5k[0];
	var setAppliedPlateNo = _useState5k[1];
	var _useState5l = React.useState('');
	var appliedVin = _useState5l[0];
	var setAppliedVin = _useState5l[1];

	var _useState6 = React.useState(1);
	var currentPage = _useState6[0];
	var setCurrentPage = _useState6[1];

	var _useState7 = React.useState(10);
	var pageSize = _useState7[0];
	var setPageSize = _useState7[1];

	var _useState9 = React.useState(null);
	var viewPhotoRecord = _useState9[0];
	var setViewPhotoRecord = _useState9[1];

	var _useState10 = React.useState(false);
	var ocrModalVisible = _useState10[0];
	var setOcrModalVisible = _useState10[1];

	var _useState11 = React.useState(false);
	var confirmModalVisible = _useState11[0];
	var setConfirmModalVisible = _useState11[1];

	var _useState12 = React.useState(null);
	var confirmData = _useState12[0];
	var setConfirmData = _useState12[1];

	var _useState13 = React.useState([]);
	var batchConfirmList = _useState13[0];
	var setBatchConfirmList = _useState13[1];

	var _useState14 = React.useState(0);
	var batchConfirmIndex = _useState14[0];
	var setBatchConfirmIndex = _useState14[1];

	var _useState15 = React.useState(false);
	var isBatchMode = _useState15[0];
	var setIsBatchMode = _useState15[1];

	var _useState15b = React.useState(0);
	var batchTotalCount = _useState15b[0];
	var setBatchTotalCount = _useState15b[1];

	var _useState16 = React.useState('');
	var confirmVin = _useState16[0];
	var setConfirmVin = _useState16[1];

	var _useState17 = React.useState('');
	var confirmPlateNo = _useState17[0];
	var setConfirmPlateNo = _useState17[1];

	var _useState17a = React.useState('');
	var confirmScrapDate = _useState17a[0];
	var setConfirmScrapDate = _useState17a[1];

	var _useState17b = React.useState('');
	var confirmInspectionExpiry = _useState17b[0];
	var setConfirmInspectionExpiry = _useState17b[1];

	var _useState18b = React.useState(false);
	var showRequirementModal = _useState18b[0];
	var setShowRequirementModal = _useState18b[1];

	var _useState18c = React.useState(false);
	var batchTaskCardVisible = _useState18c[0];
	var setBatchTaskCardVisible = _useState18c[1];

	var fileInputRef = React.useRef(null);
	var batchFullListRef = React.useRef(null);
	var batchUploadFromCardRef = React.useRef(false);
	var batchFileInputRef = React.useRef(null);

	var _useState18e = React.useState([]);
	var batchTaskList = _useState18e[0];
	var setBatchTaskList = _useState18e[1];

	var mockVehicleList = [
		{ id: 'v001', frameNo: 'LGW123456', brand: '比亚迪', model: '秦', vehicleType: '轿车' },
		{ id: 'v002', frameNo: 'LGW789012', brand: '特斯拉', model: 'Model 3', vehicleType: '轿车' },
		{ id: 'v003', frameNo: 'HZ111222', brand: '小鹏', model: 'P7', vehicleType: '轿车' }
	];

	var initialRecordList = [
		{
			id: 'r001',
			plateDate: '2025-02-01',
			operator: '张明',
			plateNo: '粤A12345',
			vin: 'LGW123456',
			vehicleType: '轿车',
			brand: '比亚迪',
			model: '秦',
			photoUrl: 'https://picsum.photos/300/200?random=1'
		},
		{
			id: 'r002',
			plateDate: '2025-02-03',
			operator: '王芳',
			plateNo: '粤A67890',
			vin: 'LGW789012',
			vehicleType: '轿车',
			brand: '特斯拉',
			model: 'Model 3',
			photoUrl: 'https://picsum.photos/300/200?random=2'
		}
	];

	// 近5条批量上牌任务（时间、照片数量、完成进度）；进度100%时有 items 用于「识别」进入确认界面
	var getInitialBatchTaskList = function () {
		return [
			{ id: 'bt1', createTime: '2025-02-12 10:30', photoCount: 3, progress: 100, items: [
				{ photoUrl: 'https://picsum.photos/300/200?random=b1', vin: 'LGW123456', plateNo: '粤A11111', vehicle: mockVehicleList[0] },
				{ photoUrl: 'https://picsum.photos/300/200?random=b2', vin: 'LGW789012', plateNo: '粤A22222', vehicle: mockVehicleList[1] },
				{ photoUrl: 'https://picsum.photos/300/200?random=b3', vin: 'HZ111222', plateNo: '粤A33333', vehicle: mockVehicleList[2] }
			]},
			{ id: 'bt2', createTime: '2025-02-12 09:15', photoCount: 5, progress: 100, items: [
				{ photoUrl: 'https://picsum.photos/300/200?random=b4', vin: 'LGW123456', plateNo: '粤A44444', vehicle: mockVehicleList[0] },
				{ photoUrl: 'https://picsum.photos/300/200?random=b5', vin: 'LGW789012', plateNo: '粤A55555', vehicle: mockVehicleList[1] }
			]},
			{ id: 'bt3', createTime: '2025-02-11 16:20', photoCount: 4, progress: 80, items: null },
			{ id: 'bt4', createTime: '2025-02-11 14:00', photoCount: 2, progress: 50, items: null },
			{ id: 'bt5', createTime: '2025-02-10 11:30', photoCount: 6, progress: 30, items: null }
		];
	};

	React.useEffect(function () {
		setBatchTaskList(function (prev) {
			if (prev.length === 0) return getInitialBatchTaskList();
			return prev;
		});
	}, []);

	var _useState18 = React.useState(initialRecordList);
	var recordList = _useState18[0];
	var setRecordList = _useState18[1];

	var getUniqueOperators = function () {
		var seen = {};
		var list = [];
		recordList.forEach(function (r) {
			if (r.operator && !seen[r.operator]) {
				seen[r.operator] = true;
				list.push(r.operator);
			}
		});
		return list.sort();
	};

	var getUniquePlateNos = function () {
		var seen = {};
		var list = [];
		recordList.forEach(function (r) {
			if (r.plateNo && !seen[r.plateNo]) {
				seen[r.plateNo] = true;
				list.push(r.plateNo);
			}
		});
		return list.sort();
	};

	var getUniqueVins = function () {
		var seen = {};
		var list = [];
		recordList.forEach(function (r) {
			if (r.vin && !seen[r.vin]) {
				seen[r.vin] = true;
				list.push(r.vin);
			}
		});
		mockVehicleList.forEach(function (v) {
			if (v.frameNo && !seen[v.frameNo]) {
				seen[v.frameNo] = true;
				list.push(v.frameNo);
			}
		});
		return list.sort();
	};

	var allOperators = getUniqueOperators();
	var allPlateNos = getUniquePlateNos();
	var allVins = getUniqueVins();

	var getFilteredList = function () {
		var list = recordList;
		if (appliedDateStart) {
			list = list.filter(function (r) { return r.plateDate >= appliedDateStart; });
		}
		if (appliedDateEnd) {
			list = list.filter(function (r) { return r.plateDate <= appliedDateEnd; });
		}
		if (appliedOperator) {
			list = list.filter(function (r) {
				return r.operator && r.operator.indexOf(appliedOperator) >= 0;
			});
		}
		if (appliedPlateNo) {
			list = list.filter(function (r) {
				return r.plateNo && r.plateNo.indexOf(appliedPlateNo) >= 0;
			});
		}
		if (appliedVin) {
			list = list.filter(function (r) {
				return r.vin && r.vin.indexOf(appliedVin) >= 0;
			});
		}
		return list;
	};

	var filteredList = getFilteredList();
	var totalItems = filteredList.length;
	var totalPages = Math.ceil(totalItems / pageSize) || 1;
	var validPage = currentPage > totalPages && totalPages > 0 ? 1 : (currentPage < 1 ? 1 : currentPage);
	var startIndex = (validPage - 1) * pageSize;
	var endIndex = startIndex + pageSize;
	var paginatedList = filteredList.slice(startIndex, endIndex);

	var findVehicleByVin = function (vin) {
		return mockVehicleList.find(function (v) { return v.frameNo === vin; });
	};

	var todayStr = function () {
		var d = new Date();
		var y = d.getFullYear();
		var m = (d.getMonth() + 1).toString();
		var day = d.getDate().toString();
		if (m.length === 1) { m = '0' + m; }
		if (day.length === 1) { day = '0' + day; }
		return y + '-' + m + '-' + day;
	};

	var sampleScrapDates = ['2035-12-31', '2030-06-15', '2028-03-20'];
	var sampleInspectionExpiries = ['2026-06', '2025-12', '2027-03'];
	var getSampleScrapDate = function () { return sampleScrapDates[Math.floor(Math.random() * sampleScrapDates.length)]; };
	var getSampleInspectionExpiry = function () { return sampleInspectionExpiries[Math.floor(Math.random() * sampleInspectionExpiries.length)]; };

	var processFileAndGetItem = function (file, callback) {
		var reader = new FileReader();
		reader.onload = function () {
			var photoUrl = reader.result;
			var mockVin = mockVehicleList[0].frameNo;
			var mockPlate = '粤A' + Math.floor(Math.random() * 90000 + 10000).toString();
			var vehicle = findVehicleByVin(mockVin);
			var item = {
				photoUrl: photoUrl,
				vin: mockVin,
				plateNo: mockPlate,
				vehicle: vehicle
			};
			callback(item);
		};
		reader.readAsDataURL(file);
	};

	var simulateOcrAndConfirm = function (items, isMulti) {
		setOcrModalVisible(false);
		if (isMulti && items.length > 1) {
			batchFullListRef.current = items.slice();
			setBatchConfirmList(items);
			setBatchConfirmIndex(0);
			setBatchTotalCount(items.length);
			setConfirmData(items[0]);
			setConfirmVin(items[0].vin);
			setConfirmPlateNo(items[0].plateNo);
			setConfirmScrapDate(getSampleScrapDate());
			setConfirmInspectionExpiry(getSampleInspectionExpiry());
			setConfirmModalVisible(true);
			setIsBatchMode(true);
		} else if (items.length > 0) {
			setConfirmData(items[0]);
			setConfirmVin(items[0].vin);
			setConfirmPlateNo(items[0].plateNo);
			setConfirmScrapDate(getSampleScrapDate());
			setConfirmInspectionExpiry(getSampleInspectionExpiry());
			setConfirmModalVisible(true);
			setIsBatchMode(false);
		}
	};

	var handleUpload = function (e, isBatch) {
		var files = e.target.files;
		if (!files || files.length === 0) return;
		// 从批量上传弹框内「上传车牌」触发：不进入识别/确认页，只在弹框中新增一条识别任务
		if (batchUploadFromCardRef.current) {
			batchUploadFromCardRef.current = false;
			var fileCount = files.length;
			var collected = [];
			var processed = 0;
			var checkDone = function () {
				processed = processed + 1;
				if (processed === fileCount) {
					var now = new Date();
					var timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
					setBatchTaskList(function (prev) {
						var next = [{ id: 'bt' + Date.now(), createTime: timeStr, photoCount: collected.length, progress: 100, items: collected }].concat(prev);
						return next.slice(0, 5);
					});
				}
			};
			for (var i = 0; i < fileCount; i++) {
				(function (idx) {
					processFileAndGetItem(files[idx], function (item) {
						collected.push(item);
						checkDone();
					});
				})(i);
			}
			e.target.value = '';
			return;
		}
		setOcrModalVisible(true);
		var fileCount = files.length;
		var collected = [];
		var processed = 0;
		var checkDone = function () {
			processed = processed + 1;
			if (processed === fileCount) {
				setTimeout(function () {
					simulateOcrAndConfirm(collected, isBatch && collected.length > 1);
				}, 1500);
			}
		};
		for (var i = 0; i < fileCount; i++) {
			(function (idx) {
				processFileAndGetItem(files[idx], function (item) {
					collected.push(item);
					checkDone();
				});
			})(i);
		}
		e.target.value = '';
	};

	var handleConfirmSubmit = function () {
		var vehicle = confirmData && confirmData.vehicle;
		var newRecord = {
			id: 'r' + Date.now(),
			plateDate: todayStr(),
			operator: '当前用户',
			plateNo: confirmPlateNo,
			vin: confirmVin,
			vehicleType: vehicle ? vehicle.vehicleType : '轿车',
			brand: vehicle ? vehicle.brand : '-',
			model: vehicle ? vehicle.model : '-',
			photoUrl: confirmData && confirmData.photoUrl ? confirmData.photoUrl : 'https://picsum.photos/300/200?random=' + Date.now()
		};
		var nextList = recordList.slice();
		nextList.unshift(newRecord);
		setRecordList(nextList);
		message.success('车辆上牌成功');
		if (isBatchMode && batchConfirmList.length > 1) {
			var nextBatch = batchConfirmList.slice(1);
			var nextItem = nextBatch[0];
			setBatchConfirmList(nextBatch);
			setBatchConfirmIndex(batchConfirmIndex + 1);
			if (nextItem) {
				setConfirmData(nextItem);
				setConfirmVin(nextItem.vin);
				setConfirmPlateNo(nextItem.plateNo);
				setConfirmScrapDate(getSampleScrapDate());
				setConfirmInspectionExpiry(getSampleInspectionExpiry());
			} else {
				var fullList = batchFullListRef.current;
				if (fullList && fullList.length > 0) {
					var now = new Date();
					var timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
					setBatchTaskList(function (prev) {
						var next = [{ id: 'bt' + Date.now(), createTime: timeStr, photoCount: fullList.length, progress: 100, items: fullList }].concat(prev);
						return next.slice(0, 5);
					});
					batchFullListRef.current = null;
				}
				setConfirmModalVisible(false);
				setConfirmData(null);
				setConfirmVin('');
				setConfirmPlateNo('');
				setConfirmScrapDate('');
				setConfirmInspectionExpiry('');
				setBatchConfirmList([]);
				setBatchTotalCount(0);
				setIsBatchMode(false);
			}
		} else {
			setConfirmModalVisible(false);
			setConfirmData(null);
			setConfirmVin('');
			setConfirmPlateNo('');
			setConfirmScrapDate('');
			setConfirmInspectionExpiry('');
			setBatchConfirmList([]);
			setBatchTotalCount(0);
			setIsBatchMode(false);
		}
	};

	var handleConfirmCancel = function () {
		setConfirmModalVisible(false);
		setConfirmData(null);
		setConfirmVin('');
		setConfirmPlateNo('');
		setConfirmScrapDate('');
		setConfirmInspectionExpiry('');
		setBatchConfirmList([]);
		setBatchConfirmIndex(0);
		setBatchTotalCount(0);
		setIsBatchMode(false);
	};

	var t = ARCO_TOKEN;
	var styles = {
		page: { padding: t.spacing24, fontFamily: t.fontFamily, backgroundColor: t.fill, minHeight: '100vh' },
		breadcrumb: { marginBottom: t.spacing16, fontSize: t.fontSize14, color: t.neutral6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
		breadcrumbLeft: { display: 'flex', alignItems: 'center' },
		breadcrumbLink: { color: t.link, textDecoration: 'none', marginRight: t.spacing8 },
		breadcrumbCurrent: { color: t.neutral8 },
		breadcrumbRight: { display: 'flex', alignItems: 'center' },
		requirementLink: { color: t.link, textDecoration: 'none', fontSize: t.fontSize14, cursor: 'pointer' },
		card: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, boxShadow: t.shadowLight, marginBottom: t.spacing16, padding: t.spacing16 },
		filterRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing12 },
		filterRowRight: { display: 'flex', alignItems: 'center', gap: t.spacing8, marginLeft: 'auto' },
		label: { marginRight: t.spacing8, fontSize: t.fontSize14, color: t.neutral8, whiteSpace: 'nowrap' },
		input: { padding: '0 10px', height: '32px', width: '180px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, boxSizing: 'border-box' },
		btn: { padding: t.spacing8 + ' ' + t.spacing16, borderRadius: t.radiusMedium, cursor: 'pointer', fontSize: t.fontSize14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxSizing: 'border-box' },
		btnFixed: { width: '82px', height: '32px', padding: 0, borderRadius: '2px', lineHeight: '1' },
		btnIcon: { width: '14px', height: '14px', flexShrink: 0, display: 'block' },
		btnFillBlue: { backgroundColor: t.primary, color: t.neutral1, border: 'none' },
		btnOutlineBlue: { backgroundColor: t.neutral1, color: t.primary, border: '1px solid ' + t.primary },
		btnDefault: { backgroundColor: t.neutral1, color: t.neutral8, border: '1px solid ' + t.border },
		btnSize82: { width: '82px', height: '32px', padding: 0, lineHeight: '1', boxSizing: 'border-box' },
		toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: t.spacing12, marginBottom: t.spacing16 },
		tableWrap: { overflowX: 'auto', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.neutral4 },
		table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: t.fontSize14 },
		th: { textAlign: 'left', padding: '12px 16px', backgroundColor: t.fillSecondary, borderBottom: '1px solid ' + t.neutral4, fontWeight: 600, color: t.neutral8, fontSize: t.fontSize14, whiteSpace: 'nowrap' },
		td: { padding: '12px 16px', borderBottom: '1px solid ' + t.neutral4, color: t.neutral8, fontSize: t.fontSize14 },
		pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid ' + t.neutral4, backgroundColor: t.neutral1 },
		paginationLeft: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: t.fontSize14, color: t.neutral7 },
		paginationRight: { display: 'flex', alignItems: 'center', gap: '8px' },
		paginationSelect: { padding: '4px 8px', height: '28px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, backgroundColor: t.neutral1 },
		paginationBtn: { minWidth: '28px', height: '28px', padding: '0 8px', borderRadius: '2px', border: '1px solid ' + t.border, backgroundColor: t.neutral1, color: t.neutral8, cursor: 'pointer', fontSize: t.fontSize14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
		paginationBtnActive: { backgroundColor: t.primary, color: t.neutral1, borderColor: t.primary },
		paginationBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
		paginationInput: { width: '50px', height: '28px', padding: '0 8px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, textAlign: 'center' },
		actionLink: { color: t.link, cursor: 'pointer', marginRight: t.spacing12, fontSize: t.fontSize14 },
		modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
		modalBox: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, maxWidth: '90%', maxHeight: '90%', overflow: 'auto', padding: t.spacing24, minWidth: '500px', position: 'relative' },
		modalTitle: { fontSize: t.fontSize16, fontWeight: 600, marginBottom: t.spacing16, color: t.neutral8 },
		modalFooter: { marginTop: t.spacing24, display: 'flex', justifyContent: 'flex-end', gap: t.spacing8 },
		toast: { position: 'fixed', top: t.spacing24, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.75)', color: t.neutral1, padding: '10px 20px', borderRadius: t.radiusMedium, zIndex: 2000, fontSize: t.fontSize14 },
		autocompleteWrap: { position: 'relative', width: '180px', display: 'inline-block' },
		autocompletePanel: { position: 'absolute', left: 0, top: '100%', marginTop: '4px', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.border, boxShadow: t.shadowMedium, zIndex: 100, minWidth: '100%', maxHeight: '200px', overflowY: 'auto' },
		autocompleteOption: { padding: '8px 12px', fontSize: t.fontSize14, color: t.neutral8, cursor: 'pointer' },
		autocompleteOptionHover: { backgroundColor: t.fill },
		confirmCard: { display: 'flex', gap: t.spacing24, marginTop: t.spacing16 },
		confirmPhoto: { flex: '0 0 300px', height: '200px', borderRadius: t.radiusMedium, overflow: 'hidden', backgroundColor: t.neutral3 },
		confirmPhotoImg: { width: '100%', height: '100%', objectFit: 'cover' },
		confirmForm: { flex: 1, display: 'flex', flexDirection: 'column', gap: t.spacing16 },
		formLabel: { display: 'block', marginBottom: '6px', fontSize: t.fontSize14, color: t.neutral8 },
		formInput: { padding: '8px 12px', height: '36px', borderRadius: t.radiusMedium, border: '1px solid ' + t.border, fontSize: t.fontSize14, width: '100%', boxSizing: 'border-box' },
		photoViewModal: { maxWidth: '800px', textAlign: 'center' },
		photoViewImg: { maxWidth: '100%', maxHeight: '70vh', borderRadius: t.radiusMedium },
		modalCloseBtn: { position: 'absolute', right: t.spacing16, top: t.spacing16, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: t.radiusMedium, backgroundColor: 'transparent', border: 'none', color: t.neutral6, fontSize: '18px', lineHeight: '1', padding: 0 },
		modalContent: { fontSize: t.fontSize14, color: t.neutral8, lineHeight: '1.6' },
		requirementSection: { marginBottom: t.spacing16 },
		requirementSectionTitle: { fontSize: t.fontSize16, fontWeight: 600, color: t.neutral8, marginBottom: t.spacing8 },
		flowWrap: { marginTop: t.spacing8, marginBottom: t.spacing16 },
		flowCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
		flowArrow: { width: '2px', height: '20px', backgroundColor: t.neutral5 },
		flowNodeOval: { padding: '8px 20px', borderRadius: '20px', border: '1px solid ' + t.neutral5, backgroundColor: t.neutral2, fontSize: t.fontSize14, color: t.neutral8 },
		flowNodeRect: { padding: '8px 20px', border: '1px solid ' + t.neutral5, backgroundColor: t.neutral1, fontSize: t.fontSize14, color: t.neutral8 },
		flowNodeDiamond: { padding: '10px 16px', border: '1px solid ' + t.neutral5, backgroundColor: t.fillSecondary, fontSize: t.fontSize14, color: t.neutral8, transform: 'rotate(0deg)', width: '140px', textAlign: 'center', boxSizing: 'border-box', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
		flowNodeDiamondWrap: { padding: '8px 16px', border: '1px solid ' + t.neutral5, backgroundColor: t.fillSecondary, fontSize: t.fontSize14, color: t.neutral8, minWidth: '120px', textAlign: 'center' },
		flowNodeToast: { padding: '8px 16px', borderRadius: '8px', border: '1px solid ' + t.neutral4, backgroundColor: t.neutral2, fontSize: t.fontSize14, color: t.neutral7 },
		flowRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' },
		flowBranch: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
		requirementItem: { marginBottom: t.spacing8, paddingLeft: t.spacing16 },
		requirementSubItem: { marginBottom: t.spacing4, paddingLeft: t.spacing16, fontSize: t.fontSize14, color: t.neutral7 },
		batchTaskCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing16 },
		batchTaskTable: { width: '100%', borderCollapse: 'collapse', fontSize: t.fontSize14 },
		batchTaskTh: { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid ' + t.neutral4, color: t.neutral7, fontWeight: 500 },
		batchTaskTd: { padding: '10px 12px', borderBottom: '1px solid ' + t.neutral4, color: t.neutral8 },
		progressWrap: { width: '120px', height: '8px', backgroundColor: t.neutral4, borderRadius: '4px', overflow: 'hidden' },
		progressBar: { height: '100%', backgroundColor: t.primary, borderRadius: '4px', transition: 'width 0.2s' },
		recognizeLink: { color: t.link, cursor: 'pointer', fontSize: t.fontSize14 },
		dateRangeWrap: { position: 'relative', display: 'inline-block' },
		dateRangeTrigger: { display: 'flex', alignItems: 'center', height: '32px', padding: '0 12px', border: '1px solid ' + t.border, borderRadius: '2px', backgroundColor: t.neutral1, cursor: 'pointer', minWidth: '280px', boxSizing: 'border-box' },
		dateRangeTriggerFocused: { borderColor: t.primary, outline: 'none' },
		dateRangeLabel: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', height: '100%', fontSize: t.fontSize14, color: t.neutral8 },
		dateRangeLabelActive: { backgroundColor: 'rgba(22,93,255,0.1)', color: t.primary, borderBottom: '2px solid ' + t.primary },
		dateRangeLabelText: { whiteSpace: 'nowrap' },
		dateRangeDash: { color: t.neutral5, margin: '0 4px', fontSize: t.fontSize14 },
		dateRangeIcon: { marginLeft: 'auto', width: '16px', height: '16px', color: t.neutral6, flexShrink: 0 },
		dateRangePanel: { position: 'absolute', left: 0, top: '100%', marginTop: '4px', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.border, boxShadow: t.shadowMedium, zIndex: 100, padding: '16px', display: 'flex', gap: '24px' },
		dateRangeCalendar: { width: '280px' },
		dateRangeCalendarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' },
		dateRangeCalendarTitle: { fontSize: t.fontSize14, fontWeight: 500, color: t.neutral8 },
		dateRangeCalendarNav: { display: 'flex', alignItems: 'center', gap: '4px' },
		dateRangeNavBtn: { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', color: t.neutral6, cursor: 'pointer', borderRadius: t.radiusSmall },
		dateRangeNavBtnHover: { color: t.primary, backgroundColor: t.fill },
		dateRangeWeekRow: { display: 'flex', marginBottom: '4px' },
		dateRangeWeekCell: { width: '36px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: t.neutral6 },
		dateRangeDayRow: { display: 'flex' },
		dateRangeDayCell: { width: '36px', height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: t.fontSize14, cursor: 'pointer', borderRadius: t.radiusSmall, color: t.neutral8 },
		dateRangeDayCellOther: { color: t.neutral5 },
		dateRangeDayCellSelected: { color: t.primary },
		dateRangeDayCellInRange: { backgroundColor: 'rgba(22,93,255,0.08)', color: t.primary },
		dateRangeDayDot: { width: '4px', height: '4px', borderRadius: '50%', backgroundColor: t.primary, marginTop: '2px' }
	};

	var renderFilterSelect = function (value, setValue, options, placeholder) {
		var opts = (options || []).map(function (o) { return React.createElement(Option, { key: o, value: o }, o); });
		return React.createElement(Select, {
			placeholder: placeholder || '请选择或输入搜索',
			style: { width: 180 },
			value: value || undefined,
			onChange: function (v) { setValue(v || ''); },
			showSearch: true,
			allowClear: true,
			filterOption: function (input, opt) {
				var c = opt && opt.children;
				return c && String(c).toLowerCase().indexOf((input || '').toLowerCase()) >= 0;
			}
		}, opts);
	};

	return React.createElement(
		'div',
		{ style: styles.page },
		React.createElement(
			'div',
			{ style: styles.breadcrumb },
			React.createElement(
				'div',
				{ style: styles.breadcrumbLeft },
				React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '运维管理'),
				React.createElement('span', { style: { marginRight: '8px' } }, '/'),
				React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '车辆业务'),
				React.createElement('span', { style: { marginRight: '8px' } }, '/'),
				React.createElement('span', { style: styles.breadcrumbCurrent }, '上牌管理')
			),
			React.createElement(
				'div',
				{ style: styles.breadcrumbRight },
				React.createElement('a', { href: '#', style: styles.requirementLink, onClick: function (e) { e.preventDefault(); setShowRequirementModal(true); } }, '查看需求说明')
			)
		),
		React.createElement(
			'div',
			{ style: styles.card },
			React.createElement(
				'div',
				{ style: styles.filterRow },
				React.createElement('span', { style: styles.label }, '上牌日期：'),
				React.createElement(DatePicker, {
					style: { width: 180 },
					format: 'YYYY-MM-DD',
					placeholder: '开始日期',
					value: filterDateStart && window.moment ? window.moment(filterDateStart, 'YYYY-MM-DD') : null,
					onChange: function (d, dateStr) { setFilterDateStart(dateStr || ''); }
				}),
				React.createElement('span', { style: { color: t.neutral6, margin: '0 4px' } }, '至'),
				React.createElement(DatePicker, {
					style: { width: 180 },
					format: 'YYYY-MM-DD',
					placeholder: '结束日期',
					value: filterDateEnd && window.moment ? window.moment(filterDateEnd, 'YYYY-MM-DD') : null,
					onChange: function (d, dateStr) { setFilterDateEnd(dateStr || ''); }
				}),
				React.createElement('span', { style: styles.label }, '操作人：'),
				renderFilterSelect(filterOperator, setFilterOperator, allOperators, '请选择操作人'),
				React.createElement('span', { style: styles.label }, '车牌号：'),
				renderFilterSelect(filterPlateNo, setFilterPlateNo, allPlateNos, '请选择车牌号'),
				React.createElement('span', { style: styles.label }, '车辆识别代码：'),
				renderFilterSelect(filterVin, setFilterVin, allVins, '请选择车辆识别代码'),
				React.createElement(
					'div',
					{ style: styles.filterRowRight },
					React.createElement(Button, {
						type: 'primary',
						onClick: function () {
							setAppliedDateStart(filterDateStart);
							setAppliedDateEnd(filterDateEnd);
							setAppliedOperator(filterOperator);
							setAppliedPlateNo(filterPlateNo);
							setAppliedVin(filterVin);
							setCurrentPage(1);
							message.success('查询成功');
						}
					}, '查询'),
					React.createElement(Button, {
						onClick: function () {
							setFilterDateStart('');
							setFilterDateEnd('');
							setAppliedDateStart('');
							setAppliedDateEnd('');
							setFilterOperator('');
							setFilterPlateNo('');
							setFilterVin('');
							setAppliedOperator('');
							setAppliedPlateNo('');
							setAppliedVin('');
							setCurrentPage(1);
						}
					}, '重置')
				)
			)
		),
		React.createElement(
			'div',
			{ style: styles.card },
			React.createElement(
				'div',
				{ style: styles.toolbar },
				React.createElement('input', {
					type: 'file',
					ref: fileInputRef,
					accept: 'image/*',
					style: { display: 'none' },
					onChange: function (e) { handleUpload(e, false); }
				}),
				React.createElement('input', {
					type: 'file',
					ref: batchFileInputRef,
					accept: 'image/*',
					multiple: true,
					style: { display: 'none' },
					onChange: function (e) { handleUpload(e, true); }
				}),
				React.createElement(Button, {
					type: 'primary',
					onClick: function () { if (fileInputRef.current) fileInputRef.current.click(); }
				}, '新增'),
				React.createElement(Button, {
					onClick: function () { setBatchTaskCardVisible(true); }
				}, '批量上传')
			),
			React.createElement(Table, {
				rowKey: 'id',
				size: 'small',
				columns: [
					{ title: '上牌日期', dataIndex: 'plateDate', key: 'plateDate', width: 120 },
					{ title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
					{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120 },
					{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 140 },
					{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 100 },
					{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
					{ title: '型号', dataIndex: 'model', key: 'model', width: 120 },
					{ title: '操作', key: 'action', width: 80, render: function (_, row) { return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { setViewPhotoRecord(row); } }, '查看'); } }
				],
				dataSource: paginatedList,
				pagination: {
					current: validPage,
					pageSize: pageSize,
					total: totalItems,
					showSizeChanger: true,
					showQuickJumper: true,
					pageSizeOptions: ['10', '20', '50', '100'],
					showTotal: function (total) { return '共 ' + total + ' 条'; },
					onChange: function (page, size) {
						setCurrentPage(page);
						if (size !== pageSize) setPageSize(size);
					}
				}
			})
		),
		React.createElement(Modal, {
			title: '识别中，请勿关闭页面',
			visible: ocrModalVisible,
			footer: null,
			closable: false,
			maskClosable: false,
			children: React.createElement('div', { style: { padding: '24px 0', textAlign: 'center' } },
				React.createElement(Spin, { size: 'large' }),
				React.createElement('p', { style: { marginTop: 12, color: t.neutral6 } }, '正在识别行驶证信息...')
			)
		}),
		React.createElement(Modal, {
			title: isBatchMode && batchTotalCount > 1 ? '确认上牌信息（' + (batchTotalCount - batchConfirmList.length + 1) + '/' + batchTotalCount + '）' : '确认上牌信息',
			visible: confirmModalVisible && !!confirmData,
			onCancel: handleConfirmCancel,
			onOk: handleConfirmSubmit,
			okText: '确认',
			cancelText: '取消',
			width: 560,
			children: confirmData ? React.createElement(
				'div',
				{ style: styles.confirmCard },
				React.createElement('div', { style: styles.confirmPhoto },
					React.createElement('img', { src: confirmData.photoUrl, alt: '行驶证', style: styles.confirmPhotoImg })
				),
				React.createElement('div', { style: styles.confirmForm },
					React.createElement('div', { style: { marginBottom: 16 } },
						React.createElement('label', { style: styles.formLabel }, '车辆识别代号'),
						React.createElement(Input, {
							style: { width: '100%' },
							value: confirmVin,
							onChange: function (e) { setConfirmVin(e.target.value); }
						})
					),
					React.createElement('div', { style: { marginBottom: 16 } },
						React.createElement('label', { style: styles.formLabel }, '车牌号'),
						React.createElement(Input, {
							style: { width: '100%' },
							value: confirmPlateNo,
							onChange: function (e) { setConfirmPlateNo(e.target.value); }
						})
					),
					React.createElement('div', { style: { marginBottom: 16 } },
						React.createElement('label', { style: styles.formLabel }, '强制报废日期'),
						React.createElement(Input, {
							style: { width: '100%' },
							placeholder: 'YYYY-MM-DD',
							value: confirmScrapDate,
							onChange: function (e) { setConfirmScrapDate(e.target.value); }
						})
					),
					React.createElement('div', null,
						React.createElement('label', { style: styles.formLabel }, '检验有效期'),
						React.createElement(Input, {
							style: { width: '100%' },
							placeholder: 'YYYY-MM',
							value: confirmInspectionExpiry,
							onChange: function (e) { setConfirmInspectionExpiry(e.target.value); }
						})
					)
				)
			) : null
		}),
		React.createElement(Modal, {
			title: '行驶证照片',
			visible: !!viewPhotoRecord,
			footer: React.createElement(Button, { onClick: function () { setViewPhotoRecord(null); } }, '关闭'),
			onCancel: function () { setViewPhotoRecord(null); },
			width: 640,
			children: viewPhotoRecord ? React.createElement('img', { src: viewPhotoRecord.photoUrl, alt: '行驶证', style: Object.assign({}, styles.photoViewImg, { width: '100%' }) }) : null
		}),
		React.createElement(Modal, {
			title: '批量上牌任务',
			visible: batchTaskCardVisible,
			onCancel: function () { setBatchTaskCardVisible(false); },
			footer: React.createElement(Button, { onClick: function () { setBatchTaskCardVisible(false); } }, '关闭'),
			width: 560,
			children: React.createElement(React.Fragment, null,
				React.createElement('div', { style: Object.assign({}, styles.batchTaskCardHeader, { marginBottom: 16 }) },
					React.createElement(Button, {
						type: 'primary',
						onClick: function () {
							batchUploadFromCardRef.current = true;
							if (batchFileInputRef.current) batchFileInputRef.current.click();
						}
					}, '批量上传')
				),
				React.createElement(Table, {
					rowKey: 'id',
					size: 'small',
					columns: [
						{ title: '任务时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
						{ title: '照片数量', dataIndex: 'photoCount', key: 'photoCount', width: 100, render: function (c) { return c + ' 张'; } },
						{ title: '完成进度', key: 'progress', width: 160, render: function (_, task) {
							return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
								React.createElement('div', { style: styles.progressWrap },
									React.createElement('div', { style: Object.assign({}, styles.progressBar, { width: (task.progress || 0) + '%' }) })
								),
								React.createElement('span', { style: { fontSize: t.fontSize14, color: t.neutral7, minWidth: 36 } }, (task.progress || 0) + '%')
							);
						} },
						{ title: '操作', key: 'action', width: 80, render: function (_, task) {
							return task.progress === 100 && task.items && task.items.length > 0
								? React.createElement(Button, { type: 'link', size: 'small', onClick: function () {
									setBatchConfirmList(task.items);
									setBatchConfirmIndex(0);
									setBatchTotalCount(task.items.length);
									setConfirmData(task.items[0]);
									setConfirmVin(task.items[0].vin);
									setConfirmPlateNo(task.items[0].plateNo);
									setConfirmScrapDate(getSampleScrapDate());
									setConfirmInspectionExpiry(getSampleInspectionExpiry());
									setConfirmModalVisible(true);
									setIsBatchMode(true);
									setBatchTaskCardVisible(false);
								} }, '识别')
								: React.createElement('span', { style: { color: t.neutral5, fontSize: t.fontSize14 } }, '-');
						} }
					],
					dataSource: batchTaskList.slice(0, 5),
					pagination: false
				})
			)
		}),
		React.createElement(Modal, {
			title: '需求说明',
			visible: showRequirementModal,
			onCancel: function () { setShowRequirementModal(false); },
			footer: React.createElement(Button, { onClick: function () { setShowRequirementModal(false); } }, '关闭'),
			width: 720,
			children: React.createElement('div', { style: styles.modalContent },
					React.createElement('div', { style: Object.assign({}, styles.requirementSection, { marginBottom: t.spacing24 }) },
						React.createElement('div', { style: Object.assign({}, styles.requirementSectionTitle, { fontSize: '18px', marginBottom: t.spacing12 }) }, '上牌管理'),
						React.createElement('div', { style: Object.assign({}, styles.requirementItem, { marginTop: 0, color: t.neutral7 }) }, '用以识别行驶证正反面，识别车架号、车牌号、强制报废日期（YYYY-MM-DD）、检验有效期（YYYY-MM）')
					),
					React.createElement('div', { style: styles.requirementSection },
						React.createElement('div', { style: styles.requirementSectionTitle }, '1.面包屑：'),
						React.createElement('div', { style: styles.requirementItem }, '运维管理-车辆业务-上牌管理')
					),
					React.createElement('div', { style: styles.requirementSection },
						React.createElement('div', { style: styles.requirementSectionTitle }, '2.筛选：'),
						React.createElement('div', { style: styles.requirementSubItem }, '2.1.上牌日期：双日历日期选择器，支持选择开始-结束时间，支持手动修改日期，但检验格式及判断结束日期不得早于开始日期；'),
						React.createElement('div', { style: styles.requirementSubItem }, '2.2.操作人：选择器，支持从输入框输入内容模糊搜索，默认提示内容为：请选择操作人；'),
						React.createElement('div', { style: styles.requirementSubItem }, '2.3.车牌号：选择器，支持从输入框输入内容模糊搜索，默认提示内容为：请选择车牌号；'),
						React.createElement('div', { style: styles.requirementSubItem }, '2.4.车辆识别代码：选择器，支持从输入框输入内容模糊搜索，默认提示内容为：请选择车辆识别代码；')
					),
					React.createElement('div', { style: styles.requirementSection },
						React.createElement('div', { style: styles.requirementSectionTitle }, '3.列表：'),
						React.createElement('div', { style: styles.requirementItem }, '列表右侧按钮为新增、批量上传，字段依次为上牌日期、操作人、车牌号、车辆识别代码、车辆类型、品牌、型号、操作；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.1.上牌日期：车辆上牌操作完成日期，格式为YYYY-MM-DD'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.2.操作人：车辆上牌记录操作用户姓名；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.3.车牌号：显示上牌车牌号；通过新增按钮上传行驶证照片后，通过OCR识别技术，自动识别出该车辆识别代号对应车牌号，确认无误提交后自动反写'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.4.车辆识别代码：显示上牌车辆车辆识别代码；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.5.车辆类型：显示该车辆识别代码对应车辆类型；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.6.品牌：显示该车辆识别代码对应品牌；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.7.型号：显示该车辆识别代码对应型号；'),
						React.createElement('div', { style: styles.requirementSubItem }, '3.8.操作：行驶证，点击放大预览行驶证照片；'),
						React.createElement('div', { style: styles.requirementItem }, '下方增加分页功能，支持选择单页数据条数；')
					),
					React.createElement('div', { style: styles.requirementSection },
						React.createElement('div', { style: styles.requirementSectionTitle }, '4.新增：'),
						React.createElement('div', { style: styles.requirementSubItem }, '4.1.点击新增按钮，上传行驶证照片附件，上传后OCR识别过程中弹出卡片提示：识别中，请勿关闭页面；如果照片识别失败，则提示：识别失败，请重新尝试；'),
						React.createElement('div', { style: styles.requirementSubItem }, '4.2.上传成功后确认卡片中显示照片、车辆识别代码、车牌号、强制报废日期、检验有效期，可通过二次编辑进行校正；'),
						React.createElement('div', { style: styles.requirementSubItem }, '4.3.点击卡片页面底部"确认"按钮，确认根据车辆识别代码判断是否存在该车辆，如果是则toast提示"上牌成功"，并在列表中生成操作，如果否则toast提示：该车辆不存在。')
					),
					React.createElement('div', { style: styles.requirementSection },
						React.createElement('div', { style: styles.requirementSectionTitle }, '5.批量上传：'),
						React.createElement('div', { style: styles.requirementItem }, '5.1.点击批量上牌按钮，弹出批量上牌任务卡片，再点击右上角上传车牌，上传多张行驶证照片附件，上传后弹出批量上牌任务卡片：卡片中记录最近5条批量上牌任务，任务字段为任务时间、照片数量、识别错误、完成进度、操作；'),
						React.createElement('div', { style: styles.requirementSubItem }, '5.1.1.任务时间：上传批量照片的时间，精确至分钟，格式为YYYY-MM-DD HH:MM；'),
						React.createElement('div', { style: styles.requirementSubItem }, '5.1.2.照片数量：显示这一批照片总数；'),
						React.createElement('div', { style: styles.requirementSubItem }, '5.1.3.识别错误：显示识别失败的照片总数，hover时气泡卡片显示识别失败的照片名称，以;分隔；'),
						React.createElement('div', { style: styles.requirementSubItem }, '5.1.4.完成进度：显示ocr识别进度条和已完成百分比；'),
						React.createElement('div', { style: styles.requirementSubItem }, '5.1.5.操作：已完成任务操作栏显示识别，未完成任务操作栏显示-；'),
						React.createElement('div', { style: styles.requirementItem }, '5.2.识别：点击识别确认卡片中当前张数、显示照片、车辆识别代码、车牌号、强制报废日期、检验有效期，可通过二次编辑进行校正；当前张数显示在确认上牌信息标题右侧，格式为（当前/总计），依次操作直到完成所有记录提交完成，全部完成后toast提示：批量上传成功；'),
						React.createElement('div', { style: styles.requirementItem }, '5.3.在识别确认卡片中点击确认后将立刻上传该照片，可再次通过点击批量上传拉取上传任务框的方式，自动跳转至最后一条上传记录进行操作；'),
						React.createElement('div', { style: styles.requirementItem }, '5.4.批量上传任务中照片全部识别完成后，不再显示识别按钮；'),
						React.createElement('div', { style: styles.requirementItem }, '5.5.具体识别流程请参考axure菜单目录中上牌管理下的流程图；')
					)
				)
		})
	);
};
if (typeof window !== 'undefined') {
	window.Component = Component;
	function mount() {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		setTimeout(mount, 0);
	}
}
