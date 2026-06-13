import dotenv from 'dotenv';

dotenv.config({
  path: './src/config/.env'
});

// dotenv.config({
//   path: './src/config/.env.production'
// });

const required = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

export const NODE_ENV   = process.env.NODE_ENV || process.env.DEVELOPMENT;
export const PORT       = process.env.PORT || 4000;
export const CLIENT_URL = process.env.CLIENT_URL;

export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_SECRET            = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN        = process.env.JWT_EXPIRES_IN;

export const FIREBASE_PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_PRIVATE_KEY  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

export const AWS_ACCESS_KEY_ID     = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_BUCKET_NAME       = process.env.AWS_BUCKET_NAME;
export const AWS_REGION            = process.env.AWS_REGION || 'us-east-1';

export const BEACON_SCAN_INTERVAL      = process.env.BEACON_SCAN_INTERVAL || 1000;
export const BEACON_SIGNAL_THRESHOLD   = process.env.BEACON_SIGNAL_THRESHOLD || -80;
export const POSITION_UPDATE_INTERVAL  = process.env.POSITION_UPDATE_INTERVAL || 2000;

export const EMAIL_USER     = process.env.EMAIL_USER;
export const EMAIL_PASS     = process.env.EMAIL_PASS;
export const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER;

export const STRIPE_SECRET_KEY      = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET  = process.env.STRIPE_WEBHOOK_SECRET;
export const PRICE_PER_ALIGNER      = process.env.PRICE_PER_ALIGNER || 50;

export const PAYMENT_SUCCESS_PATH = process.env.SUCCESS_URL;
export const PAYMENT_CANCEL_PATH = process.env.CANCEL_URL;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY; 
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

