import { X, Check, Send, Users, GamepadIcon, Gamepad2Icon, ScrollText, User2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { getUsers, users, setSelectedUser } = useChatStore();
  const { 
    games,
    setSelectedGame,
    gameInvites, 
    getGames, 
    getGameInvites, 
    acceptGameInvite, 
    declineGameInvite, 
    sendGameInvite,
    subscribeToGameEvents,
    unsubscribeFromGameEvents
  } = useGameStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
    getGames();
    getGameInvites();
    subscribeToGameEvents();

    return () => {
      unsubscribeFromGameEvents();
    };
  }, [subscribeToGameEvents, unsubscribeFromGameEvents, declineGameInvite, acceptGameInvite]);

  const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users;
  
  
  
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
        {/* Online Users Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg h-[350px] md:h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Users</h2>
            </div>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User2Icon className="w-5 h-5" />
                  {onlineUsers.includes(user._id) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  <span className="font-medium">{user.userName}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() =>sendGameInvite(user._id)}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-full transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500">No users online</div>
            )}
          </div>
        </div>

        {/* Game Requests Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg h-[350px] md:h-[500px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <ScrollText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Game Requests</h2>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1">
            {gameInvites.map((invite) => (
              <div key={invite._id} className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User2Icon className="w-5 h-5" />
                  <span className="font-medium">{invite.invitedBy?.userName}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => declineGameInvite(invite._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => acceptGameInvite(invite._id)}
                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {gameInvites.length === 0 && (
              <div className="text-center text-gray-500">No game requests</div>
            )}
          </div>
        </div>

        {/* Active Games Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg h-[350px] md:h-[500px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Gamepad2Icon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Active Games</h2>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1">
            {games.map((game) => (
              <div key={game._id} className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GamepadIcon className="w-4 h-4" />
                  <span className="font-medium">
                    Playing with {game.players.find(p => p._id !== authUser._id).userName}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedGame(game);
                    setSelectedUser(game.players.find(p => p._id !== authUser._id))
                    navigate(`/game`)
                  }}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                  Enter Game
                </button>
              </div>
            ))}
            {games.length === 0 && (
              <div className="text-center text-gray-500">No active games</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;