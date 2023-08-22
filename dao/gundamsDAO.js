import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId
let gundams
let users

export default class GundamsDAO {
  static async injectDB(conn) {
    if (gundams && users) {
      return
    }
    try {
        gundams = await conn.db(process.env.GUND_NS).collection("gundams")
        users = await conn.db(process.env.GUND_NS).collection("users")
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in gundamsDAO: ${e}`,
      )
    }
  }

  static async getGundams({
    filters = null,
    page = 0,
    gundamsPerPage = 1000,
  } = {}) {
    let query
    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } }
      }else if ("img" in filters) {
        query = { "img": { $eq: filters["img"] } }
      }
    }

    let cursor
    
    try {
      cursor = await gundams
        .find(query)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { gundamsList: [], totalNumGundams: 0 }
    }

    const displayCursor = cursor.limit(gundamsPerPage).skip(gundamsPerPage * page)

    try {
      const gundamsList = await displayCursor.toArray()
      const totalNumGundams = await gundams.countDocuments(query)

      return { gundamsList, totalNumGundams }
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`,
      )
      return { gundamsList: [], totalNumGundams: 0 }
    }
  }
  
  static async getGundamByID(id) {
    try {
      const pipeline = [
        {
            $match: {
              _id: new ObjectId(id),
            },
        },
              
            
             
          ]
      return await gundams.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getGundamByID: ${e}`)
      throw e
    }
  }
  static async getSearch(name) {
   try {
    const pipeline = [
      {
        "$search": {
          "autocomplete": {
            "query": `${name}`,
            "path": "name", 
            
          }
        }
      }
    ]

    return gundams.aggregate(pipeline).toArray()
   } catch (error) {
    res.status(500).send("Error at DAO")
   }
  
  }
  static async getUser(username0) {
    try {
      
      const pipeline = [
        {
            $match: {
                username: username0,
            },
        },
              
            
             
          ]
          
      return await users.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getUser: ${e}`)
      throw e
    }
  }

  static async getImg() {
    let img = []
    try {
      img = await gundams.distinct("img")
      return img
    } catch (e) {
      console.error(`Unable to get img, ${e}`)
      return img
    }
  }
}


