
import { useState } from "react";
import {
    Search, Send, Paperclip, MoreVertical, Phone,
    Video, MessageCircle, ArrowLeft, Plus, Smile
} from "lucide-react";
import "../../styles/registrar/Messages.css";

const initialChats = [
    {
        id: 1,
        name: "Abebe Kebede",
        role: "Mathematics Teacher",
        image: "https://i.pravatar.cc/100?img=12",
        online: true,
        unread: 2,
        messages: [
            { id: 1, text: "Good morning, how are you?", sender: "them", time: "09:15 AM" },
            { id: 2, text: "I am fine, thank you!", sender: "me", time: "09:17 AM" },
            { id: 3, text: "I need the updated student list.", sender: "them", time: "09:20 AM" },
        ],
    },
    {
        id: 2,
        name: "Hana Getachew",
        role: "School Administrator",
        image: "https://i.pravatar.cc/100?img=47",
        online: true,
        unread: 0,
        messages: [
            { id: 1, text: "Please prepare the monthly report.", sender: "them", time: "08:30 AM" },
            { id: 2, text: "Okay, I will prepare it today.", sender: "me", time: "08:35 AM" },
        ],
    },
    {
        id: 3,
        name: "Dawit Tesfaye",
        role: "Parent",
        image: "https://i.pravatar.cc/100?img=11",
        online: false,
        unread: 1,
        messages: [
            { id: 1, text: "I want to ask about my child's registration.", sender: "them", time: "Yesterday" },
        ],
    },
    {
        id: 4,
        name: "Meron Alemu",
        role: "English Teacher",
        image: "https://i.pravatar.cc/100?img=44",
        online: false,
        unread: 0,
        messages: [
            { id: 1, text: "Thank you for your support.", sender: "them", time: "Yesterday" },
        ],
    },
];

function Messages() {
    const [chats, setChats] = useState(initialChats);
    const [activeId, setActiveId] = useState(1);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [mobileChat, setMobileChat] = useState(false);

    const activeChat = chats.find((chat) => chat.id === activeId);

    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !activeChat) return;

        const newMessage = {
            id: Date.now(),
            text: message.trim(),
            sender: "me",
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setChats((previous) =>
            previous.map((chat) =>
                chat.id === activeId
                    ? { ...chat, messages: [...chat.messages, newMessage] }
                    : chat
            )
        );
        setMessage("");
    };

    const selectChat = (id) => {
        setActiveId(id);
        setMobileChat(true);
        setChats((previous) =>
            previous.map((chat) =>
                chat.id === id ? { ...chat, unread: 0 } : chat
            )
        );
    };

    return (
        <div className="messages-page">
            <div className="messages-heading">
                <div>
                    <span className="messages-eyebrow">COMMUNICATION CENTER</span>
                    <h2>Messages</h2>
                    <p>Communicate with teachers, parents and school staff.</p>
                </div>
                <div className="messages-heading-icon">
                    <MessageCircle size={25} />
                </div>
            </div>

            <div className="messages-workspace">
                {/* Conversations sidebar */}
                <aside className={`messages-list-panel ${mobileChat ? "hide-mobile" : ""}`}>
                    <div className="messages-list-header">
                        <div>
                            <h3>Conversations</h3>
                            <span>{chats.length} contacts</span>
                        </div>
                        <button title="New message">
                            <Plus size={19} />
                        </button>
                    </div>

                    <div className="messages-search">
                        <Search size={17} />
                        <input
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="messages-contact-list">
                        {filteredChats.map((chat) => {
                            const lastMessage = chat.messages[chat.messages.length - 1];

                            return (
                                <button
                                    className={`messages-contact ${activeId === chat.id ? "active" : ""}`}
                                    key={chat.id}
                                    onClick={() => selectChat(chat.id)}
                                >
                                    <div className="messages-avatar-wrap">
                                        <img
                                            src={chat.image}
                                            alt={chat.name}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=7059D5&color=fff`;
                                            }}
                                        />
                                        {chat.online && <i className="messages-online-dot" />}
                                    </div>

                                    <div className="messages-contact-info">
                                        <div className="messages-contact-top">
                                            <strong>{chat.name}</strong>
                                            <small>{lastMessage?.time}</small>
                                        </div>
                                        <div className="messages-contact-bottom">
                                            <span>{lastMessage?.text}</span>
                                            {chat.unread > 0 && (
                                                <b>{chat.unread}</b>
                                            )}
                                        </div>
                                        <small className="messages-contact-role">{chat.role}</small>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredChats.length === 0 && (
                            <p className="messages-no-results">No conversations found.</p>
                        )}
                    </div>
                </aside>

                {/* Chat window */}
                <section className={`messages-chat-panel ${mobileChat ? "show-mobile" : ""}`}>
                    {activeChat ? (
                        <>
                            <div className="messages-chat-header">
                                <button
                                    className="messages-back-btn"
                                    onClick={() => setMobileChat(false)}
                                    title="Back to conversations"
                                >
                                    <ArrowLeft size={19} />
                                </button>

                                <div className="messages-chat-person">
                                    <img
                                        src={activeChat.image}
                                        alt={activeChat.name}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=7059D5&color=fff`;
                                        }}
                                    />
                                    <div>
                                        <strong>{activeChat.name}</strong>
                                        <span>
                                            <i className={activeChat.online ? "online" : ""} />
                                            {activeChat.online ? "Online" : "Offline"} · {activeChat.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="messages-chat-tools">
                                    <button title="Voice call"><Phone size={18} /></button>
                                    <button title="Video call"><Video size={18} /></button>
                                    <button title="More options"><MoreVertical size={19} /></button>
                                </div>
                            </div>

                            <div className="messages-chat-body">
                                <div className="messages-date-label">TODAY</div>

                                {activeChat.messages.map((item) => (
                                    <div
                                        className={`messages-bubble-row ${item.sender === "me" ? "mine" : "theirs"}`}
                                        key={item.id}
                                    >
                                        {item.sender === "them" && (
                                            <img
                                                className="messages-small-avatar"
                                                src={activeChat.image}
                                                alt=""
                                            />
                                        )}
                                        <div className="messages-bubble">
                                            <p>{item.text}</p>
                                            <small>{item.time}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form className="messages-compose" onSubmit={sendMessage}>
                                <button type="button" title="Attach file">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                />
                                <button type="button" title="Emoji">
                                    <Smile size={20} />
                                </button>
                                <button className="messages-send-btn" type="submit" title="Send message">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="messages-empty-chat">
                            <MessageCircle size={45} />
                            <h3>Select a conversation</h3>
                            <p>Choose a contact to start messaging.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Messages;
