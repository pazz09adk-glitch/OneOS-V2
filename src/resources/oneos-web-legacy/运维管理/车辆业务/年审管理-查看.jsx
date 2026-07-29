// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 年审管理 · 查看（只读分组表单，打开即展示样例记录）

const { useState } = React;
const antd = window.antd;
const { App, Button, Col, Form, Input, Modal, Row, Typography } = antd;
const Image = antd.Image;

const { Text, Paragraph } = Typography;
const TextArea = Input.TextArea;

/** 固定样例：打开页面即展示本条年审查看记录 */
const SAMPLE_VIEW_RECORD = {
  plateNo: '苏A88991',
  brand: '解放',
  model: 'J6P牵引车',
  operateStatus: '自营',
  expireDate: '2026-03-10',
  province: '江苏省',
  city: '南京市',
  executor: '张明辉',
  executeTime: '2026-03-08 14:20',
  inspectionForm: {
    station: '汇通检测站',
    cost: '320',
    remark: '车辆已完成上线检测，报告已归档。',
  },
  licenseForm: {
    inspectionValidUntil: '2026-03-10',
    photos: [
      {
        uid: 'sample-license-1',
        name: '行驶证正面.jpg',
        url: 'https://picsum.photos/seed/ar-view-license-1/240/180',
      },
      {
        uid: 'sample-license-2',
        name: '行驶证副页.jpg',
        url: 'https://picsum.photos/seed/ar-view-license-2/240/180',
      },
    ],
  },
  m2Form: {
    station: '汇通检测站',
    cost: '180',
    remark: '二保已完成，机油机滤已更换。',
    photos: [
      {
        uid: 'sample-m2-1',
        name: '二保现场1.jpg',
        url: 'https://picsum.photos/seed/ar-view-m2-1/240/180',
      },
    ],
  },
  zbForm: null,
};

const formatTaskRegion = (task) => {
  if (!task?.province) return '—';
  if (task.city) return `${task.province}-${task.city}`;
  return task.province;
};

const formatDisplayMoney = (cost) => {
  if (cost === '' || cost == null) return '—';
  const n = Number(cost);
  return Number.isFinite(n) ? `${n.toFixed(2)} 元` : `${cost} 元`;
};

const getPhotoUrl = (file) => file?.url || file?.thumbUrl || '';

const hasServiceBlock = (form) =>
  !!(form?.station || form?.cost || form?.remark || (form?.photos || []).length);

const PAGE_STYLES = `
.ar-handle{min-height:100vh;background:#f2f3f5;font-family:Inter,Helvetica,PingFang SC,Microsoft YaHei,Arial,sans-serif}
.ar-handle-inner{max-width:1200px;margin:0 auto;padding:16px 24px 88px}
.ar-handle-top{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:12px;min-height:32px}
.ar-handle-top-extra{margin-right:auto;font-size:13px;color:#4e5969}
.ar-form-group{background:#fff;border:1px solid #e5e6eb;border-radius:4px;margin-bottom:16px}
.ar-form-group-head{padding:14px 20px;border-bottom:1px solid #f2f3f5}
.ar-form-group-title{font-size:14px;font-weight:600;color:#1d2129}
.ar-form-group-body{padding:20px 20px 8px}
.ar-form-group-body .ant-form-item{margin-bottom:20px}
.ar-form-group-body .ant-form-item-label>label{color:#4e5969;font-size:13px}
.ar-form-footer{position:fixed;left:0;right:0;bottom:0;z-index:100;background:#fff;border-top:1px solid #e5e6eb;box-shadow:0 -2px 8px rgba(0,0,0,.06)}
.ar-form-footer-inner{max-width:1200px;margin:0 auto;padding:12px 24px;display:flex;justify-content:flex-end}
.ar-photo-list{display:flex;flex-wrap:wrap;gap:10px}
.ar-photo-slot{width:104px;height:104px;border-radius:8px;overflow:hidden;border:none;padding:0;background:#f2f3f5;cursor:pointer}
.ar-photo-slot img{width:100%;height:100%;object-fit:cover;display:block}
.ar-handle .ant-input[disabled],.ar-handle textarea.ant-input[disabled]{color:#1d2129!important;-webkit-text-fill-color:#1d2129!important;background:#f7f8fa!important;cursor:default!important}
.ar-prd-doc{max-height:65vh;overflow-y:auto;font-size:13px;line-height:1.65;color:#4e5969}
.ar-prd-highlight{background:#f0f9ff;border:1px solid #bedaff;border-radius:4px;padding:12px;margin:12px 0}
`;

const FormGroup = ({ title, children }) => (
  <section className="ar-form-group">
    <div className="ar-form-group-head">
      <span className="ar-form-group-title">{title}</span>
    </div>
    <div className="ar-form-group-body">{children}</div>
  </section>
);

const ReadonlyInput = ({ value }) => (
  <Input value={value == null || value === '' ? '—' : String(value)} disabled />
);

const ReadonlyTextArea = ({ value }) => (
  <TextArea value={value || '—'} disabled autoSize={{ minRows: 3, maxRows: 6 }} />
);

