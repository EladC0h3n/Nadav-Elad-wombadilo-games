import { create } from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { unsubscribe } from 'diagnostics_channel';

export const useGameStore = create((set, get) => ({
  // State
  currentGame: null,
  games: [],
  gameInvites: [],
  loading: false,
  activeGameRoom: null, // Track current game room

  initializeSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Setup socket event listeners
    socket.on("moveMade", (moveData) => get().handleMoveMade(moveData));
    socket.on("drawOffered", (drawData) => get().handleDrawOffered(drawData));
    socket.on("drawOfferResponse", (responseData) => get().handleDrawResponse(responseData));
    socket.on("gameResigned", (resignData) => get().handleGameResigned(resignData));
    socket.on("gameInvite", (inviteData) => get().handleGameInvite(inviteData));
    socket.on("gameInviteAccepted", (acceptData) => get().handleGameInviteAccepted(acceptData));
    socket.on("gameInviteDeclined", (declineData) => get().handleGameInviteDeclined(declineData));
  },
  
  // Socket room management
  joinGameRoom: (gameId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !gameId) return;

    // Leave current game room if any
    if (get().activeGameRoom) {
      socket.emit("leaveGame", get().activeGameRoom);
    }

    socket.emit("joinGame", gameId);
    set({ activeGameRoom: gameId });
  },

  leaveGameRoom: () => {
    const socket = useAuthStore.getState().socket;
    const activeGameRoom = get().activeGameRoom;
    if (!socket || !activeGameRoom) return;

    socket.emit("leaveGame", activeGameRoom);
    set({ activeGameRoom: null });
  },

  getGame: async (gameId) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.get(`/game/${gameId}`);
        set({ currentGame: response.data });

        // Automatically join game room when fetching a game
        get().joinGameRoom(gameId);

        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to fetch game' );
    } finally {
        set({ loading: false });
    }
  },

  // Game Actions
  makeMove: async (gameId, from, to) => {
    set({ loading: true });
    try {
        const response = await axiosInstance.post(`/game/move/${gameId}`, { from, to });
        set({ currentGame: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to make move' );
    } finally {
        set({ loading: false });
    }
  },

  getGames: async () => {
    set({ loading: true});
    try {
        const response = await axiosInstance.get('/game/games');
        set({ games: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to fetch games' );
    } finally {
        set({ loading: false });
    }
  },

  // Draw Handling
  offerDraw: async (gameId) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.post(`/game/${gameId}/draw/offer`);
        set({ currentGame: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to offer draw' );
    } finally {
        set({ loading: false });
    }
  },

  respondToDrawOffer: async (gameId, accept) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.post(`/game/${gameId}/draw/respond`, { accept });
        set({ currentGame: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to respond to draw offer' );
    } finally {
        set({ loading: false });
    }
  },

  // Game Status Actions
  resign: async (gameId) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.post(`/game/${gameId}/resign`);
        set({ currentGame: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to resign game' );
    } finally {
        set({ loading: false });
    }
  },

  // Game Invites
  sendGameInvite: async (opponentId) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.post('/game/invite', { opponentId });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to send game invite' );
    } finally {
      set({ loading: false });
    }
  },

  acceptGameInvite: async (gameId) => {
    set({ loading: true});
    try {
        const response = await axiosInstance.post(`/game/invite/${gameId}/accept`);
        set(state => ({
            gameInvites: state.gameInvites.filter(invite => invite._id !== gameId),
            games: [...state.games, response.data]
        }));
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to accept game invite' );
    } finally {
        set({ loading: false });
    }
  },

  declineGameInvite: async (gameId) => {
    set({ loading: true});
    try {
        await axiosInstance.post(`/game/invite/${gameId}/decline`);
        set(state => ({
            gameInvites: state.gameInvites.filter(invite => invite._id !== gameId)
        }));
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to decline game invite' );
    } finally {
        set({ loading: false });
    }
  },

  getGameInvites: async () => {
    set({ loading: true});
    try {
        const response = await axiosInstance.get('/game/invites');
        console.log(response)
        set({ gameInvites: response.data });
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message || 'Failed to fetch game invites' );
    } finally {
        set({ loading: false });
    }
  },
  handleMoveMade: (moveData) => {
    const { currentGame } = get();
    if (currentGame?._id === moveData.gameId) {
      set(state => ({
        currentGame: {
          ...state.currentGame,
          currentPosition: moveData.fen,
          status: moveData.isGameOver ? 'completed' : state.currentGame.status,
          winner: moveData.isCheckmate ? moveData.by : state.currentGame.winner,
          turn: state.currentGame.players.find(
            playerId => playerId.toString() !== moveData.by.toString()
          )
        }
      }));
    }
  },

  handleDrawOffered: (drawData) => {
    const { currentGame } = get();
    if (currentGame?._id === drawData.gameId) {
      set(state => ({
        currentGame: {
          ...state.currentGame,
          drawOffer: {
            by: drawData.offeredBy,
            offeredAt: new Date()
          }
        }
      }));
    }
  },

  handleDrawResponse: (responseData) => {
    const { currentGame } = get();
    if (currentGame?._id === responseData.gameId) {
      set(state => ({
        currentGame: {
          ...state.currentGame,
          status: responseData.accepted ? 'drawn' : state.currentGame.status,
          result: responseData.accepted ? 'draw' : state.currentGame.result,
          drawOffer: undefined
        }
      }));
    }
  },

  handleGameResigned: (resignData) => {
    const { currentGame } = get();
    if (currentGame?._id === resignData.gameId) {
      set(state => ({
        currentGame: {
          ...state.currentGame,
          status: 'resigned',
          result: 'resignation',
          winner: resignData.winner
        }
      }));
    }
  },

  handleGameInvite: (inviteData) => {
    set(state => ({
      gameInvites: [...state.gameInvites, inviteData]
    }));
  },

  handleGameInviteAccepted: (acceptData) => {
    get().getGames();
  },

  handleGameInviteDeclined: (declineData) => {
    set(state => ({
      gameInvites: state.gameInvites.filter(invite => invite._id !== declineData.gameId)
    }));
  },

  resetStore: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      // Leave current game room if any
      const activeGameRoom = get().activeGameRoom;
      if (activeGameRoom) {
        socket.emit("leaveGame", activeGameRoom);
      }

      // Remove all listeners
      socket.off("moveMade");
      socket.off("drawOffered");
      socket.off("drawOfferResponse");
      socket.off("gameResigned");
      socket.off("gameInvite");
      socket.off("gameInviteAccepted");
      socket.off("gameInviteDeclined");
    }
    
    set({
      currentGame: null,
      games: [],
      gameInvites: [],
      loading: false,
      activeGameRoom: null
    });
  }
}));

useAuthStore.subscribe(
    (state) => state.socket,
    (socket) => {
      if (socket) {
        useGameStore.getState().initializeSocket();
      }
    }
  );

