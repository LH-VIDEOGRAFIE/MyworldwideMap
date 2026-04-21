
let travels = JSON.parse(localStorage.getItem("travels")) || [];
let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

// 🌍 GLOBE (OPTIMIERT + ANIMIERT)
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#eaf3ff");

// 🌍 ZOOM FUNCTION
function zoomTo(lat, lng) {
  globe.pointOfView({ lat, lng, altitude: 1.8 }, 1000);
}

// 📍 PINS (STÄDTE – VISUELL VERBESSERT)
function updateGlobe() {

  globe.pointsData(travels.filter(t => t.lat && t.lng))
    .pointLat(d => d.lat)
    .pointLng(d => d.lng)

    // ✨ BESSERER MARKER LOOK
    .pointColor(() => "rgba(255,255,255,0.9)")
    .pointAltitude(0.02)
    .pointRadius(0.5);
}

// 🌍 LÄNDER (PRO VISUALS)
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
.then(res => res.json())
.then(data => {

  globe.polygonsData(data.features)

    // ✨ smoother look
    .polygonSideColor(() => "rgba(0,0,0,0.02)")
    .polygonStrokeColor(() => "rgba(0,0,0,0.4)")

    // 🌈 FARBLOGIK UPGRADED
    .polygonCapColor(d => {

      const name = d.properties.name;
      const entry = travels.find(t => t.country === name);

      if (!entry) return "rgba(255,255,255,0.03)";

      // stärker sichtbare Farbe
      return `rgba(0,140,255,0.55)`;
    })

    // 🖱 HOVER EFFECT
    .onPolygonHover(d => {
      document.body.style.cursor = d ? "pointer" : "default";
    })

    // 🌍 CLICK = ZOOM + SAVE
    .onPolygonClick(d => {

      const country = d.properties.name;

      if (!visitedCountries.includes(country)) {

        visitedCountries.push(country);

        travels.push({
          country,
          city: null,
          lat: null,
          lng: null,
          rating: 5
        });

        save();
        update();
      }

      // ✨ ZOOM (MIT GEO CENTER)
      const coords = d.properties.latlng;

      if (coords) {
        zoomTo(coords[0], coords[1]);
      }
    });
});

// 🍔 MENU
window.toggleMenu = function () {
  document.getElementById("sidebar").classList.toggle("open");
};

// ➕ ADD TRAVEL
window.addTravel = async function () {

  const country = document.getElementById("countryInput").value;
  const city = document.getElementById("cityInput").value;
  const rating = Number(document.getElementById("rating").value);

  let lat = null;
  let lng = null;

  if (city) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
    );

    const data = await res.json();
    if (!data.length) return alert("Nicht gefunden");

    lat = +data[0].lat;
    lng = +data[0].lon;

    // ✨ ZOOM AUF STADT
    zoomTo(lat, lng);
  }

  if (country && !visitedCountries.includes(country)) {
    visitedCountries.push(country);
  }

  if (city) {
    travels.push({
      country,
      city,
      name: city,
      lat,
      lng,
      rating
    });
  }

  save();
  update();
};

// 🗑 DELETE COUNTRY
window.removeCountry = function (c) {
  visitedCountries = visitedCountries.filter(x => x !== c);
  travels = travels.filter(t => t.country !== c);
  save();
  update();
};

// 🗑 DELETE CITY
window.removeCity = function (name) {
  travels = travels.filter(t => t.city !== name);
  save();
  update();
};

// 💾 SAVE
function save() {
  localStorage.setItem("travels", JSON.stringify(travels));
  localStorage.setItem("countries", JSON.stringify(visitedCountries));
}

// 📊 UPDATE SYSTEM
function update() {

  updateGlobe();

  document.getElementById("countryCount").innerText =
    `Länder: ${visitedCountries.length}`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.filter(t => t.city).length}`;

  render();
  renderRatings();
}

// 🧾 LISTS
function render() {

  const c = document.getElementById("countryList");
  const t = document.getElementById("cityList");

  c.innerHTML = "<h3>🌍 Länder</h3>";
  t.innerHTML = "<h3>📍 Städte</h3>";

  visitedCountries.forEach(x => {
    c.innerHTML += `<div>${x} <button onclick="removeCountry('${x}')">❌</button></div>`;
  });

  travels.forEach(x => {
    if (x.city)
      t.innerHTML += `<div>${x.city} <button onclick="removeCity('${x.city}')">❌</button></div>`;
  });
}

// ⭐ RATING STATS
function renderRatings() {

  const stats = {1:0,2:0,3:0,4:0,5:0};

  travels.forEach(t => {
    if (t.rating) stats[t.rating]++;
  });

  const el = document.getElementById("ratingStats");

  el.innerHTML = "<h3>⭐ Bewertungen</h3>";

  Object.keys(stats).reverse().forEach(k => {
    el.innerHTML += `<div>${"⭐".repeat(k)}: ${stats[k]}</div>`;
  });
}

// INIT
updateGlobe();
update();
