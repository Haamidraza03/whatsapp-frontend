import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { getConversationMessages, sendMessage as sendApiMessage } from '../api';
import socket from '../socket';

// Add onBack prop for mobile responsiveness
const ChatWindow = ({ selectedConversation, businessNumber = '918329446654', onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('messageUpdate', (updatedMessage) => {
      if (selectedConversation && updatedMessage.conversationId === selectedConversation.conversationId) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg => msg.messageId === updatedMessage.messageId);
          if (!exists) {
            return [...prevMessages, updatedMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          return prevMessages;
        });
      }
    });

    socket.on('statusUpdate', ({ messageId, status, conversationId }) => {
      if (selectedConversation && conversationId === selectedConversation.conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageId === messageId ? { ...msg, status: status } : msg
          )
        );
      }
    });

    return () => {
      socket.off('messageUpdate');
      socket.off('statusUpdate');
    };
  }, [selectedConversation]);

  const fetchMessages = async () => {
    try {
      const response = await getConversationMessages(selectedConversation.conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation.conversationId,
      recipientWaId: selectedConversation.otherParticipantWaId,
      body: newMessage.trim(),
    };

    try {
      await sendApiMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm flex items-center">
        {/* Back button for mobile */}
        <button
          onClick={onBack}
          className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Back to conversations"
        >
          {/* Simple SVG for a back arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold mr-3">
          {selectedConversation.otherParticipantName ? selectedConversation.otherParticipantName[0] : '?'}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{selectedConversation.otherParticipantName || selectedConversation.otherParticipantWaId}</h3>
          <p className="text-sm text-gray-500">{selectedConversation.otherParticipantWaId}</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col bg-gray-100">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.messageId}
            message={msg}
            isSender={msg.senderWaId === businessNumber}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="ml-3 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
