import React, { useEffect, useId, useRef, useState } from 'react';
import { Camera, ImagePlus, Plus, Upload, X } from 'lucide-react';

export type V2ImageUploadItem = {
  id: string;
  /** 展示名 */
  name: string;
  /** 预览 URL（blob 或远程） */
  url: string;
  /** 字节大小，可选 */
  size?: number;
  /** 上传中 */
  uploading?: boolean;
  /** 失败文案 */
  error?: string;
};

export type V2ImageUploadProps = {
  value?: V2ImageUploadItem[];
  onChange?: (items: V2ImageUploadItem[]) => void;
  /** 最多张数，默认 9 */
  maxCount?: number;
  /** accept，默认图片 */
  accept?: string;
  /** 单文件上限 MB，默认 10 */
  maxSizeMB?: number;
  disabled?: boolean;
  /**
   * empty：仅虚线拖拽/点击区（无图时）
   * grid：缩略图网格 +「新增」格（有图或始终展示网格时）
   * 默认 auto：无图 empty，有图 grid
   */
  layout?: 'auto' | 'empty' | 'grid';
  /** 主提示文案 */
  title?: string;
  /** 次要限制说明 */
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 无障碍标签 */
  'aria-label'?: string;
};

const STYLE_ID = 'oneos-v2-image-upload-styles';

