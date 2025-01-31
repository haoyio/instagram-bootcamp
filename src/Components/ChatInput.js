import React, {
  useRef,
  useState,
} from "react";

import {
  Box,
  Button,
  IconButton,
  TextField,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import { PhotoCamera } from "@mui/icons-material";
import SendIcon from '@mui/icons-material/Send';

import {
  push,
  ref as databaseRef,
  set,
} from "firebase/database";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import '@firebase/firestore'
import { database, storage } from "../firebase";

import * as recognition from "../asr/speech-recognition";
import GoogleAsr from '../asr/google-asr';
import { MemoizedChatImagePreview } from './ChatImagePreview';


// save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";
const IMAGES_FOLDER_NAME = "images";

// automatic speech recognition constants
const MAX_ASR_TRANSCRIPTION_ALTERNATIVES = 8;
const asr = new GoogleAsr();

export default function ChatInput() {

  const [textInput, setTextInput] = useState("");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const fileInput = useRef();
  const [fileInputFile, setFileInputFile] = useState(null);
  const [isUploadingInput, setIsUploadingInput] = useState(false);

  // RT database and storage upload
  const writeData = (e) => {
    // don't trigger page refresh
    e.preventDefault();

    // do nothing if no text input
    if (textInput === "") return;

    setIsUploadingInput(true);

    // just upload text if no image
    if (fileInputFile === null) {
      // update firebase rtdb
      const messagesRef = databaseRef(database, DB_MESSAGES_KEY);
      const newMessagesRef = push(messagesRef);
      set(newMessagesRef, {
        message: textInput,
        sentAt: Date.now(),
        isHumanSender: true,
        imageLink: "",
      });

      // clear text input
      setTextInput("");
      setIsUploadingInput(false);

    // handle text and image
    } else {
      // upload image to firebase storage and update messages with url
      const fileRef = storageRef(storage, `${IMAGES_FOLDER_NAME}/${fileInputFile.name}`);
      uploadBytes(fileRef, fileInputFile)
        .then(() => {
          getDownloadURL(fileRef)
            .then((downloadURL) => {
              const messagesRef = databaseRef(database, DB_MESSAGES_KEY);
              const newMessagesRef = push(messagesRef);
              set(newMessagesRef, {
                message: textInput,
                sentAt: Date.now(),
                isHumanSender: true,
                imageLink: downloadURL,
              })

              // clear text and file input
              setTextInput("");
              setFileInputFile(null);
              setIsUploadingInput(false);
            })
        })
    }
  };

  // automatic speech recognition handling
  const handleMicrophoneClick = (e) => {
    e.preventDefault();

    // ignore if we're currently already recording/processing audio
    if (isProcessingAudio) return;

    setIsProcessingAudio(true);

    asr.key = process.env.REACT_APP_GOOGLE_KEY || null;
    asr.maxTranscripts = MAX_ASR_TRANSCRIPTION_ALTERNATIVES;

    if (asr.key) {
      console.log("Using Google Cloud ASR.");
      asr.recognize()
        .then((response) => {
          const bestTranscript = response[0].transcript;
          setTextInput((prev) => prev === "" ? bestTranscript : prev + "; " + bestTranscript);
        })
        .catch(e => console.log(e))
        .finally(() => { setIsProcessingAudio(false) });
    } else {
      console.log("Using webkitSpeechRecognition.");
      recognition.recognize()
        .then((response) => {
          const bestTranscript = response[0].transcript;
          setTextInput((prev) => prev === "" ? bestTranscript : prev + "; " + bestTranscript);
        })
        .catch(e => console.log(e))
        .finally(() => { setIsProcessingAudio(false) });
    }
  };

  return <>
    <Box
      variant="soft"
      elevation={1}
      sx={{
        borderRadius: "sm",
        boxShadow: 0,
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
          disabled={isProcessingAudio || isUploadingInput}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          label={isProcessingAudio ? "Processing audio..." : isUploadingInput ? "Uploading input..." : "Say or type something..."}
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
                <IconButton onClick={(e) => {
                  fileInput.current.click();
                  e.target.value = null;
                }}>
                  <PhotoCamera />
                  <input
                    styles={{ display: "none" }}
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInput}
                    onChange={(e) => setFileInputFile(e.target.files[0])}
                  />
                </IconButton>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={textInput === "" || isProcessingAudio || isUploadingInput}
                  endIcon={isProcessingAudio ? <CancelScheduleSendIcon /> : <SendIcon />}
                >
                  Send
                </Button>
              </>
            )
          }}
        />
      </form>
    </Box>
    <MemoizedChatImagePreview fileInputFile={fileInputFile} />
  </>
  ;
}
