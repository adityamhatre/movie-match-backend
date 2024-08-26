import express from "express";
import { checkIfMatch } from "../firebase-api.js";
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/isMatch/:u1/:u2/:itemId", async (req, res) => {
  res.send(await checkIfMatch(req.params.u1, req.params.u2, req.params.itemId));
});

export default router;
