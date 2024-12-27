import { sendInternalError } from "../lib/utils.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId}}).select("-password");// $ne = not equal

        res.status(200).json(filteredUsers);

    } catch (error) {
        sendInternalError(error, res, "getUser");
    }
};

export const getMessages = async (req, res) => {
    try {
        
    } catch (error) {
        sendInternalError(error, res, "getMessages");
    }
};

export const sendMessage = async (req, res) => {
    try {
        
    } catch (error) {
        sendInternalError(error, res, "sendMessage");
    }
};



