const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({

  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  author: {
    type: String,
  },
  genre: {
    type: String,
  },
  status: {
    type: String,
    enum: ["reading", "completed", "plan-to-read"], // <-- these are the valid options
    default: "plan-to-read",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Book", bookSchema);
