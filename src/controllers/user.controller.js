import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
    try {
        const { username, email, fullName, password } = req.body;

        // Validate input
        if (!username || !email || !fullName || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Check if user exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.json({ success: false, message: "User already exists" });
        }

        // File uploads
        const avatarLocal = req.files?.avatar?.[0]?.path;
        const coverImageLocal = req.files?.coverImage?.[0]?.path;

        if (!avatarLocal) {
            return res.json({ success: false, message: "Avatar image is missing" });
        }

        // Upload to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocal);
        const coverImage = coverImageLocal ? await uploadOnCloudinary(coverImageLocal) : null;

        if (!avatar) {
            return res.json({ success: false, message: "Avatar upload failed" });
        }

        // Create user
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.json({ success: true, message: "User created", user: createdUser });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        console.error("Token generation error:", error.message);
    return null;
        
        
    }
}
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username && !email) {
      return res
        .status(400)
        .json({ success: false, message: "Username or email is required" });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    // Validate password
    const isPassword = await user.isPasswordCorrect(password);
    if (!isPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate tokens
    const tokens = await generateAccessAndRefreshToken(user._id);
    if (!tokens) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate tokens" });
    }

    const { accessToken, refreshToken } = tokens;

    // Fetch user info without password/refreshToken
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true, // set to true in production with HTTPS
    };

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({
        success: true,
        message: "User login successful",
        user: loggedInUser,
      });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
const logoutUser = async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({success:true,message:"user logout successfully"})


}
const refreshAccessToken = async(req,res) => {
  try {
    const incomingToken = req.cookies.refreshToken||req.body.refreshToken;
    if(!incomingToken){
      return res.json({success:false,message:"error in incomingToken refreshAccessToken Function"})
    }
    const decodedToken = await jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(!user){
      return res.json({success:false,message:"error in user not found refresh asscess token function"})
  
    }
    if(incomingToken!==user?.refreshToken){
      return res.json({success:false,message:"tokens not match in refreshaccesstoken funcitons"})
    }
    const options ={
      httpOnly:true,
      secure:true
    }
    const tokens = await generateAccessAndRefreshToken(user._id)
    const {accessToken , newRefreshToken} = tokens
  
    res.cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json({success:true,message:"token refresh successfully!"})
  } catch (error) {
    return res.json({success:false,message:"error in refresh token funciton"})
    
  }

}
export { registerUser,loginUser,logoutUser , refreshAccessToken };
