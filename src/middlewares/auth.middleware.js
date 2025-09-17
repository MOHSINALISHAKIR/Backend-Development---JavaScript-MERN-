import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
export const verifyJWT = async(req,res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            return res.json({success:false,message:"token not exist in auth.js"})
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
           return res.json({success:false,message:"user not exist in auth.js"})
        }
    
        req.user = user;
        next()
    } catch (error){
        return res.json({success:false,message:"error in auth middleware"})
    }
    
}