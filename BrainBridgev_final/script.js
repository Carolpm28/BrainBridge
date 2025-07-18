// script.js - Versão completa do BrainBridge usando ReactJS via CDN e Babel
const { useState, useEffect, useRef, useCallback } = React;


// Componente simplificado do BrainBridge
function BrainBridge() {
    // Estado para controlar a tela atual
    const [currentScreen, setCurrentScreen] = useState('login');
    const [gameMode, setGameMode] = useState('individual');
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [score, setScore] = useState(0);
    const [gameLevel, setGameLevel] = useState(1);
    const [cardCount, setCardCount] = useState(12);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [winner, setWinner] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [totalTime, setTotalTime] = useState(0);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    // Novo estado para o nível escolhido para jogar
    const [currentLevelToPlay, setCurrentLevelToPlay] = useState(null);
    // Adicionar estado para o volume do som
    const [soundVolume, setSoundVolume] = useState(0.3); // valor padrão 0.3
    // dentro de BrainBridge
    const [focusedCardIndex, setFocusedCardIndex] = useState(0);
    const [isGridFocused, setIsGridFocused] = useState(false);
    const [gameStartNarrated, setGameStartNarrated] = useState(false);
    
    
    // Substituir a configuração de níveis hardcoded por um estado
    const [levelConfig, setLevelConfig] = useState({
        individual: [
            { level: 1, cards: 12, bonus: 500, name: "Iniciante" },
            { level: 2, cards: 16, bonus: 750, name: "Aprendiz" },
            { level: 3, cards: 20, bonus: 1000, name: "Intermediário" },
            { level: 4, cards: 24, bonus: 1500, name: "Avançado" },
            { level: 5, cards: 24, bonus: 2000, name: "Especialista", timeLimit: 180 }, // 3 minutos
            { level: 6, cards: 24, bonus: 3000, name: "Mestre", timeLimit: 120 }, // 2 minutos
            { level: 7, cards: 24, bonus: 5000, name: "Grande Mestre", timeLimit: 90 }, // 1.5 minutos
            { level: 8, cards: 24, bonus: 10000, name: "Lendário", timeLimit: 60 }, // 1 minuto
        ],
        cooperative: [
            { level: 1, cards: 12, bonus: 300, name: "Trabalho em Equipe I" },
            { level: 2, cards: 16, bonus: 500, name: "Trabalho em Equipe II" },
            { level: 3, cards: 20, bonus: 750, name: "Cooperação Básica" },
            { level: 4, cards: 24, bonus: 1000, name: "Cooperação Avançada" },
            { level: 5, cards: 24, bonus: 1500, name: "Sincronia I", timeLimit: 180 }, // 3 minutos
            { level: 6, cards: 24, bonus: 2000, name: "Sincronia II", timeLimit: 120 }, // 2 minutos
            { level: 7, cards: 24, bonus: 3000, name: "Perfeita Harmonia", timeLimit: 90 }, // 1.5 minutos
            { level: 8, cards: 24, bonus: 5000, name: "Mente Coletiva", timeLimit: 60 }, // 1 minutos
        ]
    });
    
    // Adicionar estado para o modo daltonismo
    const [colorBlindMode, setColorBlindMode] = useState(false);
    
    // Estados para o formulário de login/registro
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Formatar data no formato pt-PT
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Função para carregar as configurações do banco de dados
    const loadLevelConfigurations = async () => {
        try {
            // Fazer a chamada à API para buscar as configurações
            const response = await fetch('http://localhost:3000/api/levelConfigurations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Organizar os dados por modo de jogo
                const individualLevels = data.data
                    .filter(config => config.GameMode === 'individual')
                    .sort((a, b) => a.Level - b.Level)
                    .map(config => ({
                        level: config.Level,
                        cards: config.Cards,
                        bonus: config.Bonus,
                        name: config.Name,
                        timeLimit: config.TimeLimit > 0 ? config.TimeLimit : undefined
                    }));
                
                const cooperativeLevels = data.data
                    .filter(config => config.GameMode === 'cooperative')
                    .sort((a, b) => a.Level - b.Level)
                    .map(config => ({
                        level: config.Level,
                        cards: config.Cards,
                        bonus: config.Bonus,
                        name: config.Name,
                        timeLimit: config.TimeLimit > 0 ? config.TimeLimit : undefined
                    }));
                
                // Atualizar o estado com as configurações carregadas
                setLevelConfig({
                    individual: individualLevels,
                    cooperative: cooperativeLevels
                });
                
                console.log("Configurações de níveis carregadas com sucesso!");
            } else {
                console.error("Erro ao carregar configurações:", data.message);
                // Usar configurações padrão em caso de erro - NÃO PRECISAMOS DEFINIR aqui porque já temos os valores padrão no useState
            }
        } catch (err) {
            console.error("Erro ao buscar configurações:", err);
            // Usar configurações padrão em caso de erro - NÃO PRECISAMOS DEFINIR aqui porque já temos os valores padrão no useState
        }
    };
    const screenReaderOnlyCSS = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    `;

    // Adicionar o CSS ao documento
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = screenReaderOnlyCSS;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);
    
    // Carregar as configurações quando o componente for montado e quando o usuário fizer login
    useEffect(() => {
        // Apenas carregar se o usuário estiver logado
        if (localStorage.getItem('token')) {
            loadLevelConfigurations();
        }
    }, []);
    
    // 1. Login - Função para lidar com o login
    const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Chamada à API de login
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token e informações do utilizador no localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userId', data.data.user.userId);
            localStorage.setItem('username', data.data.user.username);
            localStorage.setItem('email', data.data.user.email);
            
            // Definir progressos do utilizador
            setIndividualProgress({
                level: data.data.user.individualLevel || 1,
                highscore: data.data.user.individualHighscore || 0
            });
            
            setCooperativeProgress({
                level: data.data.user.cooperativeLevel || 1,
                highscore: data.data.user.cooperativeHighscore || 0
            });
            
            // Definir configurações de acessibilidade
            setSoundEnabled(data.data.user.settings?.soundEnabled !== false);
            setColorBlindMode(data.data.user.settings?.colorBlindMode === true);
            
            // Carregar configurações de níveis
            await loadLevelConfigurations();
            
            // Ir para a tela inicial
            setCurrentScreen('home');
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        alert('Erro ao conectar com o servidor');
    }
};

// 2. Registro - Função para criar nova conta
const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Chamada à API de registro
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: registerName,
                email: registerEmail,
                password: registerPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            
            // Limpar campos de registro
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPassword('');
            
            // Definir campos de login para facilitar o processo
            setLoginEmail(registerEmail);
            setLoginPassword('');
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        alert('Erro ao conectar com o servidor');
    }
};

// 3. Logout - Função para fazer logout
const handleLogout = async () => {
    try {
        // Chamar API de logout
        await fetch('http://localhost:3000/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        // Limpar dados do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        
        // Resetar estados
        setIndividualProgress({ level: 1, highscore: 0 });
        setCooperativeProgress({ level: 1, highscore: 0 });
        
        // Voltar para a tela de login
        setCurrentScreen('login');
    } catch (err) {
        console.error('Erro ao fazer logout:', err);
    }
};
// Verificação de autenticação no carregamento inicial
useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
        // Se houver token, carregar dados do usuário
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        
        if (userId && username && email) {
            // Verificar token e carregar dados atualizados
            fetch('http://localhost:3000/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Atualizar progressos
                    setIndividualProgress({
                        level: data.data.individualLevel || 1,
                        highscore: data.data.individualHighscore || 0
                    });
                    
                    setCooperativeProgress({
                        level: data.data.cooperativeLevel || 1,
                        highscore: data.data.cooperativeHighscore || 0
                    });
                    
                    // Atualizar configurações
                    setSoundEnabled(data.data.settings?.soundEnabled !== false);
                    setColorBlindMode(data.data.settings?.colorBlindMode === true);
                    
                    // Ir para a tela inicial
                    setCurrentScreen('home');
                } else {
                    // Token inválido, voltar para login
                    localStorage.removeItem('token');
                    setCurrentScreen('login');
                }
            })
            .catch(err => {
                console.error('Erro ao verificar autenticação:', err);
                localStorage.removeItem('token');
                setCurrentScreen('login');
            });
        } else {
            // Dados incompletos, voltar para login
            localStorage.removeItem('token');
            setCurrentScreen('login');
        }
    }
}, []);
    
    // Estado para manter o progresso em ambos os modos
    const [individualProgress, setIndividualProgress] = useState({ level: 1, highscore: 0 });
    const [cooperativeProgress, setCooperativeProgress] = useState({ level: 1, highscore: 0 });
    
    // Símbolos para as cartas e seus nomes para narração
    const animalSymbols = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐘', '🦒', '🦓', '🦝', '🦊', '🐮', '🐷', '🐔'];
    const animalNames = {
        '🐶': 'cão',
        '🐱': 'gato',
        '🐭': 'rato',
        '🐰': 'coelho',
        '🦊': 'raposa',
        '🐻': 'urso',
        '🐼': 'panda',
        '🐨': 'coala',
        '🦁': 'leão',
        '🐯': 'tigre',
        '🐸': 'sapo',
        '🐵': 'macaco',
        '🐘': 'elefante',
        '🦒': 'girafa',
        '🦓': 'zebra',
        '🦝': 'guaxinim',
        '🦊': 'raposa',
        '🐮': 'vaca',
        '🐷': 'porco',
        '🐔': 'galinha'
    };
    
    // Timer effect
    useEffect(() => {
        let interval;
        if (timerActive) {
            console.log('✅ Timer ATIVO - iniciando contagem'); // Debug
            interval = setInterval(() => {
                setTimer(prev => {
                    const newTimer = prev + 1;
                    console.log('Timer contando:', newTimer); // Debug - ver se conta
                    
                    // Verificar se há limite de tempo para o nível atual
                    const currentLevelConfig = getCurrentLevelConfig();
                    if (currentLevelConfig && currentLevelConfig.timeLimit && newTimer >= currentLevelConfig.timeLimit) {
                        console.log('⏰ Tempo limite atingido!'); // Debug
                        // Tempo acabou!
                        setTimerActive(false);
                        // Em ambos os modos, mostrar resultados e avançar automaticamente
                        handleGameComplete();
                    }
                    
                    return newTimer;
                });
            }, 1000);
        } else {
            console.log('❌ Timer INATIVO - não contando'); // Debug
        }
        return () => {
            if (interval) {
                console.log('🛑 Timer cleanup'); // Debug
                clearInterval(interval);
            }
        };
    }, [timerActive]);

    
    
    // Obter configuração do nível atual
    const getCurrentLevelConfig = () => {
        const currentMode = gameMode === 'cooperative' ? 'cooperative' : 'individual';
        // Usar o nível máximo atingido, a menos que estejamos em um jogo em andamento
        const currentLevel = currentScreen === 'game' ? currentLevelToPlay : 
            (gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level);
        return levelConfig[currentMode].find(config => config.level === currentLevel) || 
               levelConfig[currentMode][0]; // Fallback para o primeiro nível
    };
    
    // Formatar tempo como MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    // Gerar cartas quando o jogo começa
    useEffect(() => {
        if (currentScreen === 'game' && cards.length === 0) {
            const levelConf = getCurrentLevelConfig();
            if (levelConf && levelConf.cards) {
                setCardCount(levelConf.cards);
                generateCards(levelConf.cards);
                setTimer(0);
                // Não iniciar o timer imediatamente, esperar a primeira carta ser clicada
            }
        }
    }, [currentScreen, gameMode, levelConfig]);
    
    const speak = (text, options = {}) => {
        const utterance = new SpeechSynthesisUtterance(text);
        Object.assign(utterance, options);
        speechSynthesis.speak(utterance);
    };

    const createAnnouncer = () => {
        let announcer = document.getElementById('announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'announcer';
            announcer.className = 'sr-only';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
        }
        return announcer;
    };

    const announce = useCallback((message, priority = 'polite') => {
        const announcer = document.getElementById('announcer') || createAnnouncer();
        if (announcer) {
            // Limpar mensagem anterior
            announcer.textContent = '';
            announcer.setAttribute('aria-live', priority);
            
            // Adicionar nova mensagem após um pequeno delay
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
            
            // Limpar após 3 segundos
            setTimeout(() => {
                announcer.textContent = '';
            }, 3000);
        }
    }, []);


    const showHelp = useCallback(() => {
        let helpText = `
            Ajuda de navegação do BrainBridge:
            Use as setas do teclado para navegar entre as cartas.
            Pressione Enter ou Espaço para virar uma carta.
            Pressione H para ouvir esta ajuda novamente.
            O objetivo é encontrar todos os pares de animais iguais.
        `;
        
        if (gameMode === 'cooperative') {
            helpText += `
                Estão no modo multi-jogador com dois jogadores.
                Atualmente é a vez do Jogador ${currentPlayer}.
                Quando um jogador erra, passa a vez para o outro jogador.
                Trabalhem juntos para encontrar todos os pares!
            `;
        } else {
            helpText += `
                Estás no modo individual.
            `;
        }
        
        helpText += " Boa sorte!";
        
        announce(helpText, 'assertive');
        
        if (soundEnabled) {
            const utterance = new SpeechSynthesisUtterance(helpText);
            utterance.lang = 'pt-PT';
            utterance.rate = 0.8;
            utterance.volume = soundVolume;
            speechSynthesis.speak(utterance);
        }
    }, [announce, gameMode, soundEnabled, soundVolume, currentPlayer]);

    const announcePlayerMistakeAndTurnChange = (playerWhoMissed, nextPlayer) => {
    if (!soundEnabled) return;
    
    let message = `Jogador ${playerWhoMissed} errou! `;
    message += "As cartas não formam um par. ";
    message += `Agora é a vez do Jogador ${nextPlayer}. `;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-PT';
    utterance.volume = soundVolume;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    
    // Também anunciar para leitores de tela
    announce(message, 'assertive');
};

    const announcePlayerSuccess = (playerNumber) => {
    if (!soundEnabled) return;
    
    let message = `Excelente! Jogador ${playerNumber} encontrou um par! `;
    message += "Continua a jogar. ";
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-PT';
    utterance.volume = soundVolume;
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // Tom mais alegre
    window.speechSynthesis.speak(utterance);
    
    // Também anunciar para leitores de tela
    announce(message, 'assertive');
};



    const announceGameStart = () => {
    if (!soundEnabled) return;
    
    const levelConf = getCurrentLevelConfig();
    if (!levelConf) return;
    
    let message = `Jogo iniciado. Nível ${levelConf.level}, ${levelConf.name}. `;
    message += `${cards.length} cartas no tabuleiro. `;
    
    if (gameMode === 'cooperative') {
        message += "Modo multi-jogador ativado. ";
        message += `Jogador ${currentPlayer} começa. `;
        message += "Lembrem-se: quando errarem, passa a vez para o outro jogador. ";
        message += "Trabalhem juntos para encontrar todos os pares! ";
    }
    
    message += "Use as setas para navegar e Enter para virar cartas.";
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    utterance.volume = soundVolume;
    speechSynthesis.speak(utterance);
    
    // Também anunciar para leitores de tela
    announce(message, 'assertive');
};

    const announceCardPosition = useCallback((index) => {
        if (index < 0 || index >= cards.length) return;
        
        const card = cards[index];
        if (!card) return;
        
        const row = Math.floor(index / 4) + 1;
        const col = (index % 4) + 1;
        const status = card.matched ? 'encontrado' : card.flipped ? 'virado' : 'fechado';
        
        
        let message;
        if (card.matched || card.flipped) {
            // Carta está visível - pode revelar o animal
            const animalName = animalNames[card.type] || 'animal';
            message = `Carta ${index + 1} de ${cards.length}, linha ${row}, coluna ${col}, ${animalName}, ${status}`;
        } else {
            // Carta está fechada - NÃO revelar o animal
            message = `Carta ${index + 1} de ${cards.length}, linha ${row}, coluna ${col}, carta ${status}`;
        }
        
        // Anunciar para leitores de tela
        announce(message, 'polite');
        
        // Narração por voz se o som estiver ativado
        if (soundEnabled) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'pt-PT';
            utterance.rate = 0.9;
            utterance.volume = soundVolume;
            speechSynthesis.speak(utterance);
        }
    }, [cards, announce, soundEnabled, soundVolume]);



    // Efeito para navegação por teclado com setas
    useEffect(() => {
    const handleKeyDown = (e) => {
        if (currentScreen !== 'game' || !cards.length) return;

        const numCols = 4;
        const numRows = Math.ceil(cards.length / numCols);
        const totalCards = cards.length;
        let newIndex = focusedCardIndex;

        // Garantir que sempre há uma carta focada
        if (focusedCardIndex === -1) {
            newIndex = 0;
        } else {
            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = (focusedCardIndex + 1) % totalCards;
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = (focusedCardIndex - 1 + totalCards) % totalCards;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = focusedCardIndex + numCols;
                    if (newIndex >= totalCards) {
                        // Volta para o topo da mesma coluna
                        newIndex = focusedCardIndex % numCols;
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = focusedCardIndex - numCols;
                    if (newIndex < 0) {
                        // Vai para a linha inferior da mesma coluna
                        const col = focusedCardIndex % numCols;
                        const lastRow = Math.floor((totalCards - 1) / numCols);
                        newIndex = lastRow * numCols + col;
                        if (newIndex >= totalCards) {
                            newIndex = (lastRow - 1) * numCols + col;
                        }
                    }
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    showHelp();
                    return;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (focusedCardIndex >= 0 && focusedCardIndex < totalCards) {
                        const card = cards[focusedCardIndex];
                        if (card && !card.matched && !card.flipped && flippedCards.length < 2) {
                            handleCardClick(card.id);
                        }
                    }
                    return;
                default:
                    return;
            }
        }

        setFocusedCardIndex(newIndex);
        announceCardPosition(newIndex);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}, [focusedCardIndex, cards, currentScreen, flippedCards.length]);


    // Gerar cartas
    const generateCards = (count = 12) => {
        console.log('Gerando cartas, quantidade:', count); // Debug
        
        const cardPairs = [];
        const selectedSymbols = animalSymbols.slice(0, count / 2);
        
        console.log('Símbolos selecionados:', selectedSymbols); // Debug
        
        selectedSymbols.forEach((symbol, index) => {
            cardPairs.push({ 
                id: `${symbol}-1-${index}`, 
                type: symbol, 
                flipped: false, 
                matched: false 
            });
            cardPairs.push({ 
                id: `${symbol}-2-${index}`, 
                type: symbol, 
                flipped: false, 
                matched: false 
            });
        });
        
        // Embaralhar as cartas usando algoritmo Fisher-Yates
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }
        
        console.log('Cartas geradas:', cardPairs); // Debug
        setCards(cardPairs);
        
        // Resetar estados do jogo
        setFlippedCards([]);
        setMatchedCards([]);
        setFocusedCardIndex(0); // Focar na primeira carta
    };
    // ADICIONAR ESTE useEffect PARA DEBUG E INICIALIZAÇÃO CORRETA:
    useEffect(() => {
        console.log('Estado cards mudou:', cards.length, cards); // Debug
        
            if (currentScreen === 'game' && cards.length > 0 && !gameStartNarrated) {
            // Focar na primeira carta quando as cartas forem geradas
            setFocusedCardIndex(0);
            // Marcar como já narrado para este jogo
            setGameStartNarrated(true);
            
            // Anunciar início do jogo após um delay
            setTimeout(() => {
                const levelConf = getCurrentLevelConfig();
                if (levelConf) {
                    const message = `Jogo iniciado. Nível ${levelConf.level}, ${levelConf.name}. ${cards.length} cartas no tabuleiro. Use as setas para navegar e Enter para virar cartas.`;
                    announce(message, 'assertive');
                    
                    if (soundEnabled) {
                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.lang = 'pt-PT';
                        utterance.rate = 0.9;
                        utterance.volume = soundVolume;
                        speechSynthesis.speak(utterance);
                    }
                }
            }, 1000);
        }
    }, [cards, currentScreen, gameStartNarrated]);
    
    // Função para determinar o vencedor
    const determineWinner = (score1, score2) => {
        if (score1 > score2) {
            return 1;
        } else if (score2 > score1) {
            return 2;
        } else {
            return 0; // Empate
        }
    };
    
    // Função para reproduzir som quando encontrar um par
    const playMatchSound = () => {
        if (!soundEnabled) return;
        try {
            const audio = new Audio();
            audio.volume = soundVolume;
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA';
            audio.play().catch(e => console.log("Erro ao tocar som:", e));
        } catch (e) {
            console.error("Erro ao reproduzir som:", e);
        }
    };
    
    // Função para narrar o nome do animal
    const speakCardContent = (cardType) => {
        if (!soundEnabled) return;
        const animalName = animalNames[cardType] || cardType;
        const utterance = new SpeechSynthesisUtterance(animalName);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        window.speechSynthesis.speak(utterance);
    };

    // Função para narrar "par encontrado"
    const speakPairFound = () => {
        if (!soundEnabled) return;
        const utterance = new SpeechSynthesisUtterance("Par encontrado!");
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        window.speechSynthesis.speak(utterance);
    };
    
    // Função para narrar subida de nível
    const speakLevelUp = () => {
    if (!soundEnabled) return;
    
    const currentLevelConfig = getCurrentLevelConfig();
    let message = "Nível concluído! ";
    
    if (currentLevelConfig) {
        message += `Você completaram o nível ${currentLevelConfig.level}, ${currentLevelConfig.name}. `;
        
        if (gameMode === 'cooperative') {
            // Narração específica para modo cooperativo
            const winnerResult = determineWinner(player1Score, player2Score);
            
            if (winnerResult === 0) {
                message += "Empate! ";
                message += `Jogador 1 conseguiu ${player1Score} pontos. `;
                message += `Jogador 2 conseguiu ${player2Score} pontos. `;
                message += "Excelente trabalho em equipe! ";
            } else {
                message += `Jogador ${winnerResult} venceu! `;
                message += `Jogador 1: ${player1Score} pontos. `;
                message += `Jogador 2: ${player2Score} pontos. `;
            }
            
            const totalScore = player1Score + player2Score;
            message += `Pontuação total da equipe: ${totalScore} pontos. `;
        } else {
            message += `Sua pontuação foi ${score} pontos. `;
        }
        
        message += `Tempo total: ${formatTime(totalTime)}. `;
        
        // Adicionar informação sobre bônus
        if (currentLevelConfig.bonus) {
            message += `Vocês ganharam um bônus de ${currentLevelConfig.bonus} pontos! `;
        }
        
        // Verificar se bateu recorde
        if (gameMode === 'individual' && score > individualProgress.highscore) {
            message += "Novo recorde pessoal! ";
        } else if (gameMode === 'cooperative' && (player1Score + player2Score) > cooperativeProgress.highscore) {
            message += "Novo recorde cooperativo! ";
        }
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-PT';
    utterance.volume = soundVolume;
    utterance.rate = 0.9; // Um pouco mais lento para melhor compreensão
    window.speechSynthesis.speak(utterance);
    
    // Também anunciar para leitores de tela
    announce(message, 'assertive');
};

    useEffect(() => {
    // Anunciar mudança de jogador apenas no modo cooperativo
    if (gameMode === 'cooperative' && currentScreen === 'game' && cards.length > 0) {
        // Delay para evitar narração no início do jogo
        const timer = setTimeout(() => {
            announcePlayerTurn(currentPlayer);
        }, 500);
        
        return () => clearTimeout(timer);
    }
}, [currentPlayer, gameMode, currentScreen, cards.length]);

    const announcePlayerTurn = (playerNumber) => {
        if (!soundEnabled) return;
        
        let message = `Vez do Jogador ${playerNumber}. `;
        
        if (playerNumber === 1) {
            message += "Primeiro jogador, é sua vez de jogar. ";
        } else {
            message += "Segundo jogador, é sua vez de jogar. ";
        }
        
        message += "Use as setas para navegar e Enter para virar as cartas.";
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(message, 'assertive');
    };


    // Nova função para narrar o próximo nível
    const announceNextLevel = (nextLevelConfig) => {
        if (!soundEnabled || !nextLevelConfig) return;
        
        let message = `Preparando próximo nível: ${nextLevelConfig.name}. `;
        message += `${nextLevelConfig.cards} cartas para encontrar. `;
        
        if (nextLevelConfig.timeLimit) {
            message += `Limite de tempo: ${formatTime(nextLevelConfig.timeLimit)}. `;
        }
        
        if (gameMode === 'cooperative') {
            message += "Lembre-se: trabalhem juntos para encontrar os pares. ";
        }
        
        message += "O jogo começará em alguns segundos.";
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(message, 'assertive');
    };

    const debugGameState = () => {
        console.log('=== DEBUG ESTADO DO JOGO ===');
        console.log('currentScreen:', currentScreen);
        console.log('gameMode:', gameMode);
        console.log('currentLevelToPlay:', currentLevelToPlay);
        console.log('cards.length:', cards.length);
        console.log('levelConfig:', levelConfig);
        console.log('getCurrentLevelConfig():', getCurrentLevelConfig());
        console.log('==============================');
    };

    useEffect(() => {
        debugGameState();
    }, [currentScreen]);

    // Função para atualizar o progresso do nível
    const dispatchLevelProgressUpdate = async (newLevel) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Atualizar progresso no backend
                await fetch('http://localhost:3000/api/profile/progress', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        individualLevel: gameMode === 'individual' ? newLevel : individualProgress.level,
                        individualHighscore: individualProgress.highscore,
                        cooperativeLevel: gameMode === 'cooperative' ? newLevel : cooperativeProgress.level,
                        cooperativeHighscore: cooperativeProgress.highscore
                    })
                });

                // Atualizar estado local
                if (gameMode === 'individual') {
                    setIndividualProgress(prev => ({
                        ...prev,
                        level: Math.max(prev.level, newLevel)
                    }));
                } else {
                    setCooperativeProgress(prev => ({
                        ...prev,
                        level: Math.max(prev.level, newLevel)
                    }));
                }
            }
        } catch (err) {
            console.error('Erro ao atualizar progresso:', err);
        }
    };

    // Lidar com a conclusão do jogo
    const handleGameComplete = async () => {
        setTimerActive(false);
        setTotalTime(timer);
        
        // Pegar a configuração do nível atual
        const currentLevelConfig = getCurrentLevelConfig();
        let levelBonus = currentLevelConfig ? currentLevelConfig.bonus : 500;
        
        // Preparar dados do jogo para enviar ao backend
        const gameData = {
            gameMode: gameMode,
            level: currentLevelConfig ? currentLevelConfig.level : 1,
            score: gameMode === 'cooperative' ? (player1Score + player2Score + levelBonus) : (score + levelBonus),
            timeSeconds: timer,
            completed: true
        };
        
        // Adicionar dados específicos do modo cooperativo
        if (gameMode === 'cooperative') {
            const winnerResult = determineWinner(player1Score, player2Score);
            gameData.player1Score = player1Score + (winnerResult === 1 ? levelBonus : (winnerResult === 0 ? levelBonus/2 : 0));
            gameData.player2Score = player2Score + (winnerResult === 2 ? levelBonus : (winnerResult === 0 ? levelBonus/2 : 0));
        }
        
        // ✅ REGISTRAR O JOGO NO BACKEND - ISTO É O QUE CORRIGE AS ESTATÍSTICAS
        try {
            const token = localStorage.getItem('token');
            if (token) {
                console.log('📊 Enviando dados do jogo para o backend:', gameData);
                
                const response = await fetch('http://localhost:3000/api/games/complete', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gameData)
                });
                
                const result = await response.json();
                if (result.success) {
                    console.log('✅ Jogo registrado com sucesso! Estatísticas atualizadas:', result.data.updatedStats);
                } else {
                    console.error('❌ Erro ao registrar jogo:', result.message);
                }
            }
        } catch (err) {
            console.error('❌ Erro ao enviar dados do jogo:', err);
        }
        
        if (gameMode === 'cooperative') {
            // Determinar vencedor no modo cooperativo
            const winnerResult = determineWinner(player1Score, player2Score);
            setWinner(winnerResult);
            
            // Adicionar bônus por completar o nível
            if (winnerResult === 1) {
                setPlayer1Score(prev => prev + levelBonus);
            } else if (winnerResult === 2) {
                setPlayer2Score(prev => prev + levelBonus);
            } else {
                // No caso de empate, ambos ganham o bônus
                setPlayer1Score(prev => prev + levelBonus/2);
                setPlayer2Score(prev => prev + levelBonus/2);
            }
            
            // Atualizar highscore do modo cooperativo
            const totalScore = player1Score + player2Score + levelBonus;
            if (totalScore > cooperativeProgress.highscore) {
                setCooperativeProgress(prev => ({
                    ...prev,
                    highscore: totalScore
                }));
                
                // Atualizar highscore no backend
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        await fetch('http://localhost:3000/api/profile/progress', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                cooperativeLevel: cooperativeProgress.level,
                                cooperativeHighscore: totalScore
                            })
                        });
                    }
                } catch (err) {
                    console.error('Erro ao atualizar highscore cooperativo:', err);
                }
            }
            
            // Mostrar o modal do vencedor
            setShowWinnerModal(true);
            
            // Desbloquear próximo nível
            const nextLevel = currentLevelConfig.level + 1;
            await dispatchLevelProgressUpdate(nextLevel);
            
            // Aguardar 3 segundos antes de avançar automaticamente
            setTimeout(() => {
                setShowWinnerModal(false);
                // Avançar para o próximo nível
                setCurrentLevelToPlay(nextLevel);
                handleNextLevel();
            }, 3000);
            
        } else {
            // Para o modo individual
            // Adicionar bônus por completar o nível
            const newScore = score + levelBonus;
            setScore(newScore);
            
            // Atualizar highscore do modo individual
            if (newScore > individualProgress.highscore) {
                setIndividualProgress(prev => ({
                    ...prev,
                    highscore: newScore
                }));
                
                // Atualizar highscore no backend
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        await fetch('http://localhost:3000/api/profile/progress', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                individualLevel: individualProgress.level,
                                individualHighscore: newScore
                            })
                        });
                    }
                } catch (err) {
                    console.error('Erro ao atualizar highscore individual:', err);
                }
            }
            
            // Mostrar modal de nível concluído
            setShowLevelUpModal(true);
            speakLevelUp();
            
            // Desbloquear próximo nível
            const nextLevel = currentLevelConfig.level + 1;
            await dispatchLevelProgressUpdate(nextLevel);
            
            // Aguardar 3 segundos antes de avançar automaticamente
            setTimeout(() => {
                setShowLevelUpModal(false);
                // Avançar para o próximo nível
                setCurrentLevelToPlay(nextLevel);
                handleNextLevel();
            }, 3000);
        }
    };
    // Nova função para preparar o próximo nível
    const handleNextLevel = () => {
        console.log('Avançando para próximo nível'); // Debug
        
        // Resetar o estado do jogo
        setCards([]);
        setFlippedCards([]);
        setMatchedCards([]);
        setTimer(0);
        setCurrentPlayer(1);
        setGameStartNarrated(false);
        
        // Forçar re-render e gerar novas cartas
        setTimeout(() => {
            const nextLevelConfig = getCurrentLevelConfig();
            console.log('Configuração do próximo nível:', nextLevelConfig); // Debug
            
            if (nextLevelConfig && nextLevelConfig.cards) {
                announceNextLevel(nextLevelConfig);
                generateCards(nextLevelConfig.cards);
                setTimerActive(false);
            }
        }, 100);
    };

    // Atualizar o LevelUpModal para mostrar informações mais detalhadas
    const LevelUpModal = () => {
        const currentMode = gameMode === 'cooperative' ? 'cooperative' : 'individual';
        const currentLevel = currentLevelToPlay || (gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level);
        const levelConf = levelConfig[currentMode].find(cfg => cfg.level === currentLevel) || levelConfig[currentMode][0];
        const nextLevel = currentLevel < levelConfig[currentMode].length ? 
            levelConfig[currentMode].find(cfg => cfg.level === currentLevel + 1) :
            null;
        
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className={`${colorBlindMode ? 'bg-neutral-800' : 'bg-white'} rounded-lg p-8 max-w-md w-full mx-4 shadow-xl`}>
                    <div className="text-center">
                        <div className="mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-16 h-16 mx-auto ${colorBlindMode ? 'text-yellow-500' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${colorBlindMode ? 'text-white' : 'text-gray-900'}`}>
                            Nível {currentLevel} Concluído!
                        </h3>
                        <div className={`mb-6 ${colorBlindMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <p className="text-lg font-semibold">{levelConf.name}</p>
                            <p className="mt-2">Pontuação: {score}</p>
                            <p className="text-lg font-semibold text-green-500">Bônus: +{levelConf.bonus}</p>
                            <p>Tempo: {formatTime(totalTime)}</p>
                        </div>
                        
                        {nextLevel && (
                            <div className={`mt-4 p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                                <p className={`font-semibold ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>
                                    Próximo Nível: {nextLevel.name}
                                </p>
                                <p className={`text-sm mt-1 ${colorBlindMode ? 'text-gray-300' : 'text-blue-600'}`}>
                                    {nextLevel.cards} cartas
                                    {nextLevel.timeLimit ? ` - Limite de tempo: ${formatTime(nextLevel.timeLimit)}` : ''}
                                </p>
                            </div>
                        )}
                        
                        <p className={`mt-4 text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Avançando automaticamente em alguns segundos...
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Atualizar o WinnerModal de forma similar
    const WinnerModal = () => {
        const currentMode = gameMode === 'cooperative' ? 'cooperative' : 'individual';
        const currentLevel = currentLevelToPlay || (gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level);
        const levelConf = levelConfig[currentMode].find(cfg => cfg.level === currentLevel) || levelConfig[currentMode][0];
        const nextLevel = currentLevel < levelConfig[currentMode].length ? 
            levelConfig[currentMode].find(cfg => cfg.level === currentLevel + 1) :
            null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className={`${colorBlindMode ? 'bg-neutral-800' : 'bg-white'} rounded-lg p-8 max-w-md w-full mx-4 shadow-xl`}>
                    <div className="text-center">
                        {winner === 0 ? (
                            <div>
                                <h3 className={`text-2xl font-bold mb-4 ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>EMPATE!</h3>
                                <div className="flex justify-center space-x-8 mb-4">
                                    <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                                        <span className="font-bold">Jogador 1</span>
                                        <div className="text-2xl">{player1Score} pontos</div>
                                    </div>
                                    <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-red-50'}`}>
                                        <span className="font-bold">Jogador 2</span>
                                        <div className="text-2xl">{player2Score} pontos</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className={`text-2xl font-bold mb-4 ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>
                                    JOGADOR {winner} VENCEU!
                                </h3>
                                <div className={`text-2xl font-bold mb-4 ${winner === 1 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {winner === 1 ? player1Score : player2Score} pontos
                                </div>
                            </div>
                        )}
                        
                        <div className={`mt-4 ${colorBlindMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <p>Nível {currentLevel} Concluído!</p>
                            <p className="text-lg font-semibold text-green-500">Bônus: +{levelConf.bonus}</p>
                            <p>Tempo: {formatTime(totalTime)}</p>
                        </div>
                        
                        {nextLevel && (
                            <div className={`mt-4 p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                                <p className={`font-semibold ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>
                                    Próximo Nível: {nextLevel.name}
                                </p>
                                <p className={`text-sm mt-1 ${colorBlindMode ? 'text-gray-300' : 'text-blue-600'}`}>
                                    {nextLevel.cards} cartas
                                    {nextLevel.timeLimit ? ` - Limite de tempo: ${formatTime(nextLevel.timeLimit)}` : ''}
                                </p>
                            </div>
                        )}
                        
                        <p className={`mt-4 text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Avançando automaticamente em alguns segundos...
                        </p>
                    </div>
                </div>
            </div>
        );
    };
    
    // Lidar com clique na carta
    const handleCardClick = (cardId) => {
        // Ignorar se já tiver 2 cartas viradas
        if (flippedCards.length >= 2) return;
        
        // Encontrar a carta clicada
        const clickedCard = cards.find(card => card.id === cardId);
        
        // Ignorar se a carta já estiver virada ou já tiver sido encontrada
        if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;
        
        // Iniciar o timer se for a primeira carta virada
        if (!timerActive) {
            setTimerActive(true);
        }
        
        // Narrar o conteúdo da carta
        speakCardContent(clickedCard.type);
        
        // Virar a carta
        const updatedCards = cards.map(card =>
            card.id === cardId ? { ...card, flipped: true } : card
        );
        setCards(updatedCards);
        
        // Adicionar à lista de cartas viradas
        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);
        
        // Verificar se há um par quando duas cartas estiverem viradas
        if (newFlippedCards.length === 2) {
            const card1 = newFlippedCards[0];
            const card2 = newFlippedCards[1];
            
            // Guardar o jogador atual para pontuação
            const activePlayerNow = currentPlayer;
            
            // Verificar se as cartas formam um par
            const isMatch = card1.type === card2.type;
            
            setTimeout(() => {
                if (isMatch) {
                    // Par encontrado
                    const matchedUpdatedCards = updatedCards.map(card =>
                        (card.id === card1.id || card.id === card2.id)
                            ? { ...card, matched: true, flipped: false }
                            : card
                    );
                    setCards(matchedUpdatedCards);
                    setMatchedCards(prev => [...prev, card1.id, card2.id]);
                    setFlippedCards([]);
                    
                    // Reproduzir som de par encontrado
                    playMatchSound();
                    
                    // Narrar "par encontrado"
                    speakPairFound();
                    
                    // Aumentar pontuação para pares
                    if (gameMode === 'cooperative') {
                        if (activePlayerNow === 1) {
                            setPlayer1Score(prev => prev + 100);
                        } else {
                            setPlayer2Score(prev => prev + 100);
                        }
                    }
                    setScore(prev => prev + 100);
                    
                    // Verificar se o jogo está completo
                    if (matchedCards.length + 2 >= cards.length) {
                        setTimeout(() => {
                            setTimerActive(false);
                            handleGameComplete();
                        }, 500);
                    }
                } else {
                    // Sem par - virar as cartas de volta
                    const resetCards = updatedCards.map(card =>
                        (card.id === card1.id || card.id === card2.id)
                            ? { ...card, flipped: false }
                            : card
                    );
                    setCards(resetCards);
                    setFlippedCards([]);
                    
                    // No modo cooperativo, penalizar o jogador que falhou
                    if (gameMode === 'cooperative') {
                        // Aplicar penalidade
                        if (activePlayerNow === 1) {
                            setPlayer1Score(prev => Math.max(0, prev - 50));
                        } else {
                            setPlayer2Score(prev => Math.max(0, prev - 50));
                        }
                        // Mudar de turno
                        setCurrentPlayer(activePlayerNow === 1 ? 2 : 1);
                    }
                    
                    // Diminuir pontuação geral por erros
                    setScore(prev => Math.max(0, prev - 50));
                }
            }, 1000);
        }
    };
    
    // Fechar o modal do vencedor e ir diretamente para o próximo nível
    const handleCloseWinnerModal = () => {
        setShowWinnerModal(false);
        advanceToNextLevel(); // Avançar diretamente ao próximo nível
    };
    
    // Jogar novamente - resetar o nível atual
    const handlePlayAgain = () => {
        setShowWinnerModal(false);
        setShowLevelUpModal(false);
        
        // Resetar pontuações para o jogo cooperativo
        setPlayer1Score(0);
        setPlayer2Score(0);
        setCurrentPlayer(1);
        setScore(0);
        
        // Resetar estados do jogo
        setCards([]);
        setFlippedCards([]);
        setMatchedCards([]);
        setWinner(null);
        setTimer(0);
        setGameStartNarrated(false);

        // Iniciar um novo jogo
        setCurrentScreen('game');
    };
    
    // Reiniciar o jogo a partir do modal de estatísticas
    const handleRestartGame = () => {
        // Resetar pontuações
        setPlayer1Score(0);
        setPlayer2Score(0);
        setCurrentPlayer(1);
        setScore(0);
        
        // Resetar estados do jogo
        setCards([]);
        setFlippedCards([]);
        setMatchedCards([]);
        setWinner(null);
        setShowWinnerModal(false);
        setShowLevelUpModal(false);
        setTimer(0);
        setGameStartNarrated(false);
        
        // Iniciar um novo jogo
        setCurrentScreen('game');
    };
    
    // Tela Sobre Nós - MOVIDO PARA O LUGAR CORRETO
    const AboutScreen = () => {
        return (
            <div className="flex flex-col h-full">
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${colorBlindMode ? 'text-white' : ''}`}>SOBRE NÓS</h2>
                    
                    <div className={`w-full max-w-4xl ${colorBlindMode ? 'bg-neutral-800 text-white' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
                        <div className="text-center mb-8">
                            <h3 className={`text-xl font-bold mb-4 ${colorBlindMode ? 'text-white' : 'text-blue-700'}`}>
                                Desenvolvimento, Arte & Som
                            </h3>
                            
                            <div className="space-y-3">
                                <div className={`text-lg ${colorBlindMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Carolina Pinheiro Machado, n.º 79359, PL1
                                </div>
                                <div className={`text-lg ${colorBlindMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Leonor Teixeira Pinto, n.º 78538, PL1
                                </div>
                                <div className={`text-lg ${colorBlindMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Pedro Duarte de Fontoura Pereira, n.º 78686, PL1
                                </div>
                                <div className={`text-lg ${colorBlindMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Vítor Tiago Dias Lima, n.º 79185, PL1
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <p className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Universidade de Trás-os-Montes e Alto Douro
                                </p>
                                <p className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Licenciatura em Engenharia Informática
                                </p>
                                <p className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Interação Pessoa Computador - 2024/2025
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setCurrentScreen('home')}
                        className={`mt-8 px-8 py-3 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md hover:bg-yellow-400 transition`}
                    >
                        VOLTAR AO MENU
                    </button>
                </div>
            </div>
        );
    };

    // Componente de Carta com suporte ao modo daltonismo
    const Card = React.forwardRef(({ card, index, isFlipped, isMatched, onFlip, onFocus, isFocused }, ref) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (typeof onFlip === 'function' && !isMatched && !isFlipped) {
                onFlip(card.id);
            }
        }
    };

    const status = isMatched ? 'encontrado' : isFlipped ? 'virado' : 'fechado';
    let label;
    if (isMatched || isFlipped) {
        const animalName = animalNames[card.type] || 'animal';
        label = `Carta ${index + 1} de ${cards?.length || 12}, ${animalName}, ${status}`;
    } else {
        label = `Carta ${index + 1} de ${cards?.length || 12}, carta ${status}`;
    }

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={isFocused ? 0 : -1}
            aria-label={label}
            aria-pressed={isFlipped || isMatched}
            onClick={() => onFlip && onFlip(card.id)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus && onFocus(index)}
            className={`
                w-20 h-28 m-2 flex items-center justify-center text-3xl rounded-lg border-2 cursor-pointer
                transition-all duration-200
                ${isMatched 
                    ? 'bg-green-200 border-green-500 opacity-70 cursor-default' 
                    : isFlipped 
                        ? 'bg-yellow-200 border-yellow-500' 
                        : 'bg-blue-200 border-blue-500 hover:bg-blue-300'
                }
                ${isFocused ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
            `}
        >
            {isFlipped || isMatched ? card.type : "?"}
        </div>
    );
});

    
    // Tela de Jogo - Removido o botão "pular para próximo nível"
    const GameScreen = () => {
    const currentMode = gameMode === 'cooperative' ? 'cooperative' : 'individual';
    const currentLevel = currentLevelToPlay || (gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level);
    const levelConf = levelConfig[currentMode].find(cfg => cfg.level === currentLevel) || levelConfig[currentMode][0];
    
    return (
        <div className="flex flex-col h-full">
            {/* Elemento para anúncios de acessibilidade */}
            <div 
                id="announcer" 
                className="sr-only" 
                aria-live="polite" 
                aria-atomic="true"
            ></div>
            
            {/* Instruções para usuários de leitores de tela */}
            <div className="sr-only" role="region" aria-label="Instruções do jogo">
                Bem-vindo ao jogo da memória BrainBridge. 
                Use as setas do teclado para navegar entre as cartas.
                Pressione Enter ou Espaço para virar uma carta.
                Pressione H para ajuda.
                O objetivo é encontrar todos os pares de animais iguais.
            </div>

            {/* Modais */}
            {gameMode === 'cooperative' && showWinnerModal && winner !== null && <WinnerModal />}
            {showLevelUpModal && <LevelUpModal />}
            
            {/* Informações do nível */}
            <div className="w-full mb-4 flex justify-between">
                {/* No painel de pontuação */}
                <div 
                    className={`rounded-lg p-2 flex items-center ${colorBlindMode ? 'bg-neutral-800 text-white' : 'bg-blue-50'}`}
                    onFocus={() => handleElementFocus(`Nível ${currentLevelToPlay}: ${levelConf.name}`)}
                    tabIndex="0"
                >
                    <span className={`font-bold mr-2 ${colorBlindMode ? 'text-white' : 'text-blue-700'}`}>
                        Nível {currentLevelToPlay}:
                    </span>
                    <span className={colorBlindMode ? 'text-gray-300' : 'text-blue-600'}>
                        {levelConf.name}
                    </span>
                </div>
                
                {/* No timer */}
                <div 
                    className={`rounded-lg p-2 flex items-center font-bold ${
                        timer > levelConf.timeLimit * 0.75 
                        ? (colorBlindMode ? 'bg-yellow-500 text-black' : 'bg-red-100 text-red-700') 
                        : (colorBlindMode ? 'bg-blue-700 text-white' : 'bg-yellow-100 text-yellow-700')
                    }`}
                    role="timer"
                    aria-label={`Tempo decorrido: ${formatTime(timer)} de ${formatTime(levelConf.timeLimit)}`}
                    onFocus={() => handleElementFocus(`Tempo restante: ${formatTime(levelConf.timeLimit - timer)}`)}
                    tabIndex="0"
                >
                    Tempo: {formatTime(timer)} / {formatTime(levelConf.timeLimit)}
                </div>
            </div>
            
            {/* Container principal */}
            <div className="flex flex-row gap-8 h-full">
                {/* Grid de cartas */}
                <div className="flex-1">
                    <div 
                        className="grid grid-cols-4 gap-4 p-4 bg-opacity-50 rounded-lg border-2 border-blue-300"
                        role="grid"
                        aria-label={`Tabuleiro de jogo com ${cards.length} cartas dispostas em grade de 4 colunas`}
                        aria-rowcount={Math.ceil(cards.length / 4)}
                        aria-colcount="4"
                    >
                        {cards.map((card, index) => (
                            <div
                                key={card.id}
                                role="gridcell"
                                aria-rowindex={Math.floor(index / 4) + 1}
                                aria-colindex={(index % 4) + 1}
                            >
                                <Card
                                    card={card}
                                    index={index}
                                    isFlipped={card.flipped}
                                    isMatched={card.matched}
                                    onFlip={handleCardClick}
                                    onFocus={(cardIndex) => setFocusedCardIndex(cardIndex)}
                                    isFocused={index === focusedCardIndex}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Painel de informações */}
                <div className="w-80 p-4 flex flex-col">
                    {/* Conteúdo do painel permanece igual */}
                    {gameMode === 'cooperative' ? (
                        <div className="mb-6 text-center w-full">
                            <h3 className={`text-2xl font-bold mb-4 ${colorBlindMode ? 'text-white' : ''}`}>MODO MULTI-JOGADOR</h3>
                            <div className={`w-full p-4 mb-4 rounded-md ${
                                currentPlayer === 1
                                    ? (colorBlindMode ? 'bg-blue-700 border-2 border-white' : 'bg-blue-500 bg-opacity-20 border-2 border-blue-600')
                                    : (colorBlindMode ? 'bg-yellow-500 border-2 border-white' : 'bg-red-500 bg-opacity-20 border-2 border-red-600')
                            }`}>
                                <div className={`text-xl font-bold ${
                                    colorBlindMode ? 'text-white' : (currentPlayer === 1 ? 'text-blue-700' : 'text-red-700')
                                }`}>
                                    VEZ DO JOGADOR {currentPlayer}
                                </div>
                            </div>
                            {/* Resto do conteúdo cooperativo */}
                        </div>
                    ) : (
                        <div className="mb-6 text-center">
                            <h3 className={`text-xl font-bold mb-4 ${colorBlindMode ? 'text-white' : ''}`}>JOGO INDIVIDUAL</h3>
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-100'}`}>
                                    <div className={`text-sm font-medium ${colorBlindMode ? 'text-white' : ''}`}>Pares encontrados</div>
                                    <div className={`text-lg font-bold ${colorBlindMode ? 'text-white' : ''}`}>{matchedCards.length / 2} / {cards.length / 2}</div>
                                </div>
                                <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-100'}`}>
                                    <div className={`text-sm font-medium ${colorBlindMode ? 'text-white' : ''}`}>Pontuação</div>
                                    <div className={`text-lg font-bold ${colorBlindMode ? 'text-white' : ''}`}>{score} pontos</div>
                                </div>
                                <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-100'}`}>
                                    <div className={`text-sm font-medium ${colorBlindMode ? 'text-white' : ''}`}>Tempo</div>
                                    <div className={`text-lg font-bold ${colorBlindMode ? 'text-white' : ''}`}>{formatTime(timer)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={() => {
                            setTimerActive(false);
                            setCards([]);
                            setFlippedCards([]);
                            setMatchedCards([]);
                            setCurrentScreen('levelSelect');
                        }}
                        className={`w-full py-3 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md mt-auto`}
                    >
                        VOLTAR AO MENU DE NÍVEIS
                    </button>
                </div>
            </div>
        </div>
    );
};
    
    // Tela de Modo de Jogo
    const GameModeScreen = () => {
        return (
            <div className="flex flex-col items-center justify-center">
                <h2 className={`text-2xl md:text-3xl font-bold mb-12 text-center ${colorBlindMode ? 'text-white' : ''}`}>ESCOLHA O MODO DE JOGO</h2>
                <div className="flex flex-col md:flex-row justify-center md:space-x-6 space-y-4 md:space-y-0 mb-16">
                    <button
                        onClick={() => {
                            announceButtonAction('Modo individual selecionado');
                            setGameMode('individual');
                            setCurrentScreen('levelSelect');
                        }}
                        className={`p-6 w-48 ${colorBlindMode 
                            ? `${gameMode === 'individual' ? 'bg-blue-700 text-white border-4 border-yellow-500' : 'bg-blue-600 text-white border-4 border-neutral-400'}`
                            : `bg-blue-300 text-blue-800 ${gameMode === 'individual' ? 'border-4 border-yellow-300' : ''}`
                        } text-lg font-semibold rounded-md shadow-md hover:shadow-lg`}
                    >
                        Modo Individual
                    </button>
                    <button
                        onClick={() => {
                            announceButtonAction('Modo multi-jogador selecionado');
                            setGameMode('cooperative');
                            setCurrentScreen('levelSelect');
                        }}
                        className={`p-6 w-48 ${colorBlindMode 
                            ? `${gameMode === 'cooperative' ? 'bg-blue-700 text-white border-4 border-yellow-500' : 'bg-blue-600 text-white border-4 border-neutral-400'}`
                            : `bg-blue-300 text-blue-800 ${gameMode === 'cooperative' ? 'border-4 border-yellow-300' : ''}`
                        } text-lg font-semibold rounded-md shadow-md hover:shadow-lg`}
                    >
                        Modo Multi-Jogador
                    </button>
                </div>
                
                <div className="flex justify-center mb-8">
                    <div className={`p-4 ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-blue-100'} rounded-lg text-center`}>
                        <h3 className={`text-xl font-bold mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Tema: Animais</h3>
                        <div className="flex justify-center text-3xl mb-2">🐶 🐱 🐭 🐰 🦊 🐻</div>
                        <p className={`text-sm ${colorBlindMode ? 'text-gray-300' : ''}`}>Jogo com narrações de áudio para acessibilidade</p>
                    </div>
                </div>
                
                {/* Mostrar nível atual */}
                <div 
                    className={`mb-8 p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-yellow-100'}`}
                    onFocus={() => handleElementFocus(`Progresso ${gameMode === 'individual' ? 'individual' : 'multi-jogador'}: Nível ${gameMode === 'individual' ? individualProgress.level : cooperativeProgress.level}`)}
                    tabIndex="0"
                >
                    {gameMode === 'individual' ? (
                        <div>
                            <h3 className={`font-bold mb-2 ${colorBlindMode ? 'text-white' : 'text-yellow-800'}`}>Seu Progresso Individual:</h3>
                            <p className={colorBlindMode ? 'text-gray-300' : 'text-yellow-700'}>
                                <span className="font-semibold">Nível máximo atingido:</span> {individualProgress.level} - {
                                    levelConfig.individual.find(cfg => cfg.level === individualProgress.level)?.name || 'Iniciante'
                                }
                            </p>
                            <p className={colorBlindMode ? 'text-gray-300' : 'text-yellow-700'}>
                                <span className="font-semibold">Melhor pontuação:</span> {individualProgress.highscore}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h3 className={`font-bold mb-2 ${colorBlindMode ? 'text-white' : 'text-yellow-800'}`}>Seu Progresso Multi-Jogador:</h3>
                            <p className={colorBlindMode ? 'text-gray-300' : 'text-yellow-700'}>
                                <span className="font-semibold">Nível máximo atingido:</span> {cooperativeProgress.level} - {
                                    levelConfig.cooperative.find(cfg => cfg.level === cooperativeProgress.level)?.name || 'Trabalho em Equipe I'
                                }
                            </p>
                            <p className={colorBlindMode ? 'text-gray-300' : 'text-yellow-700'}>
                                <span className="font-semibold">Melhor pontuação:</span> {cooperativeProgress.highscore}
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Botão CONTINUAR removido */}
            </div>
        );
    };

    // Tela Inicial com modo daltonismo
    const HomeScreen = () => {
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <div className="flex flex-col items-center justify-center mb-12">
                        <div className={`w-36 h-36 mb-6 ${colorBlindMode ? 'bg-blue-700' : 'bg-blue-200'} rounded-full flex items-center justify-center shadow-lg`}>
                            <span className={`text-5xl font-bold ${colorBlindMode ? 'text-white' : ''}`}>BB</span>
                        </div>
                        <div className="text-center">
                            <h1 className={`text-4xl md:text-6xl font-bold mb-2 ${colorBlindMode ? 'text-white' : ''}`}>BrainBridge</h1>
                            <p className={`text-lg md:text-xl tracking-wider ${colorBlindMode ? 'text-gray-300' : 'text-gray-600'}`}>LIGANDO MENTES, RECOLHENDO MEMÓRIAS</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            announceButtonAction('Iniciar jogo');
                            setCurrentScreen('gameMode');
                        }}
                        className={`px-16 py-4 text-2xl ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition`}
                    >
                        START!
                    </button>
                    {/* Controlo de som e volume */}
                    <div className="flex flex-col items-center mt-8 space-y-2">
                        <button
                            onClick={() => {
                                setSoundEnabled(!soundEnabled);
                                announceSettingChange('sound', !soundEnabled);
                            }}
                            className={`px-4 py-2 rounded-md transition font-bold ${colorBlindMode ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'}`}
                        >
                            {soundEnabled ? 'Desativar Som' : 'Ativar Som'}
                        </button>
                        <div className="flex items-center space-x-2 mt-2">
                            <label htmlFor="volume-slider" className={`font-medium ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>Volume:</label>
                            <input
                                id="volume-slider"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={soundVolume}
                                onChange={e => {
                                    const newVolume = Number(e.target.value);
                                    setSoundVolume(newVolume);
                                    announceSettingChange('volume', newVolume);
                                }}
                                onFocus={() => handleElementFocus('Controle de volume')}
                                className="w-40 accent-yellow-500"
                            />
                            <span className={`text-sm ${colorBlindMode ? 'text-white' : 'text-blue-800'}`}>{Math.round(soundVolume * 100)}%</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mt-8 text-center">
                    <button
                        onClick={() => {
                            setColorBlindMode(!colorBlindMode);
                            announceSettingChange('colorBlind', !colorBlindMode);
                        }}
                        className={`px-4 py-2 rounded-md transition ${colorBlindMode ? 'bg-yellow-500 text-black' : 'bg-blue-200 text-blue-800'}`}
                    >
                        {colorBlindMode ? 'Desativar Modo Daltonismo' : 'Ativar Modo Daltonismo'}
                    </button>
                    
                    {/* BOTÃO SOBRE NÓS NO LUGAR CORRETO */}
                    <button
                        onClick={() => setCurrentScreen('about')}
                        className={`px-4 py-2 rounded-md transition ${colorBlindMode ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'}`}
                    >
                        Sobre Nós
                    </button>
                </div>
            </div>
        );
    };

    // Tela de Login/Registro baseada nas mockups
    const LoginScreen = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${colorBlindMode ? 'text-white' : ''}`}>BEM-VINDO AO BRAINBRIDGE</h2>
                <p className={`text-lg mb-8 text-center italic ${colorBlindMode ? 'text-gray-300' : 'text-gray-600'}`}>A UM PASSO DE COMEÇAR...</p>
                
                {/* Layout horizontal para os dois formulários */}
                <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 px-4">
                    {/* Formulário de Registro */}
                    <div className={`flex-1 ${colorBlindMode ? 'bg-blue-800 text-white' : 'bg-blue-100'} rounded-lg p-6 shadow-md`}>
                        <h3 className={`text-xl font-semibold mb-4 text-center ${colorBlindMode ? 'text-white' : 'text-blue-700'}`}>Registar</h3>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Nome de Utilizador" 
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                defaultValue={registerName}
                                onBlur={(e) => setRegisterName(e.target.value)}
                                onFocus={() => handleElementFocus('Campo de nome de utilizador')}
                            />
                            <input 
                                type="email" 
                                placeholder="Email" 
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                defaultValue={registerEmail}
                                onBlur={(e) => setRegisterEmail(e.target.value)}
                                onFocus={() => handleElementFocus('Campo de email')}
                            />
                            <input 
                                type="password" 
                                placeholder="Palavra-Passe" 
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                defaultValue={registerPassword}
                                onBlur={(e) => setRegisterPassword(e.target.value)}
                                onFocus={() => handleElementFocus('Campo de palavra-passe')}
                            />
                            <button 
                                onClick={() => {
                                    announceButtonAction('Tentando criar conta...');
                                    handleRegister();
                                }}
                                className={`w-full py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md hover:bg-yellow-400 transition`}
                            >
                                CRIAR CONTA!
                            </button>
                        </div>
                    </div>
                    
                    {/* Linha divisória vertical */}
                    <div className="hidden md:block w-px bg-gray-300 self-stretch"></div>
                    
                    {/* Formulário de Login */}
                    <div className={`flex-1 ${colorBlindMode ? 'bg-blue-800 text-white' : 'bg-blue-100'} rounded-lg p-6 shadow-md`}>
                        <h3 className={`text-xl font-semibold mb-4 text-center ${colorBlindMode ? 'text-white' : 'text-blue-700'}`}>Login</h3>
                        <div className="space-y-4">
                            <input 
                                type="email" 
                                placeholder="Email / Nome de Utilizador" 
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                defaultValue={loginEmail}
                                onBlur={(e) => setLoginEmail(e.target.value)}
                                onFocus={() => handleElementFocus('Campo de email')}
                            />
                            <input 
                                type="password" 
                                placeholder="Palavra-Passe" 
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                defaultValue={loginPassword}
                                onBlur={(e) => setLoginPassword(e.target.value)}
                                onFocus={() => handleElementFocus('Campo de palavra-passe')}
                            />
                            <button 
                                onClick={() => {
                                    announceButtonAction('Tentando fazer login...');
                                    handleLogin();
                                }}
                                className={`w-full py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md hover:bg-yellow-400 transition`}
                            >
                                ENTRAR!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
    
    // Tela de Estatísticas - Removido o botão "próximo nível"
    const StatsScreen = () => {
        return (
            <div className="flex flex-col items-center justify-center p-4">
                <h2 className={`text-2xl font-bold mb-8 ${colorBlindMode ? 'text-white' : ''}`}>ESTATÍSTICAS</h2>
                
                <div className="w-full max-w-3xl flex flex-col md:flex-row mb-8">
                    <div className="flex-1 space-y-4 pr-0 md:pr-8 mb-8 md:mb-0">
                        <div>
                            <label className={`block text-lg font-medium mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Nível atual</label>
                            <div className={`p-2 ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-white'} border ${colorBlindMode ? 'border-gray-600' : 'border-blue-300'} rounded-md`}>
                                {gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level} - 
                                {gameMode === 'cooperative' ? 
                                    levelConfig.cooperative.find(cfg => cfg.level === cooperativeProgress.level)?.name : 
                                    levelConfig.individual.find(cfg => cfg.level === individualProgress.level)?.name
                                }
                            </div>
                        </div>
                        
                        {gameMode === 'cooperative' ? (
                            <div>
                                <label className={`block text-lg font-medium mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Resultados</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-2 ${colorBlindMode ? 'bg-blue-700 text-white' : 'bg-blue-100'} border-2 ${winner === 1 ? (colorBlindMode ? 'border-white' : 'border-blue-500') : (colorBlindMode ? 'border-blue-500' : 'border-blue-300')} rounded-md`}>
                                        <span className={colorBlindMode ? 'text-white font-medium' : 'text-blue-800 font-medium'}>Jogador 1:</span>
                                        <span className={colorBlindMode ? 'font-bold text-white ml-2' : 'font-bold text-blue-800 ml-2'}>{player1Score} pts</span>
                                        {winner === 1 && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-2 text-yellow-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                                <path d="M4 22h16" />
                                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className={`p-2 ${colorBlindMode ? 'bg-yellow-500 text-black' : 'bg-red-100'} border-2 ${winner === 2 ? (colorBlindMode ? 'border-white' : 'border-red-500') : (colorBlindMode ? 'border-yellow-300' : 'border-red-300')} rounded-md`}>
                                        <span className={colorBlindMode ? 'text-black font-medium' : 'text-red-800 font-medium'}>Jogador 2:</span>
                                        <span className={colorBlindMode ? 'font-bold text-black ml-2' : 'font-bold text-red-800 ml-2'}>{player2Score} pts</span>
                                        {winner === 2 && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-2 text-yellow-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                                <path d="M4 22h16" />
                                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className={`block text-lg font-medium mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Pontuação</label>
                                <div className={`p-2 ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-white'} border ${colorBlindMode ? 'border-gray-600' : 'border-blue-300'} rounded-md`}>{score} pontos</div>
                            </div>
                        )}
                        
                        <div>
                            <label className={`block text-lg font-medium mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Tempo total</label>
                            <div className={`p-2 ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-white'} border ${colorBlindMode ? 'border-gray-600' : 'border-blue-300'} rounded-md`}>{formatTime(totalTime)}</div>
                        </div>
                        
                        <div>
                            <label className={`block text-lg font-medium mb-2 ${colorBlindMode ? 'text-white' : ''}`}>Melhor pontuação</label>
                            <div className={`p-2 ${colorBlindMode ? 'bg-neutral-700 text-white' : 'bg-white'} border ${colorBlindMode ? 'border-gray-600' : 'border-blue-300'} rounded-md`}>
                                {gameMode === 'cooperative' ? cooperativeProgress.highscore : individualProgress.highscore}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <button
                        onClick={() => setCurrentScreen('home')}
                        className={`px-6 py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md`}
                    >
                        VOLTAR AO MENU
                    </button>
                    <button
                        onClick={handleRestartGame}
                        className={`px-6 py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md`}
                    >
                        JOGAR NOVAMENTE
                    </button>
                </div>
            </div>
        );
    };
    // Componente de Perfil do Jogador

// Componente de Perfil do Jogador com dados mock para quando as APIs não estão disponíveis
    const ProfileScreen = () => {
        const [userProfile, setUserProfile] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchUserProfile = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Token não encontrado');
                    }

                    const profileResponse = await fetch('http://localhost:3000/api/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!profileResponse.ok) {
                        throw new Error('Erro ao carregar perfil');
                    }

                    const profileData = await profileResponse.json();
                    
                    if (profileData.success) {
                        setUserProfile(profileData.data.user);
                    } else {
                        throw new Error(profileData.message || 'Erro ao carregar dados do perfil');
                    }

                    setLoading(false);
                } catch (err) {
                    console.error('Erro ao carregar perfil:', err);
                    setError(err.message);
                    setLoading(false);
                }
            };

            fetchUserProfile();
        }, []);

        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className={`w-16 h-16 mb-4 rounded-full ${colorBlindMode ? 'bg-yellow-500' : 'bg-blue-300'} animate-pulse`}></div>
                    <p className={`text-lg ${colorBlindMode ? 'text-white' : ''}`}>Carregando perfil...</p>
                </div>
            );
        }

        if (error || !userProfile) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className={`text-lg mb-4 ${colorBlindMode ? 'text-white' : ''}`}>
                        {error || 'Perfil não encontrado'}
                    </p>
                    <button
                        onClick={() => setCurrentScreen('home')}
                        className={`px-6 py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md`}
                    >
                        VOLTAR AO MENU
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${colorBlindMode ? 'text-white' : ''}`}>MEU PERFIL</h2>
                
                {/* No perfil do jogador */}
                <div 
                    className={`w-full max-w-md p-6 rounded-lg ${colorBlindMode ? 'bg-neutral-800 text-white' : 'bg-white shadow'}`}
                    onFocus={() => handleElementFocus('Perfil do jogador')}
                    tabIndex="0"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div 
                            className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${colorBlindMode ? 'bg-blue-700' : 'bg-blue-200'}`}
                            onFocus={() => handleElementFocus(`Avatar de ${userProfile.username}`)}
                            tabIndex="0"
                        >
                            <span className="text-5xl font-bold">{userProfile.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{userProfile.username}</h3>
                        <p className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.email}</p>
                        <p className={`text-xs mt-1 ${colorBlindMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Conta criada em: {formatDate(userProfile.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Níveis */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Modo Individual */}
                    <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                        <h4 className={`text-center font-medium mb-2 ${colorBlindMode ? 'text-gray-300' : 'text-blue-800'}`}>
                            MODO INDIVIDUAL
                        </h4>
                        <div className="text-center">
                            <span className="block text-3xl font-bold">
                                {individualProgress.level}
                            </span>
                            <span className="text-sm mb-2 block">
                                {levelConfig.individual.find(cfg => cfg.level === individualProgress.level)?.name || 'Iniciante'}
                            </span>
                            <div className={`mt-2 pt-2 border-t ${colorBlindMode ? 'border-gray-600' : 'border-blue-200'}`}>
                                <span className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-blue-600'}`}>Melhor Pontuação</span>
                                <span className="block text-xl font-bold">{individualProgress.highscore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Modo Multi-Jogador */}
                    <div className={`p-4 rounded-lg ${colorBlindMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                        <h4 className={`text-center font-medium mb-2 ${colorBlindMode ? 'text-gray-300' : 'text-blue-800'}`}>
                            MODO MULTI-JOGADOR
                        </h4>
                        <div className="text-center">
                            <span className="block text-3xl font-bold">
                                {cooperativeProgress.level}
                            </span>
                            <span className="text-sm">
                                {levelConfig.cooperative.find(cfg => cfg.level === cooperativeProgress.level)?.name || 'Iniciante'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Botão Voltar */}
                <button
                    onClick={() => setCurrentScreen('home')}
                    className={`px-8 py-3 mt-8 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md`}
                >
                    VOLTAR AO MENU
                </button>
            </div>
        );
    };
    
    // NOVA TELA: Seleção de Níveis
    const LevelSelectScreen = () => {
        const currentMode = gameMode === 'cooperative' ? 'cooperative' : 'individual';
        const progress = gameMode === 'cooperative' ? cooperativeProgress : individualProgress;
        const levels = levelConfig[currentMode];
        const unlockedLevel = progress.level;

        return (
            <div className="flex flex-col items-center justify-center">
                <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${colorBlindMode ? 'text-white' : ''}`}>ESCOLHA O NÍVEL</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {levels.map((level, idx) => {
                        const canPlay = level.level <= unlockedLevel;
                        return (
                            <button
                                key={level.level}
                                disabled={!canPlay}
                                onClick={() => {
                                    console.log('Selecionando nível:', level.level); // Debug
                                    announceButtonAction(`Nível ${level.level} selecionado: ${level.name}. ${level.cards} cartas.`);
                                    setCurrentLevelToPlay(level.level);
                                    setCards([]); // Limpar cartas existentes
                                    setFlippedCards([]);
                                    setMatchedCards([]);
                                    setTimer(0);
                                    setScore(0);
                                    setPlayer1Score(0);
                                    setPlayer2Score(0);
                                    setCurrentPlayer(1);
                                    setCurrentScreen('game'); // Ir para o jogo
                                    setGameStartNarrated(false);
                                }}
                                className={`p-6 rounded-lg shadow-md text-xl font-bold transition-all duration-200
                                    ${canPlay
                                        ? (colorBlindMode ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-blue-200 text-blue-800 hover:bg-yellow-300')
                                        : (colorBlindMode ? 'bg-neutral-700 text-gray-400' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
                                    flex flex-col items-center justify-center relative`}
                                onFocus={() => {
                                    if (canPlay) {
                                        announceButtonAction(`Nível ${level.level}: ${level.name}. ${level.cards} cartas. ${level.timeLimit ? `Limite de tempo: ${formatTime(level.timeLimit)}` : ''}`);
                                    } else {
                                        announceButtonAction(`Nível ${level.level} bloqueado. Complete o nível anterior para desbloquear.`);
                                    }
                                }}
                            >
                                <span className="mb-2">Nível {level.level}</span>
                                <span className="text-base font-normal mb-1">{level.name}</span>
                                <span className="text-xs">{level.cards} cartas</span>
                                {!canPlay && (
                                    <span className="absolute top-2 right-2 text-2xl">🔒</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setCurrentScreen('home')}
                    className={`px-8 py-2 ${colorBlindMode ? 'bg-yellow-500' : 'bg-yellow-300'} text-black font-bold rounded-md shadow-md`}
                >
                    VOLTAR AO MENU
                </button>
            </div>
        );
    };
    
    // Função para narrar mudança de tela
    const announceScreenChange = (screenName) => {
        if (!soundEnabled) return;
        
        let message = '';
        switch (screenName) {
            case 'home':
                message = 'Menu principal do BrainBridge. Use as teclas para navegar entre as opções.';
                break;
            case 'gameMode':
                message = 'Escolha o modo de jogo. Individual ou Multi-jogador.';
                break;
            case 'levelSelect':
                message = 'Selecione o nível que deseja jogar.';
                break;
            case 'game':
                message = 'Jogo iniciado. Use as setas para navegar entre as cartas.';
                break;
            case 'stats':
                message = 'Estatísticas do jogo. Aqui pode ver sua pontuação e progresso.';
                break;
            case 'about':
                message = 'Sobre nós. Informações sobre os desenvolvedores do BrainBridge.';
                break;
            case 'profile':
                message = 'Seu perfil. Aqui estão suas informações e progresso.';
                break;
            default:
                message = `Tela ${screenName}`;
        }
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(message, 'assertive');
    };

    // Função para narrar interações com botões
    const announceButtonAction = (actionName) => {
        if (!soundEnabled) return;
        
        const utterance = new SpeechSynthesisUtterance(actionName);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(actionName, 'polite');
    };

    // Função para narrar alterações de configuração
    const announceSettingChange = (setting, value) => {
        if (!soundEnabled) return;
        
        let message = '';
        switch (setting) {
            case 'sound':
                message = value ? 'Som ativado' : 'Som desativado';
                break;
            case 'colorBlind':
                message = value ? 'Modo daltônico ativado' : 'Modo daltônico desativado';
                break;
            case 'volume':
                message = `Volume alterado para ${Math.round(value * 100)} por cento`;
                break;
            default:
                message = `Configuração ${setting} alterada`;
        }
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(message, 'polite');
    };
    
    // Monitorar mudanças de tela para narração
    useEffect(() => {
        if (currentScreen) {
            announceScreenChange(currentScreen);
        }
    }, [currentScreen]);
    
    // Função para narrar elementos focados
    const handleElementFocus = (elementName) => {
        if (!soundEnabled) return;
        
        const utterance = new SpeechSynthesisUtterance(elementName);
        utterance.lang = 'pt-PT';
        utterance.volume = soundVolume;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        
        // Também anunciar para leitores de tela
        announce(elementName, 'polite');
    };
    
    return (
        <div className={`flex flex-col h-full ${colorBlindMode ? 'bg-neutral-900 text-white' : 'bg-blue-100'} rounded-lg overflow-hidden`} style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '600px' }}>
            {/* Cabeçalho */}
            <header className={`p-4 flex justify-between items-center ${colorBlindMode ? 'bg-neutral-800 text-white' : 'bg-white'} shadow`}>
                <div className="flex items-center">
                    {currentScreen !== 'login' && currentScreen !== 'home' && (
                        <button
                            onClick={() => {
                                setTimerActive(false);
                                setCurrentScreen(currentScreen === 'home' ? 'login' : 'home');
                            }}
                            className={`mr-4 ${colorBlindMode ? 'text-yellow-300' : 'text-blue-600'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center">
                        <div 
                            className={`w-12 h-12 mr-2 rounded-full ${colorBlindMode ? 'bg-yellow-500' : 'bg-blue-200'} flex items-center justify-center`}
                        >
                            <span className={`text-lg font-bold ${colorBlindMode ? 'text-black' : ''}`}>BB</span>
                        </div>
                        <div className={`ml-2 px-3 py-1 rounded-full ${colorBlindMode ? 'bg-yellow-500 text-black' : 'bg-blue-200'}`}>
                            Nível {gameMode === 'cooperative' ? cooperativeProgress.level : individualProgress.level}
                        </div>
                    </div>
                </div>
                
                {currentScreen === 'game' && (
                    <div className="flex items-center space-x-3">
                        {gameMode === 'cooperative' ? (
                            // Modo Cooperativo - Mostrar pontuação de ambos os jogadores
                            <div className="flex items-center space-x-2">
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    currentPlayer === 1 
                                        ? (colorBlindMode ? 'bg-blue-700 text-white border-2 border-yellow-500' : 'bg-blue-500 text-white') 
                                        : (colorBlindMode ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800')
                                }`}>
                                    J1: {player1Score}
                                </div>
                                <div className={`text-sm font-bold ${colorBlindMode ? 'text-white' : 'text-gray-600'}`}>
                                    VS
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    currentPlayer === 2 
                                        ? (colorBlindMode ? 'bg-yellow-500 text-black border-2 border-white' : 'bg-red-500 text-white') 
                                        : (colorBlindMode ? 'bg-yellow-400 text-black' : 'bg-red-200 text-red-800')
                                }`}>
                                    J2: {player2Score}
                                </div>
                            </div>
                        ) : (
                            // Modo Individual - Mostrar pontuação única
                            <div className={`px-4 py-2 rounded-full text-lg font-bold ${colorBlindMode ? 'bg-yellow-500 text-black' : 'bg-yellow-300 text-yellow-800'}`}>
                                {score} Pontos
                            </div>
                        )}
                    </div>
                )}

                
                <div className="flex items-center">
                    {/* Adicionar controle de modo daltonismo no cabeçalho */}
                    {currentScreen !== 'login' && currentScreen !== 'home' && (
                        <button
                            onClick={() => setColorBlindMode(!colorBlindMode)}
                            className={`p-2 rounded-full flex items-center justify-center transition-colors ${colorBlindMode ? 'bg-yellow-300 text-black' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            aria-label={colorBlindMode ? "Desativar modo daltônico" : "Ativar modo daltônico"}
                            title="Modo daltônico - alto contraste"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v12M8 12h8" />
                                <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Botão de Logout */}
                    {currentScreen !== 'login' && (
                        <button
                            onClick={() => {
                                announceButtonAction('Saindo da conta...');
                                handleLogout();
                            }}
                            className={`ml-2 px-4 py-2 rounded-md flex items-center justify-center ${
                                colorBlindMode 
                                    ? 'bg-blue-700 text-white hover:bg-blue-600' 
                                    : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                            } transition`}
                            title="Fazer logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                                strokeLinejoin="round" className="mr-1">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    )}
                    {currentScreen !== 'login' && (
                        <button
                            onClick={() => {
                                announceButtonAction('Abrindo perfil...');
                                setCurrentScreen('profile');
                            }}
                            className={`px-4 py-2 rounded-md hover:bg-blue-300 transition ${colorBlindMode ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'}`}
                        >
                            Meu Perfil
                        </button>
                    )}
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-4 overflow-y-auto">
                {currentScreen === 'login' && <LoginScreen />}
                {currentScreen === 'home' && <HomeScreen />}
                {currentScreen === 'levelSelect' && <LevelSelectScreen />}
                {currentScreen === 'gameMode' && <GameModeScreen />}
                {currentScreen === 'game' && <GameScreen />}
                {currentScreen === 'stats' && <StatsScreen />}
                {currentScreen === 'about' && <AboutScreen />}
                {currentScreen === 'profile' && <ProfileScreen />}
            </main>
            {/* Rodapé */}
            <footer className={`p-4 flex justify-between items-center ${colorBlindMode ? 'bg-neutral-800 text-white' : 'bg-white'}`}>
                <div className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Versão Melhorada
                </div>
                <div className={`text-sm ${colorBlindMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    BrainBridge - Jogo de Memória Acessível e Multi-Jogador
                </div>
            </footer>
        </div>
    );
}

// Renderizar o aplicativo
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<BrainBridge />);


// Inicializar os ícones Feather (alternativa ao Lucide)
feather.replace();