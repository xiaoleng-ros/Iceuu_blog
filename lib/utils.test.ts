import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn 函数', () => {
  it('应该正确合并类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('应该处理条件类名', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
  });

  it('应该处理 undefined 值', () => {
    expect(cn('foo', undefined)).toBe('foo');
  });

  it('应该处理空字符串', () => {
    expect(cn('')).toBe('');
  });
});
