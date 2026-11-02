import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Inbox,
  Send,
  Mail,
  MailOpen,
  Trash2,
  Reply,
  X,
  ArrowLeft,
  Paperclip,
  MessageCircle,
  //   CheckCheck,
  //   User,
  Clock,
} from "lucide-react";
import "./LibrarianMessages.css";

const initialMessages = [
  {
    id: 1,
    sender: "Abebe Kebede",
    email: "abebe@student.com",
    recipient: "Librarian",
    subject: "Request for Mathematics Book",
    message:
      "Hello, I would like to borrow an additional Mathematics textbook for my study. Please let me know if a copy is available.",
    date: "2026-10-31 08:30",
    unread: true,
    folder: "inbox",
    starred: true,
  },
  {
    id: 2,
    sender: "Sara Alemu",
    email: "sara@student.com",
    recipient: "Librarian",
    subject: "Returning a Library Book",
    message:
      "I want to inform you that I will return my borrowed book tomorrow. Thank you.",
    date: "2026-10-30 14:15",
    unread: true,
    folder: "inbox",
    starred: false,
  },
  {
    id: 3,
    sender: "School Administrator",
    email: "admin@school.com",
    recipient: "Librarian",
    subject: "Monthly Library Report",
    message:
      "Please prepare the monthly library report and submit it to the administration office.",
    date: "2026-10-29 10:00",
    unread: false,
    folder: "inbox",
    starred: false,
  },
  {
    id: 4,
    sender: "Librarian",
    email: "library@school.com",
    recipient: "School Administrator",
    subject: "New Books Received",
    message:
      "The library has received new books. The book records have been updated.",
    date: "2026-10-28 09:20",
    unread: false,
    folder: "sent",
    starred: false,
  },
];

