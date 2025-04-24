import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Trash2,
  UserPlus,
  Edit,
} from "lucide-react";
import { Doente } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  hasActiveScheduling,
  getActiveScheduling,
  deleteDoente,
} from "@/services/doentes";
import { getAgendamentos, addAgendamento } from "@/services/agendamentos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
import { Agendamento } from "@/types";

interface DoentesCardProps {
  doente: Doente;
  onDelete?: () => void;
}

const DoentesCard = ({ doente, onDelete }: DoentesCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveVisit, setHasActiveVisit] = useState(false);
  const [isDeletingDoente, setIsDeletingDoente] = useState(false);
  const [canJoinVisit, setCanJoinVisit] = useState(false);
  const [existingAgendamento, setExistingAgendamento] =
    useState<Agendamento | null>(null);
  const [activeVisits, setActiveVisits] = useState<{
    [id: string]: { hasVisit: boolean; hasSecondarySpot: boolean };
  }>({});

  const { currentMinistro, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkActiveVisit = async () => {
      try {
        const hasActive = await hasActiveScheduling(doente.id);
        setHasActiveVisit(hasActive);

        if (hasActive && currentMinistro) {
          const activeAgendamento = await getActiveScheduling(doente.id);

          if (activeAgendamento) {
            setExistingAgendamento(activeAgendamento);

            const canJoin =
              activeAgendamento.ministroId !== currentMinistro.id &&
              !activeAgendamento.ministroSecundarioId;

            setCanJoinVisit(canJoin);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar agendamentos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o status de agendamento.",
          variant: "destructive",
        });
      }
    };

    checkActiveVisit();
  }, [doente.id, currentMinistro, toast]);

  const handleAgendarVisita = () => {
    setIsDialogOpen(true);
  };

  const handleQuickAgendamento = async (doenteId: string) => {
    if (!currentMinistro) return;
    setIsSubmitting(true);

    try {
      // Verificar se já existe um agendamento
      const activeVisit = await hasActiveScheduling(doenteId);
      const doenteState = activeVisits[doenteId];

      if (activeVisit && !doenteState?.hasSecondarySpot) {
        toast({
          title: "Agendamento não permitido",
          description: "Este doente já possui uma visita agendada completa.",
          variant: "destructive",
        });
        return;
      }

      const now = new Date(); // Pega a data atual

      // Agendar a visita
      await addAgendamento({
        doenteId,
        ministroId: currentMinistro.id,
        ministroSecundarioId: doenteState?.hasSecondarySpot
          ? currentMinistro.id
          : null, // Aqui você usa o ID do ministro secundário ou null
        data: now, // Usa a data atual
        hora: "", // Hora não será necessária
        observacoes: "", // Não precisa de observações
      });

      toast({
        title: "Visita Agendada",
        description: "O agendamento foi realizado com sucesso.",
      });

      setIsDialogOpen(false); // Fecha o modal de agendamento
      navigate("/agendamentos"); // Redireciona para a lista de agendamentos
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a visita.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinVisit = async () => {
    if (!existingAgendamento || !currentMinistro) return;
  
    setIsSubmitting(true);
  
    try {
      await addAgendamento({
        ...existingAgendamento,
        ministroId: existingAgendamento.ministroId,
        ministroSecundarioId: currentMinistro.id,
        doenteId: existingAgendamento.doenteId,
        data: new Date(existingAgendamento.data),
        hora: existingAgendamento.hora,
        observacoes: existingAgendamento.observacoes,
      });
  
      toast({
        title: "Você se juntou à visita",
        description: "Agora você está agendado como ministro secundário.",
      });
  
      setIsDialogOpen(false);
      navigate("/agendamentos");
    } catch (error) {
      console.error("Erro ao juntar-se à visita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível juntar-se à visita.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDeleteDoente = async () => {
    if (!isAdmin) return;

    setIsDeletingDoente(true);

    try {
      await deleteDoente(doente.id);

      toast({
        title: "Doente excluído",
        description: "O doente foi excluído com sucesso.",
      });

      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Erro ao excluir doente",
        description: "Não foi possível excluir o doente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingDoente(false);
    }
  };

  const renderPhoneInfo = () => {
    if (!doente.telefones || doente.telefones.length === 0) {
      return (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <p className="text-sm">
            {doente.telefones?.[0]?.numero || "Telefone não disponível"}
          </p>
        </div>
      );
    }

    return doente.telefones.map((tel, index) => (
      <div key={index} className="flex items-center">
        <Phone className="h-4 w-4 mr-2" />
        <p className="text-sm">
          {tel.numero}{" "}
          {tel.descricao && (
            <span className="text-muted-foreground ml-1">
              ({tel.descricao})
            </span>
          )}
        </p>
      </div>
    ));
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{doente.nome}</CardTitle>
            {hasActiveVisit && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                Visita Agendada
              </Badge>
            )}
          </div>
          <CardDescription>
            Cadastrado em{" "}
            {format(new Date(doente.createdAt), "PPP", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">{doente.endereco}</p>
            </div>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">
                Setor: {doente.setor}
              </p>
            </div>

            {renderPhoneInfo()}

            {doente.observacoes && (
              <div className="flex items-start mt-4">
                <FileText className="h-4 w-4 mr-2 mt-1" />
                <p className="text-sm text-muted-foreground">
                  {doente.observacoes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {hasActiveVisit ? (
            canJoinVisit ? (
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleJoinVisit}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Juntar-se à Visita
              </Button>
            ) : (
              <Button className="w-full" variant="outline" disabled>
                Visita Já Agendada
              </Button>
            )
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleAgendarVisita()}
              disabled={!currentMinistro}
            >
              Agendar Visita
            </Button>
          )}

          <Button
            className="w-full"
            variant="outline"
            onClick={() => navigate(`/editar-doente/${doente.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Doente
          </Button>

          {isAdmin && (
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Doente
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Dialog Agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
            <DialogDescription>Para {doente.nome}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <span className="font-semibold">Ministro:</span>{" "}
            {currentMinistro?.nome || "Desconhecido"}
            <br />
            <span className="font-semibold">Data:</span>{" "}
            {new Date().toLocaleDateString()}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => handleQuickAgendamento(doente.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Agendando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Doente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente este doente? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoente}
              disabled={isDeletingDoente}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingDoente ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DoentesCard;
