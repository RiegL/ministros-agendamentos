
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, UserPlus, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              {isAuthenticated && (
                <>
                  <Link to="/doentes" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                    <Users className="inline-block mr-2" size={18} />
                    Doentes
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/ministros" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                      <UserCog className="inline-block mr-2" size={18} />
                      Ministros
                    </Link>
                  )}
                  
                  <Link to="/agendamentos" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md">
                    <Calendar className="inline-block mr-2" size={18} />
                    Agendamentos
                  </Link>
                  
                  <Button variant="outline" size="sm" className="ml-4" onClick={handleLogout}>
                    <LogOut className="mr-2" size={16} />
                    Sair
                  </Button>
                </>
              )}
              
              {!isAuthenticated && (
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
