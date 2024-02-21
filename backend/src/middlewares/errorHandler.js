const fs = require("fs");
const path = require("path");
const { createLogger, transports } = require("winston");
const { CustomError, NotFoundError } = require("../utils/customErrors");

const logsDirectory = path.join(__dirname, "..", "logs");

const logger = createLogger({
  transports: [
    new transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
    }),
  ],
});

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

const errorHandler = (err, req, res, next) => {
  logger.error(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${
      err.stack
    }`
  );

  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorMessage = err.message;
  }

  res.status(statusCode).json({ error: errorMessage });
};

module.exports = errorHandler;
