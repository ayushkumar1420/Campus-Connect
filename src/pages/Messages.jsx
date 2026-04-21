import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { useLocation } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import "./Messages.css";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const initialTargetId = location.state?.targetUserId;

  useEffect(() => {
    const init = async () => {
      const user = await api.auth.getUser();
      if (user) {
        setCurrentUser(user);
        loadConversations();
      }
    };
    init();
  }, []);

  const loadConversations = async () => {
    try {
      const peers = await api.getPeers();
      setConversations(peers);

      if (initialTargetId) {
        const target = await api.getProfile(initialTargetId);
        if (target) setActiveChat(target);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let int;
    if (currentUser && activeChat) {
      fetchMessages();
      int = setInterval(fetchMessages, 2000); // Poll messages
    }
    return () => clearInterval(int);
  }, [activeChat, currentUser]);

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const msgs = await api.getMessages(activeChat.id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await api.sendMessage({
        receiver_id: activeChat.id,
        content: newMessage
      });
      setNewMessage("");
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="messages-container">
      {/* Sidebar / Contacts */}
      <div className={`messages-sidebar glass ${activeChat ? 'messages-sidebar-hidden' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            Messages
          </h2>
        </div>
        <div className="contacts-list">
          {conversations.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact)}
              className={`contact-button ${activeChat?.id === contact.id ? 'contact-button-active' : ''}`}
            >
              <div className="contact-avatar">
                {contact.avatar_url ? <img src={contact.avatar_url} alt="" /> : contact.name?.charAt(0) || 'U'}
              </div>
              <div className="contact-info">
                <p className="contact-name">{contact.name}</p>
                <p className="contact-roll">{contact.roll_no}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="no-contacts">No peers found in your college yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeChat ? (
        <div className={`chat-area glass ${!activeChat ? 'chat-area-hidden' : ''}`}>
          {/* Chat Header */}
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

          {/* Messages List */}
          <div className="messages-list">
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id || idx} className={`message-wrapper ${isMine ? 'message-wrapper-mine' : 'message-wrapper-other'}`}>
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

          {/* Input Box */}
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
                type="submit" disabled={!newMessage.trim()}
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
