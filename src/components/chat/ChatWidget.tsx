import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { getConversations, getMessages, sendMessage } from '../../api/chat';
import type { Conversation, ChatMessage } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { X, Send, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

export const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);

      // Subscribe to Supabase Realtime
      const channel = supabase.channel(`conversation:${activeConversation.id}`)
        .on(
          'postgres' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${activeConversation.id}`
          },
          (payload: any) => {
            const incomingMessage = payload.new as ChatMessage;
            setMessages((prev) => {
              // prevent duplicates due to optimistic UI
              if (prev.find(m => m.id === incomingMessage.id)) return prev;
              return [...prev, incomingMessage];
            });
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data } = await getMessages(conversationId);
      // Backend sorts by created_at DESC (newest first). Let's reverse it for the UI (oldest first).
      setMessages(data.reverse());
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const content = newMessage;
    setNewMessage('');
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
      read_at: null,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const savedMsg = await sendMessage(activeConversation.id, content);
      setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
    } catch (error) {
      console.error('Failed to send message', error);
      // Remove temp message if failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (!user) return null; // Only authenticated users can see chat

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-gray-100" style={{ height: '500px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lg">
              {activeConversation ? (
                <button onClick={() => setActiveConversation(null)} className="flex items-center hover:underline">
                  &larr; Back to Messages
                </button>
              ) : 'Messages'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
            {!activeConversation ? (
              // Conversation List
              <div className="divide-y divide-gray-100">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No active conversations.
                  </div>
                ) : (
                  conversations.map(conv => {
                    const otherPartyName = user.role === 'traveler' ? conv.business.business_name : conv.traveler.name;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className="w-full text-left p-4 hover:bg-gray-100 transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {otherPartyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{otherPartyName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              // Active Conversation
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">Loading messages...</div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id || index} className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl shadow-sm",
                              isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} className="ml-1" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
