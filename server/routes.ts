import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact Form Submission
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // In a real app, you would send an email or save to DB
    console.log(`[Contact Form] From: ${name} <${email}>. Message: ${message}`);
    
    res.status(200).json({ success: true, message: "Thank you for reaching out!" });
  });

  // Newsletter Subscription
  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // In a real app, you would add to a mailing list service like Mailchimp
    console.log(`[Newsletter] New subscriber: ${email}`);

    res.status(200).json({ success: true, message: "Successfully joined the newsletter!" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
