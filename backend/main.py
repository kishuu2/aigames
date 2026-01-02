from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI()

# CORS setup for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://aigames-xi.vercel.app",
        "*"  # Production - Allow all origins (ya specific domain add karo)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to track move count per game
move_counts = {}

class GameState(BaseModel):
    board: List[str]  # 9 elements: 'X', 'O', or ' '
    difficulty: str   # 'easy' or 'hard'
    aiSymbol: str     # 'X' or 'O'

class MoveResponse(BaseModel):
    move: int
    board: List[str]
    winner: Optional[str]
    winningLine: List[int]

def check_winner(board):
    """Check if there's a winner or draw"""
    wins = [
        (0, 1, 2), (3, 4, 5), (6, 7, 8),  # Rows
        (0, 3, 6), (1, 4, 7), (2, 5, 8),  # Columns
        (0, 4, 8), (2, 4, 6)              # Diagonals
    ]
    
    for a, b, c in wins:
        if board[a] == board[b] == board[c] != ' ':
            return board[a], [a, b, c]
    
    # Check for draw
    if ' ' not in board:
        return 'draw', []
    
    return None, []

def minimax(board, player, aiSymbol):
    """
    Minimax algorithm for finding the best move
    Returns score: +1 for AI win, -1 for player win, 0 for draw
    """
    playerSymbol = 'X' if aiSymbol == 'O' else 'O'
    winner, _ = check_winner(board)
    
    # Terminal states
    if winner == aiSymbol:
        return 1
    if winner == playerSymbol:
        return -1
    if winner == 'draw':
        return 0
    
    # Recursive minimax
    best = -2 if player == aiSymbol else 2
    next_player = playerSymbol if player == aiSymbol else aiSymbol
    
    for i in range(9):
        if board[i] == ' ':
            board[i] = player
            score = minimax(board, next_player, aiSymbol)
            board[i] = ' '
            
            if player == aiSymbol:  # Maximize for AI
                if score > best:
                    best = score
            else:  # Minimize for player
                if score < best:
                    best = score
    
    return best

def get_best_move_hard(board, aiSymbol):
    """
    Get best move using minimax algorithm (Hard mode)
    AI will never lose
    """
    playerSymbol = 'X' if aiSymbol == 'O' else 'O'
    best_score = -2
    move = -1
    
    for i in range(9):
        if board[i] == ' ':
            board[i] = aiSymbol
            score = minimax(board, playerSymbol, aiSymbol)
            board[i] = ' '
            
            if score > best_score:
                best_score = score
                move = i
    
    return move

def get_best_move_easy(board, game_id, aiSymbol):
    """
    Easy mode: Alternates between random and minimax moves
    - Odd moves (1st, 3rd, 5th): Random
    - Even moves (2nd, 4th, 6th): Minimax (smart)
    """
    # Track move number for this game
    if game_id not in move_counts:
        move_counts[game_id] = 0
    
    move_counts[game_id] += 1
    move_number = move_counts[game_id]
    
    available = [i for i in range(9) if board[i] == ' ']
    
    if not available:
        return -1
    
    # Alternate: Odd moves = random, Even moves = minimax
    if move_number % 2 == 1:  # 1st, 3rd, 5th move = random
        return random.choice(available)
    else:  # 2nd, 4th, 6th move = minimax (smart)
        return get_best_move_hard(board, aiSymbol)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Tic Tac Toe AI Backend",
        "status": "running",
        "version": "1.0"
    }

@app.post("/api/ai-move", response_model=MoveResponse)
async def ai_move(game_state: GameState):
    """
    Main endpoint for AI move calculation
    Receives board state and returns AI's move
    """
    board = game_state.board.copy()
    difficulty = game_state.difficulty
    aiSymbol = game_state.aiSymbol
    
    # Generate unique game ID from board state
    game_id = ''.join(board)
    
    # Get AI move based on difficulty
    if difficulty == 'hard':
        move = get_best_move_hard(board, aiSymbol)
    else:  # easy
        move = get_best_move_easy(board, game_id, aiSymbol)
    
    # Make the move
    if move != -1:
        board[move] = aiSymbol
    
    # Check winner
    winner, winning_line = check_winner(board)
    
    # Reset move count if game ended
    if winner:
        if game_id in move_counts:
            del move_counts[game_id]
    
    return MoveResponse(
        move=move,
        board=board,
        winner=winner,
        winningLine=winning_line
    )

@app.get("/health")
async def health_check():
    """Additional health check endpoint"""
    return {"status": "healthy"}

# Optional: Clear move counts endpoint (for debugging)
@app.post("/api/reset-counts")
async def reset_move_counts():
    """Reset all move counts (useful for testing)"""
    global move_counts
    move_counts = {}
    return {"message": "Move counts reset", "status": "success"}