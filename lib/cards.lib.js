const { Card } = require("../models/cards.model");

async function getCardById(req, res) {
   const card = await Card.findById(req.params.id);
   if (!card) {
      res.status(400).send("Card id does'nt exist.");
      return false;
   }

   if (!req.user.isAdmin && String(card.user_id) !== req.user._id) {
      res.status(400).send("Denied. Only for owner of card or Admin.");
      return false;
   }

   return card;
}

module.exports = { getCardById };
