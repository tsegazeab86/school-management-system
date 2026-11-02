
import   { useRef, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Bell,
  FileImage,
  FileText,
  Download,
  Image as ImageIcon,
} from "lucide-react";

import "./Messages.css";

const initialChats = [
  {
    id: 1,
    name: "Emma Dell",
    role: "Student",
    avatar: "ED",
    online: true,
    color: "pink",
    messages: [
      {
        id: 1,
        text: "Hello teacher! Can you share today's learning materials?",
        sender: "other",
        time: "09:15 AM",
      },
      {
        id: 2,
        text: "Of course! I will upload them for you.",
        sender: "me",
        time: "09:20 AM",
      },
      {
        id: 3,
        text: "Thank you very much!",
        sender: "other",
        time: "09:25 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Abebe Kebede",
    role: "Parent",
    avatar: "AK",
    online: true,
    color: "blue",
    messages: [
      {
        id: 1,
        text: "Good morning teacher. How is my child doing?",
        sender: "other",
        time: "08:30 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Meron Tesfaye",
    role: "Student",
    avatar: "MT",
    online: false,
    color: "green",
    messages: [
      {
        id: 1,
        text: "I have completed the assignment.",
        sender: "other",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 4,
    name: "Dawit Alemu",
    role: "Parent",
    avatar: "DA",
    online: false,
    color: "orange",
    messages: [
      {
        id: 1,
        text: "When will the exam results be available?",
        sender: "other",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 5,
    name: "Hana Worku",
    role: "Student",
    avatar: "HW",
    online: true,
    color: "purple",
    messages: [
      {
        id: 1,
        text: "Thank you for the lesson!",
        sender: "other",
        time: "Monday",
      },
    ],
  },
];

function Messages() {
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Message");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [sharedFiles, setSharedFiles] = useState([]);
  const fileRef = useRef(null);

  const selectedChat = chats.find(
    (chat) => chat.id === activeChat
  );

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesTab =
      activeTab === "All Message" ||
      (activeTab === "Group" && chat.role === "Group") ||
      (activeTab === "Archived" && chat.archived);

    return matchesSearch && matchesTab;
  });

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    setMessage("");
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be 5MB or less.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageMessage = {
        id: Date.now(),
        text: file.name,
        image: reader.result,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [...chat.messages, imageMessage],
              }
            : chat
        )
      );

      setSharedFiles((prev) => [
        {
          id: Date.now(),
          name: file.name,
          image: reader.result,
          size: (file.size / 1024).toFixed(0) + " KB",
          date: "Just now",
        },
        ...prev,
      ]);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const createChat = (e) => {
    e.preventDefault();

    if (!newName.trim()) return;

    const newChat = {
      id: Date.now(),
      name: newName.trim(),
      role: newRole,
      avatar: newName.trim().substring(0, 2).toUpperCase(),
      online: false,
      color: "blue",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setNewName("");
    setShowNewChat(false);
    setActiveTab("All Message");
  };

  return (
    <div className="teacher-messages">

      {/* Header */}
      <header className="tm-header">
        <div>
          <h1>Messages</h1>
          <p>Education Teacher Dashboard</p>
        </div>

        <div className="tm-header-actions">
          <div className="tm-global-search">
            <Search size={17} />
            <input
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="tm-upload-btn"
            onClick={() => fileRef.current?.click()}
            disabled={!selectedChat}
          >
            <Plus size={17} />
            New Upload
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={uploadImage}
          />

          <button className="tm-notification">
            <Bell size={19} />
            <span />
          </button>
        </div>
      </header>

      {/* Main three-column layout */}
      <div className="tm-layout">

        {/* Left: Conversation list */}
        <aside className="tm-conversations">

          <div className="tm-tabs">
            {["All Message", "Group", "Archived"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tm-list-search">
            <Search size={15} />
            <input
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tm-contact-list">
            {filteredChats.map((chat) => {
              const last = chat.messages[chat.messages.length - 1];

              return (
                <button
                  key={chat.id}
                  className={`tm-contact ${
                    activeChat === chat.id ? "active" : ""
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className={`tm-avatar ${chat.color}`}>
                    {chat.avatar}
                    {chat.online && <span className="tm-online" />}
                  </div>

                  <div className="tm-contact-details">
                    <div className="tm-contact-title">
                      <strong>{chat.name}</strong>
                      <small>{last?.time || ""}</small>
                    </div>

                    <p>{last?.text || "Start a conversation"}</p>
                    <span>{chat.role}</span>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <p className="tm-empty">No conversations found.</p>
            )}
          </div>

          <button
            className="tm-new-chat"
            onClick={() => setShowNewChat(true)}
          >
            <Plus size={17} /> New Conversation
          </button>
        </aside>

        {/* Center: Chat area */}
        <main className="tm-chat">

          {selectedChat ? (
            <>
              <div className="tm-chat-header">
                <div className={`tm-avatar ${selectedChat.color}`}>
                  {selectedChat.avatar}
                  {selectedChat.online && <span className="tm-online" />}
                </div>

                <div className="tm-chat-person">
                  <strong>{selectedChat.name}</strong>
                  <span>
                    {selectedChat.online ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="tm-chat-actions">
                  <button title="Call">
                    <Phone size={17} />
                  </button>
                  <button title="Video call">
                    <Video size={17} />
                  </button>
                  <button title="More">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="tm-message-list">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`tm-message ${
                      msg.sender === "me" ? "sent" : "received"
                    }`}
                  >
                    <div className="tm-bubble">
                      {msg.image && (
                        <img
                          className="tm-message-image"
                          src={msg.image}
                          alt={msg.text}
                        />
                      )}

                      {msg.text && !msg.image && <p>{msg.text}</p>}

                      <small>{msg.time}</small>
                    </div>
                  </div>
                ))}

                {selectedChat.messages.length === 0 && (
                  <div className="tm-no-messages">
                    <ImageIcon size={35} />
                    <h3>No messages yet</h3>
                    <p>Send a message to start this conversation.</p>
                  </div>
                )}
              </div>

              <form className="tm-message-form" onSubmit={sendMessage}>
                <button
                  type="button"
                  title="Upload image"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip size={19} />
                </button>

                <input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button type="button" title="Emoji">
                  <Smile size={19} />
                </button>

                <button
                  className="tm-send"
                  type="submit"
                  disabled={!message.trim()}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="tm-no-messages">
              <ImageIcon size={40} />
              <h3>Select a conversation</h3>
              <p>Choose a contact to view messages.</p>
            </div>
          )}
        </main>

        {/* Right: Contact and shared files */}
        <aside className="tm-details">

          <div className="tm-profile">
            <div className="tm-profile-avatar">
              {selectedChat?.avatar || "ED"}
              <span />
            </div>

            <h3>{selectedChat?.name || "Select a contact"}</h3>
            <p>{selectedChat?.role || "Contact profile"}</p>
            <small>
              {selectedChat?.online ? "Online" : "School Management System"}
            </small>
          </div>

          <div className="tm-shared-section">
            <div className="tm-section-heading">
              <h3>Shared Files</h3>
              <button title="More files">
                <MoreVertical size={17} />
              </button>
            </div>

            {sharedFiles.length === 0 ? (
              <div className="tm-no-files">
                <FileImage size={25} />
                <p>No shared files yet</p>
              </div>
            ) : (
              sharedFiles.map((file) => (
                <div className="tm-file-item" key={file.id}>
                  <img src={file.image} alt={file.name} />

                  <div>
                    <strong>{file.name}</strong>
                    <small>{file.date}</small>
                    <small>{file.size}</small>
                  </div>

                  <a
                    href={file.image}
                    download={file.name}
                    title="Download image"
                  >
                    <Download size={15} />
                  </a>
                </div>
              ))
            )}
          </div>

          <div className="tm-shared-section">
            <div className="tm-section-heading">
              <h3>Shared Links</h3>
              <button title="More links">
                <MoreVertical size={17} />
              </button>
            </div>

            <div className="tm-link-item">
              <FileText size={17} />
              <div>
                <strong>Learning Materials</strong>
                <small>School resources</small>
              </div>
            </div>

            <div className="tm-link-item">
              <FileText size={17} />
              <div>
                <strong>Assignment Portal</strong>
                <small>Student assignments</small>
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* New conversation modal */}
      {showNewChat && (
        <div
          className="tm-modal-overlay"
          onClick={() => setShowNewChat(false)}
        >
          <form
            className="tm-modal"
            onSubmit={createChat}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>New Conversation</h2>
            <p>Create a conversation with a student or parent.</p>

            <label>Contact Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter contact name"
              required
            />

            <label>Contact Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option>Student</option>
              <option>Parent</option>
            </select>

            <button type="submit">Create Conversation</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;
