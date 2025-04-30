import React from "react";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeartHandshake } from "lucide-react";
import { Link } from 'react-router-dom';

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="text-xl font-bold flex items-center">
           <Link to="/" className="text-xl font-bold flex items-center">
          <HeartHandshake className="mr-2" />
          Ministros da Eucaristia
           </Link>
        </div>
        {isMobile ? <MobileMenu /> : <Navbar />}
      </div>
    </header>
  );
};

export default Header;
