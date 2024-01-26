const {
   authByRole,
   authRegisteredUser,
} = require("../middleware/authorize.mw");
const { validateMongoId } = require("../middleware/validateMongoId.mw");
const cardController = require("../controllers/cardController");

const router = require("express").Router();

//GET ALL CARDS, //CREATE CARD
router
   .route("/")
   .get(cardController.getAll)
   .post(authByRole("business"), cardController.create);

//GET CARD BY ID //UPDATE CARD BY ID // LIKE CARD //DELETE CARD
router
   .route("/:id")
   .all(validateMongoId)
   .get(authRegisteredUser, cardController.getById)
   .put(authRegisteredUser, cardController.updateById)
   .patch(authRegisteredUser, cardController.likeCard)
   .delete(authRegisteredUser, cardController.delete);

module.exports = router;
