import app from "./server.js"
import mongodb, { MongoClient } from "mongodb"
import dotenv from "dotenv"
import GundamsDAO from "./dao/gundamsDAO.js"
import UsersDAO from "./dao/usersDAO.js"

dotenv.config()

const port = process.env.PORT || 8000

MongoClient.connect(
    process.env.GUND_DB_URI,
    {
        maxPoolSize:50,
        wtimeoutMS: 2500,
         }
    
)
.catch(err => {
    console.error(err.stack)
    process.exit(1)
})
.then(async client =>{
    await GundamsDAO.injectDB(client)
    await UsersDAO.injectDB(client)
 
    app.listen(port, () =>{
        console.log(`listening on port ${port}`)
    })
   


})