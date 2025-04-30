import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, UserPlus, Users, Clock, ChartBarIncreasing } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAdmin } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="p-6">
              <Link
                to="/doentes"
                className="flex flex-col items-center text-center"
              >
                <Users className="h-12 w-12 mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Doentes</h2>
                <p className="text-sm text-muted-foreground">
                  Visualize e gerencie a lista de doentes cadastrados no
                  sistema.
                </p>
              </Link>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <Link
                  to="/ministros"
                  className="flex flex-col items-center text-center"
                >
                  <UserPlus className="h-12 w-12 mb-4 text-primary" />
                  <h2 className="text-xl font-semibold mb-2">Ministros</h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie a equipe de ministros responsáveis pelas visitas.
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="p-6">
              <Link
                to="/agendamentos"
                className="flex flex-col items-center text-center"
              >
                <Calendar className="h-12 w-12 mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Agendamentos</h2>
                <p className="text-sm text-muted-foreground">
                  Visualize e gerencie suas visitas agendadas.
                </p>
              </Link>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <Link
                  to="/novo-agendamento"
                  className="flex flex-col items-center text-center"
                >
                  <Clock className="h-12 w-12 mb-4 text-primary" />
                  <h2 className="text-xl font-semibold mb-2">
                    Novo Agendamento
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Agende uma nova visita para um doente cadastrado.
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <Link
                  to="/relatorios"
                  className="flex flex-col items-center text-center"
                >
                  <ChartBarIncreasing className="h-12 w-12 mb-4 text-primary" />
                  <h2 className="text-xl font-semibold mb-2">Relatórios</h2>
                  <p className="text-sm text-muted-foreground">
                    Visualize relatórios de agendamentos e doentes.
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
