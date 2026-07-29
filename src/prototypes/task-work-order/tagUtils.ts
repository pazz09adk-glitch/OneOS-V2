import type { V2TagType } from '../../resources/design-system/components/V2Tag';

/** 将业务 tone 映射为 V2Tag.type（禁止再传 tone） */
export function toV2TagType(
  tone?: string | null
): V2TagType {
  switch (tone) {
    case 'primary':
    case 'info':
      return 'primary';
    case 'success':
      return 'success';
    case 'warning':
    case 'gold':
      return 'warning';
    case 'error':
    case 'danger':
      return 'error';
    case 'purple':
      return 'purple';
    case 'neutral':
      return 'neutral';
    default:
      return 'default';
  }
}
