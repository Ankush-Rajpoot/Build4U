import React from 'react';
import { useChat } from '../../context/ChatContext';
import MessageCenter from './MessageCenter';

const GlobalMessageCenter = () => {
  const { activeChat, closeChat } = useChat();

  // Only render the chat window if active
  return (
    <>
      {activeChat && (
        <MessageCenter
          serviceRequest={activeChat}
          onClose={closeChat}
        />
      )}
    </>
  );
};

export default GlobalMessageCenter;