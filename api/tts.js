import { spawn } from "child_process";
import path from "path";
import { writeFileSync, readFileSync, unlinkSync } from "fs";

// Vercel serverless function
export default async function handler(req, res) {
  const { text = "Hello, this is free TTS!" } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // Temporary file
    const filename = path.join("/tmp", "speech.mp3");

    await new Promise((resolve, reject) => {
      const gtts = spawn("gtts-cli", [text, "--lang", "en", "--output", filename]);

      gtts.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("gTTS process failed"));
      });
    });

    // Read file & send response
    const audioBuffer = readFileSync(filename);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);

    // Clean temp
    unlinkSync(filename);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
