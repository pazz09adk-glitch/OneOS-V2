// 【重要】必须使用 const Component 作为组件变量名
// 安全培训扫码 - H5 分步表单（扫码链接进入，模拟小程序手机宽度）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Steps = antd.Steps;
	var Button = antd.Button;
	var Input = antd.Input;
	var Spin = antd.Spin;
	var message = antd.message;
	var Progress = antd.Progress;

	var STS_GREEN = '#7AB929';
	var STS_GREEN_DEEP = '#6AA322';
	var STS_GREEN_SOFT = 'rgba(122, 185, 41, 0.14)';
	var STS_TEXT = '#1D2129';
	var STS_TEXT_SEC = '#4E5969';
	var STS_MUTED = '#86909C';
	var STS_LINE = '#E5E6EB';
	var STS_BG = '#FFFFFF';
	var STS_PAGE = '#F2F3F5';
	var STS_FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", STHeiti, sans-serif';

	var STS_PAGE_STYLE = ''
		+ '.sts-root { height:100dvh; max-height:100dvh; overflow:hidden; background:linear-gradient(165deg,#e8ebef 0%,' + STS_PAGE + ' 40%); display:flex; justify-content:center; align-items:center; padding:16px 12px; box-sizing:border-box; font-family:' + STS_FONT + '; -webkit-font-smoothing:antialiased; }'
		+ '.sts-phone { width:100%; max-width:390px; height:min(844px, calc(100dvh - 32px)); max-height:calc(100dvh - 32px); background:' + STS_PAGE + '; border-radius:28px; overflow:hidden; box-shadow:0 24px 48px rgba(15,23,42,.14), 0 0 0 1px rgba(15,23,42,.05); display:flex; flex-direction:column; position:relative; }'
		+ '.sts-navbar { flex-shrink:0; height:48px; display:flex; align-items:center; justify-content:center; padding:0 16px; background:' + STS_BG + '; border-bottom:1px solid rgba(0,0,0,.05); position:relative; }'
		+ '.sts-nav-title { font-size:17px; font-weight:700; color:' + STS_TEXT + '; }'
		+ '.sts-body { flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; padding:12px 14px 20px; }'
		+ '.sts-steps { margin-bottom:16px; background:' + STS_BG + '; border-radius:12px; padding:12px 10px; }'
		+ '.sts-card { background:' + STS_BG + '; border-radius:14px; padding:16px; box-shadow:0 2px 8px rgba(15,23,42,.04); border:1px solid rgba(0,0,0,.03); }'
		+ '.sts-step-title { font-size:17px; font-weight:700; color:' + STS_TEXT + '; margin-bottom:12px; }'
		+ '.sts-hint { font-size:13px; color:' + STS_MUTED + '; line-height:1.55; margin-bottom:12px; }'
		+ '.sts-label { display:block; margin-bottom:8px; font-size:14px; font-weight:600; color:' + STS_TEXT + '; }'
		+ '.sts-driver-info { margin-bottom:12px; padding:10px 12px; background:' + STS_GREEN_SOFT + '; border:1px solid rgba(122,185,41,.28); border-radius:10px; font-size:13px; color:' + STS_TEXT_SEC + '; line-height:1.6; }'
		+ '.sts-upload { border:1px dashed ' + STS_LINE + '; border-radius:10px; padding:20px 14px; text-align:center; color:' + STS_MUTED + '; font-size:13px; cursor:pointer; background:' + STS_PAGE + '; touch-action:manipulation; }'
		+ '.sts-upload:active { background:' + STS_GREEN_SOFT + '; border-color:' + STS_GREEN + '; }'
		+ '.sts-upload.done { border-color:' + STS_GREEN + '; background:' + STS_GREEN_SOFT + '; color:' + STS_GREEN_DEEP + '; font-weight:600; }'
		+ '.sts-upload-list { display:flex; flex-direction:column; gap:10px; }'
		+ '.sts-btn-block { width:100%; min-height:48px; border-radius:12px; font-size:15px; font-weight:600; margin-top:16px; touch-action:manipulation; }'
		+ '.sts-mini-sheet { position:absolute; inset:0; z-index:40; display:flex; flex-direction:column; justify-content:flex-end; }'
		+ '.sts-mini-sheet-mask { position:absolute; inset:0; background:rgba(0,0,0,.45); border:none; padding:0; cursor:pointer; }'
		+ '.sts-mini-sheet-panel { position:relative; z-index:1; background:' + STS_BG + '; border-radius:16px 16px 0 0; max-height:min(78vh,560px); display:flex; flex-direction:column; box-shadow:0 -8px 28px rgba(15,23,42,.14); animation:sts-sheet-up .28s ease; }'
		+ '.sts-mini-sheet-handle { width:36px; height:4px; background:rgba(0,0,0,.12); border-radius:999px; margin:10px auto 0; flex-shrink:0; }'
		+ '.sts-mini-sheet-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 16px 12px; border-bottom:1px solid ' + STS_LINE + '; flex-shrink:0; }'
		+ '.sts-mini-sheet-title { font-size:16px; font-weight:700; color:' + STS_TEXT + '; }'
		+ '.sts-mini-sheet-close { width:32px; height:32px; border:none; background:' + STS_PAGE + '; border-radius:999px; font-size:20px; line-height:1; color:' + STS_MUTED + '; cursor:pointer; flex-shrink:0; touch-action:manipulation; }'
		+ '.sts-mini-sheet-body { flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:12px 16px 8px; }'
		+ '.sts-mini-sheet-foot { flex-shrink:0; padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px)); border-top:1px solid ' + STS_LINE + '; display:flex; gap:10px; }'
		+ '.sts-sheet-hint { font-size:13px; color:' + STS_MUTED + '; line-height:1.55; margin-bottom:12px; padding:8px 10px; background:' + STS_PAGE + '; border-radius:8px; }'
		+ '.sts-action-group { border-radius:12px; overflow:hidden; border:1px solid ' + STS_LINE + '; background:' + STS_BG + '; }'
		+ '.sts-action-item { display:block; width:100%; min-height:52px; padding:0 16px; border:none; border-bottom:1px solid ' + STS_LINE + '; background:' + STS_BG + '; font-size:16px; font-weight:600; color:' + STS_TEXT + '; cursor:pointer; touch-action:manipulation; }'
		+ '.sts-action-item:last-child { border-bottom:none; }'
		+ '.sts-action-item:active { background:' + STS_PAGE + '; }'
		+ '.sts-action-item--primary { color:' + STS_GREEN_DEEP + '; }'
		+ '.sts-sheet-cancel-wrap { padding:8px 16px calc(12px + env(safe-area-inset-bottom,0px)); background:' + STS_PAGE + '; }'
		+ '.sts-action-cancel { display:block; width:100%; min-height:48px; border:none; border-radius:12px; background:' + STS_BG + '; font-size:16px; font-weight:600; color:' + STS_TEXT_SEC + '; cursor:pointer; touch-action:manipulation; box-shadow:0 1px 4px rgba(15,23,42,.06); }'
		+ '.sts-action-cancel:active { background:' + STS_PAGE + '; }'
		+ '.sts-form-field { margin-bottom:14px; }'
		+ '.sts-form-input { width:100%; min-height:44px; border:1px solid ' + STS_LINE + '; border-radius:10px; padding:0 12px; font-size:15px; box-sizing:border-box; outline:none; background:' + STS_BG + '; color:' + STS_TEXT + '; }'
		+ '.sts-form-input:focus { border-color:' + STS_GREEN + '; box-shadow:0 0 0 2px ' + STS_GREEN_SOFT + '; }'
		+ '.sts-drawer-foot-btn { flex:1; min-height:44px; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; border:none; touch-action:manipulation; }'
		+ '.sts-drawer-foot-cancel { background:' + STS_PAGE + '; color:' + STS_TEXT_SEC + '; border:1px solid ' + STS_LINE + '; }'
		+ '.sts-drawer-foot-confirm { background:' + STS_GREEN_DEEP + '; color:#fff; }'
		+ '.sts-camera { position:absolute; inset:0; z-index:50; background:#000; display:flex; flex-direction:column; }'
		+ '.sts-camera-view { flex:1; display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; padding:24px; text-align:center; white-space:pre-line; line-height:1.6; }'
		+ '.sts-camera-bar { padding:16px 20px calc(16px + env(safe-area-inset-bottom,0px)); display:flex; gap:12px; justify-content:center; background:rgba(0,0,0,.55); }'
		+ '.sts-camera-btn { min-width:96px; min-height:44px; border-radius:22px; font-size:15px; font-weight:600; border:none; cursor:pointer; touch-action:manipulation; }'
		+ '.sts-camera-btn--ghost { background:rgba(255,255,255,.16); color:#fff; }'
		+ '.sts-camera-btn--primary { background:' + STS_GREEN + '; color:#fff; min-width:120px; }'
		+ '@keyframes sts-sheet-up { from { transform:translateY(100%); } to { transform:translateY(0); } }'
		+ '@media (prefers-reduced-motion: reduce) { .sts-mini-sheet-panel { animation:none; } }';

	var MOCK_ID_OCR = { name: '张伟', idNo: '330102199001011234' };

	var stepState = useState(1);
	var step = stepState[0];
	var setStep = stepState[1];

	var phoneState = useState('');
	var verifyCodeState = useState('');
	var codeCountdownState = useState(0);
	var phone = phoneState[0];
	var setPhone = phoneState[1];
	var verifyCode = verifyCodeState[0];
	var setVerifyCode = verifyCodeState[1];
	var codeCountdown = codeCountdownState[0];
	var setCodeCountdown = codeCountdownState[1];

	var completedPhonesState = useState({ '13800138000': 'TC-2026-8888', '13900139000': 'TC-2026-9999' });
	var completedPhones = completedPhonesState[0];
	var setCompletedPhones = completedPhonesState[1];

	var driverNameState = useState('');
	var driverIdNoState = useState('');
	var idFrontState = useState(null);
	var idBackState = useState(null);
	var licenseFrontState = useState(null);
	var licenseBackState = useState(null);
	var qualificationState = useState(null);
	var needQualification = false;

	var driverName = driverNameState[0];
	var setDriverName = driverNameState[1];
	var driverIdNo = driverIdNoState[0];
	var setDriverIdNo = driverIdNoState[1];
	var idFront = idFrontState[0];
	var setIdFront = idFrontState[1];
	var idBack = idBackState[0];
	var setIdBack = idBackState[1];
	var licenseFront = licenseFrontState[0];
	var setLicenseFront = licenseFrontState[1];
	var licenseBack = licenseBackState[0];
	var setLicenseBack = licenseBackState[1];
	var qualification = qualificationState[0];
	var setQualification = qualificationState[1];

	var idDrawerOpenState = useState(false);
	var idDrawerSideState = useState(null);
	var idDrawerModeState = useState(null);
	var idDrawerOpen = idDrawerOpenState[0];
	var setIdDrawerOpen = idDrawerOpenState[1];
	var idDrawerSide = idDrawerSideState[0];
	var setIdDrawerSide = idDrawerSideState[1];
	var idDrawerMode = idDrawerModeState[0];
	var setIdDrawerMode = idDrawerModeState[1];

	var manualFrontPhotoState = useState(null);
	var manualBackPhotoState = useState(null);
	var manualFrontPhoto = manualFrontPhotoState[0];
	var setManualFrontPhoto = manualFrontPhotoState[1];
	var manualBackPhoto = manualBackPhotoState[0];
	var setManualBackPhoto = manualBackPhotoState[1];

	var cameraOpenState = useState(false);
	var cameraTargetState = useState(null);
	var ocrLoadingState = useState(false);
	var cameraOpen = cameraOpenState[0];
	var setCameraOpen = cameraOpenState[1];
	var cameraTarget = cameraTargetState[0];
	var setCameraTarget = cameraTargetState[1];
	var ocrLoading = ocrLoadingState[0];
	var setOcrLoading = ocrLoadingState[1];

	var cameraFileRef = useRef(null);

	var videoProgressState = useState(0);
	var videoPlayingState = useState(false);
	var videoProgress = videoProgressState[0];
	var setVideoProgress = videoProgressState[1];
	var videoPlaying = videoPlayingState[0];
	var setVideoPlaying = videoPlayingState[1];

	var pickupCodeState = useState('');
	var pickupCode = pickupCodeState[0];
	var setPickupCode = pickupCodeState[1];

	useEffect(function () {
		var styleId = 'sts-page-style';
		if (!document.getElementById(styleId)) {
			var styleEl = document.createElement('style');
			styleEl.id = styleId;
			styleEl.textContent = STS_PAGE_STYLE;
			document.head.appendChild(styleEl);
		}
	}, []);

	useEffect(function () {
		if (codeCountdown <= 0) return;
		var t = setTimeout(function () { setCodeCountdown(function (c) { return c - 1; }); }, 1000);
		return function () { clearTimeout(t); };
	}, [codeCountdown]);

	useEffect(function () {
		if (!videoPlaying || videoProgress >= 100) {
			if (videoProgress >= 100) setVideoPlaying(false);
			return;
		}
		var t = setInterval(function () {
			setVideoProgress(function (p) { return Math.min(100, p + 2); });
		}, 500);
		return function () { clearInterval(t); };
	}, [videoPlaying, videoProgress]);

	var handleStep1Next = useCallback(function () {
		var p = (phone || '').trim();
		var c = (verifyCode || '').trim();
		if (!p) { message.warning('请输入手机号'); return; }
		if (!c) { message.warning('请输入验证码'); return; }
		if (completedPhones[p]) {
			setPickupCode(completedPhones[p]);
			setStep(4);
			return;
		}
		if (c.length < 4) { message.warning('请输入正确的验证码'); return; }
		setStep(2);
	}, [phone, verifyCode, completedPhones]);

	var handleSendCode = useCallback(function () {
		var p = (phone || '').trim();
		if (!p || p.length < 11) { message.warning('请输入正确手机号'); return; }
		if (codeCountdown > 0) return;
		setCodeCountdown(60);
		message.success('验证码已发送');
	}, [phone, codeCountdown]);

	var openIdDrawer = useCallback(function (side) {
		setIdDrawerSide(side);
		setIdDrawerMode(null);
		setManualFrontPhoto(null);
		setManualBackPhoto(null);
		setIdDrawerOpen(true);
	}, []);

	var closeIdDrawer = useCallback(function () {
		setIdDrawerOpen(false);
		setIdDrawerSide(null);
		setIdDrawerMode(null);
		setManualFrontPhoto(null);
		setManualBackPhoto(null);
	}, []);

	var openCamera = useCallback(function (target) {
		setCameraTarget(target);
		setCameraOpen(true);
	}, []);

	var closeCamera = useCallback(function () {
		setCameraOpen(false);
		setCameraTarget(null);
		setOcrLoading(false);
	}, []);

	var handleIdRecognize = useCallback(function () {
		if (!idDrawerSide) return;
		setIdDrawerOpen(false);
		openCamera(idDrawerSide === 'front' ? 'idFrontOcr' : 'idBackPhoto');
	}, [idDrawerSide, openCamera]);

	var handleIdManual = useCallback(function () {
		setIdDrawerMode('manual');
	}, []);

	var simulateOcrAndUpload = useCallback(function () {
		setOcrLoading(true);
		setTimeout(function () {
			setDriverName(MOCK_ID_OCR.name);
			setDriverIdNo(MOCK_ID_OCR.idNo);
			setIdFront('身份证正面-已拍摄.jpg');
			setOcrLoading(false);
			closeCamera();
			message.success('身份证正面识别成功，已自动填写司机信息');
		}, 1200);
	}, [closeCamera]);

	var handleCameraCapture = useCallback(function () {
		if (!cameraTarget) return;
		if (cameraTarget === 'idFrontOcr') {
			simulateOcrAndUpload();
			return;
		}
		var labelMap = {
			idBackPhoto: ['身份证反面', setIdBack],
			licenseFront: ['驾驶证正面', setLicenseFront],
			licenseBack: ['驾驶证反面', setLicenseBack],
			qualification: ['从业资格证', setQualification],
			manualIdFront: ['身份证正面', setManualFrontPhoto],
			manualIdBack: ['身份证反面', setManualBackPhoto]
		};
		var item = labelMap[cameraTarget];
		if (item) {
			item[1](item[0] + '-已拍摄.jpg');
			closeCamera();
			message.success(item[0] + '拍摄完成');
		}
	}, [cameraTarget, simulateOcrAndUpload, closeCamera]);

	var handleManualSubmit = useCallback(function () {
		var name = (driverName || '').trim();
		var idNo = (driverIdNo || '').trim();
		if (!name) { message.warning('请输入司机姓名'); return; }
		if (!idNo || idNo.length < 15) { message.warning('请输入正确的身份证号'); return; }
		if (!manualFrontPhoto) { message.warning('请拍摄身份证正面照片'); return; }
		setIdFront(manualFrontPhoto);
		if (idDrawerSide === 'back' || manualBackPhoto) {
			setIdBack(manualBackPhoto || idBack);
		}
		closeIdDrawer();
		message.success('人工登记信息已保存');
	}, [driverName, driverIdNo, manualFrontPhoto, manualBackPhoto, idDrawerSide, idBack, closeIdDrawer]);

	var handleManualBackOnly = useCallback(function () {
		if (!manualBackPhoto) { message.warning('请拍摄身份证反面照片'); return; }
		setIdBack(manualBackPhoto);
		closeIdDrawer();
		message.success('身份证反面上传完成');
	}, [manualBackPhoto, closeIdDrawer]);

	function renderUpload(label, value, onClick, hint) {
		var done = value != null && value !== '';
		return React.createElement('div', {
			key: label,
			className: 'sts-upload' + (done ? ' done' : ''),
			onClick: onClick,
			role: 'button',
			tabIndex: 0,
			onKeyDown: function (e) { if (e.key === 'Enter') onClick(); }
		}, done ? (value + ' ✓') : (hint || ('点击上传 ' + label)));
	}

	function renderCameraOnlyUpload(label, value, setValue, targetKey) {
		var done = value != null && value !== '';
		return renderUpload(label, value, function () {
			if (done) { setValue(null); return; }
			openCamera(targetKey);
		}, done ? null : ('点击拍摄 ' + label));
	}

	var allRequiredUploaded = (idFront != null && idFront !== '') &&
		(idBack != null && idBack !== '') &&
		(licenseFront != null && licenseFront !== '') &&
		(licenseBack != null && licenseBack !== '') &&
		(driverName != null && driverName.trim() !== '') &&
		(driverIdNo != null && driverIdNo.trim() !== '') &&
		(!needQualification || (qualification != null && qualification !== ''));

	var handleStep2WatchVideo = useCallback(function () {
		if (!allRequiredUploaded) { message.warning('请完成全部必填证照上传'); return; }
		setStep(3);
		setVideoProgress(0);
		setVideoPlaying(false);
	}, [allRequiredUploaded]);

	var handleVideoPlayPause = useCallback(function () {
		if (videoProgress >= 100) return;
		setVideoPlaying(function (v) { return !v; });
	}, [videoProgress]);

	var handleStep3Generate = useCallback(function () {
		if (videoProgress < 100) { message.warning('请完整观看安全培训视频'); return; }
		var code = 'TC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
		setPickupCode(code);
		setCompletedPhones(function (prev) {
			var next = {}; for (var k in prev) next[k] = prev[k]; next[phone.trim()] = code; return next;
		});
		setStep(4);
		message.success('提车码已生成');
	}, [videoProgress, phone]);

	var inputStyle = { width: '100%', minHeight: 44, fontSize: 15, borderRadius: 10 };

	var stepsItems = [
		{ title: '验证' },
		{ title: '证照' },
		{ title: '视频' },
		{ title: '提车码' }
	];

	var step1Content = React.createElement('div', { className: 'sts-card' },
		React.createElement('div', { className: 'sts-step-title' }, '手机号验证'),
		React.createElement('div', { style: { marginBottom: 14 } },
			React.createElement('label', { className: 'sts-label' }, '手机号'),
			React.createElement(Input, {
				placeholder: '请输入手机号',
				value: phone,
				onChange: function (e) { setPhone(e.target.value); },
				style: inputStyle,
				maxLength: 11,
				type: 'tel'
			})
		),
		React.createElement('div', { style: { marginBottom: 14 } },
			React.createElement('label', { className: 'sts-label' }, '验证码'),
			React.createElement('div', { style: { display: 'flex', gap: 8 } },
				React.createElement(Input, {
					placeholder: '请输入验证码',
					value: verifyCode,
					onChange: function (e) { setVerifyCode(e.target.value); },
					style: Object.assign({}, inputStyle, { flex: 1 }),
					maxLength: 6
				}),
				React.createElement(Button, {
					disabled: codeCountdown > 0,
					onClick: handleSendCode,
					style: { minHeight: 44, minWidth: 100, borderRadius: 10 }
				}, codeCountdown > 0 ? codeCountdown + 's' : '获取验证码')
			)
		),
		React.createElement(Button, { type: 'primary', size: 'large', className: 'sts-btn-block', onClick: handleStep1Next }, '下一步')
	);

	var driverInfoBlock = (driverName || driverIdNo) ? React.createElement('div', { className: 'sts-driver-info' },
		React.createElement('div', null, '司机姓名：' + (driverName || '—')),
		React.createElement('div', null, '身份证号：' + (driverIdNo || '—'))
	) : null;

	var step2Content = React.createElement('div', { className: 'sts-card' },
		React.createElement('div', { className: 'sts-step-title' }, '证照上传'),
		React.createElement('div', { className: 'sts-hint' }, '身份证支持图片识别或人工登记；驾驶证仅拍照上传，不做识别。'),
		driverInfoBlock,
		React.createElement('div', { className: 'sts-upload-list' },
			renderUpload('身份证正面', idFront, function () {
				if (idFront) { setIdFront(null); return; }
				openIdDrawer('front');
			}, idFront ? null : '点击上传身份证正面'),
			renderUpload('身份证反面', idBack, function () {
				if (idBack) { setIdBack(null); return; }
				openIdDrawer('back');
			}, idBack ? null : '点击上传身份证反面'),
			renderCameraOnlyUpload('驾驶证正面', licenseFront, setLicenseFront, 'licenseFront'),
			renderCameraOnlyUpload('驾驶证反面', licenseBack, setLicenseBack, 'licenseBack'),
			renderCameraOnlyUpload('从业资格证（18吨以上，可选）', qualification, setQualification, 'qualification')
		),
		React.createElement(Button, {
			type: 'primary',
			size: 'large',
			className: 'sts-btn-block',
			onClick: handleStep2WatchVideo,
			disabled: !allRequiredUploaded
		}, '观看安全培训视频')
	);

	var idDrawerTitle = idDrawerMode === 'manual'
		? (idDrawerSide === 'back' ? '人工登记 · 身份证反面' : '人工登记 · 身份证信息')
		: ('上传' + (idDrawerSide === 'back' ? '身份证反面' : '身份证正面'));

	var idDrawerBody = idDrawerMode === 'manual'
		? (idDrawerSide === 'back'
			? React.createElement('div', null,
				React.createElement('div', { className: 'sts-sheet-hint' }, '请拍摄身份证反面照片，不做 OCR 识别。'),
				renderUpload('身份证反面照片', manualBackPhoto, function () {
					openCamera('manualIdBack');
				}, manualBackPhoto ? null : '点击拍摄身份证反面照片')
			)
			: React.createElement('div', null,
				React.createElement('div', { className: 'sts-form-field' },
					React.createElement('label', { className: 'sts-label' }, '司机姓名'),
					React.createElement('input', {
						className: 'sts-form-input',
						placeholder: '请输入司机姓名',
						value: driverName,
						onChange: function (e) { setDriverName(e.target.value); }
					})
				),
				React.createElement('div', { className: 'sts-form-field' },
					React.createElement('label', { className: 'sts-label' }, '身份证号'),
					React.createElement('input', {
						className: 'sts-form-input',
						placeholder: '请输入身份证号',
						value: driverIdNo,
						onChange: function (e) { setDriverIdNo(e.target.value); },
						maxLength: 18
					})
				),
				React.createElement('div', { className: 'sts-form-field' },
					React.createElement('label', { className: 'sts-label' }, '身份证正面照片'),
					renderUpload('身份证正面照片', manualFrontPhoto, function () {
						openCamera('manualIdFront');
					}, manualFrontPhoto ? null : '点击拍摄身份证正面照片')
				)
			))
		: React.createElement('div', null,
			React.createElement('div', { className: 'sts-sheet-hint' },
				idDrawerSide === 'back'
					? '图片识别将调用相机拍摄反面，仅上传照片不做识别。'
					: '图片识别将调用相机拍摄正面，自动 OCR 识别姓名与身份证号。'
			),
			React.createElement('div', { className: 'sts-action-group' },
				React.createElement('button', {
					type: 'button',
					className: 'sts-action-item sts-action-item--primary',
					onClick: handleIdRecognize
				}, '图片识别'),
				React.createElement('button', {
					type: 'button',
					className: 'sts-action-item',
					onClick: handleIdManual
				}, '人工登记')
			)
		);

	var idDrawerFoot = idDrawerMode === 'manual'
		? React.createElement('div', { className: 'sts-mini-sheet-foot' },
			React.createElement('button', { type: 'button', className: 'sts-drawer-foot-btn sts-drawer-foot-cancel', onClick: function () { setIdDrawerMode(null); } }, '返回'),
			React.createElement('button', {
				type: 'button',
				className: 'sts-drawer-foot-btn sts-drawer-foot-confirm',
				onClick: idDrawerSide === 'back' ? handleManualBackOnly : handleManualSubmit
			}, idDrawerSide === 'back' ? '确认上传' : '确认登记')
		)
		: React.createElement('div', { className: 'sts-sheet-cancel-wrap' },
			React.createElement('button', { type: 'button', className: 'sts-action-cancel', onClick: closeIdDrawer }, '取消')
		);

	var idMiniSheet = idDrawerOpen ? React.createElement('div', {
		className: 'sts-mini-sheet',
		role: 'dialog',
		'aria-modal': true,
		'aria-label': idDrawerTitle
	},
		React.createElement('button', { type: 'button', className: 'sts-mini-sheet-mask', onClick: closeIdDrawer, 'aria-label': '关闭' }),
		React.createElement('div', { className: 'sts-mini-sheet-panel' },
			React.createElement('div', { className: 'sts-mini-sheet-handle', 'aria-hidden': true }),
			React.createElement('div', { className: 'sts-mini-sheet-head' },
				React.createElement('span', { className: 'sts-mini-sheet-title' }, idDrawerTitle),
				React.createElement('button', { type: 'button', className: 'sts-mini-sheet-close', onClick: closeIdDrawer, 'aria-label': '关闭' }, '×')
			),
			React.createElement('div', { className: 'sts-mini-sheet-body' }, idDrawerBody),
			idDrawerFoot
		)
	) : null;

	var cameraHint = ocrLoading
		? null
		: ('请将证件置于取景框内\n' + (
			cameraTarget === 'idFrontOcr' ? '（正面 · 将自动 OCR 识别）' :
				cameraTarget === 'idBackPhoto' ? '（反面 · 仅拍照上传）' :
					cameraTarget === 'licenseFront' ? '（驾驶证正面 · 仅拍照）' :
						cameraTarget === 'licenseBack' ? '（驾驶证反面 · 仅拍照）' : '（仅拍照上传）'
		));

	var cameraOverlay = cameraOpen ? React.createElement('div', { className: 'sts-camera' },
		React.createElement('div', { className: 'sts-camera-view' },
			ocrLoading
				? React.createElement(Spin, { tip: '正在识别身份证信息...' })
				: cameraHint
		),
		React.createElement('div', { className: 'sts-camera-bar' },
			React.createElement('button', {
				type: 'button',
				className: 'sts-camera-btn sts-camera-btn--ghost',
				onClick: closeCamera,
				disabled: ocrLoading
			}, '取消'),
			React.createElement('button', {
				type: 'button',
				className: 'sts-camera-btn sts-camera-btn--primary',
				onClick: handleCameraCapture,
				disabled: ocrLoading
			}, ocrLoading ? '识别中...' : '拍照')
		),
		React.createElement('input', {
			ref: cameraFileRef,
			type: 'file',
			accept: 'image/*',
			capture: 'environment',
			style: { display: 'none' }
		})
	) : null;

	var step3Content = React.createElement('div', { className: 'sts-card' },
		React.createElement('div', { className: 'sts-step-title' }, '安全培训视频'),
		React.createElement('div', { className: 'sts-hint' }, '请完整观看视频，不支持快进快退。'),
		React.createElement('div', {
			style: { background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: 14, position: 'relative', paddingBottom: '56.25%', height: 0 },
			onClick: handleVideoPlayPause
		},
			React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 } },
				videoProgress >= 100 ? '播放完成' : (videoPlaying ? '播放中... 点击暂停' : '点击播放')
			)
		),
		React.createElement('div', { style: { marginBottom: 12 } },
			React.createElement(Progress, { percent: videoProgress, showInfo: true })
		),
		React.createElement('div', { style: { display: 'flex', gap: 8 } },
			React.createElement(Button, { onClick: handleVideoPlayPause, disabled: videoProgress >= 100, style: { flex: 1, minHeight: 44, borderRadius: 10 } }, videoPlaying ? '暂停' : '播放'),
			React.createElement(Button, { type: 'primary', disabled: videoProgress < 100, onClick: handleStep3Generate, style: { flex: 1, minHeight: 44, borderRadius: 10 } }, '生成提车码')
		)
	);

	var step4Content = React.createElement('div', { className: 'sts-card', style: { textAlign: 'center' } },
		React.createElement('div', { className: 'sts-step-title' }, '提车码'),
		React.createElement('div', { className: 'sts-hint', style: { textAlign: 'left' } }, '小程序扫描提车码后自动拉取司机证件信息。提车码在运维完成扫提车码并交车成功后失效。'),
		React.createElement('div', {
			style: { fontSize: 26, fontWeight: 700, letterSpacing: 3, padding: '18px 12px', background: STS_PAGE, borderRadius: 12, marginBottom: 14, userSelect: 'all', color: STS_TEXT }
		}, pickupCode || '—'),
		React.createElement('div', {
			style: { width: 148, height: 148, margin: '0 auto 14px', background: STS_PAGE, border: '2px dashed ' + STS_LINE, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: STS_MUTED, fontSize: 12 }
		}, '提车码二维码'),
		(driverName || driverIdNo) ? React.createElement('div', {
			className: 'sts-driver-info',
			style: { textAlign: 'left' }
		},
			React.createElement('div', null, '司机：' + (driverName || '—')),
			React.createElement('div', null, '身份证：' + (driverIdNo || '—'))
		) : null
	);

	var stepContents = [step1Content, step2Content, step3Content, step4Content];

	return React.createElement('div', { className: 'sts-root' },
		React.createElement('div', { className: 'sts-phone' },
			React.createElement('div', { className: 'sts-navbar' },
				React.createElement('span', { className: 'sts-nav-title' }, '安全培训扫码')
			),
			React.createElement('div', { className: 'sts-body' },
				React.createElement('div', { className: 'sts-steps' },
					React.createElement(Steps, { current: step - 1, size: 'small', items: stepsItems })
				),
				stepContents[step - 1]
			),
			idMiniSheet,
			cameraOverlay
		)
	);
};
