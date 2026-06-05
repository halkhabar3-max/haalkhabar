import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import News from "./models/News.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* ================= BAD WORD FILTER ================= */
const badWords = ["fuck", "shit", "bitch", "ass", "damn", "porn", "sex", "muji", "mugi", "मुजी"];

function containsBadWords(text = "") {
  return badWords.some(word =>
    text.toLowerCase().includes(word)
  );
}

/* ================= MONGODB ================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected 🚀");

    app.listen(3000, () => {
      console.log("Server running");
    });
  })
  .catch(err => {
    console.log("MongoDB error ❌", err);
  });

/* ================= IMAGE UPLOAD ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ================= ROUTES ================= */

// GET NEWS
app.get("/api/news", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// // ADMIN PAGE
// app.get("/admin/02afkbasdkjas558dskkasfhhsagsaiugiufkbfuugabas", (req, res) => {
//   res.sendFile(path.resolve("public/admin.html"));
// });

// POST NEWS
app.post("/api/news", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;

    if (containsBadWords(title)) {
      return res.status(400).json({
        success: false,
        message: "Bad words are not allowed ❌"
      });
    }

    const newNews = new News({
      title,
      image: req.file.filename
    });

    await newNews.save();

    res.json({
      success: true,
      message: "News uploaded successfully 🚀"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
});

// DELETE NEWS
app.delete("/api/news/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= AUTO DELETE ================= */
const DELETE_AFTER_MS = 12 * 60 *60* 1000; // FIXED

async function deleteOldNews() {
  try {
    const expireTime = new Date(Date.now() - DELETE_AFTER_MS);

    await News.deleteMany({
      createdAt: { $lt: expireTime }
    });

    console.log("🧹 Old news deleted");
  } catch (err) {
    console.log("Cleanup error:", err);
  }
}

setInterval(deleteOldNews, 30 * 1000);

/* ================= SERVER ================= */
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});