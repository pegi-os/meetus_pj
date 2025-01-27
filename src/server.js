import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  // console.log(socket);
  socket["nickname"] = "Anonymous";

  socket.onAny((event, ...args) => {
    console.log(`발생한 소켓 이벤트: ${event}`);
    console.log('인자:', args);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });

  socket.on("set_nickname", (nickname) => {
    socket["nickname"] = nickname;
  });

  socket.on("send_offer", (offer, roomName) => {
    socket.to(roomName).emit("receive_offer", offer);
  });

  socket.on("send_answer", (answer, roomName) => {
    socket.to(roomName).emit("receive_answer", answer);
  });

  socket.on("send_ice", (ice, roomName) => {
    socket.to(roomName).emit("receive_ice", ice);
  });  
});


const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
