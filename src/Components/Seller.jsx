import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSellerById, clearError } from '../Components/HomeApi';
import { 
  IoCall, IoLocation, IoArrowBack, IoMail, IoGlobe, IoTime, 
  IoSend, IoClose, IoBusiness, IoPerson, IoVideocam, IoEllipsisVertical 
} from 'react-icons/io5';
import io from 'socket.io-client';
import {fetchOrderInfo} from "../Components/Getorderinfo"


// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


const Seller = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedSeller, sellerLoading, sellerError } = useSelector((state) => state.home);
  const currentUser = useSelector((state) => state.auth?.user || null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isSellerView, setIsSellerView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const userOrdersInfo = useSelector((state)=>state.getorderInfo)
  const [showUserInfo,setUserInfo]=useState(userOrdersInfo)
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedSeller) {
      navigate('/');
      return;
    }
    if (currentUser && currentUser._id === selectedSeller._id) {
      setIsSellerView(true);
    }
  }, [selectedSeller, currentUser, navigate]);
  
  useEffect(() => {
    if (selectedSeller && selectedSeller._id) {
      // Use getCookie instead of localStorage
      const token = getCookie('token');
      
      socketRef.current = io(`${API_BASE_URL}`, {
        auth: {
          token: token
        },
        query: {
          sellerId: selectedSeller._id,
          userId: currentUser?._id || 'guest',
          userType: isSellerView ? 'seller' : 'buyer',
          userName: currentUser?.name || 'Guest User'
        },
        withCredentials: true 
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        
        if (isSellerView) {
          console.log('Seller connected, waiting for conversations');
        } else {
          const roomId = `chat_${selectedSeller._id}_${currentUser?._id || 'guest'}`;
          socketRef.current.emit('join_chat', {
            roomId,
            sellerId: selectedSeller._id,
            userId: currentUser?._id || 'guest'
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      socketRef.current.on('message_received', (message) => {
        setMessages(prev => [...prev, message]);
        if (isSellerView && activeConversation && 
            activeConversation.buyerId !== message.userId) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.userId]: (prev[message.userId] || 0) + 1
          }));
        }
      });

      socketRef.current.on('previous_messages', (chatHistory) => {
        setMessages(chatHistory);
      });
      
      socketRef.current.on('previous_conversations', (conversationList) => {
        setConversations(conversationList);
      });
      
      socketRef.current.on('new_conversation', (conversation) => {
        setConversations(prev => [...prev, conversation]);
      });
      
      socketRef.current.on('conversation_messages', (messageHistory) => {
        setMessages(messageHistory);
        if (isSellerView && activeConversation) {
          setUnreadCounts(prev => ({
            ...prev,
            [activeConversation.buyerId]: 0
          }));
        }
      });
      
      socketRef.current.on('new_message_notification', (data) => {
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${data.buyerName}`, {
            body: data.message,
            icon: selectedSeller.imageUrl
          });
        }
        socketRef.current.emit('send_message', messageData, (ack) => {
          if (ack.status === 'success') {
            console.log('Message delivered to server');
          } else {
          }
        });
        socketRef.current.on('message_received', (message) => {
          setMessages(prev => {
            const newMessages = [...prev, message];
            return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          });
        });
        setUnreadCounts(prev => ({
          ...prev,
          [data.buyerId]: (prev[data.buyerId] || 0) + 1
        }));
      });
      
      socketRef.current.on('user_typing', (data) => {
        if (data.typing) {
          setIsTyping(true);
          setTypingUser(data.userName);
        } else {
          setIsTyping(false);
          setTypingUser('');
        }
      });
      
      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [selectedSeller, currentUser, isSellerView, activeConversation]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleCallSeller = () => {
    if (selectedSeller?.phonenumber) {
      window.location.href = `tel:${selectedSeller.phonenumber}`;
    }
  };

  const handleMessageSeller = () => {
    setShowChat(true);
  };
  
  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    setShowChat(true);
    
    if (socketRef.current) {
      const roomId = `chat_${selectedSeller._id}_${conversation.buyerId}`;
      socketRef.current.emit('join_chat', {
        roomId,
        sellerId: selectedSeller._id,
        userId: conversation.buyerId
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      let messageData;
      let roomId;
      
      if (isSellerView && activeConversation) {
        roomId = `chat_${selectedSeller._id}_${activeConversation.buyerId}`;
        messageData = {
          roomId,
          sellerId: selectedSeller._id,
          userId: activeConversation.buyerId,
          message: newMessage.trim(),
          timestamp: new Date(),
          sender: 'seller',
          senderName: selectedSeller.sellername || selectedSeller.businessName
        };
      } else {
        roomId = `chat_${selectedSeller._id}_${currentUser?._id || 'guest'}`;
        messageData = {
          roomId,
          sellerId: selectedSeller._id,
          userId: currentUser?._id || 'guest',
          message: newMessage.trim(),
          timestamp: new Date(),
          sender: 'buyer',
          senderName: currentUser?.name || 'Guest User'
        };
      }
      socketRef.current.emit('send_message', messageData);
      
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      socketRef.current.emit('typing_stop', { roomId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      let roomId;
      
      if (isSellerView && activeConversation) {
        roomId = `chat_${selectedSeller._id}_${activeConversation.buyerId}`;
      } else {
        roomId = `chat_${selectedSeller._id}_${currentUser?._id || 'guest'}`;
      }
      socketRef.current.emit('typing_start', {
        roomId,
        userType: isSellerView ? 'seller' : 'buyer',
        userName: isSellerView 
          ? selectedSeller.sellername || selectedSeller.businessName 
          : currentUser?.name || 'Guest User'
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing_stop', { roomId });
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageTime.toLocaleDateString();
    }
  };
  useEffect(()=>{
    try{
      dispatch(fetchOrderInfo())
    }catch(error){
      console.log(error)
    }
  },[dispatch])

  if (sellerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-700 space-y-2">
              {showUserInfo ?(
                <div className='flex flex-col justify-center items-center h-[40vh] md:w-[100%] w-[50%] sm:w-[50%]'>
                  <p className="font-medium">{userOrdersInfo.fullName}</p>
                  <p>{userOrdersInfo.street}</p>
                  <p>{userOrdersInfo.city}, {userOrdersInfo.state} {userOrdersInfo.zip}</p>
                  <p>Phone: {userOrdersInfo.phone}</p>
                </div>

              ):(
                <p>........</p>
              )
              }
            </div>
                
              
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller information...</p>

        </div>
      </div>
    );
  }

  if (sellerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Seller</h2>
          <p className="text-gray-600 text-center mb-6">{sellerError}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => dispatch(clearError())}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/Home')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSeller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {!isSellerView && showChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2">
                {selectedSeller.imageUrl ? (
                  <img
                    src={selectedSeller.imageUrl}
                    alt={selectedSeller.sellername}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {selectedSeller.sellername ? selectedSeller.sellername.charAt(0).toUpperCase() : 'S'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{selectedSeller.sellername}</h3>
            </div>
            <div className="flex items-center">
              <button className="p-1 text-white hover:bg-indigo-700 rounded">
                <IoVideocam size={16} />
              </button>
              <button onClick={() => setShowChat(false)} className="p-1 text-white hover:bg-indigo-700 rounded ml-1">
                <IoClose size={18} />
              </button>
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto p-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-16">
                Start a conversation with {selectedSeller.sellername}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${msg.sender === 'buyer' ? 'text-right' : ''}`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender === 'buyer' ? 'You' : msg.senderName}
                  </div>
                  <div
                    className={`inline-block p-2 rounded-lg max-w-xs ${
                      msg.sender === 'buyer'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="text-left mb-3">
                <div className="text-xs text-gray-500 mb-1">{typingUser}</div>
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-block">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoSend />
            </button>
          </div>
          
          {!isConnected && (
            <div className="bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
              Connecting to chat...
            </div>
          )}
        </div>
      )}
      {isSellerView && showChat && activeConversation && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2">
                <IoPerson size={16} />
              </div>
              <h3 className="font-semibold">Chat with {activeConversation.buyerName}</h3>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white">
              <IoClose />
            </button>
          </div>
          
          <div className="h-64 overflow-y-auto p-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-16">
                No messages in this conversation yet
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${msg.sender === 'seller' ? 'text-right' : ''}`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender === 'seller' ? 'You' : msg.senderName}
                  </div>
                  <div
                    className={`inline-block p-2 rounded-lg max-w-xs ${
                      msg.sender === 'seller'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="text-left mb-3">
                <div className="text-xs text-gray-500 mb-1">{typingUser}</div>
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-block">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoSend />
            </button>
          </div>
          
          {!isConnected && (
            <div className="bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
              Connecting to chat...
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <IoArrowBack className="mr-2" />
          Back to Home
        </button>
        {isSellerView && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Conversations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div
                    key={conversation.buyerId}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      activeConversation && activeConversation.buyerId === conversation.buyerId
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IoPerson className="text-indigo-600 mr-2" />
                        <span className="font-medium">{conversation.buyerName}</span>
                      </div>
                      {unreadCounts[conversation.buyerId] > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCounts[conversation.buyerId]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(conversation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 col-span-full">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
          <div className="md:flex">
            <div className="md:w-2/5 p-6 bg-indigo-50 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {selectedSeller.imageUrl ? (
                    <img
                      src={selectedSeller.imageUrl}
                      alt={selectedSeller.sellername}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-500 text-4xl font-bold">
                      {selectedSeller.sellername ? selectedSeller.sellername.charAt(0).toUpperCase() : 'S'}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSeller.sellername}</h1>
                {selectedSeller.businessName && (
                  <p className="text-gray-600">{selectedSeller.businessName}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <IoLocation className="text-indigo-600 mr-3" />
                  <span className="text-gray-700">{selectedSeller.location}</span>
                </div>
                
                <div className="flex items-center">
                  <IoCall className="text-indigo-600 mr-3" />
                  <span className="text-gray-700">{selectedSeller.phonenumber}</span>
                </div>
                
                {selectedSeller.email && (
                  <div className="flex items-center">
                    <IoMail className="text-indigo-600 mr-3" />
                    <span className="text-gray-700">{selectedSeller.email}</span>
                  </div>
                )}
                
                {selectedSeller.website && (
                  <div className="flex items-center">
                    <IoGlobe className="text-indigo-600 mr-3" />
                    <a href={selectedSeller.website} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-3/5 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isSellerView ? 'Your Seller Profile' : 'Seller Information'}
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-gray-600">
                  {selectedSeller.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-semibold flex items-center">
                    <IoTime className="mr-1 text-indigo-600" /> Usually within 1 hour
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold">
                    {selectedSeller.createdAt ? new Date(selectedSeller.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {!isSellerView && (
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleCallSeller}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <IoCall className="mr-2" />
                    Call Now
                  </button>
                  <button
                    onClick={handleMessageSeller}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <IoMail className="mr-2" />
                    {showChat ? 'Chat Open' : 'Start Chat'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedSeller.otherProducts && selectedSeller.otherProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Products from This Seller</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSeller.otherProducts.slice(0, 3).map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                    <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-indigo-600 font-bold">N{product.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seller;