const getLieuName = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        const data = await response.json();
        return data.display_name || "Lieu inconnu";
    } catch (error) {
        // console.error("Erreur lors de la récupération du nom de lieu:", error);
        return "Lieu inconnu";
    }
};

const verifyToken = async (token) => {
    try {
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ jeton: token }),
        });
        const data = await response.json();
        return { valid: true, data };
    } catch (e) {
        return { valid: false, data: null };
    }
};

const setItineraries = async (req, itinerary) => {
    try {
        const [itinerary_exist] = await req.db.execute(
            "SELECT * FROM `itineraries` WHERE itinerary = ?",
            [itinerary.itinerary]
        );

        if (itinerary_exist.length > 0) {
            return res.status(409).json({
                statut: "Erreur",
                message: "L'itinéraire existe déjà",
            });
        }

        await req.db.execute(
            "INSERT INTO `itineraries` (itinerary, userId, name, points) VALUES (?, ?, ?, ?)",
            [
                itinerary.itinerary,
                itinerary.userId,
                itinerary.name,
                itinerary.points,
            ]
        );

        return {
            statut: "Succès",
            message: "Itinéraire ajouté avec succès",
        };
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'itinéraire:", error);
        return {
            statut: "Erreur",
            message: "Erreur lors de l'ajout de l'itinéraire",
        };
    }
};

const getItineraries = async (req, userId) => {
    try {
        const [itineraries_exist] = await req.db.execute(
            "SELECT * FROM `itineraries` WHERE userId = ?",
            [userId]
        );

        if (itineraries_exist.length === 0) {
            return [];
        }
        return itineraries_exist;
    } catch (error) {
        console.error("Erreur lors de la récupération des itinéraires:", error);
        return {
            statut: "Erreur",
            message: "Erreur lors de la récupération des itinéraires",
        };
    }
};

const getStations = async () => {
    const url =
        "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=20&refine=nom_arrondissement_communes%3A%22Paris%22";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        const content = await response.json();

        if (content.results && content.results.length > 0) {
            return content.results;
        } else {
            return []; // Renvoyer un tableau vide s'il n'y a pas de résultats
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des stations:", error);
        return { error: error.message }; // Renvoyer un objet d'erreur
    }
};

module.exports = {
    getLieuName,
    verifyToken,
    setItineraries,
    getStations,
    getItineraries,
};
