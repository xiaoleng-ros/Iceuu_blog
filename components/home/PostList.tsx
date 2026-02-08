import WidePostCard from './WidePostCard';

interface PostListProps {
  posts: any[];
}

/**
 * 首页文章列表组件
 * 负责渲染文章卡片集合，并在无内容时显示空状态
 * @param {PostListProps} props - 组件属性
 * @param {any[]} props.posts - 文章数据数组
 * @returns {JSX.Element} - 返回文章列表 JSX
 */
export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500">暂无文章，敬请期待。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <WidePostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

