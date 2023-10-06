module.exports = function ValidationException(errors) {
  this.statusCode = 400;
  this.errors = errors;
  this.message = 'validation_failure_message';
};
