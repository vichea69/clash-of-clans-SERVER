import PublicBase from '../models/publicBase.model.js';
import { clerkClient } from '@clerk/express';

// Create a new public base
export const createPublicBase = async (req, res) => {
    try {
        // Get user ID from Clerk auth middleware
        const clerkUserId = req.auth?.userId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const { name, link } = req.body;
        const imageUrl = req.file ? `uploads/${req.file.filename}` : null;


        const newPublicBase = await PublicBase.create({
            name,
            link,
            imageUrl,
            clerkUserId
        });

        // Fetch user data for the response
        const user = await clerkClient.users.getUser(clerkUserId);
        const baseWithUser = {
            ...newPublicBase.toJSON(),
            user: {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                imageUrl: user.imageUrl,
                email: user.emailAddresses?.[0]?.emailAddress || null
            }
        };

        res.status(201).json({ success: true, data: baseWithUser });
    } catch (error) {
        console.error('Error creating public base:', error);
        res.status(500).json({ success: false, message: 'Error creating public base', error: error.message });
    }
};

// Get all public bases with user information
export const getPublicBases = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 16;
        const offset = (page - 1) * limit;

        // Add sorting to the query
        const { count: total, rows: bases } = await PublicBase.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
        });

        const userIds = [...new Set(bases
            .filter(base => base.clerkUserId)
            .map(base => base.clerkUserId))];

        const users = {};
        if (userIds.length > 0) {
            await Promise.all(userIds.map(async userId => {
                try {
                    const user = await clerkClient.users.getUser(userId);
                    users[userId] = {
                        id: user.id,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        imageUrl: user.imageUrl,
                        email: user.emailAddresses?.[0]?.emailAddress || null
                    };
                } catch (error) {
                    if (error.status === 404) {
                        console.log(`User ${userId} no longer exists in Clerk`);
                    } else {
                        console.error(`Error fetching user ${userId}:`, error);
                    }
                    users[userId] = {
                        id: userId,
                        name: 'Deleted User',
                        imageUrl: null,
                        email: null
                    };
                }
            }));
        }

        const basesWithUsers = bases.map(base => ({
            ...base.toJSON(),
            user: users[base.clerkUserId] || {
                id: base.clerkUserId,
                name: 'Deleted User',
                imageUrl: null,
                email: null
            }
        }));

        res.status(200).json({
            success: true,
            data: basesWithUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            message: 'Public bases fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching public bases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public bases',
            error: error.message
        });
    }
};

// Get a single public base by ID
export const getPublicBaseById = async (req, res) => {
    try {
        const base = await PublicBase.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Public base not found' });
        }

        const baseObj = base.toJSON();

        if (base.clerkUserId) {
            try {
                const user = await clerkClient.users.getUser(base.clerkUserId);
                baseObj.user = {
                    id: user.id,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    imageUrl: user.imageUrl,
                    email: user.emailAddresses?.[0]?.emailAddress || null
                };
            } catch (error) {
                console.error('Error fetching user from Clerk:', error);
                baseObj.user = null;
            }
        }

        res.status(200).json({ success: true, data: baseObj });
    } catch (error) {
        console.error('Error fetching public base:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public base',
            error: error.message
        });
    }
};

// Update a public base
export const updatePublicBase = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const base = await PublicBase.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Public base not found' });
        }

        if (base.clerkUserId !== clerkUserId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this base' });
        }

        const { name, link } = req.body;
        let imageUrl = base.imageUrl; // Default to existing image

        // Handle new image upload
        if (req.file) {
            imageUrl = `uploads/${req.file.filename}`;
            // Optionally: Delete old image file here if needed
        }

        const updatedBase = await base.update({
            name,
            link,
            imageUrl: imageUrl || null
        });

        // Get the base URL for the API
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Fetch updated user data
        const user = await clerkClient.users.getUser(clerkUserId);
        const baseWithUser = {
            ...updatedBase.toJSON(),
            imageUrl: imageUrl ? `${baseUrl}/${imageUrl}` : null, // Return full URL
            user: {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                imageUrl: user.imageUrl,
                email: user.emailAddresses?.[0]?.emailAddress || null
            }
        };

        res.status(200).json({ success: true, data: baseWithUser });
    } catch (error) {
        console.error('Error updating public base:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating public base',
            error: error.message
        });
    }
};

// Delete a public base
export const deletePublicBase = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const base = await PublicBase.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Public base not found' });
        }

        if (base.clerkUserId !== clerkUserId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this base' });
        }

        await base.destroy();
        res.status(200).json({
            success: true,
            message: 'Public base deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting public base:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting public base',
            error: error.message
        });
    }
};
