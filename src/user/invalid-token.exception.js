module.exports = function InvalidTokenException() {
  this.message = 'account_activation_invalid_token';
  this.statusCode = 400;
};
