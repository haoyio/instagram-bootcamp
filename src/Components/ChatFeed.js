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
import { database } from "../firebase";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from "@mui/material";
import { red, blue } from '@mui/material/colors';
import FaceIcon from '@mui/icons-material/Face';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';


// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

export default function ChatFeed ({ sx = {} }) {

  // init empty messages array in state to keep local state in sync with Firebase
  // when Firebase changes, update local state, which will update local UI
  const [messages, setMessages] = useState([]);

  // to ensure feed scrolls to the latest sent message
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
    <Box sx={sx}>
      {messages.map((message, i, messages) => {
          const ref = i < messages.length - 1 ? null : messageScrollRef;

          const sentAt = new Date(message.sentAt);
          const timestamp = sentAt.toLocaleDateString("en-US") + " " + sentAt.toLocaleTimeString("en-US");

          const sender = message.isHumanSender ? "You" : "AI";
          const bgcolor = message.isHumanSender ? red[500] : blue[500];
          const avatarIcon = message.isHumanSender ? <FaceIcon /> : <PrecisionManufacturingIcon />;

          const image = message.imageLink === "" ? <></> : <CardMedia
            component="img"
            height="200"
            image={message.imageLink}
            alt="image"
          />;

          return (
            <Card key={message.key} ref={ref}>
              <CardHeader
                avatar={
                  <Avatar
                    aria-label="avatar"
                    sx={{ bgcolor: bgcolor }}
                  >
                    {avatarIcon}
                  </Avatar>
                }
                title={sender}
                subheader={timestamp}
              />
              <CardContent>
                <Typography variant="body1" color="text.primary">
                  {message.message}
                </Typography>
              </CardContent>
              {image}
            </Card>
          )
      })}
    </Box>
  )
}
