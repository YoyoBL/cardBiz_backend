const Joi = require("joi");
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
   title: { type: String, required: true, minlength: 2, maxlength: 256 },
   subtitle: { type: String, required: true, minlength: 2, maxlength: 256 },
   description: { type: String, required: true, minlength: 2, maxlength: 1024 },
   phone: { type: String, required: true, minlength: 9, maxlength: 11 },
   email: { type: String, required: true, minlength: 5 },
   web: {
      type: String,
      validate: { validator: (v) => validateEmptyString(v, 5) },
   },
   image: {
      url: {
         type: String,
         required: false,
         default:
            "https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_960_720.jpg",
      },
      alt: {
         type: String,
         maxlength: 256,
         default: "BizCard Image",
      },
   },
   address: {
      state: { type: String },
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String },
      houseNumber: { type: Number, minlength: 1 },
      zip: { type: Number },
   },
   likes: {
      type: Array,
      default: [],
   },
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

const Card = mongoose.model("Card", cardSchema, "cards");

function validateCard(card) {
   const schema = Joi.object({
      title: Joi.string().min(2).max(256).required(),
      subtitle: Joi.string().min(2).max(256).required(),
      description: Joi.string().min(2).max(1024).required(),
      phone: Joi.string()
         .min(9)
         .max(11)
         .required()
         .regex(/^0[2-9]\d{7,8}$/)
         .message('"Phone" must be a standard Israeli phone number'),
      email: Joi.string()
         .min(5)
         .required()
         .email({ tlds: { allow: false } }),
      web: Joi.string().min(5).allow("").required().label("Website"),
      image: Joi.object({
         url: Joi.string().uri().min(14).uri().empty("").label("Image url"),
         alt: Joi.string().min(2).max(256).empty("").label("Image alt"),
      }).required(),
      address: Joi.object({
         state: Joi.string().label("State").allow(""),
         country: Joi.string().required().label("Country"),
         city: Joi.string().required().label("City"),
         street: Joi.string().required().label("Street"),
         houseNumber: Joi.number().min(1).required().label("House number"),
         zip: Joi.number().allow("").label("Zip"),
      }).required(),
   }).required();

   return schema.validate(card);
}

function validateEmptyString(body) {
   if (body === "") return true;
}

module.exports = {
   Card,
   validateCard,
};
