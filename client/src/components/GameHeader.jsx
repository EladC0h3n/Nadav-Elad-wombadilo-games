import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGameStore } from "../store/useGameStore";


const GameHeader = () => {

    const {selectedGame, respondToDrawOffer, subscribeToGameEvents, unsubscribeFromGameEvents} = useGameStore();
    const {authUser} = useAuthStore();
    const {selectedUser} = useChatStore();

    useEffect(() => {
        respondToDrawOffer();
        subscribeToGameEvents();
        return () => unsubscribeFromGameEvents();
    }, [subscribeToGameEvents, unsubscribeFromGameEvents, respondToDrawOffer]);

  return (
    <div className="bg-base-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.userName} />
            </div>
          </div>
          <div>
            <p className="font-semibold">{selectedUser.userName}: </p>
            <p className="text-sm opacity-75">{selectedUser._id === selectedGame.invitedBy ? `Black` : 'White'}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">WOW</p>
          {selectedGame.drawOffer && (
            <div className="mt-2">
              {selectedGame.drawOffer.by === selectedUser._id ? (
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => respondToDrawOffer(selectedGame._id, true)}
                  >
                    Accept Draw
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => respondToDrawOffer(selectedGame._id, false)}
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
            <p className="font-semibold text-right">You</p>
            <p className="text-sm opacity-75 text-right">{selectedUser._id === selectedGame.invitedBy ? 'White' : `Black`}</p>
          </div>
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={authUser.profilePic || "/avatar.png"} alt={authUser.userName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;