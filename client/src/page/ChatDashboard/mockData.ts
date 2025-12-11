export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://ui.shadcn.com/avatars/01.png",
    status: "online",
    lastMessage: "Hey, how are you regarding the assignment?",
    lastMessageTime: "10:30 AM",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "https://ui.shadcn.com/avatars/02.png",
    status: "offline",
    lastMessage: "Can you send me the notes?",
    lastMessageTime: "Yesterday",
  },
  {
    id: "3",
    name: "Charlie Brown",
    avatar: "https://ui.shadcn.com/avatars/03.png",
    status: "busy",
    lastMessage: "Meeting at 3 PM.",
    lastMessageTime: "Yesterday",
  },
  {
    id: "4",
    name: "Diana Prince",
    avatar: "https://ui.shadcn.com/avatars/04.png",
    status: "online",
    lastMessage: "Thanks for the help!",
    lastMessageTime: "2 days ago",
  },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    senderId: "1",
    receiverId: "me",
    content: "Hey, how are you regarding the assignment?",
    timestamp: "2023-10-27T10:30:00",
    status: "read",
  },
  {
    id: "m2",
    senderId: "me",
    receiverId: "1",
    content: "I am good! Just finishing up the last part.",
    timestamp: "2023-10-27T10:31:00",
    status: "read",
  },
  {
    id: "m3",
    senderId: "1",
    receiverId: "me",
    content: "Great! Let me know if you need any help.",
    timestamp: "2023-10-27T10:32:00",
    status: "read",
  },
  {
    id: "m4",
    senderId: "me",
    receiverId: "1",
    content: "Sure, thanks Alice!",
    timestamp: "2023-10-27T10:33:00",
    status: "sent",
  },
];

export const currentUser = {
  id: "me",
  name: "Me",
  avatar: "https://github.com/shadcn.png",
};
