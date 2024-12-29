import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true, // prevent XSS attacks cross-site scripting attacks
      sameSite: "strict", // CSRF attacks cross-site request forgery attacks
      secure: true, 
    });
  
    return token;
};

export const sendInternalError = (error, res, controller) => {
  console.log(`Error in ${controller} controller`, error.message);
  return res.status(500).json({ message: "Internal Server Error" });
}