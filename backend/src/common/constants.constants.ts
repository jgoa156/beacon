export const UserTypes = {
  ADMIN: {
    id: 1,
    name: "Administrador",
  },
  WORKER: {
    id: 2,
    name: "Funcionário",
  },
};

export const OrderActionTypes = {
  STATUS: {
    id: 1,
    name: "atualizou o status",
  },
  PRIORITY: {
    id: 2,
    name: "atualizou a prioridade",
  },
  COMMENTED: {
    id: 3,
    name: "comentou",
  },
  EDITED: {
    id: 4,
    name: "alterou",
  },
};

export const Status = {
  PENDING: {
    id: 1,
    name: "Em aberto",
  },
  AUTHORIZED: {
    id: 2,
    name: "Autorizado",
  },
  BOUGHT: {
    id: 3,
    name: "Comprado",
  },
  SHIPPED: {
    id: 4,
    name: "Enviado",
  },
  FINISHED: {
    id: 5,
    name: "Finalizado",
  },
  UNAUTHORIZED: {
    id: 6,
    name: "Não autorizado",
  },
};

export const Priority = {
  LOW: {
    id: 1,
    name: "Baixa",
  },
  MEDIUM: {
    id: 2,
    name: "Média",
  },
  HIGH: {
    id: 3,
    name: "Alta",
  },
};