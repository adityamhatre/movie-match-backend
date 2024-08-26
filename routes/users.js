import express from "express";
import { addUser, getUsers } from "../firebase-api.js";
var router = express.Router();

/* GET users listing. */
router.post("/register", async (req, res, next) => {
  const { uid, email, displayName } = req.body;
  const user = await addUser(uid, email, displayName);
  res.send(user);
});

router.get("/", async (req, res, next) => {
  const users = await getUsers(req.uid);
  res.send(users);
});

export default router;
