import express from "express"
import cors from "cors"
import session, { Cookie } from "express-session"
import gundams from "./api/gundams.route.js"
import dotenv from "dotenv"
import passport from "passport"
import passportConfig from "./strategies/local.js";
import { Server } from 'socket.io';
import http from "http"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import MongoStore from "connect-mongo"

function authenticateToken(req,res,next) {
  const authHeader = req.headers['authorization']

//const token = authHeader && authHeader.split(' ')[1]
const token = req.session.token
if(token == null) {
  console.log("No Token",req.session)
  return res.status(401).send("No token")
}

jwt.verify(token, process.env.ACCESS_SECRET, (err,user)=>{
  if (err) {
      req.session.token = null
      console.log(err)
    return res.status(403).send("Wrong token pal")
  }
  req.user = user
  console.log("authenticateToken: ",req.session)
  next();
})

}
const app = express()



app.use(express.json())
app.use(express.urlencoded({extended: true}));

const sessionMiddleware = session({
  secret:process.env.SESSIONSECRET, // only for deply
  cookie: {maxAge: 1200000  /*sameSite: 'none',secure: true,*/},
  resave: false,
  saveUninitialized: false,  
  store: MongoStore.create({
    mongoUrl: process.env.GUND_DB_URI
  })
})

app.enable('trust proxy');
app.use(sessionMiddleware);
const whitelist = ['http://localhost:5173', 'https://mrrobotioi.github.io',"https://gund-zero.onrender.com"];

//

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8000', "https://mrrobotioi.github.io","https://gund-zero.onrender.com"],
  credentials: true,
  
}));

app.use((req, res, next)=>{
  
  console.log("Middlewarexxxxxxxxxxxx")
  console.log("Session Id:",req.sessionID)
      console.log(`${req.method} - ${req.url} -${req.user}`);
      console.log(req.session.token+"\n"+req.session.user)
      console.log("xxxxxxxxxxxxxxxxxx")
      next();
  })

app.use("/api/v1/gundams", gundams)




app.use("*", (req,res) => res.status(404).json({error: "not found"}))
/*const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  }
});

io.engine.use(sessionMiddleware)
io.on("connection", (socket) => {
 socket.emit('custom',10, 'Hello')
  console.log(socket.id)
});

app.get("/logind", (req,res) => {
  
  
});
server.listen(8080, () => {
  console.log('Listening on *:8080');
});*/
export default app 