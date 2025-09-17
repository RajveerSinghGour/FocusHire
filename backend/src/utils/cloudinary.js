const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;

// Helpful warning if credentials look missing or left as placeholders
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
if (!CLOUD_NAME || !API_KEY || !API_SECRET || API_KEY.startsWith('your_')) {
  console.warn('[cloudinary] Cloudinary credentials missing or appear to be placeholders.');
  console.warn('[cloudinary] Please set CLOUD_NAME, API_KEY, API_SECRET in backend/.env or environment variables.');
}
