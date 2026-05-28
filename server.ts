import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "20mb" }));

// Screening API Route
app.post("/api/screen", async (req, res) => {
  try {
    const { jobTitle, jobDescription, requiredSkills, candidates } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "At least one candidate resume is required" });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please add it to Settings -> Secrets inside your AI Studio Workspace." 
      });
    }

    // Call Gemini 3.5-flash to evaluate each candidate against the Job Description and requiredSkills
    const systemInstruction = 
      "You are an elite, objective technical recruiting AI specializing in screening candidates for Python, Data Science, AI/ML, and NLP roles. " +
      "Assess each provided resume against the given job description and explicit core skills list. " +
      "Conduct a highly precise evaluation. Count a skill as 'matched' only if it is explicitly stated " +
      "or clearly demonstrated via projects/experience in the resume. " +
      "Calculate an overall matchScore (integer from 0 to 100) based on skill coverage (50%), years of relevant experience/seniority alignment (30%), " +
      "and project complexity/education quality (20%). " +
      "Identify strengths, missing skills, and any gaps. Also, generate 3 highly targeted, challenging technical interview questions " +
      "designed to probe their specific gaps or verify their listed advanced skills. " +
      "Conforms absolutely to the requested JSON layout.";

    const contentPrompt = `
Job Title: ${jobTitle || "Not Specified"}
Job Description:
${jobDescription}

Target Core Skills List:
${JSON.stringify(requiredSkills || [])}

Candidates Resumes to evaluate:
${candidates.map((c: any, index: number) => `
==============================
CANDIDATE ENTRY #${index + 1}
ID: ${c.id}
Input Name: ${c.name}
Resume Text content follows:
${c.resumeText}
==============================
`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // low temperature for precise factual extraction
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["results"],
          properties: {
            results: {
              type: Type.ARRAY,
              description: "Array of screening results, one for each input candidate in the exact order",
              items: {
                type: Type.OBJECT,
                required: [
                  "candidateId",
                  "candidateName",
                  "email",
                  "phone",
                  "matchScore",
                  "experienceLevel",
                  "matchedSkills",
                  "missingSkills",
                  "strengths",
                  "gaps",
                  "interviewQuestions",
                  "summary",
                  "decision"
                ],
                properties: {
                  candidateId: {
                    type: Type.STRING,
                    description: "The exact matching candidateId as came in input."
                  },
                  candidateName: {
                    type: Type.STRING,
                    description: "The parsed correct full name of the candidate found in their resume."
                  },
                  email: {
                    type: Type.STRING,
                    description: "Extracted email address, or empty string."
                  },
                  phone: {
                    type: Type.STRING,
                    description: "Extracted phone/mobile contact, or empty string."
                  },
                  matchScore: {
                    type: Type.INTEGER,
                    description: "Evaluated matching rating between 0 and 100."
                  },
                  experienceLevel: {
                    type: Type.STRING,
                    description: "Overall seniority. Must be 'Junior', 'Intermediate', or 'Senior'."
                  },
                  matchedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of required core skills found/demonstrated in the resume."
                  },
                  missingSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of required skills that were clearly missing."
                  },
                  strengths: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 concise professional strengths of the candidate."
                  },
                  gaps: {
                     type: Type.ARRAY,
                     items: { type: Type.STRING },
                     description: "Key gaps, lacking domains, or suggestions for upskilling."
                  },
                  interviewQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 targeted technical screening questions specific to their background and the role limitations."
                  },
                  summary: {
                    type: Type.STRING,
                    description: "A 2-to-3 sentence professional summary focusing on role alignment."
                  },
                  decision: {
                    type: Type.STRING,
                    description: "Passed (matchScore >= 75), Review (50 <= matchScore < 75), or Rejected (matchScore < 50)"
                  }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text || "{}";
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Screening endpoint error:", error);
    return res.status(500).json({ error: error.message || "An internal error occurred during evaluation." });
  }
});

// Serve frontend assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();

