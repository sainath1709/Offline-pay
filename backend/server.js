require("dotenv").config();
// const transactionRoutes=require("./src/routes/transactionRoutes");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT,"0.0.0.0", () => {
        console.log(`OfflinePay server running on port ${PORT}`);
    });
};

startServer();