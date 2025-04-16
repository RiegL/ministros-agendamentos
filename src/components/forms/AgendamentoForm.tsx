
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Clock,
  UserPlus,
  UserMinus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Doente, Ministro } from "@/types";
import { SearchableSelect } from "../agendamentos/SearchableSelect";

interface AgendamentoFormProps {
  doentes: Doente[];
  ministros: Ministro[];
  onSubmit: (data: {
    doenteId: string;
    ministroId: string;
    ministroSecundarioId?: string;
    data: Date;
    hora: string;
    observacoes: string;
  }) => void;
  isLoading?: boolean;
}

const AgendamentoForm = ({
  doentes = [], // Provide default empty arrays
  ministros = [],
  onSubmit,
  isLoading = false,
}: AgendamentoFormProps) => {
  const { toast } = useToast();
  const [doenteId, setDoenteId] = useState("");
  const [ministroId, setMinistroId] = useState("");
  const [ministroSecundarioId, setMinistroSecundarioId] = useState<
    string | undefined
  >(undefined);
  const [hasSecondaryMinister, setHasSecondaryMinister] = useState(false);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Ensure arrays are always arrays
  const safeDoentes = Array.isArray(doentes) ? doentes : [];
  const safeMinistros = Array.isArray(ministros) ? ministros : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!doenteId || !ministroId || !data || !hora) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Check if primary and secondary ministers are the same
    if (hasSecondaryMinister && ministroSecundarioId === ministroId) {
      toast({
        title: "Ministros duplicados",
        description:
          "O ministro secundário não pode ser o mesmo que o ministro principal.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      doenteId,
      ministroId,
      ministroSecundarioId: hasSecondaryMinister ? ministroSecundarioId : undefined,
      data,
      hora,
      observacoes,
    });
  };

  const toggleSecondaryMinister = () => {
    setHasSecondaryMinister(!hasSecondaryMinister);
    if (!hasSecondaryMinister) {
      setMinistroSecundarioId(undefined);
    }
  };

  // Filter ministers for secondary selection (can't select the same as primary)
  const filteredMinistros = safeMinistros.filter((m) => m.id !== ministroId);

  // Create options arrays for selects
  const doenteOptions = safeDoentes.map((d) => ({ label: d.nome, value: d.id }));
  const ministroOptions = safeMinistros.map((m) => ({ label: m.nome, value: m.id }));
  const filteredMinistroOptions = filteredMinistros.map((m) => ({ label: m.nome, value: m.id }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Agendamento</CardTitle>
        <CardDescription>Agende uma visita para um doente.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doente">Doente*</Label>
            <SearchableSelect
              value={doenteId}
              onChange={setDoenteId}
              placeholder="Selecione o doente"
              options={doenteOptions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ministro">Ministro Principal*</Label>
            <SearchableSelect
              value={ministroId}
              onChange={setMinistroId}
              placeholder="Selecione o ministro"
              options={ministroOptions}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant={hasSecondaryMinister ? "destructive" : "outline"}
                size="sm"
                onClick={toggleSecondaryMinister}
              >
                {hasSecondaryMinister ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remover Ministro Secundário
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Ministro Secundário
                  </>
                )}
              </Button>
            </div>

            {hasSecondaryMinister && (
              <div className="space-y-2">
                <Label htmlFor="ministroSecundario">Ministro Secundário</Label>
                <SearchableSelect
                  value={ministroSecundarioId || ""}
                  onChange={setMinistroSecundarioId}
                  placeholder="Selecione o ministro secundário"
                  options={filteredMinistroOptions}
                  disabled={!ministroId}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="data"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data
                      ? format(data, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora*</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Detalhes sobre a visita"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AgendamentoForm;
