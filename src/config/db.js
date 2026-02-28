import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Adjust based on Render's database tier
      serverSelectionTimeoutMS: 5000, // Wait 5 seconds before failing
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4 to avoid slow DNS lookups in some environments
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
    
    // Setup event listeners for connection issues
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err} ❌`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Reconnecting... ⚠️");
      isConnected = false;
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message} ❌`);
    // On Render, we don't necessarily want to exit(1) immediately if it's a transient error
    // because Render will try to restart the service.
  }
};

export default connectDB;
