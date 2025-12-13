let map = L.map("map").setView([25.0961, 85.3131], 6); // Bihar focus

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let routeLayer;
let distanceKm = 0;
let debounceTimer;

/* ================= IMPROVED AUTOCOMPLETE ================= */
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
      `&format=json` +
      `&limit=6` +
      `&countrycodes=in` +
      `&viewbox=68.1,37.6,97.4,6.7` +
      `&bounded=1`;

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

/* ================= ROUTE + FARE ================= */
document.getElementById("calcBtn").addEventListener("click", async () => {
  if (!sourceInput.dataset.lat || !destInput.dataset.lat) {
    alert("Select locations from suggestions");
    return;
  }

  const srcLat = sourceInput.dataset.lat;
  const srcLon = sourceInput.dataset.lon;
  const dstLat = destInput.dataset.lat;
  const dstLon = destInput.dataset.lon;

  const url = `https://router.project-osrm.org/route/v1/driving/${srcLon},${srcLat};${dstLon},${dstLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  const route = data.routes[0];
  distanceKm = (route.distance / 1000).toFixed(2);

  const rideType = document.querySelector("input[name='ride']:checked").value;
  const rates = { auto: 10, bike: 7, car: 15 };
  const fare = Math.round(distanceKm * rates[rideType]);

  document.getElementById("distance").innerText = `${distanceKm} km`;
  document.getElementById("fare").innerText = `₹${fare}`;

  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.geoJSON(route.geometry).addTo(map);
  map.fitBounds(routeLayer.getBounds());
});

/* ================= BOOK RIDE ================= */
document.getElementById("bookBtn").addEventListener("click", async () => {
  if (!distanceKm) return alert("Calculate route first");

  const res = await fetch("/book-ride", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: sourceInput.value,
      destination: destInput.value,
      distance: distanceKm,
      rideType: document.querySelector("input[name='ride']:checked").value
    })
  });

  const data = await res.json();
  alert(data.message);
});
