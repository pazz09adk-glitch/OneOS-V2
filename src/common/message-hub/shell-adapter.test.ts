import { describe, expect, it } from 'vitest';
import { SEED_MESSAGES } from './seed';
import { toShellNoticeItem } from './shell-adapter';

describe('toShellNoticeItem', () => {
  it('maps urge.remind to shell type 催办提醒', () => {
    const msg = SEED_MESSAGES.find((m) => m.bizType === 'urge.remind');
    expect(msg).toBeTruthy();
    const item = toShellNoticeItem(msg!);
    expect(item.type).toBe('催办提醒');
    expect(item.bizTag).toBe('交车任务');
  });
});
