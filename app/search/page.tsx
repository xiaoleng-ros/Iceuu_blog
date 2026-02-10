'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import PublicLayout from '@/components/layout/PublicLayout';
import { Loader2, FileSearch, Search as SearchIcon } from 'lucide-react';
import { useSearch } from './hooks/useSearch';
import { useSearchParams } from 'next/navigation';
import Hero from '@/components/home/Hero';
import WidePostCard from '@/components/home/WidePostCard';

/**
 * 无搜索结果提示组件
 */
function EmptyResult({ query }: { query: string }) {
  return (
    <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
      <FileSearch className="h-16 w-16 text-gray-300 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-gray-800">未找到相关结果</h3>
      <p className="text-gray-500 mt-2 text-lg">尝试使用不同的关键词搜索 "{query}"</p>
    </div>
  );
}

/**
 * 搜索内容组件
 */
function SearchContent() {
  const searchParams = useSearchParams();
  const {
    results,
    loading,
    loadingMore,
    searched,
    totalCount,
    loadMore,
  } = useSearch();

  const q = searchParams.get('q') || '';
  const hasMore = results.length < totalCount;

  // 使用默认背景图或从配置中获取（此处暂用默认）
  const backgroundImage = '/growth.jpg'; 
  const heroText = searched ? `搜索到 ${totalCount} 篇与 ${q} 相关的结果` : '全站内容搜索';

  return (
    <div className="min-h-screen relative">
      <Hero backgroundImage={backgroundImage} centerText={heroText} />

      <div className="bg-gray-50/50 min-h-screen relative z-10 -mt-10 md:-mt-16 pt-16 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {loading && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                  <SearchIcon className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <p className="text-gray-500 text-lg font-medium">正在为您寻找相关内容...</p>
              </div>
            ) : (
              <>
                {searched && results.length === 0 && (
                  <EmptyResult query={q} />
                )}

                {results.length > 0 && (
                  <div className="space-y-6">
                    {results.map((blog, index) => (
                      <WidePostCard 
                        key={blog.id} 
                        post={blog} 
                        index={index} 
                        target="_blank"
                      />
                    ))}

                    {hasMore && (
                      <div className="flex justify-center mt-12">
                        <Button 
                          onClick={loadMore} 
                          disabled={loadingMore}
                          size="lg"
                          className="h-12 px-10 rounded-full bg-[#1a1c23] hover:bg-[#2a2d37] text-white shadow-xl transition-all hover:scale-105 active:scale-95 border border-white/10"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              正在加载...
                            </>
                          ) : (
                            '点击加载更多'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!searched && !loading && (
                  <div className="text-center py-32">
                    <div className="bg-white/80 backdrop-blur-sm inline-block p-12 rounded-3xl shadow-sm border border-gray-100">
                      <SearchIcon className="h-16 w-16 mx-auto mb-6 text-gray-200" />
                      <p className="text-xl font-medium text-gray-400">请输入关键词开始探索</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 全站搜索页面组件
 */
export default function SearchPage() {
  return (
    <PublicLayout headerTransparent={true}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a1c23]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </PublicLayout>
  );
}
