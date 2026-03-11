-- =============================================
-- MÓDULO RH - IECB
-- Script de criação das tabelas
-- =============================================

-- =============================================
-- COLABORADORES (Tabela Central)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_colaboradores_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  -- Dados Pessoais
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  data_nascimento DATE,
  genero ENUM('M', 'F', 'O'),
  estado_civil VARCHAR(20),

  -- Contato
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco VARCHAR(200),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),

  -- Profissional
  cargo VARCHAR(100),
  setor VARCHAR(100),
  data_admissao DATE,
  data_demissao DATE,
  tipo_contrato ENUM('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO') DEFAULT 'CLT',
  salario DECIMAL(10,2),

  -- Período de Experiência
  experiencia_inicio DATE,
  experiencia_fim DATE,
  experiencia_status ENUM('PENDENTE', 'APROVADO', 'REPROVADO'),

  -- Status
  status ENUM('ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO') DEFAULT 'ATIVO',

  -- Integração Score (0-100)
  score_integracao INT DEFAULT 0,

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_att TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rh_colab_empresa (empresa),
  INDEX idx_rh_colab_status (status),
  INDEX idx_rh_colab_setor (setor),
  INDEX idx_rh_colab_ativo (ativo)
);

-- =============================================
-- CANDIDATOS (Banco de Talentos)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_candidatos_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  -- Dados Pessoais
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  email VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),

  -- Profissional
  cargo_pretendido VARCHAR(100),
  pretensao_salarial DECIMAL(10,2),
  disponibilidade ENUM('IMEDIATA', '15_DIAS', '30_DIAS', 'A_COMBINAR'),
  experiencia_anos INT,

  -- Origem
  origem ENUM('INSTAGRAM', 'INDICACAO', 'SITE', 'LINKEDIN', 'OUTRO') DEFAULT 'OUTRO',
  origem_detalhe VARCHAR(100),

  -- Currículo
  curriculo_url VARCHAR(500),
  observacoes TEXT,

  -- Status
  status ENUM('NOVO', 'EM_ANALISE', 'ENTREVISTA', 'TESTE', 'APROVADO', 'REPROVADO', 'CONTRATADO', 'BANCO_TALENTOS') DEFAULT 'NOVO',

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_att TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rh_cand_empresa (empresa),
  INDEX idx_rh_cand_status (status),
  INDEX idx_rh_cand_cargo (cargo_pretendido),
  INDEX idx_rh_cand_ativo (ativo)
);

-- =============================================
-- PROCESSOS SELETIVOS
-- =============================================
CREATE TABLE IF NOT EXISTS rh_processos_seletivos_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  titulo VARCHAR(100) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  setor VARCHAR(100),
  vagas INT DEFAULT 1,

  -- Datas
  data_abertura DATE,
  data_fechamento DATE,

  -- Custos
  custo_divulgacao DECIMAL(10,2) DEFAULT 0,
  custo_total DECIMAL(10,2) DEFAULT 0,

  -- Status
  status ENUM('ABERTO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO') DEFAULT 'ABERTO',

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_att TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rh_proc_empresa (empresa),
  INDEX idx_rh_proc_status (status),
  INDEX idx_rh_proc_ativo (ativo)
);

