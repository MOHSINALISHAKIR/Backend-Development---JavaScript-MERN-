import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

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
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        return res.josn({success:false,message:"error during generateAccessAndRefreshToken Function"})
        
    }
}
const loginUser = async(req,res)=>{
    const {username,email,password} = req.body;
    if(!username||!email){
        return res.json({success:false,message:"fill the fields"})
    }
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        return res.json({success:false,message:"user not exists"})
    }
    const isPassword = await user.isPasswordCorrect(password)
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly:true,
        secure:true

    }
    return res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json({success:true,message:"user login successfully"})


}

export { registerUser };
