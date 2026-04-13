import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth-context';

const API_BASE = 'http://localhost:5000/api';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateTaskInput {
  prompt: string;
}

export interface TaskSuggestion {
  title: string;
  category: 'personal' | 'work' | 'health' | 'home';
  description: string;
  estimatedTime: number; // minutes
}

export interface MealSuggestion {
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  ingredients: string[];
  calories: number;
  prepTime: number; // minutes
}

export interface BudgetTip {
  tip: string;
  category: string;
  savingsEstimate: number;
}

// Mutations
export function useGenerateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: GenerateTaskInput) => {
      const response = await fetch(`${API_BASE}/ai/generate-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, userId: user?.id }),
      });
      if (!response.ok) throw new Error('Failed to generate task');
      return response.json() as Promise<TaskSuggestion[]>;
    },
    onSuccess: () => {
      // Invalidate tasks query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useSuggestMeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch(`${API_BASE}/ai/suggest-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: user?.id }),
      });
      if (!response.ok) throw new Error('Failed to suggest meal');
      return response.json() as Promise<MealSuggestion[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
}

export function useBudgetTip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch(`${API_BASE}/ai/budget-tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Failed to get budget tip');
      return response.json() as Promise<BudgetTip>;
    },
  });
}

export function useAIChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messages, openAIKey }: { messages: AIMessage[]; openAIKey: string }) => {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, openAIKey }),
      });
      if (!response.ok) throw new Error('AI chat failed');
      return response.json() as Promise<{ reply: string }>;
    },
  });
}

