
import React from 'react';
import Navbar from './Navbar';
import MobileMenu from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold">Capela São Pedro</h1>
        </div>
        {isMobile ? <MobileMenu /> : <Navbar />}
      </div>
    </header>
  );
};

export default Header;
