import express from "express";
import connectToDatabase from "./database/mysql.js";

const app = express();
const PORT = process.env.PORT || 3000;


app.get("/", async (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
