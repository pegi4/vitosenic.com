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
    { role: 'assistant', content: 'Hej, Vito here! 👋 What do you wanna know about me?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: 10, resetTime: Date.now() + 5 * 60 * 1000 });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions for users to click
  const suggestedQuestions = [
    "Tell me about your projects",
    "What's your background in CS?",
    "What are you currently working on?"
  ];

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

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading || rateLimitInfo.remaining === 0) return;
    
    // Hide suggestions after clicking
    setShowSuggestions(false);
    
    // Update rate limit immediately when user sends message
    setRateLimitInfo(prev => ({
      ...prev,
      remaining: prev.remaining - 1
    }));

    // Add user message
    const userMessage = { role: 'user' as const, content: question };
    setMessages(prev => [...prev, userMessage]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || rateLimitInfo.remaining === 0) return;
    
    // Hide suggestions after user types
    setShowSuggestions(false);

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
      <div className="flex flex-col py-8 md:py-14 h-screen">
        {/* Messages container */}
        <div className="h-screen md:h-[900px] border border-gray-200 rounded-lg bg-gray-50 flex flex-col">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.filter(m => m.role !== 'system').map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.role === 'assistant' ? 'pl-2 border-l-4 border-rose-500' : 'pl-2 border-l-4 border-gray-300'}`}
              >
                <div className="font-semibold mb-1">
                  {message.role === 'assistant' ? 'Vito' : 'You'}
                </div>
                <div className="whitespace-pre-wrap">{renderMessageWithLinks(message.content)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="pl-2 border-l-4 border-rose-500 mb-4">
                <div className="font-semibold mb-1">Vito</div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 bg-clip-text text-transparent font-semibold animate-pulse">
                    Thinking...
                  </div>
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-lg blur-sm"
                    style={{
                      animation: 'slideShadow 2s ease-in-out infinite'
                    }}
                  ></div>
                </div>
                <style jsx>{`
                  @keyframes slideShadow {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                  }
                `}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
            
            {/* Suggested questions */}
            {showSuggestions && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Try asking me:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading || rateLimitInfo.remaining === 0}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Input form - always at bottom */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={rateLimitInfo.remaining > 0 ? "Ask me about my projects, studies, or ideas…" : "Rate limit exceeded"}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
                disabled={isLoading || rateLimitInfo.remaining === 0}
              />
              <button
                type="submit"
                disabled={isLoading || rateLimitInfo.remaining === 0}
                className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.91158 12H7.45579H4L2.02268 4.13539C2.0111 4.0893 2.00193 4.04246 2.00046 3.99497C1.97811 3.27397 2.77209 2.77366 3.46029 3.10388L22 12L3.46029 20.8961C2.77983 21.2226 1.99597 20.7372 2.00002 20.0293C2.00038 19.9658 2.01455 19.9032 2.03296 19.8425L3.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
            
            {/* Rate limit indicator below input */}
            <div className="text-center text-xs text-gray-500 mt-2">
              {rateLimitInfo.remaining}/10 questions • resets in {formatTimeRemaining(rateLimitInfo.resetTime)}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}