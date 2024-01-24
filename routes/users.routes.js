const bcrypt = require("bcrypt");
const router = require("express").Router();
const _ = require("lodash");
const { authByRole } = require("../middleware/authorize.mw");

const {
   User,
   validateUser,
   validateUserUpdate,
   validateLogin,
} = require("../models/users.model");
const { errorBadRequest } = require("../lib/errorBadRequest");
const { validateMongoId } = require("../middleware/validateMongoId.mw");

//GET ALL USERS
router.get("/", authByRole("admin"), async (req, res, next) => {
   const users = await User.find({}).catch(next);

   res.json(users);
});

//REGISTER
router.post("/", async (req, res, next) => {
   try {
      // validate user's input
      const { value, error } = validateUser(req.body);
      if (error) {
         res.status(400).send(error.details[0].message);
         return;
      }
      // validate system
      const user = await User.findOne({ email: req.body.email });
      if (user) {
         throw errorBadRequest("User already registered.");
      }
      // process
      const newUser = new User({
         ...value,
         isAdmin: req.body.isAdmin || false,
         password: await bcrypt.hash(req.body.password, 12),
      });
      await newUser.save();
      // response
      res.json(_.pick(newUser, ["_id", "name", "email"]));
   } catch (error) {
      next(error);
   }
});

//LOGIN
router.post("/login", async (req, res, next) => {
   try {
      // validate user's input
      const { error } = validateLogin(req.body);
      if (error) {
         return res.status(400).send(error.details[0].message);
      }

      // validate system
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
         throw errorBadRequest("Email or password are incorrect.");
      }

      const matchPassword = await bcrypt.compare(
         req.body.password,
         user.password
      );
      if (!matchPassword) {
         throw errorBadRequest("Email or password are incorrect.");
      }
      // process
      const token = user.generateAuthToken();

      // response
      return res.json(token);
   } catch (error) {
      next(error);
   }
});

//GET USER BY ID
router.get("/:id", validateMongoId, authByRole(), async (req, res, next) => {
   try {
      const user = await User.findById(req.params.id);
      if (!user) throw errorBadRequest("User doesn't exists.");

      //response
      res.send(user);
   } catch (error) {
      next(error);
   }
});

//EDIT USER
router.put(
   "/:id",
   validateMongoId,
   authByRole("user"),
   async (req, res, next) => {
      try {
         // validate user
         const { error } = validateUserUpdate(req.body);
         if (error) throw errorBadRequest(error.details[0].message);

         //process
         const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
               new: true,
            }
         );
         if (!updatedUser) throw errorBadRequest("User not found");

         updatedUser.save();

         //response
         res.send(updatedUser);
      } catch (error) {
         next(error);
      }
   }
);

//PATCH STATUS
router.patch(
   "/:id",
   validateMongoId,
   authByRole("user"),
   async (req, res, next) => {
      try {
         //validate system
         const user = await User.findById(req.params.id);
         if (!user) throw errorBadRequest("User not found");

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
      } catch (error) {
         next(error);
      }
   }
);

router.delete("/:id", validateMongoId, authByRole("user"), async (req, res) => {
   //process
   const user = await User.findByIdAndDelete(req.params.id).catch(next);
   if (!user) throw errorBadRequest("User not found");

   //response
   res.json(user);
});

module.exports = router;
