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
  const { signIn, signInWithCode, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [modoLogin, setModoLogin] = useState<"admin" | "user">("admin");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados recuperação de senha
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Nova senha via recovery
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lembrarEmail");
    if (saved) {
      setEmail(saved);
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
    if (modoLogin === "admin") {
      if (lembrar) localStorage.setItem("lembrarEmail", email);
      else localStorage.removeItem("lembrarEmail");
      if (await signIn(email, senha)) navigate("/");
    } else {
      const codeNum = parseInt(codigo, 10);
      if (await signInWithCode(codeNum)) navigate("/");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const handleResetPassword = async () => {
    if (!resetEmail)
      return toast({
        title: "E-mail vazio",
        description: "Informe o e-mail.",
        variant: "destructive",
      });
    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/login",
    });
    setIsSendingReset(false);
    if (error)
      toast({
        title: "Erro ao enviar link",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Link enviado", description: "Verifique seu e-mail." });
      setShowResetDialog(false);
      setResetEmail("");
    }
  };

  const handleNewPassword = async () => {
    if (!newPassword)
      return toast({
        title: "Senha vazia",
        description: "Informe a nova senha.",
        variant: "destructive",
      });
    setIsResettingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsResettingPassword(false);
    if (error)
      toast({
        title: "Erro ao redefinir",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({
        title: "Senha redefinida",
        description: "Faça login com a nova senha.",
      });
      setShowNewPasswordDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Ministros da Eucaristia</CardTitle>
          <CardDescription>Faça login para acessar o sistema</CardDescription>
        </CardHeader>

        {/* Switch de modo */}
        <div className="flex justify-center mb-4 gap-4 px-6">
          <Button
            variant={modoLogin === "admin" ? "default" : "outline"}
            onClick={() => setModoLogin("admin")}
          >
            Sou Admin
          </Button>
          <Button
            variant={modoLogin === "user" ? "default" : "outline"}
            onClick={() => setModoLogin("user")}
          >
            Sou Usuário
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6">
            {modoLogin === "admin" ? (
              <>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute inset-y-0 right-0 flex items-center px-3"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="lembrar"
                      type="checkbox"
                      checked={lembrar}
                      onChange={(e) => setLembrar(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="lembrar">Lembrar de mim</Label>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setShowResetDialog(true)}
                    type="button"
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Label htmlFor="codigo">Código de Acesso</Label>
                <Input
                  id="codigo"
                  placeholder="Ex: 2233"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {modoLogin === "admin" && isAuthenticated
                ? "Entrando..."
                : isAuthenticated
                ? "Entrando..."
                : "Entrar"}
            </Button>
          </CardFooter>
        </form>

        {/* Recuperar senha */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recuperar senha</AlertDialogTitle>
              <AlertDialogDescription>
                Digite seu e-mail:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="px-6 py-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetPassword}
                disabled={isSendingReset}
              >
                {isSendingReset ? "Enviando..." : "Enviar link"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Nova senha */}
        <AlertDialog
          open={showNewPasswordDialog}
          onOpenChange={setShowNewPasswordDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Nova senha</AlertDialogTitle>
              <AlertDialogDescription>
                Digite a nova senha abaixo:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="relative px-6 py-2">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute inset-y-0 right-0 flex items-center px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
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
