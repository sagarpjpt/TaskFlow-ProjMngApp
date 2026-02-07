const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    key: {
      type: String,
      required: [true, "Project key is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,10}$/, "Key must be 2-10 uppercase letters"],
      maxlength: [10, "Key cannot exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ owner: 1, title: 1 });
projectSchema.index({ key: 1 });
module.exports = mongoose.model("Project", projectSchema);
