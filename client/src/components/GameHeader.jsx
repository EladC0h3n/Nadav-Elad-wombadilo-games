import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";

const GameHeader = () => {
  const { selectedGame, offerDraw, respondToDrawOffer, resignGame } = useGameStore();
  const { authUser } = useAuthStore();

  if (!selectedGame || !authUser) return null;

  const opponent = selectedGame.players.find(player => player._id !== authUser._id);
  const isPlayerWhite = selectedGame.players[0]._id === authUser._id;
  const hasDrawOffer = selectedGame.drawOffer?.by;
  const isDrawOfferFromOpponent = hasDrawOffer && selectedGame.drawOffer.by !== authUser._id;

  const handleResign = () => {
    if (window.confirm("Are you sure you want to resign?")) {
      resignGame(selectedGame._id);
    }
  };

  const handleDrawResponse = (accept) => {
    respondToDrawOffer(selectedGame._id, accept);
  };

  return (
    <div className="bg-base-200 p-4">
      <div className="flex justify-between items-center">
        {/* Opponent Info */}
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img 
                src={opponent?.profilePic || "/avatar.png"} 
                alt={opponent?.userName} 
              />
            </div>
          </div>
          <div>
            <p className="font-semibold">{opponent?.userName}</p>
            <p className="text-sm opacity-75">
              {isPlayerWhite ? 'Black' : 'White'}
            </p>
          </div>
        </div>

        {/* Game Status & Controls */}
        <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-bold">
            {selectedGame.result ?
                (selectedGame.result === 'checkmate' ?
                    (selectedGame.winner._id === authUser._id ? 'You won!' : 'Opponent won!') :
                    selectedGame.result === 'draw' ? 'Game Drawn' : 
                    selectedGame.winner._id === authUser._id ? 'You won!' : 'Game Resigned' 
                ) 
                : (selectedGame.turn._id === authUser._id ? "Your Turn" : "Opponent's Turn")
            }
          </div>

          {selectedGame.status === "active" && (
            <div className="flex gap-2">
              {isDrawOfferFromOpponent ? (
                <>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleDrawResponse(true)}
                  >
                    Accept Draw
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => handleDrawResponse(false)}
                  >
                    Decline Draw
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => offerDraw(selectedGame._id)}
                    disabled={hasDrawOffer}
                  >
                    {hasDrawOffer ? "Draw Offered" : "Offer Draw"}
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={handleResign}
                  >
                    Resign
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-4">
          <div>
            <p className="font-semibold text-right">You</p>
            <p className="text-sm opacity-75 text-right">
              {isPlayerWhite ? 'White' : 'Black'}
            </p>
          </div>
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img 
                src={authUser.profilePic || "/avatar.png"} 
                alt={authUser.userName} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;