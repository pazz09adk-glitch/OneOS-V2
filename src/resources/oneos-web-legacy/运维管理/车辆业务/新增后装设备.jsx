// 【重要】必须使用 const Component 作为组件变量名
// 新增后装设备 - 运维管理-车辆业务
var ARCO_TOKEN = {
	primary: '#165DFF',
	primaryHover: '#4080FF',
	neutral1: '#FFFFFF',
	neutral4: '#E5E6EB',
	neutral6: '#86909C',
	neutral8: '#1D2129',
	border: '#E5E6EB',
	fill: '#F2F3F5',
	shadowLight: '0 1px 2px rgba(0,0,0,0.05)',
	radiusLarge: '8px',
	spacing16: '16px',
	spacing24: '24px',
	fontSize14: '14px',
	fontSize16: '16px',
	fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif',
	link: '#165DFF'
};

var DEVICE_TYPES = ['GPS', '尾板', '车身广告', 'G7安全套件', 'G7普通设备', 'G7温控设备', '备胎'];

var MOCK_VEHICLE_OPTIONS = ['粤A12345', '粤A67890', '粤B11111', '粤B22222', '粤C33333', '京A88888'];

const Component = function () {
	var antd = window.antd;
	var Select = antd.Select;
	var Button = antd.Button;
	var Input = antd.Input;
	var message = antd.message;
	var Option = Select.Option;

	var _useState = React.useState('');
	var deviceType = _useState[0];
	var setDeviceType = _useState[1];

	var _useState2 = React.useState('');
	var vehicle = _useState2[0];
	var setVehicle = _useState2[1];

	var _useState3 = React.useState('');
	var supplier = _useState3[0];
	var setSupplier = _useState3[1];

	var handleSubmit = function () {
		message.success('新增成功');
		setDeviceType('');
		setVehicle('');
		setSupplier('');
	};

	var t = ARCO_TOKEN;
	var styles = {
		page: { padding: t.spacing24, fontFamily: t.fontFamily, backgroundColor: t.fill, minHeight: '100vh' },
		breadcrumb: { marginBottom: t.spacing16, fontSize: t.fontSize14, color: t.neutral6, display: 'flex', alignItems: 'center' },
		breadcrumbLink: { color: t.link, textDecoration: 'none', marginRight: '8px' },
		breadcrumbCurrent: { color: t.neutral8 },
		card: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, boxShadow: t.shadowLight, marginBottom: t.spacing16, padding: t.spacing24, maxWidth: 560 },
		label: { display: 'block', marginBottom: 8, fontSize: t.fontSize14, color: t.neutral8 },
		row: { marginBottom: t.spacing16 },
		actions: { marginTop: t.spacing24, display: 'flex', gap: 12 }
	};

	var deviceTypeOptions = DEVICE_TYPES.map(function (type) {
		return React.createElement(Option, { key: type, value: type }, type);
	});

	var vehicleOptions = MOCK_VEHICLE_OPTIONS.map(function (v) {
		return React.createElement(Option, { key: v, value: v }, v);
	});

	return React.createElement(
		'div',
		{ style: styles.page },
		React.createElement(
			'div',
			{ style: styles.breadcrumb },
			React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '运维管理'),
			React.createElement('span', { style: { marginRight: '8px' } }, '/'),
			React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '车辆业务'),
			React.createElement('span', { style: { marginRight: '8px' } }, '/'),
			React.createElement('span', { style: styles.breadcrumbCurrent }, '新增后装设备')
		),
		React.createElement(
			'div',
			{ style: styles.card },
			React.createElement('div', { style: { fontSize: t.fontSize16, fontWeight: 600, marginBottom: t.spacing24, color: t.neutral8 } }, '新增后装设备'),
			React.createElement('div', { style: styles.row },
				React.createElement('label', { style: styles.label }, '设备类型'),
				React.createElement(Select, {
					placeholder: '请选择设备类型',
					style: { width: '100%' },
					value: deviceType || undefined,
					onChange: function (v) { setDeviceType(v || ''); },
					allowClear: true
				}, deviceTypeOptions)
			),
			React.createElement('div', { style: styles.row },
				React.createElement('label', { style: styles.label }, '使用车辆'),
				React.createElement(Select, {
					placeholder: '请选择或输入搜索',
					style: { width: '100%' },
					value: vehicle || undefined,
					onChange: function (v) { setVehicle(v || ''); },
					showSearch: true,
					allowClear: true,
					filterOption: function (input, opt) {
						var c = opt && opt.children;
						return c && String(c).toLowerCase().indexOf((input || '').toLowerCase()) >= 0;
					}
				}, vehicleOptions)
			),
			React.createElement('div', { style: styles.row },
				React.createElement('label', { style: styles.label }, '供应商'),
				React.createElement(Input, {
					placeholder: '请输入供应商',
					value: supplier,
					onChange: function (e) { setSupplier(e.target.value); }
				})
			),
			React.createElement('div', { style: styles.actions },
				React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
				React.createElement(Button, { onClick: function () { setDeviceType(''); setVehicle(''); setSupplier(''); } }, '重置')
			)
		)
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
