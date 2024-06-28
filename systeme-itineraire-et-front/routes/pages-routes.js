const {
    getLieuName,
    verifyToken,
    getItineraries,
    setItineraries,
    getStations
} = require("../utils/utils-functions");
const uuidv4 = require("uuid").v4;

const getMainFunc = async (req, res) => {
    if (req.cookies.usertoken) {
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) {
            const itineraries = await getItineraries(
                req,
                data.utilisateur.userId
            );

            if (!Array.isArray(itineraries)) {
                console.error(
                    "Erreur : getItineraries n'a pas retourné un tableau"
                );
                return;
            }
            if (itineraries.length === 0) {
                return res.render("index", {
                    user: data.utilisateur.identifiant,
                    itineraries: [],
                });
            }
            const itinerariesWithNames = await Promise.all(
                itineraries.map(async (itinerary) => {
                    const startName = await getLieuName(
                        itinerary.points[0].lat,
                        itinerary.points[0].lng
                    );
                    const endName = await getLieuName(
                        itinerary.points[1].lat,
                        itinerary.points[1].lng
                    );
                    return {
                        ...itinerary,
                        startName,
                        endName,
                        token: req.cookies.usertoken,
                    };
                })
            );

            res.render("index", {
                user: data.utilisateur.identifiant,
                itineraries: itinerariesWithNames,
                modification: ""
            });
        } else {
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
};

const postAddItineraryFunc = async (req, res) => {
    const { name, points } = req.body;

    const id = uuidv4();

    if (req.cookies.usertoken) {
        const { valid, data } = await verifyToken(req.cookies.usertoken);

        if (!valid) {
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
        };

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
            );

            if (response.ok) {
                const addItineraryResponse = await setItineraries(
                    req,
                    itineraryData
                );

                if (addItineraryResponse.statut === "Succès") {
                    res.status(201).json({
                        message: addItineraryResponse.message,
                    });
                } else {
                    res.status(400).json({
                        message: addItineraryResponse.message,
                    });
                }
            } else {
                const errorData = await response.json();
                res.status(response.status).json(errorData);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

const deleteItineraryFunc = async (req, res) => {
    const { itineraryId } = req.body;

    if (req.cookies.usertoken) {
        const { valid, data } = await verifyToken(req.cookies.usertoken);

        if (!valid) {
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
            );

            if (itinerary_exist.length === 0) {
                return res.status(404).json({
                    statut: "Erreur",
                    message: "Itinéraire introuvable",
                });
            }

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
            );

            res.status(204).send();
        } catch (error) {
            console.error(
                "Erreur lors de la suppression de l'itinéraire:",
                error
            );
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

const getVelibsFunc = async (req, res) => {
    if (req.cookies.usertoken) {
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) {
            const content = await getStations();

            if (!content) {
                return res
                    .status(500)
                    .send("Erreur lors de la récupération des stations");
            }
            res.render("velibs", {
                user: data.utilisateur.identifiant,
                stations: content,
            });
        } else {
            res.redirect("/");
        }
    }
};

module.exports = {
    getMainFunc,
    postAddItineraryFunc,
    deleteItineraryFunc,
    getVelibsFunc,
};
