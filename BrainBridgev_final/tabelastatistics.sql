USE BrainBridge;
GO

-- Tabela de Estatísticas dos Utilizadores
CREATE TABLE UserStatistics2 (
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