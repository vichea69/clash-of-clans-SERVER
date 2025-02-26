import { DataTypes } from 'sequelize';
import sequelize from '../database/mysql.js';

const PublicBase = sequelize.define('PublicBase', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clerkUserId: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
});

export default PublicBase; 