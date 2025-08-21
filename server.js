const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const SECRET_KEY = process.env.SECRET_KEY;

// Regex pattern: allow only messages containing microworkers dotask/info link
const allowedPattern = /https?:\/\/ttv\.microworkers\.com\/dotask\/info\//;

app.post("/send-message", async (req, res) => {
  const { text, secretKey } = req.body;

  if (!secretKey || secretKey !== SECRET_KEY) {
    return res.status(403).json({ error: "Unauthorized request" });
  }

  // Check if message contains microworkers dotask/info link
  if (!allowedPattern.test(text)) {
    return res.status(403).json({ error: "Message not allowed" });
  }

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
    });
    res.json({ success: true, message: "Message sent (Microworkers link detected)" });
  } catch (error) {
    console.error("Telegram error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Microworkers Bot Server (Link Filter) is running...");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
