import express from 'express';
const router = express.Router();


router.get("/check", protectRoute, checkAuth);

router.post("/login",login);
router.post("/logout", protectRoute, logout);
router.post("/signup",signup);

router.put("/update-profile", protectRoute, signup);


export default router;