import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { useLocation } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    const user = api.auth.getUser();
    if (user) {
      setCurrentUser(user);
      loadConversations();
    }
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
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex gap-4">
      {/* Sidebar / Contacts */}
      <div className={`w-full md:w-80 glass rounded-2xl flex flex-col overflow-hidden ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact)}
              className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-white/5 border-b border-white/5 ${activeChat?.id === contact.id ? 'bg-indigo-500/20' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                {contact.avatar_url ? <img src={contact.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : contact.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="font-medium text-slate-100 truncate">{contact.name}</p>
                <p className="text-xs text-slate-400 truncate">{contact.roll_no}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">No peers found in your college yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeChat ? (
        <div className={`flex-1 glass rounded-2xl flex flex-col overflow-hidden ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <button className="md:hidden text-indigo-400 mr-2" onClick={() => setActiveChat(null)}>
              &larr; Back
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              {activeChat.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-medium">{activeChat.name}</h3>
              <p className="text-xs text-slate-400">Campus Chat</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
                    }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : 'just now'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <form onSubmit={sendMessage} className="flex gap-2 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
              />
              <button
                type="submit" disabled={!newMessage.trim()}
                className="absolute right-1 top-1 bottom-1 w-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 glass rounded-2xl items-center justify-center flex-col text-slate-500">
          <MessageSquare className="w-16 h-16 mb-4 opacity-50 text-indigo-400" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
