
import   { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Send,
  Inbox,
  Mail,
  MailOpen,
  Star,
  Trash2,
  Reply,
  X,
  Paperclip,
  MessageCircle,
//   UserRound,
//   Clock,
  ArrowLeft,
  MoreVertical,
  CheckCheck,
  GraduationCap,
} from "lucide-react";
import "./StudentMessages.css";

const initialMessages = [
  {
    id: 1,
    sender: "Dr. Michael Bekele",
    email: "michael.bekele@school.edu",
    subject: "Your Database Assignment Feedback",
    message:
      "Hello Student,\n\nI have reviewed your database assignment. Your table relationships and SQL queries are good. Please review the feedback and make sure you understand normalization before the next class.\n\nKeep up the good work!\n\nBest regards,\nDr. Michael",
    date: "2026-10-31T08:30:00",
    category: "Academic",
    read: false,
    starred: true,
    folder: "inbox",
  },
  {
    id: 2,
    sender: "Registrar Office",
    email: "registrar@school.edu",
    subject: "Semester Registration Information",
    message:
      "Dear Student,\n\nPlease check your semester registration information in the student portal. If any of your details are incorrect, contact the Registrar Office during working hours.\n\nThank you.",
    date: "2026-10-30T14:15:00",
    category: "Official",
    read: false,
    starred: false,
    folder: "inbox",
  },
  {
    id: 3,
    sender: "Abebe Tadesse",
    email: "abebe.t@school.edu",
    subject: "Computer Science Group Project",
    message:
      "Hi,\n\nAre you available to discuss our group project this afternoon? We need to finalize the project structure and divide the remaining tasks.\n\nLet me know what time works for you.",
    date: "2026-10-29T10:45:00",
    category: "Personal",
    read: true,
    starred: false,
    folder: "inbox",
  },
  {
    id: 4,
    sender: "Computer Science Department",
    email: "cs.department@school.edu",
    subject: "Programming Laboratory Schedule",
    message:
      "Students are informed that the programming laboratory schedule has been updated. Please check your timetable for the latest information.",
    date: "2026-10-28T09:00:00",
    category: "Academic",
    read: true,
    starred: true,
    folder: "inbox",
  },
  {
    id: 5,
    sender: "Student",
    email: "student@school.edu",
    subject: "Question About Project Submission",
    message:
      "Dear Instructor,\n\nI would like to ask whether we should submit the project report as a PDF file or a Word document.\n\nThank you for your help.",
    date: "2026-10-31T09:10:00",
    category: "Academic",
    read: true,
    starred: false,
    folder: "sent",
  },
];

const categories = ["All", "Academic", "Official", "Personal"];

function formatMessageDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function StudentMessages() {
  const [messages, setMessages] = useState(initialMessages);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    category: "Academic",
    message: "",
  });

  const [formError, setFormError] = useState("");

  const inboxCount = messages.filter(
    (message) => message.folder === "inbox"
  ).length;

  const sentCount = messages.filter(
    (message) => message.folder === "sent"
  ).length;

  const unreadCount = messages.filter(
    (message) => message.folder === "inbox" && !message.read
  ).length;

  const starredCount = messages.filter(
    (message) => message.folder === activeFolder && message.starred
  ).length;

  const visibleMessages = useMemo(() => {
    return messages
      .filter((message) => message.folder === activeFolder)
      .filter((message) => {
        const searchText =
          `${message.sender} ${message.subject} ${message.message}`.toLowerCase();

        return searchText.includes(search.toLowerCase());
      })
      .filter(
        (message) =>
          activeCategory === "All" ||
          message.category === activeCategory
      )
      .filter((message) => {
        if (activeFilter === "Unread") return !message.read;
        if (activeFilter === "Starred") return message.starred;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [messages, activeFolder, search, activeCategory, activeFilter]);

  const updateMessage = (id, changes) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id ? { ...message, ...changes } : message
      )
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage((previous) => ({ ...previous, ...changes }));
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    setMobileDetail(true);

    if (message.folder === "inbox" && !message.read) {
      updateMessage(message.id, { read: true });
    }
  };

  const deleteMessage = (id) => {
    setMessages((previous) =>
      previous.filter((message) => message.id !== id)
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
      setMobileDetail(false);
    }
  };

  const toggleStar = (event, message) => {
    event.stopPropagation();
    updateMessage(message.id, { starred: !message.starred });
  };

  const openComposer = (replyMessage = null) => {
    setForm({
      recipient: replyMessage ? replyMessage.email : "",
      subject: replyMessage
        ? `Re: ${replyMessage.subject}`
        : "",
      category: replyMessage ? replyMessage.category : "Academic",
      message: "",
    });

    setFormError("");
    setShowCompose(true);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (
      !form.recipient.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "You",
      email: form.recipient.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      date: new Date().toISOString(),
      category: form.category,
      read: true,
      starred: false,
      folder: "sent",
    };

    setMessages((previous) => [newMessage, ...previous]);
    setActiveFolder("sent");
    setActiveFilter("All");
    setActiveCategory("All");
    setSearch("");
    setSelectedMessage(null);
    setMobileDetail(false);
    setShowCompose(false);
    setForm({
      recipient: "",
      subject: "",
      category: "Academic",
      message: "",
    });
    setFormError("");
  };

  const changeFolder = (folder) => {
    setActiveFolder(folder);
    setSelectedMessage(null);
    setMobileDetail(false);
    setActiveFilter("All");
    setActiveCategory("All");
    setSearch("");
  };

  const activeTitle = activeFolder === "inbox" ? "Inbox" : "Sent Messages";

  return (
    <div className="sm-page container-fluid">
      {/* Page heading */}
      <div className="sm-page-header">
        <div>
          <div className="sm-eyebrow">
            <MessageCircle size={15} />
            STUDENT COMMUNICATION
          </div>
          <h2>Messages</h2>
          <p>Connect with teachers, departments, and classmates.</p>
        </div>

        <button
          className="sm-compose-main"
          onClick={() => openComposer()}
        >
          <Plus size={19} />
          Compose Message
        </button>
      </div>

      {/* Main messaging layout */}
      <div className="sm-layout">
        {/* Left sidebar */}
        <aside className={`sm-sidebar ${mobileDetail ? "sm-mobile-hide" : ""}`}>
          <div className="sm-profile-mini">
            <div className="sm-avatar sm-avatar-main">S</div>
            <div>
              <h6>Student Account</h6>
              <span>Student Portal</span>
            </div>
            <span className="sm-online-dot" />
          </div>

          <button
            className="sm-sidebar-compose"
            onClick={() => openComposer()}
          >
            <Plus size={18} />
            New Message
          </button>

          <div className="sm-sidebar-label">MAILBOX</div>

          <button
            className={`sm-folder-btn ${activeFolder === "inbox" ? "active" : ""}`}
            onClick={() => changeFolder("inbox")}
          >
            <Inbox size={19} />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="sm-folder-count">{unreadCount}</span>
            )}
          </button>

          <button
            className={`sm-folder-btn ${activeFolder === "sent" ? "active" : ""}`}
            onClick={() => changeFolder("sent")}
          >
            <Send size={18} />
            <span>Sent</span>
            <span className="sm-folder-total">{sentCount}</span>
          </button>

          <button
            className={`sm-folder-btn ${activeFilter === "Starred" ? "active" : ""}`}
            onClick={() => setActiveFilter("Starred")}
          >
            <Star size={18} />
            <span>Starred</span>
            <span className="sm-folder-total">{starredCount}</span>
          </button>

          <div className="sm-sidebar-divider" />

          <div className="sm-sidebar-label">QUICK OVERVIEW</div>

          <div className="sm-sidebar-info">
            <div className="sm-info-icon sm-info-purple">
              <Mail size={17} />
            </div>
            <div>
              <span>Total inbox</span>
              <strong>{inboxCount}</strong>
            </div>
          </div>

          <div className="sm-sidebar-info">
            <div className="sm-info-icon sm-info-orange">
              <MailOpen size={17} />
            </div>
            <div>
              <span>Unread messages</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          <div className="sm-sidebar-help">
            <div className="sm-help-icon">
              <GraduationCap size={22} />
            </div>
            <h6>Need assistance?</h6>
            <p>Contact your school administration for support.</p>
          </div>
        </aside>

        {/* Message list */}
        <section className={`sm-list-panel ${mobileDetail ? "sm-mobile-hide" : ""}`}>
          <div className="sm-list-header">
            <div>
              <h4>{activeTitle}</h4>
              <p>
                {visibleMessages.length} messages displayed
              </p>
            </div>
            <div className="sm-list-header-icon">
              <Inbox size={21} />
            </div>
          </div>

          <div className="sm-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="sm-list-filters">
            <select
              className="form-select"
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
            >
              <option>All</option>
              <option>Unread</option>
              <option>Starred</option>
            </select>
          </div>

          <div className="sm-message-list">
            <AnimatePresence mode="popLayout">
              {visibleMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.035 }}
                  className={`sm-message-item ${
                    !message.read && activeFolder === "inbox"
                      ? "sm-message-unread"
                      : ""
                  } ${
                    selectedMessage?.id === message.id
                      ? "sm-message-selected"
                      : ""
                  }`}
                  onClick={() => openMessage(message)}
                >
                  <div className="sm-message-avatar">
                    {message.sender === "You"
                      ? "Y"
                      : message.sender.charAt(0)}
                  </div>

                  <div className="sm-message-content">
                    <div className="sm-message-top">
                      <strong>{message.sender}</strong>
                      <span>{formatMessageDate(message.date)}</span>
                    </div>

                    <h6>{message.subject}</h6>
                    <p>{message.message.replace(/\n/g, " ")}</p>

                    <div className="sm-message-bottom">
                      <span className={`sm-category-tag sm-tag-${message.category.toLowerCase()}`}>
                        {message.category}
                      </span>
                      {message.starred && (
                        <Star
                          size={14}
                          className="sm-star-filled"
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </div>

                  <div className="sm-message-actions">
                    <button
                      title={message.starred ? "Remove star" : "Add star"}
                      onClick={(event) => toggleStar(event, message)}
                    >
                      <Star
                        size={16}
                        fill={message.starred ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      title="Delete message"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteMessage(message.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleMessages.length === 0 && (
              <div className="sm-empty">
                <div><MailOpen size={28} /></div>
                <h6>No messages found</h6>
                <p>Try another search or change your filters.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                    setActiveFilter("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Message detail */}
        <section className={`sm-detail-panel ${mobileDetail ? "sm-detail-mobile-active" : ""}`}>
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              className="sm-detail-inner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sm-detail-toolbar">
                <button
                  className="sm-back-btn"
                  onClick={() => setMobileDetail(false)}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>

                <div className="sm-detail-actions">
                  <button
                    title="Toggle star"
                    onClick={() =>
                      updateMessage(selectedMessage.id, {
                        starred: !selectedMessage.starred,
                      })
                    }
                  >
                    <Star
                      size={17}
                      fill={selectedMessage.starred ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    title="Delete message"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                  <button title="More options">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="sm-detail-subject">
                <span className={`sm-category-tag sm-tag-${selectedMessage.category.toLowerCase()}`}>
                  {selectedMessage.category}
                </span>
                <h3>{selectedMessage.subject}</h3>
              </div>

              <div className="sm-sender-card">
                <div className="sm-message-avatar sm-detail-avatar">
                  {selectedMessage.sender === "You"
                    ? "Y"
                    : selectedMessage.sender.charAt(0)}
                </div>
                <div className="sm-sender-info">
                  <strong>{selectedMessage.sender}</strong>
                  <span>{selectedMessage.email}</span>
                </div>
                <div className="sm-detail-date">
                  {formatMessageDate(selectedMessage.date)}
                </div>
              </div>

              <div className="sm-message-body">
                {selectedMessage.message}
              </div>

              <div className="sm-detail-footer">
                <div className="sm-read-status">
                  <CheckCheck size={16} />
                  {selectedMessage.folder === "sent"
                    ? "Message sent"
                    : "Message read"}
                </div>

                {selectedMessage.folder === "inbox" && (
                  <button
                    className="sm-reply-btn"
                    onClick={() => openComposer(selectedMessage)}
                  >
                    <Reply size={17} />
                    Reply
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="sm-no-selection">
              <div className="sm-no-selection-icon">
                <MessageCircle size={38} />
              </div>
              <h4>Select a message</h4>
              <p>
                Choose a message from your inbox to read its full content.
              </p>
              <div className="sm-no-selection-tip">
                <Mail size={16} />
                Your messages appear here.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            className="sm-compose-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              className="sm-compose-modal"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sm-compose-header">
                <div>
                  <div className="sm-compose-header-icon">
                    <Send size={19} />
                  </div>
                  <div>
                    <h4>Compose Message</h4>
                    <p>Write a message to your school community.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompose(false)}
                  aria-label="Close compose window"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={sendMessage}>
                <div className="sm-compose-body">
                  {formError && (
                    <div className="sm-form-error">{formError}</div>
                  )}

                  <label htmlFor="sm-recipient">Recipient email</label>
                  <input
                    id="sm-recipient"
                    type="email"
                    className="form-control"
                    placeholder="teacher@school.edu"
                    value={form.recipient}
                    onChange={(event) =>
                      setForm({ ...form, recipient: event.target.value })
                    }
                    required
                  />

                  <label htmlFor="sm-subject">Subject</label>
                  <input
                    id="sm-subject"
                    type="text"
                    className="form-control"
                    placeholder="Enter message subject"
                    value={form.subject}
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                    required
                  />

                  <label htmlFor="sm-category">Message category</label>
                  <select
                    id="sm-category"
                    className="form-select"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option>Academic</option>
                    <option>Official</option>
                    <option>Personal</option>
                  </select>

                  <label htmlFor="sm-message">Your message</label>
                  <textarea
                    id="sm-message"
                    className="form-control"
                    rows="6"
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(event) =>
                      setForm({ ...form, message: event.target.value })
                    }
                    required
                  />

                  <div className="sm-compose-note">
                    <Paperclip size={15} />
                    Attachments will be supported in a future version.
                  </div>
                </div>

                <div className="sm-compose-footer">
                  <button
                    type="button"
                    className="sm-cancel-btn"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="sm-send-btn">
                    <Send size={16} />
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentMessages;
