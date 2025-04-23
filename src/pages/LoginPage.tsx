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

  // Recuperação de senha
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Definir nova senha
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("lembrarEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setLembrar(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
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
      toast({ title: "Link enviado", description: "Verifique seu e-mail." });
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
            {/* Campos de email e senha padrão aqui */}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>

        {/* Diálogo de recuperação de senha */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          {/* Conteúdo de reset aqui */}
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
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleNewPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? "Redefinindo..." : "Redefinir senha"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
};

export default LoginPage;
