import './style.css';
import { AudioEngine } from './core/AudioEngine';
import { PitchDetector } from './core/PitchDetector';
import { GameLoop } from './core/GameLoop';
import { PianoComponent } from './ui/PianoComponent';
import { TunerDisplay } from './ui/TunerDisplay';
import { MusicMath } from './utils/MusicMath'; // Importei para converter MIDI em Freq

// HTML Layout
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Afinator</h1>
  
  <div class="tuner-container">
    <div id="tuner-needle"></div>
  </div>
  <h2 id="status-text">Clique em JOGAR</h2>
  
  <div class="progress-container">
    <div id="progress-fill"></div>
  </div>

  <div id="piano-container"></div>

  <div class="controls">
    <button id="btn-replay" title="Ouvir a nota novamente">
      🔊 Ouvir Nota
    </button>

    <button id="btn-start" style="padding: 15px 30px; font-size: 18px; cursor: pointer;">
      JOGAR (Iniciar Microfone)
    </button>
  </div>
`;

// Componentes da UI
const piano = new PianoComponent('piano-container');
const tuner = new TunerDisplay();
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnReplay = document.getElementById('btn-replay') as HTMLButtonElement; // Referência nova
const statusText = document.getElementById('status-text')!;

// Variáveis de Estado
let game: GameLoop | null = null;
let audio: AudioEngine | null = null;
let detector: PitchDetector | null = null;
let audioCtx: AudioContext | null = null;
let isInitialized = false;

// Variável para lembrar qual é a nota atual
let currentTargetMidi: number | null = null;

// Adaptador da UI
const uiAdapter = {
  highlightTarget: (midi: number) => piano.highlightTarget(midi),
  highlightUserNote: (midi: number) => piano.highlightUser(midi),
  updateGauge: (cents: number) => tuner.updateGauge(cents),
  updateProgressBar: (percent: number) => tuner.updateProgress(percent),
  
  showVictoryMessage: () => {
    tuner.showVictory();
    
    // Configura botões para o fim de jogo
    btnStart.innerText = "JOGAR NOVAMENTE";
    btnStart.style.display = ""; 
    btnStart.disabled = false;
    
    // Esconde o botão de ouvir, pois o jogo acabou
    btnReplay.style.display = "none";
  }
};

// --- Botão REPLAY (Ouvir Novamente) ---
btnReplay.addEventListener('click', () => {
  if (audio && currentTargetMidi) {
    // Converte a nota MIDI salva de volta para Hz e toca
    const freq = MusicMath.midiToFreq(currentTargetMidi);
    audio.playNote(freq, '2n'); // '2n' toca por mais tempo (meia nota)
  }
});

// --- Botão START ---
btnStart.addEventListener('click', async () => {
  btnStart.disabled = true;

  try {
    if (!isInitialized) {
      btnStart.innerText = "Inicializando...";
      
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100,
      });
      await audioCtx.resume();

      audio = new AudioEngine();
      await audio.initialize();

      detector = new PitchDetector(audioCtx);
      await detector.initialize();

      game = new GameLoop(detector, audio, uiAdapter);
      isInitialized = true;
    }

    // Reset Visual
    piano.clearHighlights(); 
    tuner.updateGauge(0);
    tuner.updateProgress(0);
    
    // Esconde Start, Mostra Replay
    btnStart.style.display = 'none';
    btnReplay.style.display = "block"; // Aparece o botão de ouvir!
    
    statusText.innerText = "Ouça a nota e cante!";
    statusText.style.color = "white";

    // Sorteia e SALVA a nota
    currentTargetMidi = Math.floor(Math.random() * (72 - 48) + 48);
    game!.startGame(currentTargetMidi);

  } catch (e) {
    console.error(e);
    alert("Erro: " + e);
    btnStart.innerText = "Erro - Tentar Novamente";
    btnStart.disabled = false;
    isInitialized = false;
  }
});