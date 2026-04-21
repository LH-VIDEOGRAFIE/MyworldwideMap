let travels = JSON.parse(localStorage.getItem("travels")) || [];
let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

// 🌍 HELLE REALISTISCHE ERDE
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#dff1ff")

  .pointsData(travels)
  .pointLat(d => d.lat || 0)
  .pointLng(d => d.lng || 0)
  .pointColor(() => "red")
  .pointRadius(0.4)
  .pointAltitude(0.02);

// 🌍 LÄNDER LAYER (KLICKBAR)
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
  .then(res => res.json())
  .then(data => {

    globe.polygonsData(data.features)
      .polygonCapColor(d => {
        const name = d.properties.name;
        return visitedCountries.includes(name)
          ? "rgba(0,200,0,0.5)"
          : "rgba(0,0,0,0.05)";
      })
      .polygonSideColor(() => "rgba(0,0,0,0.01)")
      .polygonStrokeColor(() => "#555")

      // ✨ HOVER ANIMATION
      .onPolygonHover(d => {
        document.body.style.cursor = d ? "pointer" : "default";
      })

      // 📍 CLICK LAND
      .onPolygonClick(d => {
        const name = d.properties.name;

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
      });
  });

// ➕ MANUELL (OHNE LAT/LNG)
window.addTravel = function () {

  const country = document.getElementById("countryInput").value;
  const city = document.getElementById("cityInput").value;
  const rating = document.getElementById("rating").value;

  if (!country) return alert("Land fehlt");

  if (!visitedCountries.includes(country)) {
    visitedCountries.push(country);
  }

  travels.push({ country, city, lat: 0, lng: 0, rating });

  save();
  update();
};

// 💾 SAVE
function save() {
  localStorage.setItem("travels", JSON.stringify(travels));
  localStorage.setItem("countries", JSON.stringify(visitedCountries));
}

// 📊 UPDATE
function update() {

  globe.pointsData(travels);

  document.getElementById("countryCount").innerText =
    `Länder: ${visitedCountries.length} / 195`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.filter(t => t.city).length}`;

  updateCharts();
}

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
        backgroundColor: ["green", "#ddd"]
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
        backgroundColor: "blue"
      }]
    }
  });
}

// 🍔 MOBILE MENU
window.toggleMenu = function () {
  document.getElementById("sidebar").classList.toggle("active");
};

// INIT
update();
