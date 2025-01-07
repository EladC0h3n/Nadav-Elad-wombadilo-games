import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import ChessBoard from './ChessBoard';

const GameContainer = () => {
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg">Select a user to start playing</p>
      </div>
    );
  }

  if (isGameDetailsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg">No active game with {selectedUser.username}</p>
      </div>
    );
  }

  const whitePlayer = currentGame.players[0];
  const blackPlayer = currentGame.players[1];

  return (
    <div className="flex flex-col h-full">
      {/* Game Info Header */}
      <div className="bg-base-200 p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={blackPlayer?.profilePic || "/avatar.png"} alt="Black player" />
              </div>
            </div>
            <div>
              <p className="font-semibold">{blackPlayer?.username}</p>
              <p className="text-sm opacity-75">Black</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{renderGameStatus()}</p>
            {currentGame.drawOffer && (
              <div className="mt-2">
                {currentGame.drawOffer.by !== authUser._id ? (
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => respondToDrawOffer(currentGame._id, true)}
                    >
                      Accept Draw
                    </button>
                    <button 
                      className="btn btn-sm btn-error"
                      onClick={() => respondToDrawOffer(currentGame._id, false)}
                    >
                      Decline Draw
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">Draw offer pending...</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-right">{whitePlayer?.username}</p>
              <p className="text-sm opacity-75 text-right">White</p>
            </div>
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={whitePlayer?.profilePic || "/avatar.png"} alt="White player" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center p-4">
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

      {/* Game Controls */}
      <div className="bg-base-200 p-4 rounded-b-lg">
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