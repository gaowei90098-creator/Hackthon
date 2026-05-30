const canvas = document.getElementById("jiro-canvas");
const ctx = canvas.getContext("2d");

const SCENE = { width: 720, height: 720 };
const ENTER_MS = 1750;
const POST_ENTER_LOOP_MS = 5600;

const JIRO_FRAMES = {
  0: { x: 18, y: 5, width: 156, height: 198 },
  1: { x: 209, y: 5, width: 157, height: 198 },
  2: { x: 399, y: 5, width: 161, height: 198 },
  3: { x: 592, y: 5, width: 160, height: 198 },
  4: { x: 784, y: 5, width: 159, height: 198 },
  5: { x: 977, y: 5, width: 158, height: 198 },
  6: { x: 1349, y: 235, width: 182, height: 154 },
  7: { x: 5, y: 236, width: 182, height: 152 },
  8: { x: 389, y: 238, width: 182, height: 148 },
  9: { x: 773, y: 239, width: 182, height: 146 },
  10: { x: 581, y: 240, width: 182, height: 143 },
  11: { x: 965, y: 242, width: 182, height: 140 },
  12: { x: 1157, y: 243, width: 182, height: 138 },
  13: { x: 197, y: 246, width: 182, height: 132 },
  22: { x: 16, y: 629, width: 160, height: 198 },
  25: { x: 595, y: 629, width: 154, height: 198 },
  39: { x: 19, y: 1253, width: 153, height: 198 },
  40: { x: 208, y: 1253, width: 160, height: 198 },
  41: { x: 397, y: 1253, width: 166, height: 198 },
  42: { x: 593, y: 1253, width: 158, height: 198 },
  43: { x: 796, y: 1253, width: 136, height: 198 },
  44: { x: 982, y: 1253, width: 148, height: 198 },
  45: { x: 22, y: 1461, width: 148, height: 198 },
  46: { x: 403, y: 1461, width: 154, height: 198 },
  47: { x: 591, y: 1461, width: 162, height: 198 },
  48: { x: 787, y: 1461, width: 153, height: 198 },
  54: { x: 596, y: 1669, width: 152, height: 198 },
  55: { x: 795, y: 1669, width: 138, height: 198 },
  56: { x: 985, y: 1669, width: 141, height: 198 },
};

const CALM_SEQUENCE = [
  { id: 0, ms: 420 },
  { id: 1, ms: 420 },
  { id: 4, ms: 420 },
  { id: 5, ms: 420 },
  { id: 2, ms: 180 },
  { id: 3, ms: 180 },
];

const GREET_SEQUENCE = [
  { id: 22, ms: 360 },
  { id: 25, ms: 360 },
  { id: 22, ms: 360 },
];

const ENTER_SEQUENCE = [
  { id: 7, ms: 95 },
  { id: 13, ms: 95 },
  { id: 8, ms: 95 },
  { id: 10, ms: 95 },
  { id: 9, ms: 95 },
  { id: 11, ms: 95 },
  { id: 12, ms: 95 },
  { id: 6, ms: 95 },
];

const THINKING_SEQUENCE = [
  { id: 39, ms: 320 },
  { id: 40, ms: 320 },
  { id: 41, ms: 340 },
  { id: 43, ms: 420 },
  { id: 44, ms: 360 },
  { id: 42, ms: 260 },
  { id: 40, ms: 320 },
];

const COMFORT_SEQUENCE = [
  { id: 45, ms: 260 },
  { id: 46, ms: 280 },
  { id: 48, ms: 300 },
  { id: 47, ms: 360 },
  { id: 48, ms: 300 },
  { id: 55, ms: 360 },
  { id: 56, ms: 320 },
  { id: 54, ms: 320 },
];

