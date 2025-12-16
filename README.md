# BrainBridge - Jogo de Memória Acessível e Cooperativo

![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)

**BrainBridge** é um jogo de memória inovador desenvolvido com foco total em **acessibilidade web**, seguindo as diretrizes **WCAG 2.1 AA**. O projeto oferece dois modos de jogo (Individual e Cooperativo) com 8 níveis progressivos de dificuldade, sistema de autenticação, rankings e estatísticas detalhadas.

## Índice

- [Características Principais](#características-principais)
- [Acessibilidade e Conformidade WCAG](#acessibilidade-e-conformidade-wcag)
- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Jogar](#como-jogar)

---

## Características Principais

O sistema foi desenhado para ser inclusivo e desafiante, oferecendo:

* **Modo Individual:** Supere 8 níveis com dificuldade progressiva.
* **Modo Cooperativo:** Jogue com um parceiro no mesmo dispositivo, alternando turnos.
* **Sistema de Progressão:** Desbloqueio automático de níveis baseado na performance.
* **Rankings Globais:** Tabelas de classificação separadas por modo de jogo.
* **Estatísticas:** Monitorização detalhada de pontuação média, melhor tempo e total de jogos.

---

## Acessibilidade e Conformidade WCAG

Este projeto cumpre rigorosamente os princípios de acessibilidade WCAG 2.1 (Nível AA). A tabela abaixo detalha as implementações técnicas:

| Princípio | Implementação Técnica | Diretriz WCAG 2.1 |
| :--- | :--- | :--- |
| **1. Perceptível** | **Modo Daltónico e Alto Contraste** | Garante que a informação não depende apenas da cor e mantém um rácio de contraste superior a 4.5:1 (Critérios 1.4.1 e 1.4.3). |
| **2. Operável** | **Navegação por Teclado e Skip Links** | Todo o jogo é operável sem rato. "Skip Links" permitem saltar navegação repetitiva (Critérios 2.1.1 e 2.4.1). |
| **3. Compreensível** | **Labels e Feedback de Erro** | Formulários com etiquetas claras e mensagens de erro/sucesso explicativas e visíveis (Critérios 3.3.2). |
| **4. Robusto** | **ARIA Labels e HTML Semântico** | Compatibilidade total com leitores de ecrã (NVDA, VoiceOver) usando atributos ARIA corretos (Critério 4.1.2). |

---

## Arquitetura e Tecnologias

O projeto utiliza uma arquitetura moderna separada em Frontend e Backend:

### Frontend
* **React 18:** Gestão de estado e componentes reativos.
* **Tailwind CSS:** Estilização utilitária e responsiva.
* **Babel:** Transpilação de código JSX.

### Backend
* **Node.js e Express:** API RESTful para gestão de dados.
* **JWT (JSON Web Tokens):** Autenticação segura e gestão de sessões.
* **Bcrypt:** Hashing de palavras-passe.

### Base de Dados
* **Microsoft SQL Server:** Armazenamento relacional de dados.
* **MSSQL Driver:** Conector nativo para Node.js.

---

## Instalação e Configuração

### Pré-requisitos
* Node.js (v18+)
* Microsoft SQL Server (2019+)
* Git

### 1. Clonar e Instalar Dependências

```bash
# Clonar o repositório
git clone [https://github.com/Carolpm28/BrainBridge.git](https://github.com/Carolpm28/BrainBridge.git)
cd BrainBridge/BrainBridgev_final

# Instalar dependências do Backend
cd brainbridge-backend
npm install
```

### 2. Configurar Base de Dados

Execute os scripts SQL na ordem abaixo para criar a estrutura necessária:

```bash
# Criar a Base de Dados
sqlcmd -S localhost -i create-database.sql

# Criar Tabelas
sqlcmd -S localhost -d BrainBridge -i create-tables.sql

# (Opcional) Adicionar Tabela de Estatísticas
sqlcmd -S localhost -d BrainBridge -i tabelastatistics.sql
```

### 3. Variáveis de Ambiente

Crie um ficheiro `.env` na pasta `brainbridge-backend` com as seguintes configurações:

```env
PORT=3000
DB_SERVER=localhost
DB_NAME=BrainBridge
DB_USER=seu_usuario
DB_PASSWORD=sua_password
JWT_SECRET=defina_uma_chave_segura_aqui
NODE_ENV=development
```

### 4. Executar o Projeto

```bash
# Terminal 1: Iniciar o Backend
cd brainbridge-backend
npm run dev

# Terminal 2: Servir o Frontend
# Pode usar qualquer servidor HTTP ou abrir o index.html diretamente
npx http-server -p 8080
```

---

## Como Jogar

O objetivo é encontrar todos os pares de cartas. A dificuldade aumenta conforme o nível:

| Nível | Nome | Cartas | Bónus | Tempo Limite |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Iniciante | 12 | 500 | Sem Limite |
| **2** | Aprendiz | 16 | 750 | Sem Limite |
| **3** | Intermediário | 20 | 1000 | Sem Limite |
| **4** | Avançado | 24 | 1500 | Sem Limite |
| **5** | Especialista | 24 | 2000 | 3 min |
| **6** | Mestre | 24 | 3000 | 2 min |
| **7** | Grande Mestre | 24 | 5000 | 1.5 min |
| **8** | Lendário | 24 | 10000 | 1 min |

**Sistema de Pontuação:**
* **+100 pontos** por cada par correto.
* **-10 pontos** por cada erro.
* **Bónus de Tempo:** Concedido nos níveis 5 a 8 baseado no tempo restante.

---

<div align="center">

**BrainBridge** © 2025 - Jogo de memória desenvolvido seguindo as diretrizes WCAG 2.1 AA

[Voltar ao topo](#brainbridge---jogo-de-memória-acessível-e-cooperativo)

</div>
