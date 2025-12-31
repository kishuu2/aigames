'use client';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'ai' or '2player'
  const [difficulty, setDifficulty] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

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

  const selectGameMode = (mode) => {
    setGameMode(mode);
    if (mode === '2player') {
      setPlayerSymbol('X'); // 2 player mode me directly game start
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
      setTimeout(() => makeAIMove(Array(9).fill(null), 'X'), 500);
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
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line };
      }
    }

    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: [] };
    }

    return null;
  };

  const makeAIMove = (currentBoard, aiSymbol) => {
    const availableMoves = currentBoard.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null);
    
    if (availableMoves.length === 0) return;

    let move;
    if (difficulty === 'easy') {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      move = getBestMove(currentBoard, aiSymbol);
    }

    const newBoard = [...currentBoard];
    newBoard[move] = aiSymbol;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const getBestMove = (currentBoard, aiSymbol) => {
    const playerSym = aiSymbol === 'X' ? 'O' : 'X';
    const availableMoves = currentBoard.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null);

    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = aiSymbol;
      if (checkWinner(testBoard)?.winner === aiSymbol) return move;
    }

    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = playerSym;
      if (checkWinner(testBoard)?.winner === playerSym) return move;
    }

    if (currentBoard[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter(idx => currentBoard[idx] === null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handleCellClick = (index) => {
    if (board[index] !== null || winner) return;

    if (gameMode === '2player') {
      // 2 Player mode
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
      // AI mode
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
        setTimeout(() => makeAIMove(newBoard, aiSymbol), 500);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setCurrentPlayer('X');
    
    if (gameMode === 'ai') {
      setIsPlayerTurn(playerSymbol === 'X');
      if (playerSymbol === 'O') {
        setTimeout(() => makeAIMove(Array(9).fill(null), 'X'), 500);
      }
    }
  };

  const backToMenu = () => {
    setGameMode(null);
    setDifficulty(null);
    setPlayerSymbol(null);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setCurrentPlayer('X');
  };

  // Game Mode Selection Screen
  if (gameMode === null) {
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
                <span className="btn-desc">Play with commputer</span>
              </button>

              <button onClick={() => selectGameMode('2player')} className="difficulty-btn hard-btn">
                <span className="btn-icon">👥</span>
                <span className="btn-text">2 Player</span>
                <span className="btn-desc">Play with partner</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Difficulty Selection Screen (only for AI mode)
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
            <p className="difficulty-subtitle">AI difficulty select karo:</p>
            
            <div className="difficulty-buttons">
              <button onClick={() => selectDifficulty('easy')} className="difficulty-btn easy-btn">
                <span className="btn-icon">😊</span>
                <span className="btn-text">Easy</span>
                <span className="btn-desc">For Beginners</span>
              </button>

              <button onClick={() => selectDifficulty('hard')} className="difficulty-btn hard-btn">
                <span className="btn-icon">🔥</span>
                <span className="btn-text">Hard</span>
                <span className="btn-desc">For Pro players</span>
              </button>
            </div>

            <button onClick={() => setGameMode(null)} className="back-btn-small">← Back</button>
          </div>
        </div>
      </>
    );
  }

  // Symbol Selection Screen (only for AI mode)
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
            <h1 className="symbol-title">Your symbol ?</h1>
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

  // Game Board Screen
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
                ) : isPlayerTurn ? (
                  "🎯 Your turn!"
                ) : (
                  "🤖 AI Think..."
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
                  disabled={gameMode === 'ai' && (!isPlayerTurn || cell !== null || winner)}
                >
                  {cell}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}