import Base from '../models/base.model.js';
import User from '../models/user.model.js';

// Create a new base
export const createBase = async (req, res) => {
    try {
        const { name, link } = req.body;
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
        const newBase = await Base.create({ name, link, imageUrl, userId: req.user.id });
        res.status(201).json({ success: true, data: newBase });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating base', error });
    }
};

// Get all bases
export const getBases = async (req, res) => {
    try {
        const bases = await Base.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['name'],
            },
        });
        res.status(200).json({ success: true, data: bases, message: 'Bases fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bases', error: error.message });
    }
};

// Get a single base by ID
export const getBaseById = async (req, res) => {
    try {
        const base = await Base.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Base not found' });
        }
        res.status(200).json({ success: true, data: base });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching base', error });
    }
};

// Update a base
export const updateBase = async (req, res) => {
    try {
        const { name, link } = req.body;
        const base = await Base.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Base not found' });
        }
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : base.imageUrl;
        await base.update({ name, link, imageUrl });
        res.status(200).json({ success: true, data: base });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating base', error });
    }
};

// Delete a base
export const deleteBase = async (req, res) => {
    try {
        const base = await Base.findByPk(req.params.id);
        if (!base) {
            return res.status(404).json({ success: false, message: 'Base not found' });
        }
        await base.destroy();
        res.status(200).json({ success: true, message: 'Base deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting base', error });
    }
}; 