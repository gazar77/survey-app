const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // زيادة الحد الأقصى للبيانات الكبيرة

// ✅ الاتصال بقاعدة البيانات
// لو عندك MongoDB محلي: mongodb://127.0.0.1:27017/surveyDB
// لو عندك MongoDB Atlas: حط ال Connection String هنا
mongoose.connect("mongodb://127.0.0.1:27017/surveyDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ DB connection error:", err));

// ✅ تعريف Schema
const surveySchema = new mongoose.Schema({
  username: String,
  userid: String,
  answers: Object,  // هنا نخزن كل أسئلة الفورم كمفتاح وقيمة
  createdAt: { type: Date, default: Date.now }
});

// ✅ Model
const Survey = mongoose.model("Survey", surveySchema);

// ✅ API Endpoint لاستقبال البيانات من الفورم
app.post("/api/survey", async (req, res) => {
  try {
    console.log("📩 Data received:", req.body); // لمراجعة الداتا في الكونسول
    const { username, userid, ...answers } = req.body;

    const newSurvey = new Survey({
      username,
      userid,
      answers
    });

    await newSurvey.save();

    res.status(201).json({ success: true, message: "Survey saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving survey:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ API Endpoint لعرض كل الردود (اختياري لمراجعة البيانات)
app.get("/api/surveys", async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
