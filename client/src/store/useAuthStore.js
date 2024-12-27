import {create} from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"


export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatintProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data})
        } catch (error) {
            console.log('Error in checkAuth: ', error);
            set({authUser: null})
        } finally{
            set({isCheckingAuth: false})
        }
    },
    
}));