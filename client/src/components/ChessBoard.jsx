import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ 
  fen, 
  onMove, 
  orientation = 'white',
  disabled = false 
}) => {
  const [game] = useState(new Chess(fen));

  const makeMove = (sourceSquare, targetSquare) => {
    if (disabled) return false;
    
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        onMove(sourceSquare, targetSquare);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  return (
    <div className="w-full h-full">
      <Chessboard
        position={fen}
        onPieceDrop={makeMove}
        orientation={orientation}
        boardWidth={Math.min(600, window.innerWidth - 40)}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  );
};

export default ChessBoard;