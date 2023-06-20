import express from "express"
import GundamsCtrl from "./gundams.controller.js"

const router = express.Router()
router.route("/").get(GundamsCtrl.apiGetGundams)

router.route("/id/:id").get(GundamsCtrl.apiGetGundamsById)
export default router