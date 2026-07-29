// 【重要】必须使用 const Component 作为组件变量名
// 基本数据维护 - 型号参数-查看（布局同型号参数-新增，全部只读）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Select = antd.Select;
	var Button = antd.Button;
	var Radio = antd.Radio;
	var Table = antd.Table;

	// 只读数据（示例，与车辆管理-查看型号参数一致）
	var brandOptions = [
		{ value: '苏龙', label: '苏龙' },
		{ value: '东风', label: '东风' },
		{ value: '福田', label: '福田' },
		{ value: '江淮', label: '江淮' },
		{ value: '重汽', label: '重汽' },
		{ value: '陕汽', label: '陕汽' }
	];
	var detail = useMemo(function () {
		return {
			brand: '苏龙',
			model: '海格牌KLQ5180XYKFCEV',
			announcementModel: 'KLQ5180XYKFCEV',
			vehicleType: '18吨双飞翼货车',
			fuelType: '氢',
			plateColor: '绿牌',
			sizeLength: '5995',
			sizeWidth: '2145',
			sizeHeight: '3130',
			tireCount: '8',
			tireWearFeePerMm: '2.50',
			batteryType: '磷酸铁锂',
			batteryVendor: '某某电池企业',
			capacityKwh: '100000',
			electricRange: '200',
			cylinderCapacity: '140',
			gaugeMode: 'MPa',
			hydrogenRange: '1000',
			coldMachineVendor: '某某冷机企业',
			maintenanceList: [
				{ key: '1', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571' },
				{ key: '2', item: '机油', kmCycle: '50000', monthCycle: '12', laborCost: '100', materialCost: '300', total: '400' }
			]
		};
	}, []);

	var layoutStyle = { padding: '16px 24px 80px', backgroundColor: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var formRowStyle = { display: 'flex', flexWrap: 'wrap', marginBottom: 16 };
	var formColStyle = { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8, boxSizing: 'border-box' };
	var formColFullStyle = { flex: '0 0 100%', marginBottom: 8 };
	var labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(0,0,0,0.85)' };
	var inputStyle = { width: '100%', backgroundColor: '#f5f5f5' };
	var footerStyle = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, zIndex: 99 };
	var cardTitleBarStyle = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', fontSize: 15, fontWeight: 500, lineHeight: 1.5 };
	var cardTitleBarLineStyle = { width: 4, height: 16, backgroundColor: '#1890ff', borderRadius: 2, marginRight: 8, flexShrink: 0 };

	function FormItem(props) {
		var colStyle = props.fullWidth ? formColFullStyle : formColStyle;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: labelStyle }, props.label),
			props.children
		);
	}

	function CardTitleWithBar(title) {
		return React.createElement('div', { style: cardTitleBarStyle },
			React.createElement('span', { style: cardTitleBarLineStyle }),
			React.createElement('span', null, title)
		);
	}

	var maintenanceColumns = [
		{ title: '养护项目', dataIndex: 'item', key: 'item', width: 160, render: function (v) { return v || '—'; } },
		{ title: '保养公里周期(KM)', dataIndex: 'kmCycle', key: 'kmCycle', width: 140, render: function (v) { return v || '—'; } },
		{ title: '保养时间周期(月)', dataIndex: 'monthCycle', key: 'monthCycle', width: 140, render: function (v) { return v || '—'; } },
		{ title: '工时费(元)', dataIndex: 'laborCost', key: 'laborCost', width: 120, render: function (v) { return v || '—'; } },
		{ title: '材料费(元)', dataIndex: 'materialCost', key: 'materialCost', width: 120, render: function (v) { return v || '—'; } },
		{ title: '合计', dataIndex: 'total', key: 'total', width: 100, render: function (v) { return v || '—'; } }
	];

	function handleBack() {
		if (window.history && window.history.back) window.history.back();
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '基本数据维护' },
					{ title: '型号参数' },
					{ title: '查看' }
				]
			})
		),
		React.createElement(Card, { title: CardTitleWithBar('型号参数'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '品牌' },
					React.createElement(Select, { value: detail.brand, disabled: true, style: inputStyle, options: brandOptions })
				),
				React.createElement(FormItem, { label: '型号' },
					React.createElement(Input, { value: detail.model, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '公告型号' },
					React.createElement(Input, { value: detail.announcementModel, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '车辆类型' },
					React.createElement(Input, { value: detail.vehicleType, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '燃料种类' },
					React.createElement(Input, { value: detail.fuelType, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '车牌颜色' },
					React.createElement(Radio.Group, { value: detail.plateColor, disabled: true },
						React.createElement(Radio, { value: '绿牌' }, '绿牌'),
						React.createElement(Radio, { value: '黄牌' }, '黄牌'),
						React.createElement(Radio, { value: '黄绿牌' }, '黄绿牌')
					)
				),
				React.createElement(FormItem, { label: '整车尺寸', fullWidth: true },
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
						React.createElement(Input, { value: detail.sizeLength, disabled: true, style: { flex: 1, minWidth: 0, backgroundColor: '#f5f5f5' } }),
						React.createElement('span', { style: { flexShrink: 0 } }, '×'),
						React.createElement(Input, { value: detail.sizeWidth, disabled: true, style: { flex: 1, minWidth: 0, backgroundColor: '#f5f5f5' } }),
						React.createElement('span', { style: { flexShrink: 0 } }, '×'),
						React.createElement(Input, { value: detail.sizeHeight, disabled: true, style: { flex: 1, minWidth: 0, backgroundColor: '#f5f5f5' } })
					)
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('轮胎情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '轮胎数量' },
					React.createElement(Input, { value: detail.tireCount, disabled: true, style: inputStyle, addonAfter: '条' })
				),
				React.createElement(FormItem, { label: '轮胎磨损费用（元/mm）' },
					React.createElement(Input, { value: detail.tireWearFeePerMm, disabled: true, style: inputStyle, addonAfter: '元' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('电气情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '电池类型' },
					React.createElement(Radio.Group, { value: detail.batteryType, disabled: true },
						React.createElement(Radio, { value: '磷酸铁锂' }, '磷酸铁锂'),
						React.createElement(Radio, { value: '三元锂' }, '三元锂')
					)
				),
				React.createElement(FormItem, { label: '电池厂家' },
					React.createElement(Input, { value: detail.batteryVendor, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '储电量' },
					React.createElement(Input, { value: detail.capacityKwh, disabled: true, style: inputStyle, addonAfter: 'kWh' })
				),
				React.createElement(FormItem, { label: '电续航里程' },
					React.createElement(Input, { value: detail.electricRange, disabled: true, style: inputStyle, addonAfter: 'KM' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('供氢系统情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '氢瓶容量' },
					React.createElement(Input, { value: detail.cylinderCapacity, disabled: true, style: inputStyle, addonAfter: 'L' })
				),
				React.createElement(FormItem, { label: '仪表盘显示模式' },
					React.createElement(Input, { value: detail.gaugeMode, disabled: true, style: inputStyle })
				),
				React.createElement(FormItem, { label: '氢续航里程' },
					React.createElement(Input, { value: detail.hydrogenRange, disabled: true, style: inputStyle, addonAfter: 'KM' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('其他系统情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '冷机厂家' },
					React.createElement(Input, { value: detail.coldMachineVendor, disabled: true, style: inputStyle })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('保养项情况'), size: 'small', style: cardStyle },
			React.createElement(Table, {
				columns: maintenanceColumns,
				dataSource: detail.maintenanceList,
				rowKey: 'key',
				pagination: false,
				size: 'small',
				bordered: true
			})
		),
		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { onClick: handleBack }, '返回')
		)
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
