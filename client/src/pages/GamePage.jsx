import { useEffect } from 'react';
import ChatContainer from '../components/ChatContainer';
import GameContainer from '../components/GameContainer';
import { useGameStore } from '../store/useGameStore';

const GamePage = () => {
  const { subscribeToGameEvents, unsubscribeFromGameEvents } = useGameStore();

  useEffect(() => {
    subscribeToGameEvents();
    return () => unsubscribeFromGameEvents();
  }, [subscribeToGameEvents, unsubscribeFromGameEvents]);

  return (
    <div className="container mx-auto min-h-screen pt-20 pb-8">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Chat Container - 5 columns */}
        <div className="col-span-5 bg-base-100 rounded-lg shadow-lg overflow-hidden">
          <ChatContainer />
        </div>

        {/* Game Container - 7 columns */}
        <div className="col-span-7 bg-base-100 rounded-lg shadow-lg overflow-hidden">
          <GameContainer />
        </div>
      </div>
    </div>
  );
};

export default GamePage;