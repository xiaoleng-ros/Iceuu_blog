'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Search as SearchIcon, Loader2, FileSearch } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, excerpt, created_at, category')
        .eq('draft', false)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">全站搜索</h1>
          <p className="text-gray-500">输入关键词查找您感兴趣的文章</p>
        </div>
        
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索文章标题..."
                  className="pl-10 h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '搜索'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {searched && results.length === 0 && !loading && (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">未找到相关结果</h3>
              <p className="text-gray-500 mt-1">尝试使用不同的关键词搜索 "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-lg font-semibold text-gray-900">搜索结果</h2>
              <span className="text-sm text-gray-500">共 {results.length} 条</span>
            </div>
          )}

          <div className="grid gap-4">
            {results.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.id}`} className="block group">
                <Card className="hover:shadow-md transition-all duration-200 hover:border-blue-200 group-hover:-translate-y-0.5">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </CardTitle>
                      {blog.category && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {blog.category}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      发布于 {formatDate(blog.created_at)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
