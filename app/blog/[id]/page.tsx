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

  // Parse markdown content
  const contentHtml = await marked(blog.content || '');

  return (
    <PublicLayout headerTransparent={true}>
      <Hero 
        backgroundImage={blog.cover_image || siteConfig.home_background_url} 
        centerText={blog.title}
      />
      
      <div className="bg-white min-h-screen relative z-10 -mt-10 md:-mt-16 pt-16 md:pt-24 rounded-t-[40px]">
        <div className="container mx-auto px-4 md:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-500 border-b pb-6">
              <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
              <span className="text-gray-300">|</span>
              <Link href={`/category/${encodeURIComponent(blog.category)}`} className="text-blue-600 hover:underline">
                {blog.category}
              </Link>
              {blog.tags && blog.tags.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    {blog.tags.map((tag: string) => (
                      <span key={tag} className="hover:text-blue-600 cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Post Content */}
            <article 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Copyright Info */}
            <div className="mt-16">
              <Copyright title={blog.title} id={blog.id} />
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t">
              <UpAndDown prev={blog.prev} next={blog.next} />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
