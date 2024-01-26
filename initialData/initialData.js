const chalk = require("chalk");
const { User } = require("../models/users.model");
const { Card } = require("../models/cards.model");
const bcrypt = require("bcrypt");
const { users, cards } = require("./data.json");

async function initialize() {
   const usersList = [
      { first: "admin", mail: "admin", role: { admin: true, biz: true } },
      { first: "biz", mail: "biz", role: { admin: false, biz: true } },
      {
         first: "standard",
         mail: "standard",
         role: { admin: false, biz: false },
      },
   ];

   console.log(
      usersList.forEach(async (user) => {
         const newUser = new User(
            userTemplate(user.first, user.mail, {
               biz: user.role.biz,
               admin: user.role.admin,
            })
         );
      })
   );
   // const users = await User.find({
   //    "name.first": { $in: ["admin", "biz", "standard"] },
   // });
   // const initialUsers = [];
   // if (users.length !== 3) {
   //    usersList.forEach(async (user) => {
   //       const newUser = new User(
   //          userTemplate(user.first, user.mail, {
   //             biz: user.role.biz,
   //             admin: user.role.admin,
   //          })
   //       );
   //       initialUsers.push({
   //          ...newUser,
   //          password: await bcrypt.hash(newUser.password, 12),
   //       });
   //    });

   //    await User.create(initialUsers)
   //       .then(() => console.log(chalk.bgBlue("Initial users created")))
   //       .catch(console.log);
   // }

   //initialize cards
   const cardsList = ["1st Card", "2nd Card", "3rd Card"];
   const cards = [];
   console.log(
      cardsList.forEach(async (cardTitle) => {
         const newCard = new Card(cardsTemplate(cardTitle));
         cards.push(newCard);
      })
   );
   return cards;
   // const cards = await Card.find({
   //    title: { $in: cardsList },
   // });

   // if (cards.length !== 3) {
   //    const initialCards = [];
   //    cardsList.forEach(async (cardTitle) => {
   //       const newCard = new Card(cardsTemplate(cardTitle));
   //       initialCards.push(newCard);
   //    });

   //    await Card.create(initialCards)
   //       .then((data) => console.log(chalk.bgBlue("Initial cards created")))
   //       .catch(console.log);
   // }
}

module.exports = { initialize };
