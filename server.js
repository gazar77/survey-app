require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;


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
        // قراءة باراميتر الصفحة وعدد العناصر لكل صفحة من الـ query
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page);       // تحويل للقيمة الرقمية
        limit = parseInt(limit);     // تحويل للقيمة الرقمية

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const skip = (page - 1) * limit;

        const surveys = await Survey.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // ترتيب حسب الأحدث أولاً

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
