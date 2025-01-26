import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  isTyping: false,
  typingUsers: new Map(), // Map to store userId -> username
  setIsTyping: (value) => set({ isTyping: value }),

  addUserTyping: (userId, username) => set((state) => ({
    typingUsers: new Map(state.typingUsers).set(userId, username)
  })),

  removeUserTyping: (userId) => set((state) => {
    const newMap = new Map(state.typingUsers)
    newMap.delete(userId)
    return { typingUsers: newMap }
  }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({
        messages: [...get().messages, newMessage]
      });
    });

    socket.on("typing", ({ senderId }) => {
      console.log("Received typing event from:", senderId);
      get().addUserTyping(senderId);
    });

    socket.on("stopTyping", ({ senderId }) => {
      console.log("Received stopTyping event from:", senderId);
      get().removeUserTyping(senderId);
    });
  },

  unsubscribeFromMessages: async () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));