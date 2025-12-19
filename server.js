require("dotenv").config();   

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error("❌ GOOGLE_MAPS_API_KEY not loaded from .env");
  }

  res.render("index", {
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
