/**
 * Validates required environment variables before the server starts.
 */
const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy .env.example to server/.env and configure values.');
    process.exit(1);
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET.length < 32
  ) {
    console.error('JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
};

module.exports = { validateEnv };
