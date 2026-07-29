const register = async (req,res)=>
{
    try{
        res.status(200).json({
            sucess:"ok"
        })
    }catch(e){
        console.log(e)
    }
}

module.exports = register