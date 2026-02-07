const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    ticketNumber: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["bug", "feature", "task", "improvement"],
      default: "bug",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

ticketSchema.index({ project: 1, status: 1 });
ticketSchema.index({ assignee: 1 });
ticketSchema.index({ creator: 1 });
ticketSchema.index({ project: 1, ticketNumber: 1 }, { unique: true });

module.exports = mongoose.model("Ticket", ticketSchema);