function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const matchesFolder = item.folder === activeFolder;
      const matchesSearch =
        item.sender.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());

      return matchesFolder && matchesSearch;
    });
  }, [messages, activeFolder, search]);

  const inboxCount = messages.filter(
    (item) => item.folder === "inbox" && item.unread
  ).length;

  const openMessage = (message) => {
    const updatedMessage = { ...message, unread: false };

    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? updatedMessage : item
      )
    );

    setSelectedMessage(updatedMessage);
  };

  const handleCompose = (event) => {
    event.preventDefault();

    if (
      !form.recipient.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      window.alert("Please complete all fields.");
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "Librarian",
      email: "library@school.com",
      recipient: form.recipient,
      subject: form.subject,
      message: form.message,
      date: new Date().toLocaleString(),
      unread: false,
      folder: "sent",
      starred: false,
    };

    setMessages((previous) => [newMessage, ...previous]);
    setForm({ recipient: "", subject: "", message: "" });
    setShowCompose(false);
    setActiveFolder("sent");
  };

  const deleteMessage = (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setMessages((previous) => previous.filter((item) => item.id !== id));
    setSelectedMessage(null);
  };

  const toggleStar = (id) => {
    setMessages((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage((previous) => ({
        ...previous,
        starred: !previous.starred,
      }));
    }
  };

  const sendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    const reply = {
      id: Date.now(),
      sender: "Librarian",
      email: "library@school.com",
      recipient: selectedMessage.sender,
      subject: `Re: ${selectedMessage.subject}`,
      message: replyText,
      date: new Date().toLocaleString(),
      unread: false,
      folder: "sent",
      starred: false,
    };

    setMessages((previous) => [reply, ...previous]);
    setReplyText("");
    window.alert("Reply added to your Sent folder.");
  };

  return (
    <div className="lib-messages-page">
      <div className="lib-message-header">
        <div>
          <span className="lib-message-eyebrow">LIBRARY COMMUNICATION</span>
          <h1>Messages</h1>
          <p>Communicate with students, teachers, and school administrators.</p>
        </div>

        <button
          className="lib-compose-btn"
          onClick={() => setShowCompose(true)}
        >
          <Plus size={19} />
          Compose Message
        </button>
      </div>

      <div className="lib-message-stats">
        <div className="lib-message-stat">
          <div className="lib-stat-icon purple">
            <Inbox size={22} />
          </div>
          <div>
            <span>Total Inbox</span>
            <h3>{messages.filter((m) => m.folder === "inbox").length}</h3>
          </div>
        </div>

        <div className="lib-message-stat">
          <div className="lib-stat-icon orange">
            <Mail size={22} />
          </div>
          <div>
            <span>Unread Messages</span>
            <h3>{inboxCount}</h3>
          </div>
        </div>

        <div className="lib-message-stat">
          <div className="lib-stat-icon green">
            <Send size={22} />
          </div>
          <div>
            <span>Sent Messages</span>
            <h3>{messages.filter((m) => m.folder === "sent").length}</h3>
          </div>
        </div>
      </div>

      <div className="lib-message-workspace">
        <aside className="lib-message-sidebar">
          <button
            className={activeFolder === "inbox" ? "active" : ""}
            onClick={() => {
              setActiveFolder("inbox");
              setSelectedMessage(null);
            }}
          >
            <Inbox size={19} />
            <span>Inbox</span>
            {inboxCount > 0 && <b>{inboxCount}</b>}
          </button>

          <button
            className={activeFolder === "sent" ? "active" : ""}
            onClick={() => {
              setActiveFolder("sent");
              setSelectedMessage(null);
            }}
          >
            <Send size={19} />
            <span>Sent</span>
          </button>

          <div className="lib-message-sidebar-note">
            <MessageCircle size={23} />
            <strong>Stay connected</strong>
            <p>Use messages to communicate about library activities.</p>
          </div>
        </aside>

        <section className="lib-message-content">
          <div className="lib-message-toolbar">
            <div>
              <h2>{activeFolder === "inbox" ? "Inbox" : "Sent Messages"}</h2>
              <span>{filteredMessages.length} messages</span>
            </div>

            <div className="lib-message-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {selectedMessage ? (
            <div className="lib-message-detail">
              <div className="lib-detail-top">
                <button
                  className="lib-back-btn"
                  onClick={() => setSelectedMessage(null)}
                >
                  <ArrowLeft size={18} />
                  Back to {activeFolder}
                </button>

                <button
                  className="lib-delete-btn"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>

              <div className="lib-detail-subject">
                <h2>{selectedMessage.subject}</h2>
                <button
                  className={`lib-star-btn ${selectedMessage.starred ? "starred" : ""
                    }`}
                  onClick={() => toggleStar(selectedMessage.id)}
                  title="Toggle important"
                >
                  ★
                </button>
              </div>

              <div className="lib-detail-sender">
                <div className="lib-avatar">
                  {selectedMessage.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedMessage.sender}</strong>
                  <span>{selectedMessage.email}</span>
                </div>
                <small>
                  <Clock size={14} />
                  {selectedMessage.date}
                </small>
              </div>

              <div className="lib-detail-body">
                <p>{selectedMessage.message}</p>
              </div>

              {activeFolder === "inbox" && (
                <div className="lib-reply-box">
                  <label>Reply to this message</label>
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write your reply..."
                    rows="4"
                  />
                  <button
                    className="lib-compose-btn"
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                  >
                    <Reply size={17} />
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="lib-message-list">
              {filteredMessages.length === 0 ? (
                <div className="lib-empty-messages">
                  <MailOpen size={42} />
                  <h3>No messages found</h3>
                  <p>Try another search or select a different folder.</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    className={`lib-message-row ${message.unread ? "unread" : ""
                      }`}
                    key={message.id}
                  >
                    <button
                      className="lib-message-star"
                      onClick={() => toggleStar(message.id)}
                      title="Toggle important"
                    >
                      {message.starred ? "★" : "☆"}
                    </button>

                    <button
                      className="lib-message-main"
                      onClick={() => openMessage(message)}
                    >
                      <div className="lib-message-avatar">
                        {message.sender.charAt(0).toUpperCase()}
                      </div>

                      <div className="lib-message-text">
                        <strong>{message.sender}</strong>
                        <span>{message.subject}</span>
                        <p>{message.message}</p>
                      </div>

                      <div className="lib-message-meta">
                        <small>{message.date}</small>
                        {message.unread && (
                          <span className="lib-unread-label">Unread</span>
                        )}
                      </div>
                    </button>

                    <button
                      className="lib-row-delete"
                      onClick={() => deleteMessage(message.id)}
                      title="Delete message"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {showCompose && (
        <div
          className="lib-modal-overlay"
          onClick={() => setShowCompose(false)}
        >
          <div
            className="lib-compose-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lib-modal-header">
              <div>
                <h2>Compose Message</h2>
                <p>Write a new message to a school member.</p>
              </div>
              <button
                onClick={() => setShowCompose(false)}
                className="lib-modal-close"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleCompose}>
              <label>Recipient</label>
              <select
                value={form.recipient}
                onChange={(event) =>
                  setForm({ ...form, recipient: event.target.value })
                }
                required
              >
                <option value="">Select recipient</option>
                <option value="School Administrator">
                  School Administrator
                </option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="Accountant">Accountant</option>
              </select>

              <label>Subject</label>
              <input
                type="text"
                placeholder="Enter message subject"
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                required
              />

              <label>Message</label>
              <textarea
                rows="6"
                placeholder="Write your message here..."
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
                required
              />

              <div className="lib-compose-footer">
                <span>
                  <Paperclip size={15} /> Attachments not available yet
                </span>
                <button type="submit" className="lib-compose-btn">
                  <Send size={17} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;