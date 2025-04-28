import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Trash2, Edit, ActivitySquare, UserCheck, UserX } from "lucide-react";
import { Ministro } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteMinistro,
  hasAgendamentosAssociados,
} from "@/services/ministros";
import { useToast } from "@/hooks/use-toast";
import { ativarUsuario, desativarUsuario } from "@/lib/supabaseAdmin";
import { supabase } from "@/services/supabase-client";

interface MinistrosCardProps {
  ministro: Ministro;
  onVerAgendamentos: (ministroId: string) => void;
  onDelete?: () => void;
  onEdit: (ministro: Ministro) => void;
}

const MinistrosCard = ({
  ministro,
  onVerAgendamentos,
  onDelete,
  onEdit,
}: MinistrosCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(ministro.disabled);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const handleDeleteMinistro = async () => {
    if (!isAdmin) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      // Verificar se há agendamentos associados
      const temAgendamentos = await hasAgendamentosAssociados(ministro.id);

      if (temAgendamentos) {
        setErrorMessage(
          "Não é possível excluir este ministro porque existem agendamentos associados a ele. Cancele ou reatribua os agendamentos antes de excluir o ministro."
        );
        return;
      }

      await deleteMinistro(ministro.id);

      toast({
        title: "Ministro excluído",
        description: "O ministro foi excluído com sucesso.",
      });

      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      let mensagem = "Não foi possível excluir o ministro.";

      if (error instanceof Error) {
        mensagem = error.message;
      }

      setErrorMessage(mensagem);

      toast({
        title: "Erro ao excluir ministro",
        description: mensagem,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleToggleAtivar(ministro: Ministro) {
    try {
      if (ministro.disabled) {
        await ativarUsuario(ministro.idAuth);
        await supabase
          .from("ministros")
          .update({ disabled: false })
          .eq("id", ministro.id);
        toast({ title: "Ministro ativado com sucesso!" });
        
      } else {
        await desativarUsuario(ministro.idAuth);
        await supabase
          .from("ministros")
          .update({ disabled: true })
          .eq("id", ministro.id);
        toast({ title: "Ministro inativado com sucesso!" });
      }
      // Atualize a lista depois se quiser
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do ministro.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    setIsDisabled(ministro.disabled);
  }, [ministro.disabled]); 

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{ministro.nome}</CardTitle>
        <CardDescription>
          Desde {format(new Date(ministro.createdAt), "PPP", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <p className="text-sm">{ministro.email}</p>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <p className="text-sm">{ministro.telefone}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={() => onVerAgendamentos(ministro.id)}
          variant="outline"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Ver Agendamentos
        </Button>
        <Button
          className="w-full"
          onClick={() => onEdit(ministro)}
          variant="outline"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Ministro
        </Button>
        <Button
          className="w-full"
          onClick={() => handleToggleAtivar(ministro)}
          variant="outline"
        >
          
          {ministro.disabled ?<UserCheck className="h-4 w-4 mr-2" />: <UserX className="h-4 w-4 mr-2" />}
          {ministro.disabled ? "Ativar Ministro" : "Inativar Ministro"}
        </Button>

        {isAdmin && (
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Ministro
          </Button>
        )}
      </CardFooter>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ministro</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
              ) : (
                "Tem certeza que deseja excluir permanentemente este ministro? Esta ação não pode ser desfeita."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {!errorMessage && (
              <AlertDialogAction
                onClick={handleDeleteMinistro}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MinistrosCard;
