// Implementação para o arquivo /routes/rankings.js

const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const Database = require("../config/database");

// GET /api/rankings - Buscar rankings globais
router.get("/", async (req, res) => {
  const { limit = 10, gameMode } = req.query;
  
  try {
    console.log("Buscando rankings globais");
    
    let query = `
      SELECT TOP @limit
        r.RankingID,
        r.UserID,
        u.Username,
        r.GameMode,
        r.Score,
        r.Level,
        r.PlayedAt,
        r.RankPosition
      FROM 
        Rankings r
      JOIN 
        Users u ON r.UserID = u.UserID
    `;
    
    const params = { limit: parseInt(limit) };
    
    // Filtrar por modo de jogo se fornecido
    if (gameMode) {
      query += ` WHERE r.GameMode = @gameMode`;
      params.gameMode = gameMode;
    }
    
    // Ordenar por pontuação
    query += ` ORDER BY r.Score DESC`;
    
    const rankings = await Database.query(query, params);
    
    res.json(rankings);
    
  } catch (err) {
    console.error("Erro ao buscar rankings:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// GET /api/rankings/user/:userId - Buscar rankings de um usuário específico
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    console.log(`Buscando rankings para usuário ID: ${userId}`);
    
    const rankings = await Database.query(`
      SELECT TOP @limit
        r.RankingID,
        r.GameMode,
        r.Score,
        r.Level,
        r.PlayedAt,
        r.RankPosition
      FROM 
        Rankings r
      WHERE 
        r.UserID = @userId
      ORDER BY 
        r.Score DESC
    `, { 
      userId,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: {
        rankings
      }
    });
    
  } catch (err) {
    console.error(`Erro ao buscar rankings para usuário ${userId}:`, err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// GET /api/rankings/mode/:gameMode - Buscar rankings para um modo específico
router.get("/mode/:gameMode", async (req, res) => {
  const { gameMode } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    console.log(`Buscando rankings para modo: ${gameMode}`);
    
    const rankings = await Database.query(`
      SELECT TOP @limit
        r.RankingID,
        r.UserID,
        u.Username,
        r.Score,
        r.Level,
        r.PlayedAt,
        r.RankPosition
      FROM 
        Rankings r
      JOIN 
        Users u ON r.UserID = u.UserID
      WHERE 
        r.GameMode = @gameMode
      ORDER BY 
        r.Score DESC
    `, { 
      gameMode,
      limit: parseInt(limit)
    });
    
    res.json(rankings);
    
  } catch (err) {
    console.error(`Erro ao buscar rankings para modo ${gameMode}:`, err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// Atualizar todas as posições nos rankings
router.post("/update-positions", async (req, res) => {
  // Esta rota é administrativa e pode precisar de autorização adicional
  try {
    console.log("Atualizando posições nos rankings");
    
    await Database.query(`
      -- Atualiza a posição (rank) de todos os registros no ranking
      WITH RankedScores AS (
        SELECT 
          RankingID,
          ROW_NUMBER() OVER (PARTITION BY GameMode ORDER BY Score DESC) AS NewRank
        FROM 
          Rankings
      )
      UPDATE r
      SET r.RankPosition = rs.NewRank
      FROM Rankings r
      JOIN RankedScores rs ON r.RankingID = rs.RankingID
    `);
    
    res.json({
      success: true,
      message: "Posições nos rankings atualizadas com sucesso"
    });
    
  } catch (err) {
    console.error("Erro ao atualizar posições nos rankings:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

module.exports = router;