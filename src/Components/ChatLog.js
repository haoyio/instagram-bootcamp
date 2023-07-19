import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

const tableColumns = [
  {
    label: "Date",
    dataKey: "date",
    width: "15%",
  },
  {
    label: "Time",
    dataKey: "time",
    width: "15%",
  },
  {
    label: "Message",
    dataKey: "message",
    width: "30%",
  },
  {
    label: "Image",
    dataKey: "image",
    width: "40%",
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
    return (
      <TableRow
        key={message.key}
        ref={i < messages.length - 1 ? null : messageScrollRef}
        hover
      >
        <TableCell style={{ borderBottom: "none" }}>
          {sentAt.toLocaleDateString("en-US")}
        </TableCell>
        <TableCell style={{ borderBottom: "none" }}>
          {sentAt.toLocaleTimeString("en-US")}
        </TableCell>
        <TableCell style={{ borderBottom: "none" }}>
          {message.message}
        </TableCell>
        <TableCell style={{ borderBottom: "none" }}>
          {message.imageLink === "" ? <></> : <img src={message.imageLink} alt={message.key} width="100%" />}
        </TableCell>
      </TableRow>
    )
  })
)

export default function ChatLog ({ messages, messageScrollRef }) {
  return (
    <Table aria-label="chat-log" stickyHeader>
      <TableHead>{messageHeader(tableColumns)}</TableHead>
      <TableBody>{messageBody(messages, messageScrollRef)}</TableBody>
    </Table>
  )
}
