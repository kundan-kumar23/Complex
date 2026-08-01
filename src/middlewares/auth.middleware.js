const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
export const authMiddleware = async (req,res,next)=>
{
    try{
   
    const token = req.cookies.acessToken

    if(!token)
    {
        return res.status(400).json({
            error : "unauthorised access"
        })
    }

    let decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    let user = await User.findById(decode._id).select("-password -refreshToken")
    if(!user)
    {
        return res.status(400).json({
            error : "unauthorised access"
        })
    }
    req.user = user;
    next();
         
    }catch(e)
    {
        return res.status(400).json({
            error : "unauthorised access"
        })
    }
}