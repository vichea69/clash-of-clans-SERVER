import { DataTypes } from 'sequelize';
import sequelize from '../database/mysql.js';
import User from './user.model.js'; // Import the User model

const Base = sequelize.define('Base', {
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Define the association
Base.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Base; 