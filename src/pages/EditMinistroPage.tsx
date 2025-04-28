import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMinistroById, updateMinistro } from "@/services/ministros";

import { useToast } from "@/hooks/use-toast";
import MinistrosForm from "@/components/forms/MinistrosForm";
import Layout from "@/components/Layout";

const EditarMinistroPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ministro, setMinistro] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinistro = async () => {
      try {
        if (id) {
          const data = await getMinistroById(id);
          setMinistro(data);
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar ministro",
          description: "Não foi possível carregar os dados do ministro.",
          variant: "destructive",
        });
        navigate("/ministros");
      }
    };

    fetchMinistro();
  }, [id, toast, navigate]);

  const handleUpdate = async (data) => {
    try {
      await updateMinistro({ id, ...data });
      toast({
        title: "Ministro atualizado",
        description: "Os dados do ministro foram atualizados com sucesso.",
      });
      navigate("/ministros");
    } catch (error) {
      toast({
        title: "Erro ao atualizar ministro",
        description: "Não foi possível atualizar os dados do ministro.",
        variant: "destructive",
      });
    }
  };

  if (!ministro) {
    return <p>Carregando...</p>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <MinistrosForm onSubmit={handleUpdate} initialData={ministro} />
      </div>
    </Layout>
  );
};

export default EditarMinistroPage;
