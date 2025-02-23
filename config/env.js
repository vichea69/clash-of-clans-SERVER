import { config } from 'dotenv';
config();

console.log(`Loaded PORT: ${process.env.PORT}, NODE_ENV: ${process.env.NODE_ENV}`);

export const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    JWT_SECRET,
    JWT_EXPIRES_IN,
} = process.env;
