const socket = io();
const statusEl = document.getElementById("status");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");

socket.on("players", (players) => {
  if (players.length === 2) {
    statusEl.textContent = "Both players connected. Make your choice!";
    choicesEl.classList.remove("hidden");
  } else {
    statusEl.textContent = "Waiting for another player...";
    choicesEl.classList.add("hidden");
    resultEl.textContent = "";
  }
});

socket.on("full", (message) => {
  statusEl.textContent = message;
});

socket.on("result", (data) => {
  choicesEl.classList.add("hidden");
  resultEl.innerHTML = `
    <p>You chose: <strong>${data.yourChoice}</strong></p>
    <p>Opponent chose: <strong>${data.opponentChoice}</strong></p>
  `;
});

function sendChoice(choice) {
  socket.emit("choice", choice);
  statusEl.textContent = "Waiting for opponent to choose...";
}
