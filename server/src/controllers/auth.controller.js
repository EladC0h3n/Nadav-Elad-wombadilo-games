import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";


export const signup = async (res,req) => {
    const { userName, email, password } = req.body;
    try {
        if( !userName || !email || !password ){
            res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6){
            res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            res.status(400).json({ message: "Email already exists" });
        }

        const userByUsername = await User.findOne({ userName });
        if (userByUsername) {
            res.status(400).json({ message: "UserName already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            userName,
            password: hashedPassword,
        });

        if(newUser){
            generateToken(newUser._id, res);
      
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (res,req) => {
    try {
        
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (res,req) => {
    try {
        
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (res,req) => {
    try {
        
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (res,req) => {
    try {
        
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};