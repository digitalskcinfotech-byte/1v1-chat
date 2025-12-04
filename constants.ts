import { User, Conversation } from './types';

export const CURRENT_USER: User = {
  id: 'user_1',
  name: 'Alex Developer',
  avatar: 'https://picsum.photos/seed/alex/200/200',
  status: 'online',
};

export const MOCK_USERS: User[] = [
  {
    id: 'gemini_agent',
    name: 'Gemini Assistant',
    avatar: 'https://picsum.photos/seed/gemini/200/200',
    status: 'online',
    isBot: true,
  },
  {
    id: 'user_2',
    name: 'Sarah Designer',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    status: 'away',
  },
  {
    id: 'user_3',
    name: 'Mike Manager',
    avatar: 'https://picsum.photos/seed/mike/200/200',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participants: [CURRENT_USER, MOCK_USERS[0]],
    unreadCount: 0,
    lastMessage: {
      id: 'msg_0',
      conversationId: 'conv_1',
      senderId: 'gemini_agent',
      text: 'Hello! I am ready to help you with your React tasks.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'read',
      type: 'text',
    },
  },
  {
    id: 'conv_2',
    participants: [CURRENT_USER, MOCK_USERS[1]],
    unreadCount: 2,
    lastMessage: {
      id: 'msg_old',
      conversationId: 'conv_2',
      senderId: 'user_2',
      text: 'Hey, did you see the new designs?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'delivered',
      type: 'text',
    },
  },
];