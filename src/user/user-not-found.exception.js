module.exports = function UserNotFoundException() {
  this.message = 'user_not_found_message';
  this.statusCode = 404;
};
