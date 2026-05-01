'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, Trash2, MessageSquare, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

// ✅ Use ai-sdk's built-in Message type
// import type { Message } from 'ai'; // ← If you want to use ai's built-in Message type
// Or define your own:
interface CustomMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: CustomMessage[];
}

export default function ChatPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save chat to history
  const saveToHistory = () => {
    if (messages.length === 0) return;

    const chatId = currentChatId || Date.now().toString();
    const firstMessageText = messages[0]?.content || '';
    const title = (firstMessageText.slice(0, 50) + '...') || 'New Chat';

    const newHistory: ChatHistory = {
      id: chatId,
      title,
      timestamp: new Date(),
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
    };

    setChatHistories(prev => {
      const filtered = prev.filter(h => h.id !== chatId);
      return [newHistory, ...filtered];
    });

    setCurrentChatId(chatId);
  };

  useEffect(() => {
    if (messages.length > 0) {
      saveToHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const compressImageFile = async (file: File) => {
    const imageBitmap = await createImageBitmap(file);
    const maxDimension = 1024;
    const scale = Math.min(
      1,
      maxDimension / Math.max(imageBitmap.width, imageBitmap.height),
    );
    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser does not support canvas');
    }
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', 0.7),
    );
    if (!blob) {
      throw new Error('Unable to compress image');
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Unable to read compressed image'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setUploadedImage(compressed);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setApiError(`Image upload failed: ${message}`);
      }
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setUploadedImage(null);
    setCurrentChatId(null);
  };

  const loadChatHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setCurrentChatId(history.id);
    setShowHistory(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const question = input.trim();
    if (!question && !uploadedImage) return;

    const userMessage: CustomMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question || 'Image-based question',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          image: uploadedImage,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Model API error');
      }

      const answer = await response.text();
      const assistantMessage: CustomMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: answer,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setUploadedImage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar - Chat History */}
      <div
        className={`${
          showHistory ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-30 w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 h-full flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">LiteDoc AI</h2>
              <p className="text-xs text-slate-500">Document Understanding</p>
            </div>
          </div>
          <Button onClick={startNewChat} className="w-full" variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
            Chat History
          </h3>
          {chatHistories.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
              No chats yet
            </p>
          ) : (
            <div className="space-y-2">
              {chatHistories.map(history => (
                <button
                  key={history.id}
                  onClick={() => loadChatHistory(history)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    currentChatId === history.id
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : ''
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {history.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(history.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back to Visualization */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Visualization
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat with LiteDoc
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ask questions about document understanding
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                <Home className="w-4 h-4 mr-2" />
                Visualization
              </Button>
            </Link>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome to LiteDoc AI
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Upload a document image and ask questions about it
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      📄 Document Analysis
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Extract information from forms, receipts, and documents
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      🔍 Visual Q&A
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Ask questions about images and get detailed answers
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="h-20 w-auto rounded-lg border-2 border-slate-200 dark:border-slate-700"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={onSubmit} className="flex gap-2" autoComplete="off">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question about your document..."
                className="min-h-[60px] resize-none"
                autoComplete="off"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isLoading || (!input.trim() && !uploadedImage)}
                className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}