function frameAt(sequence, elapsed) {
  const totalMs = sequence.reduce((sum, frame) => sum + frame.ms, 0);
  const local = elapsed % totalMs;
  let cursor = 0;

  for (const step of sequence) {
    cursor += step.ms;
    if (local < cursor) return JIRO_FRAMES[step.id];
  }

  return JIRO_FRAMES[sequence[0].id];
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function phase(elapsed) {
  if (elapsed < ENTER_MS) return { name: "enter", pt: elapsed / ENTER_MS };

  const t = ((elapsed - ENTER_MS) % POST_ENTER_LOOP_MS) / POST_ENTER_LOOP_MS;
  if (t < 0.24) return { name: "greet", pt: t / 0.24 };
  if (t < 0.52) return { name: "listen", pt: (t - 0.24) / 0.28 };
  if (t < 0.76) return { name: "comfort", pt: (t - 0.52) / 0.24 };
  return { name: "idle", pt: (t - 0.76) / 0.24 };
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPetFrame(image, frame, cx, bottom, scale, extraY = 0, rotation = 0) {
  const drawWidth = frame.width * scale;
  const drawHeight = frame.height * scale;

  ctx.save();
  ctx.translate(cx, bottom + extraY);
  ctx.rotate(rotation);
  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    -drawWidth / 2,
    -drawHeight,
    drawWidth,
    drawHeight,
  );
  ctx.restore();
}

function drawScene(image, elapsed) {
  const current = phase(elapsed);
  const bob = Math.sin(elapsed * 0.006) * 6;
  const pulse = Math.sin(elapsed * 0.003) * 0.5 + 0.5;

  ctx.clearRect(0, 0, SCENE.width, SCENE.height);

  const sky = ctx.createLinearGradient(0, 0, 0, SCENE.height);
  sky.addColorStop(0, "#fffdf8");
  sky.addColorStop(0.56, "#f6f4ee");
  sky.addColorStop(1, "#e8f1ed");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);

  ctx.fillStyle = "rgba(200,232,74,0.14)";
  ctx.beginPath();
  ctx.ellipse(444, 316, 178 + pulse * 8, 150 + pulse * 5, -0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(26,26,26,0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = 430 + i * 26;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.bezierCurveTo(180, y - 26, 292, y + 24, 430, y - 12);
    ctx.bezierCurveTo(536, y - 40, 620, y + 14, 690, y - 8);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  [
    [450, 118, 138, 46, "soft reply"],
    [470, 278, 154, 46, "mood sync"],
    [432, 558, 130, 46, "tiny ritual"],
  ].forEach(([x, y, w, h, text], index) => {
    const lift = Math.sin(elapsed * 0.002 + index) * 8;
    drawRoundedRect(Number(x), Number(y) + lift, Number(w), Number(h), 8);
    ctx.fill();
    ctx.fillStyle = index === 1 ? "#e89ba8" : "#1a1a1a";
    ctx.font = "600 18px system-ui";
    ctx.fillText(String(text), Number(x) + 18, Number(y) + lift + 29);
    ctx.fillStyle = "rgba(255,255,255,0.72)";
  });

  for (let i = 0; i < 18; i += 1) {
    const x = 72 + ((i * 83 + elapsed * 0.018) % 590);
    const y = 162 + Math.sin(elapsed * 0.002 + i) * 28 + (i % 4) * 44;
    ctx.fillStyle = i % 3 === 0 ? "#c8e84a" : i % 3 === 1 ? "#e89ba8" : "#8fb9a8";
    ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
    ctx.fillRect(x, y, 7, 7);
  }
  ctx.globalAlpha = 1;

  let cx = 472;
  let bottom = 640;
  let scale = 1.2;
  let rotation = Math.sin(elapsed * 0.002) * 0.025;

  if (current.name === "enter") {
    cx = lerp(-170, 472, easeOut(current.pt));
    bottom = lerp(646, 640, easeOut(current.pt));
    scale = lerp(1.12, 1.2, easeOut(current.pt));
    rotation = -0.02 + Math.sin(current.pt * Math.PI * 2) * 0.025;
  } else if (current.name === "greet") {
    cx = 472 + Math.sin(current.pt * Math.PI * 2) * 10;
    bottom = 636 - Math.sin(current.pt * Math.PI) * 16;
    rotation = Math.sin(current.pt * Math.PI * 2) * 0.04;
  } else if (current.name === "listen") {
    cx = lerp(472, 452, easeInOut(current.pt));
    bottom = 640 + Math.sin(current.pt * Math.PI) * 7;
    rotation = -0.04 * Math.sin(current.pt * Math.PI);
  } else if (current.name === "comfort") {
    cx = lerp(452, 476, easeInOut(current.pt));
    bottom = 642 - Math.sin(current.pt * Math.PI) * 8;
    scale = 1.2 + Math.sin(current.pt * Math.PI) * 0.04;
  }

  ctx.fillStyle = "rgba(26,26,26,0.13)";
  ctx.beginPath();
  ctx.ellipse(cx, bottom + 9, 120, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  let petSequence = CALM_SEQUENCE;
  if (current.name === "enter") petSequence = ENTER_SEQUENCE;
  else if (current.name === "greet") petSequence = GREET_SEQUENCE;
  else if (current.name === "listen") petSequence = THINKING_SEQUENCE;
  else if (current.name === "comfort") petSequence = COMFORT_SEQUENCE;

  const frame = frameAt(petSequence, elapsed);
  drawPetFrame(image, frame, cx, bottom, scale, bob, rotation);
}

const image = new Image();
image.src = "./pets/jiro-spritesheet.webp";
image.onload = () => {
  let startedAt = 0;
  ctx.imageSmoothingEnabled = true;

  const render = (now) => {
    if (startedAt === 0) startedAt = now;
    drawScene(image, now - startedAt);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};
