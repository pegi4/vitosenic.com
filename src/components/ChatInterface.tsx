'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Function to parse markdown links and bold text
const renderMessageWithFormatting = (content: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldTextRegex = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let linkCounter = 0;
  
  // First, handle links
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={`link-${linkCounter++}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-rose-400 font-medium underline hover:text-rose-300 transition-colors"
      >
        {linkText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  
  // Now process the result for bold text
  const processedParts = [];
  let boldCounter = 0;
  
  for (const part of parts) {
    if (typeof part === 'string') {
      // Process bold text in string parts
      let partLastIndex = 0;
      let boldMatch;
      
      while ((boldMatch = boldTextRegex.exec(part)) !== null) {
        // Add text before the bold
        if (boldMatch.index > partLastIndex) {
          processedParts.push(part.slice(partLastIndex, boldMatch.index));
        }
        
        // Add the bold text
        const boldText = boldMatch[1];
        processedParts.push(
          <strong key={`bold-${boldCounter++}`} className="font-semibold text-gray-100">
            {boldText}
          </strong>
        );
        
        partLastIndex = boldMatch.index + boldMatch[0].length;
      }
      
      // Add any remaining text after the last bold
      if (partLastIndex < part.length) {
        processedParts.push(part.slice(partLastIndex));
      }
    } else {
      // Keep non-string parts (like links) as-is
      processedParts.push(part);
    }
  }
  
  return processedParts.length > 0 ? processedParts : content;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'I am an AI assistant that can answer questions in Vito Senič\'s name based on his CV, projects, and notes.' },
    { role: 'assistant', content: 'Hej, Vito here! 👋 What do you wanna know about me?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: 10, resetTime: Date.now() + 5 * 60 * 1000 });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Tell me more about your projects",
    "Tell me more about who you are...",
    "What are you currently working on?"
  ];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setRateLimitInfo(prev => {
        const now = Date.now();
        if (now >= prev.resetTime) {
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
    }, 60000);

    return () => clearInterval(timer);
  }, []);


  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading || rateLimitInfo.remaining === 0) return;
    
    setShowSuggestions(false);
    setRateLimitInfo(prev => ({
      ...prev,
      remaining: prev.remaining - 1
    }));

    const userMessage = { role: 'user' as const, content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowTimeoutMessage(false);
    
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 5000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rate limit exceeded');
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
      setShowTimeoutMessage(false);
      clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || rateLimitInfo.remaining === 0) return;
    
    setShowSuggestions(false);
    setRateLimitInfo(prev => ({
      ...prev,
      remaining: prev.remaining - 1
    }));

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowTimeoutMessage(false);
    
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 5000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rate limit exceeded');
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
      setShowTimeoutMessage(false);
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent blur-3xl rounded-3xl opacity-50" />
      
      {/* Glassmorphism container */}
      <div className="relative backdrop-blur-xl bg-gray-900/50 border border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Messages container */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {messages.filter(m => m.role !== 'system').map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700/50'
                  }`}
                >
                  <div className="text-sm font-medium mb-1 opacity-80">
                    {message.role === 'assistant' ? 'Vito' : 'You'}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {renderMessageWithFormatting(message.content)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="text-sm font-medium mb-1 opacity-80">Vito</div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {showTimeoutMessage && isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-900/30 border border-amber-700/50 rounded-2xl px-4 py-3 text-amber-200 text-sm"
            >
              <p className="font-medium mb-1">🤔 Taking longer than expected...</p>
              <p className="text-xs text-amber-300/80">
                This might be due to rate limiting. Hang tight!
              </p>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
          
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <p className="text-sm text-gray-400 mb-3">Try asking me:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading || rateLimitInfo.remaining === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 text-sm rounded-lg border border-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Input form */}
        <div className="p-6 border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={rateLimitInfo.remaining > 0 ? "Ask me about my projects, studies, or ideas…" : "Rate limit exceeded"}
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
              disabled={isLoading || rateLimitInfo.remaining === 0}
            />
            <motion.button
              type="submit"
              disabled={isLoading || rateLimitInfo.remaining === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.91158 12H7.45579H4L2.02268 4.13539C2.0111 4.0893 2.00193 4.04246 2.00046 3.99497C1.97811 3.27397 2.77209 2.77366 3.46029 3.10388L22 12L3.46029 20.8961C2.77983 21.2226 1.99597 20.7372 2.00002 20.0293C2.00038 19.9658 2.01455 19.9032 2.03296 19.8425L3.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </form>
          
          <div className="text-center text-xs text-gray-500 mt-3">
            {rateLimitInfo.remaining}/10 questions • resets in {formatTimeRemaining(rateLimitInfo.resetTime)}
          </div>
        </div>
      </div>
    </div>
  );
}

