/** Tipos del chat host ↔ usuario. Espejo de la API `GET /api/v1/messages/...`. */

export type MessageKind = "text" | "location";
export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatCounterpart {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
}

export interface ChatLastMessage {
  id: string;
  kind: MessageKind;
  body: string | null;
  sender_id: string;
  status: MessageStatus;
  created_at: string;
}

export interface ChatListItem {
  bookingId: string;
  bookingStatus: string | null;
  role: "traveler" | "host";
  product: {
    id: string | null;
    name: string | null;
    banner: string | null;
  };
  counterpart: ChatCounterpart | null;
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
}

export interface MessageReactionGroup {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface ChatMessageSender {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  kind: MessageKind;
  body: string | null;
  location_lat: string | null;
  location_lng: string | null;
  location_label: string | null;
  status: MessageStatus;
  created_at: string;
  sender: ChatMessageSender | null;
  reactions: MessageReactionGroup[];
}

export interface MessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

/** Payloads de Socket.IO (`message:new|delivered|read|reaction`). */
export interface MessageNewPayload {
  message: ChatMessage;
}

export interface MessageDeliveredPayload {
  bookingId: string;
  messageIds: string[];
}

export interface MessageReadPayload {
  bookingId: string;
  readerId: string;
  messageIds: string[];
  readAt: string;
}

export interface MessageReactionPayload {
  bookingId: string;
  messageId: string;
  reactions: MessageReactionGroup[];
}

/** Error 422 cuando el backend bloquea un mensaje (anti-evasión). */
export interface MessageBlockedError {
  status: number;
  data: {
    message: string;
    code?: string;
    reason?: string;
  };
}
