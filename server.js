const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/book-ride", (req, res) => {
  const { source, destination, distance, rideType } = req.body;

  const rates = { auto: 10, bike: 7, car: 15 };
  const fare = Math.round(distance * rates[rideType]);

  res.json({
    success: true,
    message: "Ride booked successfully 🚖",
    data: { source, destination, distance, rideType, fare }
  });
});

app.listen(PORT, () => {
  console.log(`Trend Ride running → http://localhost:${PORT}`);
});
