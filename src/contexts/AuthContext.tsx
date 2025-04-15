import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ministro, AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // 1. Tentar autenticar com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
  
      if (error || !data?.user) {
        toast({
          title: "Falha no login",
          description: error?.message || "Usuário não encontrado.",
          variant: "destructive",
        });
        return false;
      }
  
      const user = data.user;
  
      // 2. Buscar o ministro correspondente na tabela "ministros"
      const { data: ministroData, error: ministroError } = await supabase
        .from("ministros")
        .select("*")
        .eq("id_auth", user.id)
        .single();
  
      if (ministroError || !ministroData) {
        toast({
          title: "Erro",
          description: "Ministro não encontrado.",
          variant: "destructive",
        });
        return false;
      }
  
      // 3. Mapear os dados para o formato da interface Ministro
      const mappedMinistro: Ministro = {
        id: ministroData.id,
        nome: ministroData.nome,
        email: ministroData.email,
        telefone: ministroData.telefone,
        role: ministroData.role as 'admin' | 'user',
        senha: ministroData.senha,
        createdAt: new Date(ministroData.created_at),
        id_auth: ''
      };
  
      // 4. Salvar o ministro no estado e no localStorage
      setCurrentMinistro(mappedMinistro);
      setIsAuthenticated(true);
      setIsAdmin(mappedMinistro.role === "admin");
      localStorage.setItem("currentMinistro", JSON.stringify(mappedMinistro));
  
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${mappedMinistro.nome}!`,
      });
  
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro de login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
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

    supabase.auth.signOut(); // Logout no Supabase
  };

  // Auth context value
  const value: AuthContextType = {
    currentMinistro,
    isAdmin,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
