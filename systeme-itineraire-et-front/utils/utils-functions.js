// fonction pour obtenir le nom d'un lieu à partir de ses coordonnées
const getLieuName = async (lat, lng) => {
    // url de l'API
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    try {
        const response = await fetch(url); // Appel de l'api

        if (!response.ok) {
            // Si la réponse de l'API n'est pas ok
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        const data = await response.json(); // Conversion de la réponse en JSON
        return data.display_name || "Lieu inconnu"; // On retourne le nom du lieu sauf s'il n'existe pas alors on retourne "Lieu inconnu"
    } catch (error) {
        // console.error("Erreur lors de la récupération du nom de lieu:", error);
        return "Lieu inconnu";
    }
};

// Fonction pour vérifier un token d'authentification
const verifyToken = async (token) => {
    try {
        // On appelle la route de notre serveir auth afin de vérifier si le token est toujours valide
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Type de contenu
            },
            body: JSON.stringify({ jeton: token }), // On envoie le token dans le corps de la requête
        });
        const data = await response.json(); // On convertit la réponse en JSON
        return { valid: true, data }; // Retourne un objet indiquant que le token est valide
    } catch (e) {
        return { valid: false, data: null }; // Retourne un objet indiquant que le token n'est pas valide
    }
};

// Fonction pour ajouter un itinéraire à la base de données
const setItineraries = async (req, itinerary) => {
    try {
        const [itinerary_exist] = await req.db.execute(
            "SELECT * FROM `itineraries` WHERE itinerary = ?",
            [itinerary.itinerary]
        ); // On vérifie si l'itinéraire existe déjà dans la base de données

        if (itinerary_exist.length > 0) {
            return res.status(409).json({
                statut: "Erreur",
                message: "L'itinéraire existe déjà",
            }); // On retourne une erreur si l'itinéraire existe déjà
        }

        await req.db.execute(
            "INSERT INTO `itineraries` (itinerary, userId, name, points) VALUES (?, ?, ?, ?)",
            [
                itinerary.itinerary,
                itinerary.userId,
                itinerary.name,
                itinerary.points,
            ] // On ajoute l'itinéraire à la base de données
        );

        return {
            statut: "Succès",
            message: "Itinéraire ajouté avec succès",
        }; // On retourne un message de succès
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'itinéraire:", error);
        return {
            statut: "Erreur",
            message: "Erreur lors de l'ajout de l'itinéraire",
        };
    }
};

// Fonction pour obtenir les itinéraires d'un utilisateur
const getItineraries = async (req, userId) => {
    try {
        const [itineraries_exist] = await req.db.execute(
            "SELECT * FROM `itineraries` WHERE userId = ?",
            [userId]
        ); // On obtient les itinéraires de l'utilisateur de la base de données

        if (itineraries_exist.length === 0) {
            return []; // On retourne un tableau vide si aucun itinéraire n'est trouvé
        }
        return itineraries_exist; // On retourne les itinéraires trouvés
    } catch (error) {
        console.error("Erreur lors de la récupération des itinéraires:", error);
        return {
            statut: "Erreur",
            message: "Erreur lors de la récupération des itinéraires",
        };
    }
};

// Fonction pour obtenir les stations
const getStations = async () => {
    // Route de l'api
    const url =
        "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=20&refine=nom_arrondissement_communes%3A%22Paris%22";

    try {
        const response = await fetch(url); // appel de l'API

        if (!response.ok) {
            // On envoie une erreur  si la réponse n'est pas ok
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        const content = await response.json(); // On convertit la réponse en JSON

        if (content.results && content.results.length > 0) {
            return content.results; // On retourne les résultats si elles existent
        } else {
            return []; // On renvoie un tableau vide s'il n'y a pas de résultats
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des stations:", error);
        return { error: error.message }; // Renvoyer un objet d'erreur
    }
};

// On export ces fonctions pour pouvoir les récupérer dans d'autres fichiers
module.exports = {
    getLieuName,
    verifyToken,
    setItineraries,
    getStations,
    getItineraries,
};
