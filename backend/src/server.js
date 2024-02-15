// backend/src/server.js

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const familyRoutes = require("./routes/familyRoutes");

const config = require("./config");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Family Tree API!");
});

app.use("/family", familyRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
