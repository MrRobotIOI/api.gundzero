import mongodb from "mongodb"
import bcrypt from "bcrypt"
const ObjectId = mongodb.ObjectId
let gundams
let users

export default class GundamsDAO {
  static async injectDB(conn) {
    if (users) {
      return
    }
    try {
        
        users = await conn.db(process.env.GUND_NS).collection("users")
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in usersDAO: ${e}`,
      )
    }
  }

  static async getUserbyId(userId) {
    try {
      
      const pipeline = [
        {
            $match: {
             _id: new ObjectId(userId),
             
            },
        },
              
            
             
          ]
          
      return await users.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getUserbyid: ${e}`)
      throw e
    }
  }
  static async getUserbyUsername(username) {
    try {
      
      const pipeline = [
        {
            $match: {
             username: username,
             
            },
        },
              
            
             
          ]
          
      return await users.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getUserbyusername: ${e}`)
      throw e
    }
  }
  static async getUserbySub(sub) {
    try {
      
      const pipeline = [
        {
            $match: {
             sub: sub,
            },
        },
              
            
             
          ]
          
      return await users.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getUserbysub: ${e}`)
      throw e
    }
  }
  static async addUser(username, password, wishitems) {
    try {
     //password is encrypted 
      const UserDoc = { 
        username: username,
        password: password,
         wishitems : wishitems,
          date: new Date()
        }

      return await users.insertOne(UserDoc)
    } catch (e) {
      console.error(`Unable to post user: ${e}`)
      return { error: e }
    }
  }
  static async addGoogleUser(display_name, sub, wishitems) {
    try {
    
      const UserDoc = { 
        display_name: display_name,
        sub : sub,
         wishitems : wishitems,
          date: new Date()
        }

      return await users.insertOne(UserDoc)
    } catch (e) {
      console.error(`Unable to post user: ${e}`)
      return { error: e }
    }
  }

  static async updateUser(userId, username, password, sub, wishitems, date) {
    try {
      const updateResponse = await users.updateOne(
        { _id: new ObjectId(userId)},
        { $set: { 
            username: username, 
            password: password,
            sub: sub,
            wishitems: wishitems,
           
             date: date  } },
      )

      return updateResponse
    } catch (e) {
      console.error(`Unable to update user: ${e}`)
      return { error: e }
    }
  }
  static async updateLiked(userId, wishitems, date) {
    try {
      const updateResponse = await users.updateOne(
        { _id: new ObjectId(userId)},
        { $set: { 
          
            wishitems: wishitems,
           
             date: date  } },
      )

      return updateResponse
    } catch (e) {
      console.error(`Unable to update Liked: ${e}`)
      return { error: e }
    }
  }
  static async deleteUser(userId) {

    try {
      const deleteResponse = await users.deleteOne({
        _id: new ObjectId(userId),
   
      })

      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete user: ${e}`)
      return { error: e }
    }
  }
}


