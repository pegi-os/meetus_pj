//backend
import express from "express";
import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:1111`)

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(io, {
    auth: false
});

function publicRoom() {
    const sids = io.sockets.adapter.sids;
    const rooms = io.sockets.adapter.rooms;
    const publicRoom = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRoom.push(key);
        }
    });
    return publicRoom;
}

function countRoom(roomname){
    return io.sockets.adapter.rooms.get(roomname)?.size
}

io.on("connection", (socket) => {
    socket["nickname"] = "any";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomname, done) => {
        socket.join(roomname);
        done();
        socket.to(roomname).emit("welcome", socket.nickname, countRoom(roomname));
        io.sockets.emit("room_change", publicRoom());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    });

    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRoom());
    });

    socket.on("new_message", (message, roomname, done) => {
        done();
        socket.to(roomname).emit("new_message", `${socket.nickname}: ${message}`);
    });

    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });

});


// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "anyone"; //nickname이 없는 사람이 적을 때
//     socket.on("message", (msg) => {     
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }

//     });
// });

server.listen(1111, handleListen);