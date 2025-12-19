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

/* ========= RIDE SYMBOLS ========= */
const RIDE_SYMBOLS = {
  auto: "🚕",
  bike: "🏍",
  car: "🚗"
};

/* ========== GOOGLE MAP INIT (GLOBAL) ========== */
/* IMPORTANT: Must be attached to window */
window.initMap = function () {
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

/* ========== VALIDATION HELPERS ========== */
function isValidName(name) {
  return /^[A-Za-z ]{3,}$/.test(name);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

/* ========== BOOK RIDE → WHATSAPP (WITH MAP LINK) ========== */
document.getElementById("bookBtn").addEventListener("click", () => {
  if (!distanceKm || !calculatedFare) {
    alert("Please calculate route and fare first");
    return;
  }

  const nameInput = document.getElementById("userName");
  const phoneInput = document.getElementById("userPhone");

  const userName = nameInput.value.trim();
  const userPhone = phoneInput.value.trim();

  nameInput.style.borderColor = "";
  phoneInput.style.borderColor = "";

  let valid = true;

  if (!isValidName(userName)) {
    nameInput.style.borderColor = "red";
    valid = false;
  }

  if (!isValidPhone(userPhone)) {
    phoneInput.style.borderColor = "red";
    valid = false;
  }

  if (!valid) {
    alert("Please enter a valid name and 10-digit phone number");
    return;
  }

  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const rideType =
    document.querySelector("input[name='ride']:checked").value;

  /* GOOGLE MAPS DIRECTION LINK */
  const mapLink =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(source)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=driving`;

  const message =
`*Trend Ride – Booking Request*

Name: ${userName}
Phone: ${userPhone}

Pickup: *${source}*
Drop: *${destination}*

Ride Type: ${rideType.toUpperCase()}
Distance: *${distanceKm} km*
Estimated Fare: *₹${calculatedFare}*

Google Maps Route:
${mapLink}

Please contact the customer to confirm.`;

  const whatsappURL =
    `https://wa.me/918971654394?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank");
});
