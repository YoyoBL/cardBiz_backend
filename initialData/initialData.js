const chalk = require("chalk");
const { User } = require("../models/users.model");
const { Card } = require("../models/cards.model");
const bcrypt = require("bcrypt");
const { users, cards } = require("./data.json");
const { default: mongoose } = require("mongoose");

const path = require("node:path");
require("dotenv").config({
   path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

mongoose
   .connect(process.env.MONGO_URI)
   .then(() => console.log(chalk.bgGreen("Connected to DB")))
   .then(() => init())
   .catch((err) => console.log(chalk.bgRed(`DB not connected, error: ${err}`)));

async function init() {
   try {
      await generateUsers();

      const biz = await User.findOne({ "name.first": "biz" });
      const bizId = biz._id.toString();
      await generateCards(bizId);

      console.log(chalk.bgBlue("Initial Users & Cards created."));
      for (const user of users)
         console.log(
            chalk.bgGray(`${user.name.first} user login:`),
            user.email
         );
      console.log(chalk.bgGray("password for all:"), "Abc!123Abc");
   } catch (error) {
      console.log("Error while initializing data \n", error);
   }
}

async function generateUsers() {
   const usersPromises = [];
   for (const user of users) {
      const newUser = new User({
         ...user,
         password: await bcrypt.hash(user.password, 12),
      })
         .save()
         .catch(() => {});
      usersPromises.push(newUser);
   }
   return await Promise.allSettled(usersPromises);
}

async function generateCards(bizId) {
   const cardsPromises = [];
   for (const card of cards) {
      const newCard = new Card({ ...card, user_id: bizId })
         .save()
         .catch(() => {});
      cardsPromises.push(newCard);
   }
   return await Promise.allSettled(cardsPromises);
}
