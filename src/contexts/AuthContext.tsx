import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ministro, AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const initialAuthContext: AuthContextType = {
  currentMinistro: null,
  isAdmin: false,
  isAuthenticated: false,
  codigo: null,
  signIn: async () => false,
  signInWithCode: async () => false,
  signOut: () => {},
};

const AuthContext = createContext<AuthContextType>(initialAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMinistro, setCurrentMinistro] = useState<Ministro | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('currentMinistro');
    if (stored) {
      try {
        const m = JSON.parse(stored) as Ministro;
        setCurrentMinistro(m);
        setIsAuthenticated(true);
        setIsAdmin(m.role === 'admin');
      } catch {
        localStorage.removeItem('currentMinistro');
      }
    }
  }, []);

  const signIn = async (email: string, senha: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
  
      if (authError || !authData?.user) {
        toast({ title: "Falha no login", description: authError?.message || "Credenciais inválidas.", variant: "destructive" });
        return false;
      }
  
      // Busca o perfil do ministro
      const { data: ministroData, error: ministroError } = await supabase
        .from("ministros")
        .select("*")
        .eq("id_auth", authData.user.id)
        .single();
  
      if (ministroError || !ministroData) {
        toast({ title: "Erro", description: "Ministro não encontrado.", variant: "destructive" });
        return false;
      }
  
      // **NOVA VERIFICAÇÃO DE ROLE**: apenas admins podem usar email/senha
      if (ministroData.role !== "admin") {
        toast({ title: "Acesso negado", description: "Ministros comuns devem usar o código de acesso.", variant: "destructive" });
        return false;
      }
  
      // --- resto do mapeamento e armazenamento ---
      const mappedMinistro: Ministro = {
        id: ministroData.id,
        nome: ministroData.nome,
        email: ministroData.email,
        telefone: ministroData.telefone,
        role: ministroData.role as 'admin' | 'user',
        senha: ministroData.senha,
        createdAt: new Date(ministroData.created_at),
        idAuth: ministroData.id_auth,
        codigo: ministroData.codigo,
      };
      setCurrentMinistro(mappedMinistro);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem("currentMinistro", JSON.stringify(mappedMinistro));
  
      toast({ title: "Login bem-sucedido", description: `Bem-vindo, ${mappedMinistro.nome}!` });
      return true;
  
    } catch (err) {
      console.error(err);
      toast({ title: "Erro de login", description: "Tente novamente.", variant: "destructive" });
      return false;
    }
  };
  

  const signInWithCode = async (codigo: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
      .from("ministros")
      .select("*")
      .eq("codigo", codigo)
      .in("role", ["user", "admin"])
      .maybeSingle();
    
    if (error) {
      // Erro de API (ex: network, RLS, SQL inválido)
      toast({ title: "Erro de login", description: error.message, variant: "destructive" });
      return false;
    }
    if (!data) {
      // Nenhum usuário com aquele código
      toast({ title: "Código inválido", description: "Verifique o código informado.", variant: "destructive" });
      return false;
    }

      const mappedMinistro: Ministro = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        role: data.role as 'admin' | 'user',
        senha: data.senha,
        createdAt: new Date(data.created_at),
        idAuth: data.id_auth,
        codigo: data.codigo,
      };

      setCurrentMinistro(mappedMinistro);
      setIsAuthenticated(true);
      setIsAdmin(false);
      localStorage.setItem("currentMinistro", JSON.stringify(mappedMinistro));

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${mappedMinistro.nome}!`,
      });

      return true;
    }  catch (err) {
      console.error("Login with code error:", err);
      toast({ title: "Erro de login", description: "Tente novamente.", variant: "destructive" });
      return false;
    }
  };

  const signOut = () => {
    setCurrentMinistro(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('currentMinistro');

    supabase.auth.signOut();

    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
  };

  const value: AuthContextType = {
    currentMinistro,
    isAdmin,
    isAuthenticated,
    codigo: currentMinistro?.codigo ?? null,
    signIn,
    signInWithCode,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
