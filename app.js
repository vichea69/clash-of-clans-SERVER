import express from "express";
import userRouter from "./routes/user.route.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Ensure JSON parsing middleware is used

app.get("/", (req, res) => {
    res.send("Hello World");
});
//All routes are prefixed with /api/v1
app.use("/api/v1/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
