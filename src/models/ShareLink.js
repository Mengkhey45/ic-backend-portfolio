import mongoose from "mongoose";

const ShareLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isPortfolioLink: { type: Boolean, default: true }, // true for full portfolio
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Optional for single project links
  privateNote: { type: String, default: "" }, // For IC internal note
  accessCode: { type: String, default: "" }, // Required code for client access
  allowedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // Categories allowed in this link
}, { timestamps: true });

export default mongoose.model("ShareLink", ShareLinkSchema);
