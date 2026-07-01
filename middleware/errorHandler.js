const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";
  let code = err.code || "SERVER_ERROR";

  console.error(`[${new Date().toISOString()}] [ERROR] ${req.method} ${req.originalUrl}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack || err);
  } else {
    console.error(err.message);
  }

  if (err.name === "CastError") {
    message = `Invalid ID format: "${err.value}". Please check the resource ID.`;
    code = "INVALID_ID";
    statusCode = 400;
  }

  if (err.code === 11000) {
    const fieldName = Object.keys(err.keyValue || {})[0] || "field";
    const fieldValue = err.keyValue?.[fieldName] || "";
    message = `A record with this ${fieldName} ("${fieldValue}") already exists. Please use a different value.`;
    code = "DUPLICATE_ERROR";
    statusCode = 409;
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join("; ");
    code = "VALIDATION_ERROR";
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "Invalid session token. Please log in again.";
    code = "INVALID_TOKEN";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Your session has expired. Please log in again.";
    code = "TOKEN_EXPIRED";
    statusCode = 401;
  }

  if (err.message && err.message.startsWith("CORS:")) {
    message = "This origin is not allowed to access the API.";
    code = "CORS_ERROR";
    statusCode = 403;
  }

  if (statusCode === 500 && process.env.NODE_ENV !== "development") {
    message = "An internal server error occurred. Please try again.";
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export default errorHandler;
