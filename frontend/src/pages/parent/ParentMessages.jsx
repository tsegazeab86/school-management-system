
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  Send,
  Paperclip,
  MoreVertical,
//   Phone,
//   Video,
//   ArrowLeft,
  UserRound,
  CheckCheck,
  Plus,
  X,
} from "lucide-react";
import "./ParentMessages.css";

const initialConversations = [
  {
    id: 1,
    teacher: "Mr. Daniel Kebede",
    subject: "Mathematics Teacher",
    avatar: "DK",
    child: "Abebe Tadesse",
    unread: 2,
    messages: [
      {
        id: 1,
        sender: "teacher",
        text: "Good morning. I wanted to discuss Abebe's recent mathematics performance.",
        time: "09:15 AM",
      },
      {
        id: 2,
        sender: "parent",
        text: "Good morning, thank you for informing me.",
        time: "09:20 AM",
      },
      {
        id: 3,
        sender: "teacher",
        text: "He is doing well, but he needs to practice algebra more regularly.",
        time: "09:25 AM",
      },
    ],
  },
  {
    id: 2,
    teacher: "Mrs. Sara Alemu",
    subject: "Class Teacher - Grade 7",
    avatar: "SA",
    child: "Hana Tadesse",
    unread: 1,
    messages: [
      {
        id: 1,
        sender: "teacher",
        text: "Hello. Hana has shown good improvement in classroom participation.",
        time: "Yesterday",
      },
      {
        id: 2,
        sender: "parent",
        text: "Thank you for the update.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 3,
    teacher: "Mr. Michael Tesfaye",
    subject: "English Teacher",
    avatar: "MT",
    child: "Abebe Tadesse",
    unread: 0,
    messages: [
      {
        id: 1,
        sender: "teacher",
        text: "Please remind Abebe to complete the English assignment.",
        time: "Monday",
      },
    ],
  },
];

function ParentMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newTeacher, setNewTeacher] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newChild, setNewChild] = useState("Abebe Tadesse");

  const activeConversation = conversations.find(
    (item) => item.id === activeId
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) =>
      `${item.teacher} ${item.subject} ${item.child}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const totalUnread = conversations.reduce(
    (total, item) => total + item.unread,
    0
  );

  const selectConversation = (id) => {
    setActiveId(id);
    setConversations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, unread: 0 } : item
      )
    );
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !activeConversation) return;

    const newMessage = {
      id: Date.now(),
      sender: "parent",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversations((previous) =>
      previous.map((item) =>
        item.id === activeId
          ? { ...item, messages: [...item.messages, newMessage] }
          : item
      )
    );

    setMessage("");
  };

  const createConversation = (e) => {
    e.preventDefault();

    if (!newTeacher.trim() || !newSubject.trim()) return;

    const newConversation = {
      id: Date.now(),
      teacher: newTeacher.trim(),
      subject: newSubject.trim(),
      avatar: newTeacher
        .trim()
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      child: newChild,
      unread: 0,
      messages: [],
    };

    setConversations((previous) => [
      newConversation,
      ...previous,
    ]);

    setActiveId(newConversation.id);
    setNewTeacher("");
    setNewSubject("");
    setShowNewMessage(false);
  };

  return (
    <div className="parent-messages-page">
      <div className="messages-page-header">
        <div>
          <span className="messages-eyebrow">PARENT PORTAL</span>
          <h2>Messages</h2>
          <p>Communicate with your children's teachers.</p>
        </div>

        <div className="messages-header-icon">
          <MessageCircle size={30} />
        </div>
      </div>

      <div className="messages-summary">
        <div className="message-summary-card">
          <div className="summary-icon blue">
            <MessageCircle size={23} />
          </div>
          <div>
            <h3>{conversations.length}</h3>
            <p>Total Conversations</p>
          </div>
        </div>

        <div className="message-summary-card">
          <div className="summary-icon orange">
            <MessageCircle size={23} />
          </div>
          <div>
            <h3>{totalUnread}</h3>
            <p>Unread Messages</p>
          </div>
        </div>

        <div className="message-summary-card">
          <div className="summary-icon green">
            <CheckCheck size={23} />
          </div>
          <div>
            <h3>
              {conversations.reduce(
                (total, item) => total + item.messages.length,
                0
              )}
            </h3>
            <p>Total Messages</p>
          </div>
        </div>
      </div>

      <div className="messages-workspace">
        {/* Conversation Sidebar */}
        <aside className="conversation-sidebar">
          <div className="conversation-sidebar-header">
            <div>
              <h4>Conversations</h4>
              <span>{conversations.length} contacts</span>
            </div>

            <button
              className="new-conversation-btn"
              onClick={() => setShowNewMessage(true)}
              title="New conversation"
            >
              <Plus size={19} />
            </button>
          </div>

          <div className="conversation-search">
            <Search size={17} />
            <input
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <p className="no-conversations">
                No conversations found.
              </p>
            ) : (
              filteredConversations.map((item) => {
                const lastMessage =
                  item.messages[item.messages.length - 1];

                return (
                  <button
                    key={item.id}
                    className={`conversation-item ${
                      activeId === item.id ? "active" : ""
                    }`}
                    onClick={() => selectConversation(item.id)}
                  >
                    <div className="teacher-avatar">
                      {item.avatar}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-name-row">
                        <strong>{item.teacher}</strong>
                        {item.unread > 0 && (
                          <span className="unread-count">
                            {item.unread}
                          </span>
                        )}
                      </div>

                      <p>{item.subject}</p>
                      <span className="last-message">
                        {lastMessage?.text || "No messages yet"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="chat-area">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-teacher-info">
                  <div className="teacher-avatar large">
                    {activeConversation.avatar}
                  </div>

                  <div>
                    <h4>{activeConversation.teacher}</h4>
                    <p>{activeConversation.subject}</p>
                  </div>
                </div>

                <div className="chat-actions">
                  <span>
                    <UserRound size={15} />
                    {activeConversation.child}
                  </span>
                  <button
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                <div className="chat-date-divider">
                  <span>Conversation</span>
                </div>

                {activeConversation.messages.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`chat-message ${
                      item.sender === "parent"
                        ? "parent-message"
                        : "teacher-message"
                    }`}
                  >
                    <div className="message-bubble">
                      <p>{item.text}</p>
                      <span>
                        {item.time}
                        {item.sender === "parent" && (
                          <CheckCheck size={14} />
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {activeConversation.messages.length === 0 && (
                  <div className="empty-chat">
                    <MessageCircle size={40} />
                    <h4>Start a conversation</h4>
                    <p>Send a message to this teacher.</p>
                  </div>
                )}
              </div>

              <form
                className="chat-input-area"
                onSubmit={sendMessage}
              >
                <button
                  type="button"
                  className="attachment-btn"
                  title="Attachments are not enabled yet"
                  disabled
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button
                  type="submit"
                  className="send-message-btn"
                  disabled={!message.trim()}
                >
                  <Send size={19} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <MessageCircle size={45} />
              <h4>Select a conversation</h4>
              <p>Choose a teacher from the conversation list.</p>
            </div>
          )}
        </section>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            className="new-message-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewMessage(false)}
          >
            <motion.div
              className="new-message-modal"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="new-message-modal-header">
                <h3>New Conversation</h3>
                <button
                  type="button"
                  onClick={() => setShowNewMessage(false)}
                  aria-label="Close"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={createConversation}>
                <label>Teacher Name</label>
                <input
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="Enter teacher name"
                  required
                />

                <label>Subject / Role</label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Example: Mathematics Teacher"
                  required
                />

                <label>Child</label>
                <select
                  value={newChild}
                  onChange={(e) => setNewChild(e.target.value)}
                >
                  <option>Abebe Tadesse</option>
                  <option>Hana Tadesse</option>
                </select>

                <button type="submit" className="create-conversation-btn">
                  Create Conversation
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ParentMessages;
