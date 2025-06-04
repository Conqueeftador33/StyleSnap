
"use client";
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/types';
import { stylistChatFlow, type StylistChatInput } from '@/ai/flows/stylist-chat-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageBubble } from './chat-message-bubble';
import { Send, Loader2, Wand2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe } from '@/hooks/use-wardrobe';
import type { FlowClothingItem } from '@/ai/flows/shared-types';

const initialAiMessage: ChatMessage = {
  id: 'initial-ai-message',
  sender: 'ai',
  text: "Hello! I'm your AI Fashion Stylist. Ask me anything about fashion, outfit ideas, or what new pieces might suit your style!",
  timestamp: new Date(),
};

export function ChatInterface() {
  const { items: wardrobeItems, isLoading: wardrobeLoading } = useWardrobe();
  const [messages, setMessages] = useState<ChatMessage[]>([initialAiMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mapWardrobeToFlowItems = (): FlowClothingItem[] => {
    return wardrobeItems.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color,
      category: item.category,
      description: item.notes || undefined, 
    }));
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatInput: StylistChatInput = {
        userInput: userMessage.text,
        chatHistory: messages.slice(-10), // Send last 10 messages for context
        wardrobeItems: mapWardrobeToFlowItems(), // Pass current wardrobe
      };
      
      const aiResponseText = await stylistChatFlow(chatInput);

      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: `Could not get a response: ${errorMessage}`,
      });
      const errorAiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai-error',
        sender: 'ai',
        text: "Sorry, I encountered a problem trying to respond. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center font-headline text-primary">
          <MessageSquare className="mr-2 h-6 w-6" /> AI Stylist Chat
        </CardTitle>
        <CardDescription>Your personal fashion assistant. Ask for advice or new ideas!</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length-1]?.sender === 'user' && (
            <div className="flex items-center gap-2 justify-start">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">AI Stylist is typing...</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Ask your AI stylist anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || wardrobeLoading}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || wardrobeLoading || inputValue.trim() === ''} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
