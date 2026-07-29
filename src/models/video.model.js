const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const videoSchema = new mongoose.Schema({
    videoFile :{
        type : String, // cloudanary url
        required : true
    },
    thumbnail : {
         type : String, // cloudanary url
        required : true
    },
    title:{
         type : String,
        required : true
    },
    description:
    {
         type : String,
        required : true
    },
    duration:{
        type : Number,
        required : true
    },
    views:{
        type : Number,
        default : 0
    },
    isPublished:{
        type : Boolean,
        default : true
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
 })

 videoSchema.plugin(mongooseAggregatePaginate)
const Video = mongoose.model("Video",videoSchema);
module.exports = Video