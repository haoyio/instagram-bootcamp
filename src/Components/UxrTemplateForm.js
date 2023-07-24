import { useState } from "react";

import {
  Box,
  Grid,
  Rating,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';


const Input = styled(MuiInput)`
  width: 42px;
`;

const minDuration = 2;
const maxDuration = 20;

function BodySectionForm({ defaultTitle = "", defaultPriority = 0 }) {

  const [title, setTitle] = useState(defaultTitle);
  const [priority, setPriority] = useState(defaultPriority);
  const [duration, setDuration] = useState(5);
  const [contextBank, setContextBank] = useState("");
  const [questionBank, setQuestionBank] = useState("");
  const [learningGoals, setLearningGoals] = useState("");

  const handleBlur = () => {
    if (duration < minDuration) {
      setDuration(minDuration);
    } else if (duration > maxDuration) {
      setDuration(maxDuration);
    }
  };

  return (
    <div>
      <Typography variant="h3">
        {title === "" ? "Section title" : `${title}`}
      </Typography>
      {defaultTitle !== "" ? <></> : <>
          <TextField
            id="section-title"
            label="Section title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </>
      }
      {defaultPriority !== 0 ? <></> :
        <Box
          sx={{
            width: 300,
            '& > legend': { mt: 2 },
          }}
        >
          <Typography component="priority-legend" gutterBottom>
            Priority
          </Typography>
          <br/>
          <Rating
            name="section-priority"
            size="large"
            disabled={defaultPriority !== 0}
            value={priority}
            onChange={(e, newPriority) => setPriority(newPriority)}
          />
        </Box>
      }
      <Box sx={{ width: 300 }}>
        <Typography id="section-duration" gutterBottom>
          Time limit (minutes)
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TimerIcon />
          </Grid>
          <Grid item xs>
            <Slider
              min={minDuration}
              max={maxDuration}
              step={1}
              value={typeof duration === 'number' ? duration : minDuration}
              onChange={(e, newDuration) => setDuration(newDuration)}
              aria-labelledby="section-duration"
            />
          </Grid>
          <Grid item>
            <Input
              value={duration}
              size="small"
              onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
              onBlur={handleBlur}
              inputProps={{
                step: 1,
                min: minDuration,
                max: maxDuration,
                type: "number",
                "aria-labelledby": "section-duration",
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <br />
      <TextField
        id="section-goals"
        label="Learning goals"
        multiline
        rows={4}
        helperText="Tell the interviewer what to learn"
        value={learningGoals}
        onChange={(e) => setLearningGoals(e.target.value)}
      />
      <TextField
        id="section-context"
        label="Context bullets"
        multiline
        rows={4}
        helperText="Provide context for the interviewer"
        value={contextBank}
        onChange={(e) => setContextBank(e.target.value)}
      />
      <TextField
        id="section-questions"
        label="Sample questions"
        multiline
        rows={4}
        helperText="Provide a few different examples"
        value={questionBank}
        onChange={(e) => setQuestionBank(e.target.value)}
      />
    </div>
  )
}

export default function UxrTemplateForm({ sx = {} }) {
  // TODO: ensure user gets a chance to review the form before actually submitting

  const [interviewTitle, setInterviewTitle] = useState("");

  return (
    <Box
      component="form"
      sx={{
        maxWidth: '100%',
        '& .MuiTextField-root': { m: 1, width: '25ch' },
        ...sx,  // given sx takes precedence
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h2">
        Discussion Guide: {interviewTitle === "" ? "Interview title" : `${interviewTitle}`}
      </Typography>
      <Typography variant="body1">
        Fill out this UXR discussion guide to prepare the interviewer for conducting your qualitative interviews.
      </Typography>
      <TextField
        id="interview-title"
        label="Interview title"
        fullWidth
        helperText="Name your interview"
        value={interviewTitle}
        onChange={(e) => setInterviewTitle(e.target.value)}
      />
      <BodySectionForm defaultTitle={"Introduction"} defaultPriority={5} />
      <BodySectionForm />
      <BodySectionForm />
      <BodySectionForm />
      <BodySectionForm defaultTitle={"Conclusion"} defaultPriority={5} />
    </Box>
  );
}
