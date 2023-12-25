import express from "express"
import GundamsCtrl from "./gundams.controller.js"
import UserCtrl from "./users.controller.js"
import dotenv from "dotenv"
import UserDAO from "../dao/usersDAO.js";
import passport from "passport"
import googlepassport from "passport"
import jwt from 'jsonwebtoken'
dotenv.config()
const router = express.Router()
function authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization']
  console.log("AUTHENTICATE TOKEN\n"+req.session.token);
  //const token = authHeader && authHeader.split(' ')[1]
  const token = req.session.token;
 
  if(token == null) {
    //console.log("No Token",req.session)
    return res.status(401).send("No token")
}
  
  jwt.verify(token, process.env.ACCESS_SECRET, (err,user)=>{
    if (err) {
        req.session.token = null
        console.log(err)
      return res.status(403).send("Wrong token pal")
    }
    //req.user = user
    //console.log("authenticateToken: ",req.session)
    next();
  })
  
  }


router.route("/").get(GundamsCtrl.apiGetGundams)

router.route("/id/:id").get(GundamsCtrl.apiGetGundamsById)

router.route("/search").post(GundamsCtrl.apiSearch)
router.route("/token").post(UserCtrl.apiRefreshToken)

router
.route("/googleuser/:sub")
.get(authenticateToken,UserCtrl.apiGetGoogleUser)

router
.route("/profile")
.get(UserCtrl.apiGetProfile)

router
.route(process.env.USERNAME_URL)
.get(UserCtrl.apiGetUserbyUsername)

router
.route(process.env.USER_URL)

.get(UserCtrl.apiGetUser)
.put(UserCtrl.apiUpdateUser)
.delete(UserCtrl.apiDeleteUser)

router
.route(process.env.NEW_USER)
.post(UserCtrl.apiPostUser)

router 
//env
.route("/login")
.post(passport.authenticate('regular'), (req,res) =>{
  
    console.log("new sessionID: "+req.sessionID);
    
    res.sendStatus(200);
    
})
router 
//env
.route("/googlelogin")
.post(UserCtrl.apiGoogleLogin)

router
.route("/logout")
.post( async (req, res, next)=>{
    if (req.session) {
        req.session.destroy();
        res.send("Goodbye");
       
    } else {
        res.send("No Session")
        
    }
});

router
.route("/checklogin")
.get( authenticateToken,async (req, res, next)=>{
    console.log("YYYYYYY");
    if(req.session.user){ 
     return res.send("In Mainframe")
    }
    return res.send("Not in mainframe")
   
});

router
.route("/addliked")
.put(UserCtrl.apiUpdateLiked);
router
.route("/removeliked")
.put(UserCtrl.apiRemoveLiked);
router
.route("/getliked")
.get(UserCtrl.apiGetLiked);
/*router
.route("/login")
.post( (req, res)=>{
    console.log(req.sessionID)
   const{username, password} = req.body;
   if(username && password){
    if(req.session.authenticated){
        res.json(req.session);
    }
    else{
        if(password==='123'){
            req.session.authenticated = true;
            req.session.user ={
                username, password
            };
            res.json(req.session);
        }
        else{
            res.status(403).json({msg: 'Bad Creentials'});
        }
    }
   }
   else{
    console.log (req.body)
    
    res.status(403).json({msg: 'Bad Credentials'});

   }
    res.status(200)
});*/


export default router