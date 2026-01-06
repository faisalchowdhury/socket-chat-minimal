const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const mongoose = require("mongoose");

const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

mongoose
  .connect(
    "mongodb+srv://barber:1L2IiCealOjF1k5R@cluster0.0o3jxdg.mongodb.net/socket_chat"
  )
  .then(() => console.log("Mongodb conneced"))
  .catch(console.log("something wend wrong"));

// message schema

const MessageSchema = new mongoose.Schema(
  {
    text: String,
    time: String,
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);

io.on("connection", async (socket) => {
  console.log("socket connected", socket.id);

  const messages = await MessageModel.find().sort({ createdAt: 1 }).limit(50);

  socket.emit("load_messages", messages);

  // receive message
  socket.on("send_message", async (data) => {
    const newMessage = await MessageModel.create(data);
    io.emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("server running on port 4000");
});
