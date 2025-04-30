import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserPlus, LogOut, UserCog, User, ChartBarIncreasing } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, signOut, currentMinistro } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Capela São Pedro</h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <Link
                    to="/doentes"
                    className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md"
                  >
                    <Users className="inline-block mr-2" size={18} />
                    Doentes
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/ministros"
                      className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md"
                    >
                      <UserCog className="inline-block mr-2" size={18} />
                      Ministros
                    </Link>
                  )}

                  <Link
                    to="/agendamentos"
                    className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md"
                  >
                    <Calendar className="inline-block mr-2" size={18} />
                    Agendamentos
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/relatorios"
                      className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md"
                    >
                      <ChartBarIncreasing className="inline-block mr-2" size={18} />
                      Relatórios
                    </Link>
                  )}

                  <div className="flex items-center ml-4 mr-4 text-sm">
                    <User className="mr-2" size={16} />
                    <span>Olá, {currentMinistro?.nome}</span>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2" size={16} />
                    Sair
                  </Button>
                </>
              )}

              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
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
