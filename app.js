// ── State ──
const state = {
  beforeStress: 5,
  afterStress: null,
  lastActivity: null,
  sessions: 0,
  streak: 0,
  lastSessionDate: null,
  activeTimerIndex: null,
  timerIntervals: {}, // Track all timer intervals
};

// ── Activity Lists ──
const lowStressActivities = [
  { icon: "🎵", name: "Listen to relaxing music", duration: 2 },
  { icon: "✏️", name: "Draw a simple object", duration: 2 },
  { icon: "💧", name: "Drink water", duration: 1 },
  { icon: "🌳", name: "Look outside", duration: 2 },
  { icon: "🙆", name: "Shoulder stretch", duration: 2 },
];

const mediumStressActivities = [
  { icon: "🎧", name: "Listen to calm music", duration: 3 },
  { icon: "📖", name: "Read a few pages", duration: 2 },
  { icon: "🌬️", name: "Deep breathing", duration: 3 },
  { icon: "🚿", name: "Splash cold water on face", duration: 1 },
  { icon: "🧘", name: "Simple meditation", duration: 2 },
];

const highStressActivities = [
  { icon: "🫁", name: "Deep breathing", duration: 2 },
  { icon: "🚶", name: "Short walk", duration: 3 },
  { icon: "📝", name: "Write your worries", duration: 3 },
  { icon: "💪", name: "Muscle relaxation", duration: 3 },
  { icon: "🧘", name: "Mindfulness exercise", duration: 3 },
];

function pickActivities(stressLevel) {
  let pool;
  if (stressLevel <= 3) {
    pool = lowStressActivities;
  } else if (stressLevel <= 7) {
    pool = mediumStressActivities;
  } else {
    pool = highStressActivities;
  }
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function renderActivities(activities) {
  const container = document.getElementById('activities-container');
  container.innerHTML = activities.map((act, i) => {
    const id = 'act-' + i;
    return `
      <div class="activity-item" id="${id}" onclick="toggleActivity('${id}', ${i}, ${act.duration * 60})">
        <div class="act-icon">${act.icon}</div>
        <div class="act-info">
          <span class="act-name">${act.name}</span>
          <span class="act-duration">${act.duration} min</span>
        </div>
        <div class="act-timer" id="timer-${i}">
          <span class="timer-display">${act.duration}:00</span>
        </div>
        <div class="act-check">✓</div>
      </div>`;
  }).join('');
}

function toggleActivity(id, index, totalSeconds) {
  const actItem = document.getElementById(id);

  // If clicking an active/done item, toggle it off
  if (actItem.classList.contains('done')) {
    actItem.classList.remove('done');
    // Clear the timer
    if (state.timerIntervals[index]) {
      clearInterval(state.timerIntervals[index]);
      delete state.timerIntervals[index];
    }
    // Reset timer display
    const mins = Math.floor(totalSeconds / 60);
    document.querySelector(`#timer-${index} .timer-display`).textContent = `${mins}:00`;
    document.getElementById(`timer-${index}`).style.color = '#f47c3c';
    state.activeTimerIndex = null;
    return;
  }

  // Start this task's timer (no need to check if another is running)
  state.activeTimerIndex = index;
  startTimer(index, totalSeconds);
  actItem.classList.add('done');
}

function startTimer(index, totalSeconds) {
  // Clear any existing timer for this index
  if (state.timerIntervals[index]) {
    clearInterval(state.timerIntervals[index]);
  }

  let remaining = totalSeconds;
  const timerDisplay = document.querySelector(`#timer-${index} .timer-display`);

  if (!timerDisplay) return;

  const interval = setInterval(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (remaining <= 0) {
      clearInterval(interval);
      delete state.timerIntervals[index];
      timerDisplay.textContent = 'Completed ✓';
      document.getElementById(`timer-${index}`).style.color = '#2ab3a3';
      state.activeTimerIndex = null;
    }

    remaining--;
  }, 1000);

  state.timerIntervals[index] = interval;
}

