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

// Simple in-memory cache
const cache = {
    data: new Map(),
    timeout: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Create axios instance with default config
const cocApi = axios.create({
    baseURL: COC_API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${COC_API_TOKEN}`,
        'Accept': 'application/json'
    },
    timeout: 8000
});

// Utility function to chunk array into smaller arrays
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// Controller for fetching Clash of Clans leaderboard data
const leaderboardController = {
    /**
     * Get global legend league leaderboard
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getGlobalLegendLeaderboard: async (req, res) => {
        try {
            const cacheKey = 'global_leaderboard_200';

            // Check cache
            const cachedData = cache.data.get(cacheKey);
            if (cachedData && (Date.now() - cachedData.timestamp) < cache.timeout) {
                console.log('Returning cached data for global leaderboard');
                return res.json(cachedData.data);
            }

            console.log('Fetching fresh data for global leaderboard');

            // Fetch all 200 players at once
            const { data: { items: players } } = await cocApi.get('/locations/global/rankings/players', {
                params: { limit: 200 }
            });

            console.log(`Fetched ${players.length} players, processing in batches...`);

            // Increased batch size and reduced delays
            const BATCH_SIZE = 10;
            const CONCURRENT_BATCHES = 4;
            const DELAY_BETWEEN_BATCHES = 50; // 50ms between batches

            // Split players into batches
            const batches = chunkArray(players, BATCH_SIZE);
            const playerDetails = [];

            // Process multiple batches concurrently
            for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
                const currentBatches = batches.slice(i, i + CONCURRENT_BATCHES);
                console.log(`Processing batches ${i + 1} to ${Math.min(i + CONCURRENT_BATCHES, batches.length)}`);

                const batchResults = await Promise.all(
                    currentBatches.map(async (batch) => {
                        const results = await Promise.all(
                            batch.map(async (player) => {
                                try {
                                    const { data: playerInfo } = await cocApi.get(
                                        `/players/${encodeURIComponent(player.tag)}`
                                    );

                                    return {
                                        rank: player.rank,
                                        previousRank: player.previousRank,
                                        trophies: player.trophies,
                                        attackWins: player.attackWins,
                                        defenseWins: player.defenseWins,
                                        name: player.name,
                                        tag: player.tag,
                                        expLevel: playerInfo.expLevel,
                                        clan: playerInfo.clan ? {
                                            tag: playerInfo.clan.tag,
                                            name: playerInfo.clan.name,
                                            badgeUrls: playerInfo.clan.badgeUrls
                                        } : null,
                                        league: playerInfo.league ? {
                                            id: playerInfo.league.id,
                                            name: playerInfo.league.name,
                                            iconUrls: playerInfo.league.iconUrls
                                        } : null
                                    };
                                } catch (error) {
                                    console.error(`Error fetching player ${player.tag}:`, error.message);
                                    return player;
                                }
                            })
                        );
                        return results;
                    })
                );

                playerDetails.push(...batchResults.flat());

                // Small delay between concurrent batch groups
                if (i + CONCURRENT_BATCHES < batches.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
                }
            }

            const responseData = {
                success: true,
                data: playerDetails.sort((a, b) => a.rank - b.rank),
                total: playerDetails.length,
                timestamp: new Date().toISOString()
            };

            // Store in cache
            cache.data.set(cacheKey, {
                data: responseData,
                timestamp: Date.now()
            });

            return res.json(responseData);

        } catch (error) {
            console.error('Error:', error.message);
            return res.status(error.response?.status || 500).json({
                success: false,
                message: 'Failed to fetch leaderboard data',
                error: error.message
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
    },

    /**
     * Get detailed information about a specific player
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getPlayerInfo: async (req, res) => {
        try {
            const { playerTag } = req.params;

            // Ensure player tag is provided
            if (!playerTag) {
                return res.status(400).json({
                    success: false,
                    message: 'Player tag is required'
                });
            }

            // Format the player tag (add # if missing)
            const formattedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;

            // URL encode the tag for the API request
            const encodedTag = encodeURIComponent(formattedTag);

            console.log(`Fetching player info for tag: ${formattedTag}`);

            // Make the API request to get player details
            const response = await cocApi.get(`/players/${encodedTag}`);

            return res.status(200).json({
                success: true,
                data: response.data
            });
        } catch (error) {
            console.error('Error fetching player information:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            return res.status(error.response?.status || 500).json({
                success: false,
                message: 'Failed to fetch player information',
                error: error.response?.data?.message || error.message
            });
        }
    }
};

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.data.entries()) {
        if (now - value.timestamp > cache.timeout) {
            cache.data.delete(key);
        }
    }
}, 60000); // Clean up every minute

export default leaderboardController;
