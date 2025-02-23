class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message || "Internal Server Error";

    console.error(err.stack); // Log the error stack for debugging

    // Sequelize unique constraint error
    if (err.name === "SequelizeUniqueConstraintError") {
        const message = "Duplicate field value entered";
        error = new ErrorResponse(message, 400);
    }

    // Sequelize validation error
    if (err.name === "SequelizeValidationError") {
        const message = err.errors.map((e) => e.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    // Sequelize foreign key constraint error
    if (err.name === "SequelizeForeignKeyConstraintError") {
        const message = "Invalid foreign key reference";
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};

export default errorHandler; 