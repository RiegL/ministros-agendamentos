import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile(); // <- aqui dentro!

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      {/* {!isMobile && <Footer />} só mostra se NÃO for mobile */}
       <Footer />
    </div>
  );
};

export default Layout;
