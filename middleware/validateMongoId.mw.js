const { default: mongoose } = require("mongoose");
const { errorBadRequest } = require("../lib/errorBadRequest");
const chalk = require("chalk");

function validateMongoId(req, res, next) {
   if (!req?.params?.id) return next();

   const _id = req.params.id;
   const isIdValid = mongoose.Types.ObjectId.isValid(_id);
   if (!isIdValid) {
      throw errorBadRequest("Invalid ID structure");
   }
   return next();
}

module.exports = { validateMongoId };
