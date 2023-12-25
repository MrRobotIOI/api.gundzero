import GundamsDAO from "../dao/gundamsDAO.js";
import UsersDAO from "../dao/usersDAO.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import jwt_decode from "jwt-decode";
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '20s'})
}

export default class UsersController {
  
    static async apiGetUser(req, res, next) {
        //Checks if logged in before making requests
        if(req.user){
            //This is so a logged in user cannot access another users data
            if(req.params.userId !== req.user._id){
                res.status(403).json({ error: "Ur not that guy pal" })
                return
            }
            console.log(req.user);
    
        
        try {
          let userId = req.params.userId
          let user = await UsersDAO.getUserbyId(userId)
        
          if (!user) {
            res.status(404).json({ error: "User Not found" })
            return
          }
          res.json(user)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
    }
    else{
      
        res.status(403).send({msg: 'Not Authenticated'})
    }
      } 
      static async apiGoogleLogin(req,res){
        
        var decodedToken = jwt_decode(req.body.jwt);
       
        try {
            //Verifying token
            if(decodedToken.aud !== process.env.CLIENTID){
                console.log("WRONG AUD")
                res.status(403).send({msg: 'Not Authenticated'})
            }
            if(decodedToken.iss !== "https://accounts.google.com" ){
                if(decodedToken.iss !== "accounts.google.com"){
                    console.log("WRONG ISS")
                    res.status(403).send({msg: 'Not Authenticated'})
                }
                
            }
           if(decodedToken.exp < new Date()/1000){
                console.log("EXPIRED")
                res.status(403).send({msg: 'Not Authenticated'})
            }
    
             
            const user0 =  await UsersDAO.getUserbySub(decodedToken.sub);
            const user = {
              id: user0._id,
              display_name : user0.display_name,
              sub : user0.sub,
              wishitems: user0.wishitems,
           
              }
        if(user===null)
        {
            /**
             * IMPORTANT
             * Create new account using info
             * goog user document should not have a username and password 
             * so it cant be logged in (plus generating  them is not practical)
             */
            const wishitems = [];
            await UsersDAO.addGoogleUser(
                decodedToken.given_name,
                decodedToken.sub,
                wishitems
              
                
              )
              const user0 =  await UsersDAO.getUserbySub(decodedToken.sub);
            const user = {
              id: user0._id,
              display_name : user0.display_name,
              sub : user0.sub,
              wishitems: user0.wishitems,
             
              }
             const accessToken= generateAccessToken(user)
             req.session.token= accessToken;
             req.session.user = user
             const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET)
             res.json(user)
             UsersDAO.updateToken(user._id,refreshToken)
             
            
        }
        else{
          
          const accessToken= generateAccessToken(user)
          req.session.token= accessToken;
          req.session.user = user
          
             const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET)
             //console.log("apiGoogleLogin call:", req.session)
            
             UsersDAO.updateToken(user._id,refreshToken)
             res.sendStatus(200)
            
            
            
        }
        } catch (error) {
          console.log(error)
          res.status(401)
        }
      }
      static async apiRefreshToken(req,res){
        {
          console.log("HERE", req.user)
          const user0 =  await UsersDAO.getUserbySub(req.session.user.sub);
         
      if (user0.refreshToken === null){
          return res.sendStatus(401)
      }
    
      jwt.verify(user0.refreshToken, process.env.REFRESH_SECRET, (err,user)=>{
          if (err) {
              return res.sendStatus(403)
          }
          const accessToken = generateAccessToken(req.session.user);
          req.session.token= accessToken;
          res.status(200).send("New Access Token Granted")
      })
      }
      }
      static async apiCheckLogin(req,res){
        {
          console.log("YYYYYYY")
         
    
     
      }
      }
      static async apiGetGoogleUser(req, res, next) {
        console.log('---User Info---', req.user);
        if(req.session.token!== null){
            if(req.params.sub !== req.user.sub){
                res.status(403).json({ error: "Ur not that guy pal" })
                return
            }
        try {
          let sub = req.params.sub
          
          let user = await UsersDAO.getUserbySub(sub)
        
          if (!user) {
            res.status(404).json({ error: "User Not found" })
            return
          }
          let user0 = {
            _id : user._id, 
          display_name : user.display_name,
          wishitems : user.wishitems,
          
          }
          res.send(user0)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
    }
     else{
        res.status(403).send({msg: 'Not Authenticated'})
    }
      } 
      static async apiGetProfile(req, res, next) {
       
     
        try {
         console.log(req.session.user)
          res.send(req.session.user)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
    }
     
      
      static async apiGetUserbyUsername(req, res, next) {
        if(req.user){
        try {
          let username = req.params.username
          //will likeley have to get rid of params and just use
          //the user stored in passport
          if(req.params.username !== req.user.username){
            res.status(403).json({ error: "Ur not that guy pal" })
            return
          }
          let user = await UsersDAO.getUserbyUsername(username)
        
          if (!user) {
            res.status(404).json({ error: "User Not found" })
            return
          }
          let user0 = {
           
          username : user.username,
        
          
          }
          res.json(user0)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
        
    }
    else{
     
        res.status(403).send({msg: 'Not Authenticated'})
    }
      }
      static async apiPostUser(req, res, next) {
      
        try {
         
          const exists = await UsersDAO.getUserbyUsername(req.body.username)
          if(exists){
            return res.status(403).send("Username Taken")
          }
          
          const username = req.body.username;
          
          
          const password = await bcrypt.hash(req.body.password, 10);
          const wishitems= [];
          

          const UserResponse = await UsersDAO.addUser(
            username,
            password,
            wishitems, 
          )
          res.json({ status: "success" })
        } catch (e) {
          res.status(500).json({ error: e.message })
        }}
      
      

      static async apiUpdateUser(req, res, next) {
        /**IMPORTANT
         * make more efficient
        */
        if(req.user){
        try {
          const userid =  req.params.userId
          const username = req.body.username
          const password = req.body.password
          const sub = req.body.sub
          const wishitems = req.body.wishitems
          const date = new Date()
    
          const UserResponse = await UsersDAO.updateUser(
            userid,
            username,
            password,
            sub,
            wishitems,
            date,
          )
    
          var { error } = UserResponse
          if (error) {
            res.status(400).json({ error })
          }
    
          if (UserResponse.modifiedCount === 0) {
            throw new Error(
              "unable to update user - user may not be original poster",
            )
          }
    
          res.json({ status: "success" })
        } catch (e) {
          res.status(500).json({ error: e.message })
        }}
        else{
            res.status(403).send({msg: 'Not Authenticated'})
        }
      }

      static async apiUpdateLiked(req, res, next) {

        if(req.session.user){
          if( req.body.additem)
      {  try {
          const userid =  req.session.user.id
          const additem = req.body.additem
          const date = new Date()
          let liked_array = []
   
    const User  = await UsersDAO.getUserbyId(userid)
    if (User.wishitems.includes(additem)) {
      res.status(418).json({ error: "Already liked" })
      return
    }
   User.wishitems.push(additem)
          const UserResponse = await UsersDAO.updateLiked(
            userid,
            User.wishitems,
            date,
          )
   
          var { error } = UserResponse
          if (error) {
            res.status(400).json({ error })
          }
    
          if (UserResponse.modifiedCount === 0) {
            throw new Error(
              "unable to update user - user may not be original poster",
            )
          }
    
          res.json({ status: "success" })
        } catch (e) {
          res.status(500).json({ error: e.message })
        }}
        else{
          res.status(406).send("Wrong Format")
        }
      }
        else{
            res.status(403).send({msg: 'Not Authenticated'})
        }
      }

      static async apiRemoveLiked(req, res, next) {

        if(req.session.user){
          if( req.body.removeitem)
      {  try {
          const userid =  req.session.user.id
          const removeitem = req.body.removeitem
          const date = new Date()
          let liked_array = []
   
    const User  = await UsersDAO.getUserbyId(userid)
   for(let i =0; i<User.wishitems.length; i++){
    if (User.wishitems[i] === removeitem){
      User.wishitems.splice(i,1)
    }
   }
          const UserResponse = await UsersDAO.updateLiked(
            userid,
            User.wishitems,
            date,
          )
   
          var { error } = UserResponse
          if (error) {
            res.status(400).json({ error })
          }
    
          if (UserResponse.modifiedCount === 0) {
            throw new Error(
              "unable to update user - user may not be original poster",
            )
          }
    
          res.json({ status: "success" })
        } catch (e) {
          res.status(500).json({ error: e.message })
        }}
        else{
          res.status(406).send("Wrong Format")
        }
      }
        else{
            res.status(403).send({msg: 'Not Authenticated'})
        }
      }

      static async apiGetLiked(req, res, next) {
        
        if(req.session.user){
            //This is so a logged in user cannot access another users data
           /* if(req.body.userId !== req.session.passport.user._id){
             
             
                res.status(403).json({ error: "Ur not that guy pal" })
                return
            }*/
            
    
        
        try {
          let userId = req.session.user.id
          let user = await UsersDAO.getUserbyId(userId)
        
          if (!user) {
            res.status(404).json({ error: "User Not found" })
            return
          }
       let objects = [{}]
       for (let index = 0; index < user.wishitems.length; index++) {
        objects[index] = await GundamsDAO.getGundamByID(user.wishitems[index])
        
       }
      
          res.json(objects)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
    }
    else{
      
        res.status(403).send({msg: 'Not Authenticated'})
    }
      } 
    
      static async apiDeleteUser(req, res, next) {
        if(req.user){
        try {
          const userId = req.user._id
          
          const userResponse = await UsersDAO.deleteUser(
            userId,
          )
          res.json({ status: "success" })
        } catch (e) {
          res.status(500).json({ error: e.message })
        }
      }
      else{
        res.status(403).send({msg: 'Not Authenticated'})
      }
    }
}