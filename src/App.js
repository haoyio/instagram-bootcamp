import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import SendIcon from '@mui/icons-material/Send';

import './App.css'
import * as recognition from "./asr/speech-recognition";
import GoogleAsr from './asr/google-asr';


const asr = new GoogleAsr();

// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

const MAX_ALTERNATIVES = 8;

const tableColumns = [
  {
    label: "Message",
    dataKey: "message",
    width: "60%",
  },
  {
    label: "Date",
    dataKey: "date",
    width: "20%",
  },
  {
    label: "Time",
    dataKey: "time",
    width: "20%",
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
          width={column.width}
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
          <TableCell style={{ borderBottom: "none" }}>
            {message.val}
          </TableCell>
          <TableCell style={{ borderBottom: "none" }}>
            {sentAt.toLocaleDateString("en-US")}
          </TableCell>
          <TableCell style={{ borderBottom: "none" }}>
            {sentAt.toLocaleTimeString("en-US")}
          </TableCell>
        </TableRow>
      )
    } else {
      // add scroll reference to last message
      return (
        <TableRow key={message.key} ref={messageScrollRef}>
          <TableCell style={{ borderBottom: "none" }}>
            {message.val}
          </TableCell>
          <TableCell style={{ borderBottom: "none" }}>
            {sentAt.toLocaleDateString("en-US")}
          </TableCell>
          <TableCell style={{ borderBottom: "none" }}>
            {sentAt.toLocaleTimeString("en-US")}
          </TableCell>
        </TableRow>
      )
    }
  })
)

export default function App(props) {

  // init empty messages array in state to keep local state in sync with Firebase
  // when Firebase changes, update local state, which will update local UI
  const [messages, setMessages] = useState([]);

  const messageScrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

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

    // ignore if we're currently already recording/processing audio
    if (isProcessingAudio) return;

    setIsProcessingAudio(true);

    asr.key = process.env.REACT_APP_GOOGLE_KEY || null;
    asr.maxTranscripts = MAX_ALTERNATIVES;

    if (asr.key) {
      console.log("Using Google Cloud ASR.");
      asr.recognize()
        .then((response) => {
          const best_transcript = response[0].transcript;
          setInput((prev) => prev === "" ? best_transcript : prev + "; " + best_transcript);
        })
        .catch(e => console.log(e))
        .finally(() => { setIsProcessingAudio(false) });
    } else {
      console.log("Using webkitSpeechRecognition.");
      recognition.recognize()
        .then((response) => {
          const best_transcript = response[0].transcript;
          setInput((prev) => prev === "" ? best_transcript : prev + "; " + best_transcript);
        })
        .catch(e => console.log(e))
        .finally(() => { setIsProcessingAudio(false) });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀gram</h1>
      </header>
      <Paper elevation={0}>
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
        <Paper
          variant="soft"
          elevation={1}
          sx={{
            borderRadius: "sm",
            boxShadow: 0,
            height: 300,
            minWidth: 300,
            overflow: "auto",
          }}
        >
          <form onSubmit={writeData} autoComplete="off">
            <TextField
              id="input-text"
              type="text"
              required
              fullWidth
              variant="filled"
              disabled={isProcessingAudio}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              label={isProcessingAudio ? "Processing audio..." : "Say or type something..."}
              InputProps={{
                endAdornment: (
                  <>
                    <IconButton
                      variant="contained"
                      onClick={handleMicrophoneClick}
                      disabled={isProcessingAudio}
                    >
                      <MicIcon />
                    </IconButton>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isProcessingAudio}
                      endIcon={isProcessingAudio ? <CancelScheduleSendIcon /> : <SendIcon />}
                    >
                      Send
                    </Button>
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
