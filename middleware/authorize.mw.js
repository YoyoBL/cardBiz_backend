const jwt = require("jsonwebtoken");
const { errorBadRequest } = require("../lib/errorBadRequest");

function authByRole(role = "business") {
   const rolesList = {
      admin: "isAdmin",
      business: "isBusiness",
      user: "user",
   };

   if (!rolesList[role]) {
      throw errorBadRequest("Role provided doesn't exists");
   }

   const roleKey = rolesList[role];

   return function authorize(req, res, next) {
      const token = req.header("x-auth-token");
      if (!token) throw errorBadRequest("Must provide token");

      try {
         const payload = jwt.verify(token, process.env.JWT_SECRET);

         //adding the user key to the req obj
         req.user = payload;

         //validates if request is made by the logged user
         if (role === "user") {
            const _id = req.params.id;
            if (!req.user.isAdmin && req.user._id !== _id) {
               throw errorBadRequest(
                  "Denied. You need to be the registered user or Admin"
               );
            }
            return next();
         }
         //checks if role is not allowed
         if (!payload[roleKey] && !payload.isAdmin) {
            throw errorBadRequest("Access denied, Business or Admin only.");
         }

         return next();
      } catch (error) {
         throw errorBadRequest("Invalid token.");
      }
   };
}

function authRegisteredUser(req, res, next) {
   const token = req.header("x-auth-token");

   try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      //adding the user key to the req obj
      req.user = payload;
      return next();
   } catch {
      throw errorBadRequest("Invalid token, Registered users only.");
   }
}

module.exports = { authByRole, authRegisteredUser };
