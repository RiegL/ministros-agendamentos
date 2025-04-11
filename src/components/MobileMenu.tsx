
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Calendar, Users, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-primary shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/doentes"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
              onClick={toggleMenu}
            >
              <Users className="inline-block mr-2" size={18} />
              Doentes
            </Link>
            <Link
              to="/ministros"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
              onClick={toggleMenu}
            >
              <UserPlus className="inline-block mr-2" size={18} />
              Ministros
            </Link>
            <Link
              to="/agendamentos"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
              onClick={toggleMenu}
            >
              <Calendar className="inline-block mr-2" size={18} />
              Agendamentos
            </Link>
            <Button variant="outline" className="w-full mt-4">
              <LogOut className="mr-2" size={16} />
              Sair
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
