const { createCanvas, loadImage } = require("canvas");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Helper Function ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const lines = text.split("\n");
  lines.forEach((line) => {
    const words = line.split(" ");
    let currentLine = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(currentLine, x, y);
        currentLine = words[n] + " ";
        y += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    context.fillText(currentLine, x, y);
    y += lineHeight;
  });
}

// --- Root Endpoint ---
app.get("/", (req, res) =>
  res.send("Diary API is running! Use /generate (no hw) or /generate-hw (with hw)")
);

// --- 1️⃣ NO HOMEWORK VERSION ---
app.get("/generate", async (req, res) => {
  try {
    const { class: cls, subject, cw, remarks: remark, teacher, date } = req.query;

    if (!cls || !subject || !cw) {
      return res.status(400).json({ error: "Missing required fields: class, subject, cw" });
    }

    // Date logic
    let dateText;
    if (date) {
      dateText = `Date: ${date}`;
    } else {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const dayName = d.toLocaleString("en-US", { weekday: "long" });
      dateText = `Date: ${day}.${month}.${year} (${dayName})`;
    }

    const bg = await loadImage("bg.jpg");
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0);

    ctx.font = "63px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    ctx.fillText(cls, 372, 772);
    ctx.fillText(subject, 422, 902);
    ctx.fillText(teacher || "Nabila Tabassum", 692, 1029);

    wrapText(ctx, cw, 179, 1227, 2000, 70);
    wrapText(ctx, remark || "N/A", 179, 1628, 2000, 70);

    ctx.textAlign = "center";
    ctx.fillText(dateText, bg.width - 838, 775);

    const imgBuffer = canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.send(imgBuffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// --- 2️⃣ WITH HOMEWORK VERSION ---
app.get("/generate-hw", async (req, res) => {
  try {
    const { class: cls, subject, cw, hw, remarks: remark, teacher, date } = req.query;

    if (!cls || !subject || !cw || !hw) {
      return res
        .status(400)
        .json({ error: "Missing required fields: class, subject, cw, hw" });
    }

    // Date logic
    let dateText;
    if (date) {
      dateText = `Date: ${date}`;
    } else {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const dayName = d.toLocaleString("en-US", { weekday: "long" });
      dateText = `Date: ${day}.${month}.${year} (${dayName})`;
    }

    // --- Load bg-v2 ---
    const bg = await loadImage("bg-v2.jpg");
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0);

    ctx.font = "63px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    ctx.fillText(cls, 375, 762);
    ctx.fillText(subject, 425, 892);
    ctx.fillText(teacher || "Nabila Tabassum", 695, 1018);

    wrapText(ctx, cw, 181, 1240, 2000, 70);
    wrapText(ctx, hw, 181, 1668, 2000, 70);
    wrapText(ctx, remark || "N/A", 181, 2100, 2000, 70);

    ctx.textAlign = "center";
    ctx.fillText(dateText, bg.width - 800, 763);

    const imgBuffer = canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.send(imgBuffer);
  } catch (error) {
    console.error("Error generating HW image:", error);
    if (error.message.includes("ENOENT")) {
      res.status(500).json({
        error: "Failed to load bg-v2.jpg. Make sure it's in the same folder.",
      });
    } else {
      res.status(500).json({ error: "Failed to generate HW image" });
    }
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API is listening on port ${PORT}!`));
