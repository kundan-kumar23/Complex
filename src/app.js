const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors")
require('dotenv').config()


app.use(cors());
app.use(cookieParser())
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(express.urlencoded({extended : true,limit:"16kb"}))

// import routes

const userRoute = require("./routes/user.routes.js");

// route declare

app.use("/api/v1/users",userRoute)


module.exports = app