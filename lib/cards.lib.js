const { Card } = require("../models/cards.model");
const { errorFileLogger } = require("./errorFileLogger");

async function getCardById(req, res) {
   const card = await Card.findById(req.params.id);
   if (!card) {
      res.status(400).send("Card id does'nt exist.");
      errorFileLogger("Card id does'nt exist.", 400);
   }

   if (!req.user.isAdmin && String(card.user_id) !== req.user._id) {
      res.status(400).send("Denied. Only for owner of card or Admin.");
      errorFileLogger("Denied. Only for owner of card or Admin.", 400);
   }

   return card;
}

module.exports = { getCardById };
