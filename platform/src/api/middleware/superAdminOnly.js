const { SUPER_ADMIN_ROLE } = require('../utils/accountRoles');

module.exports = async function superAdminOnly(req, res, next) {
  if (!req.account || req.account.role !== SUPER_ADMIN_ROLE) {
    res.status(401).json({ error: 'You do not have permissions to do this.' });
    return;
  }

  next();
}
