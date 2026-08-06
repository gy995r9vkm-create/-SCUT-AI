import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import { JsonRpcProvider } from "ethers";
import dotenv from "dotenv";

dotenv.config();

function disabledAdminRoute(_req: express.Request, res: express.Response) {
  return res.status(503).json({
    error: "Administrative actions are temporarily disabled while the secure backend is being rebuilt."
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/support", async (req, res) => {
    try {
      const { name, email, category, message, ticketId } = req.body;

      if (!name || !email || !category || !message) {
        return res.status(400).json({ error: "All support ticket fields are required" });
      }

      const adminEmail = "echipa@romaniacurajoasa.info";
      console.log(`[SUPPORT SYSTEM] New Ticket Submitted: #${ticketId || 'N/A'}`);
      console.log(`[SUPPORT SYSTEM] Category: ${category}`);
      console.log(`[SUPPORT SYSTEM] User Name: ${name}`);
      console.log(`[SUPPORT SYSTEM] User Email: ${email}`);
      console.log(`[SUPPORT SYSTEM] Message: ${message}`);
      console.log(`To: ${adminEmail}`);

      res.json({
        success: true,
        message: "Support ticket registered successfully",
        ticketId: ticketId || "server_" + Math.random().toString(36).substring(7)
      });
    } catch (err: any) {
      console.error("Error in /api/support:", err);
      res.status(500).json({ error: err.message || "An error occurred while registering the support ticket." });
    }
  });

  app.post("/api/auth/notify-registration", disabledAdminRoute);
  app.post("/api/auth/notify-admin-registration", disabledAdminRoute);
  app.post("/api/auth/approve-user", disabledAdminRoute);
  app.post("/api/auth/reject-user", disabledAdminRoute);

  app.post("/api/auth/send-verification-email", async (req, res) => {
    try {
      const { name, email, verificationUrl } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const origin = `${protocol}://${host}`;
      const token = `vtoken_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const link = verificationUrl || `${origin}?mode=verifyEmail&email=${encodeURIComponent(email)}&token=${token}`;

      console.log(`[EMAIL DISPATCH] Verification Email Dispatched to ${email}`);

      res.json({
        success: true,
        message: "Verification email dispatch recorded successfully.",
        dispatchedTo: email,
        verificationUrl: link,
        token
      });
    } catch (err: any) {
      console.error("Error in /api/auth/send-verification-email:", err);
      res.status(500).json({ error: err.message || "Failed to dispatch verification email" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, searchGrounding } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = messages
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n\n");

      const config: any = {};
      if (searchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: prompt,
        config
      });

      const text = response.text || "";
      return res.json({ text });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      return res.status(500).json({ error: err.message || "Chat generation failed" });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true } });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