const V2_IMAGE_UPLOAD_CSS = `
.v2-img-upload { width: 100%; box-sizing: border-box; }
.v2-img-upload * { box-sizing: border-box; }
.v2-img-upload__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 120px;
  padding: 20px 16px;
  border: 2px dashed var(--ln-hairline, #E3E8EE);
  border-radius: var(--ln-radius-control, 8px);
  background: var(--ln-surface-pearl, #F8FAFC);
  color: var(--ln-body, #425466);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  text-align: center;
}
.v2-img-upload__drop:hover:not(.is-disabled),
.v2-img-upload__drop:focus-visible {
  border-color: var(--oneos-primary, var(--ln-primary, #533AFD));
  background: var(--ln-primary-soft, #E0E7FF);
  outline: none;
  box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.16);
}
.v2-img-upload__drop.is-dragging {
  border-color: var(--oneos-primary, var(--ln-primary, #533AFD));
  background: var(--ln-primary-soft, #E0E7FF);
  box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2);
}
.v2-img-upload__drop.is-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.v2-img-upload__ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  color: var(--oneos-primary, var(--ln-primary, #533AFD));
  background: color-mix(in srgb, var(--oneos-primary, #533AFD) 12%, transparent);
}
.v2-img-upload__title {
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: var(--ln-ink, #0A2540);
  line-height: 1.4;
}
.v2-img-upload__hint {
  margin: 0;
  font-size: 11px;
  color: var(--ln-muted, #627D98);
  line-height: 1.4;
}
.v2-img-upload__error {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--ln-error, #EF4444);
}
.v2-img-upload__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
  width: 100%;
}
.v2-img-upload__tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 1px solid var(--ln-hairline, #E3E8EE);
  background: var(--ln-surface-card, #fff);
  overflow: hidden;
}
.v2-img-upload__tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.v2-img-upload__tile.is-error {
  border-color: var(--ln-error, #EF4444);
}
.v2-img-upload__tile-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 37, 64, 0.45);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.v2-img-upload__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  border: none;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  cursor: pointer;
  padding: 0;
}
.v2-img-upload__remove:hover,
.v2-img-upload__remove:focus-visible {
  background: var(--ln-error, #EF4444);
  outline: none;
}
.v2-img-upload__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  aspect-ratio: 1;
  min-height: 88px;
  border-radius: 8px;
  border: 2px dashed var(--ln-hairline, #E3E8EE);
  background: var(--ln-surface-pearl, #F8FAFC);
  color: var(--ln-muted, #627D98);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.v2-img-upload__add:hover:not(:disabled),
.v2-img-upload__add:focus-visible {
  border-color: var(--oneos-primary, var(--ln-primary, #533AFD));
  color: var(--oneos-primary, var(--ln-primary, #533AFD));
  background: var(--ln-primary-soft, #E0E7FF);
  outline: none;
}
.v2-img-upload__add:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.v2-img-upload__h5-actions {
  display: none;
  gap: 8px;
  width: 100%;
  margin-top: 10px;
}
.v2-img-upload__h5-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ln-hairline, #E3E8EE);
  background: var(--ln-surface-card, #fff);
  color: var(--ln-ink, #0A2540);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.v2-img-upload__h5-btn:hover:not(:disabled),
.v2-img-upload__h5-btn:focus-visible {
  border-color: var(--oneos-primary, var(--ln-primary, #533AFD));
  color: var(--oneos-primary, var(--ln-primary, #533AFD));
  outline: none;
  box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.16);
}
.v2-img-upload__h5-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.v2-img-upload__meta {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--ln-muted, #627D98);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 767px) {
  .v2-img-upload__drop-web-only { display: none !important; }
  .v2-img-upload__h5-actions { display: flex; }
  .v2-img-upload__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .v2-img-upload__add {
    min-height: 96px;
  }
  .v2-img-upload__remove {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .v2-img-upload__drop,
  .v2-img-upload__add,
  .v2-img-upload__h5-btn,
  .v2-img-upload__remove {
    transition: none !important;
  }
}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = V2_IMAGE_UPLOAD_CSS;
  document.head.appendChild(el);
}

function formatSize(bytes?: number) {
  if (bytes == null || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function createId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * OneOS V2 图片上传：Web 拖拽/点击；H5 拍照 + 相册；缩略图网格新增。
 * 规范：DESIGN.md §3.17
 */
export function V2ImageUpload({
  value = [],
  onChange,
  maxCount = 9,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 10,
  disabled = false,
  layout = 'auto',
  title = '点击或拖拽上传图片',
  hint = `支持 JPG / PNG / WEBP，单张 ≤ ${maxSizeMB}MB，最多 ${maxCount} 张`,
  className = '',
  style,
  'aria-label': ariaLabel = '图片上传',
}: V2ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputId = useId();

  useEffect(() => {
    ensureStyles();
  }, []);

  const remaining = Math.max(0, maxCount - value.length);
  const showEmpty =
    layout === 'empty' || (layout === 'auto' && value.length === 0);
  const showGrid =
    layout === 'grid' || (layout === 'auto' && value.length > 0);

  const emitFiles = (fileList: FileList | File[] | null) => {
    if (disabled || !fileList) return;
    const files = Array.from(fileList);
    if (!files.length) return;

    const next = [...value];
    const errors: string[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
      if (next.length >= maxCount) {
        errors.push(`最多上传 ${maxCount} 张`);
        break;
      }
      if (!file.type.startsWith('image/') && accept.includes('image')) {
        errors.push(`${file.name} 不是图片文件`);
        continue;
      }
      if (file.size > maxBytes) {
        errors.push(`${file.name} 超过 ${maxSizeMB}MB`);
        continue;
      }
      const url = URL.createObjectURL(file);
      next.push({
        id: createId(),
        name: file.name,
        url,
        size: file.size,
      });
    }

    setLocalError(errors[0] || null);
    if (next.length !== value.length) onChange?.(next);
  };

  const openPicker = () => {
    if (disabled || remaining <= 0) return;
    inputRef.current?.click();
  };

  const openCamera = () => {
    if (disabled || remaining <= 0) return;
    cameraInputRef.current?.click();
  };

  const removeAt = (id: string) => {
    if (disabled) return;
    const target = value.find((item) => item.id === id);
    if (target?.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(target.url);
      } catch {
        /* ignore */
      }
    }
    onChange?.(value.filter((item) => item.id !== id));
    setLocalError(null);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled) return;
    setDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    emitFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={`v2-img-upload${className ? ` ${className}` : ''}`}
      style={style}
      aria-label={ariaLabel}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxCount > 1}
        hidden
        disabled={disabled || remaining <= 0}
        onChange={(event) => {
          emitFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        disabled={disabled || remaining <= 0}
        onChange={(event) => {
          emitFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {showEmpty ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={[
            'v2-img-upload__drop',
            'v2-img-upload__drop-web-only',
            dragging ? 'is-dragging' : '',
            disabled ? 'is-disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          aria-disabled={disabled}
        >
          <span className="v2-img-upload__ico" aria-hidden>
            <Upload size={20} strokeWidth={2} />
          </span>
          <p className="v2-img-upload__title">{title}</p>
          <p className="v2-img-upload__hint">{hint}</p>
        </div>
      ) : null}

      {/* H5：无图时也展示拍照 / 相册双入口（PC 隐藏） */}
      {showEmpty ? (
        <div className="v2-img-upload__h5-actions">
          <button
            type="button"
            className="v2-img-upload__h5-btn"
            disabled={disabled || remaining <= 0}
            onClick={openCamera}
          >
            <Camera size={16} aria-hidden />
            拍照上传
          </button>
          <button
            type="button"
            className="v2-img-upload__h5-btn"
            disabled={disabled || remaining <= 0}
            onClick={openPicker}
          >
            <ImagePlus size={16} aria-hidden />
            从相册选择
          </button>
        </div>
      ) : null}

      {showGrid ? (
        <>
          <div className="v2-img-upload__grid" role="list">
            {value.map((item) => (
              <div
                key={item.id}
                className={`v2-img-upload__tile${item.error ? ' is-error' : ''}`}
                role="listitem"
              >
                <img src={item.url} alt={item.name} />
                {item.uploading ? (
                  <div className="v2-img-upload__tile-mask">上传中…</div>
                ) : null}
                {item.error ? (
                  <div className="v2-img-upload__tile-mask">{item.error}</div>
                ) : null}
                {!disabled ? (
                  <button
                    type="button"
                    className="v2-img-upload__remove"
                    aria-label={`删除 ${item.name}`}
                    onClick={() => removeAt(item.id)}
                  >
                    <X size={14} aria-hidden />
                  </button>
                ) : null}
              </div>
            ))}
            {remaining > 0 ? (
              <button
                type="button"
                className="v2-img-upload__add"
                disabled={disabled}
                onClick={openPicker}
                aria-label="新增图片"
              >
                <Plus size={20} aria-hidden />
                <span>新增</span>
              </button>
            ) : null}
          </div>
          {showGrid && !showEmpty ? (
            <div className="v2-img-upload__h5-actions">
              <button
                type="button"
                className="v2-img-upload__h5-btn"
                disabled={disabled || remaining <= 0}
                onClick={openCamera}
              >
                <Camera size={16} aria-hidden />
                拍照
              </button>
              <button
                type="button"
                className="v2-img-upload__h5-btn"
                disabled={disabled || remaining <= 0}
                onClick={openPicker}
              >
                <ImagePlus size={16} aria-hidden />
                相册
              </button>
            </div>
          ) : null}
          <p className="v2-img-upload__meta">
            已选 {value.length}/{maxCount}
            {value[0]?.size != null
              ? ` · 首张 ${formatSize(value[0].size)}`
              : ''}
          </p>
        </>
      ) : null}

      {localError ? <p className="v2-img-upload__error">{localError}</p> : null}
    </div>
  );
}

export default V2ImageUpload;
