import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'; // Importa o cookie-parser
import { Server } from 'http';
import { Application } from 'express';

/**
 * Configura e inicializa o servidor Express.
 * @returns Uma instância do servidor Express configurado.
 */
export const setupExpressServer = (): { app: Application; server: Server } => {
  const app = express();

  // Middlewares
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5183',
      'http://localhost:5193', // iecb client
      'http://localhost:3000',
      'https://web.sysnode.com.br',
      'https://iecb.sysnode.com.br',
    ],
    credentials: true,
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser()); // Adiciona o middleware para parsing de cookies

  const server = new Server(app);

  return { app, server };
};
