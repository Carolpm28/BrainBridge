// routes/profile.js - Versão corrigida com estatísticas atualizadas

const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const Database = require("../config/database");

// GET /api/profile/:id - Buscar perfil de um usuário específico
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`Buscando perfil para usuário ID: ${id}`);
    
    const profile = await Database.query(`
      SELECT 
        UserID,
        Username,
        Email,
        CreatedAt,
        LastLogin,
        IndividualLevel,
        IndividualHighscore,
        CooperativeLevel,
        CooperativeHighscore,
        SoundEnabled,
        ColorBlindMode,
        TotalGamesPlayed
      FROM 
        Users
      WHERE 
        UserID = @userId
    `, { userId: id });
    
    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    // Buscar estatísticas atualizadas da tabela de jogos
    const gameStats = await Database.query(`
      SELECT 
        COUNT(*) as TotalGames,
        COUNT(CASE WHEN GameMode = 'individual' THEN 1 END) as IndividualGames,
        COUNT(CASE WHEN GameMode = 'cooperative' THEN 1 END) as CooperativeGames,
        AVG(CAST(Score as FLOAT)) as AverageScore,
        MAX(Score) as BestScore,
        MIN(CASE WHEN TimeSeconds > 0 THEN TimeSeconds END) as BestTime
      FROM Games 
      WHERE UserID = @userId AND Completed = 1
    `, { userId: id });
    
    // Combinar dados do perfil com estatísticas calculadas
    const userData = profile[0];
    const stats = gameStats[0] || {
      TotalGames: 0,
      IndividualGames: 0,
      CooperativeGames: 0,
      AverageScore: 0,
      BestScore: 0,
      BestTime: null
    };
    
    res.json({
      success: true,
      data: {
        user: {
          ...userData,
          totalGamesPlayed: stats.TotalGames // Atualizar com o valor real da tabela Games
        },
        statistics: {
          TotalGames: stats.TotalGames,
          IndividualGames: stats.IndividualGames,
          CooperativeGames: stats.CooperativeGames,
          AverageScore: Math.round(stats.AverageScore || 0),
          BestScore: stats.BestScore || 0,
          BestTime: stats.BestTime
        }
      }
    });
    
  } catch (err) {
    console.error(`Erro ao buscar perfil para usuário ${id}:`, err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// GET /api/profile - Buscar perfil do usuário autenticado
router.get("/", async (req, res) => {
  // Verificar se o usuário está autenticado
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  try {
    console.log(`Buscando perfil do usuário autenticado: ${req.user.userId}`);
    
    const profile = await Database.query(`
      SELECT 
        UserID,
        Username,
        Email,
        CreatedAt,
        LastLogin,
        IndividualLevel,
        IndividualHighscore,
        CooperativeLevel,
        CooperativeHighscore,
        SoundEnabled,
        ColorBlindMode,
        TotalGamesPlayed
      FROM 
        Users
      WHERE 
        UserID = @userId
    `, { userId: req.user.userId });
    
    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    // Buscar estatísticas reais da tabela de jogos
    const gameStats = await Database.query(`
      SELECT 
        COUNT(*) as TotalGames,
        COUNT(CASE WHEN GameMode = 'individual' THEN 1 END) as IndividualGames,
        COUNT(CASE WHEN GameMode = 'cooperative' THEN 1 END) as CooperativeGames,
        AVG(CAST(Score as FLOAT)) as AverageScore,
        MAX(Score) as BestScore,
        MIN(CASE WHEN TimeSeconds > 0 THEN TimeSeconds END) as BestTime
      FROM Games 
      WHERE UserID = @userId AND Completed = 1
    `, { userId: req.user.userId });
    
    const userData = profile[0];
    const stats = gameStats[0] || {
      TotalGames: 0,
      IndividualGames: 0,
      CooperativeGames: 0,
      AverageScore: 0,
      BestScore: 0,
      BestTime: null
    };
    
    // Atualizar o campo TotalGamesPlayed na tabela Users para manter consistência
    await Database.query(`
      UPDATE Users 
      SET TotalGamesPlayed = @totalGames
      WHERE UserID = @userId
    `, { 
      userId: req.user.userId,
      totalGames: stats.TotalGames
    });
    
    res.json({
      success: true,
      data: {
        user: {
          ...userData,
          totalGamesPlayed: stats.TotalGames,
          settings: {
            soundEnabled: userData.SoundEnabled,
            colorBlindMode: userData.ColorBlindMode
          }
        },
        statistics: {
          TotalGames: stats.TotalGames,
          IndividualGames: stats.IndividualGames,
          CooperativeGames: stats.CooperativeGames,
          AverageScore: Math.round(stats.AverageScore || 0),
          BestScore: stats.BestScore || 0,
          BestTime: stats.BestTime
        }
      }
    });
    
  } catch (err) {
    console.error("Erro ao buscar perfil do usuário autenticado:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// PUT /api/profile - Atualizar perfil do usuário autenticado
router.put("/", async (req, res) => {
  // Verificar se o usuário está autenticado
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  const { soundEnabled, colorBlindMode } = req.body;
  
  try {
    console.log(`Atualizando configurações para usuário ID: ${req.user.userId}`);
    
    // Permitir atualização apenas de configurações específicas
    await Database.query(`
      UPDATE Users
      SET
        SoundEnabled = CASE WHEN @soundEnabled IS NOT NULL THEN @soundEnabled ELSE SoundEnabled END,
        ColorBlindMode = CASE WHEN @colorBlindMode IS NOT NULL THEN @colorBlindMode ELSE ColorBlindMode END
      WHERE
        UserID = @userId
    `, {
      userId: req.user.userId,
      soundEnabled: soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : null,
      colorBlindMode: colorBlindMode !== undefined ? (colorBlindMode ? 1 : 0) : null
    });
    
    // Buscar perfil atualizado com estatísticas corretas
    const updatedProfile = await Database.query(`
      SELECT 
        UserID,
        Username,
        Email,
        CreatedAt,
        LastLogin,
        IndividualLevel,
        IndividualHighscore,
        CooperativeLevel,
        CooperativeHighscore,
        SoundEnabled,
        ColorBlindMode,
        TotalGamesPlayed
      FROM 
        Users
      WHERE 
        UserID = @userId
    `, { userId: req.user.userId });
    
    // Buscar estatísticas atualizadas
    const gameStats = await Database.query(`
      SELECT 
        COUNT(*) as TotalGames,
        COUNT(CASE WHEN GameMode = 'individual' THEN 1 END) as IndividualGames,
        COUNT(CASE WHEN GameMode = 'cooperative' THEN 1 END) as CooperativeGames,
        AVG(CAST(Score as FLOAT)) as AverageScore,
        MAX(Score) as BestScore,
        MIN(CASE WHEN TimeSeconds > 0 THEN TimeSeconds END) as BestTime
      FROM Games 
      WHERE UserID = @userId AND Completed = 1
    `, { userId: req.user.userId });
    
    const stats = gameStats[0] || {
      TotalGames: 0,
      IndividualGames: 0,
      CooperativeGames: 0,
      AverageScore: 0,
      BestScore: 0,
      BestTime: null
    };
    
    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: {
        user: {
          ...updatedProfile[0],
          totalGamesPlayed: stats.TotalGames,
          settings: {
            soundEnabled: updatedProfile[0].SoundEnabled,
            colorBlindMode: updatedProfile[0].ColorBlindMode
          }
        },
        statistics: {
          TotalGames: stats.TotalGames,
          IndividualGames: stats.IndividualGames,
          CooperativeGames: stats.CooperativeGames,
          AverageScore: Math.round(stats.AverageScore || 0),
          BestScore: stats.BestScore || 0,
          BestTime: stats.BestTime
        }
      }
    });
    
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// POST /api/profile/progress - Atualizar progresso do usuário
router.post("/progress", async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  const { 
    individualLevel, 
    individualHighscore, 
    cooperativeLevel, 
    cooperativeHighscore 
  } = req.body;
  
  try {
    console.log(`Atualizando progresso para usuário ID: ${req.user.userId}`);
    
    await Database.query(`
      UPDATE Users
      SET
        IndividualLevel = CASE WHEN @individualLevel IS NOT NULL THEN @individualLevel ELSE IndividualLevel END,
        IndividualHighscore = CASE WHEN @individualHighscore IS NOT NULL THEN @individualHighscore ELSE IndividualHighscore END,
        CooperativeLevel = CASE WHEN @cooperativeLevel IS NOT NULL THEN @cooperativeLevel ELSE CooperativeLevel END,
        CooperativeHighscore = CASE WHEN @cooperativeHighscore IS NOT NULL THEN @cooperativeHighscore ELSE CooperativeHighscore END
      WHERE
        UserID = @userId
    `, {
      userId: req.user.userId,
      individualLevel,
      individualHighscore,
      cooperativeLevel,
      cooperativeHighscore
    });
    
    res.json({
      success: true,
      message: "Progresso atualizado com sucesso"
    });
    
  } catch (err) {
    console.error("Erro ao atualizar progresso:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

module.exports = router;