const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't exit process in development if it's just dummy data, but typically we would:
    // process.exit(1);
    console.warn("If you haven't set up the actual MONGO_URI, this error is expected.");
  }
};

module.exports = connectDB;
