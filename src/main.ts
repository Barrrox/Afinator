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

// Inicializa UI (Componentes visuais podem ser iniciados antes)
const piano = new PianoComponent('piano-container');
const tuner = new TunerDisplay();

// Adaptador da UI
const uiAdapter = {
  highlightTarget: (midi: number) => piano.highlightTarget(midi),
  highlightUserNote: (midi: number) => piano.highlightUser(midi),
  updateGauge: (cents: number) => tuner.updateGauge(cents),
  updateProgressBar: (percent: number) => tuner.updateProgress(percent),
  showVictoryMessage: () => tuner.showVictory()
};

// Variáveis de controle
let game: GameLoop | null = null;
let audio: AudioEngine | null = null;
let detector: PitchDetector | null = null;

const btnStart = document.getElementById('btn-start') as HTMLButtonElement;

btnStart.addEventListener('click', async () => {
  btnStart.innerText = "Inicializando...";
  btnStart.disabled = true;

  try {
    // 1. CRUCIAL: Criar o AudioContext AQUI, no momento do clique.
    // Isso garante que o navegador entenda que foi intenção do usuário.
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    latencyHint: 'interactive', // PRIORIDADE MÁXIMA PARA VELOCIDADE
    sampleRate: 44100, // Força padrão para evitar conversão pesada
    });
    
    // Força o resume imediatamente
    await audioCtx.resume();

    // 2. Inicia os motores
    audio = new AudioEngine();
    await audio.initialize(); // Inicia Tone.js

    detector = new PitchDetector(audioCtx);
    await detector.initialize(); // Inicia ML5

    // 3. Inicia o Jogo
    game = new GameLoop(detector, audio, uiAdapter);
    
    // Esconde botão e começa
    btnStart.style.display = 'none';
    document.getElementById('status-text')!.innerText = "Ouça a nota...";
    
    // Nota inicial aleatória entre C3 (48) e C5 (72)
    const randomNote = Math.floor(Math.random() * (72 - 48) + 48);
    game.startGame(randomNote);

  } catch (e) {
    console.error(e);
    alert("Erro: " + e);
    btnStart.innerText = "Erro - Tentar Novamente";
    btnStart.disabled = false;
  }
});