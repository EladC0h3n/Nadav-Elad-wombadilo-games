import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ 
  fen, 
  onMove, 
  orientation = 'white',
  disabled = false 
}) => {
  const [game] = useState(new Chess(fen));
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
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div style={{ width: boardWidth, maxWidth: '100%' }}>
        <Chessboard
          position={fen}
          onPieceDrop={makeMove}
          orientation={orientation}
          boardWidth={boardWidth}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          areArrowsAllowed={true}
          showBoardNotation={true}
        />
      </div>
    </div>
  );
};

export default ChessBoard;