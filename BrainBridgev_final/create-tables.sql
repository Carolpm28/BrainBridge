-- create-tables.sql - Todas as tabelas para o BrainBridge
USE BrainBridge;
GO

-- Tabela de Utilizadores
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME,
    -- Progresso Individual
    IndividualLevel INT DEFAULT 1,
    IndividualHighscore INT DEFAULT 0,
    -- Progresso Cooperativo
    CooperativeLevel INT DEFAULT 1,
    CooperativeHighscore INT DEFAULT 0,
    -- Configurações
    SoundEnabled BIT DEFAULT 1,
    ColorBlindMode BIT DEFAULT 0,
    TotalGamesPlayed INT DEFAULT 0
);
GO

-- Tabela de Jogos
CREATE TABLE Games (
    GameID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    GameMode NVARCHAR(20) NOT NULL, -- 'individual' ou 'cooperative'
    Level INT NOT NULL,
    Score INT NOT NULL,
    TimeSeconds INT NOT NULL,
    Completed BIT DEFAULT 0,
    -- Dados específicos do modo cooperativo
    Player1Score INT NULL,
    Player2Score INT NULL,
    Winner INT NULL, -- 0=empate, 1=player1, 2=player2
    LevelBonus INT DEFAULT 0,
    PlayedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Tabela de Configurações dos Níveis
CREATE TABLE LevelConfigurations (
    ConfigID INT IDENTITY(1,1) PRIMARY KEY,
    GameMode NVARCHAR(20) NOT NULL,
    Level INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Cards INT NOT NULL,
    Bonus INT NOT NULL,
    TimeLimit INT NULL, -- em segundos, NULL = sem limite
    CONSTRAINT UQ_GameMode_Level UNIQUE(GameMode, Level)
);
GO

-- Tabela de Estatísticas dos Utilizadores
CREATE TABLE UserStatistics (
    StatID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TotalGames INT DEFAULT 0,
    IndividualGames INT DEFAULT 0,
    CooperativeGames INT DEFAULT 0,
    BestTimeIndividual INT NULL,
    BestTimeCooperative INT NULL,
    AverageScore DECIMAL(10,2) DEFAULT 0,
    StreakBest INT DEFAULT 0, -- Maior sequência de vitórias
    StreakCurrent INT DEFAULT 0, -- Sequência atual
    LastUpdated DATETIME DEFAULT GETDATE(),
    BestScore INT DEFAULT 0,
    TotalPairs INT DEFAULT 0, -- Total de pares encontrados
    TotalMoves INT DEFAULT 0, -- Total de movimentos feitos
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Tabela de Rankings/Leaderboard
CREATE TABLE Rankings (
    RankingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    GameMode NVARCHAR(20) NOT NULL,
    Score INT NOT NULL,
    Level INT NOT NULL,
    PlayedAt DATETIME NOT NULL,
    RankPosition INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Tabela de Sessões (para controlo de login)
CREATE TABLE UserSessions (
    SessionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    SessionToken NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    Active BIT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Tabela de Log de Atividades
CREATE TABLE ActivityLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ActivityType NVARCHAR(50) NOT NULL, -- 'LOGIN', 'GAME_START', 'GAME_COMPLETE', etc.
    ActivityData NVARCHAR(MAX) NULL, -- JSON com dados adicionais
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Verificar se todas as tabelas foram criadas
SELECT TABLE_NAME, TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- Mostrar estrutura de cada tabela
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;