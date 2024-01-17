const { authByRole } = require("../middleware/authorize.mw");
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

//get card by id
router.get("/:id", validateMongoId, authByRole("user"), async (req, res) => {
   const card = await Card.findById(req.params.id).catch((err) =>
      res.status(500).send(err)
   );
   if (!card) return res.status(400).send("Card id doesn't exist.");

   res.json(card);
});

module.exports = router;
