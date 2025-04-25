import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  deleteDoente,
  hasActiveScheduling,
  getActiveScheduling,
} from "@/services/doentes";
import { getAgendamentos, addAgendamento } from "@/services/agendamentos";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  FileText,
  MapPin,
  Phone,
} from "lucide-react";
import { Doente, Agendamento } from "@/types";
import { cn } from "@/lib/utils";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

interface DoentesListProps {
  doentes: Doente[];
  onDeleteDoente: () => void;
}

const DoentesList = ({ doentes, onDeleteDoente }: DoentesListProps) => {
  const { currentMinistro, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [openAgendarId, setOpenAgendarId] = useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doenteId, setDoenteId] = useState<string | null>(null);

  const [data, setData] = useState<Date | undefined>();
  const [hora, setHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingDoente, setIsDeletingDoente] = useState(false);
  const [activeVisits, setActiveVisits] = useState<{
    [id: string]: { hasVisit: boolean; hasSecondarySpot: boolean };
  }>({});

  useEffect(() => {
    const checkVisits = async () => {
      const states: {
        [id: string]: { hasVisit: boolean; hasSecondarySpot: boolean };
      } = {};

      // Verificar status de cada doente individualmente usando as funções globais
      for (const doente of doentes) {
        try {
          const hasVisit = await hasActiveScheduling(doente.id);

          if (hasVisit) {
            const activeAgendamento = await getActiveScheduling(doente.id);
            // Verifica se tem um agendamento ativo, mas sem ministro secundário
            const hasSecondarySpot =
              activeAgendamento && !activeAgendamento.ministroSecundarioId;

            // Se o usuário atual for o ministro principal, não deve poder se juntar à visita
            const canJoin =
              currentMinistro && activeAgendamento
                ? activeAgendamento.ministroId !== currentMinistro.id
                : false;

            states[doente.id] = {
              hasVisit,
              hasSecondarySpot: hasSecondarySpot && canJoin,
            };
          } else {
            states[doente.id] = { hasVisit: false, hasSecondarySpot: false };
          }
        } catch (error) {
          console.error(
            `Erro ao verificar status do doente ${doente.id}:`,
            error
          );
          states[doente.id] = { hasVisit: false, hasSecondarySpot: false };
        }
      }

      setActiveVisits(states);
    };

    checkVisits();
  }, [doentes, currentMinistro]);

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
        data: now,
        hora: "",
        observacoes: "",
        asSecondary: doenteState?.hasSecondarySpot,
      });

      toast({
        title: "Visita Agendada",
        description: "O agendamento foi realizado com sucesso.",
      });

      setOpenAgendarId(null); // Fecha o modal de agendamento
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

  const handleDelete = async (id: string) => {
    setIsDeletingDoente(true);
    try {
      await deleteDoente(id);
      toast({ title: "Doente excluído com sucesso" });
      setOpenDeleteId(null);
      onDeleteDoente();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setIsDeletingDoente(false);
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      {doentes.map((doente) => {
        const visitState = activeVisits[doente.id] || {
          hasVisit: false,
          hasSecondarySpot: false,
        };
        const canSchedule = !visitState.hasVisit || visitState.hasSecondarySpot;

        return (
          <div key={doente.id}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors duration-200">
              {/* Nome e observações */}
              <div className="flex flex-col  flex-1">
                <div>
                  <span className="font-semibold">Nome: </span> {doente.nome}
                </div>
                <div>
                  {" "}
                  <span className="font-semibold">Obs:</span>{" "}
                  {doente.observacoes || "Não informado"}
                </div>
              </div>

              {/* Telefones */}
              <div className="flex flex-col flex-1">
                {doente.telefones && doente.telefones.length > 0 ? (
                  doente.telefones.map((telefone, index) => (
                    <div key={index}>
                      <span className="font-semibold">Telefone:</span>{" "}
                      {telefone.numero}
                      {telefone.descricao && (
                        <span className="text-muted-foreground ml-1">
                          ({telefone.descricao})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span>
                    <span className="font-semibold">Telefone:</span> Não
                    informado
                  </span>
                )}
              </div>

              {/* Endereço e Setor */}
              <div className="flex flex-col  flex-1">
                <div>
                  <span className="font-semibold">Endereço:</span>{" "}
                  {doente.endereco}
                </div>
                <div>
                  <span className="font-semibold">Setor:</span> {doente.setor}
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setOpenAgendarId(doente.id)}
                  disabled={!canSchedule}
                >
                  {!visitState.hasVisit
                    ? "Agendar"
                    : visitState.hasSecondarySpot
                    ? "Juntar-se"
                    : "Já Agendado"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/editar-doente/${doente.id}`)}
                >
                  Editar
                </Button>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setOpenDeleteId(doente.id)}
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </div>

            {/* Dialog Agendamento */}
            <Dialog
              open={openAgendarId === doente.id}
              onOpenChange={() => setOpenAgendarId(null)}
            >
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

            {/* Dialog Excluir */}
            <AlertDialog
              open={openDeleteId === doente.id}
              onOpenChange={() => setOpenDeleteId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Doente</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(doente.id)}
                    disabled={isDeletingDoente}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingDoente ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
};

export default DoentesList;
