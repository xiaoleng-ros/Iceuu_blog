import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import Hero from '@/components/home/Hero';
import PostList from '@/components/home/PostList';
import Pagination from '@/components/ui/Pagination';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getCategoryPosts(category: string, page: number = 1, pageSize: number = 5) {
  /**
   * 根据分类获取文章列表
   * 过滤掉草稿和已删除文章
   * 添加分页支持
   */
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('blogs')
    .select('id, title, excerpt, cover_image, category, created_at, content', { count: 'exact' })
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .range(from, to);
  return { posts: data || [], count: count || 0 };
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

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  return {
    title: `${decodedCategory} - 赵阿卷的博客`,
  };
}

export default async function CategoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ category: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 5;
  
  const [categoryData, siteConfig] = await Promise.all([
    getCategoryPosts(decodedCategory, page, pageSize),
    getSiteConfig()
  ]);

  const { posts, count } = categoryData;
  const totalPages = Math.ceil(count / pageSize);

  // 根据分类名称映射固定背景图
  const categoryBackgrounds: Record<string, string> = {
    '生活边角料': '/life.jpg',
    '情绪随笔': '/mood.jpg',
    '干货分享': '/tips.jpg',
    '成长复盘': '/growth.jpg',
  };

  const backgroundImage = categoryBackgrounds[decodedCategory] || siteConfig.home_background_url;
  const heroText = `该分类：${decodedCategory} ~ 共计${count}篇文章`;

  return (
    <PublicLayout headerTransparent={true}>
      <Hero backgroundImage={backgroundImage} centerText={heroText} />
      
      <div className="bg-gray-50/50 min-h-screen relative z-10 -mt-10 md:-mt-16 pt-16 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 pb-12">
          {/* Constrain width and center to match home page article list appearance */}
          <div className="max-w-4xl mx-auto">
            <PostList posts={posts} />
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  baseUrl={`/category/${category}`} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
