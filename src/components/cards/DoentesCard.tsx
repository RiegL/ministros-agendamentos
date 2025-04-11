
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, MapPin, FileText } from 'lucide-react';
import { Doente } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DoentesCardProps {
  doente: Doente;
  onAgendarVisita: (doenteId: string) => void;
}

const DoentesCard = ({ doente, onAgendarVisita }: DoentesCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{doente.nome}</CardTitle>
        <CardDescription>
          Cadastrado em {format(new Date(doente.createdAt), "PPP", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-1" />
            <p className="text-sm text-muted-foreground">{doente.endereco}</p>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <p className="text-sm">{doente.telefone}</p>
          </div>
          {doente.observacoes && (
            <div className="flex items-start mt-4">
              <FileText className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">{doente.observacoes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onAgendarVisita(doente.id)}
          variant="outline"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Visita
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoentesCard;
