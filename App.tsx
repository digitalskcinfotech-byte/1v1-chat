import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Paperclip, Smile, ArrowLeft, Menu } from 'lucide-react';
import { CURRENT_USER, INITIAL_CONVERSATIONS, MOCK_USERS } from './constants';
import { Conversation, Message, User } from './types';
import { Avatar } from './components/Avatar';
import { ConversationList } from './components/ConversationList';
import { MessageBubble } from './components/MessageBubble';
import { sendMessageToGemini } from './services/geminiService';
import { GenerateContentResponse } from '@google/genai';

function App() {
  // State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(INITIAL_CONVERSATIONS[0].id);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'conv_1': [INITIAL_CONVERSATIONS[0].lastMessage!],
    'conv_2': [INITIAL_CONVERSATIONS[1].lastMessage!],
  });
  const [inputText, setInputText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const otherParticipant = activeConversation?.participants.find(p => p.id !== CURRENT_USER.id);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeConversationId]);

  // Handle sending message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConversationId || !otherParticipant) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: activeConversationId,
      senderId: CURRENT_USER.id,
      text: inputText.trim(),
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    };

    // 1. Optimistic UI update
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }));
    setInputText('');
    
    // Update last message in conversation list
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, lastMessage: newMessage }
        : c
    ));

    // 2. Trigger "Backend" / Bot response
    if (otherParticipant.isBot) {
        setIsProcessing(true);
        // Simulate network delay and "typing" state
        setConversations(prev => prev.map(c => 
            c.id === activeConversationId ? { ...c, isTyping: true } : c
        ));

        try {
            const stream = await sendMessageToGemini(activeConversationId, newMessage.text);
            
            // Create a placeholder message for the bot response
            const botMsgId = (Date.now() + 1).toString();
            let fullBotResponse = "";
            
            const initialBotMessage: Message = {
                id: botMsgId,
                conversationId: activeConversationId,
                senderId: otherParticipant.id,
                text: "", // Will stream into this
                timestamp: new Date(),
                status: 'delivered',
                type: 'text',
            };

            // Add placeholder
            setMessages(prev => ({
                ...prev,
                [activeConversationId]: [...(prev[activeConversationId] || []), initialBotMessage]
            }));

            // Process stream
            for await (const chunk of stream) {
                const chunkText = (chunk as GenerateContentResponse).text;
                if (chunkText) {
                    fullBotResponse += chunkText;
                    
                    // Update the message in place
                    setMessages(prev => {
                        const conversationMessages = [...(prev[activeConversationId] || [])];
                        const msgIndex = conversationMessages.findIndex(m => m.id === botMsgId);
                        if (msgIndex !== -1) {
                            conversationMessages[msgIndex] = {
                                ...conversationMessages[msgIndex],
                                text: fullBotResponse
                            };
                        }
                        return {
                            ...prev,
                            [activeConversationId]: conversationMessages
                        };
                    });
                }
            }

            // Finalize
            setConversations(prev => prev.map(c => 
                c.id === activeConversationId 
                  ? { ...c, isTyping: false, lastMessage: { ...initialBotMessage, text: fullBotResponse } } 
                  : c
            ));

        } catch (err) {
            console.error("Failed to get response", err);
            // Add error message
             setConversations(prev => prev.map(c => 
                c.id === activeConversationId ? { ...c, isTyping: false } : c
            ));
        } finally {
            setIsProcessing(false);
        }
    } else {
        // Simulate a reply from a human user after a timeout (Mock behavior)
        setTimeout(() => {
             const reply: Message = {
                id: (Date.now() + 1).toString(),
                conversationId: activeConversationId,
                senderId: otherParticipant.id,
                text: "I'm currently away from my keyboard, but I received your message!",
                timestamp: new Date(),
                status: 'delivered',
                type: 'text',
             };
             setMessages(prev => ({
                 ...prev,
                 [activeConversationId]: [...(prev[activeConversationId] || []), reply]
             }));
             setConversations(prev => prev.map(c => 
                c.id === activeConversationId ? { ...c, lastMessage: reply } : c
             ));
        }, 3000);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-full w-full bg-white overflow-hidden relative">
      
      {/* Sidebar - Desktop: Always Visible, Mobile: Slide-over */}
      <div 
        className={`
          absolute z-20 top-0 left-0 h-full w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:relative
          ${isMobileMenuOpen || !activeConversationId ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${activeConversationId ? 'hidden md:flex' : 'flex'} 
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
               <Avatar user={CURRENT_USER} size="sm" />
               <h1 className="font-bold text-xl text-gray-800 tracking-tight">Chats</h1>
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <MoreVertical size={20} />
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>
        </div>

        {/* Conversation List */}
        <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId} 
            onSelect={(id) => {
                setActiveConversationId(id);
                closeMobileMenu();
            }}
            currentUser={CURRENT_USER}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] relative ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
        </div>

        {activeConversation && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10 shrink-0">
               <div className="flex items-center gap-3">
                   <button onClick={() => setActiveConversationId(null)} className="md:hidden p-1 -ml-2 text-gray-600">
                        <ArrowLeft size={24} />
                   </button>
                   <Avatar user={otherParticipant} size="md" />
                   <div>
                       <h2 className="font-semibold text-gray-800 leading-tight">{otherParticipant.name}</h2>
                       <p className="text-xs text-gray-500">
                           {otherParticipant.isBot ? 'AI Assistant' : otherParticipant.status === 'online' ? 'Active now' : `Last seen recently`}
                       </p>
                   </div>
               </div>
               
               <div className="flex items-center gap-1 md:gap-3 text-primary">
                   <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
                       <Phone size={20} />
                   </button>
                   <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
                       <Video size={20} />
                   </button>
                   <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors">
                       <MoreVertical size={20} className="text-gray-600" />
                   </button>
               </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 z-10 custom-scrollbar relative">
                <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
                    {/* Timestamp Separator Example */}
                    <div className="flex justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                            Today
                        </span>
                    </div>

                    {activeMessages.map((msg) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === CURRENT_USER.id} 
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white z-10 shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 p-2 rounded-3xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Smile size={24} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip size={24} />
                    </button>
                    
                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 py-3 max-h-32 resize-none"
                            autoComplete="off"
                        />
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || isProcessing}
                            className={`ml-2 p-3 rounded-full transition-all duration-200 ${
                                inputText.trim() 
                                    ? 'bg-primary text-white shadow-md hover:bg-secondary transform hover:scale-105 active:scale-95' 
                                    : 'bg-gray-200 text-gray-400 cursor-default'
                            }`}
                        >
                            <Send size={20} className={inputText.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </form>
                </div>
                <div className="text-center mt-2">
                     <p className="text-[10px] text-gray-400">
                         {otherParticipant.isBot ? 'AI-generated messages may be inaccurate.' : 'End-to-end encrypted.'}
                     </p>
                </div>
            </div>
          </>
        ) : (
          /* Empty State for Large Screens */
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
               <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center">
                       <Send size={48} className="text-primary ml-1" />
                   </div>
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Nova Chat</h2>
               <p className="text-gray-500 max-w-sm">
                   Select a conversation from the sidebar to start messaging. 
                   Try talking to <strong>Gemini Assistant</strong> for real-time AI responses.
               </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;