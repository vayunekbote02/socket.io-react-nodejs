import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

function App() {
  const socket = useMemo(
    () =>
      io("http://localhost:8080", {
        withCredentials: true,
      }),
    []
  );

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketID] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      // console.log("connected " + socket.id);
    });
    socket.on("welcome", (event) => {
      console.log(event);
    });
    socket.on("receive-message", ({ message: data, id }) => {
      // console.log(`Message sent by user ${id}: ${message}`);
      setMessages((messages) => [...messages, { id, data }]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-12">
      <div className="text-2xl text-zinc-400">{socketID}</div>
      <form onSubmit={joinRoom} className="flex flex-col items-center gap-5">
        <input
          type="text"
          placeholder="Room Name"
          className="px-5 py-3 border-4 border-blue-500 rounded-lg outline-none"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button className="p-4 text-white bg-blue-500 rounded-xl" type="submit">
          Join Room
        </button>
      </form>
      <form onSubmit={sendMessage} className="flex flex-col items-center gap-5">
        <input
          type="text"
          placeholder="message"
          className="px-5 py-3 border-4 border-blue-500 rounded-lg outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="text"
          placeholder="room"
          className="px-5 py-3 border-4 border-blue-500 rounded-lg outline-none"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button className="p-4 text-white bg-blue-500 rounded-xl" type="submit">
          Submit
        </button>
      </form>
      <div>
        {messages?.map((message, idx) => (
          <div key={idx}>
            User {message.id}: {message.data}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
