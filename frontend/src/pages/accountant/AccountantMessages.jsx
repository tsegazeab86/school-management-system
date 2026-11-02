
import  { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  Send,
  Trash2,
  Mail,
  MailOpen,
  User,
  Clock,
  Plus,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import "./AccountantMessages.css";

const initialMessages = [
  {
    id: 1,
    sender: "Abebe Kebede",
    role: "Parent",
    subject: "Payment confirmation request",
    message:
      "Hello Accountant, I paid the school fee for my child. Could you please confirm whether the payment has been recorded?",
    date: "2026-10-30",
    time: "09:30 AM",
    unread: true,
    replies: [],
  },
  {
    id: 2,
    sender: "Mekdes Alemu",
    role: "Student",
    subject: "Outstanding fee information",
    message:
      "Good morning. I would like to know the remaining balance on my school fee account.",
    date: "2026-10-29",
    time: "11:15 AM",
    unread: true,
    replies: [],
  },
  {
    id: 3,
    sender: "Dawit Tesfaye",
    role: "Teacher",
    subject: "Class activity budget",
    message:
      "Please let me know the process for requesting a budget for our upcoming class activity.",
    date: "2026-10-28",
    time: "02:20 PM",
    unread: false,
    replies: [],
  },
  {
    id: 4,
    sender: "Sara Getachew",
    role: "Parent",
    subject: "Receipt copy",
    message:
      "I need another copy of the receipt for the payment made last week. Thank you.",
    date: "2026-10-27",
    time: "10:00 AM",
    unread: false,
    replies: [],
  },
  {
    id: 5,
    sender: "School Administrator",
    role: "Administrator",
    subject: "Monthly financial report",
    message:
      "Please prepare the monthly financial report and share it with the administration office.",
    date: "2026-10-25",
    time: "08:45 AM",
    unread: false,
    replies: [],
  },
];

export default function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [replyText, setReplyText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [notice, setNotice] = useState("");

  const unreadCount = messages.filter((message) => message.unread).length;

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesSearch =
        message.sender.toLowerCase().includes(search.toLowerCase()) ||
        message.subject.toLowerCase().includes(search.toLowerCase()) ||
        message.message.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && message.unread) ||
        (filter === "Read" && !message.unread);

      return matchesSearch && matchesFilter;
    });
  }, [messages, search, filter]);

  const openMessage = (message) => {
    setSelectedMessage(message);
    setShowCompose(false);

    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? { ...item, unread: false } : item
      )
    );
  };

  const sendReply = (event) => {
    event.preventDefault();

    if (!replyText.trim() || !selectedMessage) return;

    const reply = {
      text: replyText.trim(),
      date: new Date().toLocaleString(),
    };

    setMessages((previous) =>
      previous.map((item) =>
        item.id === selectedMessage.id
          ? { ...item, replies: [...item.replies, reply] }
          : item
      )
    );

    setSelectedMessage((previous) => ({
      ...previous,
      replies: [...previous.replies, reply],
    }));

    setReplyText("");
    setNotice("Reply saved in this demonstration.");
  };

  const sendNewMessage = (event) => {
    event.preventDefault();

    if (!composeTo.trim() || !composeSubject.trim() || !composeMessage.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "You",
      role: "Accountant",
      subject: composeSubject.trim(),
      message: `To: ${composeTo.trim()}\n${composeMessage.trim()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: false,
      replies: [],
    };

    setMessages((previous) => [newMessage, ...previous]);
    setComposeTo("");
    setComposeSubject("");
    setComposeMessage("");
    setShowCompose(false);
    setSelectedMessage(newMessage);
    setNotice("Message saved in this demonstration.");
  };

  const toggleRead = (id) => {
    setMessages((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item
      )
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage((previous) => ({
        ...previous,
        unread: !previous.unread,
      }));
    }
  };

  const deleteMessage = (id) => {
    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;

    setMessages((previous) => previous.filter((item) => item.id !== id));
    setSelectedMessage(null);
    setNotice("Message deleted.");
  };

  const closeDetail = () => {
    setSelectedMessage(null);
    setShowCompose(false);
    setNotice("");
  };

  return (
    <div className="accountant-messages container-fluid">
      <div className="messages-header">
        <div>
          <h2>Messages</h2>
          <p>Communicate with parents, students, and school staff.</p>
        </div>

        <button
          className="message-compose-btn"
          onClick={() => {
            setSelectedMessage(null);
            setShowCompose(true);
            setNotice("");
          }}
        >
          <Plus size={18} /> Compose Message
        </button>
      </div>

      <div className="row g-3 message-summary">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="message-summary-card">
            <div className="message-summary-icon purple">
              <Inbox size={22} />
            </div>
            <div>
              <span>Total Messages</span>
              <h3>{messages.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="message-summary-card">
            <div className="message-summary-icon orange">
              <Mail size={22} />
            </div>
            <div>
              <span>Unread Messages</span>
              <h3>{unreadCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="message-summary-card">
            <div className="message-summary-icon green">
              <MailOpen size={22} />
            </div>
            <div>
              <span>Read Messages</span>
              <h3>{messages.length - unreadCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="message-notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}

      <div className="messages-workspace">
        <div className="messages-inbox">
          <div className="inbox-heading">
            <div>
              <h4>Inbox</h4>
              <span>{filteredMessages.length} messages</span>
            </div>
            <MessageCircle size={21} />
          </div>

          <div className="message-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="message-filters">
            {["All", "Unread", "Read"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="message-list">
            {filteredMessages.map((message) => (
              <motion.button
                whileHover={{ x: 3 }}
                key={message.id}
                className={`message-list-item ${
                  selectedMessage?.id === message.id ? "selected" : ""
                } ${message.unread ? "unread" : ""}`}
                onClick={() => openMessage(message)}
              >
                <div className="message-avatar">
                  {message.sender.charAt(0).toUpperCase()}
                </div>

                <div className="message-list-content">
                  <div className="message-list-top">
                    <strong>{message.sender}</strong>
                    <span>{message.date.slice(5)}</span>
                  </div>
                  <div className="message-list-subject">
                    {message.subject}
                  </div>
                  <p>{message.message.split("\n").pop()}</p>
                  <span className="message-role">{message.role}</span>
                </div>

                {message.unread && (
                  <span className="message-unread-dot" />
                )}
              </motion.button>
            ))}

            {filteredMessages.length === 0 && (
              <div className="message-empty">
                <Inbox size={35} />
                <p>No messages found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="message-detail">
          {showCompose ? (
            <form className="compose-form" onSubmit={sendNewMessage}>
              <div className="detail-heading">
                <div>
                  <h4>Compose Message</h4>
                  <p>Create a new message.</p>
                </div>
                <button
                  type="button"
                  className="message-back-btn"
                  onClick={closeDetail}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              </div>

              <label>Recipient</label>
              <select
                className="form-select"
                value={composeTo}
                onChange={(event) => setComposeTo(event.target.value)}
                required
              >
                <option value="">Select recipient</option>
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Administrator">Administrator</option>
              </select>

              <label>Subject</label>
              <input
                className="form-control"
                value={composeSubject}
                onChange={(event) => setComposeSubject(event.target.value)}
                placeholder="Enter message subject"
                required
              />

              <label>Message</label>
              <textarea
                className="form-control compose-textarea"
                value={composeMessage}
                onChange={(event) => setComposeMessage(event.target.value)}
                placeholder="Write your message..."
                rows="7"
                required
              />

              <button className="message-send-btn" type="submit">
                <Send size={17} /> Save Message
              </button>
            </form>
          ) : selectedMessage ? (
            <>
              <div className="detail-heading">
                <div>
                  <h4>Message Details</h4>
                  <p>Read and reply to this message.</p>
                </div>
                <button
                  className="message-back-btn"
                  onClick={closeDetail}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              </div>

              <div className="message-detail-title">
                <h3>{selectedMessage.subject}</h3>
                <span className="message-detail-date">
                  <Clock size={14} /> {selectedMessage.date} ·{" "}
                  {selectedMessage.time}
                </span>
              </div>

              <div className="message-sender-info">
                <div className="message-avatar large">
                  {selectedMessage.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedMessage.sender}</strong>
                  <span>{selectedMessage.role}</span>
                </div>
              </div>

              <div className="message-body">
                {selectedMessage.message}
              </div>

              {selectedMessage.replies.length > 0 && (
                <div className="message-replies">
                  <h5>Replies</h5>
                  {selectedMessage.replies.map((reply, index) => (
                    <div className="message-reply-item" key={index}>
                      <strong>Accountant</strong>
                      <p>{reply.text}</p>
                      <small>{reply.date}</small>
                    </div>
                  ))}
                </div>
              )}

              <form className="message-reply-form" onSubmit={sendReply}>
                <label>Write a reply</label>
                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Type your reply here..."
                  rows="4"
                  required
                />

                <div className="message-detail-actions">
                  <button
                    type="submit"
                    className="message-send-btn"
                  >
                    <Send size={16} /> Save Reply
                  </button>

                  <button
                    type="button"
                    className="message-action-btn"
                    onClick={() => toggleRead(selectedMessage.id)}
                  >
                    {selectedMessage.unread ? (
                      <><MailOpen size={16} /> Mark as Read</>
                    ) : (
                      <><Mail size={16} /> Mark as Unread</>
                    )}
                  </button>

                  <button
                    type="button"
                    className="message-delete-btn"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="message-welcome">
              <div className="message-welcome-icon">
                <MessageCircle size={38} />
              </div>
              <h3>Select a message</h3>
              <p>
                Choose a message from your inbox to read its details and reply.
              </p>
              <span><User size={15} /> Accountant communication center</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
