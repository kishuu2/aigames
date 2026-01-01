from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS setup for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://aigames-xi.vercel.app",  # Production frontend
        "*"  # Ya sab allow karo (not recommended for production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    wins = [
        (0,1,2), (3,4,5), (6,7,8),
        (0,3,6), (1,4,7), (2,5,8),
        (0,4,8), (2,4,6)
    ]
    for a, b, c in wins:
        if board[a] == board[b] == board[c] != ' ':
            return board[a], [a, b, c]
    
    if ' ' not in board:
        return 'draw', []
    
    return None, []

def minimax(board, player, aiSymbol):
    playerSymbol = 'X' if aiSymbol == 'O' else 'O'
    winner, _ = check_winner(board)
    
    if winner == aiSymbol:
        return 1
    if winner == playerSymbol:
        return -1
    if winner == 'draw':
        return 0
    
    best = -2 if player == aiSymbol else 2
    next_player = playerSymbol if player == aiSymbol else aiSymbol
    
    for i in range(9):
        if board[i] == ' ':
            board[i] = player
            score = minimax(board, next_player, aiSymbol)
            board[i] = ' '
            
            if player == aiSymbol:  # maximize
                if score > best:
                    best = score
            else:  # minimize
                if score < best:
                    best = score
    
    return best

def get_best_move_hard(board, aiSymbol):
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

def get_best_move_easy(board):
    import random
    available = [i for i in range(9) if board[i] == ' ']
    return random.choice(available) if available else -1

@app.post("/api/ai-move", response_model=MoveResponse)
async def ai_move(game_state: GameState):
    board = game_state.board.copy()
    difficulty = game_state.difficulty
    aiSymbol = game_state.aiSymbol
    
    # Get AI move
    if difficulty == 'hard':
        move = get_best_move_hard(board, aiSymbol)
    else:
        move = get_best_move_easy(board)
    
    # Make the move
    if move != -1:
        board[move] = aiSymbol
    
    # Check winner
    winner, winning_line = check_winner(board)
    
    return MoveResponse(
        move=move,
        board=board,
        winner=winner,
        winningLine=winning_line
    )

@app.get("/")
async def root():
    return {"message": "Tic Tac Toe AI Backend"}