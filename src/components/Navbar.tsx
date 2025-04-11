
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, UserPlus, LogOut } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold flex items-center">
              <Calendar className="mr-2" />
              Agenda Sagrada
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/doentes" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                <Users className="inline-block mr-2" size={18} />
                Doentes
              </Link>
              <Link to="/ministros" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                <UserPlus className="inline-block mr-2" size={18} />
                Ministros
              </Link>
              <Link to="/agendamentos" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                <Calendar className="inline-block mr-2" size={18} />
                Agendamentos
              </Link>
              <Button variant="outline" size="sm" className="ml-4">
                <LogOut className="mr-2" size={16} />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
