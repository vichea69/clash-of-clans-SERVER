import axios from 'axios';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get environment variables
const {
    COC_API_BASE_URL,
    COC_API_TOKEN,
    COC_DEFAULT_LIMIT
} = process.env;

// Validate required environment variables
if (!COC_API_BASE_URL || !COC_API_TOKEN) {
    throw new Error('Missing required COC API environment variables');
}

// Create axios instance with default config
const cocApi = axios.create({
    baseURL: COC_API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${COC_API_TOKEN}`,
        'Accept': 'application/json'
    }
});

// Controller for fetching Clash of Clans leaderboard data
const leaderboardController = {
    /**
     * Get global legend league leaderboard
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getGlobalLegendLeaderboard: async (req, res) => {
        try {
            console.log('Attempting to fetch leaderboard data');

            const response = await cocApi.get('/locations/global/rankings/players', {
                params: {
                    limit: COC_DEFAULT_LIMIT || 200
                }
            });

            console.log('Response received:', response.status);

            return res.status(200).json({
                success: true,
                data: response.data.items,
                paging: response.data.paging || {}
            });
        } catch (error) {
            console.error('Full error:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            return res.status(error.response?.status || 500).json({
                success: false,
                message: 'Failed to fetch leaderboard data',
                error: error.response?.data?.message || error.message
            });
        }
    },

    /**
     * Get player rankings with pagination support
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getPaginatedLeaderboard: async (req, res) => {
        try {
            const { limit = COC_DEFAULT_LIMIT || 20, before, after } = req.query;

            // Build the request parameters
            const params = { limit };
            if (before) params.before = before;
            if (after) params.after = after;

            // Make the API request
            const response = await cocApi.get('/locations/global/rankings/players', { params });

            return res.status(200).json({
                success: true,
                data: response.data.items,
                paging: response.data.paging || {}
            });
        } catch (error) {
            console.error('Error fetching paginated leaderboard:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            return res.status(error.response?.status || 500).json({
                success: false,
                message: 'Failed to fetch leaderboard data',
                error: error.response?.data?.message || error.message
            });
        }
    }
};

export default leaderboardController;
