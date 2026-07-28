const app = require("./app");
const db_conn = require("./db/conn");
db_conn().then(()=>
{
app.listen(process.env.port,()=>
{
    console.log(`http://localhost:${process.env.port}`)
})
})
