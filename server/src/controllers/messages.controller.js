import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { sendInternalError } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

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
        const { id: receiverId } = req.params;
        const loggedInUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: receiverId },
                { senderId: receiverId, receiverId: loggedInUserId },
              ], 
        });

        res.status(200).json(messages);
    } catch (error) {
        sendInternalError(error, res, "getMessages");
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }else if(text.length <= 0) {
            res.status(400).json({ message: "Please send text or/and image" })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        sendInternalError(error, res, "sendMessage");
    }
};



