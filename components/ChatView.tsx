
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserRole, Job } from '../types';

interface ChatViewProps {
  job: Job;
  messages: ChatMessage[];
  currentUserRole: UserRole;
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isAdmin?: boolean;
}

// Fix: Removed unused SendIcon import that was causing a compilation error
const ChatView: React.FC<ChatViewProps> = ({ job, messages, currentUserRole, currentUserId, onSendMessage, onClose, isAdmin = false }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {job.aiAnalysis?.[0] || 'J'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{job.aiAnalysis || 'Job Conversation'}</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold">{isAdmin ? 'Admin God-View' : job.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No messages yet. Send a message to start the conversation!
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  {!isAdmin && !isMe && (
                    <div className="text-[9px] font-black uppercase mb-1 opacity-60">
                      {msg.senderRole}
                    </div>
                  )}
                  {msg.text}
                  <div className={`text-[8px] mt-1 text-right opacity-50`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        {!isAdmin && (
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={!inputText.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        )}
        {isAdmin && (
          <div className="p-4 bg-gray-100 text-center text-xs font-bold text-gray-500 italic">
            Admins are in read-only mode for this conversation.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
