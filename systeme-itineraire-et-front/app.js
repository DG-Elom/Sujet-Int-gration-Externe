const express = require("express");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const uuidv4 = require("uuid").v4;
const mysql = require("mysql2/promise");
const {
    getMainFunc,
    postAddItineraryFunc,
    getVelibsFunc,
} = require("./routes/pages-routes");
const { db_configs } = require("./utils/db_configs");
const {
    getLoginFunc,
    postLoginFunc,
    getRegisterFunc,
    postRegisterFunc,
    getLogoutFunc,
} = require("./routes/auth-routes");
const { get } = require("http");

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(db_configs);

// set template engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("views", [
    path.join(__dirname, "views"),
    path.join(__dirname, "views/auth"),
]);

// routes
app.get("/", getMainFunc);
app.get("/login", getLoginFunc);
app.post("/login", postLoginFunc);
app.get("/register", getRegisterFunc);
app.post("/register", postRegisterFunc);
app.get("/logout", getLogoutFunc);
app.post("/add-itinerary", postAddItineraryFunc);
app.get("/velibs", getVelibsFunc);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
