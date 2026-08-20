const minutesInput = document.getElementById("minutes") as HTMLInputElement;
const secondsInput = document.getElementById("seconds") as HTMLInputElement;

const display = document.getElementById("display") as HTMLDivElement;
const status = document.getElementById("status") as HTMLParagraphElement;

const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;

let totalSeconds = 300;
let timer: number | null = null;
let running = false;

function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay(): void {
    display.textContent = formatTime(totalSeconds);
}

function getInputTime(): number {
    const minutes = Number(minutesInput.value) || 0;
    const seconds = Number(secondsInput.value) || 0;

    return (minutes * 60) + seconds;
}

function startTimer(): void {
    if (running || totalSeconds <= 0) {
        return;
    }

    running = true;
    status.textContent = "Timer em andamento...";
    status.classList.remove("finished");

    timer = window.setInterval(() => {
        totalSeconds--;

        updateDisplay();

        if (totalSeconds <= 0) {
            finishTimer();
        }
    }, 1000);
}

function pauseTimer(): void {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    running = false;
    status.textContent = "Timer pausado";
}

function resetTimer(): void {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    running = false;
    totalSeconds = getInputTime();

    updateDisplay();

    status.textContent = "Pronto para começar";
    status.classList.remove("finished");
}

function finishTimer(): void {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    running = false;
    totalSeconds = 0;

    updateDisplay();

    status.textContent = "⏰ Tempo finalizado!";
    status.classList.add("finished");

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Timer finalizado!");
    }
}

function updateFromInputs(): void {
    if (!running) {
        totalSeconds = getInputTime();

        if (totalSeconds > 5999) {
            totalSeconds = 5999;
        }

        updateDisplay();
    }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

minutesInput.addEventListener("input", updateFromInputs);
secondsInput.addEventListener("input", updateFromInputs);

if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

updateDisplay();