'use client';

import { useState, useRef, useEffect } from 'react';
import Container from '@/components/Container';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type RateLimitInfo = {
  remaining: number;
  resetTime: number;
};

// Helper function to format time remaining
const formatTimeRemaining = (resetTime: number): string => {
  const now = Date.now();
  const timeLeft = Math.max(0, resetTime - now);
  
  if (timeLeft === 0) return '0m';
  
  const minutes = Math.ceil(timeLeft / 1000 / 60);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Function to parse markdown links and render them as styled links
const renderMessageWithLinks = (content: string) => {
  // Regex to match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    // Add the styled link
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-semibold underline hover:text-blue-800 transition-colors"
      >
        {linkText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last link
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : content;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'I am an AI assistant that can answer questions about Vito Senič based on his CV, projects, and notes.' },
    { role: 'assistant', content: 'Hi! I\'m Vito\'s AI assistant. Ask me anything about his experience, projects, or interests!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: 10, resetTime: Date.now() + 5 * 60 * 1000 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current rate limit status on page load
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      try {
        const response = await fetch('/api/chat/rate-limit', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setRateLimitInfo({
            remaining: data.remaining,
            resetTime: data.resetTime
          });
        }
      } catch (error) {
        console.error('Failed to fetch rate limit status:', error);
      }
    };

    fetchRateLimitStatus();
  }, []);

  // Update countdown timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setRateLimitInfo(prev => {
        const now = Date.now();
        if (now >= prev.resetTime) {
          // Reset time has passed, fetch new status
          fetch('/api/chat/rate-limit', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
              setRateLimitInfo({
                remaining: data.remaining,
                resetTime: data.resetTime
              });
            })
            .catch(error => {
              console.error('Failed to refresh rate limit status:', error);
            });
        }
        return prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || rateLimitInfo.remaining === 0) return;

    // Update rate limit immediately when user sends message
    setRateLimitInfo(prev => ({
      ...prev,
      remaining: prev.remaining - 1
    }));

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

      // Update rate limit info from headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      if (remaining && resetTime) {
        setRateLimitInfo({
          remaining: parseInt(remaining),
          resetTime: parseInt(resetTime)
        });
      }

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rate limit exceeded');
        }
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
              <div className="whitespace-pre-wrap">{renderMessageWithLinks(message.content)}</div>
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
        
        {/* Rate limit indicator */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Questions remaining: <strong>{rateLimitInfo.remaining}</strong></span>
            <span>Resets in: <strong>{formatTimeRemaining(rateLimitInfo.resetTime)}</strong></span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(rateLimitInfo.remaining / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={rateLimitInfo.remaining > 0 ? "Ask me anything about Vito..." : "Rate limit exceeded"}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={isLoading || rateLimitInfo.remaining === 0}
          />
          <button
            type="submit"
            disabled={isLoading || rateLimitInfo.remaining === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {rateLimitInfo.remaining === 0 ? 'Rate Limited' : 'Send'}
          </button>
        </form>
      </div>
    </Container>
  );
}