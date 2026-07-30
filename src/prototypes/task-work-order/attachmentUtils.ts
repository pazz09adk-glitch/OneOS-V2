export type AttachmentKind = 'pdf' | 'image' | 'other';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

export function attachmentKind(name: string): AttachmentKind {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (IMAGE_EXT.test(lower)) return 'image';
  return 'other';
}

export function isPreviewableAttachment(name: string): boolean {
  const kind = attachmentKind(name);
  return kind === 'pdf' || kind === 'image';
}

/** 原型演示：生成本地可下载的占位文件 */
export function downloadDemoAttachment(name: string): void {
  const kind = attachmentKind(name);
  const body =
    kind === 'image'
      ? `OneOS 原型演示图片占位：${name}\n`
      : `OneOS 任务工单 · 附件演示下载\n文件名：${name}\n说明：正式环境将下载真实文件。\n`;
  const blob = new Blob([body], {
    type: kind === 'other' ? 'application/octet-stream' : 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 原型演示图片：SVG 占位图（可预览） */
export function demoImageDataUrl(name: string): string {
  const safe = name.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#F6F9FC"/>
    </linearGradient>
  </defs>
  <rect width="960" height="640" fill="url(#g)"/>
  <rect x="48" y="48" width="864" height="544" rx="16" fill="#fff" stroke="#E3E8EE"/>
  <text x="480" y="290" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="#0A2540">图片预览（演示）</text>
  <text x="480" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#425466">${safe}</text>
  <text x="480" y="390" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#627D98">正式环境将展示实际上传图片</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
