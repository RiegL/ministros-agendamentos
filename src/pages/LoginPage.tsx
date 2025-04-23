import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  // Estados para recuperação de senha
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Estados para definir nova senha
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Preenche email salvo no localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("lembrarEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setLembrar(true);
    }
  }, []);

  // Se já autenticado, redireciona
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Detecta hash de recuperação de senha no link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setShowNewPasswordDialog(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (lembrar) localStorage.setItem("lembrarEmail", email);
      else localStorage.removeItem("lembrarEmail");

      const success = await signIn(email, senha);
      if (success) navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ title: "E-mail vazio", description: "Informe o e-mail.", variant: "destructive" });
      return;
    }
    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) {
      toast({ title: "Erro ao enviar link", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Link enviado", description: "Verifique seu e-mail.", });
      setShowResetDialog(false);
      setResetEmail("");
    }
    setIsSendingReset(false);
  };

  const handleNewPassword = async () => {
    if (!newPassword) {
      toast({ title: "Senha vazia", description: "Informe a nova senha.", variant: "destructive" });
      return;
    }
    setIsResettingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsResettingPassword(false);
    if (error) {
      toast({ title: "Erro ao redefinir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha redefinida", description: "Faça login com a nova senha." });
      setShowNewPasswordDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ministros da Eucaristia</CardTitle>
          <CardDescription>Faça login para acessar o sistema</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input id="senha" type={showPassword ? "text" : "password"} placeholder="senha" value={senha} onChange={e => setSenha(e.target.value)} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={togglePasswordVisibility}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="lembrar" checked={lembrar} onChange={e => setLembrar(e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="lembrar">Lembrar de mim</Label>
              </div>
              <Button variant="link" className="text-sm text-blue-600 hover:underline" onClick={() => setShowResetDialog(true)} type="button">
                Esqueci minha senha
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar"}</Button>
          </CardFooter>
        </form>

        {/* Diálogo de recuperação de senha */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recuperar senha</AlertDialogTitle>
              <AlertDialogDescription>Digite seu e-mail para receber um link de redefinição de senha.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2 px-6">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input id="reset-email" type="email" placeholder="email@exemplo.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPassword} disabled={isSendingReset}>{isSendingReset ? "Enviando..." : "Enviar link"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de nova senha após recovery */}
        <AlertDialog open={showNewPasswordDialog} onOpenChange={setShowNewPasswordDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Nova senha</AlertDialogTitle>
              <AlertDialogDescription>Digite sua nova senha abaixo.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2 px-6">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleNewPassword} disabled={isResettingPassword}>{isResettingPassword ? "Redefinindo..." : "Redefinir senha"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
};

export default LoginPage;
