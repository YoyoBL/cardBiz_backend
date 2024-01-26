const router = require("express").Router();
const { authByRole } = require("../middleware/authorize.mw");
const userController = require("../controllers/userController");
const { validateMongoId } = require("../middleware/validateMongoId.mw");

//getall , register
router
   .route("/")
   .get(authByRole("admin"), userController.getUsers)
   .post(userController.signup);

//LOGIN
router.post("/login", userController.login);

//get by id, edit, patch status, delete
router
   .route("/:id")
   .all(validateMongoId)
   .get(authByRole(), userController.getById)
   .put(authByRole("user"), userController.editById)
   .patch(authByRole("user"), userController.patchStatus)
   .delete(authByRole("user"), userController.delete);

module.exports = router;
