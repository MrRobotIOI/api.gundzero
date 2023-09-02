import GundamsDAO from "../dao/gundamsDAO.js";
import UsersDAO from "../dao/usersDAO.js"
import bcrypt from "bcrypt"

export default class UsersController {
    static async apiGetUser(req, res, next) {
        //Checks if logged in before making requests
        if(req.session.passport){
            //This is so a logged in user cannot access another users data
            if(req.params.userId !== req.session.passport.user._id){
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
      static async apiGetGoogleUser(req, res, next) {
        if(req.session.passport){
            if(req.params.sub !== req.session.passport.user.sub){
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
          exp: req.session.cookie.originalMaxAge
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
      static async apiGetUserbyUsername(req, res, next) {
        if(req.session.passport){
        try {
          let username = req.params.username
          //will likeley have to get rid of params and just use
          //the user stored in passport
          if(req.params.username !== req.session.passport.user.username){
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
        
          exp: req.session.cookie.originalMaxAge
          }
          res.json(user0)
        } catch (e) {
          console.log(`api, ${e}`)
          res.status(500).json({ error: e })
        }
        
    }
    else{
      const obj = req.session
        res.send(obj)
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
        if(req.session.passport.user){
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

        if(req.session.passport){
          if( req.body.additem)
      {  try {
          const userid =  req.session.passport.user._id
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

        if(req.session.passport){
          if( req.body.removeitem)
      {  try {
          const userid =  req.session.passport.user._id
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
        
        if(req.session.passport){
            //This is so a logged in user cannot access another users data
           /* if(req.body.userId !== req.session.passport.user._id){
             
             
                res.status(403).json({ error: "Ur not that guy pal" })
                return
            }*/
            
    
        
        try {
          let userId = req.session.passport.user._id
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
        if(req.session.passport.user){
        try {
          const userId = req.session.passport.user._id
          
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