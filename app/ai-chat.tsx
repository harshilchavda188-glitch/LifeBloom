import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGenerateTask, useSuggestMeal, useBudgetTip, useAIChat, AIMessage } from '@/lib/ai';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

interface Preset {
  title: string;
  prompt: string;
  type: 'task' | 'meal' | 'budget';
}

const presets: Preset[] = [
  { title: 'Generate tasks for today', prompt: 'Suggest 3 productive tasks for a busy day', type: 'task' },
  { title: 'Healthy meal ideas', prompt: 'Suggest quick healthy meal for lunch', type: 'meal' },
  { title: 'Budget saving tips', prompt: 'Give me a tip to save money this month', type: 'budget' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
const { openAIKey } = useAuth();
  const { mutate: sendChat, isPending: chatLoading } = useAIChat();
  const { mutate: generateTask, isPending: taskLoading } = useGenerateTask();
  const { mutate: suggestMeal, isPending: mealLoading } = useSuggestMeal();
  const { mutate: budgetTip, isPending: tipLoading } = useBudgetTip();

  const loading = chatLoading || taskLoading || mealLoading || tipLoading;

  const sendMessage = () => {
    if (!input.trim() || loading) return;
    const userMsg: AIMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    sendChat(
      { messages: [...messages, userMsg], openAIKey: openAIKey || 'placeholder-key' },
      {
        onSuccess: (data) => setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]),
        onError: () => setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]),
      }
    );
    setInput('');
  };

  const handlePreset = (preset: Preset) => {
    setInput(preset.prompt);
    // Auto-send for demo
    setTimeout(() => sendMessage(), 300);
  };

  const renderMessage = ({ item }: { item: AIMessage }) => (
    <View style={[styles.message, item.role === 'assistant' && styles.assistantMsg]}>
      <Text style={[styles.messageText, item.role === 'assistant' && styles.assistantText]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        style={styles.messages}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {messages.length === 0 && (
        <View style={styles.presetsContainer}>
          <Text style={styles.presetsTitle}>Ask LifeBloom AI</Text>
          {presets.map((preset) => (
            <Pressable key={preset.title} style={styles.preset} onPress={() => handlePreset(preset)}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
              <Text style={styles.presetText}>{preset.title}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask AI for tasks, meals, or tips..."
          placeholderTextColor={Colors.textMuted}
          multiline
          onSubmitEditing={sendMessage}
        />
        <Pressable style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
          <Ionicons name={loading ? "hourglass" : "send"} size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  messagesContainer: {
    paddingBottom: 80,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '22',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
    lineHeight: 20,
  },
  assistantText: {
    color: Colors.primary,
    fontFamily: 'Nunito_600SemiBold',
  },
  presetsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    minWidth: 280,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  presetText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

