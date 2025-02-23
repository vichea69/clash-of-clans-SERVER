//change it to ORM mysql sequelize
import { DataTypes } from "sequelize";
import sequelize from '../database/mysql.js'; // Import the sequelize instance

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (user) => {
            user.name = user.name.trim();
            user.email = user.email.trim().toLowerCase();
        },
        beforeUpdate: (user) => {
            user.name = user.name.trim();
            user.email = user.email.trim().toLowerCase();
        }
    }
});

export default User; 