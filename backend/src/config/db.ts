import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Node version:', process.version);

    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️ Continuing without MongoDB connection. The API will start in degraded mode.');
  }
};

export default connectDB;