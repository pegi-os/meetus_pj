const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomname;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSumbit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomname, () => {
        addMessage(`You: ${value}`);  
    });
    input.value = "";
}

function handlenicknameSumbit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", input.value);
}
function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room name ${roomname}`;
    const msgform = room.querySelector("#msg");
    const nicform = room.querySelector("#name");
    msgform.addEventListener("submit", handleMessageSumbit);
    nicform.addEventListener("submit", handlenicknameSumbit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomname = input.value;
    input.value = "";
};



form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, count) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room name ${roomname} (${count})`;
    addMessage(`${user} just joined`);
    addMessage(`total users: ${count}`);
});

socket.on("bye", (user, count) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room name ${roomname} (${count})`;
    addMessage(`${user} just left`);
    addMessage(`total users: ${count}`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) =>{
    const roomlist = welcome.querySelector("ul");
    roomlist.innerHTML = "";
    if(rooms.length === 0){
        roomlist.innerHTML = "";
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomlist.appendChild(li);
    });
});