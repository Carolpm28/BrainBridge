require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('./config/database');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Set para armazenar tokens invalidados
const invalidatedTokens = new Set();

// Middleware
app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain'], limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('charset', 'utf-8');

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../')));

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acesso obrigatório'
        });
    }

    // Verificar se o token foi invalidado (logout)
    if (invalidatedTokens.has(token)) {
        return res.status(401).json({
            success: false,
            message: 'Token invalidado - realize login novamente'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'brainbridge_super_secret_key_2025', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
        }
        req.user = user;
        req.token = token;
        next();
    });
};

// Inicializar a conexão com o banco de dados
Database.connect().then(() => {
    console.log('Banco de dados inicializado com sucesso!');
}).catch(err => {
    console.error('Erro ao inicializar banco de dados:', err);
});

// Rota para obter as configurações de níveis (versão simplificada)
app.get('/api/levelConfigurations', async (req, res) => {
    try {
        console.log('📚 Buscando configurações de níveis (versão simplificada)');
        
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
        res.json({
            success: true,
            message: 'Configurações de níveis',
            data: [...individualLevels, ...cooperativeLevels]
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
app.post('/api/levelConfigurations', authenticateToken, async (req, res) => {
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

// ===== ROTAS DE AUTENTICAÇÃO =====

// Rota para criar um utilizador
app.post('/api/users', async (req, res) => {
    try {
        console.log('📨 Pedido POST recebido em /api/users');

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email e password são obrigatórios',
            });
        }

        const existingUser = await Database.query(
            'SELECT UserID FROM Users WHERE Email = @email',
            { email }
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email já existe na base de dados',
            });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await Database.query(`
            INSERT INTO Users (Username, Email, PasswordHash, Salt)
            OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.Email, INSERTED.CreatedAt
            VALUES (@username, @email, @passwordHash, @salt)
        `, {
            username,
            email,
            passwordHash,
            salt
        });

        const newUser = result[0];

        // Inserir estatísticas iniciais
        await Database.query(`
            INSERT INTO UserStatistics2 (
                UserID, 
                TotalGames, 
                IndividualGames, 
                CooperativeGames, 
                AverageScore, 
                StreakCurrent, 
                StreakBest
            )
            VALUES (
                @userId, 
                0, 
                0, 
                0, 
                0, 
                0, 
                0
            )
        `, { userId: newUser.UserID });

        // Buscar estatísticas completas
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
        us.LastUpdated,
        us.BestScore,
        us.TotalPairs,
        us.TotalMoves,
        
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
`, { userId: newUser.UserID });
        return res.status(201).json({
            success: true,
            message: 'Utilizador criado com sucesso!',
            data: {
                userId: newStats[0].UserID,
                username: newUser.Username,
                email: newUser.Email,
                createdAt: newUser.CreatedAt,
                statistics2: newStats[0]
            }
        });

    } catch (err) {
        console.error('Erro na rota POST /api/users:', err.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});


// Rota de LOGIN
app.post('/api/login', async (req, res) => {
    try {
        console.log('🔐 Pedido LOGIN recebido');

        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e password são obrigatórios'
            });
        }

        const users = await Database.query(
            'SELECT UserID, Username, Email, PasswordHash, Salt FROM Users WHERE Email = @email',
            { email }
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email ou password incorretos',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou password incorretos',
                error: 'INVALID_CREDENTIALS'
            });
        }

        await Database.query(
            'UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @userId',
            { userId: user.UserID }
        );

        const userProfile = await Database.query(`
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                u.LastLogin,
                u.IndividualLevel,
                u.IndividualHighscore,
                u.CooperativeLevel,
                u.CooperativeHighscore,
                u.TotalGamesPlayed
            FROM Users u 
            WHERE u.UserID = @userId
        `, { userId: user.UserID });

        const userData = userProfile[0];

        const tokenPayload = {
            userId: userData.UserID,
            email: userData.Email,
            username: userData.Username
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'brainbridge_super_secret_key_2025',
            { expiresIn: '24h' }
        );

        console.log('✅ Login bem-sucedido para:', userData.Email);

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            data: {
                token,
                user: {
                    userId: userData.UserID,
                    username: userData.Username,
                    email: userData.Email,
                    lastLogin: userData.LastLogin,
                    individualLevel: userData.IndividualLevel,
                    individualHighscore: userData.IndividualHighscore,
                    cooperativeLevel: userData.CooperativeLevel,
                    cooperativeHighscore: userData.CooperativeHighscore,
                    totalGamesPlayed: userData.TotalGamesPlayed
                }
            }
        });

    } catch (err) {
        console.error('Erro na rota POST /api/login:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota de LOGOUT
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        console.log('🔐 Pedido LOGOUT recebido');

        invalidatedTokens.add(req.token);

        await Database.query(`
            INSERT INTO ActivityLog (UserID, ActivityType, ActivityData)
            VALUES (@userId, 'LOGOUT', @activityData)
        `, {
            userId: req.user.userId,
            activityData: JSON.stringify({
                timestamp: new Date().toISOString(),
                ip: req.ip
            })
        });

        console.log('✅ Logout realizado para:', req.user.email);

        res.json({
            success: true,
            message: 'Logout realizado com sucesso!'
        });

    } catch (err) {
        console.error('Erro na rota POST /api/logout:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota GET para obter dados do utilizador logado
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const userProfile = await Database.query(`
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                u.CreatedAt,
                u.LastLogin,
                u.IndividualLevel,
                u.IndividualHighscore,
                u.CooperativeLevel,
                u.CooperativeHighscore,
                u.TotalGamesPlayed,
                u.SoundEnabled,
                u.ColorBlindMode
            FROM Users u 
            WHERE u.UserID = @userId
        `, { userId: req.user.userId });

        if (userProfile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilizador não encontrado'
            });
        }

        const user = userProfile[0];

        res.json({
            success: true,
            message: 'Dados do utilizador',
            data: {
                userId: user.UserID,
                username: user.Username,
                email: user.Email,
                createdAt: user.CreatedAt,
                lastLogin: user.LastLogin,
                individualLevel: user.IndividualLevel,
                individualHighscore: user.IndividualHighscore,
                cooperativeLevel: user.CooperativeLevel,
                cooperativeHighscore: user.CooperativeHighscore,
                totalGamesPlayed: user.TotalGamesPlayed,
                settings: {
                    soundEnabled: user.SoundEnabled,
                    colorBlindMode: user.ColorBlindMode
                }
            }
        });
    } catch (err) {
        console.error('Erro ao buscar dados do utilizador:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para verificar status do token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        data: {
            userId: req.user.userId,
            username: req.user.username,
            email: req.user.email
        }
    });
});

// ===== ROTAS DE JOGOS =====

// 1. Iniciar um novo jogo
app.post('/api/games/start', authenticateToken, async (req, res) => {
    try {
        console.log('🎮 Iniciar novo jogo');
        console.log('Body:', req.body);

        const { gameMode, level } = req.body;

        // Validação
        if (!gameMode || !level) {
            return res.status(400).json({
                success: false,
                message: 'gameMode e level são obrigatórios',
                fields: {
                    gameMode: !gameMode ? 'obrigatório (individual/cooperative)' : 'ok',
                    level: !level ? 'obrigatório' : 'ok'
                }
            });
        }

        // Gerar ID único para a sessão do jogo
        const gameSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

        // Chamar a stored procedure
        const result = await Database.query(`
            EXEC StartGame @userId, @gameMode, @level, @gameSessionId
        `, {
            userId: req.user.userId,
            gameMode,
            level,
            gameSessionId
        });

        if (!result || result.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Falha ao iniciar jogo'
            });
        }

        const config = result[0];

        res.json({
            success: true,
            message: 'Jogo iniciado!',
            data: {
                gameSessionId,
                gameMode,
                level,
                levelConfig: {
                    name: config.Name,
                    cards: config.Cards,
                    bonus: config.Bonus,
                    timeLimit: config.TimeLimit,
                    hasTimeLimit: config.HasTimeLimit === 1
                },
                startTime: config.StartTime
            }
        });

    } catch (err) {
        console.error('Erro ao iniciar jogo:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// 2. Finalizar jogo
app.post('/api/games/finish', authenticateToken, async (req, res) => {
    try {
        console.log('🏁 Finalizando jogo');
        console.log('Body:', req.body);

        const { 
            gameMode, 
            level, 
            score, 
            timeSeconds, 
            startTime,   // Tempo de início opcional
            gameSessionId,
            completed = true,
            player1Score,
            player2Score,
            winner
        } = req.body;

        // Validação
        if (!gameMode || !level || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'gameMode, level e score são obrigatórios'
            });
        }

        // Calcular tempo se não for fornecido diretamente
        let actualTimeSeconds = timeSeconds;
        if (actualTimeSeconds === undefined && startTime) {
            const gameStartTime = new Date(startTime);
            const endTime = new Date();
            actualTimeSeconds = Math.round((endTime - gameStartTime) / 1000);
        }

        // Valor padrão para tempo
        if (actualTimeSeconds === undefined) {
            actualTimeSeconds = 0;
        }

        // Chamar a stored procedure
        const result = await Database.query(`
            EXEC FinishGame 
                @userId, @gameMode, @level, @score, @timeSeconds, 
                @completed, @player1Score, @player2Score, @winner, @gameSessionId
        `, {
            userId: req.user.userId,
            gameMode,
            level,
            score,
            timeSeconds: actualTimeSeconds,
            completed: completed ? 1 : 0,
            player1Score: player1Score || null,
            player2Score: player2Score || null,
            winner: winner || null,
            gameSessionId
        });

        if (!result || result.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Falha ao finalizar jogo'
            });
        }

        const gameResult = result[0];
        const timeExceeded = gameResult.TimeExceeded === 1;

        res.json({
            success: true,
            message: timeExceeded ? 'Jogo finalizado, tempo excedido!' : 'Jogo salvo com sucesso!',
            data: {
                gameId: gameResult.GameID,
                gameMode: gameResult.GameMode,
                level: gameResult.Level,
                score: gameResult.Score,
                timeSeconds: gameResult.TimeSeconds,
                completed: gameResult.Completed === 1,
                timeExceeded,
                levelBonus: gameResult.LevelBonus,
                playedAt: gameResult.PlayedAt
            }
        });

    } catch (err) {
        console.error('Erro ao salvar jogo:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// 3. Listar jogos do utilizador
app.get('/api/games', authenticateToken, async (req, res) => {
    try {
        const { gameMode, limit = 10, offset = 0 } = req.query;

        let query = `
            SELECT 
                GameID,
                GameMode,
                Level,
                Score,
                TimeSeconds,
                Completed,
                Player1Score,
                Player2Score,
                Winner,
                LevelBonus,
                PlayedAt
            FROM Games 
            WHERE UserID = @userId
        `;

        const params = { userId: req.user.userId };

        if (gameMode) {
            query += ' AND GameMode = @gameMode';
            params.gameMode = gameMode;
        }

        query += ' ORDER BY PlayedAt DESC';
        query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        
        params.offset = parseInt(offset);
        params.limit = parseInt(limit);

        const games = await Database.query(query, params);

        // Contar total de jogos
        let countQuery = 'SELECT COUNT(*) as Total FROM Games WHERE UserID = @userId';
        const countParams = { userId: req.user.userId };

        if (gameMode) {
            countQuery += ' AND GameMode = @gameMode';
            countParams.gameMode = gameMode;
        }

        const countResult = await Database.query(countQuery, countParams);
        const total = countResult[0].Total;

        res.json({
            success: true,
            message: 'Jogos encontrados',
            data: {
                games,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < total
                }
            }
        });

    } catch (err) {
        console.error('Erro ao buscar jogos:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// 4. Obter estatísticas detalhadas
app.get('/api/games/statistics2', authenticateToken, async (req, res) => {
    try {
        // Estatísticas gerais
        const generalStats = await Database.query(`
            SELECT 
                COUNT(*) as TotalGames,
                SUM(CASE WHEN GameMode = 'individual' THEN 1 ELSE 0 END) as IndividualGames,
                SUM(CASE WHEN GameMode = 'cooperative' THEN 1 ELSE 0 END) as CooperativeGames,
                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) as CompletedGames,
                AVG(CAST(Score as FLOAT)) as AverageScore,
                MAX(Score) as BestScore,
                MIN(TimeSeconds) as BestTime,
                AVG(CAST(TimeSeconds as FLOAT)) as AverageTime
            FROM Games 
            WHERE UserID = @userId
        `, { userId: req.user.userId });

        // Progresso por nível (individual)
        const individualProgress = await Database.query(`
            SELECT 
                Level,
                COUNT(*) as GamesPlayed,
                MAX(Score) as BestScore,
                MIN(TimeSeconds) as BestTime,
                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) as CompletedGames
            FROM Games 
            WHERE UserID = @userId AND GameMode = 'individual'
            GROUP BY Level
            ORDER BY Level
        `, { userId: req.user.userId });

        // Progresso por nível (cooperativo)
        const cooperativeProgress = await Database.query(`
            SELECT 
                Level,
                COUNT(*) as GamesPlayed,
                MAX(Score) as BestScore,
                MIN(TimeSeconds) as BestTime,
                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) as CompletedGames
            FROM Games 
            WHERE UserID = @userId AND GameMode = 'cooperative'
            GROUP BY Level
            ORDER BY Level
        `, { userId: req.user.userId });

        // Jogos recentes (últimos 7 dias)
        const recentActivity = await Database.query(`
            SELECT 
                CAST(PlayedAt as DATE) as GameDate,
                COUNT(*) as GamesCount
            FROM Games 
            WHERE UserID = @userId 
                AND PlayedAt >= DATEADD(day, -7, GETDATE())
            GROUP BY CAST(PlayedAt as DATE)
            ORDER BY GameDate DESC
        `, { userId: req.user.userId });

        res.json({
            success: true,
            message: 'Estatísticas obtidas',
            data: {
                general: generalStats[0],
                progressByLevel: {
                    individual: individualProgress,
                    cooperative: cooperativeProgress
                },
                recentActivity,
                summary: {
                    totalGames: generalStats[0].TotalGames,
                    averageScore: Math.round(generalStats[0].AverageScore || 0),
                    bestScore: generalStats[0].BestScore || 0,
                    completionRate: generalStats[0].TotalGames > 0 
                        ? Math.round((generalStats[0].CompletedGames / generalStats[0].TotalGames) * 100)
                        : 0
                }
            }
        });

    } catch (err) {
        console.error('Erro ao obter estatísticas:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// ===== ROTAS API QUE FALTAVAM =====

// Rota para perfil do usuário
app.get('/api/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const userProfile = await Database.query(`
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                u.CreatedAt,
                u.LastLogin,
                u.IndividualLevel,
                u.IndividualHighscore,
                u.CooperativeLevel,
                u.CooperativeHighscore,
                u.TotalGamesPlayed
            FROM Users u 
            WHERE u.UserID = @userId
        `, { userId: id });

        if (userProfile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfil não encontrado'
            });
        }

        const user = userProfile[0];

        res.json(user); // Retorna o perfil do usuário
    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para estatísticas do usuário
app.get('/api/statistics2', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Database.query(`
            SELECT 
                us.UserID,
                us.TotalGames,
                us.BestScore,
                us.AverageScore,
                us.BestTimeIndividual,
                us.BestTimeCooperative,
                us.StreakCurrent,
                us.StreakBest,
                us.TotalPairs,
                us.TotalMoves
            FROM UserStatistics2 us
            WHERE us.UserID = @userId
        `, { userId });

        if (stats.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estatísticas não encontradas'
            });
        }

        res.json({
            success: true,
            data: {
                statistics2: stats[0]
            }
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para jogos recentes
app.get('/api/games/recent', async (req, res) => {
    try {
        const recentGames = await Database.query(`
            SELECT TOP 10
                g.GameID,
                g.UserID,
                u.Username,
                g.GameMode,
                g.Level,
                g.Score,
                g.TimeSeconds,
                g.Completed,
                g.PlayedAt
            FROM Games g
            JOIN Users u ON g.UserID = u.UserID
            ORDER BY g.PlayedAt DESC
        `);

        res.json(recentGames); // Retorna os jogos recentes
    } catch (err) {
        console.error('Erro ao buscar jogos recentes:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

app.post('/api/games/complete', authenticateToken, async (req, res) => {
    try {
        console.log('🎯 Registrando jogo concluído para atualizar estatísticas');
        
        const { 
            gameMode, 
            level, 
            score, 
            timeSeconds, 
            completed = true,
            player1Score = null,
            player2Score = null
        } = req.body;
        
        // Validação básica
        if (!gameMode || !level || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'gameMode, level e score são obrigatórios'
            });
        }
        
        console.log(`Registrando: ${gameMode} nível ${level}, pontuação ${score}, tempo ${timeSeconds}s`);
        
        // 1. Inserir o jogo na tabela Games
        const gameResult = await Database.query(`
            INSERT INTO Games (
                UserID,
                GameMode,
                Level,
                Score,
                TimeSeconds,
                Completed,
                Player1Score,
                Player2Score,
                PlayedAt
            )
            OUTPUT inserted.GameID, inserted.UserID, inserted.GameMode, inserted.Level, inserted.Score
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
            timeSeconds: timeSeconds || 0,
            completed: completed ? 1 : 0,
            player1Score,
            player2Score
        });
        
        console.log('✅ Jogo inserido na tabela Games:', gameResult[0]);
        
        // 2. Atualizar/Criar estatísticas na tabela UserStatistics2
        await Database.query(`
            IF EXISTS (SELECT 1 FROM UserStatistics2 WHERE UserID = @userId)
            BEGIN
                -- Atualizar estatísticas existentes
                UPDATE UserStatistics2
                SET
                    TotalGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND Completed = 1),
                    IndividualGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND Completed = 1),
                    CooperativeGames = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND Completed = 1),
                    AverageScore = (SELECT AVG(CAST(Score as FLOAT)) FROM Games WHERE UserID = @userId AND Completed = 1),
                    BestTimeIndividual = (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'individual' AND TimeSeconds > 0 AND Completed = 1),
                    BestTimeCooperative = (SELECT MIN(TimeSeconds) FROM Games WHERE UserID = @userId AND GameMode = 'cooperative' AND TimeSeconds > 0 AND Completed = 1),
                    BestScore = (SELECT MAX(Score) FROM Games WHERE UserID = @userId AND Completed = 1),
                    LastUpdated = GETDATE()
                WHERE UserID = @userId
                
                PRINT 'Estatísticas atualizadas para UserID: ' + CAST(@userId AS VARCHAR)
            END
            ELSE
            BEGIN
                -- Criar novas estatísticas
                INSERT INTO UserStatistics2 (
                    UserID,
                    TotalGames,
                    IndividualGames,
                    CooperativeGames,
                    AverageScore,
                    BestTimeIndividual,
                    BestTimeCooperative,
                    BestScore,
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
                    (SELECT MAX(Score) FROM Games WHERE UserID = @userId AND Completed = 1),
                    0,
                    0,
                    GETDATE()
                )
                
                PRINT 'Novas estatísticas criadas para UserID: ' + CAST(@userId AS VARCHAR)
            END
        `, { userId: req.user.userId });
        
        console.log('✅ Estatísticas na UserStatistics2 atualizadas');
        
        // 3. Atualizar o contador de jogos na tabela Users
        const updateResult = await Database.query(`
            UPDATE Users
            SET TotalGamesPlayed = (SELECT COUNT(*) FROM Games WHERE UserID = @userId AND Completed = 1)
            OUTPUT inserted.TotalGamesPlayed
            WHERE UserID = @userId
        `, { userId: req.user.userId });
        
        console.log('✅ Contador na tabela Users atualizado para:', updateResult[0]?.TotalGamesPlayed);
        
        // 4. Buscar estatísticas atualizadas para retornar
        const updatedStats = await Database.query(`
            SELECT 
                TotalGames,
                IndividualGames,
                CooperativeGames,
                AverageScore,
                BestScore
            FROM UserStatistics2
            WHERE UserID = @userId
        `, { userId: req.user.userId });
        
        res.json({
            success: true,
            message: 'Jogo registrado e estatísticas atualizadas com sucesso!',
            data: {
                gameId: gameResult[0].GameID,
                gameMode: gameResult[0].GameMode,
                level: gameResult[0].Level,
                score: gameResult[0].Score,
                updatedStats: updatedStats[0] || null
            }
        });
        
    } catch (err) {
        console.error('❌ Erro ao registrar jogo:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para ranking
app.get('/api/rankings', async (req, res) => {
    try {
        const { gameMode, limit = 10 } = req.query;
        
        let query = `
            SELECT TOP ${parseInt(limit)}
                r.RankingID,
                r.UserID,
                u.Username,
                r.GameMode,
                r.Score,
                r.Level,
                r.PlayedAt
            FROM Rankings r
            JOIN Users u ON r.UserID = u.UserID
        `;
        
        const params = {};
        
        if (gameMode) {
            query += ' WHERE r.GameMode = @gameMode';
            params.gameMode = gameMode;
        }
        
        query += ' ORDER BY r.Score DESC';
        
        const rankings = await Database.query(query, params);
        
        res.json(rankings); // Retorna os rankings
    } catch (err) {
        console.error('Erro ao buscar rankings:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para perfil do usuário autenticado
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const userProfile = await Database.query(`
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                u.CreatedAt,
                u.LastLogin,
                u.IndividualLevel,
                u.IndividualHighscore,
                u.CooperativeLevel,
                u.CooperativeHighscore,
                u.TotalGamesPlayed,
                u.SoundEnabled,
                u.ColorBlindMode
            FROM Users u 
            WHERE u.UserID = @userId
        `, { userId });

        if (userProfile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfil não encontrado'
            });
        }

        const user = userProfile[0];

        // Buscar estatísticas REAIS da tabela de jogos (corrigido)
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
        `, { userId });

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
            userId,
            totalGames: stats.TotalGames
        });

        res.json({
            success: true,
            message: 'Perfil obtido com sucesso',
            data: {
                user: {
                    userId: user.UserID,
                    username: user.Username,
                    email: user.Email,
                    createdAt: user.CreatedAt,
                    lastLogin: user.LastLogin,
                    individualLevel: user.IndividualLevel,
                    individualHighscore: user.IndividualHighscore,
                    cooperativeLevel: user.CooperativeLevel,
                    cooperativeHighscore: user.CooperativeHighscore,
                    totalGamesPlayed: stats.TotalGames, // ✅ Usar valor real da tabela Games
                    settings: {
                        soundEnabled: user.SoundEnabled,
                        colorBlindMode: user.ColorBlindMode
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
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Rota para atualizar o progresso do usuário
app.post('/api/profile/progress', authenticateToken, async (req, res) => {
    try {
        const { individualLevel, individualHighscore, cooperativeLevel, cooperativeHighscore } = req.body;
        const userId = req.user.userId;

        // Atualizar o progresso do usuário
        const result = await Database.query(`
            UPDATE Users 
            SET 
                IndividualLevel = @individualLevel,
                IndividualHighscore = @individualHighscore,
                CooperativeLevel = @cooperativeLevel,
                CooperativeHighscore = @cooperativeHighscore
            OUTPUT 
                inserted.UserID,
                inserted.IndividualLevel,
                inserted.IndividualHighscore,
                inserted.CooperativeLevel,
                inserted.CooperativeHighscore
            WHERE UserID = @userId
        `, {
            userId,
            individualLevel,
            individualHighscore,
            cooperativeLevel,
            cooperativeHighscore
        });

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Progresso atualizado com sucesso',
            data: result[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar progresso:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: err.message
        });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor BrainBridge rodando na porta ${PORT}`);
    console.log(`📡 API disponível em: http://localhost:${PORT}`);
});

module.exports = app;