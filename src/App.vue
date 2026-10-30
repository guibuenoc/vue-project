<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';

const presets = [5, 15, 25, 45];
const minutes = ref(25);
const seconds = ref(0);
const remainingSeconds = ref(25 * 60);
const running = ref(false);
const finished = ref(false);
const status = ref('Tudo pronto para começar');
let intervalId: number | undefined;

const totalSeconds = computed(() => minutes.value * 60 + seconds.value);
const display = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60);
  const secs = remainingSeconds.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});
const progress = computed(() => {
  if (totalSeconds.value === 0) return 0;
  return Math.max(0, Math.min(1, remainingSeconds.value / totalSeconds.value));
});
const circumference = 2 * Math.PI * 88;
const progressOffset = computed(() => circumference * (1 - progress.value));

function stopInterval(): void {
  if (intervalId !== undefined) window.clearInterval(intervalId);
  intervalId = undefined;
}

function updateFromInputs(): void {
  if (running.value) return;

  minutes.value = Math.min(99, Math.max(0, Number(minutes.value) || 0));
  seconds.value = Math.min(59, Math.max(0, Number(seconds.value) || 0));
  remainingSeconds.value = totalSeconds.value;
  finished.value = false;
  status.value = 'Tudo pronto para começar';
}

function setPreset(value: number): void {
  if (running.value) return;

  minutes.value = value;
  seconds.value = 0;
  remainingSeconds.value = value * 60;
  finished.value = false;
  status.value = 'Tudo pronto para começar';
}

function finishTimer(): void {
  stopInterval();
  running.value = false;
  finished.value = true;
  remainingSeconds.value = 0;
  status.value = 'Sessão concluída. Bom trabalho!';

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Sessão concluída. Bom trabalho!');
  }
}

function startTimer(): void {
  if (running.value || remainingSeconds.value <= 0) return;

  running.value = true;
  finished.value = false;
  status.value = 'Você está no caminho. Continue assim.';
  intervalId = window.setInterval(() => {
    remainingSeconds.value -= 1;
    if (remainingSeconds.value <= 0) finishTimer();
  }, 1000);
}

function pauseTimer(): void {
  stopInterval();
  running.value = false;
  status.value = 'Pausa feita. Retome quando quiser.';
}

function resetTimer(): void {
  stopInterval();
  running.value = false;
  finished.value = false;
  remainingSeconds.value = totalSeconds.value;
  status.value = 'Tudo pronto para começar';
}

onUnmounted(stopInterval);
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Minuto, página inicial">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
            <path d="M12 7v5l3.5 2" />
            <path d="M16.5 3.5h4v4" />
          </svg>
        </span>
        <span>minuto<span class="brand-period">.</span></span>
      </a>
      <span class="topbar-note"><span class="online-dot"></span> um tempo só seu</span>
    </header>

    <section class="timer-layout" aria-labelledby="page-title">
      <div class="intro">
        <span class="eyebrow">SEU ESPAÇO DE FOCO</span>
        <h1 id="page-title">Um passo de cada vez<span>.</span></h1>
        <p>Respire fundo, escolha seu tempo e deixe o resto para depois.</p>
      </div>

      <section class="timer-card" aria-label="Temporizador de foco">
        <div class="card-topline">
          <span class="session-label">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2.5 12 7l4.8.5-3.6 3.2 1 4.8-4.2-2.5-4.2 2.5 1-4.8-3.6-3.2L8 7l2-4.5Z" />
            </svg>
            SESSÃO DE FOCO
          </span>
          <span class="session-count">01 <span>/ 01</span></span>
        </div>

        <div class="timer-visual" :class="{ 'is-finished': finished }">
          <svg class="progress-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle class="ring-track" cx="100" cy="100" r="88" />
            <circle
              class="ring-progress"
              cx="100"
              cy="100"
              r="88"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
          <div class="timer-readout">
            <span class="timer-caption">{{ running ? 'TEMPO RESTANTE' : finished ? 'CONCLUÍDO' : 'PRONTO PARA' }}</span>
            <output class="timer-display" aria-live="polite">{{ display }}</output>
            <span class="timer-unit">{{ running ? 'minutos de foco' : finished ? 'mandou bem!' : 'começar' }}</span>
          </div>
        </div>

        <p class="timer-status" :class="{ 'status-finished': finished }" aria-live="polite">
          <span class="status-sparkle" aria-hidden="true">✦</span>
          {{ status }}
        </p>

        <div class="divider"></div>

        <div class="duration-heading">
          <span>Escolha a duração</span>
          <span class="duration-hint">MIN : SEG</span>
        </div>

        <div class="duration-controls">
          <div class="time-fields">
            <label class="time-field" for="minutes">
              <input
                id="minutes"
                v-model.number="minutes"
                type="number"
                min="0"
                max="99"
                inputmode="numeric"
                :disabled="running"
                aria-label="Minutos"
                @input="updateFromInputs"
              />
              <span>min</span>
            </label>
            <span class="time-separator">:</span>
            <label class="time-field" for="seconds">
              <input
                id="seconds"
                v-model.number="seconds"
                type="number"
                min="0"
                max="59"
                inputmode="numeric"
                :disabled="running"
                aria-label="Segundos"
                @input="updateFromInputs"
              />
              <span>seg</span>
            </label>
          </div>

          <div class="presets" aria-label="Durações rápidas">
            <button
              v-for="preset in presets"
              :key="preset"
              class="preset-button"
              :class="{ 'is-selected': minutes === preset && seconds === 0 }"
              type="button"
              :disabled="running"
              :aria-pressed="minutes === preset && seconds === 0"
              @click="setPreset(preset)"
            >
              {{ preset }}<span>m</span>
            </button>
          </div>
        </div>

        <div class="timer-actions">
          <button class="primary-button" type="button" :disabled="running || remainingSeconds <= 0" @click="startTimer">
            <svg v-if="!running" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m7 4.5 8 5.5-8 5.5v-11Z" />
            </svg>
            <span v-else class="button-spinner" aria-hidden="true"></span>
            {{ running ? 'Em andamento' : 'Começar a focar' }}
          </button>
          <button
            class="icon-button"
            type="button"
            :disabled="!running"
            aria-label="Pausar temporizador"
            title="Pausar"
            @click="pauseTimer"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7.5 5.5v9M12.5 5.5v9" />
            </svg>
          </button>
          <button
            class="icon-button"
            type="button"
            aria-label="Reiniciar temporizador"
            title="Reiniciar"
            @click="resetTimer"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4.5 9a5.5 5.5 0 1 1 .8 4.7M4.5 4.5V9h4.5" />
            </svg>
          </button>
        </div>

        <p class="card-footer">Seu foco merece esse momento <span aria-hidden="true">♡</span></p>
      </section>

      <p class="page-footer">feito para desacelerar e fazer acontecer</p>
    </section>
  </main>
</template>