function triggerExplosion() {
  const corners = [
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 },      // Top-left
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.1 },      // Top-right
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.9 },      // Bottom-left
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.9 },      // Bottom-right
  ];

  corners.forEach((corner, i) => {
    setTimeout(() => {
      createExplosionAt(corner.x, corner.y);
    }, i * 200); // Stagger explosions
  });
}

function createExplosionAt(centerX, centerY) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;`;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const emojis = ['🌸', '✨', '🎉', '💚', '🌿', '⭐', '🫧', '🎊'];

  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 12;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 30 + Math.random() * 40,
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.12 + Math.random() * 0.2,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.97;
      p.alpha -= 0.012;
      p.rotation += p.rotSpeed;
      if (p.alpha <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.font = p.size + 'px Arial';
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
      cancelAnimationFrame(frame);
    }
  }
  animate();
}

// ── Screen Navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'screen-progress') {
    renderProgress();
    triggerExplosion();
  }
}

// ── Home Screen ──
function updateStressFeedback(value) {
  const feedback = document.getElementById('stress-feedback');
  value = parseInt(value);
  if (isNaN(value)) return;
  if (value <= 3) {
    feedback.textContent = "You're doing great, low stress today 😊";
  } else if (value <= 7) {
    feedback.textContent = "Moderate stress — let's work through it 🌿";
  } else {
    feedback.textContent = "High stress detected — we've got you 🧘";
  }
}

function adjustStress(delta) {
  const input = document.getElementById('home-stress-input');
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
  updateStressFeedback(val);
}

function startRoutine() {
  const val = parseInt(document.getElementById('home-stress-input').value);
  if (isNaN(val) || val < 1 || val > 10) {
    alert('Please enter a stress level between 1 and 10.');
    return;
  }
  state.beforeStress = val;

  // Update subtitle based on stress tier
  const subtitle = document.getElementById('routine-subtitle');
  if (val <= 3) {
    subtitle.textContent = "Low stress — light activities for you 😊";
  } else if (val <= 7) {
    subtitle.textContent = "Moderate stress — balanced routine 🌿";
  } else {
    subtitle.textContent = "High stress — calming exercises ahead 🧘";
  }

  const activities = pickActivities(val);
  renderActivities(activities);
  showScreen('screen-routine');
}

// ── Routine Screen ──
function toggleActivity(id, index, totalSeconds) {
  const actItem = document.getElementById(id);

  // If clicking an active/done item, toggle it off
  if (actItem.classList.contains('done')) {
    actItem.classList.remove('done');
    // Clear the timer
    if (state.timerIntervals[index]) {
      clearInterval(state.timerIntervals[index]);
      delete state.timerIntervals[index];
    }
    // Reset timer display
    const mins = Math.floor(totalSeconds / 60);
    document.querySelector(`#timer-${index} .timer-display`).textContent = `${mins}:00`;
    document.getElementById(`timer-${index}`).style.color = '#f47c3c';
    state.activeTimerIndex = null;
    return;
  }

  // Start this task's timer (no need to check if another is running)
  state.activeTimerIndex = index;
  startTimer(index, totalSeconds);
  actItem.classList.add('done');
}

function completeRoutine() {
  // Check if all activities are done
  const activities = document.querySelectorAll('#activities-container .activity-item');
  const allDone = [...activities].every(a => a.classList.contains('done'));

  if (!allDone) {
    document.getElementById('routine-warning').style.display = 'block';
    return;
  }
  document.getElementById('routine-warning').style.display = 'none';

  // Reset mood slider to middle
  const slider = document.getElementById('mood-slider');
  slider.value = 5;
  updateMood(5);
  showScreen('screen-mood');
}
// ── Mood Screen ──
const moodMap = [
  { max: 2, emoji: '😌', label: 'Very Low' },
  { max: 4, emoji: '🙂', label: 'Low' },
  { max: 6, emoji: '😐', label: 'Moderate' },
  { max: 8, emoji: '😟', label: 'High' },
  { max: 10, emoji: '😰', label: 'Very High' },
];

