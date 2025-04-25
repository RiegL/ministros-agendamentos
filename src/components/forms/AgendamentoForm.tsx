import React, { useState } from "react";
import { Doente, Ministro } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface AgendamentoFormProps {
  doentes: Doente[];
  ministros: Ministro[];
  onSubmit: (data: {
    doenteId: string;
    ministroId: string;
    ministroSecundarioId?: string;
    data: Date;
  }) => void;
  isLoading?: boolean;
}

const AgendamentoForm = ({
  doentes,
  ministros,
  onSubmit,
  isLoading = false,
}: AgendamentoFormProps) => {
  const { toast } = useToast();
  const [doenteId, setDoenteId] = useState("");
  const [ministroId, setMinistroId] = useState("");
  const [ministroSecundarioId, setMinistroSecundarioId] = useState("");
  const handleSubmit = () => {
    if (!doenteId || !ministroId) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um doente e um ministro.",
        variant: "destructive",
      });
      return;
    }

    // Evitar enviar ministro secundário igual ao principal
    const secundario =
      ministroSecundarioId && ministroSecundarioId !== ministroId
        ? ministroSecundarioId
        : undefined;

    onSubmit({
      doenteId,
      ministroId,
      ministroSecundarioId: secundario,
      data: new Date(),
    });

    setDoenteId("");
    setMinistroId("");
    setMinistroSecundarioId("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Agendamento</CardTitle>
        <CardDescription>Selecione o doente e os ministros.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* doente */}
        <div>
          <Label>Doente</Label>
          <Command>
            <CommandInput placeholder="Buscar doente..." />
            <CommandList>
              {doentes.map((d) => (
                <CommandItem
                  key={d.id}
                  onSelect={() =>
                    setDoenteId((prev) => (prev === d.id ? "" : d.id))
                  }
                  className={`
                    ${doenteId === d.id ? "bg-green-300 text-green-800" : ""}
                    hover:bg-transparent focus:bg-transparent cursor-pointer
                  `}
                >
                  <>
                    {d.nome} {d.setor ? `(${d.setor})` : ""}
                    {doenteId === d.id && <span className="ml-auto">✅</span>}
                  </>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>

        {/* minstro principal */}
        <div>
          <Label>Ministro Principal</Label>
          <Command>
            <CommandInput placeholder="Buscar ministro..." />
            <CommandList>
              {ministros.map((m) => (
                <CommandItem
                  key={m.id}
                  onSelect={() =>
                    setMinistroId((prev) => (prev === m.id ? "" : m.id))
                  }
                  className={`
                    ${ministroId === m.id ? "bg-green-300 text-green-800" : ""}
                    hover:bg-transparent focus:bg-transparent cursor-pointer
                  `}
                >
                  <>
                    {m.nome}
                    {ministroId === m.id && <span className="ml-auto">✅</span>}
                  </>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>

        {/* ministro secundário */}
        <div>
          <Label>Ministro Secundário (opcional)</Label>
          <Command>
            <CommandInput placeholder="Buscar ministro secundário..." />
            <CommandList>
              {ministros
                .filter((m) => m.id !== ministroId) // não permitir duplicado
                .map((m) => (
                  <CommandItem
                    key={m.id}
                    onSelect={() =>
                      setMinistroSecundarioId((prev) =>
                        prev === m.id ? "" : m.id
                      )
                    }
                    className={`
                      ${
                        ministroSecundarioId === m.id
                          ? "bg-green-300 text-green-800"
                          : ""
                      }
                      hover:bg-transparent focus:bg-transparent cursor-pointer
                    `}
                  >
                    <>
                      {m.nome}
                      {ministroSecundarioId === m.id && (
                        <span className="ml-auto">✅</span>
                      )}
                    </>
                  </CommandItem>
                ))}
            </CommandList>
          </Command>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !doenteId || !ministroId}
          className="w-full"
        >
          {isLoading ? "Agendando..." : "Confirmar Agendamento"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgendamentoForm;
