//change it to ORM mysql sequelize
import { DataTypes } from "sequelize";
import sequelize from '../database/mysql.js'; // Import the sequelize instance

const UserModel = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "UserName is required" },
            len: {
                args: [3, 30],
                msg: "UserName must be between 3 and 30 characters long"
            },
            notEmpty: { msg: "UserName cannot be empty" }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: "Email must be unique"
        },
        validate: {
            notNull: { msg: "Email is required" },
            isEmail: { msg: "Please enter a valid email address" },
            notEmpty: { msg: "Email cannot be empty" }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Password is required" },
            len: {
                args: [6],
                msg: "Password must be at least 6 characters long"
            },
            notEmpty: { msg: "Password cannot be empty" }
        }
    }
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

export default UserModel; 