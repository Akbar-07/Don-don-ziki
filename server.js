// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let choices = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 2 tagacha player qabul qilamiz
  if (Object.keys(players).length < 2) {
    players[socket.id] = { id: socket.id };
    io.emit("players", Object.keys(players));
  } else {
    socket.emit("full", "Server is full. Try later.");
  }

  // Tanlov olayapmiz
  socket.on("choice", (data) => {
    choices[socket.id] = data;
    if (Object.keys(choices).length === 2) {
      const [p1, p2] = Object.keys(choices);
      const result = getResult(choices[p1], choices[p2]);

      // Har ikkala playerga natijani yuboramiz
      io.to(p1).emit("result", {
        yourChoice: choices[p1],
        opponentChoice: choices[p2],
        outcome: result[0]
      });

      io.to(p2).emit("result", {
        yourChoice: choices[p2],
        opponentChoice: choices[p1],
        outcome: result[1]
      });

      // Reset tanlovlar
      choices = {};
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    delete choices[socket.id];
    io.emit("players", Object.keys(players));
  });
});

function getResult(p1, p2) {
  if (p1 === p2) return ["Draw", "Draw"];
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return ["You Win!", "You Lose!"];
  }
  return ["You Lose!", "You Win!"];
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
