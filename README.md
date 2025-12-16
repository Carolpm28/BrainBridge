# BrainBridge - Jogo de Memória Acessível e Cooperativo

![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)

**BrainBridge** é um jogo de memória inovador desenvolvido com foco total em **acessibilidade web**, seguindo as diretrizes **WCAG 2.1 AA**. O projeto oferece dois modos de jogo (Individual e Cooperativo) com 8 níveis progressivos de dificuldade, sistema de autenticação, rankings e estatísticas detalhadas.

### Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Acessibilidade](#acessibilidade)
- [Como Jogar](#como-jogar)
- [Testes de Acessibilidade](#testes-de-acessibilidade)
- [Recursos de Acessibilidade](#recursos-de-acessibilidade)

### Características

#### Modos de Jogo

- **Modo Individual**: Jogue sozinho e supere 8 níveis progressivos
- **Modo Cooperativo**: Jogue com um amigo e trabalhem em equipa

#### Funcionalidades Principais

- **8 Níveis de Dificuldade** com bónus progressivos
- **Sistema de Autenticação** com JWT
- **Rankings Globais** por modo de jogo
- **Estatísticas Detalhadas** (total de jogos, pontuação média, melhor tempo)
- **Configurações Personalizáveis** (som, modo daltónico)
- **Limite de Tempo** nos níveis avançados (5-8)
- **Progressão de Níveis** automática baseada em performance
- **Responsive Design** - funciona em desktop, tablet e mobile

#### Acessibilidade (WCAG 2.1 AA)

- **Skip Links** sempre visíveis (G1: WCAG 2.4.1)
- **Alto Contraste** e modo daltónico
- **Navegação por Teclado** completa
- **Suporte para Leitores de Ecrã** (ARIA labels)
- **Design Responsivo** e adaptável
- **Estrutura Semântica** HTML5
- **Foco Visível** em todos os elementos interativos

### Tecnologias Utilizadas

#### Frontend
- **React 18** (via CDN)
- **Babel** (transpilação JSX)
- **Tailwind CSS** (via CDN)
- **HTML5/CSS3**
- **JavaScript ES6+**

#### Backend
- **Node.js** (v18+)
- **Express.js** (v5.1.0)
- **JWT** (autenticação)
- **bcrypt** (hash de passwords)

#### Base de Dados
- **Microsoft SQL Server**
- **mssql** (driver Node.js)

#### Ferramentas de Desenvolvimento
- **nodemon** (desenvolvimento)
- **dotenv** (variáveis de ambiente)
- **CORS** (Cross-Origin Resource Sharing)

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **Microsoft SQL Server** (2019 ou superior) - [Download](https://www.microsoft.com/sql-server)
- **npm** (vem incluído com Node.js)
- **Git** - [Download](https://git-scm.com/)

### Instalação

#### 1. Clone o Repositório

```bash
git clone https://github.com/Carolpm28/BrainBridge.git
cd BrainBridge/BrainBridgev_final
```

#### 2. Instale as Dependências do Backend

```bash
cd brainbridge-backend
npm install
```

#### 3. Configure a Base de Dados

##### 3.1. Crie a Base de Dados

Execute o script SQL para criar a base de dados:

```bash
# No SQL Server Management Studio (SSMS) ou via sqlcmd
sqlcmd -S localhost -i create-database.sql
```

##### 3.2. Crie as Tabelas

```bash
sqlcmd -S localhost -d BrainBridge -i create-tables.sql
```

##### 3.3. (Opcional) Adicione Tabela de Estatísticas

```bash
sqlcmd -S localhost -d BrainBridge -i tabelastatistics.sql
```

### Configuração

#### 1. Configure as Variáveis de Ambiente

Crie um ficheiro `.env` na pasta `brainbridge-backend`:

```env
# Servidor
PORT=3000

# Base de Dados
DB_SERVER=localhost
DB_NAME=BrainBridge
DB_USER=seu_usuario
DB_PASSWORD=sua_password
DB_PORT=1433

# JWT
JWT_SECRET=brainbridge_super_secret_key_2025

# Ambiente
NODE_ENV=development
```

⚠️ **IMPORTANTE**: Altere `JWT_SECRET` para uma chave secreta forte em produção!

#### 2. Configuração do SQL Server

Certifique-se de que:
- O SQL Server está em execução
- A autenticação SQL está ativada
- O utilizador tem permissões na base de dados `BrainBridge`

### Como Executar

#### Modo Desenvolvimento

##### 1. Inicie o Backend

```bash
cd brainbridge-backend
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

##### 2. Abra o Frontend

Abra o ficheiro `index.html` no navegador ou use um servidor local:

```bash
# Opção 1: Abrir diretamente
open index.html

# Opção 2: Usar um servidor HTTP simples
# Na pasta BrainBridgev_final
npx http-server -p 8080
```

O jogo estará disponível em: `http://localhost:8080`

#### Modo Produção

```bash
cd brainbridge-backend
npm start
```

### Estrutura do Projeto

```
BrainBridge/
├── BrainBridgev_final/
│   ├── brainbridge-backend/          # Backend Node.js
│   │   ├── src/
│   │   │   ├── server.js             # Servidor principal
│   │   │   ├── config/
│   │   │   │   └── database.js       # Configuração da BD
│   │   │   └── routes/               # Rotas da API
│   │   │       ├── games.js
│   │   │       ├── profile.js
│   │   │       ├── rankings.js
│   │   │       └── statistics2.js
│   │   ├── package.json
│   │   └── .env                      # Variáveis de ambiente
│   │
│   ├── index.html                    # Frontend principal
│   ├── script.js                     # Lógica React do jogo
│   ├── styles.css                    # Estilos personalizados
│   │
│   ├── create-database.sql           # Script criação BD
│   ├── create-tables.sql             # Script criação tabelas
│   └── tabelastatistics.sql          # Script estatísticas
│
├── IPC_DESAFIO_3_FASE_3.pdf         # Documentação do desafio
└── README.md                         # Este ficheiro
```

### Acessibilidade

O BrainBridge foi desenvolvido seguindo rigorosamente as **Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1)** nível **AA**.

#### Conformidade WCAG 2.1

##### Princípio 1: Perceptível
- **1.3.1 Informação e Relações**: Estrutura hierárquica de cabeçalhos (H42: Using h1-h6 to identify headings)
- **1.4.1 Uso de Cor**: Modo daltónico disponível
- **1.4.3 Contraste**: Rácio mínimo de 4.5:1

##### Princípio 2: Operável
- **2.1.1 Teclado**: Totalmente navegável por teclado
- **2.4.1 Ignorar Blocos**: Skip link sempre visível (G1: Adding a link at the top of each page that goes directly to the main content area)
- **2.4.5 Múltiplas Formas**: Links relacionados e navegação alternativa
- **2.4.7 Foco Visível**: Indicadores de foco em todos os elementos

##### Princípio 3: Compreensível
- **3.1.1 Idioma da Página**: `lang="pt-PT"`
- **3.2.1 Em Foco**: Sem mudanças de contexto inesperadas
- **3.3.2 Etiquetas**: Labels descritivos em formulários

##### Princípio 4: Robusto
- **4.1.2 Nome, Função, Valor**: ARIA labels apropriados
- **4.1.3 Mensagens de Estado**: `role="status"`, `aria-live`

#### Recursos de Acessibilidade

- **Atalhos de Teclado**
- **Feedback Sonoro** (pode ser desativado)
- **Modo Daltónico**
- **Anúncios para Leitores de Ecrã**
- **Foco Visível** com contornos de alto contraste

### Como Jogar

#### Modo Individual

1. **Registe-se** ou **faça login**
2. Selecione **"Modo Individual"**
3. Escolha o **nível** (começa no 1)
4. **Encontre os pares** de cartas idênticas
5. **Complete o nível** para avançar automaticamente
6. Níveis 5-8 têm **limite de tempo**!

#### Modo Cooperativo

1. Selecione **"Modo Cooperativo"**
2. **Dois jogadores** alternam turnos
3. Cada jogador tenta encontrar pares
4. Quem encontrar **mais pares vence**!

#### Pontuação

- **Par correto**: +100 pontos
- **Bónus de nível**: varia por nível (500-10000)
- **Bónus de tempo**: nos níveis com limite
- **Penalização**: -10 por erro

#### Níveis

| Nível | Nome | Cartas | Bónus | Tempo Limite |
|-------|------|--------|-------|--------------|
| 1 | Iniciante | 12 | 500 | Sem limite |
| 2 | Aprendiz | 16 | 750 | Sem limite |
| 3 | Intermediário | 20 | 1000 | Sem limite |
| 4 | Avançado | 24 | 1500 | Sem limite |
| 5 | Especialista | 24 | 2000 | 3 minutos |
| 6 | Mestre | 24 | 3000 | 2 minutos |
| 7 | Grande Mestre | 24 | 5000 | 1.5 minutos |
| 8 | Lendário | 24 | 10000 | 1 minuto |

### Testes de Acessibilidade

#### Ferramentas Recomendadas

- **[AccessMonitor](https://accessmonitor.acessibilidade.gov.pt/)** - Validador automático português
- **[WAVE WebAIM](https://wave.webaim.org/)** - Ferramenta de avaliação
- **[axe DevTools](https://www.deque.com/axe/)** - Extensão para navegador
- **[Lighthouse](https://web.dev/lighthouse/)** - Auditoria Google

#### Teste Manual

1. **Navegação por Teclado**: Use `Tab`, `Enter`, `Espaço`, setas
2. **Leitor de Ecrã**: Teste com NVDA (Windows) ou VoiceOver (Mac)
3. **Contraste**: Verifique no modo alto contraste do SO
4. **Zoom**: Teste com 200% de zoom
5. **Sem Rato**: Jogue apenas com teclado

### Recursos de Acessibilidade

#### Documentação Oficial

- [Portal da Acessibilidade PT](https://www.acessibilidade.gov.pt/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility)
- [Decreto-Lei n.º 83/2018](https://www.acessibilidade.gov.pt/decreto/)

#### Jogos Inclusivos

- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/)
- [Includification](https://www.includification.com/)
- [Accessible Games](https://accessible.games/)

<div align="center">

**BrainBridge** © 2025 - Jogo de memória desenvolvido seguindo as diretrizes WCAG 2.1 AA

[Voltar ao topo](#brainbridge---jogo-de-memória-acessível-e-cooperativo)

</div>
