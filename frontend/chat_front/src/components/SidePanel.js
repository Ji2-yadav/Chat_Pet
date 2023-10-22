import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faL, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import "../css/SidePanel.css";
import logo from '../images/Crux.png'
import config from "../configs/config";
const SidePanel = ({ user_id, on_select_chat }) => {
    const [chats, setChats] = useState([]);
    const [selectChat, setSelectChat] = useState(null)
    const [deletePanel, setDeletePanel] = useState(false)
    
    useEffect(() => {
        if (user_id != null) {
            load_chat_api(user_id);
        }
    }, [user_id]);

    function ExtractData({ data }) {
        const extractedChats = [];

        data.forEach((innerArray) => {
            const [chat_id, chat_name] = innerArray;
            extractedChats.push({ chat_id, chat_name });
        });

        console.log(extractedChats);
        setChats(extractedChats);
    }
    const handleNewChat = () => {
        on_select_chat(null);
    };

    const handleChatClick = (event) => {
        const chatId = event.currentTarget.getAttribute('data-chat-id');
        on_select_chat(chatId)
        setSelectChat(chatId)
        // on_select_chat(null);
    };

    const handleDeleteChat = (chat_id) => {
        console.log(chat_id)
        setDeletePanel(true)
    };
    const load_chat_api = async (user_id) => {
        try {
            const response = await fetch(
                `${config.API_ENDPOINT}/api/load-chats`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        user_id: user_id,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                ExtractData(data);
            } else {
                console.log("Error occurred while fetching data.");
            }
        } catch (error) {
            console.log("Error occurred while fetching data.", error);
        }
    };

    const delete_chat_api = async (chat_id) => {
        try {
            const response = await fetch(
                `${config.API_ENDPOINT}/api/delete-chat`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        chat_id, chat_id
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                load_chat_api(user_id)
                setDeletePanel(false)
                setSelectChat(null)
                on_select_chat(null)
            } else {
                console.log("Error occurred while fetching data.");
            }
        } catch (error) {
            console.log("Error occurred while fetching data.", error);
        }
    };

    return (
        <div className="side-div">
            <div className="logo-div">
                <img src={logo} className="logo" /> Marketing Saas
            </div>
            <div className="new_chat" onClick={handleNewChat}>
                <FontAwesomeIcon icon={faPlus} /> New Chat
            </div>
            <div className="chats-div">
            {chats.map((chat, index) => (
                    <div key={index} className="chat-item">
                        <div className='chat-name-div' onClick={handleChatClick} data-chat-id={chat.chat_id}>
                            {chat.chat_name}
                        </div>
                        {selectChat == chat.chat_id &&
                        <div className="delete-icon" onClick={() => handleDeleteChat(chat.chat_id)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </div>}
                    </div>
                ))}
            </div>
            {deletePanel && <div className="delete-div">
                <div className="delete-message">
                    <FontAwesomeIcon className='del-icon' icon={faTrash} />
                    <h1>Delete Chat</h1>
                    <p>Are you sure you want to delete this chat? This action can not be undone</p>
                    <div className="button-div">
                        <button onClick={() => setDeletePanel(false)} className="cancel-button">Cancel</button>
                        <button onClick={() => delete_chat_api(selectChat)} className="delete-button">Delete</button>
                </div>
                </div>
                
            </div>}
        </div>

    );
};

export default SidePanel;
