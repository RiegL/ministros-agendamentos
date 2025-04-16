
import { Agendamento, Doente, Ministro } from "@/types";

// Mock data (replace with your actual data source)
let ministros: Ministro[] = [
  {
    id: "1",
    idAuth: "auth_1",
    nome: "João Silva",
    email: "joao.silva@example.com",
    telefone: "123456789",
    role: "admin",
    senha: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    idAuth: "auth_2",
    nome: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    telefone: "987654321",
    role: "user",
    senha: "user",
    createdAt: new Date(),
  },
  {
    id: "3",
    idAuth: "auth_3",
    nome: "Carlos Pereira",
    email: "carlos.pereira@example.com",
    telefone: "555123456",
    role: "user",
    senha: "user",
    createdAt: new Date(),
  },
  {
    id: "4",
    idAuth: "auth_4",
    nome: "Ana Rodrigues",
    email: "ana.rodrigues@example.com",
    telefone: "333444555",
    role: "user",
    senha: "user",
    createdAt: new Date(),
  },
  {
    id: "5",
    idAuth: "auth_5",
    nome: "Pedro Santos",
    email: "pedro.santos@example.com",
    telefone: "666777888",
    role: "user",
    senha: "user",
    createdAt: new Date(),
  }
];

let doentes: Doente[] = [
  {
    id: "101",
    nome: "Ana Souza",
    endereco: "Rua A, 123",
    setor: "Cardiologia",
    telefone: "111222333",
    createdAt: new Date(),
    cadastradoPor: "1",
    observacoes: "Paciente com histórico de hipertensão",
    telefones: [
      { numero: "111222333", descricao: "Principal" },
      { numero: "444555666", descricao: "Recado com esposo" }
    ]
  },
  {
    id: "102",
    nome: "Pedro Santos",
    endereco: "Rua B, 456",
    setor: "Neurologia",
    telefone: "444555666",
    createdAt: new Date(),
    cadastradoPor: "1",
    observacoes: "Necessita de acompanhamento psicológico",
    telefones: [
      { numero: "444555666", descricao: "Principal" },
      { numero: "777888999", descricao: "Emergência" },
      { numero: "123456789", descricao: "Trabalho" }
    ]
  },
  {
    id: "103",
    nome: "Mariana Costa",
    endereco: "Rua C, 789",
    setor: "Oncologia",
    telefone: "999000111",
    createdAt: new Date(),
    cadastradoPor: "2",
    observacoes: "Em tratamento quimioterápico",
    telefones: [
      { numero: "999000111", descricao: "Principal" },
      { numero: "555666777", descricao: "Familiar" }
    ]
  },
  {
    id: "104",
    nome: "Roberto Oliveira",
    endereco: "Rua D, 101",
    setor: "Psicologia",
    telefone: "222333444",
    createdAt: new Date(),
    cadastradoPor: "3",
    observacoes: "Acompanhamento psicológico regular",
    telefones: [
      { numero: "222333444", descricao: "Principal" }
    ]
  },
  {
    id: "105",
    nome: "Fernanda Lima",
    endereco: "Rua E, 202",
    setor: "Fisioterapia",
    telefone: "666777888",
    createdAt: new Date(),
    cadastradoPor: "4",
    observacoes: "Recuperação de cirurgia ortopédica",
    telefones: [
      { numero: "666777888", descricao: "Principal" },
      { numero: "111222333", descricao: "Recado com familiar" }
    ]
  }
];

let agendamentos: Agendamento[] = [
  {
    id: "201",
    doenteId: "101",
    ministroId: "2",
    ministroSecundarioId: "1",
    data: new Date(),
    hora: "10:00",
    status: "agendado",
    observacoes: "Acompanhamento cardíaco",
    createdAt: new Date(),
  },
  {
    id: "202",
    doenteId: "102",
    ministroId: "1",
    data: new Date(),
    hora: "14:00",
    status: "concluido",
    observacoes: "Consulta neurológica concluída",
    createdAt: new Date(),
  },
  {
    id: "203",
    doenteId: "103",
    ministroId: "2",
    ministroSecundarioId: "3",
    data: new Date(),
    hora: "16:00",
    status: "agendado",
    observacoes: "Acompanhamento oncológico",
    createdAt: new Date(),
  },
  {
    id: "204",
    doenteId: "104",
    ministroId: "4",
    data: new Date(),
    hora: "11:00",
    status: "agendado",
    observacoes: "Sessão de psicologia",
    createdAt: new Date(),
  },
  {
    id: "205",
    doenteId: "105",
    ministroId: "5",
    ministroSecundarioId: "4",
    data: new Date(),
    hora: "15:30",
    status: "agendado",
    observacoes: "Fisioterapia e acompanhamento",
    createdAt: new Date(),
  }
];