-- =============================================
-- ETAPAS DO PROCESSO SELETIVO
-- =============================================
CREATE TABLE IF NOT EXISTS rh_processo_etapas_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_processo INT NOT NULL,
  id_candidato INT NOT NULL,

  etapa ENUM('TRIAGEM', 'ENTREVISTA_RH', 'ENTREVISTA_GESTOR', 'TESTE_TECNICO', 'TESTE_COMPORTAMENTAL', 'EXAME_MEDICO', 'DOCUMENTACAO', 'CONTRATADO') NOT NULL,

  data_etapa DATE,
  resultado ENUM('PENDENTE', 'APROVADO', 'REPROVADO') DEFAULT 'PENDENTE',
  nota DECIMAL(4,2),
  observacoes TEXT,

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_etapa_processo (id_processo),
  INDEX idx_rh_etapa_candidato (id_candidato),

  CONSTRAINT fk_rh_etapa_processo FOREIGN KEY (id_processo) REFERENCES rh_processos_seletivos_iecb(id) ON DELETE CASCADE,
  CONSTRAINT fk_rh_etapa_candidato FOREIGN KEY (id_candidato) REFERENCES rh_candidatos_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- CHECKLIST TEMPLATE (Por Setor)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_checklist_template_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  setor VARCHAR(100),
  item VARCHAR(100) NOT NULL,
  ordem INT DEFAULT 0,
  obrigatorio INT DEFAULT 1,

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_check_tmpl_empresa (empresa),
  INDEX idx_rh_check_tmpl_setor (setor),
  INDEX idx_rh_check_tmpl_ativo (ativo)
);

-- =============================================
-- CHECKLIST ADMISSÃO (Instância por Colaborador)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_checklist_admissao_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_colaborador INT NOT NULL,
  id_template INT,

  item VARCHAR(100) NOT NULL,
  concluido INT DEFAULT 0,
  data_conclusao DATE,
  observacoes VARCHAR(200),

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_check_adm_colab (id_colaborador),

  CONSTRAINT fk_rh_check_adm_colab FOREIGN KEY (id_colaborador) REFERENCES rh_colaboradores_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- TREINAMENTOS
-- =============================================
CREATE TABLE IF NOT EXISTS rh_treinamentos_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  carga_horaria INT,
  obrigatorio INT DEFAULT 0,
  setor VARCHAR(100),

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_trein_empresa (empresa),
  INDEX idx_rh_trein_ativo (ativo)
);

-- =============================================
-- TREINAMENTOS COLABORADOR (N:N)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_treinamento_colaborador_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_treinamento INT NOT NULL,
  id_colaborador INT NOT NULL,

  data_inicio DATE,
  data_conclusao DATE,
  status ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') DEFAULT 'PENDENTE',
  nota DECIMAL(4,2),
  certificado_url VARCHAR(500),

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_trein_colab_trein (id_treinamento),
  INDEX idx_rh_trein_colab_colab (id_colaborador),

  CONSTRAINT fk_rh_trein_colab_trein FOREIGN KEY (id_treinamento) REFERENCES rh_treinamentos_iecb(id) ON DELETE CASCADE,
  CONSTRAINT fk_rh_trein_colab_colab FOREIGN KEY (id_colaborador) REFERENCES rh_colaboradores_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- AVALIAÇÕES DE DESEMPENHO
-- =============================================
CREATE TABLE IF NOT EXISTS rh_avaliacoes_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_colaborador INT NOT NULL,

  tipo ENUM('EXPERIENCIA', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'DESLIGAMENTO') NOT NULL,
  periodo_inicio DATE,
  periodo_fim DATE,

  -- Notas (0-10)
  nota_pontualidade DECIMAL(4,2),
  nota_produtividade DECIMAL(4,2),
  nota_trabalho_equipe DECIMAL(4,2),
  nota_comunicacao DECIMAL(4,2),
  nota_iniciativa DECIMAL(4,2),
  nota_geral DECIMAL(4,2),

  feedback_gestor TEXT,
  feedback_colaborador TEXT,
  plano_acao TEXT,

  avaliador VARCHAR(32),

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_aval_colab (id_colaborador),
  INDEX idx_rh_aval_tipo (tipo),

  CONSTRAINT fk_rh_aval_colab FOREIGN KEY (id_colaborador) REFERENCES rh_colaboradores_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- OCORRÊNCIAS (Advertências, Feedbacks, Conflitos)
