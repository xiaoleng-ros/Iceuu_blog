import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
