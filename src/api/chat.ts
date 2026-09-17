import api from './axios';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  traveler_id: string;
  business_id: string;
  created_at: string;
  updated_at: string;
  traveler: {
    id: string;
    name: string;
    email: string;
  };
  business: {
    id: string;
    business_name: string;
    user_id: string;
  };
}

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await api.get('/conversations');
  return data.data;
};

export const getMessages = async (conversationId: string, page = 1, limit = 50): Promise<{ data: ChatMessage[], pagination: any }> => {
  const { data } = await api.get(`/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return data;
};

export const sendMessage = async (conversationId: string, content: string, recipientId?: string, businessId?: string): Promise<ChatMessage> => {
  const { data } = await api.post(`/conversations/${conversationId}/messages`, {
    content,
    recipient_id: recipientId,
    business_id: businessId
  });
  return data.data;
};
