import express from "express"
import GundamsCtrl from "./gundams.controller.js"
import UserCtrl from "./users.controller.js"
import dotenv from "dotenv"
import passport from "passport"
import googlepassport from "passport"
dotenv.config()
const router = express.Router()
router.route("/").get(GundamsCtrl.apiGetGundams)

router.route("/id/:id").get(GundamsCtrl.apiGetGundamsById)

router.route("/search").post(GundamsCtrl.apiSearch)


router
.route(process.env.GOOGLEUSER_URL)
.get(UserCtrl.apiGetGoogleUser)

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
.post(googlepassport.authenticate('googlejwt'), (req,res) =>{
  
    console.log("new googlesessionID: "+req.sessionID);
    
    res.json({sub: req.session.passport.user.sub});
    
})

router
.route("/logout")
.post( async (req, res, next)=>{
    if (req.session.passport) {
        req.session.destroy();
        res.send("Goodbye");
       
    } else {
        res.send("No Session")
        
    }
});

router
.route("/checklogin")
.post( async (req, res, next)=>{
    if (req.session.passport) {
      
        res.send("In Mainframe");
      
    } else {
      
        res.status(401).send("Not in Mainframe");
    }
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