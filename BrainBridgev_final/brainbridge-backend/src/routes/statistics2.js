const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const Database = require("../config/database");

// GET /api/statistics/:id - Buscar estatísticas de um usuário
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`Buscando estatísticas para usuário ID: ${id}`);
    
    // Buscar estatísticas detalhadas combinando várias tabelas
    const stats = await Database.query(`
      SELECT 
        us.UserID,
        us.TotalGames,
        us.IndividualGames,
        us.CooperativeGames,
        us.BestTimeIndividual,
        us.BestTimeCooperative,
        us.AverageScore,
        us.StreakBest,
        us.StreakCurrent,
        
        (SELECT COUNT(*) FROM Games g WHERE g.UserID = us.UserID AND g.Completed = 1) as CompletedGames,
        (SELECT MAX(g.Score) FROM Games g WHERE g.UserID = us.UserID) as BestScore,
        (SELECT MIN(g.TimeSeconds) FROM Games g WHERE g.UserID = us.UserID AND g.TimeSeconds > 0) as BestTime,
        
        u.IndividualLevel,
        u.IndividualHighscore,
        u.CooperativeLevel,
        u.CooperativeHighscore
      FROM 
        UserStatistics2 us
      JOIN 
        Users u ON us.UserID = u.UserID
      WHERE 
        us.UserID = @userId
    `, { userId: id });
    
    // Se nenhuma estatística for encontrada, criar uma entrada básica
    if (stats.length === 0) {
      console.log(`Nenhuma estatística encontrada para o usuário ${id}. Verificando se o usuário existe.`);
      
      // Verificar se o usuário existe
      const user = await Database.query(`
        SELECT UserID, IndividualLevel, IndividualHighscore, CooperativeLevel, CooperativeHighscore 
        FROM Users WHERE UserID = @userId
      `, { userId: id });
      
      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
      
      console.log(`Criando estatísticas básicas para o usuário ${id}.`);
      
      // Criar estatísticas básicas
      await Database.query(`
        INSERT INTO UserStatistics2 (
          UserID, 
          TotalGames, 
          IndividualGames, 
          CooperativeGames, 
          AverageScore, 
          StreakCurrent, 
          StreakBest,
          LastUpdated
        )
        VALUES (
          @userId, 
          0, 
          0, 
          0, 
          0, 
          0, 
          0,
          GETDATE()
        )
      `, { userId: id });
      
      // Buscar as estatísticas recém-criadas junto com os dados do usuário
      const newStats = await Database.query(`
        SELECT 
          us.UserID,
          us.TotalGames,
          us.IndividualGames,
          us.CooperativeGames,
          us.BestTimeIndividual,
          us.BestTimeCooperative,
          us.AverageScore,
          us.StreakBest,
          us.StreakCurrent,
          
          0 as CompletedGames,
          0 as BestScore,
          NULL as BestTime,
          
          u.IndividualLevel,
          u.IndividualHighscore,
          u.CooperativeLevel,
          u.CooperativeHighscore
        FROM 
          UserStatistics2 us
        JOIN 
          Users u ON us.UserID = u.UserID
        WHERE 
          us.UserID = @userId
      `, { userId: id });
      
      return res.json({
        success: true,
        data: newStats[0]
      });
    }
    
    // Retornar estatísticas encontradas
    res.json({
      success: true,
      data: stats[0]
    });
    
  } catch (err) {
    console.error(`Erro ao buscar estatísticas para usuário ${id}:`, err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

// GET /api/statistics - Buscar estatísticas do usuário autenticado
router.get("/", async (req, res) => {
  // Verificar se o usuário está autenticado
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado"
    });
  }
  
  try {
    const userId = req.user.userId;
    console.log(`Buscando estatísticas para usuário autenticado ID: ${userId}`);
    
    // Buscar estatísticas detalhadas combinando várias tabelas
    const stats = await Database.query(`
      SELECT 
        us.UserID,
        us.TotalGames,
        us.IndividualGames,
        us.CooperativeGames,
        us.BestTimeIndividual,
        us.BestTimeCooperative,
        us.AverageScore,
        us.StreakBest,
        us.StreakCurrent,
        
        (SELECT COUNT(*) FROM Games g WHERE g.UserID = us.UserID AND g.Completed = 1) as CompletedGames,
        (SELECT MAX(g.Score) FROM Games g WHERE g.UserID = us.UserID) as BestScore,
        (SELECT MIN(g.TimeSeconds) FROM Games g WHERE g.UserID = us.UserID AND g.TimeSeconds > 0) as BestTime,
        
        u.IndividualLevel,
        u.IndividualHighscore,
        u.CooperativeLevel,
        u.CooperativeHighscore
      FROM 
        UserStatistics2 us
      JOIN 
        Users u ON us.UserID = u.UserID
      WHERE 
        us.UserID = @userId
    `, { userId });
    
    // Se nenhuma estatística for encontrada, criar uma entrada básica
    if (stats.length === 0) {
      console.log(`Nenhuma estatística encontrada para o usuário ${userId}. Verificando se o usuário existe.`);
      
      // Verificar se o usuário existe - isso é provavelmente desnecessário para o usuário autenticado,
      // mas mantido por consistência
      const user = await Database.query(`
        SELECT UserID, IndividualLevel, IndividualHighscore, CooperativeLevel, CooperativeHighscore 
        FROM Users WHERE UserID = @userId
      `, { userId });
      
      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
      
      console.log(`Criando estatísticas básicas para o usuário ${userId}.`);
      
      // Criar estatísticas básicas
      await Database.query(`
        INSERT INTO UserStatistics2 (
          UserID, 
          TotalGames, 
          IndividualGames, 
          CooperativeGames, 
          AverageScore, 
          StreakCurrent, 
          StreakBest,
          LastUpdated
        )
        VALUES (
          @userId, 
          0, 
          0, 
          0, 
          0, 
          0, 
          0,
          GETDATE()
        )
      `, { userId });
      
      // Buscar as estatísticas recém-criadas junto com os dados do usuário
      const newStats = await Database.query(`
        SELECT 
          us.UserID,
          us.TotalGames,
          us.IndividualGames,
          us.CooperativeGames,
          us.BestTimeIndividual,
          us.BestTimeCooperative,
          us.AverageScore,
          us.StreakBest,
          us.StreakCurrent,
          
          0 as CompletedGames,
          0 as BestScore,
          NULL as BestTime,
          
          u.IndividualLevel,
          u.IndividualHighscore,
          u.CooperativeLevel,
          u.CooperativeHighscore
        FROM 
          UserStatistics2 us
        JOIN 
          Users u ON us.UserID = u.UserID
        WHERE 
          us.UserID = @userId
      `, { userId });
      
      return res.json({
        success: true,
        data: newStats[0]
      });
    }
    
    // Retornar estatísticas encontradas
    res.json({
      success: true,
      data: stats[0]
    });
    
  } catch (err) {
    console.error(`Erro ao buscar estatísticas para usuário autenticado:`, err);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: err.message
    });
  }
});

module.exports = router;