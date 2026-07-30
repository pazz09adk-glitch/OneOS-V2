import React, { useEffect, useState } from 'react';
import { Download, Eye, FileText, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { V2Button, V2Toast } from '../../../resources/design-system/components/UIComponents';
import {
  attachmentKind,
  demoImageDataUrl,
  downloadDemoAttachment,
  isPreviewableAttachment,
} from '../attachmentUtils';

interface FeedbackAttachmentsProps {
  files: string[];
}

type PreviewState =
  | { kind: 'pdf'; name: string }
  | { kind: 'image'; name: string; src: string }
  | null;

export const FeedbackAttachments: React.FC<FeedbackAttachmentsProps> = ({ files }) => {
  const [preview, setPreview] = useState<PreviewState>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [preview]);

  if (!files.length) return null;

  const openFile = (name: string) => {
    const kind = attachmentKind(name);
    if (kind === 'pdf') {
      setPreview({ kind: 'pdf', name });
      return;
    }
    if (kind === 'image') {
      setPreview({ kind: 'image', name, src: demoImageDataUrl(name) });
      return;
    }
    downloadDemoAttachment(name);
    setToast({ open: true, message: `已开始下载「${name}」` });
  };

  return (
    <>
      <div className="v2-two-feedback-card__files">
        <span className="v2-two-feedback-card__files-label">附件：</span>
        <ul className="v2-two-attachment-chips">
          {files.map((name) => {
            const kind = attachmentKind(name);
            const previewable = isPreviewableAttachment(name);
            const Icon =
              kind === 'pdf' ? FileText : kind === 'image' ? ImageIcon : Paperclip;
            return (
              <li key={name}>
                <button
                  type="button"
                  className="v2-two-attachment-chip"
                  onClick={() => openFile(name)}
                  title={previewable ? `预览 ${name}` : `下载 ${name}`}
                  aria-label={previewable ? `预览附件 ${name}` : `下载附件 ${name}`}
                >
                  <Icon size={14} strokeWidth={2.25} aria-hidden />
                  <span className="v2-two-attachment-chip__name">{name}</span>
                  <span className="v2-two-attachment-chip__action">
                    {previewable ? (
                      <>
                        <Eye size={12} strokeWidth={2.25} aria-hidden />
                        预览
                      </>
                    ) : (
                      <>
                        <Download size={12} strokeWidth={2.25} aria-hidden />
                        下载
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {preview ? (
        <div
          className="v2-two-modal-mask v2-two-attach-preview-mask"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div
            className="v2-two-modal v2-two-attach-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attach-preview-title"
          >
            <div className="v2-two-modal-header">
              <div className="v2-two-modal-title" id="attach-preview-title">
                {preview.kind === 'pdf' ? 'PDF 预览' : '图片预览'}
                <span className="v2-two-attach-preview-filename">{preview.name}</span>
              </div>
              <button
                type="button"
                className="v2-two-modal-close"
                aria-label="关闭预览"
                onClick={() => setPreview(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="v2-two-modal-body v2-two-attach-preview-body">
              {preview.kind === 'pdf' ? (
                <div className="v2-two-attach-pdf-demo" aria-label={`PDF 演示预览 ${preview.name}`}>
                  <div className="v2-two-attach-pdf-demo__page">
                    <div className="v2-two-attach-pdf-demo__badge">PDF · 演示</div>
                    <h3>{preview.name}</h3>
                    <p>
                      这是任务工单执行反馈附件的 PDF
                      预览示意。正式环境将内嵌真实文档内容，支持翻页与缩放。
                    </p>
                    <p className="v2-two-attach-pdf-demo__muted">
                      示例正文：浙A10003 因雨天道路封闭申请停运 3 天，相关说明见正文条款…
                    </p>
                  </div>
                </div>
              ) : (
                <div className="v2-two-attach-image-demo">
                  <img src={preview.src} alt={preview.name} />
                </div>
              )}
            </div>
            <div className="v2-two-modal-footer">
              <V2Button
                variant="secondary"
                size="md"
                onClick={() => {
                  downloadDemoAttachment(preview.name);
                  setToast({ open: true, message: `已开始下载「${preview.name}」` });
                }}
              >
                下载
              </V2Button>
              <V2Button variant="primary" size="md" onClick={() => setPreview(null)}>
                关闭
              </V2Button>
            </div>
          </div>
        </div>
      ) : null}

      <V2Toast
        open={toast.open}
        message={toast.message}
        tone="success"
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
};
