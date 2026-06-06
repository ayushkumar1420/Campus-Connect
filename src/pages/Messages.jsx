import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { useLocation } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../hooks/useSocket";
import "./Messages.css";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const initialTargetId = location.state?.targetUserId;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getUser()
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getPeers()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', activeChat?.id],
    queryFn: () => api.getMessages(activeChat.id),
    enabled: !!activeChat?.id,
    refetchInterval: false // Disabling polling
  });

  useEffect(() => {
    if (initialTargetId && conversations.length > 0 && !activeChat) {
      const target = conversations.find(c => c.id === initialTargetId) || { id: initialTargetId };
      if (!target.name) {
        api.getUserProfile(initialTargetId).then(p => {
          setActiveChat({ id: p._id, name: p.name, avatar_url: p.avatar_url, roll_no: p.roll_no });
        });
      } else {
        setActiveChat(target);
      }
    }
  }, [initialTargetId, conversations, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg) => {
      // Invalidate both conversations (for badges) and active messages
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['messages', msg.sender_id]);
      queryClient.invalidateQueries(['messages', msg.receiver_id]);
    };

    socket.on('NEW_MESSAGE', handleNewMessage);
    
    return () => {
      socket.off('NEW_MESSAGE', handleNewMessage);
    };
  }, [socket, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.sendMessage({
      receiver_id: activeChat.id,
      content
    }),
    onSuccess: (newMsg) => {
      queryClient.setQueryData(['messages', activeChat.id], (old) => [...(old || []), newMsg]);
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    sendMessageMutation.mutate(newMessage);
    setNewMessage("");
  };

  return (
    <div className="messages-container">
      {/* Sidebar / Contacts */}
      <div className={`messages-sidebar glass ${activeChat ? 'messages-sidebar-hidden' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Messages</h2>
        </div>
        <div className="contacts-list">
          {loadingConversations ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : conversations.map(contact => (
            <button
              key={contact.id}
              onClick={() => {
                setActiveChat(contact);
                // Invalidate conversations to immediately clear badge on next fetch
                queryClient.invalidateQueries(['conversations']);
              }}
              className={`contact-button ${activeChat?.id === contact.id ? 'contact-button-active' : ''}`}
            >
              <div className="contact-avatar">
                {contact.avatar_url ? <img src={contact.avatar_url} alt="" /> : contact.name?.charAt(0) || 'U'}
              </div>
              <div className="contact-info">
                <p className="contact-name">{contact.name}</p>
                <p className="contact-roll">{contact.roll_no}</p>
              </div>
              {contact.unread_count > 0 && activeChat?.id !== contact.id && (
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
      {activeChat ? (
        <div className={`chat-area glass ${!activeChat ? 'chat-area-hidden' : ''}`}>
          <div className="chat-header">
            <button className="back-button" onClick={() => setActiveChat(null)}>
              &larr; Back
            </button>
            <div className="chat-avatar">
              {activeChat.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="chat-name">{activeChat.name}</h3>
              <p className="chat-status">Campus Chat</p>
            </div>
          </div>

          <div className="messages-list">
            {messages.map((msg, idx) => {
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
            })}
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
