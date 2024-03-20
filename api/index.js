const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = 8080;
const secretKey = "cehb87wevhduednv9we8vd";
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World.");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "cnijesce89u8vedj" }, secretKey);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ message: "Login Successful" });
});

// * Authentication

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err, res) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKey);
    next();
  });
});
// * Authentication

io.on("connection", (socket) => {
  console.log("User connected " + socket.id);

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  socket.on("message", ({ message, room }) => {
    if (room === "") {
      socket.broadcast.emit("receive-message", { message, id: socket.id });
    } else {
      socket.broadcast
        .to(room)
        .emit("receive-message", { message, id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
