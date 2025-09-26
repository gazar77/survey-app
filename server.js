require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/surveyDB";

app.use(cors());
app.use(express.json({ limit: "100mb" }));

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
        const surveys = await Survey.find();
        res.json(surveys);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
