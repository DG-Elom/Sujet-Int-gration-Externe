const map = L.map("map").setView([48.8566, 2.3522], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let selectedPoints = []; // Tableau pour stocker les points
let markers = [];
let selectedMarkers = [];
let routingControl = null;

async function getLieuName(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name || "Lieu inconnu";
}

document.addEventListener("DOMContentLoaded", () => {
    map.on("click", function (e) {
        selectedPoints.push(e.latlng);
        L.marker(e.latlng).addTo(map);
    });

    map.on("zoomend", function () {
        const itineraryInfo = document.getElementById("itinerary-info");
        if (itineraryInfo) {
            const currentText = itineraryInfo.innerHTML;
            const zoomLevel = map.getZoom();

            // Remove any existing zoom information
            const newText = currentText.replace(/ - Zoom : \d+/, "");

            // Add the updated zoom information
            itineraryInfo.innerHTML = newText + ` - Zoom : ${zoomLevel}`;
        }
    });
});

fetch(
    "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=20&refine=nom_arrondissement_communes%3A%22Paris%22"
)
    .then((response) => response.json())
    .then((data) => {
        markers = data.results.map((station) => {
            const marker = L.marker([
                station.coordonnees_geo.lat,
                station.coordonnees_geo.lon,
            ])
                .addTo(map)
                .bindPopup(
                    `<b>${station.name}</b><br>Vélos disponibles: ${station.capacity}`
                );

            marker.on("click", () => {
                if (
                    selectedMarkers.length < 2 &&
                    !selectedMarkers.includes(marker)
                ) {
                    marker.setIcon(
                        L.icon({
                            iconUrl: "./img/marker-48.ico",
                            shadowUrl:
                                "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
                            iconSize: [30, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41],
                        })
                    );
                    selectedMarkers.push(marker);
                    if (selectedMarkers.length === 2) {
                        let itineraryInfo =
                            document.getElementById("itinerary-info");
                        itineraryInfo.innerHTML = "";

                        for (let i = 0; i < selectedPoints.length - 1; i++) {
                            let distance = selectedPoints[i].distanceTo(
                                selectedPoints[i + 1]
                            );

                            // Display distance only if valid (not NaN)
                            if (!isNaN(distance)) {
                                itineraryInfo.innerHTML += `De ${
                                    selectedPoints[i]
                                } à ${
                                    selectedPoints[i + 1]
                                } (Distance : ${distance.toFixed(0)} m)<br>`;
                            }
                        }

                        const itinerary_name =
                            document.getElementById("itinerary-name");
                        const input = document.createElement("input");
                        input.type = "text";
                        input.placeholder = "Nom de l'itinéraire";
                        input.id = "itineraryName";
                        input.required = true;
                        itinerary_name.appendChild(input);

                        routingControl = L.Routing.control({
                            waypoints: selectedMarkers.map((marker) =>
                                marker.getLatLng()
                            ),
                            language: "fr",
                            show: false,
                            createMarker: function (i, waypoint, n) {
                                return L.marker(waypoint.latLng, {
                                    draggable: true,
                                    icon: L.icon({
                                        iconUrl: "./img/marker-48.ico", // Remplacez par le chemin de votre icône
                                        shadowUrl:
                                            "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
                                        iconSize: [30, 41],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        shadowSize: [41, 41],
                                    }),
                                });
                            },
                        }).addTo(map);
                        routingControl.on("routesfound", function (e) {
                            const routes = e.routes;
                            const summary = routes[0].summary;
                            const instructions = routes[0].instructions;
                            let itineraryInfo =
                                document.getElementById("itinerary-info");
                            itineraryInfo.innerHTML = `<b>Itinéraire trouvé:</b><br/>Distance: ${
                                summary.totalDistance / 1000
                            } km<br/>Durée: ${
                                summary.totalTime / 60
                            } min<br/><br/><b>Instructions:</b><br/>`;
                            instructions.forEach((instruction, index) => {
                                itineraryInfo.innerHTML += `${index + 1}. ${
                                    instruction.text
                                }<br/>`;
                            });
                        });
                        document.getElementById(
                            "addItinerary"
                        ).disabled = false;
                    }
                }
            });

            return marker;
        });
    });

// Générer le PDF
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll('[id^="generatePdfButton_"]');
    const deleteButtons = document.querySelectorAll(
        '[id^="deleteItineraryButton_"]'
    );

    const addItineraryButton = document.getElementById("addItinerary");

    addItineraryButton.addEventListener("click", function () {
        document.getElementById("loading-spinner").classList.remove("hidden");
        const waypoints = [
            {
                lat: selectedMarkers[0].getLatLng().lat,
                lng: selectedMarkers[0].getLatLng().lng,
            },

            {
                lat: selectedMarkers[1].getLatLng().lat,
                lng: selectedMarkers[1].getLatLng().lng,
            },
        ];
        const itinerary_name = document.getElementById("itineraryName");

        const itineraryName = itinerary_name.value
            ? itinerary_name.value.charAt(0).toUpperCase() +
              itinerary_name.value.slice(1)
            : "Mon itinéraire";

        const data = {
            name: itineraryName,
            points: waypoints,
        };

        fetch("http://localhost:3000/add-itinerary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then((response) => {
            if (response.ok) {
                selectedMarkers = [];
                selectedPoints = [];
                routingControl.setWaypoints([]);
                document.getElementById("addItinerary").disabled = true;
                // supprimer le input
                itinerary_name.remove();
                // alert("Itinéraire ajouté avec succès");
                location.reload();
                document
                    .getElementById("loading-spinner")
                    .classList.add("hidden");
            }
        });
    });

    // Écoutez l'événement "click" sur le bouton
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            // désactivez le bouton si le nombre de marqueurs sélectionnés n'est pas égal à 2

            const itineraryId = this.id.split("_")[1];
            const itineraryName = this.id.split("_")[2];

            button.disabled = true;
            document
                .getElementById("loading-spinner")
                .classList.remove("hidden");

            fetch(`http://localhost:3001/itinerary/${itineraryId}`)
                .then((response) => response.blob())
                .catch((error) => {
                    console.error(
                        "Erreur lors de la récupération du PDF:",
                        error.message
                    );
                })
                .then((blob) => {
                    if (!blob) {
                        console.error("Erreur lors de la génération du PDF");
                        return;
                    }
                    console.log("clic sur le bouton pdf");

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${itineraryName}.pdf`;
                    a.click();
                    alert("PDF généré avec succès");
                })
                .catch((error) => {
                    console.error(
                        "Erreur lors de la récupération du PDF:",
                        error.message
                    );
                })
                .finally(() => {
                    document
                        .getElementById("loading-spinner")
                        .classList.add("hidden");
                    button.disabled = false;
                });
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener("click", function () {
            document
                .getElementById("loading-spinner")
                .classList.remove("hidden");
            const itineraryId = this.id.split("_")[1];

            button.disabled = true;

            fetch(`http://localhost:3000/delete-itinerary`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itineraryId: itineraryId }),
            })
                .then((response) => {
                    if (response.ok) {
                        button.disabled = false;
                        location.reload();
                    }
                    document
                        .getElementById("loading-spinner")
                        .classList.add("hidden");
                })
                .catch((error) => {
                    console.error(
                        "Erreur lors de la suppression de l'itinéraire:",
                        error.message
                    );
                });
        });
    });
});
// Afficher le spinner au début du chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loading-spinner").classList.remove("hidden");
});

// Masquer le spinner lorsque la page est complètement chargée
window.addEventListener("load", () => {
    document.getElementById("loading-spinner").classList.add("hidden");
});

toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: 3000, // Durée d'affichage en millisecondes
};
