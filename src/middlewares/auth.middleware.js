const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.acessToken;

        if (!token) {
            return res.status(401).json({
                error: "Unauthorized access",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(401).json({
                error: "Unauthorized access",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Unauthorized access",
        });
    }
};

module.exports = authMiddleware;