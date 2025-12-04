import React from 'react';
import { User } from '../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
      />
      <span
        className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-white ${statusColors[user.status]}`}
      />
    </div>
  );
};