import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5-flash",
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

  const prompt = PromptTemplate.fromTemplate(`
You are a senior recruiter at {company}.

Compare resume and job description.

Resume:
{resume}

Job Description:
{jobDescription}

Return structured output:
- Match Score (0-100)
- Missing Skills
- Interview Questions
- 7 Day Study Plan
`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    company,
    resume,
    jobDescription,
  });

  res.json({ output: result });
});

app.listen(3001, () => {
  console.log("Backend running on port 3001");
});
