import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchPage from './page';
import { useSearch } from './hooks/useSearch';

// Mock useSearch hook
vi.mock('./hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=test'),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
              })),
            })),
          })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('SearchPage 搜索页面', () => {
  it('在加载状态下应显示加载动画', () => {
    (useSearch as any).mockReturnValue({
      query: 'test',
      results: [],
      loading: true,
      loadingMore: false,
      searched: true,
      totalCount: 0,
      loadMore: vi.fn(),
    });

    render(<SearchPage />);
    expect(screen.getByText(/正在为您寻找相关内容/)).toBeDefined();
  });

  it('在无结果时应显示空状态提示', () => {
    (useSearch as any).mockReturnValue({
      query: 'test',
      results: [],
      loading: false,
      loadingMore: false,
      searched: true,
      totalCount: 0,
      loadMore: vi.fn(),
    });

    render(<SearchPage />);
    expect(screen.getByText(/未找到相关结果/)).toBeDefined();
    expect(screen.getByText(/尝试使用不同的关键词搜索/)).toBeDefined();
  });

  it('有结果时应正确渲染搜索结果列表', () => {
    const mockResults = [
      {
        id: '1',
        title: '测试文章 1',
        excerpt: '这是测试文章 1 的摘要',
        created_at: new Date().toISOString(),
        category: '技术',
        content: '内容 1',
      },
      {
        id: '2',
        title: '测试文章 2',
        excerpt: '这是测试文章 2 的摘要',
        created_at: new Date().toISOString(),
        category: '生活',
        content: '内容 2',
      },
    ];

    (useSearch as any).mockReturnValue({
      query: '测试',
      results: mockResults,
      loading: false,
      loadingMore: false,
      searched: true,
      totalCount: 2,
      loadMore: vi.fn(),
    });

    render(<SearchPage />);
    // 检查是否渲染了标题
    const titles = screen.getAllByText(/测试文章/);
    expect(titles.length).toBeGreaterThanOrEqual(2);
    
    // 检查特定摘要
    expect(screen.getByText(/这是测试文章 1 的摘要/)).toBeDefined();
    expect(screen.getByText(/这是测试文章 2 的摘要/)).toBeDefined();
  });
});
