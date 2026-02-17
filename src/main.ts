import './style.css';
import { AudioEngine } from './core/AudioEngine';
import { PitchDetector } from './core/PitchDetector';
import { GameLoop } from './core/GameLoop';
import { PianoComponent } from './ui/PianoComponent';
import { TunerDisplay } from './ui/TunerDisplay';

// 1. Configurar HTML Básico via JS (ou você pode fazer no index.html)
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Afinator</h1>
  
  <div class="tuner-container">
    <div id="tuner-needle"></div>
  </div>
  <h2 id="status-text">Aguardando início...</h2>
  
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

// 2. Inicializar Componentes
const piano = new PianoComponent('piano-container');
const tuner = new TunerDisplay();
const audio = new AudioEngine();

// Como o browser não tem AudioContext global no window, pegamos do Tone ou criamos um
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
const detector = new PitchDetector(audioCtx);

// 3. Criar a "ponte" entre a lógica do jogo e a UI
// O GameLoop espera um objeto 'uiController' com métodos específicos
const uiAdapter = {
  highlightTarget: (midi: number) => piano.highlightTarget(midi),
  highlightUserNote: (midi: number) => piano.highlightUser(midi),
  updateGauge: (cents: number) => tuner.updateGauge(cents),
  updateProgressBar: (percent: number) => tuner.updateProgress(percent),
  showVictoryMessage: () => tuner.showVictory()
};

const game = new GameLoop(detector, audio, uiAdapter);

// 4. Ligar o botão
const btnStart = document.getElementById('btn-start')!;
btnStart.addEventListener('click', async () => {
  btnStart.innerText = "Carregando...";
  btnStart.setAttribute('disabled', 'true');

  try {
    // Inicia Áudio e Microfone
    await audio.initialize();
    await detector.initialize();

    // Começa o jogo com uma nota fixa para teste (C4 = MIDI 60)
    // Depois você pode fazer: Math.floor(Math.random() * (72 - 48) + 48)
    const randomNote = 60; 
    
    btnStart.style.display = 'none'; // Esconde botão
    game.startGame(randomNote);
    
  } catch (e) {
    console.error(e);
    alert("Erro ao iniciar: " + e);
    btnStart.innerText = "Erro (Tentar Novamente)";
    btnStart.removeAttribute('disabled');
  }
});