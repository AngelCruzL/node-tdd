module.exports = (err, req, res, next) => {
  const { message, statusCode, errors } = err;
  let validationErrors;

  if (errors) {
    validationErrors = {};
    errors.forEach(error => (validationErrors[error.path] = req.t(error.msg)));
  }

  res.status(statusCode).send({
    path: req.originalUrl,
    timestamp: new Date().getTime(),
    message: req.t(message),
    validationErrors,
  });
};
