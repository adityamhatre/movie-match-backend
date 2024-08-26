const checkToken = (req, res, next) => {
  const uid = req.headers["uid"];
  if (uid == null || uid == undefined) {
    return res.status(403).send("Token is required");
  }
  req.uid = uid;
  next();
};

export default checkToken;
