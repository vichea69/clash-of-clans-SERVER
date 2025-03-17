import express from "express";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import baseRouter from "./routes/base.route.js";
import errorHandler from './middleware/error.middleware.js';
import cors from 'cors';
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { clerkClient } from '@clerk/express';
import publicBaseRouter from './routes/publicBase.route.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import leaderboardRoutes from './routes/leaderboard.routes.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['https://base.vichea.engineer', 'http://localhost:5173'], // Allow only production frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
    res.json({
        message: "Welcome to the API",
        version: "1.0.0",
        documentation: "/api/v1/docs",
        endpoints: {
            users: "/api/v1/users",
            auth: "/api/v1/auth",
            bases: "/api/v1/bases",
            leaderboard: "/api/v1/leaderboard"
        }
    });
});

//All routes are prefixed with /api/v1
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bases", baseRouter);
app.use('/api/v1/public-bases', publicBaseRouter);

// Add this line to see incoming requests in console
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Register the routes with /api prefix
app.use('/api/v1/leaderboard', leaderboardRoutes);

// Add the error-handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
});

export default app;