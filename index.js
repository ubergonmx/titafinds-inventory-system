// Environment module
import "dotenv/config";

// Express modules
import express from "express";
import expresshbs from "express-handlebars";
import morgan from "morgan";
import helmet from "helmet";
import { expressCspHeader } from "express-csp-header";
import session from "express-session";
import passport from "passport";
import mongoSanitize from "express-mongo-sanitize";

// Database module
import db from "./model/db.js";

// Import directory path and url
import { fileURLToPath } from "url";
import { dirname } from "path";

//Route modules
import routes from "./routes/routes.js";

const app = express();

const port = process.env.PORT || 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(__dirname + "/public"));

// Set handlebars as the app's view engine.
app.engine(
    "hbs",
    expresshbs.engine({
        extname: "hbs",
        defaultLayout: "main",
    })
);

// Set express' default file extension for views as .hbs
app.set("view engine", "hbs");

// Set the directory for the views
app.set("views", __dirname + "/views");

// Use helmet to secure Express headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Use morgan to log HTTP requests
app.use(morgan("dev"));

// Use express-csp-header to secure Express headers
app.use(
    expressCspHeader({
        policies: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "https://kit.fontawesome.com/e5cabd2361.js"],
        },
    })
);

// Use express-session to manage sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Use passport to manage authentication
app.use(passport.initialize());
app.use(passport.session());

// Use express-mongo-sanitize to sanitize data
app.use(mongoSanitize());

// Assign routes
app.use("/", routes);

// Connect to MongoDB
db.connectDB();

app.listen(port, function () {
    console.log("Server is running at port: " + port);
});
