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

module.exports = app