const { getCardById, handleLikes } = require("../lib/cards.lib");
const { errorBadRequest } = require("../lib/errorBadRequest");
const { validateCard, Card } = require("../models/cards.model");

//GET ALL CARDS
exports.getAll = async (req, res, next) => {
   try {
      const cards = await Card.find({});
      if (!cards) {
         throw errorBadRequest("No cards in DB.");
      }

      res.json(cards);
   } catch (error) {
      next(error);
   }
};

//CREATE CARD
exports.create = async (req, res, next) => {
   try {
      //user validation
      const { value, error } = validateCard(req.body);
      if (error) {
         throw errorBadRequest("Joi error:" + error.details[0].message);
      }
      //process
      const newCard = new Card({
         ...value,
         user_id: req.user._id,
      });

      await newCard.save();

      res.json(newCard);
   } catch (err) {
      next(errorBadRequest("Mongoose schema error"), err);
   }
};

//GET CARD BY ID
exports.getById = async (req, res, next) => {
   const card = await getCardById(req, res).catch(next);
   res.json(card);
};

//UPDATE CARD BY ID
exports.updateById = async (req, res, next) => {
   try {
      //validate user
      const { error } = validateCard(req.body);
      if (error) {
         throw errorBadRequest(error.details[0].message);
      }
      //validate system
      const card = await getCardById(req, res);
      if (!card) return;

      const updateCard = await Card.findByIdAndUpdate(card._id, req.body, {
         new: true,
      });
      res.json(updateCard);
   } catch (error) {
      next(error);
   }
};

// LIKE CARD
exports.likeCard = async (req, res, next) => {
   try {
      //process
      const card = await getCardById(req);

      const updatedCard = await Card.findByIdAndUpdate(
         card._id,
         { likes: handleLikes(card) },
         {
            new: true,
         }
      );

      //response
      res.json(updatedCard);
   } catch (error) {
      next(error);
   }
};

//DELETE CARD
exports.delete = async (req, res, next) => {
   try {
      //validates ownership
      const card = await getCardById(req);

      //process
      const deletedCard = await Card.findByIdAndDelete(req.params.id);

      //response
      res.json(deletedCard);
   } catch (error) {
      next(error);
   }
};
