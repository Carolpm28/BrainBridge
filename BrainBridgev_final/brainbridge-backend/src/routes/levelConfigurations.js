const express = require('express');
const router = express.Router();
const Database = require('../config/database');

// Rota para obter as configurações de níveis
router.get('/', async (req, res) => {
    try {
        console.log('📚 Buscando configurações de níveis');
        
        // Buscar as configurações de níveis do banco de dados
        const levelConfigs = await Database.query(`
            SELECT 
                LevelID,
                GameMode,
                Level,
                Name,
                Cards,
                Bonus,
                TimeLimit
            FROM LevelConfigurations
            ORDER BY GameMode, Level
        `);
        
        // Se não houver configurações, retornar as configurações padrão
        if (!levelConfigs || levelConfigs.length === 0) {
            // Configurações padrão para o modo individual
            const individualLevels = [
                { GameMode: 'individual', Level: 1, Cards: 12, Bonus: 500, Name: "Iniciante", TimeLimit: 0 },
                { GameMode: 'individual', Level: 2, Cards: 16, Bonus: 750, Name: "Aprendiz", TimeLimit: 0 },
                { GameMode: 'individual', Level: 3, Cards: 20, Bonus: 1000, Name: "Intermediário", TimeLimit: 0 },
                { GameMode: 'individual', Level: 4, Cards: 24, Bonus: 1500, Name: "Avançado", TimeLimit: 0 },
                { GameMode: 'individual', Level: 5, Cards: 24, Bonus: 2000, Name: "Especialista", TimeLimit: 180 },
                { GameMode: 'individual', Level: 6, Cards: 24, Bonus: 3000, Name: "Mestre", TimeLimit: 120 },
                { GameMode: 'individual', Level: 7, Cards: 24, Bonus: 5000, Name: "Grande Mestre", TimeLimit: 90 },
                { GameMode: 'individual', Level: 8, Cards: 24, Bonus: 10000, Name: "Lendário", TimeLimit: 60 }
            ];
            
            // Configurações padrão para o modo cooperativo
            const cooperativeLevels = [
                { GameMode: 'cooperative', Level: 1, Cards: 12, Bonus: 300, Name: "Trabalho em Equipe I", TimeLimit: 0 },
                { GameMode: 'cooperative', Level: 2, Cards: 16, Bonus: 500, Name: "Trabalho em Equipe II", TimeLimit: 0 },
                { GameMode: 'cooperative', Level: 3, Cards: 20, Bonus: 750, Name: "Cooperação Básica", TimeLimit: 0 },
                { GameMode: 'cooperative', Level: 4, Cards: 24, Bonus: 1000, Name: "Cooperação Avançada", TimeLimit: 0 },
                { GameMode: 'cooperative', Level: 5, Cards: 24, Bonus: 1500, Name: "Sincronia I", TimeLimit: 180 },
                { GameMode: 'cooperative', Level: 6, Cards: 24, Bonus: 2000, Name: "Sincronia II", TimeLimit: 120 },
                { GameMode: 'cooperative', Level: 7, Cards: 24, Bonus: 3000, Name: "Perfeita Harmonia", TimeLimit: 90 },
                { GameMode: 'cooperative', Level: 8, Cards: 24, Bonus: 5000, Name: "Mente Coletiva", TimeLimit: 60 }
            ];
            
            // Retornar as configurações padrão
            return res.json({
                success: true,
                message: 'Configurações de níveis padrão',
                data: [...individualLevels, ...cooperativeLevels]
            });
        }
        
        // Retornar as configurações encontradas no banco de dados
        res.json({
            success: true,
            message: 'Configurações de níveis encontradas',
            data: levelConfigs
        });
        
    } catch (err) {
        console.error('Erro ao buscar configurações de níveis:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para adicionar/atualizar configuração de nível
router.post('/', async (req, res) => {
    try {
        const { gameMode, level, name, cards, bonus, timeLimit } = req.body;
        
        // Validação
        if (!gameMode || !level || !name || !cards || !bonus) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios',
                fields: {
                    gameMode: !gameMode ? 'obrigatório (individual/cooperative)' : 'ok',
                    level: !level ? 'obrigatório' : 'ok',
                    name: !name ? 'obrigatório' : 'ok',
                    cards: !cards ? 'obrigatório' : 'ok',
                    bonus: !bonus ? 'obrigatório' : 'ok'
                }
            });
        }
        
        // Verificar se já existe esta configuração
        const existingConfig = await Database.query(`
            SELECT LevelID FROM LevelConfigurations 
            WHERE GameMode = @gameMode AND Level = @level
        `, { gameMode, level });
        
        let result;
        
        if (existingConfig && existingConfig.length > 0) {
            // Atualizar configuração existente
            result = await Database.query(`
                UPDATE LevelConfigurations 
                SET Name = @name, Cards = @cards, Bonus = @bonus, TimeLimit = @timeLimit
                OUTPUT inserted.*
                WHERE GameMode = @gameMode AND Level = @level
            `, { gameMode, level, name, cards, bonus, timeLimit: timeLimit || 0 });
        } else {
            // Inserir nova configuração
            result = await Database.query(`
                INSERT INTO LevelConfigurations (GameMode, Level, Name, Cards, Bonus, TimeLimit)
                OUTPUT inserted.*
                VALUES (@gameMode, @level, @name, @cards, @bonus, @timeLimit)
            `, { gameMode, level, name, cards, bonus, timeLimit: timeLimit || 0 });
        }
        
        res.json({
            success: true,
            message: existingConfig && existingConfig.length > 0 
                ? 'Configuração atualizada com sucesso' 
                : 'Configuração adicionada com sucesso',
            data: result[0]
        });
        
    } catch (err) {
        console.error('Erro ao salvar configuração de nível:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

module.exports = router;