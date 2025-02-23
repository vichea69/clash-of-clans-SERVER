import UserModel from '../models/user.model.js';

// Utility function for sending responses
const sendResponse = (res, status, success, message, data = null) => {
    res.status(status).json({ success, message, data });
};

// Create a new user
export const createUser = async (req, res) => {
    try {
        const user = await UserModel.create(req.body);
        sendResponse(res, 201, true, "User created successfully", user);
    } catch (error) {
        sendResponse(res, 400, false, error.message);
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll();
        sendResponse(res, 200, true, "Users fetched successfully", users);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

// Get a user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.params.id);
        if (user) {
            sendResponse(res, 200, true, "User fetched successfully", user);
        } else {
            sendResponse(res, 404, false, "User not found");
        }
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

// Update a user by ID
export const updateUser = async (req, res) => {
    try {
        const [updated] = await UserModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await UserModel.findByPk(req.params.id);
            sendResponse(res, 200, true, "User updated successfully", updatedUser);
        } else {
            sendResponse(res, 404, false, "User not found");
        }
    } catch (error) {
        sendResponse(res, 400, false, error.message);
    }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
    try {
        const deleted = await UserModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            sendResponse(res, 204, true, "User deleted successfully");
        } else {
            sendResponse(res, 404, false, "User not found");
        }
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};
