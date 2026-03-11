import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
}, { timestamps: true });

CategorySchema.index({ name: 1 });

export default mongoose.model("Category", CategorySchema);
