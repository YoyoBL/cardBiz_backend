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
   const alreadyLiked = card.likes.some(
      (userId) => userId.toString() === card.user_id.toString()
   );
   if (alreadyLiked) {
      return card.likes.filter(
         (like) => like.toString() !== card.user_id.toString()
      );
   }
   card.likes.push(card.user_id);
   return card.likes;
}

module.exports = { getCardById, handleLikes };
