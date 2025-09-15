import { registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
const userRoute = Router();
userRoute.route("/register").post(registerUser)
export default userRoute;