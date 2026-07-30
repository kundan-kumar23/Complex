const User = require("../models/user.model")
const { uploadOnCloudinary } = require("../utils/cloudinary")

const register = async (req,res)=>
{
    try{
       let {username,fullname,email,password} = req.body
      if([username,fullname,email,password].some((e)=>e?.trim() == ""))
      {
        return res.status(400).json({
            error : "Please fill all required field"
        })
      }

      let existed_user =await User.findOne({
        $or:[
            { username },
            { email }
        ]
    }
      )

      if(existed_user)
      {
         return res.status(400).json({
            error : "user already exist"
        })
      }

     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath =req.files?.coverImage[0]?.path;

     if(!avatarLocalPath)
     {
         return res.status(400).json({
            error : "missing avatar image"
        })
     }

     let avatar = await uploadOnCloudinary(avatarLocalPath)
     if(coverImageLocalPath)
     {
        let coverImage = await uploadOnCloudinary(coverImageLocalPath);
     }
     

     if(!avatar)
     {
         return res.status(500).json({
            error : "internal server error"
        })
     }

     let user = await User.create({
        username: username.toLowerCase(),
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password,
        email,
        fullname
     })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )

     if(!createdUser)
     {
         return res.status(500).json({
            error : "internal server error"
        })
     }

     return res.status(200).json({
        success : "sucessfully registered",
        data : createdUser
     })
    
    }catch(e){
       return res.status(500).json({
        error : "internal server error"
       })
    }
}

module.exports = register