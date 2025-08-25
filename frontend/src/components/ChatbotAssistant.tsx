import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, BarChart3, AlertCircle, Loader } from 'lucide-react';

// Types
interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

interface ApiError {
  detail: string;
}

const ChatbotAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your BPAi dashboard assistant powered by Gemini AI. I can help you understand your risk scoring data, application statuses, and explain how our risk assessment model works. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError('API server is not responding');
      }
    } catch (error) {
      setIsConnected(false);
      setError('Cannot connect to API server. Make sure FastAPI is running on port 8000.');
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAPI = async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
      const requestBody: ChatRequest = {
        message,
        conversation_history: history
      };

      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Cannot connect to the API server. Please check if the FastAPI server is running.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!isConnected) {
      setError('Please check your connection to the API server');
      return;
    }

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      // Send to Gemini API via FastAPI
      const response = await sendMessageToAPI(inputMessage, messages);
      
      const botMessage: ChatMessage = {
        id: updatedMessages.length + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: updatedMessages.length + 1,
        type: 'bot',
        content: error instanceof Error ? 
          `❌ Error: ${error.message}` : 
          '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string): string => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• (.+)$/gm, '<div class="ml-4">• $1</div>')
      .replace(/^(🔴|🔵|🟢|👤|📊|💡|📅|📞|📍|📋|📈|🚨|🔍|📋|❌) (.+)$/gm, '<div class="flex items-start gap-2"><span>$1</span><span>$2</span></div>')
      .replace(/\n/g, '<br>');
  };

  const handleRetryConnection = () => {
    checkApiConnection();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className={`p-4 rounded-t-lg flex items-center justify-between ${
            isConnected ? 'bg-red-600' : 'bg-gray-600'
          } text-white`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {isConnected ? <BarChart3 size={16} /> : <AlertCircle size={16} />}
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  Dashboard Assistant {isConnected ? '(AI)' : '(Offline)'}
                </h3>
                <p className="text-xs opacity-90">
                  {isConnected ? 'Powered by Gemini AI' : 'Connection Error'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>

          {/* Connection Error Banner */}
          {!isConnected && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-yellow-600" />
                  <span className="text-yellow-800">API Disconnected</span>
                </div>
                <button
                  onClick={handleRetryConnection}
                  className="text-yellow-800 hover:text-yellow-900 underline text-xs"
                >
                  Retry
                </button>
              </div>
              {error && (
                <p className="text-yellow-700 text-xs mt-1">{error}</p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border'
                  }`}
                >
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }}
                  />
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <Loader size={14} className="animate-spin text-gray-400" />
                    <span className="text-gray-500 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected 
                    ? "Ask about applications, risk scores, or clients..."
                    : "Connect to API server first..."
                }
                disabled={!isConnected || isTyping}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || !isConnected}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center relative"
        >
          <MessageCircle size={24} />
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </button>
      )}
    </div>
  );
};

export default ChatbotAssistant;