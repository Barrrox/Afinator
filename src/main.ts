import './style.css';
import { AudioEngine } from './core/AudioEngine';
import { PitchDetector } from './core/PitchDetector';
import { GameLoop } from './core/GameLoop';
import { PianoComponent } from './ui/PianoComponent';
import { TunerDisplay } from './ui/TunerDisplay';

// HTML Layout
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Afinator MVP</h1>
  
  <div class="tuner-container">
    <div id="tuner-needle"></div>
  </div>
  <h2 id="status-text">Clique em JOGAR</h2>
  
  <div class="progress-container">
    <div id="progress-fill"></div>
  </div>

  <div id="piano-container"></div>

  <div class="controls">
    <button id="btn-start" style="padding: 15px 30px; font-size: 18px; cursor: pointer;">
      JOGAR (Iniciar Microfone)
    </button>
  </div>
`;

// Componentes da UI
const piano = new PianoComponent('piano-container');
const tuner = new TunerDisplay();
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const statusText = document.getElementById('status-text')!;

// Variáveis de Estado (Globais)
let game: GameLoop | null = null;
let audio: AudioEngine | null = null;
let detector: PitchDetector | null = null;
let audioCtx: AudioContext | null = null;
let isInitialized = false; // Flag para saber se já carregamos a IA

// Adaptador da UI (Ponte entre a lógica e a tela)
const uiAdapter = {
  highlightTarget: (midi: number) => piano.highlightTarget(midi),
  highlightUserNote: (midi: number) => piano.highlightUser(midi),
  updateGauge: (cents: number) => tuner.updateGauge(cents),
  updateProgressBar: (percent: number) => tuner.updateProgress(percent),
  
  // Quando vencer: Mostra parabéns e libera o botão de novo
  showVictoryMessage: () => {
    tuner.showVictory();
    btnStart.innerText = "JOGAR NOVAMENTE";
    btnStart.style.display = "block"; // Reexibe o botão
    btnStart.disabled = false;
  }
};

// --- O Cérebro do Botão ---
btnStart.addEventListener('click', async () => {
  btnStart.disabled = true;

  try {
    // 1. PRIMEIRA VEZ: Carrega tudo (Pesado)
    if (!isInitialized) {
      btnStart.innerText = "Inicializando...";
      
      // Cria e acorda o AudioContext
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100,
      });
      await audioCtx.resume();

      // Inicia motores
      audio = new AudioEngine();
      await audio.initialize();

      detector = new PitchDetector(audioCtx);
      await detector.initialize();

      // Cria o jogo
      game = new GameLoop(detector, audio, uiAdapter);
      isInitialized = true;
    }

    // 2. REINÍCIO (Leve): Apenas limpa a tela e começa
    // Limpa visual antigo
    piano.clearHighlights(); 
    tuner.updateGauge(0);      // Zera agulha
    tuner.updateProgress(0);   // Zera barra
    
    // Esconde botão e atualiza status
    btnStart.style.display = 'none';
    statusText.innerText = "Ouça a nota...";
    statusText.style.color = "white"; // Reseta cor do texto (caso esteja azul de vitória)

    // Sorteia nova nota (C3 a C5) e começa
    const randomNote = Math.floor(Math.random() * (72 - 48) + 48);
    game!.startGame(randomNote);

  } catch (e) {
    console.error(e);
    alert("Erro: " + e);
    btnStart.innerText = "Erro - Tentar Novamente";
    btnStart.disabled = false;
    isInitialized = false; // Força tentar inicializar de novo se der erro
  }
});