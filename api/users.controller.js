import GundamsDAO from "../dao/gundamsDAO.js";
import UsersDAO from "../dao/usersDAO.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import jwt_decode from "jwt-decode";
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '20s'})
}

export default class UsersController {
  static generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '20s'})
  }
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
           
        if(user0===null)
        {
            
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
              const usertokenobj2 = {
                id: user0._id,
                }
              
             const accessToken= generateAccessToken(usertokenobj2)
             req.session.token= accessToken;
             req.session.user = user
            
             const refreshToken = jwt.sign(usertokenobj2, process.env.REFRESH_SECRET, { expiresIn: '40s'})
             UsersDAO.updateToken(user.id,refreshToken)
             res.json({ token: accessToken})
            
        }
        else{
          const user = {
            id: user0._id,
            display_name : user0.display_name,
            sub : user0.sub,
            wishitems: user0.wishitems,
         
            }
            const usertokenobj = {
              id: user0._id,
              }
          const accessToken= generateAccessToken(usertokenobj)
          req.session.token= accessToken;
          req.session.user = user
          
             const refreshToken = jwt.sign(usertokenobj, process.env.REFRESH_SECRET, { expiresIn: '40s'})
             //console.log("apiGoogleLogin call:", req.session)
            
             UsersDAO.updateToken(user.id,refreshToken)
            
             res.json({ token: accessToken})
            
            
            
        }
        } catch (error) {
          console.log(error)
          res.status(401)
        }
      }

      static async apiLogin(req,res){
    const username = req.body.username
    const password =   req.body.password
        try {
          var result={};
          result =  await UsersDAO.getUserbyUsername(username);
          
     if(result===null)
     {
         res.status(404).send("username not found")
     }
     //when i forget password password == result.password ? (true):(false);
     else{
         const isMatch = await bcrypt.compare(password,result.password)
        
         if(isMatch){
          const usertokenobj = {
            id: result._id,
            }
          const accessToken= generateAccessToken(usertokenobj)
          const refreshToken = jwt.sign(usertokenobj, process.env.REFRESH_SECRET, { expiresIn: '40s'})

             UsersDAO.updateToken(result._id,refreshToken)
         
             res.json({ token: accessToken})
     
             
         }
         else{
          res.status(404).send("Not password")
         }
     }
     } 
     catch (error) {
      res.status(404).send("Not Found")
     }
      }


      static async apiRefreshToken(req,res){
        {
          
         // const user0 =  await UsersDAO.getUserbySub(req.session.user.sub);
         const obj = jwt.decode(req.body.token)
         const user0 =  await UsersDAO.getUserbyId();
        
         
         //return res.sendStatus(200)

      if (user0.refreshToken === null){
          return res.sendStatus(401)
      }
      else{
        return res.sendStatus(200)
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
      static async apiCreateUser(req, res, next) {
      
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
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, async (err,user)=>{
          if(err){
             res.status(403).send("unauthorized")
          }
         else{
           
             const obj = jwt.decode(token)
               
          
             

             if( req.body.additem)
             {  
              try {
                 const userid =  obj.id
                 const additem = req.body.additem
                 const date = new Date()
                 let liked_array = []
          
           const User  = await UsersDAO.getUserbyId(userid)
           if (User.wishitems.includes(additem)) {
             res.status(418).json({ error: "Already liked" })
             
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
             })


      
      }

      static async apiRemoveLiked(req, res, next) {
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, async (err,user)=>{
          if(err){
             res.status(403).send("unauthorized")
          }
         else{

          if( req.body.removeitem)
          {  
            try {
              const obj = jwt.decode(token)
              const userid =  obj.id
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
        })
        
      }

      static async apiGetLiked(req, res, next) {
        
        
            //This is so a logged in user cannot access another users data
           /* if(req.body.userId !== req.session.passport.user._id){
             
             
                res.status(403).json({ error: "Ur not that guy pal" })
                return
            }*/
            const token = req.body.token;
            jwt.verify(token, process.env.ACCESS_SECRET, async (err,user)=>{
         if(err){
            res.status(403).send("unauthorized")
         }
        else{
          
            const obj = jwt.decode(token)
                const user0 =  await UsersDAO.getUserbyId(obj.id);
                try {
        
        
                  if (!user0) {
                    res.status(404).json({ error: "User Not found" })
                    
                  }
               let objects = [{}]
               for (let index = 0; index < user0.wishitems.length; index++) {
                objects[index] = await GundamsDAO.getGundamByID(user0.wishitems[index])
                
               }
              
                  res.json(objects)
                } catch (e) {
                  console.log(`api, ${e}`)
                  res.status(500).json({ error: e })
                }
        }
            })
    
        

   
      
     
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