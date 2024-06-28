const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const puppeteer = require("puppeteer");
const { jsPDF } = require("jspdf");

const app = express();
const port = 3001;

app.use(express.json());

// Utiliser le middleware CORS
app.use(
    cors({
        origin: "http://localhost:3000", // Autorise les requêtes depuis cette origine
        methods: ["GET", "POST"], // Autorise les méthodes GET et POST
        allowedHeaders: ["Content-Type", "Authorization"], // Autorise les en-têtes spécifiques
    })
);

// Fonction de vérification du token (à implémenter)
async function verifierToken(token) {
    try {
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ jeton: token }),
        });
        const data = await response.json();

        return true;
    } catch (e) {
        return false;
    }
}

async function getLieuName(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name || "Lieu inconnu";
}

app.post("/itinerary", async (req, res) => {
    try {
        const { itinerary, name, token, points } = req.body;

        // Vérification du jeton d'authentification
        if (!verifierToken(token)) {
            return res
                .status(401)
                .json({ error: "Jeton d'authentification incorrect" });
        }
        console.log(points);
        console.log(itinerary);

        const depart = await getLieuName(points[0].lat, points[0].lng);
        const arrivee = await getLieuName(points[1].lat, points[1].lng);

        // Génération de la carte Leaflet (côté serveur)
        const htmlContent = `
            <!DOCTYPE html>
<html>
  <head>
    <title>${name}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css"
    />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <style>
      #map {
        height: 800px;
      }
      #itinerary-info {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: white;
        padding: 10px;
        z-index: 1000;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="itinerary-info">
      <strong>De :</strong> ${depart} <br />
      <strong>A :</strong> ${arrivee}
    </div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
    <script>
      let map = L.map("map").setView(
        [48.853844054333514, 2.289705348222022],
        8
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      let selectedMarkers = [];

      function marker_func(mark_points) {
        mark_points.forEach((point) => {
          let lat = point.lat;
          let lng = point.lng;

          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: "./img/marker-48.ico",
              shadowUrl:
                "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
              iconSize: [30, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(map);

          selectedMarkers.push(marker);
        });

        // Créer l'itinéraire automatiquement après avoir ajouté les marqueurs
        if (selectedMarkers.length >= 2) {
          createRoute();
        }
      }

      function createRoute() {
        const routingControl = L.Routing.control({
          waypoints: selectedMarkers.map((marker) => marker.getLatLng()),
          routeWhileDragging: true,
          language: "fr",
          show: false, // Masquer le panneau d'itinéraire
          createMarker: function (i, waypoint, n) {
            return L.marker(waypoint.latLng, {
              draggable: true,
            });
          },
        }).addTo(map);

        routingControl.on("routesfound", function (e) {
          // Récupérer les limites de l'itinéraire
          let bounds = L.latLngBounds(e.routes[0].coordinates);

          // Ajuster la vue de la carte pour inclure tout l'itinéraire
          map.fitBounds(bounds, {
            padding: [50, 50], // Ajoute un peu de marge autour de l'itinéraire
          });
        });
      }

      let mark_points = [
        {lat: ${points[0].lat}, lng: ${points[0].lng}},
        {lat: ${points[1].lat}, lng: ${points[1].lng}},
      ];

      marker_func(mark_points);
    </script>
  </body>
</html>

        `;

        // Utilisation de Puppeteer pour capturer la carte
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const mapImage = await page.screenshot({ type: "png" });
        await browser.close();

        // Création du PDF avec jsPDF
        const pdf = new jsPDF();
        pdf.addImage(mapImage, "PNG", 0, 0);

        // Enregistrement du PDF dans un fichier
        const pdfFilePath = path.join(
            __dirname,
            "pdfs",
            `itinerary-${itinerary}.pdf`
        ); // Chemin du fichier

        //ajouter le chemin du ficher dans un fichier json et le créer s'il n'existe pas
        if (!fs.existsSync("pdfs.json")) {
            fs.writeFileSync("pdfs.json", "[]");
        }
        const pdfs_data = fs.readFileSync("pdfs.json");
        const pdfs = JSON.parse(pdfs_data);
        // vérifier si l'id de l'itinéraire existe déjà, si oui, le remplacer
        const pdfIndex = pdfs.findIndex((pdf) => pdf.id === itinerary);
        if (pdfIndex !== -1) {
            // Supprimer l'ancien fichier PDF et le remplacer par le nouveau
            fs.unlinkSync(pdfs[pdfIndex].pdfFilePath);
            pdfs[pdfIndex] = { pdfFilePath: pdfFilePath, id: itinerary };
        } else {
            pdfs.push({ pdfFilePath: pdfFilePath, id: itinerary });
        }
        fs.writeFileSync("pdfs.json", JSON.stringify(pdfs));

        pdf.save(pdfFilePath);

        res.status(204).end(); // Succès, pas de contenu retourné
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la génération du PDF" });
    }
});

app.get("/itinerary/:id", (req, res) => {
    const id = req.params.id;

    const pdfFilePath = `./pdfs/itinerary-${id}.pdf`; // Chemin vers le fichier PDF

    // Vérification de l'existence du fichier
    if (!fs.existsSync(pdfFilePath)) {
        return res.status(404).json({ error: "PDF non trouvé" });
    }

    // Lecture du fichier en tant que flux binaire (blob)
    const pdfStream = fs.createReadStream(pdfFilePath);

    // Définition des en-têtes de réponse
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=itinerary-${id}.pdf`
    );

    // Envoi du flux binaire au client
    pdfStream.pipe(res);
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
