import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    
    /*
    1. get user details from frontend
    2. validations - not empty
    3. check if user already exists: userName/email
    4. check for images, check for avatar
    5. upload them to cloudinary, avatar
    6. create userobject - create entry in db
    7. remove password and refreshToken field from response
    8. check for user creation
    9. return response
    */

    const {fullName, email, userName, password} = req.body

    if(
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists
    const existedUser = User.findOne({
        $or: [{userName},{email}]
    })
    if(existedUser)
    {
        throw new ApiError(409, "User already exists")
    }

    //check for images and avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar)
    throw new ApiError(400, "Avatar File is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = User.findById(user._id).select("-password -refreshToken")

    if(!createdUser)
    throw new ApiError(500, "Something went wrong while user registration")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

} )


export {registerUser}