import { Router } from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import authorize from '../middleware/auth.middleware.js';

const userRouter = Router();
//test route
userRouter.get("/test", (req, res) => {
    res.send("Hello World");
});
// Route to get all users
userRouter.get("/", getAllUsers);

// Route to get a user by ID
userRouter.get("/:id", authorize, getUserById);

// Route to create a new user
userRouter.post("/", createUser);

// Route to update a user by ID
userRouter.put("/:id", updateUser);

// Route to delete a user by ID
userRouter.delete("/:id", deleteUser);

export default userRouter;