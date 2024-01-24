const chalk = require("chalk");
const { User } = require("../models/users.model");
const { Card } = require("../models/cards.model");
const bcrypt = require("bcrypt");

function userTemplate(first, mail, { biz, admin }) {
   return {
      name: {
         first,
         middle: "",
         last: first,
      },
      phone: "0512345567",
      email: `${mail}@email.com`,
      password: "Abc!123Abc",
      image: {
         url: "",
         alt: "",
      },
      address: {
         state: "IL",
         country: "Israel",
         city: "Arad",
         street: "Shoham",
         houseNumber: 5,
         zip: 8920435,
      },
      isBusiness: biz,
      isAdmin: admin,
   };
}

function cardsTemplate(title) {
   return {
      title,
      subtitle: "a test value for this card",
      description: "a test value for new card\na test value for new card\n",
      phone: "052591381",
      email: "qwe@gmail.com",
      web: "",
      image: {
         url: "",
         alt: "",
      },
      address: {
         state: "IL",
         country: "Israel",
         city: "Arad",
         street: "Shoham",
         houseNumber: 5,
         zip: 8920435,
      },
   };
}

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

   const users = await User.find({
      "name.first": { $in: ["admin", "biz", "standard"] },
   });
   const initialUsers = [];
   if (users.length !== 3) {
      usersList.forEach(async (user) => {
         const newUser = new User(
            userTemplate(user.first, user.mail, {
               biz: user.role.biz,
               admin: user.role.admin,
            })
         );
         initialUsers.push({
            ...newUser,
            password: await bcrypt.hash(newUser.password, 12),
         });
      });

      await User.create(initialUsers)
         .then(() => console.log(chalk.bgBlue("Initial users created")))
         .catch(console.log);
   }

   //initialize cards
   const cardsList = ["1st Card", "2nd Card", "3rd Card"];

   const cards = await Card.find({
      title: { $in: cardsList },
   });

   if (cards.length !== 3) {
      const initialCards = [];
      cardsList.forEach(async (cardTitle) => {
         const newCard = new Card(cardsTemplate(cardTitle));
         initialCards.push(newCard);
      });

      await Card.create(initialCards)
         .then((data) => console.log(chalk.bgBlue("Initial cards created")))
         .catch(console.log);
   }
}

module.exports = { initialize };
