const { DEFAULT_USERS_PER_PAGE } = require('../config/constants');

function pagination(req, res, next) {
  const pageAsNumber = +req.query.page;
  let page = Number.isNaN(pageAsNumber) ? 0 : pageAsNumber;
  if (page < 0) page = 0;

  const sizeAsNumber = +req.query.size;
  let size = Number.isNaN(sizeAsNumber) ? DEFAULT_USERS_PER_PAGE : sizeAsNumber;
  if (size > DEFAULT_USERS_PER_PAGE || size < 1) size = DEFAULT_USERS_PER_PAGE;

  req.pagination = { size, page };
  next();
}

module.exports = { pagination };
