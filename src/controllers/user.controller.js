const User = require("../models/user.model");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const isPasswordCorrect = require("../models/user.model");
const accessToken = require("../models/user.model");
const refreshToken = require("../models/user.model");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  try {
    let { username, fullname, email, password } = req.body;
    if ([username, fullname, email, password].some((e) => e?.trim() == "")) {
      return res.status(400).json({
        error: "Please fill all required field",
      });
    }

    let existed_user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existed_user) {
      return res.status(400).json({
        error: "user already exist",
      });
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //  const coverImageLocalPath =req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
      return res.status(400).json({
        error: "missing avatar image",
      });
    }

    let avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage;

    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
      return res.status(500).json({
        error: "internal server error",
      });
    }

    let user = await User.create({
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      password,
      email,
      fullname,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res.status(500).json({
        error: "internal server error",
      });
    }

    return res.status(200).json({
      success: "sucessfully registered",
      data: createdUser,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        error: "please provide username and email",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      return res.status(400).json({
        error: "user not found",
      });
    }

    let isMatch = await user.isPasswordCorrect(password);
    // let isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) {
      return res.status(400).json({
        error: "invalid credentials",
      });
    }

    const acessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const logginuser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("acessToken", acessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        sucess: "login sucessfully",
        data: { logginuser, acessToken, refreshToken },
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error",
    });
  }
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("acessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      sucess: "logout sucessfully",
    });
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        error: "Refresh token is required",
      });
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token",
    });
  }
};



const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                error: "Please provide old and new passwords"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const isMatch = await user.isPasswordCorrect(oldPassword);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid old password"
            });
        }

        user.password = newPassword;

        await user.save({
            validateBeforeSave: false
        });

        return res.status(200).json({
            success: "Password updated successfully"
        });

    } catch (err) {
      console.log(err)
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


const updateavatar = async(req,res)=>
{
  try{

    let localavatarpath = req.file?.path
    if(!localavatarpath)
    {
      return res.status(400).json({
        error : "please provide path"
      })
    }

    let avatarImage = await uploadOnCloudinary(localavatarpath);
    if(!avatarImage?.url){
      return res.status(400).json({
        error : "internal server error"
      })
    }

    let resuser = await User.findByIdAndUpdate(req.user?._id,{
       $set:{
        avatar : avatarImage.url
       }
    },{
      new : true
    }).select("-password -refreshToken")

    return res.status(200).json({
      success : "sucessfully changed avatar"
    })

  }catch(e){
    return res.status(500).json({
      error : "internal server error"
    })
  }
}

const updatecover = async(req,res)=>
{
  try{

    let localcoverpath = req.file?.path
    if(!localcoverpath)
    {
      return res.status(400).json({
        error : "please provide path"
      })
    }

    let coverImage = await uploadOnCloudinary(localcoverpath);
    if(!coverImage?.url){
      return res.status(400).json({
        error : "internal server error"
      })
    }

    let resuser = await User.findByIdAndUpdate(req.user?._id,{
       $set:{
        coverImage : coverImage.url
       }
    },{
      new : true
    }).select("-password -refreshToken")

    return res.status(200).json({
      success : "sucessfully changed coverImage"
    })

  }catch(e){
    return res.status(500).json({
      error : "internal server error"
    })
  }
}


const updateProfile = async(req,res)=>
{
    try {
      let {fullname,email} = req.body;
  
      if([fullname,email].some((e)=>e.trim() == ""))
      {
        return res.status(400).json({
          error : "please provide all field"
        })
      }
  
     let updateduser = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
          fullname,
          email
     }
      },
    {
      new : true
    }).select("-password -refreshToken")
  
    if(!updateduser)
    {
      return res.status(401).json({
        error : "something went wrong"
      })
    }
  
    return res.status(200).json({
      sucess : "sucessfully updated"
    })
    } catch (error) {
      return res.status(500).json({
        error : "internal server error"
      })
    }
}




module.exports = { register, login, logout, refreshAccessToken, changePassword,updateavatar, updatecover,updateProfile };
