import { X, Check, Send, Users, GamepadIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

const HomePage = () => {
  const { getUsers, users, setSelectedUser, isUsersLoading } = useChatStore();

  useEffect(() => {
      getUsers();
    }, [getUsers]);

  const {onlineUsers} = useAuthStore();

  const onlyOnlineUsers = users.filter(user => onlineUsers.includes(user._id));
  
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
        {/* Game Requests Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Game Requests</h2>
          </div>
          
          <div className="space-y-3">
            {/* Sample request item - you'll map through your actual requests */}
            <div className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
              <span className="font-medium">Username</span>
              <div className="flex gap-2">
                <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Online Users Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Online Users</h2>
          </div>
          
          <div className="space-y-3">
            {/* Sample online user - you'll map through your actual online users */}
            {onlyOnlineUsers.map((user) => (
              <div className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{user.userName}</span>
                </div>
                <button 
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-full transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Games Section */}
        <div className="bg-base-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <GamepadIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Active Games</h2>
          </div>
          
          <div className="space-y-3">
            {/* Sample active game - you'll map through your actual active games */}
            <div className="bg-base-100 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GamepadIcon className="w-4 h-4" />
                <span className="font-medium">Playing with Username</span>
              </div>
              <button 
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
              >
                Enter Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;