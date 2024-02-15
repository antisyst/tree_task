class CustomError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  class NotFoundError extends CustomError {
    constructor(message = 'Not Found') {
      super(message, 404);
    }
  }
  
  class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
      super(message, 400);
    }
  }
  
  module.exports = {
    CustomError,
    NotFoundError,
    BadRequestError,
  };
  