const app = require("./app");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const db_conn = require("./db/conn");
db_conn().then(()=>
{
app.listen(process.env.port,()=>
{
    console.log(`http://localhost:${process.env.port}`)
})
}).catch((e)=>
{
    console.log("opps some error occured!!!")
})
