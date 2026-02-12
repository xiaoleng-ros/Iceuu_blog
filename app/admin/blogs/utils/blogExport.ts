import { Blog } from './useBlogManagement';

/**
 * 导出博客列表为 CSV 文件
 * @param blogs - 博客列表
 */
export function exportBlogsToCSV(blogs: Blog[]): void {
  const headers = ['ID', '标题', '摘要', '分类', '标签', '创建时间', '状态'];
  const csvContent = [
    headers.join(','),
    ...blogs.map(b => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${(b.excerpt || '').replace(/"/g, '""')}"`,
      b.category || '',
      (b.tags || []).join(';'),
      b.created_at,
      b.draft ? '草稿' : '已发布'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `blog_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
