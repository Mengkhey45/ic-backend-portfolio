import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  label: { type: String }, // Private note for IC
  media: [{
    type: { type: String, enum: ['image', 'video', 'pdf', 'link'], required: true },
    url: { type: String, required: true },
    title: { type: String }
  }],
  links: { type: [String], default: [] },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
