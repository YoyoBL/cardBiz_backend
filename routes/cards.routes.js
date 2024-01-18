const { getCardById } = require("../lib/cards.lib");
const { authByRole } = require("../middleware/authorize.mw");
const { getToken } = require("../middleware/getToken.mw");
const { validateMongoId } = require("../middleware/validateMongoId.mw");
const { validateCard, Card } = require("../models/cards.model");

const router = require("express").Router();

//get all cards
router.get("/", async (req, res) => {
   const cards = await Card.find({}).catch((err) => res.status(500).send(err));
   if (!cards) return res.status(400).send("No cards in DB.");

   res.json(cards);
});

//create card
router.post("/", authByRole("business"), async (req, res) => {
   //user validation
   const { error } = validateCard(req.body);
   if (error)
      return res.status(400).send("Joi error:" + error.details[0].message);
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
      res.status(400).json({ "Server error": "Mongoose schema error", err });
   }
});

//GET CARD BY ID
router.get("/:id", validateMongoId, getToken, async (req, res) => {
   const card = await getCardById(req, res);
   if (!card) return;
   res.json(card);
});

//UPDATE CARD BY ID
router.put("/:id", validateMongoId, getToken, async (req, res) => {
   //validate user
   const { error } = validateCard(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   //validate system
   const card = await getCardById(req, res);
   if (!card) return;

   const updateCard = await Card.findByIdAndUpdate(card._id, req.body, {
      new: true,
   });
   res.json(updateCard);
});

module.exports = router;
