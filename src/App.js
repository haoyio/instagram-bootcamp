import React from "react";

import {
  Box,
  Typography,
} from '@mui/material'

import './App.css'
import ChatFeed from './Components/ChatFeed';
import TemplateForm from "./Components/TemplateForm";
import ChatInput from "./Components/ChatInput";


export default function App() {

  return (
    <div className="App">
      <Box>
        <Typography variant="h1">
          🍦gram
        </Typography>
        <ChatFeed
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
      <TemplateForm />
    </div>
  )
}
