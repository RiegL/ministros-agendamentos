import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

interface MinistrosFormProps {
  onSubmit: (data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    codigo: number;
    role: "admin" | "user";
  }) => void;
  isLoading?: boolean;
  initialData?: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    codigo: number;
    role: "admin" | "user";
  };
}

const MinistrosForm = ({ onSubmit, isLoading = false, initialData }: MinistrosFormProps) => {
  const { toast } = useToast();
  const [nome, setNome] = useState<string>(initialData?.nome || "");
  const [email, setEmail] = useState<string>(initialData?.email || "");
  const [telefone, setTelefone] = useState<string>(initialData?.telefone || "");
  const [senha, setSenha] = useState<string>(initialData?.senha || "");
  const [role, setRole] = useState<"admin" | "user">(initialData?.role || "user");
  const [codigo, setCodigo] = useState<string>(initialData?.codigo.toString() || "");
  const [showPassword, setShowPassword] = useState(false);

  // Função para mostrar ou esconder a senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setEmail(initialData.email);
      setTelefone(initialData.telefone);
      setSenha(initialData.senha);
      setRole(initialData.role);
      setCodigo(initialData.codigo.toString());
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !telefone || !senha || !codigo) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Envia os dados para o onSubmit (cadastro ou edição)
    onSubmit({
      nome,
      email,
      telefone,
      senha,
      codigo: Number(codigo),
      role,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Ministro" : "Cadastro de Ministro"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Edite os dados do ministro."
            : "Adicione um novo ministro ao sistema para realizar agendamentos."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo*</Label>
            <Input
              id="nome"
              placeholder="Nome do ministro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone*</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha*</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required={!initialData} // Senha é obrigatória apenas para cadastro
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código de Acesso*</Label>
            <Input
              id="codigo"
              type="number"
              placeholder="ex: 2233"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>

          {/* Se for Admin, mostrar o campo de Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Acesso*</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "user") => setRole(value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o tipo de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Ministro (Usuário)</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (initialData ? "Editando..." : "Cadastrando...") : (initialData ? "Editar Ministro" : "Cadastrar Ministro")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MinistrosForm;
