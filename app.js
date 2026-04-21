
// --------------------
// STORAGE
// --------------------
let travels = JSON.parse(localStorage.getItem("travels")) || [];
let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

// --------------------
// GLOBE INIT
// --------------------
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundColor("#050816")
  .pointAltitude(0.02)
  .pointRadius(0.3)
  .pointsData(travels)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(() => "orange");

// --------------------
// LOAD COUNTRIES (REAL GEOJSON)
// --------------------
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
  .then(res => res.json())
  .then(data => {

    globe
      .polygonsData(data.features)
      .polygonCapColor(d => {
        const name = d.properties.name;
        return visitedCountries.includes(name)
          ? "rgba(0,255,120,0.5)"
          : "rgba(255,255,255,0.05)";
      })
      .polygonSideColor(() => "rgba(255,255,255,0.02)")
      .polygonStrokeColor(() => "#222")
      .polygonLabel(d => d.properties.name);

    globe.onPolygonClick(handleCountryClick);
  });

// --------------------
// COUNTRY CLICK
// --------------------
function handleCountryClick(country) {

  const name = country.properties.name;

  if (!visitedCountries.includes(name)) {
    visitedCountries.push(name);

    travels.push({
      country: name,
      city: "",
      lat: 0,
      lng: 0,
      rating: 5
    });

    save();
    update();
  }
}

// --------------------
// CITY SEARCH (GEOCODING)
// --------------------
window.addCity = async function () {

  const city = document.getElementById("cityInput").value;
  const rating = document.getElementById("rating").value;

  if (!city) return alert("Stadt eingeben");

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
  );

  const data = await res.json();
  if (!data.length) return alert("Stadt nicht gefunden");

  const { lat, lon, display_name } = data[0];

  travels.push({
    country: display_name,
    city,
    lat: parseFloat(lat),
    lng: parseFloat(lon),
    rating
  });

  save();
  update();
};

// --------------------
// SAVE
// --------------------
function save() {
  localStorage.setItem("travels", JSON.stringify(travels));
  localStorage.setItem("countries", JSON.stringify(visitedCountries));
}

// --------------------
// UPDATE
// --------------------
function update() {

  globe.pointsData(travels);

  document.getElementById("countryCount").innerText =
    `Länder: ${visitedCountries.length} / 195`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.filter(t => t.city).length}`;

  updateCharts();
}

// --------------------
// CHARTS PRO
// --------------------
let pie, bar;

function updateCharts() {

  const ctx1 = document.getElementById("pieChart");
  const ctx2 = document.getElementById("barChart");

  if (pie) pie.destroy();
  if (bar) bar.destroy();

  pie = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Bereist", "Offen"],
      datasets: [{
        data: [visitedCountries.length, 195 - visitedCountries.length],
        backgroundColor: ["#22c55e", "#1f2937"]
      }]
    }
  });

  const map = {};
  travels.forEach(t => {
    map[t.country] = (map[t.country] || 0) + 1;
  });

  bar = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: Object.keys(map),
      datasets: [{
        label: "Städte",
        data: Object.values(map),
        backgroundColor: "#3b82f6"
      }]
    }
  });
}

// INIT
update();
