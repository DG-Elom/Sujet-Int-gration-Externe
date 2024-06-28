const { verifyToken } = require("../utils/utils-functions");

const getLoginFunc = (req, res) => {
    let donnee = { message: null };
    if (req.cookies.usertoken) {
        const { valid, data } = verifyToken(req.cookies.usertoken);
        if (valid) {
            res.render("/", { user: data.utilisateur.identifiant });
        } else {
            res.render("auth/login", { user: null, error: donnee.message });
        }
    } else {
        res.render("auth/login", { user: null, error: donnee.message });
    }
};

const postLoginFunc = (req, res) => {
    const { login, password } = req.body;

    fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant: login, motdepasse: password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.statut == "Succès") {
                const { token } = data;

                res.cookie("usertoken", token, {
                    maxAge: 3600000,
                    httpOnly: true,
                });
                res.redirect("/");
            } else {
                res.redirect("/login");
            }
        });
};

const getRegisterFunc = (req, res) => {
    res.render("auth/register", { user: null, error: null });
};

const getLogoutFunc = (req, res) => {
    fetch(`${process.env.AUTH_SERVICE_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jeton: req.cookies.usertoken }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
        })
        .catch((error) => {
            console.error("Erreur lors de la déconnexion:", error.message);
        })
        .finally(() => {
            res.clearCookie("usertoken");
            res.redirect("/login");
        });
};

const postRegisterFunc = (req, res) => {
    const { login, password } = req.body;

    fetch(`${process.env.AUTH_SERVICE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant: login, motdepasse: password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.statut == "Succès") {
                res.redirect("/login");
                console.log(data.message);
            } else {
                res.render("auth/register", {
                    user: null,
                    error: data.message,
                });
            }
        });
};

module.exports = {
    getLoginFunc,
    postLoginFunc,
    getLogoutFunc,
    getRegisterFunc,
    postRegisterFunc,
};
