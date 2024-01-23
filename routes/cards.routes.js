const { getCardById, handleLikes } = require("../lib/cards.lib");
const { errorBadRequest } = require("../lib/errorBadRequest");
const {
   authByRole,
   authRegisteredUser,
} = require("../middleware/authorize.mw");
const { validateMongoId } = require("../middleware/validateMongoId.mw");
const { validateCard, Card } = require("../models/cards.model");

const router = require("express").Router();

//GET ALL CARDS
router.get("/", async (req, res, next) => {
   try {
      const cards = await Card.find({});
      if (!cards) {
         throw errorBadRequest("No cards in DB.");
      }

      res.json(cards);
   } catch (error) {
      next(error);
   }
});

//CREATE CARD
router.post("/", authByRole("business"), async (req, res, next) => {
   try {
      //user validation
      const { error } = validateCard(req.body);
      if (error) {
         throw errorBadRequest("Joi error:" + error.details[0].message);
      }
      //process
      console.log(req.user._id);
      const newCard = new Card({
         ...req.body,
         user_id: req.user._id,
      });
      await newCard.save();

      res.json(newCard);
   } catch (err) {
      next(errorBadRequest("Mongoose schema error", err));
   }
});

//GET CARD BY ID
router.get(
   "/:id",
   validateMongoId,
   authRegisteredUser,
   async (req, res, next) => {
      const card = await getCardById(req, res).catch(next);
      res.json(card);
   }
);

//UPDATE CARD BY ID
router.put(
   "/:id",
   validateMongoId,
   authRegisteredUser,
   async (req, res, next) => {
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
   }
);

// LIKE CARD
router.patch(
   "/:id",
   validateMongoId,
   authRegisteredUser,
   async (req, res, next) => {
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
   }
);

//DELETE CARD
router.delete(
   "/:id",
   validateMongoId,
   authRegisteredUser,
   async (req, res, next) => {
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
   }
);

module.exports = router;
