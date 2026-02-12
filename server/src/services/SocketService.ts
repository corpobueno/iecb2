// src/services/SocketService.ts
import { Server, Socket } from 'socket.io';

export class SocketService {
  private static instance: SocketService;
  private io: Server;

  private constructor(io: Server) {
    this.io = io;
    this.setupSocketServer();
  }

  public static getInstance(io?: Server): SocketService {
    if (!SocketService.instance && io) {
      SocketService.instance = new SocketService(io);
    }
    return SocketService.instance;
  }

  private setupSocketServer(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Listener para quando o cliente entra em uma sala específica (por empresa)
      socket.on('join-company', (companyId: number) => {
        const room = `company-${companyId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });

      // Listener para quando o cliente sai de uma sala
      socket.on('leave-company', (companyId: number) => {
        const room = `company-${companyId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Método para emitir evento de atualização de transação para todos os clientes de uma empresa
  public emitTransactionUpdate(companyId: number, eventType: 'created' | 'updated' | 'deleted', data: any, username?: string): void {
    const room = `company-${companyId}`;
    this.io.to(room).emit('transaction:update', {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });
    console.log(`Emitted transaction:update to room ${room} - Type: ${eventType} - User: ${username || 'unknown'}`);
  }

  // Método para emitir evento de atualização de status de transação
  public emitTransactionStatusUpdate(companyId: number, transactionId: number, newStatus: string, username?: string): void {
    const room = `company-${companyId}`;
    this.io.to(room).emit('transaction:status-update', {
      transactionId,
      newStatus,
      timestamp: new Date().toISOString()
    });
    console.log(`Emitted transaction:status-update to room ${room} - Transaction: ${transactionId} - User: ${username || 'unknown'}`);
  }

  // Método para emitir evento de atualização de item de transação
  public emitTransactionItemUpdate(companyId: number, eventType: 'created' | 'updated' | 'deleted', data: any, username?: string): void {
    const room = `company-${companyId}`;
    this.io.to(room).emit('transaction:item-update', {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });
    console.log(`Emitted transaction:item-update to room ${room} - Type: ${eventType} - User: ${username || 'unknown'}`);
  }

  // Método genérico para emitir qualquer evento customizado
  public emit(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // Método para obter a instância do Socket.io Server (se necessário)
  public getIO(): Server {
    return this.io;
  }
}

