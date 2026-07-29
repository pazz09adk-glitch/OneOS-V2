// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 供应商管理-查看（布局同供应商管理-新增，所有字段禁用）

const Component = function () {
	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Select = antd.Select;
	var Button = antd.Button;
	var Cascader = antd.Cascader;

	// 模拟查看数据（实际由路由/列表传入）
	var detail = {
		supplierCode: 'GYS-2025-001',
		coopStatus: '已合作',
		supplierName: '嘉兴某某加氢站',
		type: '加氢站',
		cityCascader: ['浙江省', '嘉兴市'],
		address: '浙江省嘉兴市南湖区科技大道1号',
		region: '华东',
		contact: '张三',
		contactMobile: '13800138001',
		contactPhone: '0571-88888888',
		email: 'zhangsan@example.com',
		creditCodeOrId: '91330400MA2XXXXX1',
		remark: '',
		taxId: '91330400MA2XXXXX1',
		invoiceAddress: '浙江省嘉兴市南湖区科技大道1号',
		invoicePhone: '0571-88888888',
		account: '6222021234567890123',
		openingBank: '中国工商银行嘉兴分行',
		mailingAddress: '浙江省嘉兴市南湖区科技大道1号'
	};

	var inputStyle = { width: '100%' };
	var layoutStyle = { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var formRowStyle = { display: 'flex', flexWrap: 'wrap', marginBottom: 16 };
	var formColStyle = { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8, boxSizing: 'border-box' };
	var formColFullStyle = { flex: '0 0 100%', marginBottom: 8 };
	var labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(0,0,0,0.85)' };
	var labelRequiredStyle = { color: '#ff4d4f', marginRight: 4 };
	var footerStyle = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, zIndex: 99 };

	var cityCascaderOptions = [
		{ value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '嘉兴市', label: '嘉兴市' }, { value: '宁波市', label: '宁波市' }] },
		{ value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
		{ value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
		{ value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] },
		{ value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
	];
	var coopStatusOptions = [
		{ value: '已合作', label: '已合作' },
		{ value: '终止合作', label: '终止合作' },
		{ value: '洽谈中', label: '洽谈中' },
		{ value: '合约过期', label: '合约过期' }
	];
	var typeOptions = [
		{ value: '备件供应商', label: '备件供应商' },
		{ value: '保险公司', label: '保险公司' },
		{ value: '加氢站', label: '加氢站' },
		{ value: '充电站', label: '充电站' },
		{ value: '维修站', label: '维修站' },
		{ value: '救援车队', label: '救援车队' },
		{ value: '整车厂', label: '整车厂' },
		{ value: '其他', label: '其他' }
	];

	function FormItem(props) {
		var colStyle = props.fullWidth ? formColFullStyle : formColStyle;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: labelStyle },
				props.required ? React.createElement('span', { style: labelRequiredStyle }, '*') : null,
				props.label
			),
			props.children
		);
	}

	var basicFields = React.createElement('div', null,
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '供应商编码' },
				React.createElement(Input, { value: detail.supplierCode, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '合作状态', required: true },
				React.createElement(Select, { value: detail.coopStatus, style: inputStyle, disabled: true, options: coopStatusOptions })
			),
			React.createElement(FormItem, { label: '供应商名称', required: true },
				React.createElement(Input, { value: detail.supplierName, style: inputStyle, disabled: true })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '类型', required: true },
				React.createElement(Select, { value: detail.type, style: inputStyle, disabled: true, options: typeOptions })
			),
			React.createElement(FormItem, { label: '城市', required: true },
				React.createElement(Cascader, { value: detail.cityCascader, style: inputStyle, disabled: true, options: cityCascaderOptions })
			),
			React.createElement(FormItem, { label: '供应商地址', required: true },
				React.createElement(Input, { value: detail.address, style: inputStyle, disabled: true })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '区域' },
				React.createElement(Input, { value: detail.region, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '联系人', required: true },
				React.createElement(Input, { value: detail.contact, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '联系人手机', required: true },
				React.createElement(Input, { value: detail.contactMobile, style: inputStyle, disabled: true })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '联系人座机' },
				React.createElement(Input, { value: detail.contactPhone || '-', style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '电子邮箱' },
				React.createElement(Input, { value: detail.email, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '信用代码/身份证', required: true },
				React.createElement(Input, { value: detail.creditCodeOrId, style: inputStyle, disabled: true })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '备注', fullWidth: true },
				React.createElement(Input.TextArea, { value: detail.remark || '', rows: 3, style: inputStyle, disabled: true })
			)
		)
	);

	var invoiceFields = React.createElement('div', null,
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '纳税人识别号' },
				React.createElement(Input, { value: detail.taxId, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '地址' },
				React.createElement(Input, { value: detail.invoiceAddress, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '电话' },
				React.createElement(Input, { value: detail.invoicePhone, style: inputStyle, disabled: true })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '账户' },
				React.createElement(Input, { value: detail.account, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '开户行' },
				React.createElement(Input, { value: detail.openingBank, style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '邮寄地址' },
				React.createElement(Input, { value: detail.mailingAddress, style: inputStyle, disabled: true })
			)
		)
	);

	var cardTitleStyle = { display: 'flex', alignItems: 'center', gap: 8 };
	var cardTitleBarStyle = { width: 4, height: 16, backgroundColor: '#1890ff', borderRadius: 2 };
	function CardTitleWithBar(text) {
		return React.createElement('span', { style: cardTitleStyle },
			React.createElement('span', { style: cardTitleBarStyle }),
			text
		);
	}

	function handleBack() {
		if (window.__supplierViewBack) window.__supplierViewBack();
		else if (window.history && window.history.back) window.history.back();
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '供应商管理' },
					{ title: '查看', className: 'breadcrumb-last' }
				]
			})
		),
		React.createElement(Card, { title: CardTitleWithBar('供应商基本信息'), style: cardStyle }, basicFields),
		React.createElement(Card, { title: CardTitleWithBar('供应商开票信息'), style: cardStyle }, invoiceFields),
		React.createElement('div', { style: { height: 60 } }),
		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleBack }, '返回')
		)
	);
};
