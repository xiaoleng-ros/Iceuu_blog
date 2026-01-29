import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/layout/PublicLayout';
import Hero from '@/components/home/Hero';
import Copyright from '@/components/blog/Copyright';
import UpAndDown from '@/components/blog/UpAndDown';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { marked } from 'marked';

export const runtime = 'edge';
export const revalidate = 60; // ISR

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for latest posts
export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('blogs')
    .select('id')
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .order('created_at', { ascending: false })
    .limit(20);

  return (posts || []).map((post) => ({
    id: post.id,
  }));
}

async function getBlog(id: string) {
  // 1. 获取当前文章
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .single();

  if (error || !blog) return null;

  // 2. 获取上一篇文章 (创建时间更早且最接近的一篇)
  const { data: prev } = await supabase
    .from('blogs')
    .select('id, title, cover_image, content')
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .lt('created_at', blog.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // 3. 获取下一篇文章 (创建时间更晚且最接近的一篇)
  const { data: next } = await supabase
    .from('blogs')
    .select('id, title, cover_image, content')
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .gt('created_at', blog.created_at)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return {
    ...blog,
    prev: prev || null,
    next: next || null
  };
}

async function getSiteConfig() {
  try {
    const { data } = await supabase.from('site_config').select('*');
    if (!data) return {};
    return data.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching site config:', error);
    return {};
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  const [blog, siteConfig] = await Promise.all([
    getBlog(id),
    getSiteConfig()
  ]);

  if (!blog) {
    notFound();
  }

  const htmlContent = marked.parse(blog.content || '');

  // 根据分类名称映射固定背景图
  const categoryBackgrounds: Record<string, string> = {
    '生活边角料': '/life.jpg',
    '情绪随笔': '/mood.jpg',
    '干货分享': '/tips.jpg',
    '成长复盘': '/growth.jpg',
  };

  const backgroundImage = categoryBackgrounds[blog.category] || siteConfig.home_background_url;

  return (
    <PublicLayout headerTransparent={true}>
      <Hero 
        backgroundImage={backgroundImage} 
        postMetadata={{
          title: blog.title,
          category: blog.category,
          createdAt: formatDate(blog.created_at)
        }}
      />
      
      <div className="bg-gray-50/50 min-h-screen relative z-10 -mt-10 md:-mt-16 pt-16 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
              {/* Content */}
              <div 
                className="prose prose-lg prose-slate max-w-none dark:prose-invert 
                  prose-headings:font-bold prose-headings:tracking-tight 
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
              />

              {/* Copyright Info */}
              <Copyright />

              {/* Navigation */}
              <UpAndDown id={id} prev={blog.prev} next={blog.next} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> 相关标签:
                </span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string) => (
                    <Link 
                      key={tag} 
                      href={`/?tag=${encodeURIComponent(tag.trim())}`}
                      className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      #{tag.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
