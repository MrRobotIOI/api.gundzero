

import LocalStartegy from 'passport-local'
import UsersDAO from "../dao/usersDAO.js"
import passport from 'passport'

passport.serializeUser((user, done)=>{
    done(null, user);
});

passport.deserializeUser(async (username,done)=>{
  try {
    const result =  await UsersDAO.getUserbySub(username);
    if (Object.keys(result).length !==0){
     done(null, result);
    }
  } catch (error) {
    done(err,null);
  }
});
export default (passport) =>  {passport.use(new LocalStartegy(
    async (username, password, done)=>{
       
    try {
         var result={};
         result =  await UsersDAO.getUserbySub(username);
         
    if(Object.keys(result).length===0)
    {
        done(null, false);
    }
    else{
     
            
            done(null,result);
        
        
        
    }
    } catch (error) {
        done(error,false);
    }
}))}