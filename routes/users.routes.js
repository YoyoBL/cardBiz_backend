const { User, validateUser } = require("../models/users.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const router = require("express").Router();
const _ = require("lodash");
const { authByRole } = require("../middleware/authorize.mw");

//GET ALL USERS

router.post("/", authByRole("admin"), async (req, res) => {
   const users = await User.find({});

   res.json(users);
});

//REGISTER
router.post("/", async (req, res) => {
   // validate user's input
   const { error } = validateUser(req.body);
   if (error) {
      res.status(400).send(error.details[0].message);
      return;
   }
   // validate system
   const user = await User.findOne({ email: req.body.email });
   if (user) {
      return res.send("User already registered.");
   }
   // process
   const newUser = new User({
      ...req.body,
      isAdmin: req.body.isAdmin || false,
      password: await bcrypt.hash(req.body.password, 12),
   });
   await newUser.save();
   // response
   res.json(_.pick(newUser, ["_id", "name", "email"]));
});

//LOGIN
router.post("/login", async (req, res) => {
   // validate user's input
   const { error } = validateLogin(req.body);
   if (error) {
      return res.status(400).send(error.details[0].message);
   }

   // validate system
   const user = await User.findOne({ email: req.body.email });
   if (!user) {
      return res.status(400).send("Email or password are incorrect.");
   }

   const matchPassword = await bcrypt.compare(req.body.password, user.password);
   if (!matchPassword) {
      return res.status(400).send("Email or password are incorrect.");
   }
   // process
   const token = user.generateAuthToken();

   // response
   return res.json(token);
});

function validateLogin(body) {
   const schema = Joi.object({
      email: Joi.string()
         .min(5)
         .required()
         .email({ tlds: { allow: false } }),
      password: Joi.string()
         .min(7)
         .max(20)
         .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-])(?=.{9,})/)
         .message(
            "'Password' must be at least 9 characters long and contain an uppercase letter, a lower case letter, a number and one of the following characters !@#$%^&*- "
         )
         .required(),
   }).required();
   return schema.validate(body);
}

module.exports = router;
