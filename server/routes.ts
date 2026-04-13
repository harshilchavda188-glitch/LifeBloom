import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { z } from 'zod';
// import { Runa } from '@runaai/sdk';

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing endpoints
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(`[Contact Form] From: ${name} <${email}>. Message: ${message}`);
    
    res.status(200).json({ success: true, message: "Thank you for reaching out!" });
  });

  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`[Newsletter] New subscriber: ${email}`);

    res.status(200).json({ success: true, message: "Successfully joined the newsletter!" });
  });

  // AI Endpoints (mock for now, Runa-ready)
  const TaskSuggestionSchema = z.array(z.object({
    title: z.string(),
    category: z.enum(['personal', 'work', 'health', 'home']),
    description: z.string(),
    estimatedTime: z.number(),
  }));

  const MealSuggestionSchema = z.array(z.object({
    meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    title: z.string(),
    ingredients: z.array(z.string()),
    calories: z.number(),
    prepTime: z.number(),
  }));

  const BudgetTipSchema = z.object({
    tip: z.string(),
    category: z.string(),
    savingsEstimate: z.number(),
  });

  // POST /api/ai/generate-task
  app.post('/api/ai/generate-task', (req, res) => {
    try {
      const { prompt, userId, openAIKey } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt required' });
      
      // Mock response (replace with real Runa when key provided)
      const mockTasks = [
        {
          title: 'Complete project report',
          category: 'work',
          description: 'Finish the quarterly report with charts',
          estimatedTime: 45,
        },
        {
          title: '30 min walk',
          category: 'health',
          description: 'Evening walk for fresh air',
          estimatedTime: 30,
        },
      ];

      // Real Runa (uncomment when openAIKey valid)
      /*
      const agent = new Runa({
        model: 'openai:gpt-4o-mini',
        openai: { apiKey: openAIKey },
      });
      const result = await agent.run(prompt, {
        schema: TaskSuggestionSchema,
        name: 'generate_tasks',
      });
      */

      res.json(TaskSuggestionSchema.parse(mockTasks));
    } catch (error) {
      res.status(500).json({ error: 'Task generation failed' });
    }
  });

  // POST /api/ai/suggest-meal
  app.post('/api/ai/suggest-meal', (req, res) => {
    try {
      const { prompt, userId, openAIKey } = req.body;
      
      const mockMeals = [
        {
          meal: 'lunch',
          title: 'Quinoa Salad',
          ingredients: ['quinoa', 'cucumber', 'tomato', 'feta', 'olive oil'],
          calories: 450,
          prepTime: 15,
        },
      ];

      res.json(MealSuggestionSchema.parse(mockMeals));
    } catch (error) {
      res.status(500).json({ error: 'Meal suggestion failed' });
    }
  });

  // POST /api/ai/budget-tip
  app.post('/api/ai/budget-tip', (req, res) => {
    try {
      const { prompt } = req.body;
      
      const mockTip = {
        tip: 'Cook at home 3x/week to save $50/month',
        category: 'food',
        savingsEstimate: 50,
      };

      res.json(BudgetTipSchema.parse(mockTip));
    } catch (error) {
      res.status(500).json({ error: 'Budget tip failed' });
    }
  });

  // POST /api/ai/chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, openAIKey } = req.body;
      if (!messages || !openAIKey) return res.status(400).json({ error: 'Messages and key required' });

      // Mock reply
      const mockReply = 'Great idea! Here are some suggestions based on your request. (Demo mode - add your OpenAI key for real AI)';

      // Real Runa chat
      /*
      const agent = new Runa({
        model: 'openai:gpt-4o-mini',
        openai: { apiKey: openAIKey },
      });
      const result = await agent.run(messages[messages.length - 1].content);
      */

      res.json({ reply: mockReply });
    } catch (error) {
      res.status(500).json({ error: 'Chat failed' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

