const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  // this is a little trick that lets me execute code AFTER the route handler has completed its execution
  await next();

  clearHash(req.user.id);
};
