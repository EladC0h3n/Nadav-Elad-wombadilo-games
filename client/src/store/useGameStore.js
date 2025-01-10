import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGameStore = create((set, get) => ({
  games: [],
  gameInvites: [],
  selectedGame: null,
  isGamesLoading: false,
  isInvitesLoading: false,
  isGameDetailsLoading: false,

  getGame: async (gameId) => {
    set({ isGameDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/game/${gameId}`);
      set({ selectedGame: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching game details");
      return null;
    } finally {
      set({ isGameDetailsLoading: false });
    }
  },

  // Get all active games
  getGames: async () => {
    set({ isGamesLoading: true });
    try {
      const res = await axiosInstance.get("/game/games");
      set({ games: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching games");
    } finally {
      set({ isGamesLoading: false });
    }
  },

  // Make a move
  makeMove: async (gameId, from, to) => {
    try {
      const res = await axiosInstance.post(`/game/move/${gameId}`, { from, to });
      
      // Update local state
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        selectedGame: state.selectedGame?._id === gameId ? res.data : state.selectedGame
      }));

      // Get socket from auth store
      const socket = useAuthStore.getState().socket;
      
      // Emit move with complete game state
      socket.emit("makeMove", {
        gameId,
        move: { from, to },
        game: res.data  // Send the complete populated game
      });

      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error making move");
      return null;
    }
  },

  // Offer draw
  offerDraw: async (gameId) => {
    try {
      const res = await axiosInstance.post(`/game/${gameId}/draw/offer`);
      const socket = useAuthStore.getState().socket;
      
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        selectedGame: state.selectedGame?._id === gameId ? res.data : state.selectedGame
      }));

      socket.emit("offerDraw", { gameId });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error offering draw");
      return null;
    }
  },

  // Respond to draw offer
  respondToDrawOffer: async (gameId, accept) => {
    try {
      const res = await axiosInstance.post(`/game/${gameId}/draw/respond`, { accept });
      const socket = useAuthStore.getState().socket;
      
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        selectedGame: state.selectedGame?._id === gameId ? res.data : state.selectedGame
      }));

      socket.emit("drawResponse", { gameId, accept });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error responding to draw");
      return null;
    }
  },

  // Resign game
  resignGame: async (gameId) => {
    try {
      const res = await axiosInstance.post(`/game/${gameId}/resign`);
      const socket = useAuthStore.getState().socket;
      
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        selectedGame: state.selectedGame?._id === gameId ? res.data : state.selectedGame
      }));

      socket.emit("resignGame", { gameId });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resigning game");
      return null;
    }
  },
  
  // Get game invites
  getGameInvites: async () => {
    set({ isInvitesLoading: true });
    try {
      const res = await axiosInstance.get("/game/invites");
      set({ gameInvites: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching invites");
    } finally {
      set({ isInvitesLoading: false });
    }
  },

  // Send game invite
  sendGameInvite: async (opponentId) => {
    try {
      await axiosInstance.post("/game/invite", { opponentId });
      toast.success("Game invite sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending invite");
    }
  },
  
  // Accept game invite
  acceptGameInvite: async (gameId) => {
    try {
      const res = await axiosInstance.post(`/game/invite/${gameId}/accept`);
      set(state => ({
        games: [ res.data, ...state.games],
        gameInvites: state.gameInvites.filter(invite => invite._id !== gameId)
      }));
      toast.success("Game invite accepted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error accepting invite");
    }
  },
  
  // Decline game invite
  declineGameInvite: async (gameId) => {
    try {
      await axiosInstance.post(`/game/invite/${gameId}/decline`);
      set(state => ({
        gameInvites: state.gameInvites.filter(invite => invite._id !== gameId)
      }));
      toast.success("Game invite declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error declining invite");
    }
  },

  setSelectedGame: (selectedGame) => set({ selectedGame }),

  // Socket subscriptions
  subscribeToGameEvents: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("gameInvite", (data) => {
      get().getGameInvites();
      toast.success("New game invite received!");
    });
    
    socket.on("gameInviteAccepted", (data) => {
      get().getGames();
      toast.success("Game invite accepted!");
    });
    
    socket.on("gameInviteDeclined", (data) => {
      toast.info("Game invite declined");
    });
    
    socket.on("moveMade", ({ gameId, newPosition }) => {
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId 
            ? { ...game, currentPosition: newPosition }
            : game
        ),
        selectedGame: state.selectedGame?._id === gameId 
          ? { ...state.selectedGame, currentPosition: newPosition }
          : state.selectedGame
      }));
    });
    
    socket.on("gameResigned", ({ gameId }) => {
      get().getGame(gameId); // Refresh game state
      toast.info("Opponent resigned the game");
    });

    socket.on("drawOffered", ({ gameId }) => {
      get().getGame(gameId); // Refresh game state
      toast.info("Draw offered by opponent");
    });

    socket.on("drawResponseReceived", ({ gameId, accepted }) => {
      get().getGame(gameId); // Refresh game state
      toast.info(accepted ? "Draw accepted" : "Draw declined");
    });

    // Join game room when game is selected
    if (get().selectedGame?._id) {
      socket.emit("joinGame", get().selectedGame._id);
    }
  },

  unsubscribeFromGameEvents: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("gameInvite");
    socket.off("gameInviteAccepted");
    socket.off("gameInviteDeclined");
    socket.off("moveMade");
    socket.off("gameResigned");
    socket.off("drawOffered");
    socket.off("drawResponseReceived");

    // Leave game room if there was a selected game
    if (get().selectedGame?._id) {
      socket.emit("leaveGame", get().selectedGame._id);
    }
  },
}));