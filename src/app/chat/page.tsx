'use client';

import { useState, useRef, useEffect } from 'react';
import Container from '@/components/Container';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'I am an AI assistant that can answer questions about Vito Senič based on his CV, projects, and notes.' },
    { role: 'assistant', content: 'Hi! I\'m Vito\'s AI assistant. Ask me anything about his experience, projects, or interests!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-col min-h-[calc(100vh-8rem)] py-8">
        <h1 className="text-3xl font-bold mb-8">Chat with Vito&apos;s AI</h1>
        
        {/* Messages container */}
        <div className="flex-1 overflow-auto mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          {messages.filter(m => m.role !== 'system').map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${message.role === 'assistant' ? 'pl-2 border-l-4 border-blue-500' : 'pl-2 border-l-4 border-gray-300'}`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="pl-2 border-l-4 border-blue-500 mb-4">
              <div className="font-semibold mb-1">AI Assistant</div>
              <div className="animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Vito..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </Container>
  );
}