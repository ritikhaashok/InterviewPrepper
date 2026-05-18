import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.7,
  },
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry when hit with 429 rate limits
async function generateWithRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      // Check if it's a 429 Too Many Requests error
      if (error.status === 429 && i < retries - 1) {
        // Attempt to read Google's suggested backoff time, fallback to 32 seconds
        const waitTime = error.errorDetails?.[2]?.retryDelay
          ? parseInt(error.errorDetails[2].retryDelay) * 1000
          : 32000;

        console.warn(
          `[Rate Limit Hit] Retrying attempt ${i + 1}/${retries} in ${waitTime / 1000}s...`,
        );
        await delay(waitTime);
        continue;
      }
      throw error; // Pass along any other errors (or if retries run out)
    }
  }
}

let lastRequestTime = 0;

app.post("/analyze", async (req, res) => {
  const now = Date.now();

  // Basic guard rail to prevent accidental spam clicking (12 seconds)
  if (now - lastRequestTime < 12000) {
    return res.status(429).json({
      error: "Rate limited locally",
      message: "Please wait a few seconds before sending another request.",
    });
  }

  lastRequestTime = now;
  const { resume, jobDescription, company } = req.body;

  const prompt = `
You are a senior recruiter.

Company: ${company}

Resume:
${resume}

Job Description:
${jobDescription}

Return ONLY valid JSON in this exact format:

{
  "score": number,
  "missingSkills": string[],
  "interviewQuestions": string[],
  "studyPlan": string[]
}

Rules:
- Do NOT include markdown
- Do NOT include explanations
- Do NOT include backticks
- Output ONLY JSON
`;

  try {
    // Calling our retry wrapper instead of hitting the model directly
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI JSON:", text);
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: text,
      });
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "AI request failed",
      message: err.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Backend running on port 3001");
});
