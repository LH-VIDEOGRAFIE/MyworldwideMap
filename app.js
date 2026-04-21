// --------------------
// DATEN SPEICHERN
// --------------------
let travels = JSON.parse(localStorage.getItem("travels")) || [];

// --------------------
// GLOBE INITIALISIEREN
// --------------------
const globe = Globe()
  (document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
  .backgroundColor("#0b0f1a")
  .pointsData(travels)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(() => "orange")
  .pointAltitude(0.05)
  .pointRadius(0.3)
  .pointLabel(d => `${d.city}, ${d.country} ⭐${d.rating}`);

// --------------------
// ADD TRAVEL
// --------------------
window.addTravel = function () {
  const country = document.getElementById("countryInput").value;
  const city = document.getElementById("cityInput").value;
  const lat = parseFloat(document.getElementById("latInput").value);
  const lng = parseFloat(document.getElementById("lngInput").value);
  const rating = document.getElementById("rating").value;

  if (!country || !city || isNaN(lat) || isNaN(lng)) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  const travel = { country, city, lat, lng, rating };
  travels.push(travel);

  localStorage.setItem("travels", JSON.stringify(travels));

  updateGlobe();
  updateStats();
  updateCharts();
};

// --------------------
// GLOBE UPDATE
// --------------------
function updateGlobe() {
  globe.pointsData(travels);
}

// --------------------
// STATISTIK
// --------------------
function updateStats() {
  const countries = [...new Set(travels.map(t => t.country))];

  document.getElementById("countryCount").innerText =
    `Länder: ${countries.length} / 195`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.length}`;
}

// --------------------
// CHARTS
// --------------------
let pieChart, barChart;

function updateCharts() {
  const ctx1 = document.getElementById("pieChart");
  const ctx2 = document.getElementById("barChart");

  const countries = [...new Set(travels.map(t => t.country))];

  // PIE CHART
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: ["Bereist", "Offen"],
      datasets: [{
        data: [countries.length, 195 - countries.length],
        backgroundColor: ["#3b82f6", "#1f2937"]
      }]
    }
  });

  // BAR CHART (Städte pro Land)
  const countMap = {};
  travels.forEach(t => {
    countMap[t.country] = (countMap[t.country] || 0) + 1;
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: Object.keys(countMap),
      datasets: [{
        label: "Städte",
        data: Object.values(countMap),
        backgroundColor: "#3b82f6"
      }]
    }
  });
}

// --------------------
// INIT
// --------------------
updateGlobe();
updateStats();
updateCharts();