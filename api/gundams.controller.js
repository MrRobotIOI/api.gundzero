import GundamsDAO from "../dao/gundamsDAO.js"

export default class GundamsController {
  static async apiGetGundams(req, res, next) {
    const gundamsPerPage = req.query.gundamsPerPage ? parseInt(req.query.gundamsPerPage, 10) : 40
    const page = req.query.page ? parseInt(req.query.page, 10) : 0

    let filters = {}
    if (req.query.name) {
      filters.name = req.query.name
    }

    const { gundamsList, totalNumGundams } = await GundamsDAO.getGundams({
      filters,
      page,
      gundamsPerPage,
    })

    let response = {
        gundams: gundamsList,
      page: page,
      filters: filters,
      entries_per_page: gundamsPerPage,
      total_results: totalNumGundams,
    }
    
    res.json(response)
  }
  
  static async apiSearch(req, res){
try {
  let result =  await GundamsDAO.getSearch(req.body.name)
  let response = {
    gundams: result,
}
res.json(response)
} catch (error) {
  res.status(500).send("Error at controller")
}
  }

  static async apiGetGundamsById(req, res, next) {
    try {
      let id = req.params.id || {}
      let gundam = await GundamsDAO.getGundamByID(id)
      if (!gundam) {
        res.status(404).json({ error: "Not found" })
        return
      }
      res.json(gundam)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }
  static async apiLikedGundams(req, res, next) {
    try {
      let id = req.params.id || {}
      let gundam = await GundamsDAO.getGundamByID(id)
      if (!gundam) {
        res.status(404).json({ error: "Not found" })
        return
      }
      res.json(gundam)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

}