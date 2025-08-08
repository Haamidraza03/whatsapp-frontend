import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isSender }) => {
  const bubbleClass = isSender
    ? 'bg-green-100 self-end rounded-br-none'
    : 'bg-white self-start rounded-bl-none';

  const statusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-gray-500 text-xs ml-1">✓</span>;
      case 'delivered':
        return <span className="text-blue-500 text-xs ml-1">✓✓</span>;
      case 'read':
        return <span className="text-blue-700 text-xs ml-1">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col max-w-[70%] p-2 rounded-lg shadow-sm mb-2 ${bubbleClass}`}>
      <p className="text-sm break-words">{message.body}</p>
      <div className="flex justify-end items-center text-xs text-gray-500 mt-1">
        <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
        {isSender && statusIcon(message.status)}
      </div>
    </div>
  );
};

export default MessageBubble;
