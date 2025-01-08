import { useEffect } from 'react';
import ChatContainer from '../components/ChatContainer';
import GameContainer from '../components/GameContainer';
import GameHeader from '../components/GameHeader';
import { useGameStore } from '../store/useGameStore';

const GamePage = () => {
  const { subscribeToGameEvents, unsubscribeFromGameEvents } = useGameStore();

  useEffect(() => {
    subscribeToGameEvents();
    return () => unsubscribeFromGameEvents();
  }, [subscribeToGameEvents, unsubscribeFromGameEvents]);

  return (
    <div className="fixed inset-0 flex flex-col bg-base-300">
      <div className="flex-1 container mx-auto pt-16 px-4 pb-4 flex flex-col overflow-hidden">
        {/* Game Header */}
        <div className="rounded-t-lg mb-4">
          <GameHeader />
        </div>

        <div className="flex gap-4 min-h-0 flex-1 lg:flex-row flex-col">
          {/* Chat Container */}
          <div className="lg:w-1/3 bg-base-100 rounded-lg shadow-lg 
                        lg:order-1 order-2
                        flex min-h-0
                        h-[400px] lg:h-auto">
            <ChatContainer hideHeader={true} />
          </div>

          {/* Game Container */}
          <div className="lg:w-2/3 bg-base-100 rounded-lg shadow-lg 
                        lg:order-2 order-1
                        flex min-h-0
                        h-[400px] lg:h-auto">
            <GameContainer hideHeader={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;