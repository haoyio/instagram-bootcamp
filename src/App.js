import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  onChildAdded,
  ref as databaseRef,
  off,
} from "firebase/database";
import '@firebase/firestore'
import { database } from "./firebase";

import {
  Box,
  Typography,
} from '@mui/material'

import './App.css'
import ChatFeed from './Components/ChatFeed';
import InterviewTemplate from "./Components/UxrTemplateForm";
import ChatInput from "./Components/ChatInput";


// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

export default function App() {

  // init empty messages array in state to keep local state in sync with Firebase
  // when Firebase changes, update local state, which will update local UI
  const [messages, setMessages] = useState([]);

  const messageScrollRef = useRef(null);

  // update messages displayed when we see new ones
  useEffect(() => {
    const messagesRef = databaseRef(database, DB_MESSAGES_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // add the subsequent child to local component state, initialising a new array to trigger re-render
      // store message key so we can use it as a key in our list items when rendering messages
      const dataVal = data.val();
      setMessages((prevMessages) => [...prevMessages, {
        key: data.key,
        message: dataVal.message,
        sentAt: dataVal.sentAt,
        isHumanSender: dataVal.isHumanSender,
        imageLink: dataVal.imageLink,
      }]);
    });
    return () => off(messagesRef);
  }, []);

  // scroll the window to the latest message when received (not sent)
  useEffect(() => {
    if (messageScrollRef.current) {
      messageScrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  return (
    <div className="App">
      <Box>
        <Typography variant="h1">
          🍦gram
        </Typography>
        <ChatFeed
          messages={messages}
          messageScrollRef={messageScrollRef}
          sx={{
            borderRadius: "sm",
            boxShadow: 0,
            height: "70vh",
            minHeight: 300,
            minWidth: 300,
            overflow: "auto",
          }}
        />
        <ChatInput />
      </Box>
      {/* Temporary interview template form until we place more nicely with router */}
      <InterviewTemplate />
    </div>
  )
}
