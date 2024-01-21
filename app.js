require("dotenv/config");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("node:path");
const { errorFileLogger } = require("./lib/errorFileLogger");

const server = mongoose
   .connect(process.env.MONGO_URI)
   .then(() => console.log("Connected to DB"))
   .catch((err) => console.log(`DB not connected, error: ${err}`));

const app = express();

app.use(cors());

app.use(morgan("dev"));
app.use(express.json());

app.use("/users", require("./routes/users.routes"));
app.use("/cards", require("./routes/cards.routes"));

app.use((req, res) => {
   res.status(404);
   res.sendFile(path.resolve(__dirname, "./static/404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Connected to port ${PORT}`));
