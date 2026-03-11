import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  label: { type: String }, // Private note for IC
  media: [{
    type: { type: String, enum: ['image', 'video', 'pdf', 'link'], required: true },
    url: { type: String, required: true },
    title: { type: String }
  }],
  links: { type: [String], default: [] },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

ProjectSchema.index({ category: 1 });
ProjectSchema.index({ isHidden: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ category: 1, isHidden: 1 });

export default mongoose.model("Project", ProjectSchema);
