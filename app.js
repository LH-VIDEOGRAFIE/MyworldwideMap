
let travels = JSON.parse(localStorage.getItem("travels")) || [];
let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

// 🌍 GLOBE (STABIL + MOBILE SAFE)
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#eaf3ff")

  .pointsData(travels)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(() => "red")
  .pointRadius(0.35);

// 🌍 LÄNDER (ECHT + KLICKBAR)
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
  .then(res => res.json())
  .then(data => {

    globe.polygonsData(data.features)

      .polygonCapColor(d => {
        const name = d.properties.name;
        return visitedCountries.includes(name)
          ? "rgba(0,200,0,0.5)"
          : "rgba(255,255,255,0.05)";
      })

      .polygonSideColor(() => "rgba(0,0,0,0.02)")
      .polygonStrokeColor(() => "#666")

      // 🟢 LAND KLICK (FIXED)
      .onPolygonClick(d => {

        const country = d.properties.name;

        if (!visitedCountries.includes(country)) {
          visitedCountries.push(country);

          travels.push({
            country,
            city: "",
            lat: 0,
            lng: 0,
            rating: 5
          });

          save();
          update();
        }
      })

      .onPolygonHover(d => {
        document.body.style.cursor = d ? "pointer" : "default";
      });
  });

// 📍 STADT HINZUFÜGEN (ECHTE GEO POSITION)
window.addTravel = async function () {

  const country = document.getElementById("countryInput").value;
  const city = document.getElementById("cityInput").value;
  const rating = document.getElementById("rating").value;

  if (!country && !city) return alert("Bitte eingeben");

  let lat = 0;
  let lng = 0;

  if (city) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
    );

    const data = await res.json();

    if (!data.length) return alert("Stadt nicht gefunden");

    lat = parseFloat(data[0].lat);
    lng = parseFloat(data[0].lon);
  }

  if (country && !visitedCountries.includes(country)) {
    visitedCountries.push(country);
  }

  travels.push({
    country: country || city,
    city,
    lat,
    lng,
    rating
  });

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

  globe.pointsData(travels);

  document.getElementById("countryCount").innerText =
    `Länder: ${visitedCountries.length} / 195`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.filter(t => t.city).length}`;

  renderCountryList();
  updateCharts();
}

// 🗂 LISTE DER LÄNDER (DELETE FUNKTION)
function renderCountryList() {

  const el = document.getElementById("countryList");
  el.innerHTML = "<h3>🌍 Länder</h3>";

  visitedCountries.forEach((c, i) => {

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";

    div.innerHTML = `
      <span>${c}</span>
      <button style="width:auto" onclick="removeCountry(${i})">❌</button>
    `;

    el.appendChild(div);
  });
}

// 🗑 REMOVE COUNTRY
window.removeCountry = function (i) {

  const country = visitedCountries[i];

  visitedCountries.splice(i, 1);
  travels = travels.filter(t => t.country !== country);

  save();
  update();
};

// 📊 CHARTS
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
        backgroundColor: ["#22c55e", "#ddd"]
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
        data: Object.values(map),
        backgroundColor: "#2563eb"
      }]
    }
  });
}

// INIT
update();
