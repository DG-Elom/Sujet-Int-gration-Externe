const {
    getLieuName,
    verifyToken,
    getItineraries,
    setItineraries,
    getStations,
    shortenAddress,
    haversineDistance,
} = require("../utils/utils-functions");
const uuidv4 = require("uuid").v4;

// Fonction pour gérer la page principale
const getMainFunc = async (req, res) => {
    // On vérifie si le cookie utilisateur existe
    if (req.cookies.usertoken) {
        // On vérifier si le token utilisateur est valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) {
            // Si le token est valide alors on récupère les itinéraires de l'utilisateur
            const itineraries = await getItineraries(
                req,
                data.utilisateur.userId
            );

            // On vérifie si la réponse est un tableau
            if (!Array.isArray(itineraries)) {
                console.error(
                    "Erreur : getItineraries n'a pas retourné un tableau"
                );
                return;
            }

            // Si la réponse est un tableau on vérifie s'il n'a pas d'itinéraire
            if (itineraries.length === 0) {
                // Rendu de la page sans itinéraire
                return res.render("index", {
                    user: data.utilisateur.identifiant,
                    itineraries: [],
                });
            }

            const itinerariesWithNames = await Promise.all(

                itineraries.map(async (itinerary) => { // On boucle pour récupéreer les données de chaques itinéraires récupérés
                    const p_liste = await Promise.all(
                        itinerary.points.map(async (point) => {
                            const name = await getLieuName(
                                point.lat,
                                point.lng
                            );
                            return shortenAddress(name);
                        })
                    );

                    const distance = haversineDistance(
                        itinerary.points[0],
                        itinerary.points[1]
                    );

                    const startName = p_liste[0]; // On récupère le nom du lieu de départ
                    const endName = p_liste[1]; // On récupère le nom du lieu d'arrivée

                    return {
                        ...itinerary,
                        startName,
                        endName,
                        distance,
                        token: req.cookies.usertoken,
                    };
                })
            );

            res.render("index", {
                user: data.utilisateur.identifiant,
                itineraries: itinerariesWithNames,
                modification: ""
            }); // Rendu de la page avec les itinéraires
        } else {
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
};

// Fonction pour ajouter un itinéraire
const postAddItineraryFunc = async (req, res) => {
    // On récupère les données dans le corps de la requête
    const { name, points } = req.body;

    // Génaration d'un uuid pour l'itinéraire
    const id = uuidv4();

    if (req.cookies.usertoken) { // Si le cookie utllisateur existe
        // On vérifie si le token est toujours valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);

        if (!valid) {
            // S'il n'est plus valide alors on envoie une erreur 401
            return res.status(401).json({
                statut: "Erreur",
                message: "Vous devez être connecté pour ajouter un itinéraire",
            });
        }

        const itineraryData = {
            itinerary: id,
            name: name,
            userId: data.utilisateur.userId,
            points: points,
        }; // On stocke les données de l'itinéraire dans un objet

        try {
            const response = await fetch(
                `${process.env.PDF_SERVICE_URL}/itinerary`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        itinerary: id,
                        name: name,
                        token: req.cookies.usertoken,
                        points: points,
                    }),
                }
            ); // On appel la route pour générer le pdf

            if (response.ok) {
                // Si la réponse est ok alors on ajoute l'itinéraire à la basse de données
                const addItineraryResponse = await setItineraries(
                    req,
                    itineraryData
                );

                if (addItineraryResponse.statut === "Succès") {
                    // On renvoie un statut 200 si l'ajout est un succès
                    res.status(201).json({
                        message: addItineraryResponse.message,
                    });
                } else {
                    // On renvoie un statut 400 en cas d'erreur de l'ajout de l'itinéraire dans la base de données
                    res.status(400).json({
                        message: addItineraryResponse.message,
                    });
                }
            } else {
                // On envoie un message en cas d'échec de génération de PDF
                const errorData = await response.json();
                res.status(response.status).json(errorData);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

// Fonction pour supprimer un itinéraire
const deleteItineraryFunc = async (req, res) => {
    // On récupère les données dans le corps de la requête
    const { itineraryId } = req.body;

    if (req.cookies.usertoken) { // On vérifie si le token utilisateur existe
        // On vérifie si le token est toujours valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);

        if (!valid) {
            // S'il n'est plus valide alors on envoie une erreur 401
            return res.status(401).json({
                statut: "Erreur",
                message:
                    "Vous devez être connecté pour supprimer un itinéraire",
            });
        }

        try {
            const [itinerary_exist] = await req.db.execute(
                "SELECT * FROM `itineraries` WHERE itinerary = ?",
                [itineraryId]
            ); // Vérification de l'existence de l'itinéraire dans la base de données

            if (itinerary_exist.length === 0) { // Si l'itinéraire n'existe pas
                return res.status(404).json({
                    statut: "Erreur",
                    message: "Itinéraire introuvable",
                });
            }

            // Si l'utilisateur n'est pas le propriétaire de l'itinéraire
            if (itinerary_exist[0].userId !== data.utilisateur.userId) {
                return res.status(403).json({
                    statut: "Erreur",
                    message:
                        "Vous n'êtes pas autorisé à supprimer cet itinéraire",
                });
            }

            await req.db.execute(
                "DELETE FROM `itineraries` WHERE itinerary = ?",
                [itineraryId]
            ); // Suppression de l'itinéraire de la base de données

            res.status(204).send(); // Retourne un statut de succès sans contenu
        } catch (error) {
            console.error(
                "Erreur lors de la suppression de l'itinéraire:",
                error
            );
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

// Fonction pour afficher les stations vélib
const getVelibsFunc = async (req, res) => {
    if (req.cookies.usertoken) { // On vérifie si le token utilisateur existe
        // On vérifie si le token est toujours valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) { // Si le token est toujours valide
            
            const content = await getStations(); // On récupère toutes les stations

            if (!content) { // Si une erreur survient lors de l'obtention des stations
                return res
                    .status(500)
                    .send("Erreur lors de la récupération des stations");
            }
            res.render("velibs", {
                user: data.utilisateur.identifiant,
                stations: content,
            }); // Rendu de la page des stations avec les données
        } else { // Si le token n'est pas valide
            res.redirect("/"); // Redirection vers la page d'accueil
        }
    }
};

// Exportation des fonctions
module.exports = {
    getMainFunc,
    postAddItineraryFunc,
    deleteItineraryFunc,
    getVelibsFunc,
};
