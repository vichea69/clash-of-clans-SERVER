import PublicBase from '../models/publicBase.model.js';
import { clerkClient } from '@clerk/express';

// Create a new public base
export const createPublicBase = async (req, res) => {
    try {
        const { name, link } = req.body;
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
        const clerkUserId = req.auth.userId;

        const newPublicBase = await PublicBase.create({
            name,
            link,
            imageUrl,
            clerkUserId
        });

        res.status(201).json({ success: true, data: newPublicBase });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating public base', error });
    }
};

// Get all public bases with user information
export const getPublicBases = async (req, res) => {
    try {
        const bases = await PublicBase.findAll();

        // Create an array of user IDs to fetch
        const userIds = [...new Set(bases
            .filter(base => base.clerkUserId)
            .map(base => base.clerkUserId))];

        // Map to store user data
        let users = {};

        // Fetch each user individually instead of using getUserList
        if (userIds.length > 0) {
            for (const userId of userIds) {
                try {
                    const user = await clerkClient.users.getUser(userId);

                    if (user && user.id) {
                        users[user.id] = {
                            id: user.id,
                            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                            imageUrl: user.imageUrl,
                            email: user.emailAddresses && user.emailAddresses[0] ?
                                user.emailAddresses[0].emailAddress : null
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error);
                }
            }
        }

        // Add user data to bases
        const basesWithUsers = bases.map(base => {
            const baseObj = base.toJSON();
            baseObj.user = (base.clerkUserId && users[base.clerkUserId]) ?
                users[base.clerkUserId] : null;
            return baseObj;
        });

        res.status(200).json({
            success: true,
            data: basesWithUsers,
            message: 'Public bases fetched successfully'
        });
    } catch (error) {
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

        // Add user information if clerkUserId exists
        if (base.clerkUserId) {
            try {
                const response = await clerkClient.users.getUser(base.clerkUserId);

                // Handle different response structures
                let user = response;
                if (response.data) {
                    user = response.data;
                }

                if (user && user.id) {
                    baseObj.user = {
                        id: user.id,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        imageUrl: user.imageUrl,
                        email: user.emailAddresses && user.emailAddresses[0] ?
                            user.emailAddresses[0].emailAddress : null
                    };
                } else {
                    baseObj.user = null;
                }
            } catch (error) {
                console.error('ERROR FETCHING USER FROM CLERK:', error);
                baseObj.user = null;
            }
        }

        res.status(200).json({ success: true, data: baseObj });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching public base', error });
    }
};

// Update a public base
export const updatePublicBase = async (req, res) => {
    try {
        const { name, link } = req.body;
        const base = await PublicBase.findByPk(req.params.id);

        if (!base) {
            return res.status(404).json({ success: false, message: 'Public base not found' });
        }

        // Check if the user has permission to update this base
        if (base.clerkUserId && base.clerkUserId !== req.auth.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this base' });
        }

        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : base.imageUrl;
        await base.update({ name, link, imageUrl });

        res.status(200).json({ success: true, data: base });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating public base', error });
    }
};

// Delete a public base
export const deletePublicBase = async (req, res) => {
    try {
        const base = await PublicBase.findByPk(req.params.id);

        if (!base) {
            return res.status(404).json({ success: false, message: 'Public base not found' });
        }

        // Check if the user has permission to delete this base
        if (base.clerkUserId && base.clerkUserId !== req.auth.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this base' });
        }

        await base.destroy();
        res.status(200).json({ success: true, message: 'Public base deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting public base', error });
    }
};
