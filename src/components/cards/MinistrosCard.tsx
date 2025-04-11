
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar } from 'lucide-react';
import { Ministro } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MinistrosCardProps {
  ministro: Ministro;
  onVerAgendamentos: (ministroId: string) => void;
}

const MinistrosCard = ({ ministro, onVerAgendamentos }: MinistrosCardProps) => {
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
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onVerAgendamentos(ministro.id)}
          variant="outline"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Ver Agendamentos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MinistrosCard;
