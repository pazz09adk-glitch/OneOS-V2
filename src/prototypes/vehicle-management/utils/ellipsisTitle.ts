/** 为出现省略号的节点在悬浮时补全 title（不覆盖已有提示）。 */

function normalizeTip(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isEllipsisElement(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.textOverflow !== 'ellipsis') return false;
  const overflowX = style.overflowX || style.overflow;
  return overflowX === 'hidden' || overflowX === 'clip' || style.whiteSpace === 'nowrap';
}

function isOverflowing(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
}

function resolveFullText(el: HTMLElement): string {
  const fromAttr = el.getAttribute('data-full-title');
  if (fromAttr) return normalizeTip(fromAttr);
  return normalizeTip(el.textContent || '');
}

/**
 * 在 root 内对省略号文本自动挂 title。
 * - 仅当内容溢出时写入
 * - 不覆盖页面已写死的 title（如操作说明）
 * - 离开溢出态时清除本工具写入的 title
 */
export function bindAutoEllipsisTitle(root: HTMLElement): () => void {
  const onPointerOver = (event: Event) => {
    const start = event.target;
    if (!(start instanceof Element) || !root.contains(start)) return;

    let el: HTMLElement | null = start instanceof HTMLElement ? start : start.parentElement;
    while (el && el !== root) {
      if (el.dataset.titleLock === '1' || el.hasAttribute('data-title-lock')) {
        break;
      }

      if (isEllipsisElement(el)) {
        const full = resolveFullText(el);
        const overflowed = Boolean(full) && isOverflowing(el);
        const current = el.getAttribute('title');
        const autoOwned = el.dataset.autoEllipsisTitle === '1';

        if (overflowed) {
          if (!current || autoOwned) {
            el.setAttribute('title', full);
            el.dataset.autoEllipsisTitle = '1';
          }
        } else if (autoOwned) {
          el.removeAttribute('title');
          delete el.dataset.autoEllipsisTitle;
        }
        break;
      }

      el = el.parentElement;
    }
  };

  root.addEventListener('pointerover', onPointerOver);
  return () => root.removeEventListener('pointerover', onPointerOver);
}
