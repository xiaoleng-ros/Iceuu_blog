import WidePostCard from './WidePostCard';

interface PostListProps {
  posts: any[];
}

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

