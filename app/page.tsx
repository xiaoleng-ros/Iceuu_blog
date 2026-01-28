import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PublicLayout from '@/components/layout/PublicLayout';
import Hero from '@/components/home/Hero';
import Sidebar from '@/components/home/Sidebar';
import PostList from '@/components/home/PostList';
import Pagination from '@/components/ui/Pagination';

// Revalidate home page every 60 seconds
export const revalidate = 60;

async function getLatestPosts(page: number = 1, pageSize: number = 3) {
  /**
   * 获取最新发布的文章
   * 过滤掉草稿和已进入回收站的文章
   */
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data } = await supabase
    .from('blogs')
    .select('id, title, excerpt, category, created_at, content, cover_image')
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .order('created_at', { ascending: false })
    .range(from, to);
  return data || [];
}

async function getSiteConfig() {
  /**
   * 获取站点配置
   */
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

async function getTags() {
  /**
   * 获取热门标签
   * 仅从已发布的非删除文章中提取
   */
  try {
    const { data } = await supabase
      .from('blogs')
      .select('tags')
      .eq('draft', false)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!data) return [];
    // Flatten and unique
    const allTags = data.flatMap(p => p.tags || []);
    return Array.from(new Set(allTags)).slice(0, 15);
  } catch (error) {
    return [];
  }
}

async function getTotalPosts() {
  /**
   * 获取已发布文章总数
   * 排除回收站文章
   */
  try {
    const { count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('draft', false)
      .or('is_deleted.is.null,is_deleted.eq.false');
    return count || 0;
  } catch (error) {
    return 0;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 3;

  const [latestPosts, siteConfig, tags, totalPosts] = await Promise.all([
    getLatestPosts(page, pageSize),
    getSiteConfig(),
    getTags(),
    getTotalPosts()
  ]);

  return (
    <PublicLayout headerTransparent={true}>
      <Hero backgroundImage={siteConfig.home_background_url} />
      
      <div className="bg-gray-50/50 min-h-screen relative z-10 -mt-10 md:-mt-16 pt-16 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              
              <PostList posts={latestPosts} />
              
              <Pagination 
                currentPage={page} 
                totalPages={Math.ceil(totalPosts / pageSize)} 
                baseUrl="/" 
              />
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0 space-y-8 pt-0 lg:pt-0">
              <Sidebar config={siteConfig} tags={tags} totalPosts={totalPosts} posts={latestPosts} />
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

