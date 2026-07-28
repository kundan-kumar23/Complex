const mongoose = require("mongoose");

const db_conn = async()=>
{
    try{
        await mongoose.connect(process.env.Mongo_uri);
        console.log("sucessfully connected to database")
    }catch(e){
    console.log(e)
    }
}

module.exports = db_conn