import { Sequelize } from 'sequelize';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } from '../config/env.js';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
});

console.log(`Initializing Sequelize with the following configuration:`);
console.log(`DB_NAME: ${DB_NAME}`);
console.log(`DB_USER: ${DB_USER}`);
console.log(`DB_PASSWORD: ${DB_PASSWORD}`);
console.log(`DB_HOST: ${DB_HOST}`);
console.log(`NODE_ENV: ${NODE_ENV}`);

const connectToDatabase = async () => {
    try {
        console.log(`Attempting to connect to MySQL database...`);
        await sequelize.authenticate();
        console.log(`Successfully connected to MySQL in ${NODE_ENV} mode`);
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
        process.exit(1);
    }
};

// Sync all models
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database & tables created!');
        // Log all model names
        console.log('Tables:', Object.keys(sequelize.models).join(', '));
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

connectToDatabase(); // Call the function to connect to the database

export default sequelize; // Export the sequelize instance 