// routes/games.js - Rota para registrar jogos concluídos

const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const Database = require("../config/database");

// POST /api/games/complete - Registrar jogo concluído
router.post("/complete", async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  const { 
    gameMode, 
    level, 
    score, 
    timeSeconds, 
    completed = true,
    player1Score = null,
    player2Score = null
  } = req.body;
  
  try {
    console.log(`Registrando jogo concluído para usuário ID: ${req.user.userId}`);
    
    // Inserir o jogo na tabela Games
    await Database.query(`
      INSERT INTO Games (
        UserID,
        GameMode,
        Level,
        Score,
        TimeSeconds,
        Completed,
        Player1Score,
        Player2Score,
        CreatedAt
      )
      VALUES (
        @userId,
        @gameMode,
        @level,
        @score,
        @timeSeconds,
        @completed,
        @player1Score,
        @player2Score,
        GETDATE()
      )
    `, {
      userId: req.user.userId,
      gameMode,
      level,
      score,
      timeSeconds,
      completed: completed ? 1 : 0,
      player1Score,
      player2Score
    });
    
    // Atualizar estatísticas na tabela UserStatistics2
    await Database.query(`
      IF EXISTS (SELECT 1 FROM UserStatistics2 WHERE UserID = @userId)
      BEGIN
        UPDATE UserStatistics2
        SET
          TotalGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND Completed = 1),
          IndividualGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND Completed = 1),
          CooperativeGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND Completed = 1),
          AverageScore = (SELECT AVG(CAST(Score as FLOAT)) FROM Games WHERE UserID = @userId AND Completed = 1),
          BestTimeIndividual = (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND TimeSeconds > 0 AND Completed = 1),
          BestTimeCooperative = (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND TimeSeconds > 0 AND Completed = 1),
          LastUpdated = GETDATE()
        WHERE UserID = @userId
      END
      ELSE
      BEGIN
        INSERT INTO UserStatistics2 (
          UserID,
          TotalGames,
          IndividualGames,
          CooperativeGames,
          AverageScore,
          BestTimeIndividual,
          BestTimeCooperative,
          StreakCurrent,
          StreakBest,
          LastUpdated
        )
        VALUES (
          @userId,
          (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND Completed = 1),
          (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND Completed = 1),
          (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND Completed = 1),
          (SELECT AVG(CAST(Score as FLOAT)) FROM Games WHERE UserID = @userId AND Completed = 1),
          (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND TimeSeconds > 0 AND Completed = 1),
          (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND TimeSeconds > 0 AND Completed = 1),
          0,
          0,
          GETDATE()
        )
      END
    `, { userId: req.user.userId });
    
    // Também atualizar o contador de jogos totais na tabela Users
    await Database.query(`
      UPDATE Users
      SET TotalGamesPlayed = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND Completed = 1)
      WHERE UserID = @userId
    `, { userId: req.user.userId });
    
    res.json({
      success: true,
      message: "Jogo registrado com sucesso"
    });
    
  } catch (err) {
    console.error("Erro ao registrar jogo:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// GET /api/games/recent - Buscar jogos recentes do usuário
router.get("/recent", async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  try {
    const recentGames = await Database.query(`
      SELECT TOP 10
        GameID,
        GameMode,
        Level,
        Score,
        TimeSeconds,
        Player1Score,
        Player2Score,
        Completed,
        CreatedAt
      FROM Games
      WHERE UserID = @userId
      ORDER BY CreatedAt DESC
    `, { userId: req.user.userId });
    
    res.json({
      success: true,
      data: {
        games: recentGames
      }
    });
    
  } catch (err) {
    console.error("Erro ao buscar jogos recentes:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

module.exports = router;