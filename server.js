const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// home route
app.get("/", (req, res) => {
  res.render("index");
});

// demo booking endpoint
app.post("/book-ride", (req, res) => {
  const { source, destination, distance, rideType } = req.body;

  const prices = {
    auto: 10,
    bike: 7,
    car: 15
  };

  const fare = Math.round(distance * prices[rideType]);

  res.json({
    status: "success",
    message: "Ride booked successfully 🚕",
    data: {
      source,
      destination,
      distance: `${distance} km`,
      rideType,
      fare: `₹${fare}`
    }
  });
});

app.listen(PORT, () => {
  console.log(`Trend Ride running on http://localhost:${PORT}`);
});
