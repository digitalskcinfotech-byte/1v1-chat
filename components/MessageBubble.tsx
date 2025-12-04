import React from 'react';
import { Message } from '../types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
          <span>{timeString}</span>
          {isOwn && (
            <span>
              {message.status === 'read' ? (
                <CheckCheck size={14} className="text-blue-200" />
              ) : message.status === 'delivered' ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};