const map = L.map('map', {fullscreenControl: true}).setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

// Icon perso
const issIcon = L.icon({
    iconUrl: 'assets/img/iss-icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
});

// Definir marqueur
let issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);
let firstLoad = true

let positionHistory = [];

async function getISSLocation() {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();

    // Variables des données
    const lat = parseFloat(data.iss_position.latitude);
    const lon = parseFloat(data.iss_position.longitude);
    const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

    // Affichage marqueur
    issMarker.setLatLng([lat, lon]);
    issMarker.bindPopup(`ISS Position<br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);
    console.log([lat, lon])

    // Centrer sur l'ISS
    if (firstLoad) {
      map.setView([lat, lon], 4);
      firstLoad = false;
    }

    // Envoie les données vers la positionHistory
    positionHistory.push({ time: timestamp, lat: lat, lon: lon });

    // Mise à jour du tableau
    updateTable();

  } catch (error) {
    console.error("Erreur lors de la récupération des données ISS :", error);
  }
}

function moveISS(){
    if (firstLoad){
        getISSLocation();
    }
    setTimeout(() => {
        getISSLocation();
        moveISS();
    }, 5000);
}

function updateTable(){
    const tbody = document.getElementById('table-ISS');
    if (!tbody) return;

    // Suppression de l'ancien tableau
    tbody.innerHTML = "";

    // Affichage des données dans le tableau
    positionHistory.forEach(pos => {
        tbody.innerHTML += `
            <tr>
                <td>${pos.time}</td>
                <td>${pos.lat.toFixed(4)}</td>
                <td>${pos.lon.toFixed(4)}</td>
            </tr>
        `;
    });
}

moveISS();