module.exports = async function loadUser(req, res, next) {
  req.user = null;

  if (req.headers['Authorization']) {
    // ...
  }

  next();
}
