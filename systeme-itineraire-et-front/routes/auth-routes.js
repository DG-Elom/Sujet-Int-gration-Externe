// On importe de la fonction verifyToken depuis utils-functions
const { verifyToken } = require("../utils/utils-functions");

// Fonction pour gérer la page de connexion
const getLoginFunc = async (req, res) => {
    let donnee = {};
    let errorMessage = null; // Variable pour stocker le message d'erreur

    if (req.cookies.usertoken) {
        try {
            const { valid, data } = await verifyToken(req.cookies.usertoken);
            donnee = { ...data };
            if (valid) {
                res.render("/", { user: data.utilisateur.identifiant });
            } else {
                errorMessage =
                    donnee.message || "Erreur lors de la vérification du token"; // Message d'erreur par défaut
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du token :", error);
            errorMessage = "Erreur lors de la vérification du token";
        }
    } else {
        // Pas de token, donc l'utilisateur n'est pas connecté

        errorMessage = "Veuillez vous connecter";
    }

    res.render("auth/login", { user: null, error: errorMessage });
};

// Fonction pour gérer la soumission du formulaire de connexion
const postLoginFunc = (req, res) => {
    // On récupère les données dans le corps de la requête
    const { login, password } = req.body;

    // On appel la route login de notre serveur d'authentification
    fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant: login, motdepasse: password }), // On envoie les donénes nécessaires dans le corps de la requête
    })
        .then((response) => response.json()) // On convertit de la réponse en JSON
        .then((data) => {
            if (data.statut == "Succès") {
                // Si le statut est "Succès"
                const { token } = data; // On extrait le token de la réponse

                res.cookie("usertoken", token, {
                    // On crée d'un cookie pour stocker le token de l'utilisateur
                    maxAge: 3600000, // Durée de vie du cookie
                    httpOnly: true, // Accessible uniquement par le serveur
                });
                res.redirect("/"); // Redirection vers la page d'accueil
            } else {
                res.redirect("/login"); // Redirection vers la page login
            }
        });
};

// Fonction pour afficher la page d'inscription
const getRegisterFunc = (req, res) => {
    // Rendu de la page d'inscription avec des valeurs null pour user et error
    res.render("auth/register", { user: null, error: null });
};

// Fonction pour gérer la déconnexion
const getLogoutFunc = (req, res) => {
    // On appel la route logout de notre serveur d'authentification
    fetch(`${process.env.AUTH_SERVICE_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jeton: req.cookies.usertoken }), // Corps de la requête avec le token de l'utilisateur
    })
        .then((response) => response.json()) // Conversion de la réponse en JSON
        .then((data) => {
            console.log(data.message); // Affichage du message de la réponse
        })
        .catch((error) => {
            // Affichage de l'erreur en cas de problème
            console.error("Erreur lors de la déconnexion:", error.message);
        })
        .finally(() => {
            // Suppression du cookie usertoken
            res.clearCookie("usertoken");
            // Redirection vers la page de login
            res.redirect("/login");
        });
};

// Fonction pour gérer la soumission du formulaire d'inscription
const postRegisterFunc = (req, res) => {
    // On récupère les données du corps de la requête
    const { login, password } = req.body;

    // On appel la route register de notre serveur d'authentification
    fetch(`${process.env.AUTH_SERVICE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant: login, motdepasse: password }), // Corps de la requête avec les identifiants de l'utilisateur
    })
        .then((response) => response.json()) // Conversion de la réponse en JSON
        .then((data) => {
            if (data.statut == "Succès") {
                // Redirection vers la page de login si le statut est succès
                res.redirect("/login");
                console.log(data.message);
            } else {
                // Si le statut n'est pas "Succès"
                res.render("auth/register", {
                    user: null,
                    error: data.message,
                });
            }
        });
};

// Fonction pour afficher la page de mise à jour du profil
const getUpdateProfileFunc = async (req, res) => {
    if (req.cookies.usertoken) {
        // On vérifie si le cookie usertoken existe
        // On vérifie si le token est valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) {
            // Si le token est valide on affiche la page updateUser
            res.render("updateUser", {
                user: data.utilisateur.identifiant,
                modification: "",
                error: "",
            });
        } else {
            res.redirect("/"); // Sinon on redirige sur la page d'accueil
        }
    }
};

// Fonction pour gérer la soumission du formulaire de mise à jour du profil
const postUpdateProfileFunc = async (req, res) => {
    if (req.cookies.usertoken) {
        // On vérifie si le cookie usertoken existe
        // On vérifie si le token est valide
        const { valid, data } = await verifyToken(req.cookies.usertoken);
        if (valid) {
            // Si le token est valide
            // On récupère les données dans le corps de la requête
            const { login, password } = req.body;

            // On appel la route update sur le serveur d'authentification
            fetch(`${process.env.AUTH_SERVICE_URL}/update`, {
                method: "PATCH", // On urilisa la méthode PATCH comme indiqué dans l'énoncé
                headers: {
                    "Content-Type": "application/json",
                },
                // On envoie les données nécessaires dans le corps de la requête
                body: JSON.stringify({
                    identifiant: login,
                    motdepasse: password,
                    id: data.utilisateur.userId,
                    jeton: req.cookies.usertoken,
                }),
            })
                .then((response) => response.json()) // On convertit la réponse en JSON
                .then((dataRes) => {
                    if (dataRes.statut == "Succès") {
                        // Si le statut est "Succès" on redirige la page vers la page d'accueil
                        res.redirect("/");
                    } else if (dataRes.statut == "ErreurIdentifiant") {
                        // Si le statut est "ErreurIdentifiant" qui correspond à un utilisateur déjà existant
                        // on affiche la page updateUser avec une erreur
                        res.render("updateUser", {
                            user: data.utilisateur.identifiant,
                            modification: "",
                            error: "Le changement n'a pas été effectué, le nom d'utilisateur existe déjà, veuillez réessayer",
                        });
                    } else {
                        // Si une autre erreur survient on affiche la page UpdateUser avec un message d'erreur
                        res.render("updateUser", {
                            user: data.utilisateur.identifiant,
                            modification: "",
                            error: "Une erreur est survenue, veuillez réessayer.",
                        });
                    }
                });
        } else {
            // Si le token n'est pas valide
            res.redirect("/"); // Redirection vers la page d'accueil
        }
    }
};

// On export les fonctions afin de pouvoir les récupérer dans d'autres fichiers
module.exports = {
    getLoginFunc,
    postLoginFunc,
    getLogoutFunc,
    getRegisterFunc,
    postRegisterFunc,
    getUpdateProfileFunc,
    postUpdateProfileFunc,
};
