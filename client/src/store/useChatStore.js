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

  unreadMessages: new Map(),

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

  initializeUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get('/messages/unread/counts');
      const unreadMap = new Map(res.data.map(({_id, count}) => [_id, count]));
      set({ unreadMessages: unreadMap });
    } catch (error) {
      console.error(error);
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      await get().initializeUnreadCounts();
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
      await get().initializeUnreadCounts();
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

    socket.on("newMessage", async (newMessage) => {
      const { senderId } = newMessage;
      const loggedInUserId = useAuthStore.getState().authUser._id;

      if (senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      } else if (newMessage.receiverId === loggedInUserId) {
        await get().initializeUnreadCounts();
      }
    });

    socket.on("typing", ({ senderId }) => {
      get().addUserTyping(senderId);
    });

    socket.on("stopTyping", ({ senderId }) => {
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