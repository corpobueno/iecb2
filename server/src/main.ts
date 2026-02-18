// src/main.ts
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { setupExpressServer } from './frameworks/express/server';
import routes from './routes';
// Configuração do ambiente
dotenv.config({ path: '.env' });

// Configura o servidor Express
const { app, server } = setupExpressServer();

// Configura o Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inicializa o serviço Socket
import { SocketService } from './services/SocketService';
const socketService = SocketService.getInstance(io);

// ========================================
// CAMADA 1: REPOSITORIES (Data Layer)
// ========================================
import { AcompanhamentoRepositoryImpl } from './impl/AcompanhamentoRepositoryImpl';
import { CursoRepositoryImpl } from './impl/CursoRepositoryImpl';
import { DocenteRepositoryImpl } from './impl/DocenteRepositoryImpl';
import { AulaRepositoryImpl } from './impl/AulaRepositoryImpl';
import { AgendaRepositoryImpl } from './impl/AgendaRepositoryImpl';
import { AlunoRepositoryImpl } from './impl/AlunoRepositoryImpl';
import { PagamentoRepositoryImpl } from './impl/PagamentoRepositoryImpl';
import { LeadsRepositoryImpl } from './impl/LeadsRepositoryImpl';
import { LeadsFranqueadoraRepositoryImpl } from './impl/LeadsFranqueadoraRepositoryImpl';
import { DiarioRepositoryImpl } from './impl/DiarioRepositoryImpl';

const acompanhamentoRepository = new AcompanhamentoRepositoryImpl();
const cursoRepository = new CursoRepositoryImpl();
const docenteRepository = new DocenteRepositoryImpl();
const aulaRepository = new AulaRepositoryImpl();
const agendaRepository = new AgendaRepositoryImpl();
const alunoRepository = new AlunoRepositoryImpl();
const pagamentoRepository = new PagamentoRepositoryImpl();
const leadsRepository = new LeadsRepositoryImpl();
const leadsFranqueadoraRepository = new LeadsFranqueadoraRepositoryImpl();
const diarioRepository = new DiarioRepositoryImpl();

// ========================================
// CAMADA 2: USE CASES (Business Logic)
// ========================================
import { AuthUseCases } from './usecases/AuthUseCases';
import { AcompanhamentoUseCases } from './usecases/AcompanhamentoUseCases';
import { CursoUseCases } from './usecases/CursoUseCases';
import { DocenteUseCases } from './usecases/DocenteUseCases';
import { AulaUseCases } from './usecases/AulaUseCases';
import { AgendaUseCases } from './usecases/AgendaUseCases';
import { AlunoUseCases } from './usecases/AlunoUseCases';
import { PagamentoUseCases } from './usecases/PagamentoUseCases';
import { LeadsUseCases } from './usecases/LeadsUseCases';
import { LeadsFranqueadoraUseCases } from './usecases/LeadsFranqueadoraUseCases';
import { DiarioUseCases } from './usecases/DiarioUseCases';

const authUseCases = new AuthUseCases();
const acompanhamentoUseCases = new AcompanhamentoUseCases(acompanhamentoRepository);
const cursoUseCases = new CursoUseCases(cursoRepository);
const docenteUseCases = new DocenteUseCases(docenteRepository);
const aulaUseCases = new AulaUseCases(aulaRepository, pagamentoRepository, agendaRepository);
const agendaUseCases = new AgendaUseCases(agendaRepository);
const alunoUseCases = new AlunoUseCases(alunoRepository);
const pagamentoUseCases = new PagamentoUseCases(pagamentoRepository);
const leadsUseCases = new LeadsUseCases(leadsRepository);
const leadsFranqueadoraUseCases = new LeadsFranqueadoraUseCases(leadsFranqueadoraRepository);
const diarioUseCases = new DiarioUseCases(diarioRepository);

// ========================================
// CAMADA 3: CONTROLLERS (Presentation)
// ========================================
import { AuthController } from './controllers/AuthController';
import { AcompanhamentoController } from './controllers/AcompanhamentoController';
import { CursoController } from './controllers/CursoController';
import { DocenteController } from './controllers/DocenteController';
import { AulaController } from './controllers/AulaController';
import { AgendaController } from './controllers/AgendaController';
import { AlunoController } from './controllers/AlunoController';
import { PagamentoController } from './controllers/PagamentoController';
import { LeadsController } from './controllers/LeadsController';
import { LeadsFranqueadoraController } from './controllers/LeadsFranqueadoraController';
import { DiarioController } from './controllers/DiarioController';

const authController = new AuthController(authUseCases);
const acompanhamentoController = new AcompanhamentoController(acompanhamentoUseCases);
const cursoController = new CursoController(cursoUseCases);
const docenteController = new DocenteController(docenteUseCases);
const aulaController = new AulaController(aulaUseCases);
const agendaController = new AgendaController(agendaUseCases);
const alunoController = new AlunoController(alunoUseCases);
const pagamentoController = new PagamentoController(pagamentoUseCases);
const leadsController = new LeadsController(leadsUseCases);
const leadsFranqueadoraController = new LeadsFranqueadoraController(leadsFranqueadoraUseCases);
const diarioController = new DiarioController(diarioUseCases);

// Rotas
app.use('/', routes(
  authController,
  acompanhamentoController,
  cursoController,
  docenteController,
  aulaController,
  agendaController,
  alunoController,
  pagamentoController,
  leadsController,
  leadsFranqueadoraController,
  diarioController
));

// Inicialização do servidor

server.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em: ${process.env.DB_HOST} porta:${process.env.PORT}`);
});