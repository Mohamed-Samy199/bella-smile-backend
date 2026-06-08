import mongoose from 'mongoose';
// import dns from 'dns';
import { MONGODB_URI } from '../config/env.config.js';

// dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};



// import mongoose from 'mongoose';
// import { MONGODB_URI } from '../config/env.config.js';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       maxPoolSize: 10,
//     });
//     console.log(`✅ MongoDB connected: ${conn.connection.host}...`);
//   } catch (error) {
//     console.error(`❌ MongoDB connection failed: ${error.message}`);
//     process.exit(1);
//   }
// };

// mongoose.connection.on('disconnected', () => {
//   console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
// });

// mongoose.connection.on('reconnected', () => {
//   console.log('✅ MongoDB reconnected');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('❌ MongoDB error:', err.message);
// });

// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('🔴 MongoDB connection closed (app termination)');
//   process.exit(0);
// });

// export { connectDB };