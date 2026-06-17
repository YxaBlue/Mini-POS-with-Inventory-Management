require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express           = require("express");
const helmet            = require("helmet");
const rateLimit         = require("express-rate-limit");
const cors              = require("cors");
const { errorHandler }  = require("./middleware/errorHandler");
const allowedOrigins    = ["https://localhost:5500", "http://127.0.0.1:5500"];

const app = express();


// SECURITY HEADERS
app.use(helmet());

// RESTRICT FRONTEND ORIGIN
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// RATE LIMIT
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later."}
});
app.use("/", limiter);

// BODY PARSING + SIZE LIMIT
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ROUTES
const productRoutes = require("./routes/productRoutes");
app.use("/products", productRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});