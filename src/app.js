const express = require("express");
const path = require("path");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", studentRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).render("error", {
    title: "Error",
    message: "Something went wrong while processing your request."
  });
});

module.exports = app;
