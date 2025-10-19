// ===== AUTH =====
function getUser() {
  return JSON.parse(localStorage.getItem("ludoUser"));
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// ===== LUDO PAGE =====
if (window.location.pathname.endsWith("ludo.html")) {
  const playerName = localStorage.getItem("loggedInUser");
  if (!playerName) window.location.href = "login.html";
  document.getElementById("player-name").textContent = playerName;
  document.getElementById("logout").addEventListener("click", logoutUser);

  const diceDisplay = document.getElementById("dice-display");
  const rollBtn = document.getElementById("rollDice");
  const createBtn = document.getElementById("create-room");
  const joinBtn = document.getElementById("join-room");
  const grid = document.querySelector(".grid");

  // ===== BOARD BUILD =====
  for (let i = 0; i < 225; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
  }

  const cells = document.querySelectorAll(".cell");
  // Assign color zones (approximate visual layout)
  const redZone = [0,1,2,15,16,17,30,31,32];
  const greenZone = [12,13,14,27,28,29,42,43,44];
  const yellowZone = [180,181,182,195,196,197,210,211,212];
  const blueZone = [168,169,170,183,184,185,198,199,200];
  
  redZone.forEach(i => cells[i].classList.add("red-zone"));
  greenZone.forEach(i => cells[i].classList.add("green-zone"));
  blueZone.forEach(i => cells[i].classList.add("blue-zone"));
  yellowZone.forEach(i => cells[i].classList.add("yellow-zone"));

  // ===== TOKENS =====
  const tokens = {
    red: createToken("red", 1, 1),
    green: createToken("green", 13, 1),
    yellow: createToken("yellow", 13, 13),
    blue: createToken("blue", 1, 13),
  };

  function createToken(color, x, y) {
    const token = document.createElement("div");
    token.classList.add("token", color);
    grid.appendChild(token);
    moveToken(token, x, y);
    return { el: token, x, y, steps: 0 };
  }

  function moveToken(token, gridX, gridY) {
    const size = window.innerWidth < 600 ? 20 : 30;
    token.style.left = `${gridX * size + 10}px`;
    token.style.top = `${gridY * size + 10}px`;
  }

  // ===== GAME STATE =====
  let turnOrder = ["red", "green", "blue", "yellow"];
  let current = 0;
  let gameStarted = false;

  createBtn.onclick = () => {
    gameStarted = true;
    rollBtn.disabled = false;
    alert("Room created! (Mock mode)");
  };
  joinBtn.onclick = () => {
    gameStarted = true;
    rollBtn.disabled = false;
    alert("Joined room! (Mock mode)");
  };

  rollBtn.onclick = () => {
    if (!gameStarted) return alert("Create or join a room first!");

    rollBtn.disabled = true;
    let roll = 0;
    let count = 0;
    const anim = setInterval(() => {
      roll = Math.floor(Math.random() * 6) + 1;
      diceDisplay.textContent = `🎲 ${roll}`;
      count++;
      if (count >= 10) {
        clearInterval(anim);
        const color = turnOrder[current];
        playTurn(color, roll);
        rollBtn.disabled = false;
      }
    }, 100);
  };

  function playTurn(color, roll) {
    const player = tokens[color];
    player.steps += roll;
    if (player.steps >= 25) {
      const saved = getUser();
      if (saved) {
        saved.wins++;
        localStorage.setItem("ludoUser", JSON.stringify(saved));
      }
      alert(`${color.toUpperCase()} wins!`);
      resetTokens();
      return;
    }
    player.x += roll % 5;
    player.y += Math.floor(roll / 5);
    if (player.x > 13) player.x = 1;
    if (player.y > 13) player.y = 1;
    moveToken(player.el, player.x, player.y);
    current = (current + 1) % turnOrder.length;
  }

  function resetTokens() {
    Object.assign(tokens.red, { x: 1, y: 1, steps: 0 });
    Object.assign(tokens.green, { x: 13, y: 1, steps: 0 });
    Object.assign(tokens.yellow, { x: 13, y: 13, steps: 0 });
    Object.assign(tokens.blue, { x: 1, y: 13, steps: 0 });
    moveToken(tokens.red.el, 1, 1);
    moveToken(tokens.green.el, 13, 1);
    moveToken(tokens.yellow.el, 13, 13);
    moveToken(tokens.blue.el, 1, 13);
  }
}