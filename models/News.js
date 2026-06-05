import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("News", newsSchema);