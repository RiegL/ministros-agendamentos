import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Calendar, Users, UserCog, LogOut, User, ChartBarIncreasing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut, currentMinistro } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Button
        variant="default"
        size="icon"
        className="text-primary-foreground"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-primary shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-primary-foreground flex items-center">
                  <User className="inline-block mr-2" size={18} />
                  <span>Olá, {currentMinistro?.nome}</span>
                </div>

                <Link
                  to="/doentes"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="inline-block mr-2" size={18} />
                  Doentes
                </Link>

                {isAdmin && (
                  <Link
                    to="/ministros"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCog className="inline-block mr-2" size={18} />
                    Ministros
                  </Link>
                )}

                <Link
                  to="/agendamentos"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="inline-block mr-2" size={18} />
                  Agendamentos
                </Link>
                {isAdmin && (
                  <Link
                    to="/relatorios"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <ChartBarIncreasing className="inline-block mr-2" size={18} />
                    Relatórios
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2" size={16} />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  navigate("/login");
                  setIsOpen(false);
                }}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
