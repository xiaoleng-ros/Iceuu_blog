import { supabase } from '@/lib/supabase';
import PublicLayout from '@/components/layout/PublicLayout';
import Hero from '@/components/home/Hero';
import Sidebar from '@/components/home/Sidebar';
import PostList from '@/components/home/PostList';
import Pagination from '@/components/ui/Pagination';
import { Blog } from '@/types/database';

// Revalidate home page every 60 seconds
export const revalidate = 60;

/**
 * 获取最新发布的文章
 * 过滤掉草稿和已进入回收站的文章
 * @param {number} page - 当前页码，默认为 1
 * @param {number} pageSize - 每页显示数量，默认为 3
 * @returns {Promise<Blog[]>} - 返回文章列表数组
 */
async function getLatestPosts(page: number = 1, pageSize: number = 3): Promise<Blog[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, excerpt, category, created_at, content, cover_image, draft, tags')
      .eq('draft', false)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) {
      console.error('获取最新文章失败:', error.message);
      return [];
    }
    return (data as Blog[]) || [];
  } catch (_error) {
    console.error('获取最新文章异常:', _error);
    return [];
  }
}

/**
 * 获取站点全局配置
 * 从 site_config 表中读取键值对并转换为对象格式
 * @returns {Promise<Record<string, any>>} - 返回配置对象
 */
async function getSiteConfig() {
  try {
    const { data, error } = await supabase.from('site_config').select('*');
    if (error) {
      console.error('获取站点配置失败:', error.message);
      return {};
    }
    if (!data) return {};
    return data.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  } catch (_error) {
    console.error('获取站点配置异常:', _error);
    return {};
  }
}

/**
 * 获取已发布文章总数
 * 用于分页逻辑，排除草稿和回收站文章
 * @returns {Promise<number>} - 返回文章总数
 */
async function getTotalPosts() {
  try {
    const { count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('draft', false)
      .or('is_deleted.is.null,is_deleted.eq.false');
    
    if (error) {
      console.error('获取文章总数失败:', error.message);
      return 0;
    }
    return count || 0;
  } catch (_error) {
    console.error('获取文章总数异常:', _error);
    return 0;
  }
}

/**
 * 博客首页组件
 * 展示 Hero 区域、文章列表、分页及侧边栏
 * @param {Object} props - 组件属性
 * @param {Promise<{ page?: string }>} props.searchParams - 包含查询参数的 Promise
 * @returns {Promise<JSX.Element>} - 返回首页 JSX 结构
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 3;

  const [latestPosts, siteConfig, totalPosts] = await Promise.all([
    getLatestPosts(page, pageSize),
    getSiteConfig(),
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
              <Sidebar />
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

