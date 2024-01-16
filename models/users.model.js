const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
   {
      name: {
         first: { type: String, required: true, minlength: 2, maxlength: 256 },
         middle: {
            type: String,
            required: false,
            minlength: 0,
            maxlength: 256,
         },

         last: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
      },
      phone: {
         type: String,
         required: true,
         minlength: 2,
         maxlength: 11,
      },
      email: {
         type: String,
         required: true,
         minlength: 5,
         unique: true,
      },
      password: {
         type: String,
         required: true,
         minlength: 7,
      },
      image: {
         url: {
            type: String,
         },
         alt: {
            type: String,
            maxlength: 256,
         },
      },
      address: {
         state: {
            type: String,
            required: false,
            maxlength: 256,
         },
         country: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
         city: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
         street: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
         houseNumber: {
            type: Number,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
         zip: {
            type: Number,
            required: true,
            minlength: 2,
            maxlength: 256,
         },
      },
      isBusiness: {
         type: Boolean,
         required: true,
      },
      isAdmin: {
         type: Boolean,
         required: true,
      },
      createdAt: {
         type: Date,
         default: Date.now,
      },
   },
   {
      methods: {
         generateAuthToken() {
            return jwt.sign(
               {
                  _id: this._id,
                  isBusiness: this.isBusiness,
                  isAdmin: this.isAdmin,
               },
               process.env.JWT_SECRET
            );
         },
      },
   }
);

const User = mongoose.model("User", userSchema, "users");

function validateUser(user) {
   const schema = Joi.object({
      name: Joi.object({
         first: Joi.string().min(2).max(256).required().label("First"),
         middle: Joi.string().min(2).max(256).label("Middle").allow(""),
         last: Joi.string().min(2).max(256).required().label("Last"),
      })
         .label("name")
         .required(),
      phone: Joi.string()
         .min(9)
         .max(11)
         .regex(/^0[2-9]\d{7,8}$/)
         .message('"phone" must be a standard Israeli phone number')
         .required(),

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

      image: Joi.object({
         url: Joi.string().uri().allow("").label("Image url"),
         alt: Joi.string().min(2).max(40).allow("").label("Image alt"),
      }),
      address: Joi.object({
         state: Joi.string().min(2).max(256).label("State"),
         country: Joi.string().min(2).max(256).required().label("Country"),
         city: Joi.string().min(2).max(256).required().label("City"),
         street: Joi.string().min(2).max(256).required().label("Street"),
         houseNumber: Joi.number()
            .min(1)
            .max(9999999999)
            .required()
            .label("House number"),
         zip: Joi.number()
            .min(0)
            .max(9999999999)
            .required()
            .label("Zip")
            .allow(""),
      }).required(),
      isBusiness: Joi.boolean().required().label("Account plan"),
      isAdmin: Joi.boolean(),
   }).required();

   return schema.validate(user);
}

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

function validateUserUpdate(body) {
   const schema = Joi.object({
      name: Joi.object({
         first: Joi.string().min(2).max(256).required().label("First"),
         middle: Joi.string().min(2).max(256).label("Middle").allow(""),
         last: Joi.string().min(2).max(256).required().label("Last"),
      })
         .label("name")
         .required(),
      phone: Joi.string()
         .min(9)
         .max(11)
         .regex(/^0[2-9]\d{7,8}$/)
         .message('"phone" must be a standard Israeli phone number')
         .required(),

      email: Joi.string()
         .min(5)
         .required()
         .email({ tlds: { allow: false } }),

      image: Joi.object({
         url: Joi.string().uri().allow("").label("Image url"),
         alt: Joi.string().min(2).max(40).allow("").label("Image alt"),
      }),
      address: Joi.object({
         state: Joi.string().min(2).max(256).label("State"),
         country: Joi.string().min(2).max(256).required().label("Country"),
         city: Joi.string().min(2).max(256).required().label("City"),
         street: Joi.string().min(2).max(256).required().label("Street"),
         houseNumber: Joi.number()
            .min(1)
            .max(9999999999)
            .required()
            .label("House number"),
         zip: Joi.number()
            .min(0)
            .max(9999999999)
            .required()
            .label("Zip")
            .allow(""),
      }).required(),
   }).required();

   return schema.validate(body);
}

module.exports = {
   User,
   validateUser,
   validateLogin,
   validateUserUpdate,
};
