const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
   User,
   validateUser,
   validateUserUpdate,
   validateLogin,
} = require("../models/users.model");
const { errorBadRequest } = require("../lib/errorBadRequest");
const {
   checkLoginAttempts,
   clearAttempts,
} = require("../lib/checkLoginAttempts");

exports.getUsers = async (req, res, next) => {
   const users = await User.find({}).catch(next);

   res.json(users);
};

exports.signup = async (req, res, next) => {
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
};

exports.login = async (req, res, next) => {
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
         const error = await checkLoginAttempts(user.email);
         next(error);
         return;
      }
      clearAttempts(user.email);
      // process
      const token = user.generateAuthToken();

      // response
      return res.json(token);
   } catch (error) {
      next(error);
   }
};

exports.getById = async (req, res, next) => {
   try {
      const user = await User.findById(req.params.id);
      if (!user) throw errorBadRequest("User doesn't exists.");

      //response
      res.send(user);
   } catch (error) {
      next(error);
   }
};

exports.editById = async (req, res, next) => {
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
};

exports.patchStatus = async (req, res, next) => {
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
};
exports.delete = async (req, res, next) => {
   //process
   try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) throw errorBadRequest("User not found");

      //response
      res.json(user);
   } catch (error) {
      next(error);
   }
};
