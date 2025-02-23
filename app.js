import express from "express";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import errorHandler from './middleware/error.middleware.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Ensure JSON parsing middleware is used

app.get("/", (req, res) => {
    res.send("Hello World");
});
//All routes are prefixed with /api/v1
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);

// Add the error-handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
