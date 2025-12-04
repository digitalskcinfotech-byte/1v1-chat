import React from 'react';
import { Conversation, User } from '../types';
import { Avatar } from './Avatar';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUser: User;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  currentUser,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0];
        const isActive = conv.id === activeId;

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors duration-200 border-b border-gray-50 hover:bg-gray-50 ${
              isActive ? 'bg-indigo-50/60 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
            }`}
          >
            <Avatar user={otherParticipant} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                  {otherParticipant.name}
                </h3>
                {conv.lastMessage && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {/* Using simple formatting to avoid extra dependencies if date-fns is not available in environment, but here we can use basic JS */}
                    {conv.lastMessage.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 truncate pr-2">
                   {conv.isTyping ? (
                     <span className="text-primary font-medium italic animate-pulse">Typing...</span>
                   ) : (
                     conv.lastMessage?.text || 'No messages yet'
                   )}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};