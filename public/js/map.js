let map = L.map("map").setView([25.0961, 85.3131], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let routeLayer;
let distanceKm = 0;
let debounceTimer;

/* ================= AUTOCOMPLETE ================= */
async function fetchSuggestions(query, listEl, inputEl) {
  if (query.length < 3) {
    listEl.innerHTML = "";
    return;
  }

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json&limit=6&countrycodes=in`;

    const res = await fetch(url, {
      headers: { "Accept-Language": "en" }
    });

    const data = await res.json();
    listEl.innerHTML = "";

    if (!data.length) {
      listEl.innerHTML = "<li>No results found</li>";
      return;
    }

    data.forEach(place => {
      const li = document.createElement("li");
      li.textContent = place.display_name;

      li.onclick = () => {
        inputEl.value = place.display_name;
        inputEl.dataset.lat = place.lat;
        inputEl.dataset.lon = place.lon;
        listEl.innerHTML = "";
      };

      listEl.appendChild(li);
    });
  }, 400);
}

const sourceInput = document.getElementById("source");
const destInput = document.getElementById("destination");
const sourceList = document.getElementById("source-suggestions");
const destList = document.getElementById("destination-suggestions");

sourceInput.addEventListener("input", () =>
  fetchSuggestions(sourceInput.value, sourceList, sourceInput)
);

destInput.addEventListener("input", () =>
  fetchSuggestions(destInput.value, destList, destInput)
);

/* ================= SAFE GEOCODING ================= */
async function getCoords(inputEl) {
  if (inputEl.dataset.lat && inputEl.dataset.lon) {
    return {
      lat: parseFloat(inputEl.dataset.lat),
      lon: parseFloat(inputEl.dataset.lon)
    };
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(inputEl.value)}` +
    `&format=json&limit=1&countrycodes=in`
  );

  const data = await res.json();

  if (!data.length) {
    throw new Error("Location not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

/* ================= ROUTE + FARE ================= */
document.getElementById("calcBtn").addEventListener("click", async () => {
  try {
    if (!sourceInput.value || !destInput.value) {
      alert("Please enter both locations");
      return;
    }

    const src = await getCoords(sourceInput);
    const dst = await getCoords(destInput);

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${src.lon},${src.lat};${dst.lon},${dst.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(osrmUrl);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes || !data.routes.length) {
      alert("No road route found between these locations");
      return;
    }

    const route = data.routes[0];
    distanceKm = (route.distance / 1000).toFixed(2);

    const rideType = document.querySelector("input[name='ride']:checked").value;
    const rates = { auto: 17, bike: 14, car: 20 };
    const fare = Math.round(distanceKm * rates[rideType]);

    document.getElementById("distance").innerText = `${distanceKm} km`;
    document.getElementById("fare").innerText = `₹${fare}`;

    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(route.geometry).addTo(map);
    map.fitBounds(routeLayer.getBounds());

  } catch (err) {
    console.error(err);
    alert("Unable to calculate route. Try nearby landmark.");
  }
});

/* ================= BOOK RIDE → WHATSAPP ================= */
document.getElementById("bookBtn").addEventListener("click", () => {
  if (!distanceKm) {
    alert("Calculate route first");
    return;
  }

  const userName = document.getElementById("userName").value.trim();
  const userPhone = document.getElementById("userPhone").value.trim();

  if (!userName || !userPhone) {
    alert("Please enter your name and phone number");
    return;
  }

  const rideType = document.querySelector("input[name='ride']:checked").value;
  const rates = { auto: 10, bike: 7, car: 15 };
  const fare = Math.round(distanceKm * rates[rideType]);

  const message =
` *Trend Ride – Booking Request*

 Name: ${userName}
 Phone: ${userPhone}

 Pickup: ${sourceInput.value}
 Drop: ${destInput.value}

 Ride Type: ${rideType.toUpperCase()}
 Distance: ${distanceKm} km
 Estimated Fare: ₹${fare}

 Please contact the customer to confirm.`;

  const whatsappNumber = "7903541905"; // 🔴 CHANGE TO YOUR NUMBER

  const whatsappURL =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank");
});
