const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log("Server listening on port ", PORT);
});

app.get("/", (req, res) => {
  res.send({ status: true });
});

// 1-create socket server
const io = new Server(server, {
  cors: "*",
  methods: ["GET", "POST"],
});

// 3-connect client with socket server and create socket id
io.on("connection", (socket) => {
  console.log(`${socket.id} has been connected`);

  // 4-send socket id to the client
  socket.emit("connected", socket.id);

  // 8-get caller user calling and send to called user data
  socket.on("callOtherUser", (calledUserID, user, peerSignal) => {
    io.to(calledUserID).emit("receiveCall", user, peerSignal);
  });

  // 11 - get all information from the receiver and send it to the caller
  socket.on("acceptCall", (otherUser, user, signal) => {
    io.to(otherUser.socketID).emit("callAccepted", user, signal);
  });

  socket.on("sendMsg", (sentTo, msgObj) => {
    io.to(sentTo).emit("receiveMsg", msgObj);
  });
});
