// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 客户管理-编辑（与新增相同，仅客户编码不可修改）

const Component = function () {
	var useState = React.useState;
	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Select = antd.Select;
	var Button = antd.Button;
	var Cascader = antd.Cascader;
	var message = antd.message;

	// 模拟编辑回显数据（实际由路由/列表传入）
	var initialDetail = {
		customerCode: 'KH-2025-001',
		coopStatus: '已合作',
		customerName: '嘉兴某某物流有限公司',
		cityCascader: ['浙江省', '嘉兴市'],
		address: '浙江省嘉兴市南湖区科技大道1号',
		region: '华东',
		contact: '张三',
		contactMobile: '13800138001',
		contactPhone: '0571-88888888',
		email: 'zhangsan@example.com',
		creditCodeOrId: '91330400MA2XXXXX1',
		businessManager: '张经理',
		remark: '',
		taxId: '91330400MA2XXXXX1',
		invoiceAddress: '浙江省嘉兴市南湖区科技大道1号',
		invoicePhone: '0571-88888888',
		account: '6222021234567890123',
		openingBank: '中国工商银行嘉兴分行',
		mailingAddress: '浙江省嘉兴市南湖区科技大道1号'
	};

	var customerCode = useState(initialDetail.customerCode);
	var coopStatus = useState(initialDetail.coopStatus);
	var customerName = useState(initialDetail.customerName);
	var cityCascader = useState(initialDetail.cityCascader);
	var address = useState(initialDetail.address);
	var region = useState(initialDetail.region);
	var contact = useState(initialDetail.contact);
	var contactMobile = useState(initialDetail.contactMobile);
	var contactPhone = useState(initialDetail.contactPhone);
	var email = useState(initialDetail.email);
	var creditCodeOrId = useState(initialDetail.creditCodeOrId);
	var businessManager = useState(initialDetail.businessManager);
	var remark = useState(initialDetail.remark);
	var taxId = useState(initialDetail.taxId);
	var invoiceAddress = useState(initialDetail.invoiceAddress);
	var invoicePhone = useState(initialDetail.invoicePhone);
	var account = useState(initialDetail.account);
	var openingBank = useState(initialDetail.openingBank);
	var mailingAddress = useState(initialDetail.mailingAddress);
	var formErrors = useState({});

	var coopStatusOptions = [
		{ value: '已合作', label: '已合作' },
		{ value: '终止合作', label: '终止合作' },
		{ value: '洽谈中', label: '洽谈中' },
		{ value: '合约过期', label: '合约过期' }
	];
	var cityCascaderOptions = [
		{ value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '嘉兴市', label: '嘉兴市' }, { value: '宁波市', label: '宁波市' }] },
		{ value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
		{ value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
		{ value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] },
		{ value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
	];
	var businessManagerOptions = [
		{ value: '张经理', label: '张经理' },
		{ value: '李专员', label: '李专员' },
		{ value: '王专员', label: '王专员' }
	];

	// 根据省/直辖市名称匹配区域（城市级联第一级）
	function getRegionByProvince(area) {
		if (!area) return '';
		var a = String(area).trim();
		if (a === '北京市' || a === '天津市' || a === '河北省' || a === '山西省' || a === '内蒙古') return '华北';
		if (a === '上海市' || a === '江苏省' || a === '浙江省' || a === '安徽省' || a === '福建省' || a === '江西省' || a === '山东省' || a === '台湾省') return '华东';
		if (a === '广东省' || a === '广西省' || a === '海南省' || a === '澳门' || a === '香港') return '华南';
		if (a === '河南省' || a === '湖北省' || a === '湖南省') return '华中';
		if (a === '辽宁省' || a === '吉林省' || a === '黑龙江省') return '东北';
		if (a === '四川省' || a === '云南省' || a === '贵州省' || a === '重庆市' || a === '西藏') return '西南';
		if (a === '陕西省' || a === '甘肃省' || a === '青海省' || a === '宁夏' || a === '新疆') return '西北';
		return '';
	}

	function onCityCascaderChange(value) {
		cityCascader[1](value);
		region[1](value && value[0] ? getRegionByProvince(value[0]) : '');
	}

	function validate() {
		var err = {};
		if (!(coopStatus[0] != null && coopStatus[0] !== '')) err.coopStatus = '请选择合作状态';
		if (!(customerName[0] && String(customerName[0]).trim())) err.customerName = '请输入客户名称';
		if (!(cityCascader[0] && Array.isArray(cityCascader[0]) && cityCascader[0].length >= 2)) err.city = '请选择城市（省-市）';
		if (!(address[0] && String(address[0]).trim())) err.address = '请输入客户地址';
		if (!(contact[0] && String(contact[0]).trim())) err.contact = '请输入联系人';
		if (!(contactMobile[0] && String(contactMobile[0]).trim())) err.contactMobile = '请输入联系人手机';
		if (!(creditCodeOrId[0] && String(creditCodeOrId[0]).trim())) err.creditCodeOrId = '请输入信用代码/身份证';
		if (!(businessManager[0] != null && businessManager[0] !== '')) err.businessManager = '请选择业务经理';
		formErrors[1](err);
		return Object.keys(err).length === 0;
	}

	function handleSubmit() {
		if (!validate()) {
			message.warning('请完善必填项');
			return;
		}
		message.success('保存成功（原型）');
	}

	function handleCancel() {
		if (window.__customerEditBack) window.__customerEditBack();
		else message.info('取消');
	}

	var layoutStyle = { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var formRowStyle = { display: 'flex', flexWrap: 'wrap', marginBottom: 16 };
	var formColStyle = { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8, boxSizing: 'border-box' };
	var formColFullStyle = { flex: '0 0 100%', marginBottom: 8 };
	var labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(0,0,0,0.85)' };
	var labelRequiredStyle = { color: '#ff4d4f', marginRight: 4 };
	var errMsgStyle = { color: '#ff4d4f', fontSize: 12, marginTop: 4 };
	var inputStyle = { width: '100%' };
	var footerStyle = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, zIndex: 99 };

	function FormItem(props) {
		var colStyle = props.fullWidth ? formColFullStyle : formColStyle;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: labelStyle },
				props.required ? React.createElement('span', { style: labelRequiredStyle }, '*') : null,
				props.label
			),
			props.children,
			props.error ? React.createElement('div', { style: errMsgStyle }, props.error) : null
		);
	}

	var basicFields = React.createElement('div', null,
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '客户编码' },
				React.createElement(Input, { value: customerCode[0], style: inputStyle, disabled: true })
			),
			React.createElement(FormItem, { label: '合作状态', required: true, error: formErrors[0].coopStatus },
				React.createElement(Select, {
					placeholder: '请选择合作状态',
					style: inputStyle,
					value: coopStatus[0],
					onChange: function (v) { coopStatus[1](v); },
					options: coopStatusOptions,
					status: formErrors[0].coopStatus ? 'error' : undefined
				})
			),
			React.createElement(FormItem, { label: '客户名称', required: true, error: formErrors[0].customerName },
				React.createElement(Input, { placeholder: '请输入客户名称', value: customerName[0], onChange: function (e) { customerName[1](e.target.value); }, style: inputStyle, status: formErrors[0].customerName ? 'error' : undefined })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '城市', required: true, error: formErrors[0].city },
				React.createElement(Cascader, {
					options: cityCascaderOptions,
					value: cityCascader[0],
					onChange: onCityCascaderChange,
					placeholder: '级联选择器支持2级,省-市即可',
					allowClear: true,
					style: inputStyle
				})
			),
			React.createElement(FormItem, { label: '客户地址', required: true, error: formErrors[0].address },
				React.createElement(Input, { placeholder: '请输入客户地址', value: address[0], onChange: function (e) { address[1](e.target.value); }, style: inputStyle, status: formErrors[0].address ? 'error' : undefined })
			),
			React.createElement(FormItem, { label: '区域' },
				React.createElement(Input, { placeholder: '根据城市自动匹配', value: region[0], readOnly: true, style: Object.assign({}, inputStyle, { backgroundColor: '#f5f5f5', cursor: 'default' }) })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '联系人', required: true, error: formErrors[0].contact },
				React.createElement(Input, { placeholder: '请输入联系人', value: contact[0], onChange: function (e) { contact[1](e.target.value); }, style: inputStyle, status: formErrors[0].contact ? 'error' : undefined })
			),
			React.createElement(FormItem, { label: '联系人手机', required: true, error: formErrors[0].contactMobile },
				React.createElement(Input, { placeholder: '请输入联系人手机', value: contactMobile[0], onChange: function (e) { contactMobile[1](e.target.value); }, style: inputStyle, status: formErrors[0].contactMobile ? 'error' : undefined })
			),
			React.createElement(FormItem, { label: '联系人座机' },
				React.createElement(Input, { placeholder: '请输入联系人座机', value: contactPhone[0], onChange: function (e) { contactPhone[1](e.target.value); }, style: inputStyle })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '电子邮箱' },
				React.createElement(Input, { placeholder: '请输入邮箱地址', value: email[0], onChange: function (e) { email[1](e.target.value); }, style: inputStyle })
			),
			React.createElement(FormItem, { label: '信用代码/身份证', required: true, error: formErrors[0].creditCodeOrId },
				React.createElement(Input, { placeholder: '请输入信用代码编号/身份证号', value: creditCodeOrId[0], onChange: function (e) { creditCodeOrId[1](e.target.value); }, style: inputStyle, status: formErrors[0].creditCodeOrId ? 'error' : undefined })
			),
			React.createElement(FormItem, { label: '业务经理', required: true, error: formErrors[0].businessManager },
				React.createElement(Select, {
					placeholder: '请选择业务经理',
					style: inputStyle,
					value: businessManager[0],
					onChange: function (v) { businessManager[1](v); },
					options: businessManagerOptions,
					status: formErrors[0].businessManager ? 'error' : undefined
				})
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '备注', fullWidth: true },
				React.createElement(Input.TextArea, { placeholder: '请输入备注信息', value: remark[0], onChange: function (e) { remark[1](e.target.value); }, rows: 3, style: inputStyle })
			)
		)
	);

	var invoiceFields = React.createElement('div', null,
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '纳税人识别号' },
				React.createElement(Input, { placeholder: '请输入纳税人识别号', value: taxId[0], onChange: function (e) { taxId[1](e.target.value); }, style: inputStyle })
			),
			React.createElement(FormItem, { label: '地址' },
				React.createElement(Input, { placeholder: '请输入地址信息', value: invoiceAddress[0], onChange: function (e) { invoiceAddress[1](e.target.value); }, style: inputStyle })
			),
			React.createElement(FormItem, { label: '电话' },
				React.createElement(Input, { placeholder: '请输入电话', value: invoicePhone[0], onChange: function (e) { invoicePhone[1](e.target.value); }, style: inputStyle })
			)
		),
		React.createElement('div', { style: formRowStyle },
			React.createElement(FormItem, { label: '账户' },
				React.createElement(Input, { placeholder: '请输入账户信息', value: account[0], onChange: function (e) { account[1](e.target.value); }, style: inputStyle })
			),
			React.createElement(FormItem, { label: '开户行' },
				React.createElement(Input, { placeholder: '请输入开户行信息', value: openingBank[0], onChange: function (e) { openingBank[1](e.target.value); }, style: inputStyle })
			),
			React.createElement(FormItem, { label: '邮寄地址' },
				React.createElement(Input, { placeholder: '请输入邮寄地址', value: mailingAddress[0], onChange: function (e) { mailingAddress[1](e.target.value); }, style: inputStyle })
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

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '客户管理' },
					{ title: '编辑', className: 'breadcrumb-last' }
				]
			})
		),
		React.createElement(Card, { title: CardTitleWithBar('客户基本信息'), style: cardStyle }, basicFields),
		React.createElement(Card, { title: CardTitleWithBar('客户开票信息'), style: cardStyle }, invoiceFields),
		React.createElement('div', { style: { height: 60 } }),
		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		)
	);
};
