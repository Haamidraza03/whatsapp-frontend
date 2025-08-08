import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getConversations = () => api.get('/conversations');
export const getConversationMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`);
export const sendMessage = (messageData) => api.post('/messages', messageData);
