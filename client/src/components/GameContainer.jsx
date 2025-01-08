import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import ChessBoard from './ChessBoard';

const GameContainer = ({ hideHeader = false }) => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { 
    gameDetails,
    games,
    getGames,
    makeMove,
    offerDraw,
    respondToDrawOffer,
    resignGame,
    isGameDetailsLoading
  } = useGameStore();

  const [orientation, setOrientation] = useState('white');
  
  // Find the active game with the selected user
  const currentGame = games.find(game => 
    game.status === 'active' && 
    game.players.some(player => player._id === selectedUser?._id)
  );

  useEffect(() => {
    if (selectedUser) {
      getGames();
    }
  }, [selectedUser, getGames]);

  useEffect(() => {
    if (currentGame && authUser) {
      const isPlayerBlack = currentGame.players[1]._id === authUser._id;
      setOrientation(isPlayerBlack ? 'black' : 'white');
    }
  }, [currentGame, authUser]);

  const handleMove = async (from, to) => {
    if (!currentGame || currentGame.status !== 'active') return;
    
    // Check if it's the player's turn
    if (currentGame.turn._id !== authUser._id) return;

    await makeMove(currentGame._id, from, to);
  };

  const renderGameStatus = () => {
    if (!currentGame) return 'No active game';

    switch (currentGame.status) {
      case 'completed':
        return currentGame.winner ? 
          `Winner: ${currentGame.winner.username}` : 
          'Game Drawn';
      case 'drawn':
        return 'Game Drawn';
      case 'resigned':
        return `${currentGame.winner.username} won by resignation`;
      case 'active':
        return `Current Turn: ${currentGame.turn.username}`;
      default:
        return currentGame.status;
    }
  };

  if (!selectedUser) {
    return (
      <div className="w-full flex items-center justify-center">
        <p className="text-lg">Select a user to start playing</p>
      </div>
    );
  }

  if (isGameDetailsLoading) {
    return (
      <div className="w-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="w-full flex items-center justify-center">
        <p className="text-lg">No active game with {selectedUser.username}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {!hideHeader && <GameHeader />}

      <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
        <div className="w-full max-w-[min(100%,calc(100vh-300px))] aspect-square">
          <ChessBoard
            fen={currentGame.currentPosition}
            onMove={handleMove}
            orientation={orientation}
            disabled={
              currentGame.status !== 'active' ||
              currentGame.turn._id !== authUser._id
            }
          />
        </div>
      </div>

      <div className="bg-base-200 p-4 mt-auto">
        <div className="flex justify-center gap-4">
          <button 
            className="btn btn-primary"
            onClick={() => offerDraw(currentGame._id)}
            disabled={
              currentGame.status !== 'active' ||
              currentGame.drawOffer ||
              currentGame.turn._id !== authUser._id
            }
          >
            Offer Draw
          </button>
          <button 
            className="btn btn-error"
            onClick={() => {
              if (window.confirm('Are you sure you want to resign?')) {
                resignGame(currentGame._id);
              }
            }}
            disabled={currentGame.status !== 'active'}
          >
            Resign
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;