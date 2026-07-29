// 【重要】必须使用 const Component 作为组件变量名
// 参考 Arco Design Pro 登录页布局：左侧品牌区 + 右侧登录表单
const Component = function () {
	var antd = window.antd;
	var useState = React.useState;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var _state = useState({ username: '', password: '', remember: true, agreeTerms: false, phone: '', smsCode: '' });
	var formData = _state[0];
	var setFormData = _state[1];

	var _mode = useState('account');
	var loginMode = _mode[0];
	var setLoginMode = _mode[1];

	var _countdown = useState(0);
	var countdown = _countdown[0];
	var setCountdown = _countdown[1];

	var _hasRequestedCode = useState(false);
	var hasRequestedCode = _hasRequestedCode[0];
	var setHasRequestedCode = _hasRequestedCode[1];

	var timerRef = useRef(null);

	useEffect(function () {
		return function () {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	var handleChange = function (field, value) {
		var next = {};
		next[field] = value;
		setFormData(function (prev) {
			return Object.assign({}, prev, next);
		});
	};

	var handleGetCode = function () {
		if (countdown > 0) return;
		setHasRequestedCode(true);
		setCountdown(60);
		timerRef.current = setInterval(function () {
			setCountdown(function (prev) {
				if (prev <= 1) {
					clearInterval(timerRef.current);
					timerRef.current = null;
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	var handleSubmit = function () {
		if (!formData.agreeTerms) {
			antd.message.warning('请阅读并同意《用户服务协议》和《隐私政策》');
			return;
		}
		if (loginMode === 'phone') {
			if (!formData.phone) {
				antd.message.warning('请输入手机号');
				return;
			}
			if (!formData.smsCode) {
				antd.message.warning('请输入验证码');
				return;
			}
		} else {
			if (!formData.username) {
				antd.message.warning('请输入用户名');
				return;
			}
			if (!formData.password) {
				antd.message.warning('请输入密码');
				return;
			}
		}
		antd.message.success('登录成功（原型演示）');
		if (window.$axure && typeof window.$axure.navigateToUrl === 'function') {
			window.$axure.navigateToUrl('工作台');
		} else {
			window.location.hash = '工作台';
		}
	};

	var switchToPhone = function (e) {
		if (e && e.preventDefault) e.preventDefault();
		setLoginMode('phone');
	};
	var switchToAccount = function (e) {
		if (e && e.preventDefault) e.preventDefault();
		setLoginMode('account');
	};

	var styles = {
		wrap: {
			display: 'flex',
			minHeight: '100vh',
			width: '100%',
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			backgroundColor: '#f5f5f5'
		},
		left: {
			flex: '1',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			padding: '48px',
			background: 'linear-gradient(135deg, #1d2129 0%, #2d3748 50%, #1d2129 100%)',
			color: '#fff'
		},
		leftContent: {
			maxWidth: '400px',
			textAlign: 'center'
		},
		title: {
			fontSize: '28px',
			fontWeight: '600',
			marginBottom: '16px',
			letterSpacing: '0.5px'
		},
		slogan: {
			fontSize: '17px',
			fontWeight: '500',
			opacity: 0.92,
			lineHeight: 1.65,
			marginBottom: '20px',
			letterSpacing: '0.02em'
		},
		desc: {
			fontSize: '14px',
			opacity: 0.72,
			lineHeight: 1.6
		},
		right: {
			width: '480px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			padding: '48px',
			backgroundColor: '#fff',
			boxShadow: '-4px 0 24px rgba(0,0,0,0.06)'
		},
		formCard: {
			width: '100%',
			maxWidth: '360px'
		},
		formTitle: {
			fontSize: '24px',
			fontWeight: '600',
			color: '#1d2129',
			marginBottom: '8px',
			textAlign: 'center'
		},
		formSub: {
			fontSize: '14px',
			color: '#86909c',
			marginBottom: '32px',
			textAlign: 'center'
		},
		formItem: {
			marginBottom: '20px'
		},
		label: {
			display: 'block',
			fontSize: '14px',
			color: '#4e5969',
			marginBottom: '8px'
		},
		input: {
			width: '100%',
			height: '40px',
			padding: '8px 12px',
			fontSize: '14px',
			border: '1px solid #e5e6eb',
			borderRadius: '6px',
			boxSizing: 'border-box',
			outline: 'none'
		},
		codeRow: {
			display: 'flex',
			gap: '8px',
			alignItems: 'center'
		},
		codeInput: {
			flex: '1',
			height: '40px',
			padding: '8px 12px',
			fontSize: '14px',
			border: '1px solid #e5e6eb',
			borderRadius: '6px',
			boxSizing: 'border-box',
			outline: 'none'
		},
		getCodeBtn: {
			flexShrink: 0,
			height: '40px',
			padding: '0 16px',
			fontSize: '14px',
			color: '#165dff',
			backgroundColor: '#fff',
			border: '1px solid #165dff',
			borderRadius: '6px',
			cursor: 'pointer'
		},
		getCodeBtnDisabled: {
			color: '#86909c',
			borderColor: '#e5e6eb',
			cursor: 'not-allowed'
		},
		row: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: '24px'
		},
		submitBtn: {
			width: '100%',
			height: '44px',
			fontSize: '16px',
			fontWeight: '500',
			borderRadius: '6px'
		},
		tabBar: {
			display: 'flex',
			marginBottom: '24px',
			borderBottom: '1px solid #e5e6eb'
		},
		tab: {
			flex: 1,
			textAlign: 'center',
			padding: '12px 0',
			fontSize: '15px',
			color: '#86909c',
			cursor: 'pointer',
			borderBottom: '2px solid transparent',
			marginBottom: '-1px'
		},
		tabActive: {
			color: '#165dff',
			fontWeight: '500',
			borderBottomColor: '#165dff'
		}
	};

	return React.createElement(
		React.Fragment,
		null,
		React.createElement('style', {
			dangerouslySetInnerHTML: {
				__html: '@media (max-width: 768px) { .login-right { width: 100% !important; min-width: 100% !important; } .login-left { min-height: 200px !important; } .login-wrap { flex-direction: column !important; } }'
			}
		}),
		React.createElement(
			'div',
			{ style: styles.wrap, className: 'login-wrap' },
		React.createElement(
			'div',
			{ style: styles.left, className: 'login-left' },
			React.createElement(
				'div',
				{ style: styles.leftContent },
				React.createElement('h1', { style: styles.title }, '羚牛氢能'),
				React.createElement('p', { style: styles.slogan }, '氢能资产数字化，业务运营一体化。'),
				React.createElement('p', { style: styles.desc }, '数字化资产 · ONE-OS 运管平台')
			)
		),
		React.createElement(
			'div',
			{ style: styles.right, className: 'login-right' },
			React.createElement(
				'div',
				{ style: styles.formCard },
				React.createElement('h2', { style: styles.formTitle }, '欢迎登录'),
				React.createElement(
					'div',
					{ style: styles.tabBar },
					React.createElement(
						'div',
						{
							style: loginMode === 'account' ? Object.assign({}, styles.tab, styles.tabActive) : styles.tab,
							onClick: switchToAccount,
							role: 'button',
							tabIndex: 0
						},
						'账号密码登录'
					),
					React.createElement(
						'div',
						{
							style: loginMode === 'phone' ? Object.assign({}, styles.tab, styles.tabActive) : styles.tab,
							onClick: switchToPhone,
							role: 'button',
							tabIndex: 0
						},
						'手机号登录'
					)
				),
				React.createElement('p', { style: styles.formSub }, loginMode === 'phone' ? '请输入手机号与验证码' : '请输入您的账号与密码'),
				loginMode === 'phone'
					? React.createElement(
							React.Fragment,
							null,
							React.createElement(
								'div',
								{ style: styles.formItem },
								React.createElement('label', { style: styles.label }, '手机号'),
								React.createElement('input', {
									style: styles.input,
									placeholder: '请输入手机号',
									value: formData.phone,
									onChange: function (e) {
										handleChange('phone', e.target.value);
									}
								})
							),
							React.createElement(
								'div',
								{ style: styles.formItem },
								React.createElement('label', { style: styles.label }, '验证码'),
								React.createElement(
									'div',
									{ style: styles.codeRow },
									React.createElement('input', {
										style: styles.codeInput,
										placeholder: '请输入验证码',
										value: formData.smsCode,
										onChange: function (e) {
											handleChange('smsCode', e.target.value);
										}
									}),
									React.createElement(
										'button',
										{
											type: 'button',
											style: countdown > 0 ? Object.assign({}, styles.getCodeBtn, styles.getCodeBtnDisabled) : styles.getCodeBtn,
											disabled: countdown > 0,
											onClick: handleGetCode
										},
										countdown > 0 ? countdown + '秒后重新获取' : (hasRequestedCode ? '再次获取' : '获取验证码')
									)
								)
							)
						)
					: React.createElement(
							React.Fragment,
							null,
							React.createElement(
								'div',
								{ style: styles.formItem },
								React.createElement('label', { style: styles.label }, '用户名'),
								React.createElement('input', {
									style: styles.input,
									placeholder: '请输入用户名',
									value: formData.username,
									onChange: function (e) {
										handleChange('username', e.target.value);
									}
								})
							),
							React.createElement(
								'div',
								{ style: styles.formItem },
								React.createElement('label', { style: styles.label }, '密码'),
								React.createElement('input', {
									style: styles.input,
									type: 'password',
									placeholder: '请输入密码',
									value: formData.password,
									onChange: function (e) {
										handleChange('password', e.target.value);
									}
								})
							)
						),
				React.createElement(
					'div',
					{ style: styles.row },
					React.createElement(
						'label',
						{ style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#4e5969' } },
						React.createElement('input', {
							type: 'checkbox',
							checked: formData.remember,
							onChange: function (e) {
								handleChange('remember', e.target.checked);
							},
							style: { marginRight: '8px' }
						}),
						'记住我'
					)
				),
				React.createElement(
					'label',
					{
						style: {
							display: 'flex',
							alignItems: 'flex-start',
							cursor: 'pointer',
							fontSize: '14px',
							color: '#4e5969',
							marginBottom: '20px',
							lineHeight: 1.5
						}
					},
					React.createElement('input', {
						type: 'checkbox',
						checked: formData.agreeTerms,
						onChange: function (e) {
							handleChange('agreeTerms', e.target.checked);
						},
						style: { marginRight: '8px', marginTop: '3px', flexShrink: 0 }
					}),
					React.createElement(
						'span',
						null,
						'阅读并同意',
						React.createElement('a', { href: '#', style: { color: '#165dff', marginLeft: '2px' }, onClick: function (e) { e.preventDefault(); } }, '《用户服务协议》'),
						'和',
						React.createElement('a', { href: '#', style: { color: '#165dff' }, onClick: function (e) { e.preventDefault(); } }, '《隐私政策》')
					)
				),
				antd && antd.Button
					? React.createElement(antd.Button, {
							type: 'primary',
							block: true,
							size: 'large',
							style: styles.submitBtn,
							onClick: handleSubmit
						}, '登 录')
					: React.createElement(
							'button',
							{
								style: Object.assign({}, styles.submitBtn, {
									backgroundColor: '#165dff',
									color: '#fff',
									border: 'none',
									cursor: 'pointer'
								}),
								onClick: handleSubmit
							},
							'登 录'
						)
			)
		)
		)
	);
};
