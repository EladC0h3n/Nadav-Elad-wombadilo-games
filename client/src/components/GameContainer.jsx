import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";
import ChessBoard from "./ChessBoard";
import { Chess } from 'chess.js';
import { toast } from "react-hot-toast";

const GameContainer = () => {
  const { 
    selectedGame, 
    makeMove, 
    setSelectedGame,
    subscribeToGameEvents,
    unsubscribeFromGameEvents
  } = useGameStore();
  
  console.log(selectedGame);

  const { authUser } = useAuthStore();

  useEffect(() => {
    const { socket } = useAuthStore.getState();
    
    const handleMoveMade = ({ gameId, game }) => {
      if (selectedGame?._id === gameId) {
        setSelectedGame(game);  // Use the complete populated game
      }
    };

    socket.on("moveMade", handleMoveMade);

    return () => {
      socket.off("moveMade", handleMoveMade);
    };
  }, [selectedGame, setSelectedGame]);

  useEffect(() => {
    subscribeToGameEvents();
    return () => unsubscribeFromGameEvents();
  }, [subscribeToGameEvents, unsubscribeFromGameEvents]);

  if (!selectedGame) {
    return (
      <div className="w-full flex items-center justify-center">
        <p className="text-lg">No active game selected</p>
      </div>
    );
  }

  const isPlayerWhite = selectedGame.players[0]._id === authUser?._id;
  // Determine if it's white's turn based on FEN
  const chess = new Chess(selectedGame.currentPosition);
  const isWhiteTurn = chess.turn() === 'w';
  // It's player's turn if they're white and it's white's turn, or if they're black and it's black's turn
  const isPlayerTurn = isPlayerWhite === isWhiteTurn;

  const handleMove = async (from, to) => {
    if (!selectedGame || selectedGame.status !== "active") return;
    
    if (!isPlayerTurn) {
      toast.error("It's not your turn!");
      return;
    }

    const result = await makeMove(selectedGame._id, from, to);
    if (!result) {
      // Reset the board if move failed
      setSelectedGame({...selectedGame}); // Force refresh
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Game Status Banner */}
      {selectedGame.status === "completed" && (
        <div className="bg-primary text-primary-content p-2 text-center">
          {selectedGame.winner 
            ? `Game Over - ${selectedGame.winner.userName} wins!`
            : "Game Over - Draw!"}
        </div>
      )}

      {/* Chess Board */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
        <div className="w-full max-w-[min(100%,calc(100vh-300px))] aspect-square">
          <ChessBoard
            position={selectedGame.currentPosition}
            onMove={handleMove}
            orientation={isPlayerWhite ? "white" : "black"}
            disabled={!isPlayerTurn || selectedGame.status !== "active"}
          />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;