-- =============================================
CREATE TABLE IF NOT EXISTS rh_ocorrencias_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_colaborador INT NOT NULL,

  tipo ENUM('FEEDBACK_POSITIVO', 'FEEDBACK_NEGATIVO', 'ADVERTENCIA_VERBAL', 'ADVERTENCIA_ESCRITA', 'SUSPENSAO', 'CONFLITO', 'OUTRO') NOT NULL,

  data_ocorrencia DATE,
  descricao TEXT NOT NULL,
  acao_tomada TEXT,

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_ocor_colab (id_colaborador),
  INDEX idx_rh_ocor_tipo (tipo),

  CONSTRAINT fk_rh_ocor_colab FOREIGN KEY (id_colaborador) REFERENCES rh_colaboradores_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- PESQUISA DE CLIMA
-- =============================================
CREATE TABLE IF NOT EXISTS rh_pesquisa_clima_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa INT NOT NULL,

  titulo VARCHAR(100) NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  status ENUM('RASCUNHO', 'ATIVA', 'FINALIZADA') DEFAULT 'RASCUNHO',

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_pesq_empresa (empresa),
  INDEX idx_rh_pesq_status (status)
);

-- =============================================
-- RESPOSTAS PESQUISA CLIMA
-- =============================================
CREATE TABLE IF NOT EXISTS rh_pesquisa_respostas_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pesquisa INT NOT NULL,
  id_colaborador INT,

  -- Notas de satisfação (1-5)
  satisfacao_geral INT,
  ambiente_trabalho INT,
  lideranca INT,
  comunicacao INT,
  reconhecimento INT,
  desenvolvimento INT,

  comentarios TEXT,
  anonimo INT DEFAULT 1,

  -- Controle
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_resp_pesq (id_pesquisa),

  CONSTRAINT fk_rh_resp_pesq FOREIGN KEY (id_pesquisa) REFERENCES rh_pesquisa_clima_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- DESLIGAMENTOS
-- =============================================
CREATE TABLE IF NOT EXISTS rh_desligamentos_iecb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_colaborador INT NOT NULL,

  tipo ENUM('PEDIDO', 'EMPRESA_SEM_JUSTA_CAUSA', 'EMPRESA_JUSTA_CAUSA', 'ACORDO', 'TERMINO_CONTRATO') NOT NULL,

  data_aviso DATE,
  data_desligamento DATE,
  cumpriu_aviso INT DEFAULT 1,

  motivo_principal VARCHAR(100),
  motivo_detalhado TEXT,

  -- Custos
  custo_rescisao DECIMAL(10,2),
  custo_multa_fgts DECIMAL(10,2),
  custo_ferias DECIMAL(10,2),
  custo_13_proporcional DECIMAL(10,2),
  custo_total DECIMAL(10,2),

  -- Entrevista de Desligamento
  entrevista_realizada INT DEFAULT 0,
  feedback_entrevista TEXT,
  recontrataria ENUM('SIM', 'NAO', 'TALVEZ'),

  -- Controle
  usuario VARCHAR(32),
  ativo INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rh_desl_colab (id_colaborador),

  CONSTRAINT fk_rh_desl_colab FOREIGN KEY (id_colaborador) REFERENCES rh_colaboradores_iecb(id) ON DELETE CASCADE
);

-- =============================================
-- DADOS INICIAIS - CHECKLIST TEMPLATE PADRÃO
-- =============================================
-- Execute após criar as tabelas, substituindo o ID da empresa

-- INSERT INTO rh_checklist_template_iecb (empresa, setor, item, ordem, obrigatorio) VALUES
-- (1, NULL, 'Exame admissional realizado', 1, 1),
-- (1, NULL, 'Documentos pessoais entregues', 2, 1),
-- (1, NULL, 'Contrato de trabalho assinado', 3, 1),
-- (1, NULL, 'Foto 3x4 entregue', 4, 1),
-- (1, NULL, 'Dados bancários informados', 5, 1),
-- (1, NULL, 'Uniforme entregue', 6, 0),
-- (1, NULL, 'Crachá confeccionado', 7, 0),
-- (1, NULL, 'Acesso ao sistema liberado', 8, 0),
-- (1, NULL, 'Treinamento inicial agendado', 9, 1),
-- (1, NULL, 'Apresentação à equipe realizada', 10, 0);
