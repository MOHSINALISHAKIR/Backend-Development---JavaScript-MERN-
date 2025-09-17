import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
import upload from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRoute = Router();
userRoute.route("/register").post(upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),  registerUser)
userRoute.route("/login").post(loginUser)
//secured Routes
userRoute.route("/logout").post(verifyJWT,logoutUser)
userRoute.route("refresh-token").post(refreshAccessToken)
export default userRoute;