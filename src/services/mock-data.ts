
import { Doente, Ministro, Agendamento, TelefoneDoente } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock data para ministros
const ministros: Ministro[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    telefone: '(11) 98765-4321',
    role: 'admin',
    senha: 'senha123',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    email: 'maria@exemplo.com',
    telefone: '(11) 91234-5678',
    role: 'user',
    senha: 'senha123',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    email: 'pedro@exemplo.com',
    telefone: '(11) 92345-6789',
    role: 'user',
    senha: 'senha123',
    createdAt: new Date('2023-03-10'),
  },
];

// Mock data para doentes
const doentes: Doente[] = [
  {
    id: '1',
    nome: 'Ana Ferreira',
    endereco: 'Rua das Flores, 123 - Centro',
    setor: 'Centro',
    telefone: '(11) 98888-7777',
    telefones: [
      { numero: '(11) 98888-7777', descricao: 'Pessoal' }
    ],
    observacoes: 'Prefere visitas no período da tarde.',
    createdAt: new Date('2023-03-15'),
    cadastradoPor: '1',
  },
  {
    id: '2',
    nome: 'Carlos Mendes',
    endereco: 'Av. Principal, 456 - Jardim Europa',
    setor: 'Jardim Europa',
    telefone: '(11) 97777-6666',
    telefones: [
      { numero: '(11) 97777-6666', descricao: 'Casa' },
      { numero: '(11) 97777-5555', descricao: 'Filho' }
    ],
    observacoes: 'Acamado, necessita de atenção especial.',
    createdAt: new Date('2023-04-20'),
    cadastradoPor: '2',
  },
  {
    id: '3',
    nome: 'Lúcia Costa',
    endereco: 'Rua dos Girassóis, 789 - Vila Nova',
    setor: 'Vila Nova',
    telefone: '(11) 96666-5555',
    telefones: [
      { numero: '(11) 96666-5555', descricao: '' }
    ],
    createdAt: new Date('2023-05-10'),
    cadastradoPor: '1',
  },
];

// Mock data para agendamentos
const agendamentos: Agendamento[] = [
  {
    id: '1',
    doenteId: '1',
    ministroId: '1',
    data: new Date('2025-06-15'),
    hora: '14:30',
    status: 'concluido',
    createdAt: new Date('2025-06-10'),
  },
  {
    id: '2',
    doenteId: '2',
    ministroId: '2',
    ministroSecundarioId: '3', // Example with secondary minister
    data: new Date('2025-06-20'),
    hora: '10:00',
    status: 'agendado',
    observacoes: 'Levar materiais de conforto espiritual.',
    createdAt: new Date('2025-06-12'),
  },
  {
    id: '3',
    doenteId: '3',
    ministroId: '3',
    data: new Date('2025-06-18'),
    hora: '16:00',
    status: 'cancelado',
    observacoes: 'Cancelado por indisponibilidade do doente.',
    createdAt: new Date('2025-06-11'),
  },
  {
    id: '4',
    doenteId: '1',
    ministroId: '3',
    data: new Date('2025-06-25'),
    hora: '15:30',
    status: 'agendado',
    createdAt: new Date('2025-06-15'),
  },
];

// Check if a doente already has an active scheduling
export const hasActiveScheduling = (doenteId: string): Promise<boolean> => {
  const hasActive = agendamentos.some(a => 
    a.doenteId === doenteId && 
    a.status === 'agendado'
  );
  
  return Promise.resolve(hasActive);
};

// Serviços de mock para manipular os dados
export const getMinistros = (): Promise<Ministro[]> => {
  return Promise.resolve([...ministros]);
};

export const getDoentes = (): Promise<Doente[]> => {
  return Promise.resolve([...doentes]);
};

export const getAgendamentos = (): Promise<Agendamento[]> => {
  return Promise.resolve([...agendamentos]);
};

// Get agendamentos for a specific ministro
export const getAgendamentosByMinistroId = (ministroId: string): Promise<Agendamento[]> => {
  return Promise.resolve(agendamentos.filter(a => 
    a.ministroId === ministroId || a.ministroSecundarioId === ministroId
  ));
};

export const addMinistro = (newMinistro: Omit<Ministro, 'id' | 'createdAt'>): Promise<Ministro> => {
  const ministro: Ministro = {
    ...newMinistro,
    id: uuidv4(),
    createdAt: new Date(),
  };
  
  ministros.push(ministro);
  return Promise.resolve(ministro);
};

export const addDoente = (newDoente: Omit<Doente, 'id' | 'createdAt'>): Promise<Doente> => {
  const doente: Doente = {
    ...newDoente,
    id: uuidv4(),
    createdAt: new Date(),
  };
  
  doentes.push(doente);
  return Promise.resolve(doente);
};

export const deleteDoente = (id: string): Promise<void> => {
  const index = doentes.findIndex(d => d.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('Doente não encontrado'));
  }
  
  // Also delete any agendamentos associated with this doente
  const agendamentosToRemove = agendamentos.filter(a => a.doenteId === id);
  agendamentosToRemove.forEach(a => {
    const idx = agendamentos.findIndex(ag => ag.id === a.id);
    if (idx !== -1) {
      agendamentos.splice(idx, 1);
    }
  });
  
  doentes.splice(index, 1);
  return Promise.resolve();
};

export const addAgendamento = (newAgendamento: Omit<Agendamento, 'id' | 'createdAt' | 'status'>): Promise<Agendamento> => {
  const agendamento: Agendamento = {
    ...newAgendamento,
    id: uuidv4(),
    status: 'agendado',
    createdAt: new Date(),
  };
  
  agendamentos.push(agendamento);
  return Promise.resolve(agendamento);
};

export const updateAgendamentoStatus = (id: string, status: 'agendado' | 'concluido' | 'cancelado'): Promise<Agendamento> => {
  const index = agendamentos.findIndex(a => a.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('Agendamento não encontrado'));
  }
  
  agendamentos[index].status = status;
  return Promise.resolve(agendamentos[index]);
};

// Add a secondary minister to an existing appointment
export const addSecondaryMinister = (agendamentoId: string, ministroId: string): Promise<Agendamento> => {
  const index = agendamentos.findIndex(a => a.id === agendamentoId);
  
  if (index === -1) {
    return Promise.reject(new Error('Agendamento não encontrado'));
  }
  
  // Check if trying to add the same minister who is already primary
  if (agendamentos[index].ministroId === ministroId) {
    return Promise.reject(new Error('O ministro já é o responsável principal por esta visita'));
  }
  
  agendamentos[index].ministroSecundarioId = ministroId;
  return Promise.resolve(agendamentos[index]);
};

// Remove secondary minister from an appointment
export const removeSecondaryMinister = (agendamentoId: string): Promise<Agendamento> => {
  const index = agendamentos.findIndex(a => a.id === agendamentoId);
  
  if (index === -1) {
    return Promise.reject(new Error('Agendamento não encontrado'));
  }
  
  agendamentos[index].ministroSecundarioId = undefined;
  return Promise.resolve(agendamentos[index]);
};
