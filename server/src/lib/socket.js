import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("newMessage", (newMessage) => {
    // You can emit an event to notify about unread messages
    const receiverSocketId = userSocketMap[newMessage.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadMessageUpdate", {
        senderId: newMessage.senderId,
        count: 1 // can be expanded to track total unread count
      });
    }
  });
  
  // When a user starts typing
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  // When a user stops typing
  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("joinGame", (gameId) => {
    socket.join(`game:${gameId}`);
  });

  socket.on("leaveGame", (gameId) => {
    socket.leave(`game:${gameId}`);
  });

  // When a player makes a move
  socket.on("makeMove", ({ gameId, move, game }) => {
    io.to(`game:${gameId}`).emit("moveMade", { 
      gameId, 
      move,
      game  // Pass the complete populated game
    });
  });

// When game status changes (checkmate, draw, etc)
socket.on("gameStateUpdate", ({ gameId, gameState }) => {
  io.to(`game:${gameId}`).emit("gameStateChanged", gameState);
});

// When a draw is offered
socket.on("offerDraw", ({ gameId, playerId }) => {
  io.to(`game:${gameId}`).emit("drawOffered", { gameId, playerId });
});

// When responding to draw offer
socket.on("drawResponse", ({ gameId, accepted }) => {
  io.to(`game:${gameId}`).emit("drawResponseReceived", { gameId, accepted });
});

// When a player resigns
socket.on("resignGame", ({ gameId, playerId }) => {
  io.to(`game:${gameId}`).emit("gameResigned", { gameId, playerId });
});
});

export { io, app, server };