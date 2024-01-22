function errorBadRequest(message, statusCode = 400) {
   const error = new Error(message);
   error.statusCode = statusCode;
   return error;
}

module.exports = { errorBadRequest };
