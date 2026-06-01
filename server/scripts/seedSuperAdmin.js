/**
 * Run: node scripts/seedSuperAdmin.js
 * Resets super-admin password to SUPER_ADMIN_PASSWORD from env / defaults.
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ensureSuperAdmin = require('./ensureSuperAdmin');
const { SUPER_ADMIN_EMAIL } = require('../config/superAdmin');

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  await ensureSuperAdmin({ syncPassword: true });
  console.log(`Super admin ready. Login with: ${SUPER_ADMIN_EMAIL}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
