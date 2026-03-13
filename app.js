// Focus Desk - client-side only
const STORAGE_KEYS = {
  tasks: "focusdesk.tasks",
  notes: "focusdesk.notes",
  timer: "focusdesk.timerSettings"
};

// ----- Tasks -----
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || "[]");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearDoneBtn = document.getElementById("clearDone");

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "task-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.textContent = t.text;
    span.className = "text" + (t.done ? " done" : "");

    const del = document.createElement("button");
    del.textContent = "✕";
    del.className = "delete";
    del.addEventListener("click", () => {
      tasks = tasks.filter(x => x.id !== t.id);
      saveTasks();
      renderTasks();
    });

    li.append(cb, span, del);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${remaining} active / ${tasks.length} total`;
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
});

// ----- Timer -----
const timeDisplay = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const startPause = document.getElementById("startPause");
const resetTimer = document.getElementById("resetTimer");
const focusInput = document.getElementById("focusMins");
const breakInput = document.getElementById("breakMins");
const sessionLabel = document.getElementById("sessionLabel");

let settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.timer) || "{}");
focusInput.value = settings.focus || 25;
breakInput.value = settings.break || 5;

let isRunning = false;
let isFocus = true;
let remainingSeconds = focusInput.value * 60;
let totalSeconds = remainingSeconds;
let timerId = null;

function saveTimerSettings() {
  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify({
    focus: Number(focusInput.value),
    break: Number(breakInput.value)
  }));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  const percent = Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  progressBar.style.width = `${percent}%`;
  sessionLabel.textContent = isFocus ? "Focus session" : "Break session";
}

function switchSession() {
  isFocus = !isFocus;
  remainingSeconds = (isFocus ? focusInput.value : breakInput.value) * 60;
  totalSeconds = remainingSeconds;
  updateDisplay();
}

function tick() {
  remainingSeconds--;
  if (remainingSeconds <= 0) {
    switchSession();
  }
  updateDisplay();
}

startPause.addEventListener("click", () => {
  if (!isRunning) {
    timerId = setInterval(tick, 1000);
    isRunning = true;
    startPause.textContent = "Pause";
  } else {
    clearInterval(timerId);
    isRunning = false;
    startPause.textContent = "Start";
  }
});

resetTimer.addEventListener("click", () => {
  clearInterval(timerId);
  isRunning = false;
  startPause.textContent = "Start";
  remainingSeconds = focusInput.value * 60;
  totalSeconds = remainingSeconds;
  isFocus = true;
  updateDisplay();
});

focusInput.addEventListener("change", () => {
  saveTimerSettings();
  if (!isRunning && isFocus) {
    remainingSeconds = focusInput.value * 60;
    totalSeconds = remainingSeconds;
    updateDisplay();
  }
});

breakInput.addEventListener("change", saveTimerSettings);

// ----- Reflection -----
const reflection = document.getElementById("reflection");
reflection.value = localStorage.getItem(STORAGE_KEYS.notes) || "";

let noteTimer;
reflection.addEventListener("input", () => {
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEYS.notes, reflection.value);
  }, 300);
});

// init
renderTasks();
updateDisplay();
