'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';

export default function ChatBot() {
  const {
    isChatOpen,
    toggleChat,
    chatMessages,
    addChatMessage,
  } = useAppStore();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeSentRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isChatOpen]);

  // Send welcome message on first open
  useEffect(() => {
    if (isChatOpen && !welcomeSentRef.current) {
      welcomeSentRef.current = true;
      addChatMessage(
        'bot',
        'Halo! Saya asisten NicePlayland. Ada yang bisa saya bantu?'
      );
    }
  }, [isChatOpen, addChatMessage]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    addChatMessage('user', trimmed);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const json = await res.json();

      if (json.success && json.data?.reply) {
        addChatMessage('bot', json.data.reply);
      } else {
        addChatMessage(
          'bot',
          'Maaf, saya mengalami kesalahan. Silakan coba lagi atau hubungi admin untuk bantuan.'
        );
      }
    } catch {
      addChatMessage(
        'bot',
        'Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-[9999] flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Buka chat asisten"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-25" />
            <MessageCircle className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[9999] flex w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
                  <Bot className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">NicePlayland Assistant</h3>
                  <p className="text-xs text-emerald-100">Online - siap membantu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={toggleChat}
                aria-label="Tutup chat"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
              {chatMessages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Bot className="size-10 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Mulai percakapan dengan mengetik pesan di bawah.
                  </p>
                </div>
              )}

              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="mr-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Bot className="size-4 text-emerald-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-md bg-emerald-600 text-white'
                        : 'rounded-bl-md bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="ml-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                      <User className="size-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="mb-3 flex justify-start">
                  <div className="mr-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Bot className="size-4 text-emerald-600" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="inline-block size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <span className="inline-block size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <span className="inline-block size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ketik pesan Anda..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 border-gray-200 bg-white text-sm focus-visible:ring-emerald-500"
                />
                <Button
                  size="icon"
                  className="shrink-0 size-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Kirim pesan"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
