window.addEventListener("DOMContentLoaded", () => {
    // ===== Permissão para notificações =====
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // ===== Pomodoro com ciclos configuráveis =====
    let focusTime = 25 * 60; // default 25 min
    let breakTime = 5 * 60;  // default 5 min
    let timeLeft = focusTime;
    let timerId = null;
    let onBreak = false;
    let cycles = 0;

    const timerDisplay = document.getElementById("timer");
    const startBtn = document.getElementById("start");
    const pauseBtn = document.getElementById("pause");
    const resetBtn = document.getElementById("reset");
    const alarmSound = document.getElementById("alarm-sound");

    const focusInput = document.getElementById("focus-time");
    const breakInput = document.getElementById("break-time");
    const applyBtn = document.getElementById("apply-settings");

    function updateTimer() {
        const min = Math.floor(timeLeft / 60);
        const sec = String(timeLeft % 60).padStart(2, "0");
        timerDisplay.textContent = `${min}:${sec}`;
    }

    function showNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }
    }

    function startTimer() {
        if (!timerId) {
            timerId = setInterval(() => {
                timeLeft--;
                updateTimer();

                if (timeLeft <= 0) {
                    alarmSound.play();
                    clearInterval(timerId);
                    timerId = null;

                    if (!onBreak) {
                        onBreak = true;
                        timeLeft = breakTime;
                        updateTimer();
                        showNotification("⏸️ Pausa iniciada!", `Hora de descansar ${breakTime / 60} min`);
                        startTimer(); // inicia pausa automaticamente
                    } else {
                        onBreak = false;
                        timeLeft = focusTime;
                        cycles++;
                        updateTimer();
                        showNotification("✅ Ciclo concluído!", `Você completou ${cycles} ciclo(s)`);
                        startTimer(); // inicia novo foco automaticamente
                    }
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        clearInterval(timerId);
        timerId = null;
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = focusTime;
        onBreak = false;
        cycles = 0;
        updateTimer();
    }

    startBtn.type = "button";
    pauseBtn.type = "button";
    resetBtn.type = "button";
    applyBtn.type = "button";

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    // Aplicar novos tempos
    applyBtn.addEventListener("click", () => {
        const newFocus = parseInt(focusInput.value);
        const newBreak = parseInt(breakInput.value);

        if (!isNaN(newFocus) && newFocus > 0) focusTime = newFocus * 60;
        if (!isNaN(newBreak) && newBreak > 0) breakTime = newBreak * 60;

        resetTimer();
    });

    updateTimer();

    // ===== To-Do List =====
    const taskInput = document.getElementById("new-task");
    const addTaskBtn = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = task.done ? "done" : "";
            if (document.body.classList.contains("dark")) li.classList.add("dark");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.done;
            checkbox.addEventListener("change", () => toggleTask(index));
            li.appendChild(checkbox);

            const span = document.createElement("span");
            span.textContent = task.text;
            span.style.marginLeft = "8px";
            li.appendChild(span);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.addEventListener("click", () => deleteTask(index));
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    }

    function saveTasks(tasks) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadTasks();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === "") return;
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.push({ text, done: false });
        saveTasks(tasks);
        taskInput.value = "";
    }

    function toggleTask(index) {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks[index].done = !tasks[index].done;
        saveTasks(tasks);
    }

    function deleteTask(index) {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.splice(index, 1);
        saveTasks(tasks);
    }

    addTaskBtn.addEventListener("click", addTask);
    loadTasks();

    // ===== Tema Claro/Escuro =====
    const toggleThemeBtn = document.getElementById("toggle-theme");
    toggleThemeBtn.type = "button";
    toggleThemeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        loadTasks(); // reaplica dark nos items
    });
});
