import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGameStore = create((set, get) => ({
  games: [],
  gameInvites: [],
  gameDetails: null,
  selectedGame: null,
  isGamesLoading: false,
  isInvitesLoading: false,
  isGameDetailsLoading: false,

  getGame: async (gameId) => {
    set({ isGameDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/game/${gameId}`);
      set({ gameDetails: res.data });
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

  // Make a move in a game
  makeMove: async (gameId, from, to) => {
    try {
      const res = await axiosInstance.post(`/game/move/${gameId}`, { from, to });
      
      // Update the game in the games list
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        gameDetails: state.gameDetails?._id === gameId ? res.data : state.gameDetails
      }));

      // Check for checkmate/game over
      if (res.data.status === 'completed') {
        const winnerMessage = res.data.winner ? 
          `Game Over - ${res.data.winner.username} wins!` : 
          "Game Over - Draw!";
        toast.success(winnerMessage);
      }

      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error making move");
      return null;
    }
  },

  // Offer a draw
  offerDraw: async (gameId) => {
    try {
      const res = await axiosInstance.post(`/game/${gameId}/draw/offer`);
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        gameDetails: state.gameDetails?._id === gameId ? res.data : state.gameDetails
      }));
      toast.success("Draw offered to opponent");
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
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        gameDetails: state.gameDetails?._id === gameId ? res.data : state.gameDetails
      }));
      toast.success(accept ? "Draw accepted" : "Draw declined");
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
      set(state => ({
        games: state.games.map(game => 
          game._id === gameId ? res.data : game
        ),
        gameDetails: state.gameDetails?._id === gameId ? res.data : state.gameDetails
      }));
      toast.success("Game resigned");
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
  
  // Clear game details (useful when unmounting game component)
  clearGameDetails: () => {
    set({ gameDetails: null });
  },

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
    
    socket.on("moveMade", (data) => {
      get().getGames(); // Refresh games to get updated positions
    });
    
    socket.on("gameResigned", (data) => {
      get().getGames();
      toast.info("Opponent resigned the game");
    });

    socket.on("drawOffered", (data) => {
      get().getGames();
      toast.info("Draw offered");
    });

    socket.on("drawOfferResponse", (data) => {
      get().getGames();
      toast.info(data.accepted ? "Draw accepted" : "Draw declined");
    });
  },

  unsubscribeFromGameEvents: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("gameInvite");
    socket.off("gameInviteAccepted");
    socket.off("gameInviteDeclined");
    socket.off("moveMade");
    socket.off("gameResigned");
    socket.off("drawOffered");
    socket.off("drawOfferResponse");
  },

  setSelectedGame: (selectedGame) => set({ selectedGame }),
}));