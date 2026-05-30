const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const scene = document.body.dataset.scene;

const SCENE = { width: 720, height: 720 };
const EGG = { width: 370, height: 469 };
const EGG_SRC = "./eggs/golden-egg-cutout.png";
const CAT_SRC = "./pets/jiro-spritesheet.webp";
const ENTER_MS = 1750;
const POST_ENTER_LOOP_MS = 5600;
const REVEAL_MS = 5200;

const FRAMES = {
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
  23: { x: 208, y: 629, width: 159, height: 198 },
  24: { x: 399, y: 629, width: 162, height: 198 },
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

const SEQ = {
  calm: [
    { id: 0, ms: 420 },
    { id: 1, ms: 420 },
    { id: 4, ms: 420 },
    { id: 5, ms: 420 },
    { id: 2, ms: 180 },
    { id: 3, ms: 180 },
  ],
  greet: [
    { id: 22, ms: 360 },
    { id: 25, ms: 360 },
    { id: 22, ms: 360 },
  ],
  enter: [
    { id: 7, ms: 95 },
    { id: 13, ms: 95 },
    { id: 8, ms: 95 },
    { id: 10, ms: 95 },
    { id: 9, ms: 95 },
    { id: 11, ms: 95 },
    { id: 12, ms: 95 },
    { id: 6, ms: 95 },
  ],
  thinking: [
    { id: 39, ms: 320 },
    { id: 40, ms: 320 },
    { id: 41, ms: 340 },
    { id: 43, ms: 420 },
    { id: 44, ms: 360 },
    { id: 42, ms: 260 },
    { id: 40, ms: 320 },
  ],
  comfort: [
    { id: 45, ms: 260 },
    { id: 46, ms: 280 },
    { id: 48, ms: 300 },
    { id: 47, ms: 360 },
    { id: 48, ms: 300 },
    { id: 55, ms: 360 },
    { id: 56, ms: 320 },
    { id: 54, ms: 320 },
  ],
  happy: [
    { id: 22, ms: 280 },
    { id: 23, ms: 220 },
    { id: 24, ms: 220 },
    { id: 23, ms: 220 },
    { id: 25, ms: 280 },
    { id: 23, ms: 220 },
    { id: 24, ms: 220 },
    { id: 22, ms: 280 },
  ],
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
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

function progress(t, start, end) {
  return clamp((t - start) / (end - start));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });
}

function frameAt(sequence, elapsed) {
  const total = sequence.reduce((sum, frame) => sum + frame.ms, 0);
  const local = elapsed % total;
  let cursor = 0;
  for (const step of sequence) {
    cursor += step.ms;
    if (local < cursor) return FRAMES[step.id];
  }
  return FRAMES[sequence[0].id];
}

function drawStar(x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.18, y - r * 0.18);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x + r * 0.18, y + r * 0.18);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.18, y + r * 0.18);
  ctx.lineTo(x - r, y);
  ctx.lineTo(x - r * 0.18, y - r * 0.18);
  ctx.closePath();
  ctx.fill();
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

function drawSoftBackground(elapsed) {
  const pulse = Math.sin(elapsed * 0.003) * 0.5 + 0.5;
  const bg = ctx.createLinearGradient(0, 0, 0, SCENE.height);
  bg.addColorStop(0, "#fffdf8");
  bg.addColorStop(0.58, "#f8f4e8");
  bg.addColorStop(1, "#f0f4ec");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);

  ctx.fillStyle = `rgba(242,193,78,${0.06 + pulse * 0.03})`;
  ctx.beginPath();
  ctx.ellipse(360, 380, 206 + pulse * 12, 232 + pulse * 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(26,26,26,0.06)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    const y = 500 + i * 22;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.bezierCurveTo(170, y - 20, 274, y + 22, 414, y - 8);
    ctx.bezierCurveTo(534, y - 34, 618, y + 16, 690, y - 4);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(242,193,78,0.44)";
  [
    [132, 230, 18],
    [586, 204, 14],
    [602, 492, 12],
    [148, 498, 12],
  ].forEach(([x, y, r], index) => {
    ctx.globalAlpha = 0.33 + Math.sin(elapsed * 0.004 + index) * 0.16;
    drawStar(x, y, r);
  });
  ctx.globalAlpha = 1;
}

function eggPose(elapsed, t) {
  const shake = easeInOut(progress(t, 0.08, 0.55));
  const pulse = easeInOut(progress(t, 0.32, 0.9));
  return {
    x: 360 + Math.sin(elapsed * 0.016) * 9 * shake,
    bottom: 590 + Math.sin(elapsed * 0.014) * 5 * shake,
    rotation: Math.sin(elapsed * 0.011) * (0.024 + shake * 0.06) + Math.sin(elapsed * 0.032) * 0.016 * pulse,
    scale: 1 + Math.sin(elapsed * 0.008) * 0.014,
  };
}

