import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Node version:', process.version);

    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message || error);
    console.warn('⚠️ Continuing without MongoDB connection. The API will start in degraded mode.');
  }
};

export default connectDB;