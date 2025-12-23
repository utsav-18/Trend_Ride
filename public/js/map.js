let map;
let directionsService;
let directionsRenderer;
let sourceAutocomplete;
let destinationAutocomplete;

let distanceKm = 0;
let calculatedFare = 0;

/* ========= RATES ========= */
const RATES = {
  auto: 17,
  bike: 14,
  car: 20
};

/* ========== MAP LOGIC (CALLED BY HTML initMap) ========== */
window._initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.0961, lng: 85.3131 },
    zoom: 6
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  sourceAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById("source"),
    { componentRestrictions: { country: "in" } }
  );

  destinationAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById("destination"),
    { componentRestrictions: { country: "in" } }
  );
};

/* ========== ROUTE + FARE ========== */
document.getElementById("calcBtn").addEventListener("click", () => {
  const source = document.getElementById("source").value.trim();
  const destination = document.getElementById("destination").value.trim();

  if (!source || !destination) {
    alert("Please enter both pickup and drop locations");
    return;
  }

  directionsService.route(
    {
      origin: source,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (result, status) => {
      if (status !== "OK") {
        alert("Unable to calculate route. Try nearby landmark.");
        return;
      }

      directionsRenderer.setDirections(result);

      const leg = result.routes[0].legs[0];
      distanceKm = (leg.distance.value / 1000).toFixed(2);

      const rideType =
        document.querySelector("input[name='ride']:checked").value;

      calculatedFare = Math.round(distanceKm * RATES[rideType]);

      document.getElementById("distance").innerText = `${distanceKm} km`;
      document.getElementById("fare").innerText = `₹${calculatedFare}`;
    }
  );
});

/* ========== VALIDATION ========= */
function isValidName(name) {
  return /^[A-Za-z ]{3,}$/.test(name);
}
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

/* ========== BOOK RIDE → WHATSAPP WITH MAP LINK ========== */
document.getElementById("bookBtn").addEventListener("click", () => {
  if (!distanceKm || !calculatedFare) {
    alert("Please calculate route and fare first");
    return;
  }

  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();

  if (!isValidName(name) || !isValidPhone(phone)) {
    alert("Enter valid name and 10-digit phone number");
    return;
  }

  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const rideType =
    document.querySelector("input[name='ride']:checked").value;

  const mapLink =
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      source
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  const message =
`*Trend Ride – Booking Request*

Name: ${name}
Phone: ${phone}

Pickup: *${source}*
Drop: *${destination}*

Ride Type: ${rideType.toUpperCase()}
Distance: *${distanceKm} km*
Fare: *₹${calculatedFare}*

Route:
${mapLink}`;

  window.open(
    `https://wa.me/918971654394?text=${encodeURIComponent(message)}`,
    "_blank"
  );
});


{

const currentLocationBtn = document.getElementById("currentLocationBtn");

currentLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  currentLocationBtn.innerText = "Fetching location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Center map on user location
      map.setCenter({ lat, lng });
      map.setZoom(15);

      // Marker
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Your current location"
      });

      // Reverse geocoding (lat/lng → address)
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          document.getElementById("source").value =
            results[0].formatted_address;
        } else {
          document.getElementById("source").value =
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      });

      currentLocationBtn.innerText = "📍 Use my current location";
    },
    (error) => {
      alert("Unable to fetch location. Please allow location access.");
      currentLocationBtn.innerText = "📍 Use my current location";
    }
  );
});


}