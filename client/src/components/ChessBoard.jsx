import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ 
  position, 
  onMove, 
  orientation = 'white',
  disabled = false
}) => {
  const [game] = useState(new Chess());
  const containerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(400);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const size = Math.min(containerWidth, containerHeight, 600);
        setBoardWidth(size);
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (position) {
      try {
        game.load(position);
      } catch (error) {
        console.error('Invalid position:', error);
      }
    }
  }, [position, game]);

  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (disabled) return false;

    try {
      // Get piece color being moved
      const piece = game.get(sourceSquare);
      const isWhitePiece = piece?.color === 'w';
      
      // Ensure correct color is moving
      if (game.turn() === 'w' && !isWhitePiece || game.turn() === 'b' && isWhitePiece) {
        return false;
      }

      // Validate move locally
      const moveAttempt = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (moveAttempt) {
        // If move is valid locally, send to server
        onMove(sourceSquare, targetSquare);
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div style={{ width: boardWidth, maxWidth: '100%' }}>
        <Chessboard
          position={position}
          onPieceDrop={handlePieceDrop}
          boardOrientation={orientation}
          boardWidth={boardWidth}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          areArrowsAllowed={true}
          showBoardNotation={true}
          isDraggablePiece={({ piece }) => !disabled && 
            // Only allow dragging if it's the correct color's turn
            ((piece[0] === 'w' && game.turn() === 'w') || 
             (piece[0] === 'b' && game.turn() === 'b'))
          }
        />
      </div>
    </div>
  );
};

export default ChessBoard;