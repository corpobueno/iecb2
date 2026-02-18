// Extensão dos tipos do Express para incluir dados do usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        groupId: number;
      };
    }
  }
}

export {};
