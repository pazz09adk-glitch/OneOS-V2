// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 备件库 - 仓库管理（列表页原型）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Drawer = antd.Drawer;
	var Input = antd.Input;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Modal = antd.Modal;
	var message = antd.message;

	var RangePicker = DatePicker.RangePicker;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function pad2(n) {
		return n < 10 ? '0' + n : '' + n;
	}

	// 格式化：YYYY-MM-DD HH:MM（尽量保持输入原样）
	function fmtYMDHM(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s) return '-';
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + ' 00:00';
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
		} catch (e) {
			return s;
		}
	}

	function matchRange(valStr, range) {
		if (!range || !range[0] || !range[1]) return true;
		var s = '';
		var e = '';
		if (range[0] && range[0].format) s = range[0].format('YYYY-MM-DD');
		if (range[1] && range[1].format) e = range[1].format('YYYY-MM-DD');
		if (!s && !e) return true;
		var v = String(valStr || '').slice(0, 10);
		if (s && v < s) return false;
		if (e && v > e) return false;
		return true;
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var tableSingleLineStyle = '.warehouse-list-table .ant-table-thead th,.warehouse-list-table .ant-table-tbody td{white-space:nowrap;}';

	// mock 列表数据（仓库是否为空用 itemCount 表示）
	var warehousesState = useState(function () {
		return [
			{ id: 'wh1', warehouseCode: 'WH-001', warehouseName: '天河备件库', warehouseAddress: '广州市天河区xx路1号', warehouseManager: '张明', creatorName: '张明', createTime: '2026-02-20 09:30', itemCount: 12 },
			{ id: 'wh2', warehouseCode: 'WH-002', warehouseName: '西湖服务备件库', warehouseAddress: '杭州市西湖区xx街88号', warehouseManager: '王芳', creatorName: '王芳', createTime: '2026-02-21 14:10', itemCount: 0 },
			{ id: 'wh3', warehouseCode: 'WH-003', warehouseName: '上海浦东备件仓', warehouseAddress: '上海市浦东新区xx大道55号', warehouseManager: '李华', creatorName: '李华', createTime: '2026-02-22 08:45', itemCount: 5 },
			{ id: 'wh4', warehouseCode: 'WH-004', warehouseName: '深圳南山备件仓', warehouseAddress: '深圳市南山区xx科技园3栋', warehouseManager: '赵强', creatorName: '赵强', createTime: '2026-02-23 10:20', itemCount: 0 },
			{ id: 'wh5', warehouseCode: 'WH-005', warehouseName: '成都高新备件库', warehouseAddress: '成都市高新区xx路12号', warehouseManager: '陈静', creatorName: '陈静', createTime: '2026-02-24 11:05', itemCount: 9 },
			{ id: 'wh6', warehouseCode: 'WH-006', warehouseName: '宁波江北备件库', warehouseAddress: '宁波市江北区xx街道6号', warehouseManager: '张明', creatorName: '张明', createTime: '2026-02-25 16:40', itemCount: 0 },
			{ id: 'wh7', warehouseCode: 'WH-007', warehouseName: '北京朝阳备件仓', warehouseAddress: '北京市朝阳区xx路77号', warehouseManager: '王芳', creatorName: '王芳', createTime: '2026-02-26 09:15', itemCount: 21 },
			{ id: 'wh8', warehouseCode: 'WH-008', warehouseName: '重庆两江备件库', warehouseAddress: '重庆市两江新区xx大道18号', warehouseManager: '李华', creatorName: '李华', createTime: '2026-02-27 07:45', itemCount: 2 }
		];
	});
	var warehouses = warehousesState[0];
	var setWarehouses = warehousesState[1];

	var defaultDraftState = { warehouseName: undefined, creatorName: undefined, createTimeRange: null };

	var draftState = useState(Object.assign({}, defaultDraftState));
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState(Object.assign({}, defaultDraftState));
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];

	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	// 新增抽屉
	var addDrawerOpenState = useState(false);
	var addDrawerOpen = addDrawerOpenState[0];
	var setAddDrawerOpen = addDrawerOpenState[1];

	var addDrawerModeState = useState('add'); // 'add' | 'edit'
	var addDrawerMode = addDrawerModeState[0];
	var setAddDrawerMode = addDrawerModeState[1];

	var editingWarehouseIdState = useState(null);
	var editingWarehouseId = editingWarehouseIdState[0];
	var setEditingWarehouseId = editingWarehouseIdState[1];

	var addFormState = useState({
		warehouseCode: '',
		warehouseName: '',
		warehouseAddress: '',
		warehouseManager: undefined
	});
	var addForm = addFormState[0];
	var setAddForm = addFormState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「仓库管理」模块',
		'#面包屑：运维管理-备件库-仓库管理',
		'',
		'1.筛选：',
		'1.1.仓库名称：选择器，支持输入框内输入内容模糊搜索下拉匹配结果；',
		'1.2.创建人：选择器，下拉显示创建人；',
		'1.3.创建时间：日期选择器，支持单输入框双日历通过开始-结束时间筛选；',
		'',
		'2.列表；右侧为新增；',
		'2.1.序号：1.2.3.以此类推；',
		'2.2.仓库编码：显示仓库编码；',
		'2.3.仓库名称：显示仓库名称；',
		'2.4.仓库地址：显示仓库地址；',
		'2.5.仓库管理人：显示仓库管理人；',
		'2.6.创建人：显示创建人；',
		'2.7.创建时间：显示创建时间，格式为：YYYY-MM-DD HH:MM；',
		'2.8.操作：编辑、删除；',
		'    2.8.1.编辑：跳转仓库设置-编辑页；',
		'    2.8.2.删除：点击进行二次确认，确认后判断仓库是否为空，如果仓库非空则提示：清空仓库后才可删除该仓库，仓库为空则提示：删除成功；'
	].join('\n');

	var creatorOptions = useMemo(function () {
		// 创建人下拉来源：固定示例 + 兼容 mock 数据变更
		var set = new Set();
		setWarehouses; // keep linter friendly for unused setters in some generators
		(warehouses || []).forEach(function (r) { if (r && r.creatorName) set.add(r.creatorName); });
		if (set.size === 0) {
			['张明', '王芳', '李华', '赵强', '陈静'].forEach(function (v) { set.add(v); });
		}
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [warehouses]);

	var warehouseManagerOptions = useMemo(function () {
		var set = new Set();
		(warehouses || []).forEach(function (r) { if (r && r.warehouseManager) set.add(r.warehouseManager); });
		if (set.size === 0) {
			['张明', '王芳', '李华', '赵强', '陈静'].forEach(function (v) { set.add(v); });
		}
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [warehouses]);

	var warehouseNameOptions = useMemo(function () {
		var set = new Set();
		(warehouses || []).forEach(function (r) { if (r && r.warehouseName) set.add(r.warehouseName); });
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [warehouses]);

	var filtered = useMemo(function () {
		return (warehouses || []).filter(function (r) {
			if (applied.warehouseName && r.warehouseName !== applied.warehouseName) return false;
			if (applied.creatorName && r.creatorName !== applied.creatorName) return false;
			if (!matchRange(r.createTime, applied.createTimeRange)) return false;
			return true;
		});
	}, [warehouses, applied]);

	var paged = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page, pageSize]);

	var serialStart = (page - 1) * pageSize;

	var handleQuery = useCallback(function () {
		setApplied({
			warehouseName: draft.warehouseName,
			creatorName: draft.creatorName,
			createTimeRange: draft.createTimeRange
		});
		setPage(1);
	}, [draft]);

	var handleReset = useCallback(function () {
		setDraft(Object.assign({}, defaultDraftState));
		setApplied(Object.assign({}, defaultDraftState));
		setPage(1);
	}, []);

	var handleAdd = useCallback(function () {
		setAddDrawerMode('add');
		setEditingWarehouseId(null);
		setAddForm({ warehouseCode: '', warehouseName: '', warehouseAddress: '', warehouseManager: undefined });
		setAddDrawerOpen(true);
	}, []);

	var handleEdit = useCallback(function (row) {
		if (!row) return;
		setAddDrawerMode('edit');
		setEditingWarehouseId(row.id);
		setAddForm({
			warehouseCode: row.warehouseCode || '',
			warehouseName: row.warehouseName || '',
			warehouseAddress: row.warehouseAddress || '',
			warehouseManager: row.warehouseManager
		});
		setAddDrawerOpen(true);
	}, []);

	var handleAddCancel = useCallback(function () {
		setAddDrawerOpen(false);
		setAddDrawerMode('add');
		setEditingWarehouseId(null);
		setAddForm({ warehouseCode: '', warehouseName: '', warehouseAddress: '', warehouseManager: undefined });
	}, []);

	function nowYMDHM() {
		var d = new Date();
		return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
	}

	var handleAddSubmit = useCallback(function () {
		var code = String(addForm.warehouseCode || '').trim();
		var name = String(addForm.warehouseName || '').trim();
		var address = String(addForm.warehouseAddress || '').trim();
		var manager = addForm.warehouseManager ? addForm.warehouseManager : undefined;

		// 仅仓库编码、仓库名称必填；地址/管理人选填
		if (!code) {
			message.warning('请填写仓库编码');
			return;
		}
		if (!name) {
			message.warning('请填写仓库名称');
			return;
		}

		if (addDrawerMode === 'edit') {
			if (!editingWarehouseId) {
				message.error('无法定位要编辑的仓库记录');
				return;
			}
			setWarehouses(function (prev) {
				return (prev || []).map(function (r) {
					if (!r || r.id !== editingWarehouseId) return r;
					return Object.assign({}, r, {
						warehouseCode: code,
						warehouseName: name,
						warehouseAddress: address,
						warehouseManager: manager
					});
				});
			});
			setAddDrawerOpen(false);
			setAddDrawerMode('add');
			setEditingWarehouseId(null);
			message.success('编辑成功');
			return;
		}

		var item = {
			id: 'wh' + Date.now(),
			warehouseCode: code,
			warehouseName: name,
			warehouseAddress: address,
			warehouseManager: manager,
			creatorName: '当前用户',
			createTime: nowYMDHM(),
			itemCount: 0
		};

		setWarehouses(function (prev) {
			return [item].concat(prev || []);
		});
		setAddDrawerOpen(false);
		setAddDrawerMode('add');
		setEditingWarehouseId(null);
		message.success('新增成功');
	}, [addForm, addDrawerMode, editingWarehouseId, setWarehouses, setAddDrawerMode, setEditingWarehouseId]);

	var handleDelete = useCallback(function (row) {
		if (!row) return;
		Modal.confirm({
			title: '确认删除',
			content: '请确认是否删除该仓库',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				if (row.itemCount > 0) {
					message.warning('清空仓库后才可删除该仓库');
					return;
				}
				setWarehouses(function (prev) {
					return (prev || []).filter(function (r) { return r.id !== row.id; });
				});
				message.success('删除成功');
			}
		});
	}, [setWarehouses]);

	var columns = useMemo(function () {
		return [
			{
				title: '序号',
				key: 'serial',
				width: 70,
				fixed: 'left',
				render: function (_, r, idx) {
					return serialStart + idx + 1;
				}
			},
			{ title: '仓库编码', dataIndex: 'warehouseCode', key: 'warehouseCode', width: 160, fixed: 'left' },
			{ title: '仓库名称', dataIndex: 'warehouseName', key: 'warehouseName', width: 180, ellipsis: true },
			{ title: '仓库地址', dataIndex: 'warehouseAddress', key: 'warehouseAddress', width: 240, ellipsis: true },
			{ title: '仓库管理人', dataIndex: 'warehouseManager', key: 'warehouseManager', width: 140 },
			{ title: '创建人', dataIndex: 'creatorName', key: 'creatorName', width: 120 },
			{
				title: '创建时间',
				dataIndex: 'createTime',
				key: 'createTime',
				width: 200,
				render: function (v) { return fmtYMDHM(v); }
			},
			{
				title: '操作',
				key: 'action',
				width: 180,
				fixed: 'right',
				render: function (_, r) {
					return React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
						React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleEdit(r); } }, '编辑'),
						React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { handleDelete(r); } }, '删除')
					);
				}
			}
		];
	}, [serialStart, handleDelete]);

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '备件库' }, { title: '仓库管理' }] }),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
		),

		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalOpen,
			onCancel: function () { setRequirementModalOpen(false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementDocContent)),

		React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '仓库名称'),
					React.createElement(Select, {
						placeholder: '请输入或选择仓库名称',
						style: filterControlStyle,
						value: draft.warehouseName,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { warehouseName: v }); }); },
						allowClear: true,
						showSearch: true,
						options: warehouseNameOptions,
						filterOption: filterOption
					})
				),

				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '创建人'),
					React.createElement(Select, {
						placeholder: '请选择创建人',
						style: filterControlStyle,
						value: draft.creatorName,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { creatorName: v }); }); },
						allowClear: true,
						showSearch: true,
						options: creatorOptions
					})
				),

				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '创建时间'),
					React.createElement(RangePicker, {
						style: filterControlStyle,
						value: draft.createTimeRange,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { createTimeRange: v }); }); },
						placeholder: ['开始时间', '结束时间'],
						showTime: false
					})
				)
			),

			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleReset }, '重置'),
				React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
			)
		),

		React.createElement(Card, null,
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 } },
				React.createElement(Button, { type: 'primary', onClick: handleAdd }, '新增')
			),

			React.createElement('style', null, tableSingleLineStyle),
			React.createElement('div', { className: 'warehouse-list-table' },
				React.createElement(Table, {
					rowKey: 'id',
					columns: columns,
					dataSource: paged,
					scroll: { x: 1200 },
					size: 'small',
					pagination: {
						current: page,
						pageSize: pageSize,
						total: filtered.length,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; },
						onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
					}
				})
			)
		),

		React.createElement(Drawer, {
			title: addDrawerMode === 'edit' ? '编辑仓库' : '新增仓库',
			placement: 'right',
			width: 460,
			open: addDrawerOpen,
			onClose: handleAddCancel,
			styles: { body: { padding: 24 } },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
				React.createElement(Button, { type: 'primary', onClick: handleAddSubmit }, '提交'),
				React.createElement(Button, { onClick: handleAddCancel }, '取消')
			)
		},
			React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
				React.createElement('div', null,
					React.createElement('div', { style: { marginBottom: 6, color: '#666', fontSize: 14 } }, '仓库编码'),
					React.createElement(Input, {
						value: addForm.warehouseCode,
						disabled: addDrawerMode === 'edit',
						onChange: function (e) { setAddForm(function (p) { return Object.assign({}, p, { warehouseCode: e && e.target ? e.target.value : '' }); }); },
						placeholder: '请输入仓库编码'
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: { marginBottom: 6, color: '#666', fontSize: 14 } }, '仓库名称'),
					React.createElement(Input, {
						value: addForm.warehouseName,
						onChange: function (e) { setAddForm(function (p) { return Object.assign({}, p, { warehouseName: e && e.target ? e.target.value : '' }); }); },
						placeholder: '请输入仓库名称'
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: { marginBottom: 6, color: '#666', fontSize: 14 } }, '仓库地址'),
					React.createElement(Input, {
						value: addForm.warehouseAddress,
						onChange: function (e) { setAddForm(function (p) { return Object.assign({}, p, { warehouseAddress: e && e.target ? e.target.value : '' }); }); },
						placeholder: '请输入仓库地址'
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: { marginBottom: 6, color: '#666', fontSize: 14 } }, '仓库管理人'),
					React.createElement(Select, {
						placeholder: '请选择人员',
						value: addForm.warehouseManager,
						onChange: function (v) { setAddForm(function (p) { return Object.assign({}, p, { warehouseManager: v }); }); },
						style: { width: '100%' },
						allowClear: true,
						showSearch: true,
						filterOption: filterOption,
						options: warehouseManagerOptions
					})
				)
			)
		)
	);
};

