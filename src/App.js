import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { connect } from 'react-redux';

import { onChildAdded, push, ref, set, off } from "firebase/database";
import '@firebase/firestore'
import { database } from "./firebase";

import {
  Button,
  IconButton,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic';

import './App.css'
import * as actions from './actions';


// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

const tableColumns = [
  {
    label: "Message",
    dataKey: "message",
  },
  {
    label: "Date",
    dataKey: "date",
  },
  {
    label: "Time",
    dataKey: "time",
  },
];

function messageHeader(columns) {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align="left"
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  )
}

const messageBody = (messages, messageScrollRef) => (
  messages.map((message, i, messages) => {
    const sentAt = new Date(message.sentAt);
    if (i < messages.length - 1) {
      return (
        <TableRow key={message.key}>
          <TableCell>{message.val}</TableCell>
          <TableCell>{sentAt.toLocaleDateString("en-US")}</TableCell>
          <TableCell>{sentAt.toLocaleTimeString("en-US")}</TableCell>
        </TableRow>
      )
    } else {
      // add scroll reference to last message
      return (
        <TableRow key={message.key} ref={messageScrollRef}>
          <TableCell>{message.val}</TableCell>
          <TableCell>{sentAt.toLocaleDateString("en-US")}</TableCell>
          <TableCell>{sentAt.toLocaleTimeString("en-US")}</TableCell>
        </TableRow>
      )
    }
  })
)

function App (props) {

  // init empty messages array in state to keep local state in sync with Firebase
  // when Firebase changes, update local state, which will update local UI
  const [messages, setMessages] = useState([]);

  const messageScrollRef = useRef(null);
  const [input, setInput] = useState("");

  // update messages displayed when we see new ones
  useEffect(() => {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // add the subsequent child to local component state, initialising a new array to trigger re-render
      // store message key so we can use it as a key in our list items when rendering messages
      const dataVal = data.val();
      setMessages((prevMessages) => [...prevMessages, {
        key: data.key,
        val: dataVal.message,
        sentAt: dataVal.sentAt,
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

  const writeData = (e) => {
    // don't trigger page refresh
    e.preventDefault();

    // do nothing if no input
    if (input === "") return;

    // update firebase rtdb
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    const newMessagesRef = push(messagesRef);
    set(newMessagesRef, {
      message: input,
      sentAt: Date.now(),
    });

    // clear input
    setInput("");
  };

  const handleMicrophoneClick = (e) => {
    e.preventDefault();
    props.executeQuery();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀gram</h1>
      </header>
      <Paper>
        <Paper
          variant="soft"
          sx={{
            borderRadius: "sm",
            boxShadow: 0,
            height: 300,
            minWidth: 300,
            overflow: "auto",
          }}
        >
          <Table aria-label="chat-log" stickyHeader>
            <TableHead>{messageHeader(tableColumns)}</TableHead>
            <TableBody>{messageBody(messages, messageScrollRef)}</TableBody>
          </Table>
        </Paper>
        <Paper variant="soft">
          <form onSubmit={writeData} autoComplete="off">
            <TextField
              id="input-text"
              type="text"
              required
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              label="Enter a message"
              InputProps={{
                endAdornment: (
                  <>
                    <IconButton variant="contained" onClick={handleMicrophoneClick}>
                      <MicIcon />
                    </IconButton>
                    <Button type="submit" variant="contained">Send</Button>
                  </>
                )
              }}
            />
          </form>
        </Paper>
      </Paper>
    </div>
  )
}

const mapStateToProps = (state) => ({ query: state.query });

const mapDispatchToProps = (dispatch) => ({
  updateQuery: (query) => dispatch(actions.updateQuery(query)),
  startRecognition: () => dispatch(actions.startRecognition()),
  executeQuery: () => dispatch(actions.executeQuery()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App)
