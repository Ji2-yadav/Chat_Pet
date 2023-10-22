import React, { useState, useEffect , useRef} from 'react';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faCheck, faCheckSquare, faEdit, faPen } from '@fortawesome/free-solid-svg-icons';
import logo from '../images/Crux.png'
import user from '../images/user.png'
import Graph from './Graph';
import FileUpload from './FileUpload';
import config from '../configs/config';

function Chat({curr_user_id, selectedChatID}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [graphData, setGraphData] = useState([]);
    const [newUserMsg, setNewUserMsg] = useState(null);
    const [newBotMsg, setNewBotMsg] = useState(null);
    const [newGraphData, setNewGraphData] = useState(null);
    const messageContainerRef = useRef(null);
    const [user_id, setUserID] = useState(1);
    const [chat_id, setChatID] = useState(null);
    const [editableMessages, setEditableMessages] = useState(new Array(messages.length).fill(false)); // Editable state for each message
    const [editedText, setEditedText] = useState(''); // Track edited text
    const [isLoading, setIsLoading] = useState(false);

    function ExtractData({ data }) {

        const extractedGraphs = [];
        const extractedMessages = [];
      
        data.forEach((innerArray) => {
          const [id, user_id, chat_id,message_id, text, graph, isUser] = innerArray;
          extractedGraphs.push(JSON.parse(graph));
          extractedMessages.push({ text, isUser });
        });
        setGraphData(extractedGraphs);
        setMessages(extractedMessages);
    }
    useEffect(() => {          
            setChatID(selectedChatID);
    }, [selectedChatID]);
    useEffect(() => {
        if(chat_id!=null)
            load_msg_api(user_id, chat_id);
        else{
            setMessages([])
            setGraphData([])
        }
    }, [chat_id]);
    useEffect(() => {
        curr_user_id(user_id);
        // load_msg_api(user_id, 2);
    }, []);

    const load_msg_api = async (user_id, chat_id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${config.API_ENDPOINT}/api/load-messages`, {
            method: 'POST',
            body: JSON.stringify({
                 user_id: user_id,
                 chat_id : chat_id,
                }),
            headers: {
                'Content-Type': 'application/json',
            },
            });
    
            if (response.ok) {
            const data = await response.json();
            ExtractData(data);
            } else {
            addMessage('Error occurred while fetching data.');
            }
        } catch (error) {
            addMessage('Error occurred while fetching data.');
        }
        finally {
        setIsLoading(false); // Set loading to false when the API call is complete.
        }
    }

    const addMessage = (text, isUser = false) => {
        const newMessage = { text, isUser };
        setMessages([...messages, newMessage]);
    };

    useEffect(() => {
    }, [graphData]);

    useEffect(() => {
        
        if (newGraphData != null) {
        const newMessage = { text: newBotMsg, isUser: false };
        setGraphData([...graphData, newGraphData]);
        setNewGraphData(null);
        }
    }, [newGraphData]);

    useEffect(() => {
        
        if (newBotMsg != null) {
        const newMessage = { text: newBotMsg, isUser: false };
        setMessages([...messages, newMessage]);
        // setNewBotMsg(null);
        }
    }, [newBotMsg]);

    useEffect(() => {
        
        if (newUserMsg != null) {
        const newMessage = { text: newUserMsg, isUser: true };
        setMessages([...messages, newMessage]);
        setNewUserMsg(null);
        }
    }, [newUserMsg]);
    
    const handleInputChange = (event) => {
        setInput(event.target.value);
    };
    
    const get_api_response = async (input) => {
        setIsLoading(true); // Set loading to true when the API call starts.
    
        try {
          const response = await fetch(`${config.API_ENDPOINT}/api/user-question`, {
            method: 'POST',
            body: JSON.stringify({
              message: input,
              user_id: user_id,
              chat_id: chat_id,
              message_id: messages.length + 1,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log("answered", data)
            setNewGraphData(data.graph);
            setNewBotMsg(data.reply);
          } else {
            addMessage('Error occurred while fetching data.');
          }
        } catch (error) {
          addMessage('Error occurred while fetching data.');
        } finally {
          setIsLoading(false); // Set loading to false when the API call is complete.
        }
      };

    const trigger_chat_initiation = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${config.API_ENDPOINT}/api/chat-initiation`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: user_id,
                chat_id: chat_id
               }),
            headers: {
                'Content-Type': 'application/json',
            },
            });
    
            if (response.ok) {
            const data = await response.json();
            console.log("chat initiated", data)
            setNewGraphData(data.graph);
            //   setGraphData(data.graph);
            setNewBotMsg(data.reply);
            } else {
            console.error('Error occurred while fetching data.');
            }
        } catch (error) {
            console.error('Error occurred while fetching data.');
        }finally {
            setIsLoading(false);
        }
    }

    const handleSendMessage = async () => {
        if (input.trim() === '') return;
        // addMessage(input, true);
        setNewUserMsg(input);
        setNewGraphData([]);
        setInput('');

        get_api_response(input);
    };


    const handleFileUpload = (status) => {
        if(status)
             trigger_chat_initiation()
    };

