import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGameStore = create((set, get) => ({
  games: [],
  gameInvites: [],
  isGamesLoading: false,
  isInvitesLoading: false,

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
}));