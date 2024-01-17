const { authByRole } = require("../middleware/authorize.mw");
const { validateCard, Card } = require("../models/cards.model");

const router = require("express").Router();

router.get("/", (req, res) => {
   res.send("test");
});

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

module.exports = router;
