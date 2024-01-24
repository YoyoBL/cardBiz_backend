const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("node:path");
const chalk = require("chalk");

require("dotenv").config({
   path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const { errorFileLogger } = require("./lib/errorFileLogger");
const { initialize } = require("./lib/initialdata");

const server = mongoose
   .connect(process.env.MONGO_URI)
   .then(() => console.log(chalk.bgGreen("Connected to DB")))
   .catch((err) => console.log(chalk.bgRed(`DB not connected, error: ${err}`)));

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// initialize();

app.use("/cards", require("./routes/cards.routes"));
app.use("/users", require("./routes/users.routes"));

app.use((err, req, res, next) => {
   if (!err?.statusCode) return next(err);
   console.error(
      chalk.red(err.stack) + chalk.bgRed("\nStatusCode: ", err?.statusCode)
   );

   if (err.statusCode >= 400) {
      res.status(err.statusCode).send(err.message);
      errorFileLogger(err);
   }
});

app.use((req, res) => {
   res.status(404);
   res.sendFile(path.resolve(__dirname, "./static/404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(chalk.bgGreen(`Connected to port ${PORT}`)));
