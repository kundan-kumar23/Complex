const express = require("express")
const {register, login, logout, refreshAccessToken, changePassword, updateavatar,updatecover, updateProfile} = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router()

router.post("/register",upload.fields(
    [
        {
            name : "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]
),register);

router.post("/login",login)
router.post("/logout",authMiddleware,logout)
router.post("/refresh-token",refreshAccessToken)
router.post("/changePassword",authMiddleware,changePassword)
router.post("/updateavatar",authMiddleware,upload.single("avatar"),updateavatar)
router.post("/updatecover",authMiddleware,upload.single("coverImage"),updatecover)
router.post("/updatedprofile",authMiddleware,updateProfile)



module.exports = router;