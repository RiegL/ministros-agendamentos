import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Trash2 } from "lucide-react";
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
import { deleteMinistro } from "@/services/ministros";
import { useToast } from "@/hooks/use-toast";

interface MinistrosCardProps {
  ministro: Ministro;
  onVerAgendamentos: (ministroId: string) => void;
  onDelete?: () => void;
}

const MinistrosCard = ({ ministro, onVerAgendamentos, onDelete }: MinistrosCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const handleDeleteMinistro = async () => {
    if (!isAdmin) return;

    setIsDeleting(true);

    try {
      await deleteMinistro(ministro.id);

      toast({
        title: "Ministro excluído",
        description: "O ministro foi excluído com sucesso.",
      });

      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Erro ao excluir ministro",
        description: "Não foi possível excluir o ministro.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
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
              Tem certeza que deseja excluir permanentemente este ministro? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMinistro}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MinistrosCard;
