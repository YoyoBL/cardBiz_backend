const { getCardById } = require("../lib/cards.lib");
const { errorBadRequest } = require("../lib/errorBadRequest");
const {
   authByRole,
   authRegisteredUser,
} = require("../middleware/authorize.mw");
const { validateCard, Card } = require("../models/cards.model");

const router = require("express").Router();

//get all cards
router.get("/", async (req, res, next) => {
   const cards = await Card.find({}).catch(next);
   if (!cards) {
      throw errorBadRequest("No cards in DB.");
   }

   res.json(cards);
});

//create card
router.post("/", authByRole("business"), async (req, res, next) => {
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
   try {
      await newCard.save();

      res.json(newCard);
   } catch (err) {
      next(errorBadRequest("Mongoose schema error", err));
   }
});

//GET CARD BY ID
router.get("/:id", authRegisteredUser, async (req, res, next) => {
   const card = await getCardById(req, res).catch(next);
   if (!card) return;
   res.json(card);
});

//UPDATE CARD BY ID
router.put("/:id", authRegisteredUser, async (req, res, next) => {
   //validate user
   const { error } = validateCard(req.body);
   if (error) {
      throw errorBadRequest(error.details[0].message);
   }
   try {
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
});

// LIKE CARD
router.patch("/:id", authRegisteredUser, async (req, res, next) => {
   //validate user
   if (!req.user) {
      throw errorBadRequest("Registered users only.");
   }

   //process
   const card = await getCardById(req).catch(next);

   function handleLikes() {
      const alreadyLiked = card.likes.some((userId) => userId === req.user._id);

      if (alreadyLiked) {
         return card.likes.filter((like) => like !== req.user._id);
      }
      card.likes.push(req.user._id);
      return card.likes;
   }

   const updatedCard = await Card.findByIdAndUpdate(
      card._id,
      { likes: handleLikes() },
      {
         new: true,
      }
   ).catch(next);

   //response
   res.json(updatedCard);
});

//DELETE CARD
router.delete("/:id", authRegisteredUser, async (req, res) => {
   //validate user
   if (!req.user) {
      throw errorBadRequest("Registered users only.");
   }
   //validate system
   const card = await getCardById(req, res).catch(next);
   if (!card) return;

   //process
   const deletedCard = await Card.findByIdAndDelete(req.params.id);

   //response
   res.json(deletedCard);
});

module.exports = router;
