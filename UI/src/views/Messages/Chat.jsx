/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import Header from "./../../components/Header/Header";
import Footer from "./../../components/Footer/Footer";
import { Link } from "react-router-dom";
import './Chat.css'
import logoPlaceholder from '../../logo.svg';
import profilePlaceholder from '../../user.png';

function formatDate(date) {
    const today = new Date();
    const messageDate = new Date(date);

    if (today.toDateString() === messageDate.toDateString()) {
        return "Today";
    } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (yesterday.toDateString() === messageDate.toDateString()) {
            return "Yesterday";
        } else {
            // Return the date in DD/MM/YYYY format
            return messageDate.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }
    }
}

const ChatMessage = (props) => {
    const [user, setUser] = useState(null);
    const [Employer, setEmployer] = useState(null);
    const [Logo, setLogo] = useState(null);
    const [userType, setUserType] = useState(null);
    const [currentUserId, setcurrentUserId] = useState(null);
    const [currentUser, setcurrentUser] = useState(null);
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [messageText, setMessageText] = useState(""); // State to track textarea content
    const [searchQuery, setSearchQuery] = useState("");
    const [messages, setMessages] = useState("");

    function useChatScroll(dep) {
        const ref = useRef();

        useEffect(() => {
            if (ref.current) {
                ref.current.scrollTop = ref.current.scrollHeight;
            }
        }, [dep]);

        return ref;
    }

    const chatContainerRef = useChatScroll(chatMessages);

    useEffect(() => {
        const userList = async () => {
            props.setLoading(true)
            const userDetails = await props.getUserDetails();
            setUserType(userDetails.UserType);
            if (userDetails.UserType === "employer") {
                const user = await props.fetchEmployer();
                setEmployer(user);
            }
            setcurrentUserId(userDetails._id);
            setcurrentUser(userDetails);

            const user = await props.messageList(userDetails.UserType);
            setUser(user);
            props.setLoading(false)
        };
        userList();
    }, []);

    useEffect(() => {
        const messageList = async () => {
            props.setLoading(true)
            const messages = await props.allMessages();
            setMessages(messages);
            props.setLoading(false)
        };
        messageList();
    }, [])

    const getLastMessageInfo = (userId, userType) => {
        const userMessages = messages.filter(message => (message.senderID === userId || message.receiverID === userId) && (message.senderID === currentUserId || message.receiverID === currentUserId));
        const lastMessage = userMessages[userMessages.length - 1]; // Get the last message
        if (lastMessage) {
            let messageContent = "";
            const senderName = lastMessage.senderID === currentUserId ?
                (<span className="sender-icon"><i className="icon-material-outline-check"></i></span>)
                : ""; // Get the sender's name
            messageContent = <>{senderName} {lastMessage.content}</>;

            // Highlight unread messages in bold
            const unreadCount = getMessageCount(userId, userType);
            if (unreadCount > 0) {
                return <strong>{messageContent}</strong>;
            } else {
                return messageContent;
            }
        } else {
            return <i>No Messages</i>;
        }
    };

    const getMessageCount = (userId, userType) => {
        let userMessages = [];
        if (userType === "employer") {
            userMessages = messages.filter(message =>
                (message.senderID === userId && message.receiverID === currentUserId) &&
                message.readStatus === false
            );
        } else if (userType === "user") {
            userMessages = messages.filter(message =>
                (message.senderID === userId && message.receiverID === currentUserId) &&
                message.readStatus === false
            );
        }
        return userMessages.length; // Return the count of messages for the user
    };

    useEffect(() => {
        const filterUsers = async () => {
            if (searchQuery.trim() !== "") {
                let filteredUsers = [];
                if (userType === "user") {
                    filteredUsers = user.filter(user =>
                        user.CompanyName.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                } else if (userType === "employer") {
                    filteredUsers = user.filter(user =>
                        (user.FirstName.toLowerCase() + " " + user.LastName.toLowerCase()).includes(searchQuery.toLowerCase())
                    );
                }
                setUser(filteredUsers);
            } else {
                props.setLoading(true)
                const userDetails = await props.getUserDetails();
                setUserType(userDetails.UserType);
                if (userDetails.UserType === "employer") {
                    const user = await props.fetchEmployer();
                    setEmployer(user);
                }
                setcurrentUserId(userDetails._id);
                setcurrentUser(userDetails);

                const users = await props.messageList(userDetails.UserType);
                setUser(users);
                props.setLoading(false)
            }
        };

        filterUsers();
    }, [searchQuery, userType]);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };
    useEffect(() => {
        // Call subscription function and pass setCurrentMessage as callback
        const unsubscribe = props.newMessageSub(setCurrentMessage);

        // Clean up subscription when component unmounts
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const [currentMessage, setCurrentMessage] = useState(null);

    useEffect(() => {
        if (currentMessage && (currentMessage.senderID === activeMessageId || currentMessage.receiverID === activeMessageId) && (currentMessage.receiverID === currentUserId || currentMessage.senderID === currentUserId)) {
            setChatMessages(prevMessages => [...prevMessages, currentMessage]);
        }
    }, [currentMessage]);

    const handleActiveMessage = async (userId, userName, logo) => {
        setSelectedUserName(userName);
        setActiveMessageId(userId);
        setLogo(logo);
        props.setLoading(true)
        const messages = await props.fetchChatMessages(currentUserId, userId);
        setChatMessages(messages);
        await props.updateReadStatus(userId);
        props.setLoading(false)
    };

    const handleMessageChange = (event) => {
        setMessageText(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (messageText.trim() !== "") {
            props.setLoading(true)
            await props.sendMessage(currentUserId, activeMessageId, messageText);
            props.setLoading(false)
            setMessageText("");
        }
    };

    return (
        <>
            <Header />
            <div className="messages-container margin-top-0">
                <div className="messages-container-inner">

                    {(window.innerWidth <= 768 && activeMessageId) ? (
                        <div className="message-content" >
                            <div className="messages-headline">
                                <h4>{selectedUserName}</h4>
                            </div>
                            <div className="message-content-inner" ref={chatContainerRef}>
                                {chatMessages.length !== 0 && chatMessages.map((message, index) => (
                                    <>
                                        {index === 0 || formatDate(message.timestamp) !== formatDate(chatMessages[index - 1].timestamp) ? (
                                            <div className="message-time-sign">
                                                <span>{formatDate(message.timestamp)}</span>
                                            </div>
                                        ) : null}
                                        <div key={message._id} className={`message-bubble ${message.senderID === currentUserId ? "me" : ""}`}>
                                            <div className="message-bubble-inner">
                                                <div className="message-avatar">
                                                    <img
                                                        src={userType === "user" ? (message.senderID === currentUserId ? `${process.env.REACT_APP_API_URl}/profile/${currentUser.ProfilePicture}` : `${process.env.REACT_APP_API_URl}/logo/${Logo}`) : (message.senderID === currentUserId ? `${process.env.REACT_APP_API_URl}/logo/${Employer.CompanyLogo}` : `${process.env.REACT_APP_API_URl}/profile/${Logo}`)}
                                                        onError={(e) => {
                                                            if (userType === "user") {
                                                                e.target.onerror = null; // To avoid infinite loop in case placeholder also not found
                                                                e.target.src = logoPlaceholder; // Use placeholder image if logo not found
                                                            }
                                                            else {
                                                                e.target.onerror = null;  // To avoid infinite loop in case placeholder also not found
                                                                e.target.src = profilePlaceholder;
                                                            }
                                                        }}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="message-text d-flex justify-content-between w-25">
                                                    <p>{message.content}</p>
                                                    <p className="message-time mx-2">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="clearfix"></div>
                                        </div></>
                                ))}
                                {chatMessages.length === 0 && (
                                    <h3 className="text-center">No Conversation yet!!</h3>
                                )}
                            </div>
                            <form method="post" name="message-reply" className="message-reply" onSubmit={handleSubmit}>
                                <textarea
                                    cols="1"
                                    rows="1"
                                    name="message-reply"
                                    placeholder="Your Message"
                                    value={messageText}
                                    onChange={handleMessageChange}
                                ></textarea>
                                <button
                                    type="submit"
                                    className="button ripple-effect"
                                    disabled={messageText.trim() === ""}
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="messages-inbox">
                                <div className="messages-headline">
                                    <div className="input-with-icon">
                                        <input
                                            id="autocomplete-input"
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={handleSearchInputChange}
                                        />
                                        <i className="icon-material-outline-search"></i>
                                    </div>
                                </div>
                                <ul>
                                    {user && userType === "user" && user.map((user) => (
                                        <li
                                            key={user._id}
                                            className={activeMessageId === user._id ? "active-message" : ""}
                                            onClick={() => handleActiveMessage(user._id, user.CompanyName, user.CompanyLogo)}
                                        >
                                            <Link>
                                                <div className="message-avatar">
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URl}/logo/${user.CompanyLogo}`}
                                                        alt={`Avatar of ${user.username}`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = logoPlaceholder;
                                                        }}
                                                    />
                                                </div>
                                                <div className="message-by">
                                                    <div className="message-by-headline">
                                                        <h5>{user.CompanyName}</h5>
                                                    </div>
                                                    <p>{getLastMessageInfo(user._id, userType)}</p>
                                                    {getMessageCount(user._id, userType) > 0 && (
                                                        <div className="header-notifications-trigger d-flex justify-content-end">
                                                            <span>{getMessageCount(user._id, userType)}</span>
                                                        </div>)}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                    {user && userType === "employer" && user.map((user) => (
                                        <li
                                            key={user.id}
                                            className={activeMessageId === user._id ? "active-message" : ""}
                                            onClick={() => handleActiveMessage(user._id, `${user.FirstName} ${user.LastName}`, user.ProfilePicture)}
                                        >
                                            <Link>
                                                <div className="message-avatar">
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URl}/profile/${user.ProfilePicture}`}
                                                        alt={`Avatar of ${user.username}`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = profilePlaceholder;
                                                        }}
                                                    />
                                                </div>
                                                <div className="message-by">
                                                    <div className="message-by-headline">
                                                        <h5>{user.FirstName} {user.LastName}</h5>
                                                    </div>
                                                    <p>{getLastMessageInfo(user._id, userType)}</p>
                                                    {getMessageCount(user._id, userType) > 0 && (
                                                        <div className="header-notifications-trigger d-flex justify-content-end">
                                                            <span>{getMessageCount(user._id, userType)}</span>
                                                        </div>)}

                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {activeMessageId && (
                                <div className="message-content" >
                                    <div className="messages-headline">
                                        <h4>{selectedUserName}</h4>
                                    </div>
                                    <div className="message-content-inner" ref={chatContainerRef}>
                                        {chatMessages.length !== 0 && chatMessages.map((message, index) => (
                                            <>
                                                {index === 0 || formatDate(message.timestamp) !== formatDate(chatMessages[index - 1].timestamp) ? (
                                                    <div className="message-time-sign">
                                                        <span>{formatDate(message.timestamp)}</span>
                                                    </div>
                                                ) : null}
                                                <div key={message._id} className={`message-bubble ${message.senderID === currentUserId ? "me" : ""}`}>
                                                    <div className="message-bubble-inner">
                                                        <div className="message-avatar">
                                                            <img
                                                                src={userType === "user" ? (message.senderID === currentUserId ? `${process.env.REACT_APP_API_URl}/profile/${currentUser.ProfilePicture}` : `${process.env.REACT_APP_API_URl}/logo/${Logo}`) : (message.senderID === currentUserId ? `${process.env.REACT_APP_API_URl}/logo/${Employer.CompanyLogo}` : `${process.env.REACT_APP_API_URl}/profile/${Logo}`)}
                                                                onError={(e) => {
                                                                    if (userType === "user") {
                                                                        e.target.onerror = null; // To avoid infinite loop in case placeholder also not found
                                                                        e.target.src = logoPlaceholder; // Use placeholder image if logo not found
                                                                    }
                                                                    else {
                                                                        e.target.onerror = null;  // To avoid infinite loop in case placeholder also not found
                                                                        e.target.src = profilePlaceholder;
                                                                    }
                                                                }}
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div className="message-text d-flex justify-content-between w-25">
                                                            <p>{message.content}</p>
                                                            <p className="message-time mx-2">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="clearfix"></div>
                                                </div></>
                                        ))}
                                        {chatMessages.length === 0 && (
                                            <h3 className="text-center">No Conversation yet!!</h3>
                                        )}
                                    </div>
                                    <form method="post" name="message-reply" className="message-reply" onSubmit={handleSubmit}>
                                        <textarea
                                            cols="1"
                                            rows="1"
                                            name="message-reply"
                                            placeholder="Your Message"
                                            value={messageText}
                                            onChange={handleMessageChange}
                                        ></textarea>
                                        <button
                                            type="submit"
                                            className="button ripple-effect"
                                            disabled={messageText.trim() === ""}
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>)}

                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ChatMessage;