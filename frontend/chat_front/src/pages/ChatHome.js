import React, { useState, useEffect } from 'react';
import s from '../css/chatHome.module.css';
import Chat from '../components/Chat';
import SidePanel from '../components/SidePanel';
function ChatHome() {
  const [user_id, setUserID] = useState(null);
  const [selectedChatID, setSelectedChatID] = useState(null);
  const handleSetUserID = (id) => {
   setUserID(id)
  };
  const handleChatClick = (id) => {
    console.log(id)
    setSelectedChatID(id)
   };
  
  return (
    <div className={s.chatHome}>
        <div className={s.sidePanel}>
            <SidePanel user_id={user_id} on_select_chat={handleChatClick}/>
        </div>
        <div className={s.mainPanel}>
            <Chat curr_user_id={handleSetUserID} selectedChatID={selectedChatID}/>
        </div>
    </div>
  );
}

export default ChatHome;
