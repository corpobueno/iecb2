import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  isConnected: false,
  error: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  // Usar empresa do usuário autenticado via Corpo Bueno
  const companyId = user?.empresa ? Number(user.empresa) : null;

  useEffect(() => {
    // Só conecta se o usuário estiver autenticado
    if (!isAuthenticated || !companyId) {
      console.log('Socket não conectado - isAuthenticated:', isAuthenticated, 'companyId:', companyId);
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5185';

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);

      // Entrar na sala da empresa após conectar
      if (companyId) {
        newSocket.emit('join-company', companyId);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Erro de conexão Socket:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconectado após', attemptNumber, 'tentativas');
      setIsConnected(true);
      setError(null);

      // Reentrar na sala da empresa após reconexão
      if (companyId) {
        newSocket.emit('join-company', companyId);
      }
    });

    newSocket.on('reconnect_error', (err) => {
      console.error('Erro ao reconectar:', err.message);
      setError(err.message);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Falha na reconexão do Socket');
      setError('Falha ao reconectar com o servidor');
    });

    setSocket(newSocket);

    // Cleanup na desmontagem
    return () => {
      console.log('Limpando conexão Socket');
      if (socketRef.current) {
        if (companyId) {
          socketRef.current.emit('leave-company', companyId);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, companyId]);

  const value = {
    socket,
    isConnected,
    error,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Hook customizado para ouvir eventos de transação
export const useTransactionSocket = (
  onUpdate: (data: any) => void,
  onStatusUpdate?: (data: any) => void,
  onItemUpdate?: (data: any) => void
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listener para atualizações de transação (create, update, delete)
    socket.on('transaction:update', (data) => {
      console.log('Recebido transaction:update:', data);
      onUpdate(data);
    });

    // Listener para atualizações de status
    if (onStatusUpdate) {
      socket.on('transaction:status-update', (data) => {
        console.log('Recebido transaction:status-update:', data);
        onStatusUpdate(data);
      });
    }

    // Listener para atualizações de itens
    if (onItemUpdate) {
      socket.on('transaction:item-update', (data) => {
        console.log('Recebido transaction:item-update:', data);
        onItemUpdate(data);
      });
    }

    // Cleanup dos listeners
    return () => {
      socket.off('transaction:update');
      if (onStatusUpdate) socket.off('transaction:status-update');
      if (onItemUpdate) socket.off('transaction:item-update');
    };
  }, [socket, isConnected, onUpdate, onStatusUpdate, onItemUpdate]);

  return { socket, isConnected };
};
