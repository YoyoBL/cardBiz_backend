const {
   User,
   validateUser,
   validateUserUpdate,
   validateLogin,
} = require("../models/users.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const router = require("express").Router();
const _ = require("lodash");
const { authByRole } = require("../middleware/authorize.mw");
const { validateMongoId } = require("../middleware/validateMongoId.mw");

//GET ALL USERS
router.get("/", authByRole("admin"), async (req, res) => {
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

//GET USER BY ID
router.get("/:id", validateMongoId, authByRole(), async (req, res) => {
   const user = await User.findById(req.params.id);
   if (!user) return res.status(400).send("User doesn't exists.");

   //response
   res.send(user);
});

//EDIT USER
router.put("/:id", validateMongoId, authByRole("user"), async (req, res) => {
   // validate user
   const { error } = validateUserUpdate(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   //process
   const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
   });
   if (!updatedUser) return res.status(400).send("User not found");

   updatedUser.save();

   //response
   res.send(updatedUser);
});

//PATCH STATUS
router.patch("/:id", validateMongoId, authByRole("user"), async (req, res) => {
   //validate system
   const user = await User.findById(req.params.id);
   if (!user) return res.status(400).send("User not found");

   const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
         isBusiness: !user.isBusiness,
      },
      { new: true }
   );
   // process
   updatedUser.save();
   //response
   res.json(updatedUser);
});

module.exports = router;
