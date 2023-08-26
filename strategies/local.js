

import LocalStartegy from 'passport-local'
import UsersDAO from "../dao/usersDAO.js"
import passport from 'passport'
import jwt_decode from "jwt-decode";
import passportCustom from 'passport-custom';
const CustomStrategy = passportCustom.Strategy;
import dotenv from "dotenv"
import bcrypt from 'bcrypt'
dotenv.config()
passport.serializeUser((user, done)=>{
    done(null, user);
});

passport.deserializeUser(async (user,done)=>{
  try {
    var result = {};
    if(user.sub){
        result =  await UsersDAO.getUserbySub(user.sub);
    }
  else{
    result =  await UsersDAO.getUserbyUsername(user.username);
  }

    if (result!==null){
     done(null, result);
    }
  } catch (error) {
    done(error,null);
  }
});
export default (passport) =>  {
    
    passport.use('regular',new LocalStartegy(
    async (username, password, done)=>{
       
    try {
         var result={};
         result =  await UsersDAO.getUserbyUsername(username);
         
    if(result===null)
    {
        done(null, false);
    }
    else{
        const isMatch = await bcrypt.compare(password,result.password)
        if(isMatch){
            done(null,result);
            
        }
        else{
            done(null, false);
        }
    }
    } catch (error) {
        done(error,false);
    }
}))



passport.use('googlejwt',new CustomStrategy(
    async (req, done)=>{
    var decodedToken = jwt_decode(req.body.jwt);
    try {
        //Verifying token
        if(decodedToken.aud !== process.env.CLIENTID){
            console.log("WRONG AUD")
            done(null, false);
        }
        if(decodedToken.iss !== "https://accounts.google.com" ){
            if(decodedToken.iss !== "accounts.google.com"){
                console.log("WRONG ISS")
                done(null, false);
            }
            
        }
       if(decodedToken.exp < new Date()/1000){
            console.log("EXPIRED")
            done(null, false);
        }

         var result={};
         result =  await UsersDAO.getUserbySub(decodedToken.sub);
        
    if(result===null)
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
          result =  await UsersDAO.getUserbySub(decodedToken.sub);
          
        done(null, result);
    }
    else{
     
            
            done(null,result);
        
        
        
    }
    } catch (error) {
        done(error,false);
    }
}))
}

