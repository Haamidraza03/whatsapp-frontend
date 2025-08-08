import React from 'react';
import { format } from 'date-fns';

const ConversationList = ({ conversations, onSelectConversation, selectedConversationId }) => {
    return (
        <div className="w-full md:w-1/3 lg:w-full bg-gray-100 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">WhatsApp</h2>
                <form action="" method="get">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full p-2 px-3 mt-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </form>
            </div>
            {conversations.length === 0 ? (
                <p className="p-4 text-gray-500">No conversations found.</p>
            ) : (
                <ul>
                    {conversations.map((conv) => (
                        <li
                            key={conv.conversationId}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-200 ${selectedConversationId === conv.conversationId ? 'bg-gray-200' : ''
                                }`}
                            onClick={() => onSelectConversation(conv)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">
                                    {conv.otherParticipantName ? conv.otherParticipantName[0] : '?'}
                                </div>
                                
                                <h3 className="font-semibold text-lg">{conv.otherParticipantName || conv.otherParticipantWaId}</h3>
                                <span className="text-xs text-gray-500">
                                    {conv.lastMessageTimestamp ? format(new Date(conv.lastMessageTimestamp), 'HH:mm') : ''}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 justify-center text-center truncate">
                                {conv.lastMessageDirection === 'outbound' ? 'You: ' : ''}
                                {conv.lastMessage}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ConversationList;
