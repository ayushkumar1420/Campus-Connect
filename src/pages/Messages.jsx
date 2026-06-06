import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../hooks/useSocket";
import "./Messages.css";

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getUser()
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getPeers()
  });

  // Fetch target profile explicitly to fix caching/route bugs
  const { data: targetProfile, isLoading: loadingTargetProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.getUserProfile(userId),
    enabled: !!userId,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', userId],
    queryFn: () => api.getMessages(userId),
    enabled: !!userId,
    refetchInterval: false // Controlled by sockets now
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !userId) return;
    
    const handleReceiveMessage = (msg) => {
      // If the message involves this active chat, append it directly
      if (msg.sender_id === userId || msg.receiver_id === userId) {
        queryClient.setQueryData(['messages', userId], (old) => [...(old || []), msg]);
        setTimeout(() => {
           messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      // Always invalidate conversations to update read badges
      queryClient.invalidateQueries(['conversations']);
    };

    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, userId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.sendMessage({
      receiver_id: userId,
      content
    }),
    onSuccess: (newMsg) => {
      // The socket logic handles appending it for both sender and receiver on the backend
      // But we can eagerly append it here to be faster or rely on our own 'receive_message' listener.
      // Since our server broadcasts 'receive_message' to both, we let the socket listener handle it.
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    sendMessageMutation.mutate(newMessage);
    setNewMessage("");
  };

  const selectChat = (id) => {
    navigate(`/messages/${id}`);
    queryClient.invalidateQueries(['conversations']);
  };

  return (
    <div className="messages-container">
      {/* Sidebar / Contacts */}
      <div className={`messages-sidebar glass ${userId ? 'messages-sidebar-hidden' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Messages</h2>
        </div>
        <div className="contacts-list">
          {loadingConversations ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : conversations.map(contact => (
            <button
              key={contact.id}
              onClick={() => selectChat(contact.id)}
              className={`contact-button ${userId === contact.id ? 'contact-button-active' : ''}`}
            >
              <div className="contact-avatar">
                {contact.avatar_url ? <img src={contact.avatar_url} alt="" /> : contact.name?.charAt(0) || 'U'}
              </div>
              <div className="contact-info">
                <p className="contact-name">{contact.name}</p>
                <p className="contact-roll">{contact.roll_no}</p>
              </div>
              {contact.unread_count > 0 && userId !== contact.id && (
                <div className="unread-badge">{contact.unread_count}</div>
              )}
            </button>
          ))}
          {!loadingConversations && conversations.length === 0 && (
            <div className="no-contacts">No peers found in your college yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {userId ? (
        <div className={`chat-area glass ${!userId ? 'chat-area-hidden' : ''}`}>
          {/* Chat Header */}
          <div className="chat-header">
            <button className="back-button" onClick={() => navigate('/messages')}>
              &larr; Back
            </button>
            <div className="chat-avatar">
              {targetProfile?.avatar_url ? (
                <img src={targetProfile.avatar_url} alt="" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
              ) : targetProfile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="chat-name">{targetProfile?.name || 'Loading...'}</h3>
              <p className="chat-status">{targetProfile ? 'Campus Chat' : '...'}</p>
            </div>
          </div>

          <div className="messages-list">
            {loadingMessages ? (
               <div className="text-center p-4 text-slate-500">Loading messages...</div>
            ) : messages.length === 0 ? (
               <div className="text-center p-4 text-slate-500">No messages yet. Say hi!</div>
            ) : (
               messages.map((msg, idx) => {
                 const isMine = msg.sender_id === currentUser?.id;
                 return (
                   <div key={msg._id || msg.id || idx} className={`message-wrapper ${isMine ? 'message-wrapper-mine' : 'message-wrapper-other'}`}>
                     <div className={`message-bubble ${isMine ? 'message-bubble-mine' : 'message-bubble-other'}`}>
                       <p className="message-text">{msg.content}</p>
                       <p className={`message-time ${isMine ? 'message-time-mine' : 'message-time-other'}`}>
                         {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : 'just now'}
                       </p>
                     </div>
                   </div>
                 );
               })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button
                type="submit" disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                className="send-button"
              >
                <Send className="send-icon" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="chat-placeholder glass">
          <MessageSquare className="chat-placeholder-icon" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
