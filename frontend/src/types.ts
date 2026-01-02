export interface Pet {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
