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

function handleLikes(card) {
   const alreadyLiked = card.likes.some((userId) => userId === req.user._id);

   if (alreadyLiked) {
      return card.likes.filter((like) => like !== req.user._id);
   }
   card.likes.push(req.user._id);
   return card.likes;
}

module.exports = { getCardById, handleLikes };
