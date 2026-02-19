// src/routes.ts
import express from 'express';
import { ensureAuthenticated } from './utils/auth';
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

export default (
  authController: AuthController,
  acompanhamentoController: AcompanhamentoController,
  cursoController: CursoController,
  docenteController: DocenteController,
  aulaController: AulaController,
  agendaController: AgendaController,
  alunoController: AlunoController,
  pagamentoController: PagamentoController,
  leadsController: LeadsController,
  leadsFranqueadoraController: LeadsFranqueadoraController,
  diarioController: DiarioController
) => {
  const router = express.Router();

  // Log de inicialização das rotas de embed
  console.log('[EMBED-AUTH] Rotas de autenticação embed registradas:');
  console.log('[EMBED-AUTH]   POST /auth/register-embed-token');
  console.log('[EMBED-AUTH]   GET /auth/init');

  // Endpoint de teste para verificar se o servidor está acessível
  router.get('/auth/embed-test', (req, res) => {
    console.log('[EMBED-AUTH] Teste de conectividade recebido');
    res.json({
      success: true,
      message: 'Endpoint de embed auth está funcionando',
      frameTokenConfigured: !!process.env.FRAME_TOKEN,
      timestamp: new Date().toISOString(),
    });
  });

  // =====================================================
  // AUTH ROUTES
  // =====================================================
  // Embed auth (server-to-server + navegador)
  router.post('/auth/register-embed-token', (req, res) => authController.registerEmbedToken(req, res));
  router.get('/auth/init', (req, res) => authController.authInit(req, res));
  router.post('/auth/validate-embed-token', (req, res) => authController.validateEmbedToken(req, res));
  // Outros métodos de auth
  router.post('/auth/iframe', (req, res) => authController.authIframe(req, res));
  router.post('/auth/frame-token', (req, res) => authController.authFrameToken(req, res));
  router.post('/auth/admin', (req, res) => authController.authAdminPassword(req, res));
  router.post('/auth/logout', (req, res) => authController.logout(req, res));
  router.post('/auth/validate', ensureAuthenticated, (req, res) => authController.validate(req, res));

  // =====================================================
  // ACOMPANHAMENTO (Leads/Clientes) ROUTES
  // =====================================================
  router.get('/acompanhamento', ensureAuthenticated, (req, res) => acompanhamentoController.find(req, res));
  router.get('/acompanhamento/:id', ensureAuthenticated, (req, res) => acompanhamentoController.getById(req, res));
  router.post('/acompanhamento', ensureAuthenticated, (req, res) => acompanhamentoController.create(req, res));
  router.put('/acompanhamento/:id', ensureAuthenticated, (req, res) => acompanhamentoController.update(req, res));
  router.delete('/acompanhamento/:id', ensureAuthenticated, (req, res) => acompanhamentoController.delete(req, res));

  // =====================================================
  // CURSOS ROUTES
  // =====================================================
  router.get('/curso', ensureAuthenticated, (req, res) => cursoController.find(req, res));
  router.get('/curso/:id', ensureAuthenticated, (req, res) => cursoController.getById(req, res));
  router.post('/curso', ensureAuthenticated, (req, res) => cursoController.create(req, res));
  router.put('/curso/:id', ensureAuthenticated, (req, res) => cursoController.update(req, res));
  router.delete('/curso/:id', ensureAuthenticated, (req, res) => cursoController.delete(req, res));

  // =====================================================
  // DOCENTES ROUTES
  // =====================================================
  router.get('/docente', ensureAuthenticated, (req, res) => docenteController.find(req, res));
  router.get('/docente/:id', ensureAuthenticated, (req, res) => docenteController.getById(req, res));
  router.post('/docente', ensureAuthenticated, (req, res) => docenteController.create(req, res));
  router.put('/docente/:id', ensureAuthenticated, (req, res) => docenteController.update(req, res));
  router.delete('/docente/:id', ensureAuthenticated, (req, res) => docenteController.delete(req, res));

  // =====================================================
  // AULAS ROUTES
  // =====================================================
  router.get('/aula', ensureAuthenticated, (req, res) => aulaController.find(req, res));
  router.get('/aula/disponiveis', ensureAuthenticated, (req, res) => aulaController.findDisponiveis(req, res));
  router.get('/aula/:id', ensureAuthenticated, (req, res) => aulaController.getById(req, res));
  router.post('/aula', ensureAuthenticated, (req, res) => aulaController.create(req, res));
  router.put('/aula/:id', ensureAuthenticated, (req, res) => aulaController.update(req, res));
  router.put('/aula/:id/cancel', ensureAuthenticated, (req, res) => aulaController.cancel(req, res));
  router.delete('/aula/:id', ensureAuthenticated, (req, res) => aulaController.delete(req, res));

  // =====================================================
  // AGENDA ROUTES
  // =====================================================
  router.get('/agenda/periodo', ensureAuthenticated, (req, res) => agendaController.findByPeriodo(req, res));
  router.get('/agenda/data/:data', ensureAuthenticated, (req, res) => agendaController.findByData(req, res));
  router.get('/agenda/aula/:idAula/count', ensureAuthenticated, (req, res) => agendaController.countByAula(req, res));
  router.get('/agenda/:id', ensureAuthenticated, (req, res) => agendaController.getById(req, res));
  router.post('/agenda', ensureAuthenticated, (req, res) => agendaController.create(req, res));
  router.put('/agenda/:id', ensureAuthenticated, (req, res) => agendaController.update(req, res));
  router.delete('/agenda/:id', ensureAuthenticated, (req, res) => agendaController.delete(req, res));

  // =====================================================
  // ALUNOS (Matrículas) ROUTES
  // =====================================================
  router.get('/aluno/aula/:idAula', ensureAuthenticated, (req, res) => alunoController.findByAula(req, res));
  router.get('/aluno/aula/:idAula/data/:data', ensureAuthenticated, (req, res) => alunoController.findByAulaAndData(req, res));
  router.get('/aluno/aula/:idAula/sum', ensureAuthenticated, (req, res) => alunoController.sumValorByAula(req, res));
  router.get('/aluno/:id', ensureAuthenticated, (req, res) => alunoController.getById(req, res));
  router.post('/aluno', ensureAuthenticated, (req, res) => alunoController.create(req, res));
  router.put('/aluno/:id', ensureAuthenticated, (req, res) => alunoController.update(req, res));
  router.patch('/aluno/:id/status', ensureAuthenticated, (req, res) => alunoController.updateStatus(req, res));
  router.delete('/aluno/:id', ensureAuthenticated, (req, res) => alunoController.delete(req, res));

  // =====================================================
  // PAGAMENTOS ROUTES
  // =====================================================
  router.get('/pagamento/caixa', ensureAuthenticated, (req, res) => pagamentoController.getCaixaPagamentos(req, res));
  router.get('/pagamento/caixa/filtros', ensureAuthenticated, (req, res) => pagamentoController.getCaixaFiltrosOptions(req, res));
  router.get('/pagamento/caixa/detalhes', ensureAuthenticated, (req, res) => pagamentoController.getCaixaDetalhes(req, res));
  router.get('/pagamento/cliente/:idCliente', ensureAuthenticated, (req, res) => pagamentoController.findByCliente(req, res));
  router.get('/pagamento/aula/:idAula', ensureAuthenticated, (req, res) => pagamentoController.findByAula(req, res));
  router.get('/pagamento/creditos/:idCliente', ensureAuthenticated, (req, res) => pagamentoController.getCreditosByCliente(req, res));
  router.get('/pagamento/:id', ensureAuthenticated, (req, res) => pagamentoController.getById(req, res));
  router.post('/pagamento', ensureAuthenticated, (req, res) => pagamentoController.create(req, res));
  router.post('/pagamento/processar', ensureAuthenticated, (req, res) => pagamentoController.processarPagamentoAluno(req, res));
  router.put('/pagamento/:id', ensureAuthenticated, (req, res) => pagamentoController.update(req, res));
  router.delete('/pagamento/:id', ensureAuthenticated, (req, res) => pagamentoController.delete(req, res));

  // =====================================================
  // LEADS ROUTES
  // =====================================================
  router.get('/leads', ensureAuthenticated, (req, res) => leadsController.find(req, res));
  router.get('/leads/principal', ensureAuthenticated, (req, res) => leadsController.findPrincipal(req, res));
  router.get('/leads/principal/:id', ensureAuthenticated, (req, res) => leadsController.getPrincipalById(req, res));
  router.get('/leads/comentarios/:telefone', ensureAuthenticated, (req, res) => leadsController.getComentarios(req, res));
  router.post('/leads/comentarios', ensureAuthenticated, (req, res) => leadsController.createComentario(req, res));
  router.get('/leads/:id', ensureAuthenticated, (req, res) => leadsController.getById(req, res));
  router.post('/leads', ensureAuthenticated, (req, res) => leadsController.create(req, res));
  router.put('/leads/:id', ensureAuthenticated, (req, res) => leadsController.update(req, res));
  router.delete('/leads/:id', ensureAuthenticated, (req, res) => leadsController.delete(req, res));

  // =====================================================
  // LEADS FRANQUEADORA ROUTES
  // =====================================================
  router.get('/leads-franqueadora', ensureAuthenticated, (req, res) => leadsFranqueadoraController.find(req, res));
  router.get('/leads-franqueadora/principal', ensureAuthenticated, (req, res) => leadsFranqueadoraController.findPrincipal(req, res));
  router.get('/leads-franqueadora/principal/:id', ensureAuthenticated, (req, res) => leadsFranqueadoraController.getPrincipalById(req, res));
  router.get('/leads-franqueadora/comentarios/:telefone', ensureAuthenticated, (req, res) => leadsFranqueadoraController.getComentarios(req, res));
  router.post('/leads-franqueadora/comentarios', ensureAuthenticated, (req, res) => leadsFranqueadoraController.createComentario(req, res));
  router.get('/leads-franqueadora/:id', ensureAuthenticated, (req, res) => leadsFranqueadoraController.getById(req, res));
  router.post('/leads-franqueadora', ensureAuthenticated, (req, res) => leadsFranqueadoraController.create(req, res));
  router.put('/leads-franqueadora/:id', ensureAuthenticated, (req, res) => leadsFranqueadoraController.update(req, res));
  router.delete('/leads-franqueadora/:id', ensureAuthenticated, (req, res) => leadsFranqueadoraController.delete(req, res));

  // =====================================================
  // DIARIO ROUTES
  // =====================================================
  router.get('/diario', ensureAuthenticated, (req, res) => diarioController.getDiario(req, res));

  return router;
};
