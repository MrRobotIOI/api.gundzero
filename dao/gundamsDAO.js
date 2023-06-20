import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID
let gundams

export default class GundamsDAO {
  static async injectDB(conn) {
    if (gundams) {
      return
    }
    try {
        gundams = await conn.db(process.env.GUND_NS).collection("gundams")
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
                verKa: true,
            },
        },
              
            
             
          ]
      return await gundams.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getGundamByID: ${e}`)
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


