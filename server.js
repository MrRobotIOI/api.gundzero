import express from "express"
import cors from "cors"
import session, { Cookie } from "express-session"
import gundams from "./api/gundams.route.js"
import dotenv from "dotenv"
import passport from "passport"
import passportConfig from "./strategies/local.js";
import { Server } from 'socket.io';
import http from "http"

passportConfig(passport);

const store = new session.MemoryStore();
const app = express()
app.use(express.json())

const sessionMiddleware = session({
  secret:process.env.SESSIONSECRET, // only for deply
  cookie: {maxAge: 1200000, /*sameSite: 'none',secure: true,*/},
  resave: false,
  saveUninitialized: false,
  store,
  
  
})
app.enable('trust proxy');
app.use(sessionMiddleware);
const whitelist = ['http://localhost:5173', 'https://mrrobotioi.github.io'];

// ✅ Enable pre-flight requests


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

app.use(cors(corsOptions));

app.use((req, res, next)=>{
    store.clear;
   //console.log(store);
    
    console.log(`${req.method} - ${req.url} -${req.body.name}`);
    next();
})
app.use("/api/v1/gundams", gundams)
app.use(passport.initialize());
app.use(passport.session())



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