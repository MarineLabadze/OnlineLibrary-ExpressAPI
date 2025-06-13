const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));

// ✅ error handler should be last
app.use(errorHandler);

async function startServer() {
    try {
        await connectDB();
        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (error) {
        console.error("Failed to connect to DB:", error);
        process.exit(1);
    }
}

startServer();
