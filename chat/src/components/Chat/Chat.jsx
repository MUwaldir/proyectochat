import React, { useState, useEffect } from 'react';
// import WebSocket from '../../services/webSocket';
import EmojiPicker from 'emoji-picker-react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   useEffect(() => {
//     WebSocket.connect();
//     WebSocket.on('message', handleMessage);
//     return () => WebSocket.disconnect();
//   }, []);

  const handleMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      WebSocket.emit('message', inputMessage);
      setInputMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputMessage(inputMessage + emoji.emoji);
  };

  return (
    <div className="flex flex-col absolute w-full bottom-0" >
    <div className="flex-grow bg-gray-100 overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className="flex justify-end p-2">
          <div className="bg-blue-500 text-white rounded-lg p-2">
            {message}
          </div>
        </div>
      ))}
    </div>
    <form onSubmit={handleSubmit} className="flex justify-between items-center p-2 bg-gray-200">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow px-4 py-2 mr-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
      />
      <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
        🙂
      </button>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
    </form>
    {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiSelect} />}
  </div>
  );
}

export default Chat;
