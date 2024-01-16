const { default: mongoose } = require("mongoose");

function validateMongoId(req, res, next) {
   const _id = req.params.id;
   const isIdValid = mongoose.Types.ObjectId.isValid(_id);
   if (!isIdValid) {
      res.status(400).send("Invalid ID structure");
      throw new Error("Invalid ID structure");
   }
   return next();
}

module.exports = { validateMongoId };
