import React, { useState, useEffect } from 'react';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import { getConversations } from './api';
import socket from './socket';

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  // State to control visibility of chat window on mobile
  // On desktop, this state doesn't affect visibility, only on mobile.
  const [showChatWindow, setShowChatWindow] = useState(false);

  const BUSINESS_WA_ID = '918329446654';

  useEffect(() => {
    fetchConversations();

    socket.on('messageUpdate', (updatedMessage) => {
      setConversations((prevConversations) => {
        const existingConvIndex = prevConversations.findIndex(
          (conv) => conv.conversationId === updatedMessage.conversationId
        );

        let newConversations;
        if (existingConvIndex > -1) {
          newConversations = [...prevConversations];
          newConversations[existingConvIndex] = {
            ...newConversations[existingConvIndex],
            lastMessage: updatedMessage.body,
            lastMessageTimestamp: updatedMessage.timestamp,
            lastMessageDirection: updatedMessage.direction,
            lastMessageStatus: updatedMessage.status,
          };
        } else {
          const otherParticipantWaId =
            updatedMessage.senderWaId === BUSINESS_WA_ID
              ? updatedMessage.recipientWaId
              : updatedMessage.senderWaId;

          newConversations = [
            {
              conversationId: updatedMessage.conversationId,
              lastMessage: updatedMessage.body,
              lastMessageTimestamp: updatedMessage.timestamp,
              lastMessageDirection: updatedMessage.direction,
              lastMessageStatus: updatedMessage.status,
              otherParticipantWaId: otherParticipantWaId,
              otherParticipantName: updatedMessage.senderName,
            },
            ...prevConversations,
          ];
        }
        return newConversations.sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
      });
    });

    socket.on('statusUpdate', ({ messageId, status, conversationId }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId && conv.lastMessageDirection === 'outbound'
            ? { ...conv, lastMessageStatus: status }
            : conv
        )
      );
    });

    return () => {
      socket.off('messageUpdate');
      socket.off('statusUpdate');
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data);
      // If a conversation was selected, try to re-select it after fetching
      if (selectedConversation) {
        const updatedSelected = response.data.find(
          (conv) => conv.conversationId === selectedConversation.conversationId
        );
        setSelectedConversation(updatedSelected || null);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowChatWindow(true); // Always show chat window on mobile when selected
  };

  const handleBackToConversations = () => {
    setShowChatWindow(false); // Hide chat window and show conversation list on mobile
    setSelectedConversation(null); // Clear selected conversation
  };

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Conversation List */}
        <div className={`
          w-full md:w-1/3 lg:w-1/4 flex-shrink-0
          ${showChatWindow ? 'hidden' : 'flex'}  /* Mobile: Hide if chat window is shown */
          md:flex                                /* Desktop: Always show */
        `}>
          <ConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.conversationId}
          />
        </div>

        {/* Chat Window */}
        <div className={`
          flex-1
          ${selectedConversation && showChatWindow ? 'flex' : 'hidden'} /* Mobile: Show if selected and showChatWindow is true */
          md:flex                                                      /* Desktop: Always show */
        `}>
          <ChatWindow
            selectedConversation={selectedConversation}
            businessNumber={BUSINESS_WA_ID}
            onBack={handleBackToConversations}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
