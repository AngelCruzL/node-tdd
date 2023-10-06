module.exports = function ValidationException(errors) {
  this.statusCode = 400;
  this.errors = errors;
};
