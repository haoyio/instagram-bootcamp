import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from "@mui/material";
import { red, blue } from '@mui/material/colors';
import FaceIcon from '@mui/icons-material/Face';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';


export default function ChatFeed ({ messages, messageScrollRef }) {
  return messages.map((message, i, messages) => {
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
  })
}
