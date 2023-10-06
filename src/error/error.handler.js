module.exports = (err, req, res, next) => {
  const { message, statusCode, errors } = err;
  let validationErrors;

  if (errors) {
    validationErrors = {};
    errors.forEach(error => (validationErrors[error.path] = req.t(error.msg)));
  }

  res.status(statusCode).send({ message: req.t(message), validationErrors });
};
