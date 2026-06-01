/** Primary super-admin account (env overrides for production). */
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'admin@aptitude.com')
  .toLowerCase()
  .trim();

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Admin';

const isSuperAdminEmail = (email) =>
  email && email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

module.exports = {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_NAME,
  isSuperAdminEmail,
};
