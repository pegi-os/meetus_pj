const socket = io();

const welcome = document.getElementById("welcome");
const firstoption = document.getElementById("firstoption");
const secondoption = document.getElementById("secondoption");
const EnterRoom = welcome.querySelector("form");
const names = firstoption.querySelector("form");
const roomnames = secondoption.querySelector("form");
const room = document.getElementById("room");


room.hidden = true;

let nickname;
let roomname;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSumbit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomname, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  firstoption.hidden = true;
  secondoption.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room name ${roomname}`;
  const msgform = room.querySelector("#msg");
  msgform.addEventListener("submit", handleMessageSumbit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomname = input.value;
  input.value = "";
};


function saveNickname(event) {
  event.preventDefault();
  const nicknameInput = names.querySelector("input");
  nickname = nicknameInput.value;
}

function saveRoomName(event) {
  event.preventDefault();
  const roomInput = roomnames.querySelector("input");
  roomname = roomInput.value;
  console.log(roomname);
}

function enterRoom(event) {
  event.preventDefault();
  if (!nickname || !roomname) {
    alert("Please enter both a nickname and a room name.");
    return;
  } else {
    socket.emit("enter_room", roomname, showRoom);
  }
}

EnterRoom.addEventListener("submit", enterRoom);
names.addEventListener("submit", saveNickname);
roomnames.addEventListener("submit", saveRoomName);


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

socket.on("room_change", (rooms) => {
  const roomlist = welcome.querySelector("ul");
  roomlist.innerHTML = "";
  if (rooms.length === 0) {
    roomlist.innerHTML = "";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomlist.appendChild(li);
  });
});


// public/client.js
const startButton = document.getElementById('startButton');
const captureButton = document.getElementById('captureButton');
const screenCanvas = document.getElementById('screenCanvas');
const videoElement = document.createElement('video');

let isScreenSharing = false;

async function startScreenSharing() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  videoElement.srcObject = stream;

  const mediaStreamTrack = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(mediaStreamTrack);

  function drawVideoFrame() {
    imageCapture.grabFrame().then((imageBitmap) => {
      const ctx = screenCanvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0, screenCanvas.width, screenCanvas.height);
      // Emit the captured screen data to the server
      if (isScreenSharing) {
        socket.emit('screenData', screenCanvas.toDataURL('image/jpeg', 0.8));
      }
    }).catch((error) => {
      console.error('Error capturing screen:', error);
    });
    if (isScreenSharing) {
      requestAnimationFrame(drawVideoFrame);
    }
  }

  videoElement.onloadedmetadata = () => {
    videoElement.play();
    isScreenSharing = true;
    drawVideoFrame();
  };
}

function captureScreen() {
  const ctx = screenCanvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, screenCanvas.width, screenCanvas.height);
}

startButton.addEventListener('click', () => {
  // Hide the button after starting screen sharing
  startButton.style.display = 'none';
  startScreenSharing();
});

captureButton.addEventListener('click', () => {
  captureScreen();
});
