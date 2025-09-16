import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFile)=>{
    if(!localFile) return null;
    try {
        const response = await cloudinary.uploader.upload(localFile,{
            resource_type:"auto"
        })
        // file has been uploaded successfully
        console.log("file uploaded",response.url)
        fs.unlinkSync(localFile)

        return response
        
    } catch (error) {
        fs.unlinkSync(localFile)
        return null;
        
    }
}
export default uploadOnCloudinary;