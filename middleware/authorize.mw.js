const jwt = require("jsonwebtoken");

function authByRole(role = "business") {
   const rolesList = {
      admin: "isAdmin",
      business: "isBusiness",
      user: "user",
   };

   if (!rolesList[role]) {
      throw new Error("Role provided doesn't exists");
   }

   const roleKey = rolesList[role];

   return function authorize(req, res, next) {
      const token = req.header("x-auth-token");
      if (!token) return res.status(400).send("Must provide token");

      try {
         const payload = jwt.verify(token, process.env.JWT_SECRET);

         //adding the user key to the req obj
         req.user = payload;

         //validates if request is made by the logged user
         if (role === "user") {
            const _id = req.params.id;
            if (!req.user.isAdmin && req.user._id !== _id) {
               return res
                  .status(400)
                  .send("Denied. You need to be the registered user or Admin");
            }
            return next();
         }
         //checks if role is not allowed
         if (!payload[roleKey]) {
            return res.status(400).send(`Access denied, ${role} only.`);
         }

         return next();
      } catch (error) {
         return res.status(400).send("Invalid token.");
      }
   };
}

module.exports = { authByRole };