// LocalStorage Mock
if (typeof localStorage !== "undefined") {
  if (!localStorage.getItem("ministros")) {
    localStorage.setItem("ministros", JSON.stringify(ministros));
  }
  if (!localStorage.getItem("doentes")) {
    localStorage.setItem("doentes", JSON.stringify(doentes));
  }
  if (!localStorage.getItem("agendamentos")) {
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
  }

  ministros = JSON.parse(localStorage.getItem("ministros") || "[]");
  doentes = JSON.parse(localStorage.getItem("doentes") || "[]");
  agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
}

// Utility function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Mock API functions
export const getMinistros = async (): Promise<Ministro[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ministros);
    }, 300);
  });
};

export const getDoentes = async (): Promise<Doente[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(doentes);
    }, 300);
  });
};

export const getAgendamentos = async (): Promise<Agendamento[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(agendamentos);
    }, 300);
  });
};

export const addMinistro = async (ministro: Omit<Ministro, 'id' | 'createdAt'>): Promise<Ministro> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMinistro: Ministro = {
        id: generateId(),
        ...ministro,
        createdAt: new Date(),
      };
      ministros.push(newMinistro);
      localStorage.setItem('ministros', JSON.stringify(ministros));
      resolve(newMinistro);
    }, 300);
  });
};

export const addDoente = async (doente: Omit<Doente, 'id' | 'createdAt'>): Promise<Doente> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDoente: Doente = {
        id: generateId(),
        ...doente,
        createdAt: new Date(),
      };
      doentes.push(newDoente);
      localStorage.setItem('doentes', JSON.stringify(doentes));
      resolve(newDoente);
    }, 300);
  });
};

// Adicionar um novo agendamento
export const addAgendamento = async ({
  doenteId,
  ministroId,
  data,
  hora,
  observacoes,
  asSecondary = false
}: {
  doenteId: string;
  ministroId: string;
  data: Date;
  hora: string;
  observacoes?: string;
  asSecondary?: boolean;
}): Promise<Agendamento> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        // Se é para adicionar como ministro secundário, encontre o agendamento existente
        if (asSecondary) {
          const existingAgendamentos = agendamentos.filter(
            a => a.doenteId === doenteId && a.status === 'agendado'
          );
          
          if (existingAgendamentos.length > 0) {
            // Pegar o primeiro agendamento ativo sem ministro secundário
            const targetAgendamento = existingAgendamentos.find(a => !a.ministroSecundarioId);
            
            if (targetAgendamento) {
              // Atualizar o agendamento com o ministro secundário
              targetAgendamento.ministroSecundarioId = ministroId;
              localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
              resolve(targetAgendamento);
              return;
            }
          }
        }
        
        // Caso contrário, crie um novo agendamento
        const newAgendamento: Agendamento = {
          id: generateId(),
          doenteId,
          ministroId,
          data,
          hora,
          status: 'agendado',
          observacoes,
          createdAt: new Date(),
        };

        agendamentos.push(newAgendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        resolve(newAgendamento);
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

export const updateAgendamentoStatus = async (
  id: string,
  status: Agendamento["status"]
): Promise<Agendamento> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = agendamentos.findIndex((agendamento) => agendamento.id === id);
      if (index !== -1) {
        agendamentos[index] = { ...agendamentos[index], status };
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        resolve(agendamentos[index]);
      } else {
        reject(new Error("Agendamento not found"));
      }
    }, 300);
  });
};

export const deleteDoente = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      doentes = doentes.filter((doente) => doente.id !== id);
      localStorage.setItem('doentes', JSON.stringify(doentes));
      resolve();
    }, 300);
  });
};

export const hasActiveScheduling = async (doenteId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hasScheduling = agendamentos.some(
        (agendamento) => agendamento.doenteId === doenteId && agendamento.status === 'agendado'
      );
      resolve(hasScheduling);
    }, 300);
  });
};

// Função para atualizar um agendamento
export const updateAgendamento = async (agendamento: Agendamento): Promise<Agendamento> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = agendamentos.findIndex((a) => a.id === agendamento.id);
      if (index !== -1) {
        agendamentos[index] = { ...agendamento };
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      }
      resolve(agendamento);
    }, 300);
  });
};