function strokeCrack() {
  ctx.beginPath();
  ctx.moveTo(-18, -382);
  ctx.lineTo(2, -360);
  ctx.lineTo(-8, -338);
  ctx.lineTo(12, -314);
  ctx.lineTo(4, -288);
  ctx.lineTo(30, -258);
  ctx.stroke();

  [
    [0, -359, 36, -374, 62, -352],
    [-6, -337, -42, -350, -68, -324],
    [11, -314, 46, -304, 72, -276],
    [4, -288, -28, -270, -44, -238],
  ].forEach(([a, b, c, d, e, f]) => {
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.lineTo(e, f);
    ctx.stroke();
  });
}

function drawCracks(elapsed, alpha, burst = 0) {
  if (alpha <= 0.02) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const glow = ctx.createRadialGradient(2, -323, 8, 2, -323, 140 + burst * 80);
  glow.addColorStop(0, `rgba(255,235,158,${0.36 * alpha + burst * 0.28})`);
  glow.addColorStop(0.45, `rgba(245,190,58,${0.22 * alpha})`);
  glow.addColorStop(1, "rgba(245,190,58,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(2, -323, 142 + burst * 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(245,190,58,${0.18 + 0.18 * alpha})`;
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 12; i += 1) {
    const angle = -Math.PI * 0.86 + i * (Math.PI * 1.6 / 11);
    const start = 34 + (i % 3) * 4;
    const end = 82 + burst * 48 + Math.sin(elapsed * 0.007 + i) * 13;
    ctx.beginPath();
    ctx.moveTo(2 + Math.cos(angle) * start, -323 + Math.sin(angle) * start);
    ctx.lineTo(2 + Math.cos(angle) * end, -323 + Math.sin(angle) * end);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha * (1 - burst * 0.25);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "rgba(245,190,58,0.82)";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "rgba(245,190,58,0.28)";
  ctx.lineWidth = 10;
  strokeCrack();
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(116,78,21,0.76)";
  ctx.lineWidth = 2.6;
  strokeCrack();
  ctx.strokeStyle = "rgba(255,233,150,0.88)";
  ctx.lineWidth = 1.1;
  strokeCrack();
  ctx.restore();
}

function drawEgg(image, elapsed, t, crackStrength = 0) {
  const pose = eggPose(elapsed, t);
  ctx.save();
  ctx.translate(pose.x, pose.bottom);
  ctx.rotate(pose.rotation);
  ctx.scale(pose.scale, pose.scale);

  ctx.fillStyle = `rgba(242,193,78,${0.06 + crackStrength * 0.07})`;
  ctx.beginPath();
  ctx.ellipse(0, -EGG.height * 0.47, EGG.width * 0.55, EGG.height * 0.51, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(image, -EGG.width / 2, -EGG.height, EGG.width, EGG.height);

  ctx.fillStyle = "rgba(26,26,26,0.11)";
  ctx.beginPath();
  ctx.ellipse(0, 20, 130, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  drawCracks(elapsed, crackStrength);
  ctx.restore();
}

function clipLeftShell() {
  ctx.beginPath();
  ctx.moveTo(-EGG.width / 2, -EGG.height);
  ctx.lineTo(-18, -382);
  ctx.lineTo(2, -360);
  ctx.lineTo(-8, -338);
  ctx.lineTo(12, -314);
  ctx.lineTo(4, -288);
  ctx.lineTo(30, -258);
  ctx.lineTo(10, -160);
  ctx.lineTo(2, 0);
  ctx.lineTo(-EGG.width / 2, 0);
  ctx.closePath();
}

function clipRightShell() {
  ctx.beginPath();
  ctx.moveTo(-18, -382);
  ctx.lineTo(EGG.width / 2, -EGG.height);
  ctx.lineTo(EGG.width / 2, 0);
  ctx.lineTo(2, 0);
  ctx.lineTo(10, -160);
  ctx.lineTo(30, -258);
  ctx.lineTo(4, -288);
  ctx.lineTo(12, -314);
  ctx.lineTo(-8, -338);
  ctx.lineTo(2, -360);
  ctx.closePath();
}

function drawShellHalf(image, side, amount) {
  const direction = side === "left" ? -1 : 1;
  const fall = progress(amount, 0.62, 1);
  ctx.save();
  ctx.translate(direction * 92 * amount, -30 * amount + fall * 18);
  ctx.rotate(direction * 0.2 * amount);
  side === "left" ? clipLeftShell() : clipRightShell();
  ctx.clip();
  ctx.globalAlpha = 1 - fall * 0.32;
  ctx.drawImage(image, -EGG.width / 2, -EGG.height, EGG.width, EGG.height);
  ctx.restore();
}

function drawFragments(elapsed, amount) {
  if (amount <= 0.04) return;
  const fragments = [
    [-22, -355, -70, -58, -0.8, 18],
    [18, -365, 54, -70, 0.64, 16],
    [-48, -326, -88, -18, -0.5, 14],
    [46, -322, 86, -26, 0.72, 15],
    [-18, -288, -54, 28, -1.1, 13],
    [34, -278, 58, 24, 1.2, 12],
    [-82, -242, -72, 50, -0.35, 12],
    [92, -230, 66, 46, 0.38, 12],
  ];

  ctx.save();
  ctx.globalAlpha = 1 - progress(amount, 0.76, 1) * 0.42;
  fragments.forEach(([x, y, dx, dy, r, s], index) => {
    const flutter = Math.sin(elapsed * 0.006 + index) * 5;
    ctx.save();
    ctx.translate(x + dx * amount, y + dy * amount + flutter);
    ctx.rotate(r * amount + flutter * 0.012);
    ctx.fillStyle = "rgba(255,239,180,0.94)";
    ctx.strokeStyle = "rgba(224,151,27,0.76)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.86, s * 0.5);
    ctx.lineTo(-s * 0.78, s * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function drawPetFrame(image, frame, cx, bottom, scale, extraY = 0, rotation = 0, flip = false) {
  const drawWidth = frame.width * scale;
  const drawHeight = frame.height * scale;
  ctx.save();
  ctx.translate(cx, bottom + extraY);
  ctx.rotate(rotation);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height, -drawWidth / 2, -drawHeight, drawWidth, drawHeight);
  ctx.restore();
}

function drawRevealCat(image, elapsed, t) {
  const amount = easeOut(progress(t, 0.52, 0.9));
  if (amount <= 0) return;
  const alpha = progress(amount, 0, 0.22);
  const scale = lerp(0.32, 1.05, amount);
  const bottom = lerp(-44, 18, easeInOut(amount));
  const frame = frameAt(amount > 0.62 ? SEQ.happy : SEQ.calm, elapsed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(26,26,26,0.13)";
  ctx.beginPath();
  ctx.ellipse(0, bottom + 10, 92 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPetFrame(image, frame, 0, bottom, scale, -Math.sin(amount * Math.PI) * 22, Math.sin(elapsed * 0.002) * 0.02);
  ctx.restore();
}

function drawHatchScene(egg, elapsed) {
  const t = (elapsed % 5200) / 5200;
  ctx.clearRect(0, 0, SCENE.width, SCENE.height);
  drawSoftBackground(elapsed);
  drawEgg(egg, elapsed, t, easeInOut(progress(t, 0.32, 0.8)) * 0.72);
}

function drawRevealScene(egg, cat, elapsed) {
  const t = clamp(elapsed / REVEAL_MS);
  const pose = eggPose(elapsed, t);
  const crack = easeInOut(progress(t, 0.1, 0.42));
  const broken = easeOut(progress(t, 0.38, 0.68));
  const whole = 1 - progress(t, 0.4, 0.54);

  ctx.clearRect(0, 0, SCENE.width, SCENE.height);
  drawSoftBackground(elapsed);

  ctx.save();
  ctx.translate(pose.x, pose.bottom);
  ctx.rotate(pose.rotation);
  ctx.scale(pose.scale, pose.scale);

  ctx.fillStyle = "rgba(26,26,26,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 20, 132, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(242,193,78,${0.08 + crack * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(0, -EGG.height * 0.47, EGG.width * 0.56, EGG.height * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  if (whole > 0.02) {
    ctx.globalAlpha = whole;
    ctx.drawImage(egg, -EGG.width / 2, -EGG.height, EGG.width, EGG.height);
    ctx.globalAlpha = 1;
  }

  drawCracks(elapsed, crack, broken);
  drawRevealCat(cat, elapsed, t);

  if (broken > 0.02) {
    drawShellHalf(egg, "left", broken);
    drawShellHalf(egg, "right", broken);
    drawFragments(elapsed, broken);
  }
  ctx.restore();
}

function petPhase(elapsed) {
  if (elapsed < ENTER_MS) return { name: "enter", pt: elapsed / ENTER_MS };
  const t = ((elapsed - ENTER_MS) % POST_ENTER_LOOP_MS) / POST_ENTER_LOOP_MS;
  if (t < 0.24) return { name: "greet", pt: t / 0.24 };
  if (t < 0.52) return { name: "listen", pt: (t - 0.24) / 0.28 };
  if (t < 0.76) return { name: "comfort", pt: (t - 0.52) / 0.24 };
  return { name: "idle", pt: (t - 0.76) / 0.24 };
}

function drawPetBackground(elapsed) {
  const pulse = Math.sin(elapsed * 0.003) * 0.5 + 0.5;
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
    drawRoundedRect(x, y + lift, w, h, 8);
    ctx.fill();
    ctx.fillStyle = index === 1 ? "#e89ba8" : "#1a1a1a";
    ctx.font = "600 18px system-ui";
    ctx.fillText(text, x + 18, y + lift + 29);
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
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

const walker = {
  initialized: false,
  x: 472,
  bottom: 640,
  startX: 472,
  startBottom: 640,
  targetX: 472,
  targetBottom: 640,
  startAt: 0,
  endAt: 0,
  waitUntil: 0,
  direction: 1,
};

function chooseWalkTarget(elapsed) {
  let targetX = randomBetween(220, 560);
  if (Math.abs(targetX - walker.x) < 120) {
    targetX = walker.x < 360 ? randomBetween(430, 560) : randomBetween(220, 310);
  }

  walker.startX = walker.x;
  walker.startBottom = walker.bottom;
  walker.targetX = targetX;
  walker.targetBottom = randomBetween(592, 660);
  walker.startAt = elapsed;
  walker.endAt = elapsed + randomBetween(2100, 3800);
  walker.waitUntil = walker.endAt + randomBetween(700, 1700);
  walker.direction = walker.targetX >= walker.startX ? 1 : -1;
}

function updateWalker(elapsed) {
  if (!walker.initialized) {
    walker.initialized = true;
    walker.x = randomBetween(350, 500);
    walker.bottom = randomBetween(610, 650);
    walker.waitUntil = elapsed + 650;
    return { moving: false };
  }

  if (elapsed < walker.waitUntil && elapsed >= walker.endAt) {
    return { moving: false };
  }

  if (elapsed >= walker.waitUntil) {
    chooseWalkTarget(elapsed);
  }

  const amount = clamp((elapsed - walker.startAt) / (walker.endAt - walker.startAt));
  if (amount >= 1) {
    walker.x = walker.targetX;
    walker.bottom = walker.targetBottom;
    return { moving: false };
  }

  const eased = easeInOut(amount);
  walker.x = lerp(walker.startX, walker.targetX, eased);
  walker.bottom = lerp(walker.startBottom, walker.targetBottom, eased);
  return { moving: true };
}

function drawPetScene(cat, elapsed) {
  const state = updateWalker(elapsed);
  const depth = clamp((walker.bottom - 590) / 90);
  const scale = 0.94 + depth * 0.28;
  const bob = state.moving ? Math.sin(elapsed * 0.02) * 4 : Math.sin(elapsed * 0.006) * 5;
  const rotation = state.moving
    ? walker.direction * 0.018 + Math.sin(elapsed * 0.01) * 0.02
    : Math.sin(elapsed * 0.002) * 0.022;
  const sequence = state.moving
    ? SEQ.enter
    : elapsed % 7600 < 1300
      ? SEQ.greet
      : elapsed % 7600 < 3800
        ? SEQ.thinking
        : SEQ.calm;

  ctx.clearRect(0, 0, SCENE.width, SCENE.height);
  ctx.fillStyle = "rgba(26,26,26,0.18)";
  ctx.beginPath();
  ctx.ellipse(walker.x, walker.bottom + 9, 98 * scale, 22 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  drawPetFrame(
    cat,
    frameAt(sequence, elapsed * (state.moving ? 1.15 : 1)),
    walker.x,
    walker.bottom,
    scale,
    bob,
    rotation,
    walker.direction < 0,
  );
}

async function start() {
  ctx.imageSmoothingEnabled = true;
  document.querySelector(".world-video-bg")?.play?.().catch(() => {});
  const needsEgg = scene === "hatch" || scene === "reveal";
  const needsCat = scene === "reveal" || scene === "pet";
  const [egg, cat] = await Promise.all([
    needsEgg ? loadImage(EGG_SRC) : Promise.resolve(null),
    needsCat ? loadImage(CAT_SRC) : Promise.resolve(null),
  ]);

  let startedAt = 0;
  const render = (now) => {
    if (startedAt === 0) startedAt = now;
    const elapsed = now - startedAt;
    if (scene === "hatch") drawHatchScene(egg, elapsed);
    else if (scene === "reveal") drawRevealScene(egg, cat, elapsed);
    else drawPetScene(cat, elapsed);
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

start();
