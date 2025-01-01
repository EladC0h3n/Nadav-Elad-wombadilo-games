import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken, sendInternalError } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { userName, email, password } = req.body;
    try {
      if (!userName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
  
      const userByEmail = await User.findOne({ email });
      if (userByEmail) return res.status(400).json({ message: "Email already exists" });

      const userByName = await User.findOne({ userName });
      if (userByName) return res.status(400).json({ message: "User name already exists" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        userName,
        email,
        password: hashedPassword,
      });
  
      if (newUser) {
        generateToken(newUser._id, res);
        
        await newUser.save();
  
        res.status(201).json({
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        });
      } else {
        return res.status(400).json({ message: "Invalid user data" });
      }
    } catch (error) {
      return sendInternalError(error, res, "signup");
    }
  };

export const login = async (req,res) => {
    const { userName, password } = req.body;
    try {
        if( !userName || !password ){
          return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ userName });

        if (!user) {
          return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        return sendInternalError(error, res, "login");
    }
};

export const logout = (req,res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return sendInternalError(error, res, "logout");
    }
};

export const updateProfile = async (req,res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }
    
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
        );
      
        return res.status(200).json(updatedUser);
    } catch (error) {
      return sendInternalError(error, res, "updateProfile");
    }
};

export const checkAuth = (req,res) => {
    try {
      return res.status(200).json(req.user);// from protectRoute
    } catch (error) {
      return sendInternalError(error, res, "checkAuth");
    }
};