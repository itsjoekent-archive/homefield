const { SUPER_ADMIN_ROLE } = require('../utils/userRoles');

module.exports = async function supersuperAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== SUPER_ADMIN_ROLE) {
    res.status(401).json({ error: 'You do not have permissions to do this.' });
    return;
  }

  next();
}