const PhotoReadonlyGallery = ({ photos, emptyText = '暂无照片' }) => {
  const list = photos || [];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handlePreview = (file) => {
    const url = getPhotoUrl(file);
    if (!url) return;
    if (Image && typeof Image.preview === 'function') {
      Image.preview({ src: url });
      return;
    }
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  if (!list.length) {
    return (
      <Text type="secondary" style={{ fontSize: 13 }}>
        {emptyText}
      </Text>
    );
  }

  return (
    <>
      <div className="ar-photo-list">
        {list.map((file) => {
          const url = getPhotoUrl(file);
          return (
            <button
              key={file.uid || url}
              type="button"
              className="ar-photo-slot"
              onClick={() => handlePreview(file)}
              aria-label="预览照片"
            >
              {url ? <img src={url} alt="" /> : <span style={{ fontSize: 12, color: '#86909c' }}>图片</span>}
            </button>
          );
        })}
      </div>
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={720}
        destroyOnClose
        title="照片预览"
      >
        {previewUrl ? (
          <img style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} src={previewUrl} alt="预览" />
        ) : null}
      </Modal>
    </>
  );
};

const Component = function AnnualReviewViewPage() {
  const [prdOpen, setPrdOpen] = useState(false);
  const viewTask = SAMPLE_VIEW_RECORD;

  const inspectionForm = viewTask.inspectionForm || {};
  const licenseForm = viewTask.licenseForm || {};
  const m2Form = viewTask.m2Form;
  const zbForm = viewTask.zbForm;

  const pageInner = (
    <div className="ar-handle">
      <style>{PAGE_STYLES}</style>
      <div className="ar-handle-inner">
        <div className="ar-handle-top">
          <span className="ar-handle-top-extra">
            {viewTask.plateNo} · 年审办理记录（只读样例）
          </span>
          <Button type="primary" ghost onClick={() => setPrdOpen(true)}>
            需求说明
          </Button>
        </div>

        <Form layout="vertical" colon={false}>
          <FormGroup title="车辆信息">
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item label="车牌号">
                  <ReadonlyInput value={viewTask.plateNo} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="品牌">
                  <ReadonlyInput value={viewTask.brand} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="型号">
                  <ReadonlyInput value={viewTask.model} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="检验有效期至">
                  <ReadonlyInput value={viewTask.expireDate} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="运营状态">
                  <ReadonlyInput value={viewTask.operateStatus} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="运营区域">
                  <ReadonlyInput value={formatTaskRegion(viewTask)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="办理人">
                  <ReadonlyInput value={viewTask.executor} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="完成时间">
                  <ReadonlyInput value={viewTask.executeTime} />
                </Form.Item>
              </Col>
            </Row>
          </FormGroup>

          <FormGroup title="更新行驶证">
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label="行驶证照片">
                  <PhotoReadonlyGallery photos={licenseForm.photos} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="检验有效期至">
                  <ReadonlyInput value={licenseForm.inspectionValidUntil} />
                </Form.Item>
              </Col>
            </Row>
          </FormGroup>

          <FormGroup title="检测服务站信息">
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item label="检测服务站">
                  <ReadonlyInput value={inspectionForm.station} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="费用（元）">
                  <ReadonlyInput value={formatDisplayMoney(inspectionForm.cost)} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="备注">
                  <ReadonlyTextArea value={inspectionForm.remark} />
                </Form.Item>
              </Col>
            </Row>
          </FormGroup>

          {hasServiceBlock(m2Form) ? (
            <FormGroup title="二保信息">
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item label="二保服务站">
                    <ReadonlyInput value={m2Form.station} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="费用（元）">
                    <ReadonlyInput value={formatDisplayMoney(m2Form.cost)} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="备注">
                    <ReadonlyTextArea value={m2Form.remark} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="二保照片">
                    <PhotoReadonlyGallery photos={m2Form.photos} emptyText="未上传二保照片" />
                  </Form.Item>
                </Col>
              </Row>
            </FormGroup>
          ) : null}

          {hasServiceBlock(zbForm) ? (
            <FormGroup title="整备服务站信息">
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item label="整备服务站">
                    <ReadonlyInput value={zbForm.station} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="费用（元）">
                    <ReadonlyInput value={formatDisplayMoney(zbForm.cost)} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="备注">
                    <ReadonlyTextArea value={zbForm.remark} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="整备照片">
                    <PhotoReadonlyGallery photos={zbForm.photos} emptyText="未上传整备照片" />
                  </Form.Item>
                </Col>
              </Row>
            </FormGroup>
          ) : null}
        </Form>
      </div>

      <div className="ar-form-footer">
        <div className="ar-form-footer-inner">
          <Button size="large">返回</Button>
        </div>
      </div>

      <Modal
        title="年审查看 · 需求说明"
        open={prdOpen}
        onCancel={() => setPrdOpen(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setPrdOpen(false)}>
            知道了
          </Button>,
        ]}
        width={720}
        destroyOnClose
      >
        <div className="ar-prd-doc">
          <div className="ar-prd-highlight">
            <Paragraph style={{ margin: 0 }}>
              本页为只读查看样式稿，内置一条样例办理记录（苏A88991），打开即可预览分组表单与照片展示效果，无需从列表跳转。
            </Paragraph>
          </div>
        </div>
      </Modal>
    </div>
  );

  return App ? <App>{pageInner}</App> : pageInner;
};

if (typeof window !== 'undefined') {
  window.Component = Component;
}

export default Component;
