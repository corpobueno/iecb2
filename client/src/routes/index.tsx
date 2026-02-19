import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';


// Pages
const NotFound = lazy(() => import('../pages/NotFound'));
const AuthInit = lazy(() => import('../pages/auth/AuthInit'));

// Acompanhamento
const AcompanhamentoList = lazy(() => import('../pages/acompanhamento/AcompanhamentoList'));
const AcompanhamentoRegister = lazy(() => import('../pages/acompanhamento/AcompanhamentoRegister'));

// Curso
const CursoList = lazy(() => import('../pages/curso/CursoList'));
const CursoRegister = lazy(() => import('../pages/curso/CursoRegister'));

// Docente
const DocenteList = lazy(() => import('../pages/docente/DocenteList'));
const DocenteRegister = lazy(() => import('../pages/docente/DocenteRegister'));

// Aula
const AulaList = lazy(() => import('../pages/aula/AulaList'));
const AulaRegister = lazy(() => import('../pages/aula/AulaRegister'));

// Agenda
const AgendaList = lazy(() => import('../pages/agenda/AgendaList'));
const AgendaRegister = lazy(() => import('../pages/agenda/AgendaRegister'));

// Aluno (Matriculas)
const AlunoList = lazy(() => import('../pages/aluno/AlunoList'));
const AlunoRegister = lazy(() => import('../pages/aluno/AlunoRegister'));

// Pagamento
const PagamentoList = lazy(() => import('../pages/pagamento/PagamentoList'));
const PagamentoRegister = lazy(() => import('../pages/pagamento/PagamentoRegister'));
const PagamentoCaixa = lazy(() => import('../pages/pagamento/caixa/PagamentoCaixa'));

// Diario
const DiarioPage = lazy(() => import('../pages/diario/DiarioPage').then(m => ({ default: m.DiarioPage })));

//Leads
const Leads = lazy(() => import('../pages/leads/principal/LeadsPrincipal'));
const LeadsFranqueadora = lazy(() => import('../pages/leads/franqueadora/LeadsFranquadora'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        {/* Auth - Embed authentication */}
        <Route path="/auth/init" element={<AuthInit />} />

        {/* Acompanhamento (Leads/Clientes) */}
        <Route path="/" element={<AcompanhamentoList />} />
        <Route path="/acompanhamento" element={<AcompanhamentoList />} />
        <Route path="/acompanhamento/cadastrar" element={<AcompanhamentoRegister />} />
        <Route path="/acompanhamento/editar/:id" element={<AcompanhamentoRegister />} />

        {/* Cursos */}
        <Route path="/cursos" element={<CursoList />} />
        <Route path="/cursos/cadastrar" element={<CursoRegister />} />
        <Route path="/cursos/editar/:id" element={<CursoRegister />} />

        {/* Docentes */}
        <Route path="/docentes" element={<DocenteList />} />
        <Route path="/docentes/cadastrar" element={<DocenteRegister />} />
        <Route path="/docentes/editar/:id" element={<DocenteRegister />} />

        {/* Aulas */}
        <Route path="/aulas" element={<AulaList />} />
        <Route path="/aulas/cadastrar" element={<AulaRegister />} />
        <Route path="/aulas/editar/:id" element={<AulaRegister />} />

        {/* Agenda */}
        <Route path="/agenda" element={<AgendaList />} />
        <Route path="/agenda/cadastrar" element={<AgendaRegister />} />
        <Route path="/agenda/editar/:id" element={<AgendaRegister />} />

        {/* Alunos (Matriculas) */}
        <Route path="/alunos" element={<AlunoList />} />
        <Route path="/alunos/cadastrar" element={<AlunoRegister />} />
        <Route path="/alunos/editar/:id" element={<AlunoRegister />} />

        {/* Pagamentos */}
        <Route path="/pagamentos" element={<PagamentoList />} />
        <Route path="/pagamentos/caixa" element={<PagamentoCaixa />} />
        <Route path="/pagamentos/cadastrar" element={<PagamentoRegister />} />
        <Route path="/pagamentos/editar/:id" element={<PagamentoRegister />} />

        {/* Diario */}
        <Route path="/diario" element={<DiarioPage />} />

        <Route path="/leads/principal" element={<Leads />} />

        <Route path="/leads/franqueadora" element={<LeadsFranqueadora />} />


        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
