import express from "express";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import baseRouter from "./routes/base.route.js";
import errorHandler from './middleware/error.middleware.js';
import cors from 'cors';
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { clerkClient, requireAuth, getAuth } from '@clerk/express';
import publicBaseRouter from './routes/publicBase.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));
app.use(clerkMiddleware())
app.get("/clerk-users", async (req, res) => {
    try {
        const users = await clerkClient.users.getUserList();
        res.json(users);
    } catch (error) {
        console.error("Clerk API error:", error);
        res.status(500).json({ error: "Failed to fetch users from Clerk" });
    }
});
app.get("/", (req, res) => {
    res.send(
        < div >
            <h1>Hello World</h1>
            <p>This is a test</p>
            <p>The current time is {new Date().toLocaleTimeString()}</p>
            <p>API is running on port {PORT}</p>
        </div >
    );
});

//All routes are prefixed with /api/v1
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bases", baseRouter);
app.use('/api/v1/public-bases', publicBaseRouter);

// Add the error-handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
