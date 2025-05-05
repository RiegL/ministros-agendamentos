import React, { createContext, useState, useContext, useEffect } from "react";
import { Ministro, AuthContextType } from "@/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMinistro, setCurrentMinistro] = useState<Ministro | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentMinistro");
    if (stored) {
      try {
        const m = JSON.parse(stored) as Ministro;
        setCurrentMinistro(m);
        setIsAuthenticated(true);
        setIsAdmin(m.role === "admin");
      } catch {
        localStorage.removeItem("currentMinistro");
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
        toast({
          title: "Falha no login",
          description: authError?.message || "Credenciais inválidas.",
          variant: "destructive",
        });
        return false;
      }
  
      // 👇 AQUI corrigido
      if (authData.user?.app_metadata?.disabled) {
        toast({
          title: "Conta desativada",
          description: "Sua conta foi desativada. Contate o administrador.",
          variant: "destructive",
        });
        await supabase.auth.signOut(); // garante que não fique logado
        return false;
      }
  
      // Busca o perfil do ministro normalmente
      const { data: ministroData, error: ministroError } = await supabase
        .from("ministros")
        .select("*")
        .eq("id_auth", authData.user.id)
        .single();
  
      if (ministroError || !ministroData) {
        toast({
          title: "Erro",
          description: "Ministro não encontrado.",
          variant: "destructive",
        });
        return false;
      }
  
      if (ministroData.role !== "admin") {
        toast({
          title: "Acesso negado",
          description: "Ministros comuns devem usar o código de acesso.",
          variant: "destructive",
        });
        return false;
      }
  
      const mappedMinistro: Ministro = {
        id: ministroData.id,
        nome: ministroData.nome,
        email: ministroData.email,
        telefone: ministroData.telefone,
        role: ministroData.role as "admin" | "user",
        senha: ministroData.senha,
        createdAt: new Date(ministroData.created_at),
        idAuth: ministroData.id_auth,
        codigo: ministroData.codigo,
        disabled: ministroData.disabled,
      };
      setCurrentMinistro(mappedMinistro);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem("currentMinistro", JSON.stringify(mappedMinistro));
  
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${mappedMinistro.nome}!`,
      });
      return true;
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro de login",
        description: "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const signInWithCode = async (codigo: number): Promise<boolean> => {
    try {
      const { data: ministroData, error: ministroError } = await supabase
        .from("ministros")
        .select("*")
        .eq("codigo", codigo)
        .in("role", ["user", "admin"])
        .maybeSingle();
  
      if (ministroError) {
        toast({
          title: "Erro de login",
          description: ministroError.message,
          variant: "destructive",
        });
        return false;
      }
  
      if (!ministroData) {
        toast({
          title: "Código inválido",
          description: "Verifique o código informado.",
          variant: "destructive",
        });
        return false;
      }
  
      // Tenta autenticar com email e senha do ministro
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ministroData.email,
        password: ministroData.senha,
      });
  
      if (authError || !authData?.user) {
        toast({
          title: "Erro de autenticação",
          description: authError?.message || "Erro ao autenticar.",
          variant: "destructive",
        });
        return false;
      }
  
      // 👇 Checagem de conta desativada
      if (authData.user?.app_metadata?.disabled) {
        toast({
          title: "Conta desativada",
          description: "Sua conta foi desativada. Contate o administrador.",
          variant: "destructive",
        });
        await supabase.auth.signOut(); 
        return false;
      }
  
      const mappedMinistro: Ministro = {
        id: ministroData.id,
        nome: ministroData.nome,
        email: ministroData.email,
        telefone: ministroData.telefone,
        role: ministroData.role as "admin" | "user",
        senha: ministroData.senha,
        createdAt: new Date(ministroData.created_at),
        idAuth: ministroData.id_auth,
        codigo: ministroData.codigo,
        disabled: ministroData.disabled,
      };
  
      setCurrentMinistro(mappedMinistro);
      setIsAuthenticated(true);
      setIsAdmin(mappedMinistro.role === "admin");
  
      localStorage.setItem("currentMinistro", JSON.stringify(mappedMinistro));
  
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${mappedMinistro.nome}!`,
      });
  
      return true;
    } catch (err) {
      console.error("Erro geral no login com código:", err);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  

  const signOut = () => {
    setCurrentMinistro(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("currentMinistro");

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
