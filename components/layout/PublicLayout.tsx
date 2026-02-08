import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * 公共页面布局组件
 * 包含通用的顶部导航栏 (Header) 和页脚 (Footer)
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子页面内容
 * @param {boolean} [props.headerTransparent] - 顶部导航栏是否透明显示
 * @returns {JSX.Element} - 返回公共布局组件 JSX
 */
export default function PublicLayout({ 
  children, 
  headerTransparent = false 
}: { 
  children: React.ReactNode, 
  headerTransparent?: boolean 
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header transparent={headerTransparent} />
      <main className={`flex-1 ${!headerTransparent ? 'pt-16' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
