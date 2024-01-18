const jwt = require("jsonwebtoken");

function getToken(req, res, next) {
   const token = req.header("x-auth-token");
   if (!token) return res.status(400).send("Must provide token");

   try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      //adding the user key to the req obj
      req.user = payload;
      return next();
   } catch {
      return res.status(400).send("Invalid token.");
   }
}

module.exports = { getToken };
