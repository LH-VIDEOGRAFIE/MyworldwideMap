
// -------------------------
// 🔥 FIREBASE INIT
// -------------------------
const firebaseConfig = {
  apiKey: "DEIN_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let user = null;
let travels = [];

// -------------------------
// 🔐 LOGIN
// -------------------------
window.login = function () {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider).then(res => {
    user = res.user;

    document.getElementById("userInfo").innerHTML =
      "👤 " + user.displayName;

    loadData();
  });
};

// -------------------------
// 🌍 GLOBE
// -------------------------
const globe = Globe()
(document.getElementById("globeViz"))
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .backgroundColor("#eaf3ff")
  .pointRadius(0.35)
  .pointColor(() => "red")
  .pointsData([]);

// -------------------------
// ➕ ADD TRAVEL
// -------------------------
window.addTravel = async function () {

  if (!user) return alert("Login nötig");

  const country = document.getElementById("countryInput").value;
  const city = document.getElementById("cityInput").value;
  const photo = document.getElementById("photoInput").value;
  const rating = document.getElementById("rating").value;

  const geo = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city || country}`
  );

  const data = await geo.json();
  if (!data.length) return alert("Ort nicht gefunden");

  const travel = {
    userId: user.uid,
    country,
    city,
    photo,
    rating,
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    created: Date.now()
  };

  await db.collection("travels").add(travel);

  loadData();
};

// -------------------------
// ☁️ LOAD CLOUD DATA
// -------------------------
async function loadData() {

  if (!user) return;

  const snap = await db.collection("travels")
    .where("userId", "==", user.uid)
    .get();

  travels = snap.docs.map(d => d.data());

  globe.pointsData(travels);

  updateStats();
  renderTimeline();
  renderLeaderboard();
}

// -------------------------
// 📊 STATS
// -------------------------
function updateStats() {

  const countries = [...new Set(travels.map(t => t.country))];

  document.getElementById("countryCount").innerText =
    `Länder: ${countries.length} / 195`;

  document.getElementById("cityCount").innerText =
    `Städte: ${travels.filter(t => t.city).length}`;
}

// -------------------------
// 🧭 TIMELINE
// -------------------------
function renderTimeline() {

  const el = document.getElementById("timeline");
  el.innerHTML = "<h3>🧭 Timeline</h3>";

  travels
    .sort((a, b) => b.created - a.created)
    .forEach(t => {

      const div = document.createElement("div");
      div.innerHTML = `
        <b>${t.city || t.country}</b><br/>
        ⭐ ${t.rating}
        ${t.photo ? `<img src="${t.photo}" width="100"/>` : ""}
        <hr/>
      `;

      el.appendChild(div);
    });
}

// -------------------------
// 🏆 LEADERBOARD (SOCIAL LAYER)
// -------------------------
async function renderLeaderboard() {

  const el = document.getElementById("leaderboard");
  el.innerHTML = "<h3>🏆 Global Ranking</h3>";

  const snap = await db.collection("travels").get();

  const users = {};

  snap.forEach(doc => {
    const d = doc.data();
    users[d.userId] = (users[d.userId] || 0) + 1;
  });

  Object.entries(users)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5)
    .forEach(u => {
      const div = document.createElement("div");
      div.innerHTML = `👤 ${u[0].slice(0,6)}... → 🌍 ${u[1]} Reisen`;
      el.appendChild(div);
    });
}
