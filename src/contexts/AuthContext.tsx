
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ministro, AuthContextType } from '@/types';
import { getMinistros } from '@/services/mock-data';
import { toast } from '@/hooks/use-toast';

// Initial auth context state
const initialAuthContext: AuthContextType = {
  currentMinistro: null,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
};

// Create the auth context
const AuthContext = createContext<AuthContextType>(initialAuthContext);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMinistro, setCurrentMinistro] = useState<Ministro | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for stored session on mount
  useEffect(() => {
    const storedMinistro = localStorage.getItem('currentMinistro');
    
    if (storedMinistro) {
      try {
        const ministro = JSON.parse(storedMinistro) as Ministro;
        setCurrentMinistro(ministro);
        setIsAuthenticated(true);
        setIsAdmin(ministro.role === 'admin');
      } catch (error) {
        console.error("Failed to parse stored ministro:", error);
        localStorage.removeItem('currentMinistro');
      }
    }
  }, []);

  // Login function
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const ministros = await getMinistros();
      const ministro = ministros.find(m => 
        m.email.toLowerCase() === email.toLowerCase() && 
        m.senha === senha
      );

      if (ministro) {
        setCurrentMinistro(ministro);
        setIsAuthenticated(true);
        setIsAdmin(ministro.role === 'admin');
        localStorage.setItem('currentMinistro', JSON.stringify(ministro));
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${ministro.nome}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro de login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentMinistro(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('currentMinistro');
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
  };

  // Auth context value
  const value: AuthContextType = {
    currentMinistro,
    isAdmin,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
