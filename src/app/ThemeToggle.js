'use client';
import { useState, useEffect } from 'react';

const API_URL = 'https://aigames.onrender.com';

export default function AIGamesApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [board, setBoard] = useState(Array(9).fill(' '));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    if (winner) {
      playWinnerSound(winner);
    }
  }, [winner]);

  const playWinnerSound = (result) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (result === 'draw') {
      playTone(audioContext, [400, 400, 400], [0.1, 0.1, 0.1]);
    } else if ((gameMode === 'ai' && result === playerSymbol) || gameMode === '2player') {
      playTone(audioContext, [523, 659, 784, 1047], [0.1, 0.1, 0.1, 0.3]);
    } else {
      playTone(audioContext, [400, 350, 300, 250], [0.1, 0.1, 0.1, 0.2]);
    }
  };

  const playTone = (audioContext, frequencies, durations) => {
    let startTime = audioContext.currentTime;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[index]);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + durations[index]);
      
      startTime += durations[index];
    });
  };

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const selectGame = (game) => {
    setSelectedGame(game);
  };

  const selectGameMode = (mode) => {
    setGameMode(mode);
    if (mode === '2player') {
      setPlayerSymbol('X');
      setCurrentPlayer('X');
    }
  };

  const selectDifficulty = (level) => {
    setDifficulty(level);
  };

  const selectSymbol = (symbol) => {
    setPlayerSymbol(symbol);
    if (symbol === 'O') {
      setIsPlayerTurn(false);
      makeAIMove(Array(9).fill(' '), 'X');
    }
  };

  const checkWinner = (currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] !== ' ' && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line };
      }
    }

    if (!currentBoard.includes(' ')) {
      return { winner: 'draw', line: [] };
    }

    return null;
  };

  const makeAIMove = async (currentBoard, aiSymbol) => {
    setIsAiThinking(true);
    
    try {
      const response = await fetch(`${API_URL}/api/ai-move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: currentBoard,
          difficulty: difficulty,
          aiSymbol: aiSymbol
        }),
      });

      const data = await response.json();
      
      setTimeout(() => {
        setBoard(data.board);
        
        if (data.winner) {
          setWinner(data.winner);
          setWinningLine(data.winningLine);
        } else {
          setIsPlayerTurn(true);
        }
        setIsAiThinking(false);
      }, 500);
      
    } catch (error) {
      console.error('AI move error:', error);
      setIsAiThinking(false);
      alert('Backend connection failed! Make sure Python server is running.');
    }
  };

  const handleCellClick = (index) => {
    if (board[index] !== ' ' || winner || isAiThinking) return;

    if (gameMode === '2player') {
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningLine(result.line);
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    } else {
      if (!isPlayerTurn) return;

      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningLine(result.line);
      } else {
        setIsPlayerTurn(false);
        const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
        makeAIMove(newBoard, aiSymbol);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(' '));
    setWinner(null);
    setWinningLine([]);
    setCurrentPlayer('X');
    setIsAiThinking(false);
    
    if (gameMode === 'ai') {
      setIsPlayerTurn(playerSymbol === 'X');
      if (playerSymbol === 'O') {
        makeAIMove(Array(9).fill(' '), 'X');
      }
    }
  };

  const backToMenu = () => {
    setGameMode(null);
    setDifficulty(null);
    setPlayerSymbol(null);
    setBoard(Array(9).fill(' '));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setCurrentPlayer('X');
    setIsAiThinking(false);
  };

  const backToGameSelection = () => {
    setSelectedGame(null);
    setGameMode(null);
    setDifficulty(null);
    setPlayerSymbol(null);
    setBoard(Array(9).fill(' '));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setCurrentPlayer('X');
    setIsAiThinking(false);
  };

  // Game Selection Grid
  if (selectedGame === null) {
    return (
      <>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {darkMode ? (
            <svg className="icon icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="icon icon-moon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="home-container">
          <div className="home-content">
            <h1 className="home-title">AI Games</h1>
            <p className="home-subtitle">Play classic games with AI opponents</p>
            
            <div className="games-grid">
              <button onClick={() => selectGame('tictactoe')} className="game-card available">
                <div className="game-icon">⭕❌</div>
                <h3 className="game-name">Tic Tac Toe</h3>
                <p className="">Classic 3x3 grid game</p>
                <span className="play-badge">Play Now</span>
              </button>

              <div className="game-card coming-soon">
                <div className="game-icon">♟️</div>
                <h3 className="game-name">Chess</h3>
                <p className="game-desc">Strategic board game</p>
                <span className="coming-badge">Coming Soon</span>
              </div>

              <div className="game-card coming-soon">
                <div className="game-icon">🎯</div>
                <h3 className="game-name">Connect 4</h3>
                <p className="game-desc">4-in-a-row challenge</p>
                <span className="coming-badge">Coming Soon</span>
              </div>

              <div className="game-card coming-soon">
                <div className="game-icon">🎲</div>
                <h3 className="game-name">Checkers</h3>
                <p className="game-desc">Jump and capture</p>
                <span className="coming-badge">Coming Soon</span>
              </div>

              <div className="game-card coming-soon">
                <div className="game-icon">🧩</div>
                <h3 className="game-name">Sudoku</h3>
                <p className="game-desc">Number puzzle</p>
                <span className="coming-badge">Coming Soon</span>
              </div>

              <div className="game-card coming-soon">
                <div className="game-icon">🃏</div>
                <h3 className="game-name">Card Games</h3>
                <p className="game-desc">Various card battles</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tic Tac Toe Game Mode Selection
  if (selectedGame === 'tictactoe' && gameMode === null) {
    return (
      <>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {darkMode ? (
            <svg className="icon icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="icon icon-moon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="difficulty-container">
          <div className="difficulty-content">
            <h1 className="difficulty-title">Tic Tac Toe</h1>
            <p className="difficulty-subtitle">Select mode:</p>
            
            <div className="difficulty-buttons">
              <button onClick={() => selectGameMode('ai')} className="difficulty-btn easy-btn">
                <span className="btn-icon">🤖</span>
                <span className="btn-text">AI Mode</span>
                <span className="btn-desc">Play with computer</span>
              </button>

              <button onClick={() => selectGameMode('2player')} className="difficulty-btn hard-btn">
                <span className="btn-icon">👥</span>
                <span className="btn-text">2 Player</span>
                <span className="btn-desc">Play with partner</span>
              </button>
            </div>

            <button onClick={backToGameSelection} className="back-btn-small">← Back to Games</button>
          </div>
        </div>
      </>
    );
  }

  // Difficulty Selection
  if (gameMode === 'ai' && difficulty === null) {
    return (
      <>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {darkMode ? (
            <svg className="icon icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="icon icon-moon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="difficulty-container">
          <div className="difficulty-content">
            <h1 className="difficulty-title">Tic Tac Toe</h1>
            <p className="difficulty-subtitle">AI difficulty:</p>
            
            <div className="difficulty-buttons">
              <button onClick={() => selectDifficulty('easy')} className="difficulty-btn easy-btn">
                <span className="btn-icon">😊</span>
                <span className="btn-text">Easy</span>
                <span className="btn-desc">Random + Smart moves</span>
              </button>

              <button onClick={() => selectDifficulty('hard')} className="difficulty-btn hard-btn">
                <span className="btn-icon">🔥</span>
                <span className="btn-text">Hard</span>
                <span className="btn-desc">Minimax Algorithm</span>
              </button>
            </div>

            <button onClick={backToGameSelection} className="back-btn-small">← Back</button>
          </div>
        </div>
      </>
    );
  }

  // Symbol Selection
  if (gameMode === 'ai' && playerSymbol === null) {
    return (
      <>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {darkMode ? (
            <svg className="icon icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="icon icon-moon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="symbol-container">
          <div className="symbol-content">
            <h1 className="symbol-title">Your symbol?</h1>
            <p className="symbol-subtitle">Difficulty: <span className={difficulty === 'easy' ? 'badge-easy' : 'badge-hard'}>{difficulty.toUpperCase()}</span></p>
            
            <div className="symbol-buttons">
              <button onClick={() => selectSymbol('X')} className="symbol-btn x-btn">
                <span className="symbol-display">X</span>
                <span className="symbol-label">Cross (First Move)</span>
              </button>

              <button onClick={() => selectSymbol('O')} className="symbol-btn o-btn">
                <span className="symbol-display">O</span>
                <span className="symbol-label">Circle</span>
              </button>
            </div>

            <button onClick={() => setDifficulty(null)} className="back-btn-small">← Back</button>
          </div>
        </div>
      </>
    );
  }

  // Game Board
  return (
    <>
      <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
        {darkMode ? (
          <svg className="icon icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg className="icon icon-moon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div className="game-container">
        <div className="game-layout">
          <div className="game-board-section">
            <div className="game-header">
              <h1 className="game-title">Tic Tac Toe</h1>
              <div className="game-info">
                {gameMode === '2player' ? (
                  <>
                    <span className="info-badge">Player 1: X</span>
                    <span className="info-badge">Player 2: O</span>
                  </>
                ) : (
                  <>
                    <span className="info-badge">You: {playerSymbol}</span>
                    <span className="info-badge">AI: {playerSymbol === 'X' ? 'O' : 'X'}</span>
                  </>
                )}
              </div>
            </div>

            {winner && (
              <div className="winner-message">
                {winner === 'draw' ? (
                  <span className="draw-text">🤝 Draw!</span>
                ) : gameMode === '2player' ? (
                  <span className="win-text">🎉 Player {winner} Won!</span>
                ) : winner === playerSymbol ? (
                  <span className="win-text">🎉 You Won!</span>
                ) : (
                  <span className="lose-text">😢 AI Won!</span>
                )}
              </div>
            )}

            {!winner && (
              <div className="turn-indicator">
                {gameMode === '2player' ? (
                  `🎯 Player ${currentPlayer} turn!`
                ) : isAiThinking ? (
                  "🤖 AI thinking..."
                ) : isPlayerTurn ? (
                  "🎯 Your turn!"
                ) : (
                  "🤖 AI processing..."
                )}
              </div>
            )}

            <div className="board">
              {board.map((cell, index) => (
                <button
                  key={index}
                  className={`cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''} ${
                    winningLine.includes(index) ? 'winning-cell' : ''
                  }`}
                  onClick={() => handleCellClick(index)}
                  disabled={gameMode === 'ai' && (!isPlayerTurn || cell !== ' ' || winner || isAiThinking)}
                >
                  {cell !== ' ' ? cell : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="game-sidebar">
            <div className="sidebar-content">
              <h2 className="sidebar-title">Game Controls</h2>
              
              <div className="game-stats">
                <div className="stat-item">
                  <span className="stat-label">Mode:</span>
                  <span className="stat-value">{gameMode === '2player' ? '2 Player' : 'AI'}</span>
                </div>
                {gameMode === 'ai' && (
                  <div className="stat-item">
                    <span className="stat-label">Difficulty:</span>
                    <span className="stat-value">{difficulty}</span>
                  </div>
                )}
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className="stat-value">
                    {winner ? (winner === 'draw' ? 'Draw' : `${winner} Won`) : 'Playing'}
                  </span>
                </div>
              </div>

              <div className="sidebar-actions">
                <button onClick={resetGame} className="sidebar-btn reset-btn">
                  <span className="btn-icon-small">🔄</span>
                  <span>New Game</span>
                </button>
                <button onClick={backToMenu} className="sidebar-btn menu-btn">
                  <span className="btn-icon-small">🏠</span>
                  <span>Main Menu</span>
                </button>
                <button onClick={backToGameSelection} className="sidebar-btn games-btn">
                  <span className="btn-icon-small">🎮</span>
                  <span>All Games</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}