/**
 * Wipes application data and creates only the super-admin user.
 * Run: npm run reset:db  (from server/)
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const Attempt = require('../models/Attempt');
const Violation = require('../models/Violation');
const {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_NAME,
} = require('../config/superAdmin');

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB. Clearing all collections...');

  await Promise.all([
    Violation.deleteMany({}),
    Submission.deleteMany({}),
    Attempt.deleteMany({}),
    Test.deleteMany({}),
    Question.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    isAdmin: true,
  });

  console.log('Database reset complete.');
  console.log(`Super admin: ${admin.email} (${admin.name})`);
  console.log('Password: (value from SUPER_ADMIN_PASSWORD in .env or default Admin@123)');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
