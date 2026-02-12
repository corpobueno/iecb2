-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 10/02/2026 às 15:45
-- Versão do servidor: 11.4.10-MariaDB
-- Versão do PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `blutecno_bueno`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `acompanhamento_iecb`
--

CREATE TABLE `acompanhamento_iecb` (
  `id` int(11) NOT NULL,
  `id_leads` int(11) DEFAULT NULL,
  `nome` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(70) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  `data_att` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` int(4) NOT NULL DEFAULT 0,
  `data_nascimento` date NOT NULL DEFAULT '0000-00-00',
  `interesse` varchar(100) DEFAULT NULL,
  `usuario` varchar(30) DEFAULT NULL,
  `nota` varchar(150) DEFAULT NULL,
  `ativo` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `agenda_iecb`
--

CREATE TABLE `agenda_iecb` (
  `id` int(11) NOT NULL,
  `id_aula` int(11) NOT NULL,
  `data` date NOT NULL,
  `hora` time NOT NULL,
  `hora_fim` time NOT NULL,
  `status` int(4) NOT NULL DEFAULT 0,
  `valor` decimal(8,2) NOT NULL DEFAULT 0.00,
  `nota` varchar(255) DEFAULT NULL,
  `usuario` varchar(30) NOT NULL,
  `ativo` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos_iecb`
--

CREATE TABLE `alunos_iecb` (
  `id` int(11) NOT NULL,
  `id_aluno` int(11) NOT NULL,
  `id_aula` int(11) NOT NULL,
  `tipo` tinyint(1) NOT NULL DEFAULT 1,
  `status` int(4) NOT NULL DEFAULT 0,
  `valor` float NOT NULL DEFAULT 0,
  `valor_matricula` float NOT NULL DEFAULT 0,
  `data` date NOT NULL DEFAULT '0000-00-00',
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  `usuario` varchar(30) DEFAULT NULL,
  `ativo` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aulas_iecb`
--

CREATE TABLE `aulas_iecb` (
  `id` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `valor` decimal(8,2) NOT NULL,
  `qnt` int(4) NOT NULL DEFAULT 1,
  `docente` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nota` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario` varchar(30) NOT NULL,
  `data_agendado` datetime NOT NULL DEFAULT current_timestamp(),
  `ativo` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_iecb`
--

CREATE TABLE `cursos_iecb` (
  `id` int(11) NOT NULL,
  `nome` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria` varchar(11) NOT NULL DEFAULT '0',
  `status` int(4) NOT NULL DEFAULT 0,
  `valor` decimal(10,0) NOT NULL DEFAULT 0,
  `vip` float NOT NULL DEFAULT 0,
  `grupo` int(1) NOT NULL DEFAULT 0,
  `color` varchar(10) NOT NULL DEFAULT '#ccc',
  `duracao` time NOT NULL DEFAULT '06:00:00',
  `qnt` int(5) NOT NULL DEFAULT 1,
  `rateio_modelo` tinyint(1) NOT NULL DEFAULT 0,
  `ativo` int(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL,
  `login` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nome` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `color` varchar(10) NOT NULL DEFAULT '#ccc',
  `rateio` tinyint(2) NOT NULL DEFAULT 20,
  `rateio_regular` int(11) NOT NULL DEFAULT 15,
  `ativo` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pagamento_iecb`
--

CREATE TABLE `pagamento_iecb` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_aula` int(11) NOT NULL DEFAULT 0,
  `id_aluno` int(11) DEFAULT 0,
  `id_lancamentos` int(11) NOT NULL DEFAULT 0,
  `docente` varchar(32) DEFAULT NULL,
  `caixa` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `valor` float NOT NULL DEFAULT 0,
  `valor_matricula` float NOT NULL DEFAULT 0,
  `data` datetime NOT NULL DEFAULT current_timestamp(),
  `id_pagamento` int(2) DEFAULT NULL,
  `qnt` int(2) NOT NULL DEFAULT 1,
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `acompanhamento_iecb`
--
ALTER TABLE `acompanhamento_iecb`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `agenda_iecb`
--
ALTER TABLE `agenda_iecb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agenda_aula` (`id_aula`);

--
-- Índices de tabela `alunos_iecb`
--
ALTER TABLE `alunos_iecb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_acompanhamento` (`id_aluno`),
  ADD KEY `aula_aluno` (`id_aula`);

--
-- Índices de tabela `aulas_iecb`
--
ALTER TABLE `aulas_iecb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_aula` (`id_curso`),
  ADD KEY `docente` (`docente`);

--
-- Índices de tabela `cursos_iecb`
--
ALTER TABLE `cursos_iecb`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- Índices de tabela `pagamento_iecb`
--
ALTER TABLE `pagamento_iecb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_pagameto` (`id_aluno`),
  ADD KEY `caixa_pagamento` (`caixa`),
  ADD KEY `aula_pagamento` (`id_aula`),
  ADD KEY `cliente_pagamento` (`id_cliente`),
  ADD KEY `produto_pagamento` (`id_lancamentos`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `acompanhamento_iecb`
--
ALTER TABLE `acompanhamento_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `agenda_iecb`
--
ALTER TABLE `agenda_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `alunos_iecb`
--
ALTER TABLE `alunos_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `aulas_iecb`
--
ALTER TABLE `aulas_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cursos_iecb`
--
ALTER TABLE `cursos_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `docentes`
--
ALTER TABLE `docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pagamento_iecb`
--
ALTER TABLE `pagamento_iecb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agenda_iecb`
--
ALTER TABLE `agenda_iecb`
  ADD CONSTRAINT `agenda_aula` FOREIGN KEY (`id_aula`) REFERENCES `aulas_iecb` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `alunos_iecb`
--
ALTER TABLE `alunos_iecb`
  ADD CONSTRAINT `aluno_acompanhamento` FOREIGN KEY (`id_aluno`) REFERENCES `acompanhamento_iecb` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aula_aluno` FOREIGN KEY (`id_aula`) REFERENCES `aulas_iecb` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `aulas_iecb`
--
ALTER TABLE `aulas_iecb`
  ADD CONSTRAINT `docente` FOREIGN KEY (`docente`) REFERENCES `docentes` (`login`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `login_docente` FOREIGN KEY (`login`) REFERENCES `sec_users` (`login`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `pagamento_iecb`
--
ALTER TABLE `pagamento_iecb`
  ADD CONSTRAINT `aluno_pagameto` FOREIGN KEY (`id_aluno`) REFERENCES `alunos_iecb` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aula_pagamento` FOREIGN KEY (`id_aula`) REFERENCES `aulas_iecb` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `caixa_pagamento` FOREIGN KEY (`caixa`) REFERENCES `sec_users` (`login`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cliente_pagamento` FOREIGN KEY (`id_cliente`) REFERENCES `acompanhamento_iecb` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `produto_pagamento` FOREIGN KEY (`id_lancamentos`) REFERENCES `pacotes_servico` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
