

let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#eaf3ff");

let geoData = [];

// 🌍 LOAD COUNTRIES
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
.then(res => res.json())
.then(data => {

  geoData = data.features;

  renderGlobe();

});

function renderGlobe() {

  globe.polygonsData(geoData)

    .polygonStrokeColor(() => "#444")

    // ⭐ LAND FÄRBEN (KORREKTES MATCHING)
    .polygonCapColor(d => {

      const name = d.properties.name;

      return visitedCountries.includes(name)
        ? "rgba(0,140,255,0.6)"
        : "rgba(255,255,255,0.03)";
    })

    .onPolygonHover(d => {
      document.body.style.cursor = d ? "pointer" : "default";
    });
}

// ➕ LAND HINZUFÜGEN
window.addCountry = function () {

  const input = document.getElementById("countryInput").value;

  if (!input) return;

  if (!visitedCountries.includes(input)) {
    visitedCountries.push(input);
  }

  save();
  update();
};

// 💾 SAVE
function save() {
  localStorage.setItem("countries", JSON.stringify(visitedCountries));
}

// 🔄 UPDATE
function update() {
  renderGlobe();
  renderList();
}

// 🧾 LISTE
function renderList() {

  const el = document.getElementById("countryList");
  el.innerHTML = "<h3>Länder</h3>";

  visitedCountries.forEach(c => {
    el.innerHTML += `<div>${c}</div>`;
  });
}

// 🍔 TOGGLE MENU
window.toggleMenu = function () {
  document.getElementById("sidebar").classList.toggle("open");
};

// INIT
update();
