import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5-flash",
});

app.post("/analyze", async (req, res) => {
  const { resume, jobDescription, company } = req.body;

  const prompt = `
You are an expert technical recruiter.

Analyze this resume vs job description.

Company: ${company}

Resume:
${resume}

Job Description:
${jobDescription}

Return:
1. Match score (0-100)
2. Missing skills
3. Interview questions
4. 7-day prep plan
`;

  const result = await model.invoke(prompt);

  res.json({
    output: result.content,
  });
});

app.listen(3001, () => {
  console.log("Backend running on port 3001");
});
