import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client using server-side key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Server-side AI chat endpoint with company data context
app.post("/api/ai/chat", async (req, res) => {
  const { messages, companyContext } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets."
      });
    }

    const systemInstruction = `You are LevFlow AI, a state-of-the-art secure corporate accountant and business Intelligence AI companion embedded directly inside LevFlow V3 Workstation.
Your goal is to assist the operator with ledger analysis, audit logs, invoice creation, and general financial guidance.
You have access to the current workstation status and invoice list context:
${companyContext ? JSON.stringify(companyContext, null, 2) : "No active invoices retrieved."}

Key directives:
1. Answer financial questions precisely. Focus on calculation analysis using the user's active invoices if provided.
2. If the user wants to draft an invoice (e.g. "Draft an invoice for...", "Create invoice for..."), construct a structured response. Specifically, you should provide a JSON segment in your reply using markdown containing the fields to initialize a new invoice. This makes it highly interactive.
3. Keep answers clear, professional, concise, with clean typography. Do NOT use fake coordinates or telemetry clutter.
`;

    const chatMessages = (messages || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatMessages,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const aiMessage = response.text || "I was unable to formulate a response. Please verify parameters.";
    return res.json({ response: aiMessage });

  } catch (error: any) {
    console.error("Gemini API Error in server.ts:", error);
    return res.status(500).json({
      error: error.message || "An internal error occurred during GenAI analysis."
    });
  }
});

// Structured Draft Generator Endpoint - Specifically extracts structured JSON metadata
app.post("/api/ai/draft", async (req, res) => {
  const { prompt } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform secure tokenization on this requested invoice detail prompt: "${prompt}". Translate this into structured invoice metadata fields.`,
      config: {
        systemInstruction: `You are a financial tokenizer. Translate unstructured billing requests into a pristine structured JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["customerName", "items"],
          properties: {
            customerName: {
              type: Type.STRING,
              description: "Extracted corporate customer name"
            },
            email: {
              type: Type.STRING,
              description: "Customer email if specified or default empty string"
            },
            phone: {
              type: Type.STRING,
              description: "Customer phone number if specified or default empty string"
            },
            address: {
              type: Type.STRING,
              description: "Customer address outline if specified"
            },
            items: {
              type: Type.ARRAY,
              description: "Pristine breakdown of item listing",
              items: {
                type: Type.OBJECT,
                required: ["description", "quantity", "unitPrice"],
                properties: {
                  description: { type: Type.STRING, description: "Item description" },
                  quantity: { type: Type.NUMBER, description: "Item count / quantity" },
                  unitPrice: { type: Type.NUMBER, description: "Cost per single item unit" }
                }
              }
            },
            discountAmount: { type: Type.NUMBER, description: "Extracted fixed discount amount if relevant" },
            taxPercent: { type: Type.NUMBER, description: "Extracted WHT / tax percent" },
            vatPercent: { type: Type.NUMBER, description: "Extracted VAT percent" }
          }
        }
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Gemini AI drafting failed:", error);
    return res.status(500).json({
      error: error?.message || "Failed parsing invoice draft."
    });
  }
});

// Wrap boot logic in async function to prevent top-level await in CJS output
async function bootstrap() {
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
    console.log(`LevFlow Hybrid Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed bootstrapping secure LevFlow service:", err);
});
