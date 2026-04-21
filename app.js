

let travels = JSON.parse(localStorage.getItem("travels")) || [];
let visitedCountries = JSON.parse(localStorage.getItem("countries")) || [];

// 🌍 GLOBE
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#eaf3ff");

// 🌍 LÄNDER DATEN
let countriesData = [];

// 🌍 LOAD COUNTRIES
fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.geojson")
.then(res => res.json())
.then(data => {

  countriesData = data.features;

  globe.polygonsData(countriesData)

    .polygonStrokeColor(() => "#555")

    // ⭐ WICHTIG: FÄRBUNG NACH NAME MATCH
    .polygonCapColor(d => {

      const name = d.properties.name;

      return visitedCountries.includes(name)
        ? "rgba(0,140,255,0.55)"   // FARBIGES LAND
        : "rgba(255,255,255,0.03)";
    })

    .onPolygonHover(d => {
      document.body.style.cursor = d ? "pointer" : "default";
    });
});

// ➕ LAND HINZUFÜGEN (TEXT INPUT)
window.addTravel = function () {

  const country = document.getElementById("countryInput").value;

  if (!country) return;

  // 🔥 LAND IN LISTE
  if (!visitedCountries.includes(country)) {
    visitedCountries.push(country);
  }

  save();
  update();
};

// 💾 SAVE
function save() {
  localStorage.setItem("countries", JSON.stringify(visitedCountries));
  localStorage.setItem("travels", JSON.stringify(travels));
}

// 🔄 UPDATE
function update() {

  globe.polygonsData(countriesData);

  renderList();
}

// 🧾 LISTE
function renderList() {

  const el = document.getElementById("countryList");
  el.innerHTML = "<h3>🌍 Länder</h3>";

  visitedCountries.forEach(c => {
    el.innerHTML += `<div>${c}</div>`;
  });
}

// INIT
update();