function updateMood(val) {
  val = parseInt(val);
  document.getElementById('mood-number').textContent = val;

  const mood = moodMap.find(m => val <= m.max) || moodMap[moodMap.length - 1];
  document.getElementById('mood-emoji').textContent = mood.emoji;
  document.getElementById('mood-label').textContent = mood.label;

  // Update slider gradient
  const slider = document.getElementById('mood-slider');
  const pct = ((val - 1) / 9) * 100;
  slider.style.background = `linear-gradient(to right, var(--teal) ${pct}%, #e5e7eb ${pct}%)`;
}

function submitMood() {
  const val = parseInt(document.getElementById('mood-slider').value);
  state.afterStress = val;
  state.sessions += 1;

  const today = new Date().toDateString();
  if (state.lastSessionDate === today) {
    // same day, no streak change
  } else if (state.lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.lastSessionDate = today;
  state.lastActivity = new Date();

  showScreen('screen-progress');
}

// ── Progress Screen ──
function renderProgress() {
  const before = state.beforeStress;
  const after = state.afterStress;
  const hasData = after !== null;

  // Stat cards
  const change = hasData ? after - before : null;
  document.getElementById('stat-change').textContent = hasData
    ? (change > 0 ? '+' : '') + change
    : '–';

  document.getElementById('stat-date').textContent = state.lastActivity
    ? state.lastActivity.toLocaleDateString()
    : '–';

  // Level circles
  document.getElementById('prog-before').textContent = before;
  document.getElementById('prog-after').textContent = hasData ? after : '–';

  // Result banner
  const banner = document.getElementById('result-banner');
  const emoji = document.getElementById('result-emoji');
  const text = document.getElementById('result-text');

  if (hasData) {
    if (change < 0) {
      emoji.textContent = '🎉';
      text.textContent = `You are improving! Your stress level decreased by ${Math.abs(change)} point${Math.abs(change) !== 1 ? 's' : ''}.`;
    } else if (change === 0) {
      emoji.textContent = '😐';
      text.textContent = 'Your stress level stayed the same. Keep it up!';
    } else {
      emoji.textContent = '😊';
      text.textContent = `Stress increased by ${change} point${change !== 1 ? 's' : ''}. Consider taking a short break, practicing mindfulness, or getting some rest.`;
    }
  } else {
    emoji.textContent = '📊';
    text.textContent = 'Complete a session to see your progress!';
  }

  document.getElementById('stat-sessions').textContent = state.sessions;
  document.getElementById('stat-streak').textContent = state.streak;

  // Draw chart
  drawChart(before, hasData ? after : null);
}

function drawChart(before, after) {
  const canvas = document.getElementById('stress-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  const pad = { top: 16, bottom: 36, left: 36, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  [0, 3, 6, 10].forEach(v => {
    const y = pad.top + chartH - (v / 10) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v, pad.left - 4, y + 4);
  });

  // X labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Before', pad.left, H - 6);
  ctx.textAlign = 'right';
  ctx.fillText('After', W - pad.right, H - 6);

  if (after === null) return;

  // Line
  const x1 = pad.left;
  const x2 = pad.left + chartW;
  const y1 = pad.top + chartH - (before / 10) * chartH;
  const y2 = pad.top + chartH - (after / 10) * chartH;

  const grad = ctx.createLinearGradient(x1, 0, x2, 0);
  grad.addColorStop(0, '#f47c3c');
  grad.addColorStop(1, '#2ab3a3');

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dots
  [[x1, y1, '#f47c3c'], [x2, y2, '#2ab3a3']].forEach(([x, y, color]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// ── Init ──
updateMood(7);
updateStressFeedback(5);
