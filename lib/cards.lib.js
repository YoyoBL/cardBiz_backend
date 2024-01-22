const { Card } = require("../models/cards.model");
const { errorBadRequest } = require("./errorBadRequest");

async function getCardById(req) {
   const card = await Card.findById(req.params.id);
   if (!card) {
      throw errorBadRequest("Card id does'nt exist.");
   }

   if (!req.user.isAdmin && String(card.user_id) !== req.user._id) {
      throw errorBadRequest("Denied. Only for owner of card or Admin.");
   }

   return card;
}

module.exports = { getCardById };
