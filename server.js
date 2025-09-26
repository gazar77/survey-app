require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// middlewares
app.use(cors());
app.use(express.json());   // ← ده اللي ناقص
app.use(express.urlencoded({ extended: true })); // ← احتياطي لو هيجيلك form-data

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ DB connection error:", err));

const surveySchema = new mongoose.Schema({
  username: { type: String, default: "" },
  userid: { type: String, default: "" },
  answers: Object,
  createdAt: { type: Date, default: Date.now }
});

const Survey = mongoose.model("Survey", surveySchema);

app.post("/api/survey", async (req, res) => {
  try {
    console.log("📥 Data received:", req.body);  // Debug log

    const { username = "", userid = "", ...answers } = req.body;
    const newSurvey = new Survey({ username, userid, answers });
    await newSurvey.save();
    res.status(201).json({ success: true, id: newSurvey._id, message: "Survey saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving survey:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/surveys", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const surveys = await Survey.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Survey.countDocuments();

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalSurveys: total,
      surveys
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
