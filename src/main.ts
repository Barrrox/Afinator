import './style.css';
import { AudioEngine } from './core/AudioEngine';
import { PitchDetector } from './core/PitchDetector';
import { GameLoop } from './core/GameLoop';
import { PianoComponent } from './ui/PianoComponent';
import { TunerDisplay } from './ui/TunerDisplay';
import { DIFFICULTY_MODES, DEFAULT_MODE } from './constants';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="screen-menu" class="screen active menu-container">
    <h1 class="menu-title">Afinator</h1>
    <button id="btn-start-game" class="main-btn">JOGAR</button>
    <button id="btn-open-difficulty" class="sec-btn">Dificuldade</button>
  </div>

  <div id="screen-game" class="screen">
    <div class="tuner-container"><div id="tuner-needle"></div></div>
    <h2 id="status-text">...</h2>
    <div class="progress-container"><div id="progress-fill"></div></div>
    <div id="piano-container"></div>
    <div class="controls">
      <button id="btn-replay">🔊 Ouvir</button>
      <button id="btn-back-menu">Sair do Jogo</button>
    </div>
  </div>

  <div id="modal-difficulty" class="modal-overlay">
    <div class="modal-content">
      <h3>Qual seu nível de percepção?</h3>
      <div id="difficulty-list"></div>
      <button id="btn-close-modal" style="margin-top:15px">Fechar</button>
    </div>
  </div>
`;

// -- ESTADO GLOBAL --
let currentMode = localStorage.getItem('afinator_diff') || DEFAULT_MODE;
let audioCtx: AudioContext | null = null;
let detector: PitchDetector | null = null;
let audio: AudioEngine | null = null;

const piano = new PianoComponent('piano-container');
const tuner = new TunerDisplay();

// -- LÓGICA DE TELAS --
function switchScreen(screenId: 'menu' | 'game') {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${screenId}`)?.classList.add('active');
}

// -- MODAL E DIFICULDADE --
function renderDifficultyOptions() {
  const list = document.getElementById('difficulty-list')!;
  list.innerHTML = Object.entries(DIFFICULTY_MODES).map(([key, cfg]) => `
    <div class="difficulty-option ${currentMode === key ? 'selected' : ''}" data-key="${key}">
      <span>${cfg.label}</span>
      <div class="help-icon" title="${cfg.description}">?</div>
    </div>
  `).join('');

  document.querySelectorAll('.difficulty-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      currentMode = target.dataset.key!;
      localStorage.setItem('afinator_diff', currentMode);
      renderDifficultyOptions(); // Atualiza visual
    });
  });
}

// -- BOTÕES --
document.getElementById('btn-open-difficulty')?.addEventListener('click', () => {
  renderDifficultyOptions();
  document.getElementById('modal-difficulty')?.classList.add('active');
});

document.getElementById('btn-close-modal')?.addEventListener('click', () => {
  document.getElementById('modal-difficulty')?.classList.remove('active');
});

document.getElementById('btn-back-menu')?.addEventListener('click', () => location.reload()); // Simplificado para o MVP

document.getElementById('btn-start-game')?.addEventListener('click', async () => {
  switchScreen('game');
  
  if (!audioCtx) {
    audioCtx = new AudioContext({ latencyHint: 'interactive' });
    audio = new AudioEngine();
    detector = new PitchDetector(audioCtx);
    await audio.initialize();
    await detector.initialize();
  }

  const cfg = DIFFICULTY_MODES[currentMode];
  const game = new GameLoop(detector!, audio!, {
    highlightTarget: (m:any) => piano.highlightTarget(m),
    highlightUserNote: (m:any) => piano.highlightUser(m),
    updateGauge: (c:any) => tuner.updateGauge(c),
    updateProgressBar: (p:any) => tuner.updateProgress(p),
    showVictoryMessage: () => {
      tuner.showVictory();
      setTimeout(() => switchScreen('menu'), 2000); // Volta ao menu após 2s de vitória
    }
  }, { tolerance: cfg.tolerance, duration: cfg.duration });

  game.startGame(Math.floor(Math.random() * 24 + 48));
});