const mysql = require("mysql2/promise");

const db_configs = (req, res, next) => {
    // S'il y a déjà une variable req.db, on continue
    if (req.db) {
        next();
    } else {
        // On crée la connexion
        mysql
            .createConnection({
                // Voir fichier .env qui contient les informations de connection
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME,
            })
            .then((connection) => {
                // On stocke la connexion dans l'objet req
                req.db = connection;
                // On passe à la suite
                next();
            })
            .catch((error) => {
                // Voici ce que j'envoie si une erreur se produit. Statut 500 pour spécifié que la base de données n'est pas disponible avec un message pour spécifier pourquoi.
                if (error.code === "ER_ACCESS_DENIED_ERROR") {
                    res.status(500).send(
                        "Accès refusé. Vérifiez vos identifiants"
                    );
                } else if (error.code === "ER_BAD_DB_ERROR") {
                    res.status(500).send("Base de données inconnue.");
                } else if (
                    error.code === "ETIMEDOUT" ||
                    error.code === "ENETUNREACH"
                ) {
                    res.status(500).send(
                        "Impossible de joindre le serveur de la base de données"
                    );
                } else {
                    res.status(500).send(
                        "Erreur de connexion à la base de données:",
                        error
                    );
                }
            });
    }
};

module.exports = { db_configs };
