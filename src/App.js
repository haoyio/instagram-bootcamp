import React from "react";
import { useEffect, useState } from "react";
import { onChildAdded, push, ref, set, off } from "firebase/database";
import { database } from "./firebase";
import logo from "./logo.png";
import "./App.css";

// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

export default function App () {

  // init empty messages array in state to keep local state in sync with Firebase
  // when Firebase changes, update local state, which will update local UI
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // add the subsequent child to local component state, initialising a new array to trigger re-render
      // store message key so we can use it as a key in our list items when rendering messages
      const newMessage = { key: data.key, val: data.val() };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    return () => off(messagesRef);
  }, []);

  const writeData = () => {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    const newMessagesRef = push(messagesRef);
    set(newMessagesRef, "abc");
  };

  // Convert messages in state to message JSX elements to render
  const messageListItems = messages.map((message) => (
    <li key={message.key}>{message.val}</li>
  ));

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {/* TODO: Add input field and add text input as messages in Firebase */}
        <button onClick={writeData}>Send</button>
        <ol>{messageListItems}</ol>
      </header>
    </div>
  )
}
