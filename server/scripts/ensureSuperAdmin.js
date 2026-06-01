const User = require('../models/User');
const {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_NAME,
} = require('../config/superAdmin');

/**
 * Ensures the primary super-admin exists and has isAdmin.
 * @param {{ syncPassword?: boolean }} options - syncPassword resets password to env value
 */
async function ensureSuperAdmin(options = {}) {
  const { syncPassword = false } = options;
  let user = await User.findOne({ email: SUPER_ADMIN_EMAIL });

  if (!user) {
    user = await User.create({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      isAdmin: true,
    });
    console.log(`[admin] Super admin account created (${SUPER_ADMIN_EMAIL})`);
    return user;
  }

  let dirty = false;
  if (!user.isAdmin) {
    user.isAdmin = true;
    dirty = true;
  }
  if (user.name !== SUPER_ADMIN_NAME) {
    user.name = SUPER_ADMIN_NAME;
    dirty = true;
  }
  if (syncPassword) {
    user.password = SUPER_ADMIN_PASSWORD;
    dirty = true;
  }

  if (dirty) {
    await user.save();
    console.log(`[admin] Super admin account updated (${SUPER_ADMIN_EMAIL})`);
  }

  return user;
}

module.exports = ensureSuperAdmin;
