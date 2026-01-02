window.addEventListener("DOMContentLoaded", () => {
    let focusTime = (parseInt(localStorage.getItem("pomo-focus")) || 25) * 60;
    let breakTime = (parseInt(localStorage.getItem("pomo-break")) || 5) * 60;
    let timeLeft = focusTime;
    let timerId = null;
    let onBreak = false;

    lucide.createIcons();

    function applyMode(mode) {
        const isDarkSystem = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
        
        if (mode === "auto") {
            document.body.classList.toggle("dark-mode", isDarkSystem);
        } else {
            document.body.classList.toggle("dark-mode", mode === "dark");
        }
        localStorage.setItem("pomo-mode", mode);
    }

    function updateAccent(hex) {
        document.documentElement.style.setProperty('--accent', hex);
        localStorage.setItem("pomo-accent", hex);
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (localStorage.getItem("pomo-mode") === "auto") applyMode("auto");
    });

    const modal = document.getElementById("theme-modal");
    document.getElementById("open-theme-modal").onclick = () => modal.style.display = "flex";
    document.getElementById("close-modal").onclick = () => modal.style.display = "none";
    
    document.querySelectorAll(".mode-btn").forEach(btn => btn.onclick = () => applyMode(btn.dataset.mode));
    document.querySelectorAll(".color-dot").forEach(dot => dot.onclick = () => updateAccent(dot.dataset.color));
    document.getElementById("custom-color-btn").onclick = () => document.getElementById("hidden-picker").click();
    document.getElementById("hidden-picker").oninput = (e) => updateAccent(e.target.value);

    function updateDisplay() {
        const m = Math.floor(timeLeft / 60), s = String(timeLeft % 60).padStart(2, "0");
        document.getElementById("timer").textContent = `${m}:${s}`;
    }

    function startTimer() {
        if (timerId) return;
        timerId = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerId); timerId = null;
                document.getElementById("alarm-sound").play();
                onBreak = !onBreak;
                timeLeft = onBreak ? breakTime : focusTime;
                updateDisplay();
                startTimer();
                return;
            }
            timeLeft--; updateDisplay();
        }, 1000);
    }

    document.getElementById("start").onclick = startTimer;
    document.getElementById("pause").onclick = () => { clearInterval(timerId); timerId = null; };
    document.getElementById("reset").onclick = () => { clearInterval(timerId); timerId = null; timeLeft = focusTime; onBreak = false; updateDisplay(); };

    document.getElementById("apply-settings").onclick = () => {
        focusTime = (document.getElementById("focus-time").value || 25) * 60;
        breakTime = (document.getElementById("break-time").value || 5) * 60;
        localStorage.setItem("pomo-focus", focusTime / 60);
        localStorage.setItem("pomo-break", breakTime / 60);
        document.getElementById("reset").click();
    };

    function renderTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        document.getElementById("task-list").innerHTML = tasks.map((t, i) => `
            <li class="glass-card" style="padding:12px; margin-top:10px; border-radius:20px; display:flex; justify-content:space-between; align-items:center">
                <span style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">${t.text}</span>
                <button onclick="deleteTask(${i})" style="background:none; border:none; color:var(--accent); cursor:pointer">✕</button>
            </li>`).join('');
    }

    document.getElementById("add-task").onclick = () => {
        const txt = document.getElementById("new-task").value.trim();
        if (!txt) return;
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.push({ text: txt, done: false });
        localStorage.setItem("tasks", JSON.stringify(tasks));
        document.getElementById("new-task").value = "";
        renderTasks();
    };

    window.deleteTask = (i) => {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.splice(i, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    };

    const now = new Date();
    document.getElementById("greeting-text").textContent = now.getHours() < 12 ? "Bom dia! :)" : now.getHours() < 18 ? "Boa tarde! :)" : "Boa noite! :)";
    document.getElementById("current-date").textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' });
    
    applyMode(localStorage.getItem("pomo-mode") || "auto");
    updateAccent(localStorage.getItem("pomo-accent") || "#14b8a6");
    updateDisplay();
    renderTasks();
});
