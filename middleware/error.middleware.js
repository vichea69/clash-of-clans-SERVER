const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

export default errorHandler; 