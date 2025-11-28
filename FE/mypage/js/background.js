const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "012345678901";
const matrix = chars.split("");

const fontSize = 22;

const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

const speedFactor = 1; // 뚝뚝 한 줄씩
const delay = 100; // 프레임 간격 100ms = 10fps 느낌

function draw() {
  // 더 강하게 지워주기 (끊김 느낌 강조)
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0F0";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = matrix[Math.floor(Math.random() * matrix.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i] += speedFactor;
  }
}

setInterval(draw, delay); // 뚝뚝 떨어지는 느낌
