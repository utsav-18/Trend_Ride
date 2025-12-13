let map = L.map("map").setView([20.5937, 78.9629], 5);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let routeLayer;
let distanceKm = 0;

// simple geocoding using Nominatim
async function geocode(place) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
  );
  const data = await res.json();
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

document.getElementById("calcBtn").addEventListener("click", async () => {
  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const rideType = document.querySelector("input[name='ride']:checked").value;

  if (!source || !destination) return alert("Enter locations");

  const src = await geocode(source);
  const dest = await geocode(destination);

  const url = `https://router.project-osrm.org/route/v1/driving/${src[1]},${src[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  const route = data.routes[0];
  distanceKm = (route.distance / 1000).toFixed(2);

  const prices = { auto: 10, bike: 7, car: 15 };
  const fare = Math.round(distanceKm * prices[rideType]);

  document.getElementById("distance").innerText = `${distanceKm} km`;
  document.getElementById("fare").innerText = `₹${fare}`;

  if (routeLayer) map.removeLayer(routeLayer);

  routeLayer = L.geoJSON(route.geometry).addTo(map);
  map.fitBounds(routeLayer.getBounds());
});

document.getElementById("bookBtn").addEventListener("click", async () => {
  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const rideType = document.querySelector("input[name='ride']:checked").value;

  if (!distanceKm) return alert("Calculate route first");

  const res = await fetch("/book-ride", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source,
      destination,
      distance: distanceKm,
      rideType
    })
  });

  const data = await res.json();
  alert(data.message);
});