function animateScroll(duration) {
    const divToScroll = document.getElementById('chat-container')

    var start = divToScroll.scrollTop;
    var end = divToScroll.scrollHeight;
    var change = end - start;
    var increment = 20;
    function easeInOut(currentTime, start, change, duration) {
      currentTime /= duration / 2;
      if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start;
      }
      currentTime -= 1;
      return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
    }
    function animate(elapsedTime) {
      elapsedTime += increment;
      var position = easeInOut(elapsedTime, start, change, duration);
      divToScroll.scrollTop = position;
      if (elapsedTime < duration) {
        setTimeout(function() {
          animate(elapsedTime);
        }, increment)
      }
    }
    animate(0);
  }
  function scrollToBottom() {
    var duration = 500 
    animateScroll(duration);
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSendMessage();
    }
  };

  const handleUploadResponse = (chat_id) => {
    setChatID(chat_id)
  };


  const handleEditMessage = (index) => {
    const updatedEditableMessages = [...editableMessages];
    updatedEditableMessages[index] = !editableMessages[index];
    setEditableMessages(updatedEditableMessages);
  };

  const handleSaveMessage = async (index) => {
    // Update the message text in the state and turn off edit mode
    const updatedMessages = [...messages];
    updatedMessages[index].text = editedText; // Use the editedText state
    setMessages(updatedMessages);
    handleEditMessage(index); // Turn off edit mode
    handleCallEditAPI(index, editedText)
  };
  const handleLoader = (loader) => {
    setIsLoading(loader)
  };
  const handleCallEditAPI = async(index, newText) => {
    setIsLoading(true);
    try {
        
        const response = await fetch(`${config.API_ENDPOINT}/api/edit-message`, {
        method: 'POST',
        body: JSON.stringify({
            user_id: user_id,
            chat_id: chat_id,
            index: index,
            text: newText,
           }),
        headers: {
            'Content-Type': 'application/json',
        },
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data)
            ExtractData(data);
            } else {
            addMessage('Error occurred while fetching data.');
            }
        } catch (error) {
            addMessage('Error occurred while fetching data.');
        }finally {
            setIsLoading(false);
        }

  };
  return (
      
    <div className="chat-container" id="chat-container">
        { 
            <div className='file-container'><FileUpload uploadStatus={handleFileUpload} user_id={user_id} new_chat_id={handleUploadResponse} chat_id={chat_id} setIsLoading={handleLoader}/>
            </div>
        }
        
        <div className="message-container" ref={messageContainerRef}>
            {
                messages.map((message, index) => (
                <div key={index} className="message-container" >
                    <div className='unit-message-div'>
                    <div className='logo-left' style={message.isUser ? { display: 'none' } : {}} > <img src={message.isUser ?user : logo } className= 'comp-logo' /></div>
                   
                    <div className={`message ${message.isUser ? 'user-message' : ''}`}>
                        {editableMessages[index] ? (
                            <textarea type="text" value={editedText} className='editable-message' onChange={(e) => setEditedText(e.target.value)} />
                        ) : (
                            <span>{message.text}
                            {message.isUser || index<1? <></>: <Graph graph={graphData[(index)]}/>}
                            </span>
                            
                        )}
                    </div>
                    {message.isUser?
                    <div className='msg-icons'>
                        {!editableMessages[index] ?
                        <FontAwesomeIcon onClick={() => handleEditMessage(index)}  icon={faPen} msg-edit-index={index}/>
                        :
                        <FontAwesomeIcon onClick={() => handleSaveMessage(index)} style={{color: 'rgba(75, 192, 192, 1)', fontSize: '2em' }} icon={ faCheckSquare} />
                        }
                    </div> : <></>}

                    
                    <div className='logo-right' style={message.isUser ? {} :  { display: 'none' }} ><img src={message.isUser ?user : logo } className= 'user-logo' /></div>
                    </div>
                </div>))
            }
        </div>
        {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          
        </div>
        )}
      
        
        <div className='input-div'>
            
            
            <input className="chat-input" disabled={chat_id==null} type="text" value={input} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Send a message..."/>
            <button className="send-icon" disabled={chat_id==null}>
                <FontAwesomeIcon  onClick={handleSendMessage} icon={faArrowCircleRight} />
            </button>

        </div>

    </div>
  );
}

export default Chat;
