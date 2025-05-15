const mongoose = require("mongoose");

const flowchartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  status: {
    type: String,
    enum: ['saved', 'scheduled', 'completed'],
    default: 'saved',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Flowchart", flowchartSchema);